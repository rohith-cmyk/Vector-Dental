# 🔐 Supabase Auth Migration Guide

**Status:** In Progress  
**Date:** November 3, 2025

---

## 🎯 What We're Doing

Migrating from **custom JWT authentication** to **Supabase Auth** to get:
- ✅ Email verification
- ✅ Password reset
- ✅ Better security
- ✅ Social logins (future)
- ✅ Professional email templates

---

## 📋 Migration Steps

### Step 1: Configure Supabase Auth Settings ⏳

**Action Required:** Go to Supabase Dashboard

1. Go to: [Authentication Settings](https://supabase.com/dashboard/project/oezqvqdlmdowtloygkmz/auth/settings)
2. Enable **Email Confirmations**
3. Configure email templates
4. Set redirect URLs

**Detailed Instructions:**

#### A. Enable Email Confirmation
- Navigate to **Authentication → Settings**
- Find **"Email Auth"** section
- Toggle **"Enable email confirmations"** to ON
- Set **"Confirm email"** to required

#### B. Configure Site URL
- **Site URL:** `http://localhost:3000` (for development)
- **Redirect URLs:** Add:
  - `http://localhost:3000/auth/callback`
  - `http://localhost:3000/dashboard`

#### C. Email Templates (Optional - Customize Later)
- Confirm signup template
- Reset password template
- Magic link template

---

### Step 2: Update Database Schema

**Link Supabase Auth users with your custom user tables**

Supabase creates a `auth.users` table automatically. We need to link it with your `public.users` table.

**New Schema:**
```
auth.users (Supabase managed)
    ↓ (linked by email)
public.users (your custom table)
    ↓
public.clinics
```

---

### Step 3: Backend Changes

**Install Supabase Client:**
```bash
cd backend
npm install @supabase/supabase-js
```

**Changes Needed:**
1. Add Supabase client initialization
2. Update auth middleware to verify Supabase tokens
3. Keep signup/login endpoints (they'll use Supabase)
4. Remove custom JWT utilities (or keep for fallback)

---

### Step 4: Frontend Changes

**Install Supabase Client:**
```bash
cd frontend
npm install @supabase/supabase-js
```

**Changes Needed:**
1. Create Supabase client instance
2. Update auth service to use Supabase methods
3. Add email confirmation handling
4. Update signup/login pages

---

### Step 5: Update RLS Policies

Enable RLS policies that use Supabase Auth:
```sql
-- Example: Users can only see their own data
CREATE POLICY "Users can view own clinic data"
ON public.clinics
FOR SELECT
TO authenticated
USING (auth.uid() = (SELECT id FROM public.users WHERE "clinicId" = clinics.id));
```

---

## 🔄 Migration Strategy

### Approach: Gradual Migration

1. ✅ Keep existing tables
2. ✅ Add Supabase Auth alongside current system
3. ✅ Link auth.users to public.users
4. ✅ Migrate existing users (or recreate)
5. ✅ Test thoroughly
6. ✅ Remove old JWT code

---

## 📊 Before vs After

### Before (Custom JWT):
```
Signup → Backend validates → Creates user → Returns JWT
Login → Backend validates → Checks password → Returns JWT
```

### After (Supabase Auth):
```
Signup → Supabase Auth → Sends verification email → User confirms → Account active
Login → Supabase Auth → Returns session token → Backend verifies
```

---

## 🚀 Implementation

See detailed code changes in the following files:
- `backend/src/config/supabase.ts` (new)
- `backend/src/middleware/auth.middleware.ts` (updated)
- `backend/src/controllers/auth.controller.ts` (updated)
- `frontend/src/lib/supabase.ts` (new)
- `frontend/src/services/auth.service.ts` (updated)

---

## 🧪 Testing Checklist

After migration:
- [ ] User can signup with email
- [ ] Verification email is sent
- [ ] User can verify email via link
- [ ] User can login after verification
- [ ] User cannot login before verification
- [ ] Password reset works
- [ ] Dashboard shows correct user data
- [ ] Multi-tenant isolation works

---

## 📝 Notes

- Existing user (admin@smithdental.com) will need to be recreated
- Keep old auth code commented out for reference
- Test in development before production
- Update frontend redirect URLs for production

---

**Status:** Ready to implement! Starting with Step 1...

