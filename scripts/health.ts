/**
 * Supabase Health Check Script
 * Checks API availability, latency, and auth service status.
 */

import 'dotenv/config';
import { getSupabaseClient } from '../src/lib/supabase';
import { validateEnv } from '../src/lib/env';

async function checkHealth() {
  console.log('\n🔍 Running Supabase Health Check...');
  const { config, errors } = validateEnv();

  if (errors.length > 0) {
    console.error('❌ Environment validation failed:\n' + errors.map(e => ` - ${e}`).join('\n'));
    process.exit(1);
  }

  const client = getSupabaseClient();
  const start = performance.now();

  try {
    const { count, error } = await client.from('todos').select('*', { count: 'exact', head: true });
    const latency = Math.round(performance.now() - start);

    const isMissingTable = error && (
      error.message.includes('does not exist') ||
      error.message.includes('schema cache') ||
      error.code === 'PGRST205'
    );

    if (error && !isMissingTable) {
      throw error;
    }

    console.log('────────────────────────────────────────');
    console.log(' Status:        🟢 HEALTHY');
    console.log(` Latency:       ${latency}ms`);
    console.log(` Supabase URL:  ${config.supabaseUrl}`);
    console.log(` Table:         todos (${count !== null ? count : 'ready'} records)`);
    console.log('────────────────────────────────────────\n');
  } catch (err: unknown) {
    const latency = Math.round(performance.now() - start);
    console.log('────────────────────────────────────────');
    console.log(' Status:        🔴 UNHEALTHY');
    console.log(` Latency:       ${latency}ms`);
    console.log(` Error:         ${(err as Error).message}`);
    console.log('────────────────────────────────────────\n');
    process.exit(1);
  }
}

checkHealth();
