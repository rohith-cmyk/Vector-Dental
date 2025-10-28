<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# for the phase 1 give the clear steps on what todo so that we the cursor will develop it, give detail instructions like tasks1, task2, task3, for backend, creating database, lgin details, creating the frontend

Phase 1: Core Infrastructure
Set up secure user authentication and a database to store clinics, users, contacts, referrals, and files.
Choose a backend (such as Supabase) for authentication, database, and file storage.
Develop a basic frontend where clinics can log in, add contacts, and store data safely.
Phase 2: Manual Referral Directory
Allow clinics to manually add, edit, and delete referral contacts.
Implement an upload function for CSV/Excel files to easily import practitioner contacts and create a searchable directory within the app.
Phase 3: Simple Digital Referral Form
Create a digital form for new referrals—capture patient details, reason, urgency, and let users attach files like x-rays and notes.
Enable selection of a contact from the internal directory and basic status tracking (draft, sent, accepted, completed).

Here are detailed, step-by-step instructions for Phase 1 of your MVP, covering backend, database, authentication, and frontend login. This breakdown will let a development team like Cursor proceed efficiently and clearly.

### Phase 1: Core Infrastructure – Step-by-Step Tasks

#### Backend \& Database Setup

- **Task 1: Set Up Supabase Project**
    - Register for and configure a new Supabase project for your application.
    - Configure environment variables for local and deployment environments (e.g., database URL, secret keys).
- **Task 2: Database Schema Design**
    - Define and create core tables/entities:
        - Clinics: id, name, address, phone, etc.
        - Users: id, clinic_id, email, password_hash, role (admin/staff), etc.
        - Contacts: id, clinic_id, name, specialty, phone, email (for potential referral recipients).
        - Referrals: id, patient_name, patient_dob, clinic_id, contact_id, reason, urgency, status.
        - Files: id, referral_id, url, file_type.
    - Apply foreign key relationships between clinics, users, contacts, and referrals.
- **Task 3: File Storage Set Up**
    - Activate and test Supabase Storage buckets for file/file attachment support (secure upload, storage, and download of referral files).


#### Authentication

- **Task 4: User Authentication System**
    - Implement and test Supabase Auth for email/password login and signup.
    - Build endpoints or use Supabase client SDKs for sign-up, login, password reset flows.
    - Ensure session management and token security best practices.


#### Basic Frontend

- **Task 5: Project Initialization**
    - Initialize a modern frontend (React, Next.js, or Vite + React) project connected to Supabase.
    - Configure Supabase client on the frontend with correct project/environment keys.
- **Task 6: Login and Signup UI**
    - Build UI for login, signup, and password reset according to flows above.
    - Implement protected views so only authenticated users access app features and data.
- **Task 7: Dashboard \& Basic CRUD for Contacts**
    - Once logged in, clinics should see a dashboard or landing page.
    - Create forms and simple pages for users to manually add, edit, and delete referral contact entries.
    - Connect these forms to the backend database so changes are saved and viewed in real time.


#### Final Checks \& Deliverable

- **Task 8: Data Security and Access Control**
    - Restrict data access by clinic: users only see their own clinic’s data, not others’.
    - File access must also be scoped by clinic/user for privacy and compliance.
- **Task 9: Deployment \& README**
    - Deploy backend and frontend to cloud (e.g., Vercel for frontend, Supabase hosting).
    - Write a simple README for initial usage, environment setup, and onboarding.

This sequence gives a clear roadmap: database and API setup, authentication, functional frontend, and strong access controls, ending with a deployable MVP that lets clinics securely log in and manage their own local referral contacts.[^1]

<div align="center">⁂</div>

[^1]: 6-8-Week-MVP-Roadmap-Smart-Referral-Manager.pdf

