# 🚀 Quick Start Guide

Get up and running with the Dental Referral Management System in minutes!

## ⚡ Fast Setup (5 Minutes)

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up PostgreSQL Database

```bash
# Create database
createdb dental_referral

# Or using psql
psql
CREATE DATABASE dental_referral;
\q
```

### 3. Configure Backend

```bash
cd backend
```

Create `.env` file:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/dental_referral?schema=public"
JWT_SECRET=your-super-secret-change-this
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
```

**Replace `YOUR_USERNAME` and `YOUR_PASSWORD` with your PostgreSQL credentials!**

### 4. Run Database Migrations

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 5. Start Development Servers

From the root directory:

```bash
npm run dev
```

Or run separately:

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### 6. Open the App

Visit http://localhost:3000 and create your first account!

---

## 📦 What's Included

### ✅ Complete Project Structure
```
dental-referral/
├── frontend/          # Next.js app
├── backend/           # Express API
├── shared/            # Shared types
└── docs/              # Documentation
```

### ✅ Backend Features
- 🔐 JWT Authentication (signup, login)
- 👥 User & Clinic Management
- 📇 Contact Directory (specialists)
- 📋 Referral Management (CRUD)
- 📊 Dashboard Statistics
- 🛡️ Multi-tenant Architecture
- ✅ Input Validation
- 🔒 Role-based Access Control

### ✅ Frontend Features
- 🎨 Modern UI with TailwindCSS
- 🔐 Authentication Flow
- 📱 Responsive Design
- 🎯 TypeScript Type Safety
- 🔄 API Service Layer
- 📊 State Management (Zustand)
- 🎨 Based on your design reference

### ✅ Database
- 📊 PostgreSQL with Prisma ORM
- 🗃️ 5 Tables: Clinic, User, Contact, Referral, ReferralFile
- 🔗 Proper relationships & indexes
- 🚀 Easy migration to Supabase

---

## 🎯 Next Steps

### Phase 1 ✅ (Just Completed!)
- ✅ Authentication system
- ✅ Database setup
- ✅ Basic CRUD operations
- ✅ Dashboard structure

### Phase 2 (Coming Soon)
- [ ] Build UI components based on your design
- [ ] CSV/Excel import for contacts
- [ ] Advanced search and filtering
- [ ] Contact categorization

### Phase 3 (Future)
- [ ] Complete referral creation workflow
- [ ] File upload functionality
- [ ] Status tracking
- [ ] Email notifications

---

## 📚 Documentation

- **[Setup Guide](./docs/SETUP.md)** - Detailed setup instructions
- **[API Documentation](./docs/API.md)** - Complete API reference
- **[Architecture](./docs/ARCHITECTURE.md)** - System design overview

---

## 🔧 Useful Commands

```bash
# Root (run both servers)
npm run dev

# Backend
cd backend
npm run dev                # Start dev server
npm run prisma:studio      # Open database GUI
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate     # Run migrations

# Frontend
cd frontend
npm run dev                # Start dev server
npm run build              # Build for production
npm run lint               # Run linter
```

---

## 🆘 Troubleshooting

### Can't connect to database?
- Ensure PostgreSQL is running: `brew services start postgresql` (macOS)
- Check your `DATABASE_URL` in `backend/.env`
- Verify database exists: `psql -l`

### Port already in use?
- Change ports in `.env` files
- Or kill the process: `lsof -ti:3000 | xargs kill -9`

### Prisma errors?
- Run `npm run prisma:generate` in backend folder
- Check that `DATABASE_URL` is correct

---

## 💡 Tips

1. **Use Prisma Studio** to view/edit database: `npm run prisma:studio`
2. **Check API health**: http://localhost:5000/api/health
3. **Frontend hot reload** works automatically
4. **Backend auto-restarts** when you save files

---

## 🌟 Ready to Build the UI?

The project structure is ready! Now you can start building beautiful UI components based on your design reference.

**Shall we start with the Dashboard UI next?** 🎨

