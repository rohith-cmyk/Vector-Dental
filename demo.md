# Vector Referral Platform Demo Notes

This document is a quick, clear explanation of the platform for demos and
stakeholders. It summarizes the product, the tech stack, how systems connect,
and how the data model supports multi-tenant clinics with referrals to
specialists.

## Platform Overview

Vector Referral is a referral CRM for dental clinics. It helps General Dentists
(GDs) create, track, and manage patient referrals to specialists, while
maintaining a clean contact directory and referral history for each clinic.

Core capabilities:
- Multi-tenant clinic architecture (each clinic has isolated data).
- Secure authentication and role-based access.
- Referral lifecycle tracking (draft, sent, accepted, completed, cancelled).
- Specialist directory and referral file attachments (x-rays, notes).

## Tech Stack and Languages

Frontend:
- Next.js 14 (React) with TypeScript
- TailwindCSS + Shadcn UI components
- Axios for API calls
- Zustand for client state

Backend:
- Node.js + Express with TypeScript
- Prisma ORM for database access
- JWT authentication

Database:
- PostgreSQL (local dev, portable to Supabase-managed Postgres)

## How Everything Connects

1. The frontend (Next.js) renders the UI for clinics and staff.
2. UI actions call a services layer that sends REST requests to the backend.
3. The backend validates JWTs, applies authorization checks, and runs business
   logic in controllers and services.
4. Prisma connects to PostgreSQL to read/write data.
5. The API returns JSON to the frontend, which updates the UI.

This is a classic client-server architecture with a stateless REST API and a
relational database as the source of truth.

## Database Connection and Model

Database connection:
- The backend reads `DATABASE_URL` from `backend/.env`.
- Prisma uses that connection string to talk to PostgreSQL.
- Default local setup uses `postgresql://<user>@localhost:5432/dental_referral`.

Data model type:
- Multi-tenant (clinic-scoped). Every core entity includes `clinicId`.
- Users only access data within their clinic. This is enforced in the API.

Core entities:
- Clinics: the tenant boundary.
- Users: staff members of a clinic (ADMIN / STAFF).
- Contacts: specialists a clinic can refer to.
- Referrals: patient referrals from a clinic to a specialist.
- ReferralFiles: documents attached to a referral.

Relationships:
- Clinic 1:N Users
- Clinic 1:N Contacts
- Clinic 1:N Referrals
- Contact 1:N Referrals
- Referral 1:N ReferralFiles

## How GDs and Specialists Are Connected

The model reflects real referral workflows:
- A GD (User) belongs to a Clinic.
- Each Clinic maintains its own Specialist directory (Contacts).
- A Referral links a Clinic to a Specialist Contact for a patient.
- Every Referral is scoped to a Clinic and a Specialist.
- Files (x-rays, notes) attach to a Referral.

This ensures a clinic's data never mixes with another clinic, while still
supporting a detailed referral history for specialists and patients.

## API Surface (At a Glance)

Authentication:
- `POST /auth/signup`, `POST /auth/login`, `GET /auth/me`

Contacts (Specialists):
- `GET /contacts`, `POST /contacts`, `GET /contacts/:id`,
  `PUT /contacts/:id`, `DELETE /contacts/:id`

Referrals:
- `GET /referrals`, `POST /referrals`, `PUT /referrals/:id`,
  `PATCH /referrals/:id/status`, `DELETE /referrals/:id`

Dashboard:
- `GET /dashboard/stats`

All protected routes require `Authorization: Bearer <JWT>`.

## Why This Architecture Scales

- Multi-tenant data isolation by `clinicId`.
- Stateless API with JWT-based auth.
- Clear separation of UI, API, and database layers.
- PostgreSQL + Prisma makes scaling and reporting straightforward.
- Supabase migration path is simple because it is still PostgreSQL.

## Demo Talking Points

- Problem solved: clinics need a clean, trackable referral workflow.
- Multi-tenant design: each clinic is isolated and secure.
- End-to-end flow: UI -> API -> database -> UI.
- Specialist directory + referral tracking in one place.
- Easy to scale and migrate to managed Postgres (Supabase) later.
