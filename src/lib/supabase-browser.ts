/**
 * Supabase Browser Client using @supabase/ssr
 * For use in Next.js Client Components ('use client')
 */

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './database';
import { validateEnv } from './env';

export function createClient() {
  const { config } = validateEnv();

  return createBrowserClient<Database>(
    config.supabaseUrl,
    config.supabaseAnonKey
  );
}

export const supabaseBrowser = createClient();
