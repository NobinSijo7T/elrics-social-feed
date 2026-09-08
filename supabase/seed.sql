-- ==============================================================================
-- Supabase Idempotent Seed SQL
-- Inserts: 10 Users, 20 Products, 15 Todos
-- Uses explicit UUIDs and ON CONFLICT handling to ensure safe multiple runs.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Seed 10 Users
-- ------------------------------------------------------------------------------
INSERT INTO public.users (id, name, email, created_at)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 'Alice Johnson', 'alice.johnson@example.com', '2026-01-01 10:00:00Z'),
    ('a0000000-0000-0000-0000-000000000002', 'Bob Smith', 'bob.smith@example.com', '2026-01-02 11:30:00Z'),
    ('a0000000-0000-0000-0000-000000000003', 'Carol Williams', 'carol.williams@example.com', '2026-01-03 09:15:00Z'),
    ('a0000000-0000-0000-0000-000000000004', 'David Brown', 'david.brown@example.com', '2026-01-04 14:20:00Z'),
    ('a0000000-0000-0000-0000-000000000005', 'Eva Martinez', 'eva.martinez@example.com', '2026-01-05 16:45:00Z'),
    ('a0000000-0000-0000-0000-000000000006', 'Frank Miller', 'frank.miller@example.com', '2026-01-06 08:00:00Z'),
    ('a0000000-0000-0000-0000-000000000007', 'Grace Davis', 'grace.davis@example.com', '2026-01-07 12:10:00Z'),
    ('a0000000-0000-0000-0000-000000000008', 'Henry Wilson', 'henry.wilson@example.com', '2026-01-08 17:35:00Z'),
    ('a0000000-0000-0000-0000-000000000009', 'Iris Taylor', 'iris.taylor@example.com', '2026-01-09 13:50:00Z'),
    ('a0000000-0000-0000-0000-000000000010', 'Jack Anderson', 'jack.anderson@example.com', '2026-01-10 15:25:00Z')
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, 
    email = EXCLUDED.email;

-- ------------------------------------------------------------------------------
-- 2. Seed 20 Products
-- ------------------------------------------------------------------------------
INSERT INTO public.products (id, name, price, stock, created_at)
VALUES
    ('b0000000-0000-0000-0000-000000000001', 'Quantum Mechanical Keyboard', 149.99, 45, '2026-01-01 10:00:00Z'),
    ('b0000000-0000-0000-0000-000000000002', 'Ultra-Wide 4K Gaming Monitor', 499.50, 18, '2026-01-02 10:00:00Z'),
    ('b0000000-0000-0000-0000-000000000003', 'Wireless Noise-Cancelling Headphones', 199.95, 30, '2026-01-03 10:00:00Z'),
    ('b0000000-0000-0000-0000-000000000004', 'Ergonomic Mesh Office Chair', 289.00, 12, '2026-01-04 10:00:00Z'),
    ('b0000000-0000-0000-0000-000000000005', 'Thunderbolt 4 Docking Station', 179.99, 25, '2026-01-05 10:00:00Z'),
    ('b0000000-0000-0000-0000-000000000006', 'Precision Laser Mouse with Weights', 79.50, 60, '2026-01-06 10:00:00Z'),
    ('b0000000-0000-0000-0000-000000000007', 'USB-C Studio Condenser Microphone', 119.00, 35, '2026-01-07 10:00:00Z'),
    ('b0000000-0000-0000-0000-000000000008', '4K 60FPS Streaming Webcam', 139.99, 22, '2026-01-08 10:00:00Z'),
    ('b0000000-0000-0000-0000-000000000009', 'Anodized Aluminum Desk Mat', 34.99, 80, '2026-01-09 10:00:00Z'),
    ('b0000000-0000-0000-0000-000000000010', 'Smart Ambient LED Light Bar', 64.95, 50, '2026-01-10 10:00:00Z'),
    ('b0000000-0000-0000-0000-000000000011', 'Dual Monitor Articulating Arm', 89.99, 40, '2026-01-11 10:00:00Z'),
    ('b0000000-0000-0000-0000-000000000012', 'Portable NVMe SSD 2TB', 159.00, 28, '2026-01-12 10:00:00Z'),
    ('b0000000-0000-0000-0000-000000000013', 'Braided Magnetic Fast-Charging Cable', 19.99, 120, '2026-01-13 10:00:00Z'),
    ('b0000000-0000-0000-0000-000000000014', 'Stream Control Deck 15-Key', 149.00, 15, '2026-01-14 10:00:00Z'),
    ('b0000000-0000-0000-0000-000000000015', 'Adjustable Footrest Platform', 45.00, 32, '2026-01-15 10:00:00Z'),
    ('b0000000-0000-0000-0000-000000000016', 'Ceramic Smart Temperature Mug', 98.50, 24, '2026-01-16 10:00:00Z'),
    ('b0000000-0000-0000-0000-000000000017', 'Cable Management Raceway Kit', 24.99, 70, '2026-01-17 10:00:00Z'),
    ('b0000000-0000-0000-0000-000000000018', 'Acoustic Sound Absorption Panels (6-Pack)', 59.99, 38, '2026-01-18 10:00:00Z'),
    ('b0000000-0000-0000-0000-000000000019', 'Compact GaN Fast Charger 100W', 49.99, 65, '2026-01-19 10:00:00Z'),
    ('b0000000-0000-0000-0000-000000000020', 'Desk Surface Wireless Charger Pad', 39.50, 55, '2026-01-20 10:00:00Z')
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, 
    price = EXCLUDED.price, 
    stock = EXCLUDED.stock;

-- ------------------------------------------------------------------------------
-- 3. Seed 15 Todos
-- ------------------------------------------------------------------------------
INSERT INTO public.todos (id, title, completed, created_at)
VALUES
    ('c0000000-0000-0000-0000-000000000001', 'Set up Supabase project credentials in .env', true, '2026-01-01 09:00:00Z'),
    ('c0000000-0000-0000-0000-000000000002', 'Execute database schema migration with RLS policies', true, '2026-01-01 10:00:00Z'),
    ('c0000000-0000-0000-0000-000000000003', 'Seed initial sample dataset for users and products', true, '2026-01-01 11:00:00Z'),
    ('c0000000-0000-0000-0000-000000000004', 'Verify connection status indicator on frontend dashboard', false, '2026-01-02 12:00:00Z'),
    ('c0000000-0000-0000-0000-000000000005', 'Test live CRUD operations on todos table', false, '2026-01-02 13:00:00Z'),
    ('c0000000-0000-0000-0000-000000000006', 'Validate real-time subscription events for updates', false, '2026-01-03 14:00:00Z'),
    ('c0000000-0000-0000-0000-000000000007', 'Execute automated test suite via npm run db:test', false, '2026-01-03 15:00:00Z'),
    ('c0000000-0000-0000-0000-000000000008', 'Confirm exponential retry mechanism on network failure', true, '2026-01-04 16:00:00Z'),
    ('c0000000-0000-0000-0000-000000000009', 'Verify Supabase storage bucket accessibility', false, '2026-01-04 17:00:00Z'),
    ('c0000000-0000-0000-0000-000000000010', 'Inspect structured query and error logs in console UI', false, '2026-01-05 18:00:00Z'),
    ('c0000000-0000-0000-0000-000000000011', 'Configure custom Postgres function for health ping', true, '2026-01-05 19:00:00Z'),
    ('c0000000-0000-0000-0000-000000000012', 'Document environment variables in .env.example', true, '2026-01-06 20:00:00Z'),
    ('c0000000-0000-0000-0000-000000000013', 'Benchmark read latency against remote Supabase instance', false, '2026-01-06 21:00:00Z'),
    ('c0000000-0000-0000-0000-000000000014', 'Review RLS policies security before production deployment', false, '2026-01-07 22:00:00Z'),
    ('c0000000-0000-0000-0000-000000000015', 'Perform full database reset test with rollback simulation', false, '2026-01-08 23:00:00Z')
ON CONFLICT (id) DO UPDATE 
SET title = EXCLUDED.title, 
    completed = EXCLUDED.completed;
