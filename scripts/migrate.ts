/**
 * Direct Migration Script for Supabase PostgreSQL
 * Connects directly using DATABASE_URL or SUPABASE_DB_PASSWORD and executes the
 * base schema followed by every SQL migration in chronological order.
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { Client } from 'pg';

async function runMigrations() {
  console.log('\n📦 Supabase Direct Migration Runner');
  console.log('────────────────────────────────────────────────────────────');

  const schemaPath = path.resolve(process.cwd(), 'supabase/schema.sql');
  if (!fs.existsSync(schemaPath)) {
    console.error(`❌ Schema file not found at: ${schemaPath}`);
    process.exit(1);
  }

  const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
  const migrationsDir = path.resolve(process.cwd(), 'supabase/migrations');
  const migrationFiles = fs.existsSync(migrationsDir)
    ? fs.readdirSync(migrationsDir).filter(file => file.endsWith('.sql')).sort()
    : [];
  console.log(`Loaded base schema and ${migrationFiles.length} migration(s)`);

  const connectionString = 
    process.env.DATABASE_URL || 
    (process.env.SUPABASE_PROJECT_ID && process.env.SUPABASE_DB_PASSWORD
      ? `postgresql://postgres:${process.env.SUPABASE_DB_PASSWORD}@db.${process.env.SUPABASE_PROJECT_ID}.supabase.co:5432/postgres`
      : undefined);

  if (!connectionString) {
    console.log('⚠️ No direct database connection string configured.');
    console.log('Please paste supabase/schema.sql into the Supabase SQL Editor.');
    process.exit(0);
  }

  console.log(`Attempting direct PostgreSQL connection...`);
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL successfully!');
    console.log('Executing database schema and RLS policies...');

    await client.query(schemaSql);
    for (const migrationFile of migrationFiles) {
      console.log(`Applying ${migrationFile}...`);
      await client.query(fs.readFileSync(path.join(migrationsDir, migrationFile), 'utf-8'));
    }

    console.log('✨ All migrations and RLS policies applied successfully!\n');
    console.log('Created tables:');
    console.log('  - users (with RLS)');
    console.log('  - products (with RLS)');
    console.log('  - todos (with RLS)');
    console.log('  - profiles, posts, likes (with RLS)');
  } catch (err: unknown) {
    console.error('Direct migration error:', (err as Error).message);
    console.log('\n💡 Alternatively, paste supabase/schema.sql in the Supabase SQL Editor:');
    console.log(`   https://supabase.com/dashboard/project/${process.env.SUPABASE_PROJECT_ID}/sql\n`);
  } finally {
    await client.end().catch(() => {});
  }
}

runMigrations();
