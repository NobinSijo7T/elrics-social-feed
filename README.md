# ⚡ Supabase & Next.js 16 Full-Stack Mission Control

A production-ready full-stack application built with **Next.js 16 (App Router)** and **Supabase (PostgreSQL, GoTrue Auth, PostgREST & Realtime)**. Features end-to-end authentication, reactive React hooks, automated database migrations, idempotent seeding, CLI health/latency diagnostics, and an obsidian glassmorphic Mission Control dashboard.

---

## 🌟 Key Features & Architecture

- **Zero-Config Backend Architecture**: Eliminates the need for a separate Express.js or FastAPI server by leveraging Supabase's cloud data layer (PostgREST API + GoTrue Auth) and Next.js 16 Server Components/Route Handlers.
- **Authentication Suite (`src/lib/auth.ts` & `src/hooks/useAuth.ts`)**:
  - Email & Password registration and sign-in.
  - Social OAuth triggers (GitHub, Google).
  - Password reset dispatch.
  - Reactive session listener (`supabase.auth.onAuthStateChange`) syncing state across tabs.
  - Interactive **AuthCard** UI with live user identity badge and one-click Sign Out.
- **Database & Security**:
  - PostgreSQL schema with granular **Row Level Security (RLS)** policies.
  - Tables: `users`, `products`, and `todos`.
  - Database migrations directly executed via PostgreSQL connection pooling.
- **CLI Automation Suite**:
  - `npm run db:migrate` — Execute schema DDL against remote database.
  - `npm run db:seed` — Idempotently seed mock data with rollback support.
  - `npm run test:auth` — Automated 8-point authentication validation suite.
  - `npm run db:test` — Automated 10-point connection and CRUD lifecycle suite.
  - `npm run db:health` & `npm run db:ping` — Latency and connection health diagnostics.

---

## 📁 Project Structure

```
.
├── .env                             # Active environment credentials (git-ignored)
├── .env.example                     # Environment template
├── next.config.ts                   # Next.js configuration
├── tsconfig.json                    # TypeScript configuration
├── package.json                     # Dependencies and CLI scripts
├── supabase/
│   ├── schema.sql                   # Complete PostgreSQL DDL with RLS policies
│   ├── seed.sql                     # Idempotent seed data (users, products, todos)
│   └── migrations/                  # Versioned schema migrations
├── scripts/
│   ├── migrate.ts                   # Direct PostgreSQL migration runner
│   ├── seed.ts                      # Programmatic seed runner with transaction rollback
│   ├── test-auth.ts                 # 8-point automated Auth lifecycle test suite
│   ├── test-supabase.ts             # 10-point database connection & CRUD test suite
│   ├── health.ts                    # Rapid database health checker
│   ├── ping.ts                      # API & REST latency measurement tool
│   └── reset-db.ts                  # Clean database tables utility
├── src/
│   ├── app/
│   │   ├── layout.tsx               # Root Next.js layout
│   │   ├── page.tsx                 # Mission Control homepage
│   │   └── globals.css              # Obsidian glassmorphic design system
│   ├── components/
│   │   ├── AuthCard.tsx             # Interactive Sign-in, Register, and Profile UI
│   │   ├── SupabaseStatus.tsx       # Real-time connection & latency telemetry
│   │   ├── CrudDemo.tsx             # Realtime Todo CRUD board
│   │   └── TestConnection.tsx       # Master Mission Control hub with tabbed interface
│   ├── hooks/
│   │   ├── useAuth.ts               # Reactive Supabase auth hook
│   │   └── useSupabase.ts           # State, CRUD, realtime listener, and diagnostic logs
│   ├── lib/
│   │   ├── auth.ts                  # Typed auth service helpers with logging
│   │   ├── database.ts              # TypeScript Database schema definitions
│   │   ├── env.ts                   # Runtime environment validator
│   │   ├── supabase.ts              # Resilient singleton client with backoff retries
│   │   ├── supabase-browser.ts      # @supabase/ssr browser client
│   │   └── supabase-server.ts       # @supabase/ssr server client for Server Components
│   └── middleware.ts                # Session token refresh middleware
```

---

## 🚀 Setup & Execution Guide

Follow these steps in order to configure credentials, connect to the database, run migrations, and launch the application.

### Step 1: Install Dependencies

```bash
npm install
```

---

### Step 2: Configure Environment Variables

Create a `.env` file in the root directory (or copy from `.env.example`):

```env
# Supabase Cloud Project Configuration
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_REST_URL=https://your-project-ref.supabase.co/rest/v1
SUPABASE_ANON_KEY=your-publishable-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret-key
SUPABASE_DB_PASSWORD=your-database-password
SUPABASE_PROJECT_ID=your-project-ref

# PostgreSQL Connection Strings (found in Supabase Database Settings)
DATABASE_URL=postgresql://postgres:your-database-password@db.your-project-ref.supabase.co:5432/postgres
DATABASE_DIRECT_URL=postgresql://postgres.your-project-ref:your-database-password@aws-0-ap-south-1.pooler.supabase.com:6543/postgres

# Next.js Public Aliases (Required for Client Components)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-publishable-anon-key
```

---

### Step 3: Connect to Database & Run Migrations

Run the database setup commands in sequence:

#### 1. Check Database Connectivity & Latency
```bash
npm run db:ping
```
*Verifies network handshake and prints round-trip latency (in ms).*

#### 2. Apply Database Schema & Row Level Security (RLS)
```bash
npm run db:migrate
```
*Applies `supabase/schema.sql`, setting up `users`, `products`, and `todos` tables, triggers, and RLS policies.*

#### 3. Seed Initial Sample Data
```bash
npm run db:seed
```
*Idempotently populates initial users, sample products, and demo todos.*

#### 4. Run Health Check
```bash
npm run db:health
```
*Confirms table availability and records count.*

---

### Step 4: Run Automated Verification Test Suites

Before launching the frontend, you can verify your entire backend and auth pipeline via the CLI:

#### Test Authentication Gateway & Methods:
```bash
npm run test:auth
```
*Executes an 8-check suite verifying registration, sign-in validation, JWT session generation, OAuth provider routing, and sign-out.*

#### Test Database Connection & CRUD Operations:
```bash
npm run db:test
```
*Executes a 10-point test covering environment variables, client initialization, auth reachability, DB reads, insertions, updates, deletions, and storage.*

---

### Step 5: Start the Full-Stack Application (Backend & Frontend)

Start the Next.js development server with Turbopack:

```bash
npm run dev
```

* The application will be live at: **[http://localhost:3000](http://localhost:3000)**
* **Client UI**: Access the Supabase Mission Control dashboard with real-time health telemetry, live CRUD manager, and identity management.
* **Server Layer**: Next.js App Router and Middleware automatically handle session cookie refreshes on incoming requests.

To build and run for production:
```bash
npm run build
npm run start
```

---

## 🛠️ Complete CLI Command Reference

| Command | Category | Description |
| :--- | :--- | :--- |
| `npm run dev` | **Server** | Starts the Next.js full-stack development server with Turbopack on port 3000 |
| `npm run build` | **Server** | Compiles and builds production-optimized bundle |
| `npm run start` | **Server** | Launches the production Next.js server |
| `npm run test:auth` | **Auth** | Validates Supabase GoTrue authentication endpoints, methods, and sessions |
| `npm run db:migrate` | **Database** | Executes PostgreSQL schema migrations and RLS policies remotely |
| `npm run db:seed` | **Database** | Injects sample users, products, and todos with rollback protection |
| `npm run db:test` | **Database** | Runs full 10-point connection and CRUD verification suite |
| `npm run db:ping` | **Database** | Measures REST API and PostgreSQL query latency |
| `npm run db:health` | **Database** | Quick health check verifying table availability |
| `npm run db:reset` | **Database** | Drops public tables cleanly (resets database) |

---

## 🔐 Authentication Configuration Notes

### Email Verification in Supabase
By default, new Supabase projects enforce email verification:
* When a user registers through `signUp()`, Supabase sends a confirmation email.
* To enable immediate logins without waiting for email verification:
  1. Open your [Supabase Project Dashboard](https://supabase.com/dashboard).
  2. Navigate to **Authentication** $\rightarrow$ **Providers** $\rightarrow$ **Email**.
  3. Turn **OFF** the toggle for **Confirm email** and click **Save**.

### Social OAuth Setup
To enable one-click GitHub or Google sign-in:
1. Go to **Authentication** $\rightarrow$ **Providers** in Supabase.
2. Enable **GitHub** or **Google**, and paste your OAuth Client ID and Secret.
3. Add `http://localhost:3000/auth/callback` to your authorized redirect URIs.

---

## 📄 License
MIT License. Built with Next.js and Supabase.
