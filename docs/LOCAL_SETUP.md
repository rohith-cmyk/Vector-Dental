# Local Setup Guide – Vector Referral

Run the full stack locally (backend + Specialist portal + GD portal), mirroring production.

---

## ⚠️ Database Safety – Never Erase Data

**Never run commands that reset, drop, or erase the database.** Production data must always be preserved.

- **Never** run `prisma migrate reset` or accept "reset" when Prisma asks
- **Never** run `prisma db push --force-reset` or similar destructive commands
- If Prisma reports "drift" and asks to reset, **always choose N (No)**
- To sync schema safely: use `prisma db pull` then `prisma generate`

---

## Prerequisites

- **Node.js 18+**
- **npm**
- **Docker** (optional – for backend in Docker)
- **Supabase project** (for database and auth)

---

## Step 1: Clone and install

```bash
cd dental-referral
npm run install:all
```

---

## Step 2: Configure environment

### Backend (`backend/.env`)

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and set at least:

| Variable | Local value |
|----------|-------------|
| `DATABASE_URL` | Supabase connection string (Project Settings → Database) |
| `DIRECT_URL` | Same as above (or pooler URL) |
| `SUPABASE_URL` | `https://your-project.supabase.co` |
| `SUPABASE_ANON_KEY` | From Supabase Dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | From Supabase Dashboard |
| `JWT_SECRET` | Any string (e.g. `openssl rand -base64 32`) |
| `CORS_ORIGIN` | `http://localhost:3000,http://localhost:3001` |
| `SPECIALIST_PORTAL_URL` | `http://localhost:3000` |

### Frontend – Specialist (`frontend/.env.local`)

```bash
cp frontend/.env.example frontend/.env.local
```

Set:

```
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_GD_PORTAL_URL=http://localhost:3001
```

### Frontend – GD (`frontend-gd/.env.local`)

```bash
cp frontend-gd/.env.example frontend-gd/.env.local
```

Set:

```
NEXT_PUBLIC_API_URL=http://localhost:4000/api/gd
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## Step 3: Run the app

### Option A: All local (simplest)

```bash
npm run dev
```

Opens:

- **Backend:** http://localhost:4000  
- **Specialist Portal:** http://localhost:3000  
- **GD Portal:** http://localhost:3001  

---

### Option B: Backend in Docker (closer to production)

**Terminal 1 – backend:**
```bash
npm run dev:backend:docker
```

**Terminal 2 – frontends:**
```bash
npm run dev:docker
```

Same URLs as above.

---

## Step 4: Database schema (first time or after schema changes)

**If the database already has data (e.g. production):** Sync schema without touching data:

```bash
cd backend
npx prisma db pull    # Updates schema.prisma to match the database
npx prisma generate   # Regenerates Prisma Client
```

**If Prisma reports "drift" and asks to reset:** Always choose **N (No)**. Then run `prisma db pull` and `prisma generate` as above.

**Only for a brand-new empty database:** You may run `npx prisma migrate dev` to apply migrations. Never do this if the database has existing data.

---

## Quick reference

| Command | What it does |
|---------|---------------|
| `npm run dev` | Backend + both frontends (all local) |
| `npm run dev:backend:docker` | Backend in Docker only |
| `npm run dev:docker` | Both frontends only |
| `npm run dev:backend` | Backend only (local) |
| `npm run dev:frontend` | Specialist portal only |
| `npm run dev:frontend-gd` | GD portal only |

---

## Troubleshooting

**Port already in use**  
Stop other processes using 3000, 3001, or 4000, or run only the services you need.

**Database connection failed**  
Check `DATABASE_URL` and `DIRECT_URL` in `backend/.env`. Use the Supabase connection string from Project Settings → Database.

**CORS errors**  
Ensure `CORS_ORIGIN` in `backend/.env` includes `http://localhost:3000` and `http://localhost:3001`.

**Prisma "drift detected" or "reset" prompt**  
Choose **N (No)**. Never reset. Run `npx prisma db pull` then `npx prisma generate` to sync safely.
