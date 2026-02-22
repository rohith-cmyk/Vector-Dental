# Railway Deployment Guide – dental-referral Backend

This guide helps you fix common Railway deployment errors for the dental-referral backend.

## Quick Fix Checklist

If your deployment is failing, apply these changes in Railway:

| Setting | Current (Wrong) | Correct |
|---------|-----------------|---------|
| **Source → Root Directory** | Not set / empty | `backend` |
| **Build → Dockerfile Path** | `/backend/Dockerfile` | `Dockerfile` |
| **Variables → NEXT_PUBLIC_*** | These are for frontend only | Remove; backend uses different vars (see below) |

---

## 1. Source Settings (Critical)

**Root Directory must be set to `backend`.**

Without this, Railway uses the repo root as the build context. The backend Dockerfile expects `package.json` in the build context, but it lives in `backend/`, so the build fails with:

```
"/package.json": not found
```

**Steps:**
1. Go to **Settings** → **Source**
2. Click **Add Root Directory**
3. Enter: `backend`
4. Save

---

## 2. Build Settings

**Dockerfile Path:** When Root Directory is `backend`, Railway’s working directory is already `backend/`. The Dockerfile path must be relative to that:

- Use: `Dockerfile` (or `./Dockerfile`)
- Do not use: `/backend/Dockerfile` (that path is from the repo root)

**Steps:**
1. Go to **Settings** → **Build**
2. Set **Dockerfile Path** to: `Dockerfile`
3. Save

---

## 3. Environment Variables

The backend does **not** use `NEXT_PUBLIC_*` variables. Those are for the Next.js frontends.

Add these variables in **Variables**:

| Variable | Required | Value |
|----------|----------|-------|
| `NODE_ENV` | Yes | `production` |
| `DATABASE_URL` | Yes | Supabase connection pooler URL |
| `DIRECT_URL` | Yes | Supabase direct connection URL |
| `JWT_SECRET` | Yes | `openssl rand -base64 32` |
| `SUPABASE_URL` | Yes | From Supabase Dashboard → Project Settings → API |
| `SUPABASE_ANON_KEY` | Yes | From Supabase Dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | From Supabase Dashboard |
| `SUPABASE_STORAGE_BUCKET` | Yes | `referral-files` |
| `CORS_ORIGIN` | Yes | Comma-separated frontend URLs (no trailing slashes) |

**Example CORS_ORIGIN** (adjust to your frontend URLs):
```
CORS_ORIGIN=https://your-specialist-app.vercel.app,https://your-gd-app.vercel.app
```

During initial setup, you can use:
```
CORS_ORIGIN=*
```
Then tighten it once frontends are deployed.

**Raw Editor format:** Each variable on its own line. Do not use literal `\n` in a single line:
```
NODE_ENV=production
DATABASE_URL=postgresql://...
```

---

## 4. Networking

1. Go to **Settings** → **Networking**
2. Click **Generate Domain** to get a public URL (e.g. `https://dental-referral-production.up.railway.app`)
3. Use this URL as your backend API base (e.g. for `NEXT_PUBLIC_API_URL` in frontends)

**“Failed to get private network endpoint”** – This is often transient. If the build succeeds and the service runs, you can ignore it for now. If it persists, check Railway status or support.

---

## 5. Deploy Settings

The backend Dockerfile already defines `CMD ["node", "dist/index.js"]`, so no custom start command is needed.

**Healthcheck (optional):** Add `/health` as the healthcheck path so Railway can verify the service is up.

---

## 6. Run Database Migrations

After the first successful deploy:

```bash
cd backend
railway link   # Link to your Railway project
railway run npx prisma migrate deploy
```

---

## 7. Verify Deployment

1. Open your Railway domain (e.g. `https://your-app.up.railway.app`)
2. Check `/health` – should return `{"status":"ok"}`
3. Check `/health/ready` – should return DB connectivity status

---

## Common Errors and Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `"/package.json": not found` | Root Directory not set | Set Root Directory to `backend` |
| Build fails on `COPY` | Wrong build context | Set Root Directory to `backend` and Dockerfile path to `Dockerfile` |
| App crashes on startup | Missing env vars | Add `DATABASE_URL`, `JWT_SECRET`, `SUPABASE_*` |
| CORS errors from frontend | Wrong `CORS_ORIGIN` | Add your frontend URLs to `CORS_ORIGIN` |
| `NEXT_PUBLIC_*` in suggested vars | Railway scanning full repo | Ignore for backend; use backend vars above |
