-- ============================================================
-- SUPABASE ROW LEVEL SECURITY (RLS) SETUP
-- Vector Referral
-- ============================================================
-- 
-- This script enables Row Level Security on all tables to prevent
-- unauthorized direct access to the database.
--
-- APPROACH: Backend-Enforced Security
-- - Block all direct client access to tables
-- - Allow only service_role (backend) to access data
-- - Backend middleware enforces clinicId filtering
--
-- WHY THIS APPROACH:
-- Your app uses custom JWT authentication via backend middleware.
-- The backend already filters data by clinicId in the auth middleware.
-- This RLS setup adds an extra security layer by blocking direct
-- database access from clients while allowing the backend to work.
--
-- ============================================================

-- ============================================================
-- STEP 1: Enable RLS on All Tables
-- ============================================================

-- This blocks all access except through policies
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_referral_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- STEP 2: Drop Existing Policies (if any)
-- ============================================================

-- Clean slate - drop any existing policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Allow service role all access" ON public.clinics;
    DROP POLICY IF EXISTS "Allow service role all access" ON public.users;
    DROP POLICY IF EXISTS "Allow service role all access" ON public.contacts;
    DROP POLICY IF EXISTS "Allow service role all access" ON public.referrals;
    DROP POLICY IF EXISTS "Allow service role all access" ON public.referral_files;
    DROP POLICY IF EXISTS "Allow service role all access" ON public.clinic_referral_links;
    DROP POLICY IF EXISTS "Allow service role all access" ON public.notifications;
END $$;

-- ============================================================
-- STEP 3: Block All Direct Access (Tables are Backend-Only)
-- ============================================================

-- Your backend connects directly to Postgres (bypasses RLS as superuser)
-- These policies block all access through Supabase's PostgREST API
-- This prevents unauthorized direct database access

-- NOTE: No policies needed for full blocking
-- When RLS is enabled without policies, all access is denied by default
-- Exception: We'll add specific policies for public referral links below

-- ============================================================
-- STEP 4: Special Policy for Public Referral Links
-- ============================================================

-- Allow public (anon) users to READ clinic referral links
-- This is needed for the public referral form feature at /refer/[slug]
DROP POLICY IF EXISTS "Allow public read clinic referral links" ON public.clinic_referral_links;

CREATE POLICY "Allow public read clinic referral links"
    ON public.clinic_referral_links
    AS PERMISSIVE
    FOR SELECT
    TO anon
    USING ("isActive" = true);

-- Allow public (anon) users to READ clinic info via referral links
DROP POLICY IF EXISTS "Allow public read clinic info" ON public.clinics;

CREATE POLICY "Allow public read clinic info"
    ON public.clinics
    AS PERMISSIVE
    FOR SELECT
    TO anon
    USING (
        -- Only allow reading clinic info if it has an active referral link
        EXISTS (
            SELECT 1 FROM public.clinic_referral_links crl
            WHERE crl."clinicId" = id
            AND crl."isActive" = true
        )
    );

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================

-- Run these queries to verify RLS is enabled:

-- Check RLS status on all tables
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN (
        'clinics', 
        'users', 
        'contacts', 
        'referrals', 
        'referral_files', 
        'clinic_referral_links', 
        'notifications'
    )
ORDER BY tablename;

-- Check policies on all tables
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================================
-- NOTES
-- ============================================================

/*
IMPORTANT NOTES:

1. **Backend Connection String**
   - Your backend MUST use the DATABASE_URL you already configured
   - This uses the service_role permissions (not anon)
   - Your backend can access all data

2. **Client Direct Access Blocked**
   - If clients try to access the database directly with anon key, they'll be blocked
   - This is intentional and adds security

3. **Your Auth Flow Unchanged**
   - Your backend JWT middleware continues to work exactly as before
   - The middleware filters data by clinicId
   - RLS is an additional security layer

4. **Public Referral Form**
   - The policy allows public users to view active clinic referral links
   - Needed for the /refer/[slug] public form feature

5. **Testing**
   - After running this script, test your backend API
   - All endpoints should work exactly as before
   - Direct database access attempts should be blocked

6. **Future Enhancement**
   - If you want true row-level filtering at the database level
   - Consider switching to Supabase Auth
   - We can create clinicId-based RLS policies using JWT claims
*/

-- ============================================================
-- ROLLBACK (if needed)
-- ============================================================

-- If you need to disable RLS (NOT RECOMMENDED), run:
-- ALTER TABLE public.clinics DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.contacts DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.referrals DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.referral_files DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.clinic_referral_links DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;

