# Vector Referral

A comprehensive CRM tool for managing dental and clinical referrals, enabling clinics to efficiently track patient referrals to specialists.

## 🚀 Project Structure

```
dental-referral/
├── frontend/          # Next.js frontend application
├── backend/           # Node.js + Express API
├── shared/            # Shared types and utilities
└── docs/              # Documentation
```

## 📋 Features

- **Multi-tenant Architecture**: Each clinic has isolated data access
- **User Authentication**: Secure email/password authentication with JWT
- **Referral Management**: Create, track, and manage patient referrals
- **Contact Directory**: Maintain a directory of specialist contacts
- **File Management**: Upload and manage referral documents (x-rays, notes)
- **Status Tracking**: Track referral status from draft to completion

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **TailwindCSS** - Utility-first CSS framework
- **Shadcn/ui** - Beautiful, accessible component library

### Backend
- **Node.js + Express** - REST API
- **TypeScript** - Type safety
- **PostgreSQL** - Database
- **Prisma** - ORM for database management
- **JWT** - Authentication

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+ (already installed ✅)
- npm or yarn

### Local Setup (mirrors production: Vercel frontends + Railway backend)

> **Full step-by-step guide:** [docs/LOCAL_SETUP.md](./docs/LOCAL_SETUP.md)

**1. Install dependencies**

```bash
cd dental-referral
npm run install:all
```

**2. Configure environment**

- **Backend:** Copy `backend/.env.example` → `backend/.env` and fill in `DATABASE_URL`, Supabase keys, etc.
- **Frontend (Specialist):** Copy `frontend/.env.example` → `frontend/.env.local` (or use existing)
- **Frontend-GD:** Copy `frontend-gd/.env.example` → `frontend-gd/.env.local` (or use existing)

For local dev, ensure:
- `NEXT_PUBLIC_API_URL=http://localhost:4000` (frontend)
- `NEXT_PUBLIC_API_URL=http://localhost:4000/api/gd` (frontend-gd)

**3. Run everything**

**Option A: All local (fastest iteration)**
```bash
npm run dev
```

**Option B: Backend in Docker (mirrors Railway production)**
```bash
# Terminal 1: Start backend in Docker
npm run dev:backend:docker

# Terminal 2: Start frontends
npm run dev:docker
```

This starts:
- **Backend:** http://localhost:4000 (Docker with hot reload)
- **Specialist Portal:** http://localhost:3000
- **GD Portal:** http://localhost:3001

**4. Run individually**

```bash
npm run dev:backend         # Backend (local)
npm run dev:backend:docker  # Backend (Docker)
npm run dev:frontend       # Specialist portal only
npm run dev:frontend-gd    # GD portal only
```

## 📂 Detailed Structure

### Frontend (`/frontend`)
```
src/
├── app/              # Next.js 14 app directory (routes)
├── components/       # Reusable UI components
├── lib/              # Utilities and helpers
├── hooks/            # Custom React hooks
├── services/         # API service layer
├── types/            # TypeScript type definitions
└── styles/           # Global styles
```

### Backend (`/backend`)
```
src/
├── routes/           # API route definitions
├── controllers/      # Request handlers
├── models/           # Database models (Prisma)
├── middleware/       # Express middleware
├── services/         # Business logic
├── utils/            # Helper functions
└── config/           # Configuration files
```

## 🔄 Development Workflow

### Branches

| Branch | Purpose |
|--------|---------|
| `vector-referral-dev` | Development – work here, test locally |
| `vector-referral` | Production – deploys to Vercel + Railway |

### Flow

1. **Work on** `vector-referral-dev`:
   ```bash
   git checkout vector-referral-dev
   ```

2. **Develop & test locally** (frontend, frontend-gd, backend)

3. **Commit and push**:
   ```bash
   git add .
   git commit -m "feat: your change"
   git push origin vector-referral-dev
   ```

4. **Deploy to production**: Open a PR from `vector-referral-dev` → `vector-referral`, review, and merge. Vercel and Railway deploy from `vector-referral`.

## 📦 Building for Production

```bash
npm run build
```

## 🗺️ Current Status & Roadmap

### ✅ Completed
- **UI/UX Design** - Beautiful dashboard matching design reference
- **Component Library** - All base UI components (Button, Card, Input, etc.)
- **Dashboard Page** - Stats cards, charts, contact list
- **Referrals Page** - List view with filters
- **Contacts Page** - Directory with search
- **Database Schema** - PostgreSQL with 5 tables
- **Backend API** - 15+ endpoints ready
- **Authentication System** - JWT-based (currently disabled for dev)

### 🚧 In Progress
- **Development Mode** - Currently using mock data for quick UI testing
- **Frontend Polish** - Fine-tuning components and interactions

### Phase 2: Connect Real Data
- Enable backend connection
- Switch from mock to real database data
- Enable authentication
- CRUD operations for referrals & contacts

### Phase 3: Advanced Features
- CSV/Excel import for contacts
- File upload for referrals
- Email notifications
- Advanced filters & search
- Reports & analytics

## 📝 License

This project is private and proprietary.

## 👥 Team

R&D Venture Studio

---

For detailed documentation, see the [docs](./docs) directory.
