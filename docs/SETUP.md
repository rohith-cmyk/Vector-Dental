# Setup Guide

This guide will help you set up the Dental Referral Management System for local development.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18 or higher ([Download](https://nodejs.org/))
- **PostgreSQL** 14 or higher ([Download](https://www.postgresql.org/download/))
- **npm** or **yarn** package manager
- **Git** for version control

## Initial Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd dental-referral
```

### 2. Install Dependencies

Install dependencies for all packages:

```bash
npm install
```

This will install dependencies for the root project, frontend, backend, and shared packages.

## Database Setup

### 1. Create PostgreSQL Database

Open PostgreSQL and create a new database:

```sql
CREATE DATABASE dental_referral;
```

Or use the command line:

```bash
createdb dental_referral
```

### 2. Configure Environment Variables

#### Backend Configuration

Create a `.env` file in the `backend/` directory:

```bash
cd backend
cp .env.example .env
```

Edit the `.env` file with your database credentials:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/dental_referral?schema=public"

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

**Important:** Replace `YOUR_USERNAME` and `YOUR_PASSWORD` with your actual PostgreSQL credentials.

#### Frontend Configuration

Create a `.env.local` file in the `frontend/` directory:

```bash
cd frontend
```

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=Dental Referral System
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run Database Migrations

From the `backend/` directory:

```bash
cd backend

# Generate Prisma Client
npm run prisma:generate

# Run migrations to create database tables
npm run prisma:migrate
```

This will create all necessary tables in your database.

### 4. (Optional) View Database

To view your database with Prisma Studio:

```bash
npm run prisma:studio
```

This will open a visual database editor in your browser.

## Running the Application

### Option 1: Run Everything at Once

From the root directory:

```bash
npm run dev
```

This will start both the frontend and backend servers concurrently.

### Option 2: Run Separately

**Backend Server:**
```bash
cd backend
npm run dev
```

The API will be available at http://localhost:5000

**Frontend Server:**
```bash
cd frontend
npm run dev
```

The app will be available at http://localhost:3000

## Verify Setup

1. Open http://localhost:3000 in your browser
2. You should see the login/signup page
3. Create a new account to test the application
4. The backend API health check is available at http://localhost:5000/api/health

## Common Issues

### Database Connection Error

**Error:** `Can't reach database server`

**Solution:**
- Ensure PostgreSQL is running
- Verify your `DATABASE_URL` in `backend/.env` is correct
- Check that the database exists: `psql -l` (should list `dental_referral`)

### Port Already in Use

**Error:** `Port 3000/5000 is already in use`

**Solution:**
- Change the port in the respective `.env` file
- Or kill the process using the port:
  ```bash
  # macOS/Linux
  lsof -ti:3000 | xargs kill -9
  lsof -ti:5000 | xargs kill -9
  
  # Windows
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F
  ```

### Prisma Client Not Generated

**Error:** `@prisma/client did not initialize yet`

**Solution:**
```bash
cd backend
npm run prisma:generate
```

## Next Steps

- Read the [API Documentation](./API.md)
- Learn about the [Architecture](./ARCHITECTURE.md)
- Check out the [Development Guide](./DEVELOPMENT.md)

## Migration to Supabase

When you're ready to use Supabase instead of local PostgreSQL:

1. Create a Supabase project at https://supabase.com
2. Copy your Supabase database connection string
3. Update `DATABASE_URL` in `backend/.env` with the Supabase connection string
4. Run migrations: `npm run prisma:migrate`
5. That's it! No code changes needed 🎉

