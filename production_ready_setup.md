# Production Ready Setup Guide

This document outlines the plan to make the dental-referral application production-ready. It covers the current setup, gaps, and a phased approach to deployment.

---

## Current Setup

### Architecture Overview

| Component | Tech | Port | Purpose |
|-----------|------|------|---------|
| **Backend** | Express + Prisma + Supabase | 4000 | API for both portals |
| **Frontend (Specialist Portal)** | Next.js 14 | 3000 (default) | Specialists (referral recipients) |
| **Frontend-GD** | Next.js 16 | 3000 (default) | General Dentists (referral senders) |

### API Structure

- **Specialist Portal** → `http://localhost:4000/api` (auth, referrals, contacts, specialist-profiles, etc.)
- **GD Portal** → `http://localhost:4000/api/gd` (auth, dashboard, specialists, referrals, notifications)

### External Dependencies

- **PostgreSQL** (via Prisma) – main database
- **Supabase** – auth (OAuth), file storage (logos, referral files)
- **Resend / SMTP** – email
- **Twilio** – SMS

### Current Configuration

- **Backend**: `.env` with `PORT`, `DATABASE_URL`, `CORS_ORIGIN`, JWT, Supabase, SMTP, Twilio
- **Frontends**: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SUPABASE_*` in `.env.local`
- **CORS**: Allows `localhost:*` + single `CORS_ORIGIN` (e.g. `http://localhost:3000`)
- **File uploads**: Local `uploads/` directory in dev only; production path undefined
- **No Docker**: No Dockerfile or docker-compose
- **No `.env.example`**: Environment variables not documented

---

## Production Readiness Gaps

### 1. Environment & Configuration

- Hardcoded `localhost` fallbacks in frontends
- Inconsistent defaults (e.g. `constants/index.ts` uses `3001`, `lib/api.ts` uses `4000`)
- No `.env.example` files for each app
- `JWT_SECRET` has a dev fallback; must be required in production

### 2. CORS

- Only `localhost` and one `CORS_ORIGIN` supported
- Production needs multiple origins (specialist portal, GD portal, referral magic links)

### 3. File Storage

- Dev uses local `uploads/`; production should use Supabase (or S3) exclusively
- Need clear production storage strategy

### 4. Ports & Networking

- Apps run on raw ports; production typically needs:
  - Reverse proxy (nginx, Caddy, Traefik) for HTTPS and routing
  - Single entry point (e.g. `app.example.com`, `gd.example.com`)

### 5. Database

- Prisma migrations exist, but:
  - No production migration strategy (e.g. `prisma migrate deploy`)
  - Connection pooling (e.g. PgBouncer) not configured
  - No backup/restore process

### 6. Security

- Debug routes (`/api/debug/*`) should be disabled or removed in production
- Rate limiting not visible
- No explicit security headers (CSP, HSTS, etc.)

### 7. Observability

- No health check endpoint
- No structured logging
- No monitoring/alerting

---

## Production Roadmap

### Phase 1: Docker & Orchestration ✅

1. **Dockerfiles** (implemented)
   - `backend/Dockerfile` – Node 20 Alpine, Prisma generate, TypeScript build
   - `frontend/Dockerfile` – Next.js standalone output
   - `frontend-gd/Dockerfile` – Next.js standalone output

2. **docker-compose** (implemented)
   - Services: `backend`, `frontend`, `frontend-gd`
   - Env via `backend/.env` and root `.env` for frontend build args
   - Volume `backend-uploads` for file uploads

3. **Port mapping**
   - Backend: 4000
   - Specialist: 3000
   - GD: 3001

**Usage:**
```bash
# 1. Ensure backend/.env has DATABASE_URL, CORS_ORIGIN (include http://localhost:3000,http://localhost:3001)
# 2. Ensure frontend-gd/.env.local and frontend/.env.local have Supabase vars (for build args)
# 3. Run via script (loads .env.local for build) or manually:
./scripts/docker-build.sh
# Or: export $(grep -v '^#' frontend-gd/.env.local | xargs) && docker compose up --build
```

### Phase 2: Environment & Config ✅

1. **`.env.example`** per app (implemented)
   - `backend/.env.example` – server, DB, JWT, Supabase, CORS, email, SMS
   - `frontend/.env.example` – API URL, Supabase, GD portal URL
   - `frontend-gd/.env.example` – API URL, Supabase

2. **Production checklist**
   - `NODE_ENV=production`
   - `DATABASE_URL` – production DB connection
   - `CORS_ORIGIN` – comma-separated production URLs (e.g. `https://app.yourdomain.com,https://gd.yourdomain.com`)
   - `JWT_SECRET` – strong secret (e.g. `openssl rand -base64 32`), no dev fallbacks
   - Supabase prod project keys

3. **Frontend build-time vars**
   - `NEXT_PUBLIC_API_URL` – backend URL (e.g. `https://api.yourdomain.com`)
   - `NEXT_PUBLIC_SUPABASE_*` – prod Supabase project

**Setup:** Copy each `.env.example` to `.env` or `.env.local` and fill in values.

### Phase 3: Reverse Proxy & HTTPS ✅

1. **Caddy** (implemented)
   - `Caddyfile` – reverse proxy config
   - `caddy.env` – domain config (API_DOMAIN, APP_DOMAIN, GD_DOMAIN)
   - Routes: api.localhost → backend, app.localhost → specialist, gd.localhost → GD portal

2. **Local:** Uses `.localhost` domains with automatic HTTPS (self-signed)

3. **Production:** Update `caddy.env` with real domains; Caddy auto-provisions Let's Encrypt SSL

**Usage:** Caddy runs alongside other services. Access via:
- http://app.localhost (or https:// – Caddy uses HTTPS for .localhost)
- http://gd.localhost
- http://api.localhost

**Note:** When using Caddy, rebuild frontends with `NEXT_PUBLIC_API_URL=https://api.localhost` (or your production API domain).

### Phase 4: Database & Storage ✅

1. **PostgreSQL** (implemented)
   - Managed DB via Supabase with connection pooler
   - `prisma migrate deploy` run; add to CI/CD or startup
   - `directUrl` in schema for migrations
2. **File storage** (implemented)
   - Supabase Storage used in production (`NODE_ENV=production`)
   - Local `uploads/` used in development
   - Bucket `referral-files` created automatically on startup
   - Set `USE_SUPABASE_STORAGE=true` to test Supabase in dev

### Phase 5: Security & Hardening

1. **Debug routes** ✅ – Removed `debug.routes.ts` (was never mounted)
2. **Rate limiting** ✅ – `express-rate-limit` (see [Rate Limiting](#rate-limiting) below)
3. **Security headers** ✅ – Helmet middleware (see [Security Headers](#security-headers) below)
4. **CORS hardening** ✅ – Production allows only CORS_ORIGIN; localhost only in dev (see below)

---

#### Rate Limiting

**What it is:** Rate limiting restricts how many requests a client (IP, user, etc.) can make to your API in a given time window (e.g. 100 requests per 15 minutes).

**Why it matters:**
- **Brute force protection** – Limits login attempts (e.g. password guessing)
- **DDoS mitigation** – Reduces impact of traffic floods
- **Abuse prevention** – Stops scrapers, bots, or single users overloading the server
- **Cost control** – Keeps DB/API usage predictable

**How it works:**
- Middleware tracks requests per identifier (usually IP)
- When limit is exceeded, returns `429 Too Many Requests`
- Window resets after the time period (e.g. 15 min)

**Typical limits:**
- **General API:** 100–200 requests / 15 min per IP
- **Auth endpoints:** Stricter (e.g. 5 login attempts / 15 min)
- **Public forms:** Moderate (e.g. 10 submissions / hour)

**Implementation:** Use `express-rate-limit` – global limit for all routes, optional stricter limits for auth/public endpoints.

**Implemented (Phase 5):**
- `backend/src/middleware/rate-limit.middleware.ts` – three limiters
- **Auth** (`/api/auth`, `/api/gd/auth`): 10 req/15 min (config: `RATE_LIMIT_AUTH_MAX`)
- **Public** (`/api/public`): 30 req/15 min (config: `RATE_LIMIT_PUBLIC_MAX`)
- **General** (all `/api`): 100 req/15 min (config: `RATE_LIMIT_GENERAL_MAX`)
- Active only in production (`NODE_ENV=production`); skipped in development

---

#### Security Headers

**What they are:** HTTP response headers that instruct browsers to enforce security policies (e.g. X-Content-Type-Options, X-Frame-Options, HSTS).

**Implemented (Phase 5):**
- `helmet` middleware in `backend/src/index.ts`
- Active only in production
- Sets: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Strict-Transport-Security, etc.
- `contentSecurityPolicy: false` – API returns JSON, not HTML; CSP not needed
- `crossOriginEmbedderPolicy: false` – Allow cross-origin requests from frontend

---

#### CORS Hardening

**What it does:** In production, only origins listed in `CORS_ORIGIN` are allowed. No automatic localhost.

**Implemented (Phase 5):**
- **Development:** localhost + `CORS_ORIGIN` allowed
- **Production:** only `CORS_ORIGIN` allowed (no localhost unless listed)
- When you add production domains, set `CORS_ORIGIN=https://app.yourdomain.com,https://gd.yourdomain.com` in `backend/.env`
- For now, keep `localhost` in `CORS_ORIGIN` for Docker/local testing with production build

### Phase 6: Observability ✅

1. **Health endpoint** ✅ – `GET /health` and `GET /api/health` with DB check (see below)
2. **Structured logging** ✅ – Pino (see below)
3. Optional: APM (e.g. Sentry, Datadog) – deferred

---

#### Phase 6 Explained: Observability

**What is observability?** The ability to understand what your system is doing and why—through logs, metrics, and health checks. When something breaks, you can quickly see what happened.

---

**1. Health endpoint (`GET /api/health`)**

**What it is:** A simple API route that returns whether the service is running and can reach its dependencies (e.g. database).

**Why it matters:**
- **Load balancers** – Use it to decide if a server should receive traffic
- **Kubernetes/Docker** – Use it for liveness/readiness probes
- **Monitoring** – Uptime checks (e.g. UptimeRobot) hit it every few minutes
- **Debugging** – Quick way to confirm the API is up

**What it should return:**
- `200` if healthy
- `503` if unhealthy (e.g. DB down)
- JSON with status, timestamp, and optionally DB/Supabase connectivity

**Implemented (Phase 6):**
- `GET /health` (root, no rate limit) – for load balancers, Docker, K8s
- `GET /api/health` (same handler)
- Returns `200` + `{ status: 'healthy', checks: { database } }` when DB is reachable
- Returns `503` + `{ status: 'unhealthy' }` when DB fails

---

**2. Structured logging (Pino, Winston)**

**What it is:** Logging that outputs JSON instead of plain text, with consistent fields (level, timestamp, message, requestId, etc.).

**Why it matters:**
- **Searchable** – Log aggregators (Datadog, CloudWatch, etc.) can filter by level, route, user
- **Machine-readable** – Easy to parse and alert on
- **Context** – Each log includes request ID, user, route, duration

**Example – current (console.log):**
```
User logged in
```

**Example – structured (JSON):**
```json
{"level":"info","time":1234567890,"msg":"User logged in","userId":"abc-123","route":"/api/auth/login","duration":45}
```

**Implemented (Phase 6):**
- `backend/src/utils/logger.ts` – Pino logger
- Dev: pretty-printed, colorized
- Prod: JSON output for log aggregators
- Config: `LOG_LEVEL` (default: `info` in prod, `debug` in dev)
- Used in: index.ts, database.ts, storage-setup.ts, health.controller.ts

---

**3. APM (Application Performance Monitoring) – Optional**

**What it is:** Tools like Sentry or Datadog that track errors, performance, and user flows.

**Why it matters:**
- **Error tracking** – Get notified when exceptions occur, with stack traces
- **Performance** – See slow endpoints, DB queries
- **User impact** – Know how many users hit an error

**Examples:** Sentry (errors), Datadog (metrics + logs + traces), New Relic.

**Current state:** Not implemented; can be added later when needed.

---

## Deployment Options

| Option | Pros | Cons |
|--------|------|------|
| **Vercel (frontends) + Railway (backend)** | Simple, great DX, auto HTTPS | Multiple platforms, env sync |
| **Single VPS + Docker Compose** | Full control, one place | You manage infra, backups, SSL |
| **Kubernetes (GKE, EKS)** | Scalable, flexible | Overkill for current size |
| **Fly.io / Render** | Docker-native, simple | Less control than VPS |

---

## Deployment Steps (Vercel + Railway)

Use this flow when deploying frontends to Vercel and the backend to Railway.

> **Troubleshooting:** If you hit deployment errors, see [docs/RAILWAY_DEPLOYMENT.md](docs/RAILWAY_DEPLOYMENT.md) for a step-by-step fix guide.

### 1. Deploy Backend to Railway

1. **Create a Railway project** at [railway.app/new](https://railway.app/new).
2. **Deploy from GitHub** – select your repo and choose **Deploy from GitHub repo**.
3. **Set Root Directory** – in the service **Settings** → **Source**, set **Root Directory** to `backend`. (Required: without this, the Dockerfile cannot find `package.json` and the build fails with `"/package.json": not found`.)
4. **Set Dockerfile Path** – in **Settings** → **Build**, set **Dockerfile Path** to `Dockerfile` (not `/backend/Dockerfile`). When Root Directory is `backend`, the path is relative to that folder.
5. **Configure environment variables** – in **Variables**, add:

   | Variable | Value |
   |----------|-------|
   | `NODE_ENV` | `production` |
   | `DATABASE_URL` | Your Supabase pooler URL |
   | `DIRECT_URL` | Your Supabase direct URL (for migrations) |
   | `JWT_SECRET` | Strong secret (`openssl rand -base64 32`) |
   | `CORS_ORIGIN` | `https://your-specialist-app.vercel.app,https://your-gd-app.vercel.app` (see step 2) |
   | `GD_PORTAL_URL` | `https://your-gd-app.vercel.app` (single URL for referral links; do NOT use CORS_ORIGIN) |
   | `SUPABASE_URL` | From Supabase Dashboard |
   | `SUPABASE_ANON_KEY` | From Supabase Dashboard |
   | `SUPABASE_SERVICE_ROLE_KEY` | From Supabase Dashboard |
   | `SUPABASE_STORAGE_BUCKET` | `referral-files` |
   | *(Optional)* `RESEND_API_KEY`, `TWILIO_*`, `SMTP_*` | For email/SMS |

6. **Generate domain** – **Settings** → **Networking** → **Generate Domain**. Note the URL (e.g. `https://dental-referral-backend.up.railway.app`).
7. **Run migrations** – either:
   - **CLI:** `cd backend && railway run npx prisma migrate deploy`
   - **Or** add a one-off deploy script / GitHub Action that runs migrations before deploy.

### 2. Deploy Frontends to Vercel

**Specialist Portal (frontend):**

1. Import the repo at [vercel.com/new](https://vercel.com/new).
2. Set **Root Directory** to `frontend`.
3. Add environment variables:

   | Variable | Value |
   |----------|-------|
   | `NEXT_PUBLIC_API_URL` | `https://your-backend.up.railway.app` |
   | `NEXT_PUBLIC_SUPABASE_URL` | From Supabase Dashboard |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | From Supabase Dashboard |
   | `NEXT_PUBLIC_GD_PORTAL_URL` | `https://your-gd-app.vercel.app` |

4. Deploy. Note the URL (e.g. `https://dental-referral-specialist.vercel.app`).

**GD Portal (frontend-gd):**

1. Create a **second** Vercel project for the same repo (or use a monorepo setup).
2. Set **Root Directory** to `frontend-gd`.
3. Add environment variables:

   | Variable | Value |
   |----------|-------|
   | `NEXT_PUBLIC_API_URL` | `https://your-backend.up.railway.app/api/gd` |
   | `NEXT_PUBLIC_SUPABASE_URL` | From Supabase Dashboard |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | From Supabase Dashboard |

4. Deploy. Note the URL (e.g. `https://dental-referral-gd.vercel.app`).

### 3. Update CORS and Redeploy Backend

After both frontends are live, set `CORS_ORIGIN` on Railway to your actual Vercel URLs (comma-separated, no trailing slashes):

```
CORS_ORIGIN=https://dental-referral-specialist.vercel.app,https://dental-referral-gd.vercel.app
```

If you add custom domains later (e.g. `app.yourdomain.com`, `gd.yourdomain.com`), add them to `CORS_ORIGIN` as well.

### 4. Custom Domains (Optional)

- **Vercel:** Add domains in Project Settings → Domains.
- **Railway:** Add a custom domain in Settings → Networking.
- Update `NEXT_PUBLIC_API_URL` and `CORS_ORIGIN` to use the new domains.

### 5. Verify

- Specialist portal: `https://your-specialist-app.vercel.app`
- GD portal: `https://your-gd-app.vercel.app`
- API health: `https://your-backend.up.railway.app/health`

### Railway Monorepo Notes

- **Watch Paths:** In Railway service settings, set **Watch Paths** to `backend/**` so only backend changes trigger rebuilds.
- **Build:** Railway auto-detects Node.js and runs `npm install` and `npm run build` (from `package.json`). The `start` script is used to run the app.
- **Port:** Railway sets `PORT`; the backend already uses `process.env.PORT`.

---

## Deployment Steps (VPS + Docker Compose)

When you have production domains (e.g. `app.yourdomain.com`, `gd.yourdomain.com`, `api.yourdomain.com`):

### 1. Provision a VPS

- **Provider:** DigitalOcean, Linode, AWS EC2, etc.
- **Specs:** 2GB RAM, 1 vCPU minimum
- **OS:** Ubuntu 22.04 LTS
- **Open ports:** 80, 443 (for Caddy)

### 2. Install Docker

```bash
# On Ubuntu
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# Log out and back in
```

### 3. Clone repo and set env

```bash
git clone <your-repo> dental-referral && cd dental-referral
```

### 4. Configure production env

**`caddy.env`** – set your domains:
```
API_DOMAIN=api.yourdomain.com
APP_DOMAIN=app.yourdomain.com
GD_DOMAIN=gd.yourdomain.com
```

**`backend/.env`** – production values:
- `NODE_ENV=production`
- `DATABASE_URL` – Supabase pooler (already set)
- `CORS_ORIGIN=https://app.yourdomain.com,https://gd.yourdomain.com` (no localhost)
- `JWT_SECRET` – strong secret
- `SUPABASE_*` – production keys

**DNS:** Point `api.yourdomain.com`, `app.yourdomain.com`, `gd.yourdomain.com` to your VPS IP.

### 5. Build and run

```bash
# Build frontends with production API URL
export NEXT_PUBLIC_API_URL=https://api.yourdomain.com
./scripts/docker-build.sh -d
```

Or with env file:
```bash
echo "NEXT_PUBLIC_API_URL=https://api.yourdomain.com" >> .env
./scripts/docker-build.sh -d
```

### 6. Run migrations (if not done)

```bash
cd backend && npx prisma migrate deploy
```

### 7. Verify

- https://app.yourdomain.com – Specialist portal
- https://gd.yourdomain.com – GD portal
- https://api.yourdomain.com/health – Health check

### 8. Optional: CI/CD

- GitHub Actions to build and deploy on push
- Or manual `git pull && docker compose up -d --build`

---

## Suggested Order of Execution

1. Add `.env.example` files and document env vars
2. Fix API URL defaults and CORS for production origins
3. Add Dockerfiles and docker-compose for local parity
4. Add health check endpoint
5. Choose hosting:
   - **Vercel + Railway:** Follow [Deployment Steps (Vercel + Railway)](#deployment-steps-vercel--railway) above
   - **VPS:** Set up reverse proxy + HTTPS per [Deployment Steps (VPS + Docker Compose)](#deployment-steps-vps--docker-compose)
6. Move file storage fully to Supabase for production
7. Harden security (debug routes, rate limiting, headers)
