# ⚡ Supabase & Next.js 16 + Django REST Framework Full-Stack Mission Control

A production-ready full-stack application built with **Next.js 16 (App Router)**, **Supabase (PostgreSQL, GoTrue Auth, PostgREST & Realtime)**, and a **Django REST Framework** sidecar API. Features end-to-end authentication, reactive React hooks, automated database migrations, idempotent seeding, CLI health/latency diagnostics, an obsidian glassmorphic Mission Control dashboard, and a fully tested DRF backend connected to the same Supabase PostgreSQL database.

---

## 🌟 Key Features & Architecture

- **Dual Backend Architecture**: Next.js 16 Server Components/Route Handlers for the primary app layer, plus a Django REST Framework API running as a sidecar service on port 8000 — both connected to the same Supabase PostgreSQL database.
- **Django REST Framework API (`backend/`)**:
  - Full CRUD REST API for `users`, `products`, and `todos` via DRF `ModelViewSet`.
  - Unmanaged Django models — zero conflict with the Supabase schema.
  - CORS configured to allow Next.js (`localhost:3000`) to call DRF endpoints.
  - 14/14 automated CRUD tests pass via `test_api.py`.
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
├── backend/                         # Django REST Framework sidecar backend
│   ├── requirements.txt             # Python dependencies
│   ├── manage.py                    # Django CLI entry point
│   ├── test_api.py                  # 6-test (14-check) automated CRUD suite
│   ├── venv/                        # Python virtual environment (git-ignored)
│   ├── elrics_api/
│   │   ├── settings.py              # Django config (DB, CORS, DRF, no migrations)
│   │   ├── urls.py                  # Root URL: /api/ → api.urls
│   │   └── wsgi.py                  # WSGI entry point
│   └── api/
│       ├── models.py                # Unmanaged models (users, products, todos)
│       ├── serializers.py           # DRF ModelSerializers
│       ├── views.py                 # ModelViewSets with full CRUD
│       └── urls.py                  # DRF DefaultRouter
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

#### Next.js (Node.js)
```bash
npm install
```

#### Django REST Framework (Python)
```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\pip install -r requirements.txt

# macOS / Linux
./venv/bin/pip install -r requirements.txt
```

---

### Step 2: Configure Environment Variables

Create a `.env` file in the **root directory** (or copy from `.env.example`). Both Next.js and the Django backend read from this same file:

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

> **Note**: The Django backend automatically loads `.env` from the project root via `python-dotenv`. No separate Python env file is required.

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

Before launching the servers, verify your entire backend and auth pipeline via the CLI:

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

### Step 5: Start Both Servers

Run the Next.js and Django servers in separate terminals simultaneously.

#### Terminal 1 — Next.js Frontend (port 3000)
```bash
npm run dev
```
- Application live at: **http://localhost:3000**
- Client UI: Supabase Mission Control dashboard with real-time telemetry, live CRUD manager, and identity management.
- Server Layer: Next.js App Router and Middleware automatically handle session cookie refreshes.

#### Terminal 2 — Django REST Framework API (port 8000)
```bash
cd backend

# Windows
.\venv\Scripts\python manage.py runserver 8000

# macOS / Linux
./venv/bin/python manage.py runserver 8000
```
- DRF API live at: **http://localhost:8000/api/**
- Browsable API available in browser for interactive testing.

To build and run Next.js for production:
```bash
npm run build
npm run start
```

---

### Step 6: Test the Django REST Framework API

With the Django server running, execute the automated 6-test CRUD suite:

```bash
cd backend

# Windows
.\venv\Scripts\python test_api.py

# macOS / Linux
./venv/bin/python test_api.py
```

Expected output:
```
============================================================
  Elrics — Django REST Framework API Test Suite
  Target: http://127.0.0.1:8000
============================================================

[ Test 1 ] GET /api/users/      → [PASS] [PASS] [PASS]
[ Test 2 ] GET /api/products/   → [PASS] [PASS]
[ Test 3 ] GET /api/todos/      → [PASS] [PASS]
[ Test 4 ] POST /api/todos/     → [PASS] [PASS] [PASS]
[ Test 5 ] PATCH /api/todos/<id>/ → [PASS] [PASS]
[ Test 6 ] DELETE /api/todos/<id>/ → [PASS] [PASS]

Results: 14/14 checks passed
*** All tests passed --- Django <-> Supabase integration OK! ***
============================================================
```

---

## 🐍 Django REST Framework API Reference

### Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/users/` | List all users (paginated) |
| `POST` | `/api/users/` | Create a new user |
| `GET` | `/api/users/<id>/` | Retrieve a single user |
| `PUT` / `PATCH` | `/api/users/<id>/` | Update a user |
| `DELETE` | `/api/users/<id>/` | Delete a user |
| `GET` | `/api/products/` | List all products (paginated) |
| `POST` | `/api/products/` | Create a new product |
| `GET` | `/api/products/<id>/` | Retrieve a single product |
| `PUT` / `PATCH` | `/api/products/<id>/` | Update a product |
| `DELETE` | `/api/products/<id>/` | Delete a product |
| `GET` | `/api/todos/` | List all todos (paginated) |
| `POST` | `/api/todos/` | Create a new todo |
| `GET` | `/api/todos/<id>/` | Retrieve a single todo |
| `PUT` / `PATCH` | `/api/todos/<id>/` | Update a todo |
| `DELETE` | `/api/todos/<id>/` | Delete a todo |

### Design Principles

| Principle | Implementation |
| :--- | :--- |
| **No schema conflicts** | All Django models use `managed = False` — Django never creates, alters, or drops Supabase tables |
| **No migrations needed** | `MIGRATION_MODULES = None` for all apps — no `django_migrations` table required |
| **Shared database** | Django reads `DATABASE_URL` from the root `.env` (direct port 5432 connection) |
| **CORS enabled** | `django-cors-headers` allows `localhost:3000` to call DRF endpoints |
| **Browsable API** | DRF's HTML interface available at `http://localhost:8000/api/` in the browser |

---

## 🛠️ Complete CLI Command Reference

### Next.js Commands

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

### Django Commands (run from `backend/`)

| Command | Description |
| :--- | :--- |
| `python manage.py runserver 8000` | Start Django DRF API server on port 8000 |
| `python manage.py check` | Run Django system checks (validates config & models) |
| `python test_api.py` | Run 6-test (14-check) automated CRUD test suite against live server |

---

## 🔐 Authentication Configuration Notes

### Email Verification in Supabase
By default, new Supabase projects enforce email verification:
* When a user registers through `signUp()`, Supabase sends a confirmation email.
* To enable immediate logins without waiting for email verification:
  1. Open your [Supabase Project Dashboard](https://supabase.com/dashboard).
  2. Navigate to **Authentication** → **Providers** → **Email**.
  3. Turn **OFF** the toggle for **Confirm email** and click **Save**.

### Social OAuth Setup
To enable one-click GitHub or Google sign-in:
1. Go to **Authentication** → **Providers** in Supabase.
2. Enable **GitHub** or **Google**, and paste your OAuth Client ID and Secret.
3. Add `http://localhost:3000/auth/callback` to your authorized redirect URIs.

---

## 📄 License
MIT License. Built with Next.js, Supabase, and Django REST Framework.
