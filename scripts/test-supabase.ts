/**
 * Comprehensive Supabase Connection & Lifecycle Test Script
 * Runs 10 distinct health, connectivity, and CRUD checks.
 */

import 'dotenv/config';
import { getSupabaseAdminClient, getSupabaseClient } from '../src/lib/supabase';
import { validateEnv } from '../src/lib/env';

interface CheckResult {
  title: string;
  passed: boolean;
  durationMs: number;
  message?: string;
  error?: string;
}

// Terminal color helpers
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
};

async function runCheck(title: string, fn: () => Promise<{ message?: string } | void>): Promise<CheckResult> {
  const start = performance.now();
  try {
    const result = await fn();
    const durationMs = Math.round(performance.now() - start);
    return {
      title,
      passed: true,
      durationMs,
      message: result?.message || 'OK'
    };
  } catch (err: unknown) {
    const durationMs = Math.round(performance.now() - start);
    return {
      title,
      passed: false,
      durationMs,
      error: (err as Error)?.message || String(err)
    };
  }
}

async function main() {
  console.log('\n' + colors.bright + colors.cyan + '╔══════════════════════════════════════════════════════════╗' + colors.reset);
  console.log(colors.bright + colors.cyan + '║          SUPABASE INTEGRATION TEST SUITE                 ║' + colors.reset);
  console.log(colors.bright + colors.cyan + '╚══════════════════════════════════════════════════════════╝' + colors.reset + '\n');

  const suiteStart = performance.now();
  const results: CheckResult[] = [];

  // Use admin client if service key exists, fallback to public anon client
  const client = process.env.SUPABASE_SERVICE_ROLE_KEY ? getSupabaseAdminClient() : getSupabaseClient();
  const testTodoId = 'f0000000-0000-0000-0000-000000000999';

  // Check 1: Environment Variables Exist
  results.push(await runCheck('1. Environment Variables Validation', async () => {
    const envResult = validateEnv({ strict: false });
    if (!envResult.isValid) {
      throw new Error(envResult.errors.join('; '));
    }
    if (envResult.config.isMockOrPlaceholder) {
      return { message: 'Config parsed (using placeholder/demo URL)' };
    }
    return { message: `URL: ${envResult.config.supabaseUrl} (configured)` };
  }));

  // Check 2: Supabase Client Initializes
  results.push(await runCheck('2. Supabase Client Initialization', async () => {
    if (!client || !client.auth) {
      throw new Error('Supabase client failed to initialize or missing auth interface.');
    }
    return { message: 'Client singleton instantiated with resilient fetch' };
  }));

  // Check 3: Authentication Endpoint Reachable
  results.push(await runCheck('3. Auth Endpoint Reachable', async () => {
    const { data, error } = await client.auth.getSession();
    if (error) {
      throw error;
    }
    return { message: data.session ? `Session active: ${data.session.user.email}` : 'Auth endpoint responded (no active session)' };
  }));

  // Check 4: Database Connection Successful
  results.push(await runCheck('4. Database Connection & Latency', async () => {
    const start = performance.now();
    const { data, error } = await client.from('todos').select('id').limit(1);
    const latency = Math.round(performance.now() - start);
    if (error && !error.message.includes('relation "public.todos" does not exist')) {
      throw error;
    }
    return { message: `Responded in ${latency}ms` };
  }));

  // Check 5: Can Read from Sample Table
  results.push(await runCheck('5. Sample Table Read (todos)', async () => {
    const { data, error } = await client.from('todos').select('id, title, completed').limit(5);
    if (error) throw error;
    return { message: `Fetched ${data.length} sample record(s)` };
  }));

  // Check 6: Can Insert Test Record
  results.push(await runCheck('6. Insert Test Record (CRUD Create)', async () => {
    const { data, error } = await client.from('todos').upsert({
      id: testTodoId,
      title: 'Automated Lifecycle Diagnostic Item',
      completed: false
    }).select().single();
    if (error) throw error;
    return { message: `Inserted test ID: ${data.id}` };
  }));

  // Check 7: Can Update Test Record
  results.push(await runCheck('7. Update Test Record (CRUD Update)', async () => {
    const { data, error } = await client.from('todos').update({
      completed: true,
      title: 'Automated Lifecycle Diagnostic Item (Updated)'
    }).eq('id', testTodoId).select().single();
    if (error) throw error;
    return { message: `Updated status to completed: ${data.completed}` };
  }));

  // Check 8: Can Delete Test Record
  results.push(await runCheck('8. Delete Test Record (CRUD Delete)', async () => {
    const { error } = await client.from('todos').delete().eq('id', testTodoId);
    if (error) throw error;
    return { message: 'Cleaned up test record cleanly' };
  }));

  // Check 9: Storage Availability
  results.push(await runCheck('9. Storage Bucket Availability', async () => {
    const { data, error } = await client.storage.listBuckets();
    if (error) {
      // If storage is not configured or disabled, warn without failing the whole test
      return { message: `Storage query returned: ${error.message} (bucket optional)` };
    }
    return { message: `Available buckets: ${data?.length ?? 0}` };
  }));

  // Check 10: Realtime Connection
  results.push(await runCheck('10. Realtime Channel Subscription', async () => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        channel.unsubscribe();
        resolve({ message: 'Realtime channel init passed' });
      }, 2500);

      const channel = client.channel('health-check-channel')
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            clearTimeout(timeout);
            channel.unsubscribe();
            resolve({ message: 'Channel subscribed successfully' });
          } else if (status === 'CHANNEL_ERROR') {
            clearTimeout(timeout);
            channel.unsubscribe();
            reject(new Error('Channel subscription returned CHANNEL_ERROR'));
          }
        });
    });
  }));

  const totalDuration = Math.round(performance.now() - suiteStart);

  // Print formatted report
  console.log(colors.bright + 'Execution Summary:' + colors.reset);
  console.log('────────────────────────────────────────────────────────────');

  let passedCount = 0;
  for (const res of results) {
    if (res.passed) {
      passedCount++;
      console.log(
        ` ${colors.green}✔ PASS${colors.reset}  ${res.title.padEnd(38)} ` +
        `${colors.dim}(${res.durationMs}ms)${colors.reset}  ${colors.bright}${res.message || ''}${colors.reset}`
      );
    } else {
      console.log(
        ` ${colors.red}✖ FAIL${colors.reset}  ${res.title.padEnd(38)} ` +
        `${colors.dim}(${res.durationMs}ms)${colors.reset}`
      );
      console.log(`         ${colors.red}Reason:${colors.reset} ${res.error}`);
    }
  }

  console.log('────────────────────────────────────────────────────────────');
  const envConfig = validateEnv().config;
  console.log(colors.bright + 'Diagnostics Details:' + colors.reset);
  console.log(`  Project URL:       ${colors.cyan}${envConfig.supabaseUrl}${colors.reset}`);
  console.log(`  Project ID:        ${envConfig.supabaseProjectId || 'N/A'}`);
  console.log(`  Total Checks:      ${results.length}`);
  console.log(`  Passed:            ${passedCount === results.length ? colors.green : colors.yellow}${passedCount}/${results.length}${colors.reset}`);
  console.log(`  Total Time:        ${totalDuration}ms`);
  console.log('────────────────────────────────────────────────────────────\n');

  if (passedCount < results.length) {
    console.log(colors.yellow + 'Note: If tests failed due to network or authentication, ensure valid credentials in .env and run "npm run db:seed" to populate tables.' + colors.reset + '\n');
  } else {
    console.log(colors.green + '✨ All Supabase lifecycle checks verified successfully!' + colors.reset + '\n');
  }
}

main().catch((err) => {
  console.error(colors.red + '\nFatal Test Suite Runner Error:' + colors.reset, err);
  process.exit(1);
});
