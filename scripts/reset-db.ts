/**
 * Database Table Removal & Reset Script
 * Completely drops the public sample tables: todos, products, users.
 */

import 'dotenv/config';
import { Client } from 'pg';

async function removeTables() {
  console.log('\n🗑️  Initiating complete removal of tables from Supabase: todos, products, users...');

  const connectionString = 
    process.env.DATABASE_URL || 
    (process.env.SUPABASE_PROJECT_ID && process.env.SUPABASE_DB_PASSWORD
      ? `postgresql://postgres:${process.env.SUPABASE_DB_PASSWORD}@db.${process.env.SUPABASE_PROJECT_ID}.supabase.co:5432/postgres`
      : undefined);

  if (!connectionString) {
    console.error('❌ No direct database connection string (DATABASE_URL) found in .env.');
    process.exit(1);
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL successfully.');

    // Query existing tables in public schema
    const checkBefore = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public';
    `);
    console.log('Current tables in public schema:', checkBefore.rows.map(r => r.tablename).join(', ') || 'None');

    // Drop sample tables with CASCADE to remove dependent policies & constraints
    console.log('Dropping tables public.todos, public.products, public.users...');
    await client.query(`
      DROP TABLE IF EXISTS public.todos CASCADE;
      DROP TABLE IF EXISTS public.products CASCADE;
      DROP TABLE IF EXISTS public.users CASCADE;
    `);

    // Verify after drop
    const checkAfter = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public';
    `);
    console.log('Remaining tables in public schema:', checkAfter.rows.map(r => r.tablename).join(', ') || 'None (Clean)');

    console.log('\n✨ All sample tables (todos, products, users) were successfully removed from Supabase!');
    console.log('💡 To recreate them anytime in the future, run: npm run db:migrate\n');
  } catch (err: unknown) {
    console.error('\n❌ Failed to remove tables:', (err as Error).message);
    process.exit(1);
  } finally {
    await client.end().catch(() => {});
  }
}

removeTables();
