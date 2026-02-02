# Vector Dental

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

### Quick Start (Development Mode)

**Frontend is ready to go with mock data!**

```bash
cd "/Users/rohithperumandla/R&D venture Studio/code/dental-referral/frontend"
npm run dev
```

Then open: **http://localhost:3000** 🎉

> **Note**: Authentication is currently disabled for development. The dashboard loads directly with mock data.

### Full Setup (With Backend & Database)

1. **Install dependencies**
   ```bash
   cd "/Users/rohithperumandla/R&D venture Studio/code/dental-referral"
   npm install
   ```

2. **Database is already set up** ✅
   - PostgreSQL installed and running
   - Database `dental_referral` created
   - All tables migrated

3. **Run backend server** (in a new terminal)
   ```bash
   cd "/Users/rohithperumandla/R&D venture Studio/code/dental-referral/backend"
   npm run dev
   ```

4. **Run frontend server** (in another terminal)
   ```bash
   cd "/Users/rohithperumandla/R&D venture Studio/code/dental-referral/frontend"
   npm run dev
   ```

   This will start:
   - Frontend: http://localhost:3000 ✅
   - Backend: http://localhost:5000

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

1. Make changes to the code
2. The dev servers will automatically reload
3. Run tests before committing
4. Create a pull request for review

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
