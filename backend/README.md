# Dental Referral Backend

Express.js + TypeScript + PostgreSQL + Prisma backend API for the Dental Referral Management System.

## Tech Stack

- **Node.js + Express** - REST API framework
- **TypeScript** - Type safety
- **PostgreSQL** - Database
- **Prisma** - ORM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Update database connection string and secrets

3. Set up database:
   ```bash
   # Generate Prisma client
   npm run prisma:generate

   # Run migrations
   npm run prisma:migrate

   # (Optional) Open Prisma Studio to view database
   npm run prisma:studio
   ```

4. Run development server:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:5000`

## Project Structure

```
src/
├── routes/           # API route definitions
├── controllers/      # Request handlers and business logic
├── middleware/       # Express middleware (auth, validation, error handling)
├── services/         # Business services
├── utils/            # Helper functions
├── config/           # Configuration files
└── index.ts          # Application entry point

prisma/
├── schema.prisma     # Database schema
└── migrations/       # Database migrations
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user and clinic
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Contacts
- `GET /api/contacts` - Get all contacts (with pagination, search, filters)
- `GET /api/contacts/:id` - Get contact by ID
- `POST /api/contacts` - Create new contact
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact

### Referrals
- `GET /api/referrals` - Get all referrals (with pagination, filters)
- `GET /api/referrals/:id` - Get referral by ID
- `POST /api/referrals` - Create new referral
- `PUT /api/referrals/:id` - Update referral
- `PATCH /api/referrals/:id/status` - Update referral status
- `DELETE /api/referrals/:id` - Delete referral

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## Database Schema

See `prisma/schema.prisma` for the complete database schema.

### Main Models:
- **Clinic** - Dental clinic information
- **User** - Clinic staff users with roles
- **Contact** - Referral recipients (specialists)
- **Referral** - Patient referrals
- **ReferralFile** - Attached files for referrals

## Development Commands

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run type checking
npm run type-check

# Run linter
npm run lint

# Database commands
npm run prisma:generate   # Generate Prisma client
npm run prisma:migrate    # Run migrations
npm run prisma:studio     # Open database GUI
```

## Environment Variables

See `.env.example` for required environment variables.

## Migration to Supabase

When ready to migrate to Supabase:

1. Update `DATABASE_URL` in `.env` to your Supabase PostgreSQL connection string
2. Run `npm run prisma:migrate` to apply migrations
3. Update `JWT_SECRET` if needed
4. No code changes required! 🎉

