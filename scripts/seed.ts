/**
 * Programmatic Seeding Script for Supabase
 * Inserts 10 users, 20 products, and 15 todos.
 * Idempotent with rollback support on batch failures.
 */

import 'dotenv/config';
import { getSupabaseAdminClient, getSupabaseClient } from '../src/lib/supabase';
import type { InsertUser, InsertProduct, InsertTodo } from '../src/lib/database';

const usersData: InsertUser[] = [
  { id: 'a0000000-0000-0000-0000-000000000001', name: 'Alice Johnson', email: 'alice.johnson@example.com' },
  { id: 'a0000000-0000-0000-0000-000000000002', name: 'Bob Smith', email: 'bob.smith@example.com' },
  { id: 'a0000000-0000-0000-0000-000000000003', name: 'Carol Williams', email: 'carol.williams@example.com' },
  { id: 'a0000000-0000-0000-0000-000000000004', name: 'David Brown', email: 'david.brown@example.com' },
  { id: 'a0000000-0000-0000-0000-000000000005', name: 'Eva Martinez', email: 'eva.martinez@example.com' },
  { id: 'a0000000-0000-0000-0000-000000000006', name: 'Frank Miller', email: 'frank.miller@example.com' },
  { id: 'a0000000-0000-0000-0000-000000000007', name: 'Grace Davis', email: 'grace.davis@example.com' },
  { id: 'a0000000-0000-0000-0000-000000000008', name: 'Henry Wilson', email: 'henry.wilson@example.com' },
  { id: 'a0000000-0000-0000-0000-000000000009', name: 'Iris Taylor', email: 'iris.taylor@example.com' },
  { id: 'a0000000-0000-0000-0000-000000000010', name: 'Jack Anderson', email: 'jack.anderson@example.com' }
];

const productsData: InsertProduct[] = [
  { id: 'b0000000-0000-0000-0000-000000000001', name: 'Quantum Mechanical Keyboard', price: 149.99, stock: 45 },
  { id: 'b0000000-0000-0000-0000-000000000002', name: 'Ultra-Wide 4K Gaming Monitor', price: 499.50, stock: 18 },
  { id: 'b0000000-0000-0000-0000-000000000003', name: 'Wireless Noise-Cancelling Headphones', price: 199.95, stock: 30 },
  { id: 'b0000000-0000-0000-0000-000000000004', name: 'Ergonomic Mesh Office Chair', price: 289.00, stock: 12 },
  { id: 'b0000000-0000-0000-0000-000000000005', name: 'Thunderbolt 4 Docking Station', price: 179.99, stock: 25 },
  { id: 'b0000000-0000-0000-0000-000000000006', name: 'Precision Laser Mouse with Weights', price: 79.50, stock: 60 },
  { id: 'b0000000-0000-0000-0000-000000000007', name: 'USB-C Studio Condenser Microphone', price: 119.00, stock: 35 },
  { id: 'b0000000-0000-0000-0000-000000000008', name: '4K 60FPS Streaming Webcam', price: 139.99, stock: 22 },
  { id: 'b0000000-0000-0000-0000-000000000009', name: 'Anodized Aluminum Desk Mat', price: 34.99, stock: 80 },
  { id: 'b0000000-0000-0000-0000-000000000010', name: 'Smart Ambient LED Light Bar', price: 64.95, stock: 50 },
  { id: 'b0000000-0000-0000-0000-000000000011', name: 'Dual Monitor Articulating Arm', price: 89.99, stock: 40 },
  { id: 'b0000000-0000-0000-0000-000000000012', name: 'Portable NVMe SSD 2TB', price: 159.00, stock: 28 },
  { id: 'b0000000-0000-0000-0000-000000000013', name: 'Braided Magnetic Fast-Charging Cable', price: 19.99, stock: 120 },
  { id: 'b0000000-0000-0000-0000-000000000014', name: 'Stream Control Deck 15-Key', price: 149.00, stock: 15 },
  { id: 'b0000000-0000-0000-0000-000000000015', name: 'Adjustable Footrest Platform', price: 45.00, stock: 32 },
  { id: 'b0000000-0000-0000-0000-000000000016', name: 'Ceramic Smart Temperature Mug', price: 98.50, stock: 24 },
  { id: 'b0000000-0000-0000-0000-000000000017', name: 'Cable Management Raceway Kit', price: 24.99, stock: 70 },
  { id: 'b0000000-0000-0000-0000-000000000018', name: 'Acoustic Sound Absorption Panels (6-Pack)', price: 59.99, stock: 38 },
  { id: 'b0000000-0000-0000-0000-000000000019', name: 'Compact GaN Fast Charger 100W', price: 49.99, stock: 65 },
  { id: 'b0000000-0000-0000-0000-000000000020', name: 'Desk Surface Wireless Charger Pad', price: 39.50, stock: 55 }
];

const todosData: InsertTodo[] = [
  { id: 'c0000000-0000-0000-0000-000000000001', title: 'Set up Supabase project credentials in .env', completed: true },
  { id: 'c0000000-0000-0000-0000-000000000002', title: 'Execute database schema migration with RLS policies', completed: true },
  { id: 'c0000000-0000-0000-0000-000000000003', title: 'Seed initial sample dataset for users and products', completed: true },
  { id: 'c0000000-0000-0000-0000-000000000004', title: 'Verify connection status indicator on frontend dashboard', completed: false },
  { id: 'c0000000-0000-0000-0000-000000000005', title: 'Test live CRUD operations on todos table', completed: false },
  { id: 'c0000000-0000-0000-0000-000000000006', title: 'Validate real-time subscription events for updates', completed: false },
  { id: 'c0000000-0000-0000-0000-000000000007', title: 'Execute automated test suite via npm run db:test', completed: false },
  { id: 'c0000000-0000-0000-0000-000000000008', title: 'Confirm exponential retry mechanism on network failure', completed: true },
  { id: 'c0000000-0000-0000-0000-000000000009', title: 'Verify Supabase storage bucket accessibility', completed: false },
  { id: 'c0000000-0000-0000-0000-000000000010', title: 'Inspect structured query and error logs in console UI', completed: false },
  { id: 'c0000000-0000-0000-0000-000000000011', title: 'Configure custom Postgres function for health ping', completed: true },
  { id: 'c0000000-0000-0000-0000-000000000012', title: 'Document environment variables in .env.example', completed: true },
  { id: 'c0000000-0000-0000-0000-000000000013', title: 'Benchmark read latency against remote Supabase instance', completed: false },
  { id: 'c0000000-0000-0000-0000-000000000014', title: 'Review RLS policies security before production deployment', completed: false },
  { id: 'c0000000-0000-0000-0000-000000000015', title: 'Perform full database reset test with rollback simulation', completed: false }
];

async function seedDatabase() {
  console.log('\n🌱 Starting idempotent database seeding...');
  const client = process.env.SUPABASE_SERVICE_ROLE_KEY ? getSupabaseAdminClient() : getSupabaseClient();

  const rollbackStack: Array<() => Promise<void>> = [];

  try {
    // 1. Seed Users (10)
    console.log('Inserting 10 users...');
    const { data: usersInserted, error: userError } = await client
      .from('users')
      .upsert(usersData, { onConflict: 'id' })
      .select('id');

    if (userError) throw new Error(`Users seed failed: ${userError.message}`);
    rollbackStack.push(async () => {
      console.log('Rolling back inserted users...');
      await client.from('users').delete().in('id', usersData.map(u => u.id!));
    });
    console.log(`✅ Seeded ${usersData.length} users successfully.`);

    // 2. Seed Products (20)
    console.log('Inserting 20 products...');
    const { error: prodError } = await client
      .from('products')
      .upsert(productsData, { onConflict: 'id' });

    if (prodError) throw new Error(`Products seed failed: ${prodError.message}`);
    rollbackStack.push(async () => {
      console.log('Rolling back inserted products...');
      await client.from('products').delete().in('id', productsData.map(p => p.id!));
    });
    console.log(`✅ Seeded ${productsData.length} products successfully.`);

    // 3. Seed Todos (15)
    console.log('Inserting 15 todos...');
    const { error: todoError } = await client
      .from('todos')
      .upsert(todosData, { onConflict: 'id' });

    if (todoError) throw new Error(`Todos seed failed: ${todoError.message}`);
    console.log(`✅ Seeded ${todosData.length} todos successfully.`);

    console.log('\n✨ Database seeding completed successfully! Total records upserted: 45\n');
  } catch (err: unknown) {
    console.error('\n❌ Seeding encountered an error:', (err as Error).message);
    console.log('🔄 Executing rollback for previously inserted batches...');
    for (const rollback of rollbackStack.reverse()) {
      try {
        await rollback();
      } catch (rbErr) {
        console.error('Failed to rollback batch:', rbErr);
      }
    }
    console.log('⚠️ Rollback sequence completed.');
    process.exit(1);
  }
}

seedDatabase();
