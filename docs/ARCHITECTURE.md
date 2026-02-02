# Architecture Overview

## System Architecture

Vector Dental follows a modern **client-server architecture** with clear separation of concerns.

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│                  (Next.js + React + TypeScript)              │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Pages   │  │Components│  │ Services │  │  Stores  │   │
│  │ (Routes) │──│   (UI)   │──│   (API)  │──│ (State)  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                         HTTP/REST API
                              │
┌─────────────────────────────────────────────────────────────┐
│                         Backend                              │
│              (Node.js + Express + TypeScript)                │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Routes  │──│Controllers│──│ Services │──│  Models  │   │
│  │  (API)   │  │ (Logic)  │  │(Business)│  │ (Prisma) │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                         Prisma ORM
                              │
                      ┌───────────────┐
                      │  PostgreSQL   │
                      │   Database    │
                      └───────────────┘
```

## Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **TailwindCSS** - Utility-first CSS
- **Zustand** - State management
- **Axios** - HTTP client

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **Prisma** - ORM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Database
- **PostgreSQL** - Relational database
- Can be migrated to **Supabase** (managed PostgreSQL)

## Data Flow

### 1. User Authentication Flow

```
User → Login Form → Frontend Service → API (POST /auth/login)
  ↓
Backend validates credentials
  ↓
Generate JWT token
  ↓
Return user data + token
  ↓
Frontend stores token (localStorage)
  ↓
Attach token to all subsequent requests
```

### 2. Data Request Flow

```
User Action → Component → Service → API Call
  ↓
API receives request with JWT
  ↓
Middleware validates token & extracts user info
  ↓
Controller processes request
  ↓
Prisma queries database
  ↓
Response sent back to frontend
  ↓
Component updates UI
```

## Database Schema

### Core Entities

**Clinic**
- Represents a dental clinic
- One clinic can have multiple users, contacts, and referrals

**User**
- Clinic staff members
- Roles: ADMIN, STAFF
- Belongs to one clinic

**Contact**
- Referral recipients (specialists)
- Each clinic has their own contact directory
- Contains specialty, contact info

**Referral**
- Patient referral to a specialist
- Links clinic → contact
- Contains patient info, reason, urgency, status
- Can have attached files

**ReferralFile**
- Attached documents (x-rays, notes, etc.)
- Belongs to a referral

### Relationships

```
Clinic (1) ─── (N) User
Clinic (1) ─── (N) Contact
Clinic (1) ─── (N) Referral
Contact (1) ─── (N) Referral
Referral (1) ─── (N) ReferralFile
```

## Security

### Multi-Tenancy
- All data is scoped by `clinicId`
- Users can only access their own clinic's data
- Enforced at the controller level

### Authentication
- JWT-based authentication
- Tokens include user ID, clinic ID, and role
- Tokens expire after 7 days (configurable)

### Authorization
- Role-based access control
- Middleware checks user permissions
- Admin role for clinic management

### Data Validation
- express-validator for input validation
- Prisma type safety
- TypeScript compile-time checks

## Project Structure

```
dental-referral/
├── frontend/
│   ├── src/
│   │   ├── app/           # Next.js pages & layouts
│   │   ├── components/    # React components
│   │   ├── services/      # API service layer
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities
│   │   ├── types/         # TypeScript types
│   │   └── constants/     # Constants
│   └── public/            # Static assets
│
├── backend/
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── controllers/   # Request handlers
│   │   ├── middleware/    # Express middleware
│   │   ├── services/      # Business logic
│   │   ├── utils/         # Helpers
│   │   └── config/        # Configuration
│   └── prisma/            # Database schema
│
├── shared/
│   └── src/               # Shared types & constants
│
└── docs/                  # Documentation
```

## API Design

### RESTful Principles
- Resource-based URLs
- HTTP methods (GET, POST, PUT, PATCH, DELETE)
- Status codes for responses
- JSON format

### Pagination
- Query parameters: `page`, `limit`
- Response includes: `data`, `total`, `totalPages`

### Error Handling
- Consistent error format
- Validation errors include field details
- Appropriate status codes

## State Management

### Frontend State
- **Authentication** - Zustand store (persisted to localStorage)
- **Component State** - React useState/useEffect
- **Server State** - API calls via services

### Backend State
- Stateless API design
- Session state in JWT token
- Database as source of truth

## Migration Path to Supabase

The system is designed for easy migration to Supabase:

1. **Database** - Already using PostgreSQL (Supabase compatible)
2. **Authentication** - JWT structure compatible with Supabase Auth
3. **File Storage** - Can switch to Supabase Storage
4. **Real-time** - Can add Supabase Realtime later

**Migration Steps:**
1. Update `DATABASE_URL` to Supabase connection string
2. Run Prisma migrations
3. Optional: Switch to Supabase Auth SDK
4. Optional: Use Supabase Storage for files

No code refactoring required! 🎉

