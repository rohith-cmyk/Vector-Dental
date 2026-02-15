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

### Phase 1: Docker & Orchestration

1. **Dockerfiles**
   - Backend: Node image, build TS, run `node dist/index.js`
   - Frontend (specialist): multi-stage build (build → `node` or static export)
   - Frontend-GD: same pattern

2. **docker-compose**
   - Services: `backend`, `frontend`, `frontend-gd`
   - Optional: `postgres` for local/staging
   - Env via `.env` files (not committed)
   - Volumes for uploads only if you keep local storage (prefer Supabase in prod)

3. **Port mapping**
   - Backend: 4000
   - Specialist: 3000
   - GD: 3001 (or different hostnames)

### Phase 2: Environment & Config

1. **`.env.example`** per app with all required vars
2. **Production env**
   - `NODE_ENV=production`
   - `DATABASE_URL` (prod DB)
   - `CORS_ORIGIN` = comma-separated production URLs
   - Strong `JWT_SECRET`, no fallbacks
   - Supabase prod project keys
3. **Frontend build-time vars**
   - `NEXT_PUBLIC_API_URL` = backend URL (e.g. `https://api.yourdomain.com`)
   - `NEXT_PUBLIC_SUPABASE_*` = prod Supabase project

### Phase 3: Reverse Proxy & HTTPS

1. **Nginx / Caddy / Traefik**
   - Terminate HTTPS
   - Route:
     - `api.yourdomain.com` → backend:4000
     - `app.yourdomain.com` → specialist frontend:3000
     - `gd.yourdomain.com` → GD frontend:3001
2. **SSL**: Let's Encrypt or cloud provider certs

### Phase 4: Database & Storage

1. **PostgreSQL**
   - Managed DB (Supabase, Neon, RDS, etc.) or self-hosted
   - Run `prisma migrate deploy` in CI/CD or startup
   - Connection pooling if needed
2. **File storage**
   - Use Supabase Storage for all uploads in production
   - Remove or gate local `uploads/` usage

### Phase 5: Security & Hardening

1. Disable or remove debug routes in production
2. Add rate limiting (e.g. `express-rate-limit`)
3. Security headers (helmet or equivalent)
4. Ensure CORS only allows production origins

### Phase 6: Observability

1. Health endpoint: e.g. `GET /api/health` (DB + optional external checks)
2. Structured logging (e.g. Pino, Winston)
3. Optional: APM (e.g. Sentry, Datadog)

---

## Deployment Options

| Option | Pros | Cons |
|--------|------|------|
| **Vercel (frontends) + Railway/Render (backend)** | Simple, great DX | Multiple platforms, env sync |
| **Single VPS + Docker Compose** | Full control, one place | You manage infra, backups, SSL |
| **Kubernetes (GKE, EKS)** | Scalable, flexible | Overkill for current size |
| **Fly.io / Render** | Docker-native, simple | Less control than VPS |

---

## Suggested Order of Execution

1. Add `.env.example` files and document env vars
2. Fix API URL defaults and CORS for production origins
3. Add Dockerfiles and docker-compose for local parity
4. Add health check endpoint
5. Choose hosting and set up reverse proxy + HTTPS
6. Move file storage fully to Supabase for production
7. Harden security (debug routes, rate limiting, headers)
