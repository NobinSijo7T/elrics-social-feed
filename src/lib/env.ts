/**
 * Environment configuration and startup validator for Supabase.
 * Supports both Node.js (scripts / server-side) and Vite browser environments.
 */

export interface SupabaseEnvConfig {
  supabaseUrl: string;
  supabaseRestUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey?: string;
  supabaseDbPassword?: string;
  supabaseProjectId?: string;
  isMockOrPlaceholder: boolean;
}

export interface EnvValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  config: SupabaseEnvConfig;
}

/**
 * Helper to safely extract an environment variable across Node, Vite, and Next.js conventions.
 */
function getEnvVar(...keys: string[]): string | undefined {
  const globalObj = globalThis as unknown as { process?: { env?: Record<string, string | undefined> } };
  
  for (const key of keys) {
    // Check Node CLI runtime via globalThis
    if (globalObj.process?.env && globalObj.process.env[key]) {
      return globalObj.process.env[key];
    }
    // Check import.meta.env safely
    const metaObj = (typeof import.meta !== 'undefined' ? import.meta : undefined) as unknown as { env?: Record<string, string | undefined> } | undefined;
    if (metaObj?.env && metaObj.env[key]) {
      return metaObj.env[key];
    }
  }
  return undefined;
}

/**
 * Validates Supabase environment variables with comprehensive checks.
 * @param options.strict If true, throws clear, actionable Error on missing/invalid config.
 * @param options.requireServerKeys If true, requires SUPABASE_SERVICE_ROLE_KEY & SUPABASE_DB_PASSWORD.
 */
export function validateEnv(options: { strict?: boolean; requireServerKeys?: boolean } = {}): EnvValidationResult {
  const { strict = false, requireServerKeys = false } = options;
  const errors: string[] = [];
  const warnings: string[] = [];

  // Static property references so Next.js / Turbopack inlines them into browser client bundles
  const nextPublicUrl = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_URL : undefined;
  const nextPublicAnon = typeof process !== 'undefined' 
    ? (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) 
    : undefined;
  const nextPublicRest = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_REST_URL : undefined;

  let rawUrl = nextPublicUrl || getEnvVar('SUPABASE_URL', 'VITE_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL');
  const explicitRestUrl = nextPublicRest || getEnvVar('SUPABASE_REST_URL', 'VITE_SUPABASE_REST_URL');
  const supabaseAnonKey = nextPublicAnon || getEnvVar(
    'SUPABASE_ANON_KEY',
    'VITE_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
    'SUPABASE_PUBLISHABLE_KEY'
  );
  const supabaseServiceRoleKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY', 'VITE_SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_SECRET_KEY');
  const supabaseDbPassword = getEnvVar('SUPABASE_DB_PASSWORD', 'VITE_SUPABASE_DB_PASSWORD');
  const supabaseProjectId = getEnvVar('SUPABASE_PROJECT_ID', 'VITE_SUPABASE_PROJECT_ID');

  // If rawUrl was not provided but explicitRestUrl was, extract base URL
  if (!rawUrl && explicitRestUrl) {
    rawUrl = explicitRestUrl.replace(/\/rest\/v1\/?$/, '');
  }

  // Normalize URL by removing trailing slashes and trailing /rest/v1
  let normalizedUrl = rawUrl ? rawUrl.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '') : '';

  // Check SUPABASE_URL
  if (!normalizedUrl) {
    errors.push('SUPABASE_URL is missing. Please set SUPABASE_URL in your .env file.');
  } else {
    try {
      const parsed = new URL(normalizedUrl);
      if (!parsed.protocol.startsWith('http')) {
        errors.push(`SUPABASE_URL must be a valid HTTP/HTTPS URL. Received: "${normalizedUrl}"`);
      }
      if (normalizedUrl.includes('your-project-id.supabase.co')) {
        warnings.push('SUPABASE_URL is currently using placeholder value ("your-project-id.supabase.co"). Replace with your active Supabase project URL.');
      }
    } catch {
      errors.push(`SUPABASE_URL is not a valid URL: "${normalizedUrl}". Expected format: https://<project-ref>.supabase.co`);
    }
  }

  // Check SUPABASE_ANON_KEY
  if (!supabaseAnonKey) {
    errors.push('SUPABASE_ANON_KEY is missing. Please set SUPABASE_ANON_KEY in your .env file.');
  } else if (supabaseAnonKey.includes('dummy-anon-key') || supabaseAnonKey.includes('your-anon-key')) {
    warnings.push('SUPABASE_ANON_KEY is using a placeholder string. Real database queries will fail until a valid Supabase API key is provided.');
  }

  // Server-specific keys validation
  if (requireServerKeys) {
    if (!supabaseServiceRoleKey || supabaseServiceRoleKey.includes('dummy') || supabaseServiceRoleKey.includes('your-service')) {
      warnings.push('SUPABASE_SERVICE_ROLE_KEY is missing or using a placeholder. Admin tasks / seeding may have limited permissions.');
    }
    if (!supabaseProjectId || supabaseProjectId.includes('your-project')) {
      warnings.push('SUPABASE_PROJECT_ID is missing or using placeholder.');
    }
    if (!supabaseDbPassword || supabaseDbPassword.includes('your-database')) {
      warnings.push('SUPABASE_DB_PASSWORD is missing or default.');
    }
  }

  const isMockOrPlaceholder = 
    !normalizedUrl || 
    normalizedUrl.includes('your-project-id') || 
    !supabaseAnonKey || 
    supabaseAnonKey.includes('dummy-anon-key') || 
    supabaseAnonKey.includes('your-anon-key');

  const supabaseUrl = normalizedUrl || 'https://your-project-id.supabase.co';
  const supabaseRestUrl = explicitRestUrl || `${supabaseUrl}/rest/v1`;

  const config: SupabaseEnvConfig = {
    supabaseUrl,
    supabaseRestUrl,
    supabaseAnonKey: supabaseAnonKey || '',
    supabaseServiceRoleKey,
    supabaseDbPassword,
    supabaseProjectId,
    isMockOrPlaceholder
  };

  const isValid = errors.length === 0;

  if (!isValid && strict) {
    const formattedErrors = errors.map((err, idx) => `  ${idx + 1}. ${err}`).join('\n');
    throw new Error(
      `[Supabase Configuration Error]\n` +
      `Failed to initialize Supabase due to missing or invalid environment variables:\n` +
      `${formattedErrors}\n\n` +
      `Resolution:\n` +
      `  1. Ensure a .env file exists in the project root.\n` +
      `  2. Copy settings from .env.example: cp .env.example .env\n` +
      `  3. Obtain your credentials from https://supabase.com/dashboard/project/_/settings/api\n`
    );
  }

  return {
    isValid,
    errors,
    warnings,
    config
  };
}

// Global cached config for fast access
let cachedConfig: SupabaseEnvConfig | null = null;

export function getValidatedEnv(options: { strict?: boolean; requireServerKeys?: boolean } = {}): SupabaseEnvConfig {
  if (!cachedConfig) {
    const result = validateEnv(options);
    cachedConfig = result.config;
  }
  return cachedConfig;
}
