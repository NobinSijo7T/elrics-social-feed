# ⚡ Supabase & Next.js 16 (App Router) Integration

A production-ready, full-stack **Next.js 16 (App Router)** and **Supabase** application featuring `@supabase/ssr` server and client utilities, automated environment validation, database migrations with Row Level Security (RLS), idempotent seeding, CLI maintenance tools, and a high-aesthetic Mission Control dashboard.

---

## 🌟 Key Architecture & Highlights

- **Next.js 16 (App Router)**: Fast builds powered by Turbopack, supporting both Server Components and Client Components.
- **`@supabase/ssr` Utilities**:
  - `src/lib/supabase-server.ts`: Server-side client using `cookies()` for Server Components, Server Actions, and Route Handlers.
  - `src/lib/supabase-browser.ts`: Browser-side client using `createBrowserClient()`.
  - `src/middleware.ts`: Auto-refreshing user session tokens across requests.
- **Database Schema with RLS**: PostgreSQL DDL for `users`, `products`, and `todos` with Row Level Security and granular policies.
- **CLI Automation Suite**: Comprehensive toolchain (`npm run db:migrate`, `db:seed`, `db:test`, `db:health`, `db:ping`, `db:reset`).
- **Obsidian Dark Dashboard**: Interactive status indicators (Connected: Green, Error: Red, Pending: Yellow), latency meters, live query telemetry, and realtime Todos CRUD board.

---

## 📁 Project Structure

```
.
├── .env                             # Active environment variables
├── .env.example                     # Environment variables documentation template
├── next.config.ts                   # Next.js configuration
├── tsconfig.json                    # Next.js TypeScript configuration
├── supabase/
│   ├── schema.sql                   # Complete DDL schema with RLS & policies
│   ├── seed.sql                     # Idempotent SQL seed dataset
│   └── migrations/                  # Version-controlled migration history
├── scripts/
│   ├── test-supabase.ts             # 10-point automated connection test runner
│   ├── seed.ts                      # Programmatic seed script with rollback handling
│   ├── reset-db.ts                  # Database clean and table removal utility
│   ├── health.ts                    # Fast health check diagnostic
│   ├── ping.ts                      # Latency measurement tool
│   └── migrate.ts                   # Direct PostgreSQL migration executor
├── src/
│   ├── app/
│   │   ├── layout.tsx               # Next.js Root Layout with metadata
│   │   ├── page.tsx                 # Homepage rendering Mission Control
│   │   └── globals.css              # Obsidian glassmorphic design system
│   ├── components/
│   │   ├── SupabaseStatus.tsx       # Live status badge & latency telemetry
│   │   ├── CrudDemo.tsx             # Interactive Todo manager
│   │   └── TestConnection.tsx       # Comprehensive 8-section dashboard
│   ├── hooks/
│   │   └── useSupabase.ts           # Client hook for state, ping, and logs
│   ├── lib/
│   │   ├── env.ts                   # Environment validator (Node, Vite, Next.js)
│   │   ├── database.ts              # TypeScript Database types and schema interfaces
│   │   ├── supabase.ts              # Resilient singleton client with logging & retries
│   │   ├── supabase-server.ts       # @supabase/ssr server client for Server Components
│   │   └── supabase-browser.ts      # @supabase/ssr browser client
│   └── middleware.ts                # Next.js session refresh middleware
└── package.json
```

---

## 🚀 Quickstart Guide

### 1. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Build for Production

```bash
npm run build
npm run start
```

---

## 🛠️ CLI Database Management Commands

| Command | Purpose |
| :--- | :--- |
| `npm run db:migrate` | Runs `supabase/schema.sql` directly against your remote Supabase database |
| `npm run db:seed` | Idempotently inserts 10 users, 20 products, and 15 todos with rollback support |
| `npm run db:test` | Runs the full 10-point automated connection lifecycle test suite |
| `npm run db:ping` | Measures round-trip REST / PostgreSQL ping latency |
| `npm run db:health` | Performs quick API health check and table count |
| `npm run db:reset` | Drops public tables cleanly from Supabase |
