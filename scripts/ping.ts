/**
 * Fast Database Ping Script
 * Quickly measures ping latency to the Supabase REST/Postgres endpoint.
 */

import 'dotenv/config';
import { getSupabaseClient } from '../src/lib/supabase';

async function ping() {
  const client = getSupabaseClient();
  const start = performance.now();

  try {
    const { error } = await client.from('todos').select('id').limit(1);
    const latency = Math.round(performance.now() - start);

    const isMissingTable = error && (
      error.message.includes('relation "public.todos" does not exist') ||
      error.message.includes('schema cache') ||
      error.code === 'PGRST205'
    );

    if (error && !isMissingTable) {
      throw error;
    }

    console.log(`🏓 PONG! Connection verified in ${latency}ms.`);
    if (isMissingTable) {
      console.log(`💡 Note: Connected to Supabase, but the "todos" table is not created yet. Run supabase/schema.sql in the SQL Editor to create it.`);
    }
  } catch (err: unknown) {
    const latency = Math.round(performance.now() - start);
    console.error(`❌ Ping failed after ${latency}ms:`, (err as Error).message);
    process.exit(1);
  }
}

ping();
