-- ==============================================================================
-- Supabase Schema Definition
-- Tables: users, products, todos
-- Includes Row Level Security (RLS) and permissive sample policies for testing.
-- ==============================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. Users Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to allow safe re-runs
DROP POLICY IF EXISTS "Allow public read access on users" ON public.users;
DROP POLICY IF EXISTS "Allow public insert on users" ON public.users;
DROP POLICY IF EXISTS "Allow public update on users" ON public.users;
DROP POLICY IF EXISTS "Allow public delete on users" ON public.users;

-- Policies for public testing
CREATE POLICY "Allow public read access on users" 
    ON public.users FOR SELECT 
    USING (true);

CREATE POLICY "Allow public insert on users" 
    ON public.users FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Allow public update on users" 
    ON public.users FOR UPDATE 
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow public delete on users" 
    ON public.users FOR DELETE 
    USING (true);


-- ==============================================================================
-- 2. Products Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public read access on products" ON public.products;
DROP POLICY IF EXISTS "Allow public insert on products" ON public.products;
DROP POLICY IF EXISTS "Allow public update on products" ON public.products;
DROP POLICY IF EXISTS "Allow public delete on products" ON public.products;

-- Policies for public testing
CREATE POLICY "Allow public read access on products" 
    ON public.products FOR SELECT 
    USING (true);

CREATE POLICY "Allow public insert on products" 
    ON public.products FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Allow public update on products" 
    ON public.products FOR UPDATE 
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow public delete on products" 
    ON public.products FOR DELETE 
    USING (true);


-- ==============================================================================
-- 3. Todos Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.todos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public read access on todos" ON public.todos;
DROP POLICY IF EXISTS "Allow public insert on todos" ON public.todos;
DROP POLICY IF EXISTS "Allow public update on todos" ON public.todos;
DROP POLICY IF EXISTS "Allow public delete on todos" ON public.todos;

-- Policies for public testing
CREATE POLICY "Allow public read access on todos" 
    ON public.todos FOR SELECT 
    USING (true);

CREATE POLICY "Allow public insert on todos" 
    ON public.todos FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Allow public update on todos" 
    ON public.todos FOR UPDATE 
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow public delete on todos" 
    ON public.todos FOR DELETE 
    USING (true);

-- Enable Realtime publication for tables
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'todos'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.todos;
    END IF;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;
