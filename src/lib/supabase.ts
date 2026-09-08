/**
 * Production-ready typed Supabase client with:
 * - Singleton pattern
 * - Connection timeout enforcement (10,000ms)
 * - Custom exponential backoff retry strategy (max 3 retries)
 * - Structured query & error logging with pretty formatting
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database';
import { validateEnv } from './env';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  category: 'query' | 'auth' | 'connection' | 'realtime' | 'storage' | 'system';
  message: string;
  details?: unknown;
  durationMs?: number;
}

// In-memory log buffer for UI diagnostics and console logging
type LogListener = (entry: LogEntry) => void;
const logListeners: Set<LogListener> = new Set();
const logHistory: LogEntry[] = [];
const MAX_LOG_HISTORY = 100;

export function addLogListener(listener: LogListener): () => void {
  logListeners.add(listener);
  return () => logListeners.delete(listener);
}

export function getLogHistory(): LogEntry[] {
  return [...logHistory];
}

export function clearLogHistory(): void {
  logHistory.length = 0;
}

export function logEvent(
  level: LogEntry['level'],
  category: LogEntry['category'],
  message: string,
  details?: unknown,
  durationMs?: number
): void {
  const entry: LogEntry = {
    id: Math.random().toString(36).substring(2, 9),
    timestamp: new Date().toLocaleTimeString(),
    level,
    category,
    message,
    details,
    durationMs
  };

  logHistory.unshift(entry);
  if (logHistory.length > MAX_LOG_HISTORY) {
    logHistory.pop();
  }

  // Pretty console output
  const prefix = `[Supabase ${category.toUpperCase()}]`;
  const timeInfo = durationMs !== undefined ? ` (${durationMs}ms)` : '';
  if (level === 'error') {
    console.error(`%c${prefix} ❌ ${message}${timeInfo}`, 'color: #ef4444; font-weight: bold;', details ?? '');
  } else if (level === 'warn') {
    console.warn(`%c${prefix} ⚠️ ${message}${timeInfo}`, 'color: #f59e0b; font-weight: bold;', details ?? '');
  } else if (level === 'success') {
    console.log(`%c${prefix} ✅ ${message}${timeInfo}`, 'color: #10b981; font-weight: bold;', details ?? '');
  } else {
    console.log(`%c${prefix} ℹ️ ${message}${timeInfo}`, 'color: #38bdf8;', details ?? '');
  }

  logListeners.forEach(listener => {
    try {
      listener(entry);
    } catch (e) {
      console.error('Log listener error:', e);
    }
  });
}

/**
 * Custom fetch wrapper implementing timeout and exponential backoff retries.
 */
function createResilientFetch(maxRetries = 3, timeoutMs = 10000): typeof fetch {
  return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    let attempt = 0;
    const urlString = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

    while (attempt <= maxRetries) {
      const startTime = performance.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      // Merge abort signals if one was provided in init
      const signal = init?.signal 
        ? anySignal([init.signal, controller.signal])
        : controller.signal;

      try {
        const response = await fetch(input, {
          ...init,
          signal
        });
        clearTimeout(timeoutId);

        const duration = Math.round(performance.now() - startTime);

        // Only retry on 5xx server errors or 429 rate limits, not 4xx client errors
        if (!response.ok && (response.status >= 500 || response.status === 429)) {
          if (attempt < maxRetries) {
            attempt++;
            const backoff = Math.min(1000 * Math.pow(2, attempt), 4000);
            logEvent('warn', 'connection', `Request returned status ${response.status}. Retrying in ${backoff}ms (attempt ${attempt}/${maxRetries})...`, { url: urlString }, duration);
            await new Promise(res => setTimeout(res, backoff));
            continue;
          }
        }

        return response;
      } catch (err: unknown) {
        clearTimeout(timeoutId);
        const duration = Math.round(performance.now() - startTime);
        const isAbort = (err as Error)?.name === 'AbortError';

        if (attempt < maxRetries) {
          attempt++;
          const backoff = Math.min(1000 * Math.pow(2, attempt), 4000);
          const reason = isAbort ? `Timed out after ${timeoutMs}ms` : (err as Error)?.message || 'Network error';
          logEvent('warn', 'connection', `${reason}. Retrying attempt ${attempt}/${maxRetries} in ${backoff}ms...`, { url: urlString }, duration);
          await new Promise(res => setTimeout(res, backoff));
          continue;
        }

        const friendlyMsg = isAbort 
          ? `Connection to Supabase timed out after ${timeoutMs}ms.`
          : `Network error connecting to Supabase: ${(err as Error)?.message}`;
        logEvent('error', 'connection', friendlyMsg, { url: urlString }, duration);
        throw new Error(friendlyMsg);
      }
    }

    throw new Error(`Request failed after ${maxRetries} retries.`);
  };
}

/**
 * Polyfill-safe helper to merge AbortSignals
 */
function anySignal(signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController();
  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort();
      return controller.signal;
    }
    signal.addEventListener('abort', () => controller.abort(), { once: true });
  }
  return controller.signal;
}

// Singleton instances
let supabaseClientInstance: SupabaseClient<Database> | null = null;
let supabaseAdminClientInstance: SupabaseClient<Database> | null = null;

/**
 * Get or initialize the singleton Supabase client for public/client operations.
 */
export function getSupabaseClient(): SupabaseClient<Database> {
  if (supabaseClientInstance) {
    return supabaseClientInstance;
  }

  const { config, errors } = validateEnv({ strict: false });

  if (errors.length > 0) {
    logEvent('warn', 'system', `Initializing Supabase client with environment warnings: ${errors.join(', ')}`);
  } else {
    logEvent('info', 'system', `Initializing Supabase client connected to: ${config.supabaseUrl}`);
  }

  supabaseClientInstance = createClient<Database>(
    config.supabaseUrl,
    config.supabaseAnonKey || 'placeholder-anon-key',
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      },
      global: {
        fetch: createResilientFetch(3, 10000)
      }
    }
  );

  return supabaseClientInstance;
}

/**
 * Get or initialize the Supabase Admin client with service role privileges.
 * ONLY for secure server scripts or migrations.
 */
export function getSupabaseAdminClient(): SupabaseClient<Database> {
  if (supabaseAdminClientInstance) {
    return supabaseAdminClientInstance;
  }

  const { config } = validateEnv({ requireServerKeys: true });
  const key = config.supabaseServiceRoleKey || config.supabaseAnonKey;

  supabaseAdminClientInstance = createClient<Database>(
    config.supabaseUrl,
    key,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      },
      global: {
        fetch: createResilientFetch(3, 10000)
      }
    }
  );

  return supabaseAdminClientInstance;
}

// Export default singleton instance
export const supabase = getSupabaseClient();
