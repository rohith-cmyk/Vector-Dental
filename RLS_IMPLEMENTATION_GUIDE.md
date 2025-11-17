# 🔐 Row Level Security (RLS) Implementation Guide

**Date:** November 3, 2025  
**Status:** Ready to Implement

---

## 📋 What is RLS and Why You Need It

### The Problem
Supabase detected that your tables have **Row Level Security (RLS) disabled**. This means:

❌ **Anyone with your database credentials could access all data**  
❌ **No protection against direct database access**  
❌ **Security vulnerability for your multi-tenant application**  
❌ **One clinic could potentially see another clinic's data**

### The Solution
Enable RLS to add a security layer that:

✅ **Blocks unauthorized direct database access**  
✅ **Protects multi-tenant data isolation**  
✅ **Allows your backend to work normally**  
✅ **Prevents data leaks**

---

## 🏗️ Your Current Architecture

```
┌─────────────┐
│   Frontend  │ (Next.js)
│ localhost:  │
│    3000     │
└──────┬──────┘
       │ HTTP Requests
       │
┌──────▼──────┐
│   Backend   │ (Express + Prisma)
│  API Server │ 
│ localhost:  │
│    5000     │
└──────┬──────┘
       │ Direct PostgreSQL Connection
       │ (Bypasses Supabase API/RLS)
       │
┌──────▼──────┐
│  Supabase   │
│  Database   │
│ PostgreSQL  │
└─────────────┘
```

### Key Points:
1. **Frontend** → calls Backend API (not Supabase directly)
2. **Backend** → connects directly to PostgreSQL (as superuser)
3. **Superuser bypasses RLS** - your backend is unaffected
4. **RLS blocks** direct Supabase API access (security layer)

---

## 🎯 Implementation Strategy

### What We're Doing:

1. ✅ **Enable RLS on all 7 tables**
2. ✅ **Block all direct access** through Supabase API
3. ✅ **Allow public access** to referral links only (for /refer/[slug] feature)
4. ✅ **Backend continues to work** normally (connects as superuser)

### What Stays the Same:

- ✅ Your backend API works exactly as before
- ✅ Your JWT authentication is unchanged
- ✅ Your middleware filtering by `clinicId` is unchanged
- ✅ All existing endpoints work normally

---

## 📝 Step-by-Step Implementation

### Step 1: Open Supabase SQL Editor

1. Go to: [https://supabase.com/dashboard/project/oezqvqdlmdowtloygkmz](https://supabase.com/dashboard/project/oezqvqdlmdowtloygkmz)
2. Click **"SQL Editor"** in the left sidebar
3. Click **"New Query"**

### Step 2: Run the RLS Setup Script

1. Open the file: `supabase_rls_setup.sql`
2. Copy the ENTIRE contents
3. Paste into the Supabase SQL Editor
4. Click **"Run"** or press `Ctrl+Enter` (Windows) or `Cmd+Enter` (Mac)

### Step 3: Verify RLS is Enabled

Run this verification query in the SQL Editor:

```sql
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
```

**Expected Result:**  
All tables should show `RLS Enabled = true`

### Step 4: Test Your Backend API

Your backend should work exactly as before:

```bash
# Make sure backend is running
cd "/Users/rohithperumandla/R&D venture Studio/code/dental-referral/backend"
npm run dev

# Test an endpoint (in another terminal)
curl http://localhost:5000/api/dashboard/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected:** Normal responses (backend unaffected by RLS)

### Step 5: Confirm Warnings Are Gone

1. Go back to Supabase Dashboard
2. Check the **"Advisors"** or **"Security"** tab
3. The RLS warnings should be gone! ✅

---

## 🔍 What Each Policy Does

### Tables with NO policies (Blocked):
- ❌ `clinics` - No direct access (except via referral link policy)
- ❌ `users` - No direct access
- ❌ `contacts` - No direct access  
- ❌ `referrals` - No direct access
- ❌ `referral_files` - No direct access
- ❌ `notifications` - No direct access

**Result:** All access through Supabase API is blocked (security!)

### Tables with PUBLIC policies:
- ✅ `clinic_referral_links` - Public can READ active links
- ✅ `clinics` - Public can READ clinic info IF it has active referral link

**Why:** Your `/refer/[slug]` public form needs to:
1. Read the clinic's referral link
2. Display clinic information
3. Allow external users to submit referrals

---

## 🧪 Testing After Implementation

### Test 1: Backend API Works ✅
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password"}'

# Get dashboard stats (requires auth)
curl http://localhost:5000/api/dashboard/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected:** Works normally

### Test 2: Direct Database Access Blocked ❌
If you try to query the database directly using Supabase client with anon key:

```javascript
// This should be BLOCKED
const { data, error } = await supabase
  .from('contacts')
  .select('*')

// Error: "new row violates row-level security policy"
```

**Expected:** Access denied (this is good!)

### Test 3: Public Referral Links Work ✅
```bash
# Test accessing a public referral link
curl http://localhost:5000/api/referral-links/some-clinic-slug
```

**Expected:** Returns clinic info and referral link

---

## 📊 RLS Policies Summary

| Table | Direct Access | Public Access | Backend Access |
|-------|--------------|---------------|----------------|
| `clinics` | ❌ Blocked | ✅ If has active referral link | ✅ Full (superuser) |
| `users` | ❌ Blocked | ❌ Blocked | ✅ Full (superuser) |
| `contacts` | ❌ Blocked | ❌ Blocked | ✅ Full (superuser) |
| `referrals` | ❌ Blocked | ❌ Blocked | ✅ Full (superuser) |
| `referral_files` | ❌ Blocked | ❌ Blocked | ✅ Full (superuser) |
| `clinic_referral_links` | ❌ Blocked (write) | ✅ Read active links | ✅ Full (superuser) |
| `notifications` | ❌ Blocked | ❌ Blocked | ✅ Full (superuser) |

---

## 🔐 Security Benefits

### Before RLS (Current State):
```
❌ Anyone with database URL could:
   - Read all clinics' data
   - Access any user's information
   - View all referrals across clinics
   - Modify or delete data
```

### After RLS:
```
✅ Direct database access blocked
✅ Only backend API can access data
✅ Backend enforces clinicId filtering
✅ Public can only access referral links
✅ Multi-tenant isolation protected
```

---

## 🚨 Important Notes

### 1. Backend Connection Unchanged
Your backend connects using this connection string:
```
postgresql://postgres.oezqvqdlmdowtloygkmz:dental-referral1@aws-1-us-east-1.pooler.supabase.com:5432/postgres
```

This connects as the `postgres` superuser, which **bypasses RLS automatically**.  
✅ Your backend is unaffected by RLS policies.

### 2. Middleware Still Required
Your backend middleware must continue to:
- ✅ Verify JWT tokens
- ✅ Filter queries by `clinicId`
- ✅ Enforce role-based permissions

RLS is an **additional security layer**, not a replacement for your backend logic.

### 3. Public Referral Form
The `/refer/[slug]` page allows external users to send referrals.  
RLS policies allow public users to:
- ✅ Read active clinic referral links
- ✅ View clinic information

Your backend API handles creating the actual referral (authenticated via API).

### 4. Future Enhancements
If you want **database-level multi-tenant filtering**, consider:
- Migrating to Supabase Auth
- Adding custom JWT claims with `clinicId`
- Creating RLS policies based on JWT `clinicId`

**For now:** Your backend-based approach is solid and secure! ✅

---

## 🛠️ Troubleshooting

### Problem: Backend can't access database after enabling RLS

**Cause:** Shouldn't happen - superuser bypasses RLS  
**Solution:**
1. Check your `DATABASE_URL` in `.env`
2. Ensure it's the postgres user connection (not anon key)
3. Restart your backend server

### Problem: Public referral form not working

**Cause:** Policy might not be applied correctly  
**Solution:**
1. Check if `clinic_referral_links` has public read policy
2. Run verification queries from the SQL script
3. Ensure `isActive` column exists and is set to `true`

### Problem: RLS warnings still showing

**Cause:** Policies might not be created  
**Solution:**
1. Re-run the SQL script
2. Check policy creation with:
```sql
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

---

## 🔄 Rollback (Emergency Only)

If something goes wrong and you need to disable RLS:

```sql
-- WARNING: Only use in emergency!
-- This removes the security layer

ALTER TABLE public.clinics DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_files DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_referral_links DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
```

**Note:** Only do this temporarily while debugging. Re-enable ASAP!

---

## ✅ Post-Implementation Checklist

After running the SQL script:

- [ ] All 7 tables show RLS enabled in verification query
- [ ] Backend API works normally (login, dashboard, etc.)
- [ ] Frontend connects to backend successfully
- [ ] Public referral form accessible (if implemented)
- [ ] Supabase RLS warnings are gone
- [ ] No errors in backend logs
- [ ] Test creating a referral through the API

---

## 📚 Additional Resources

- **Supabase RLS Docs:** https://supabase.com/docs/guides/auth/row-level-security
- **PostgreSQL RLS:** https://www.postgresql.org/docs/current/ddl-rowsecurity.html
- **Your SQL Script:** `supabase_rls_setup.sql`

---

## 🎯 Summary

**What you're doing:**  
Adding a security layer that blocks direct database access while keeping your backend fully functional.

**Time required:**  
5 minutes (just run the SQL script)

**Risk level:**  
✅ **Very Low** - Your backend bypasses RLS, so it's unaffected

**Impact:**  
✅ Improved security  
✅ No RLS warnings  
✅ Multi-tenant protection  
✅ No changes to your application code

---

**Ready to implement? Just run the `supabase_rls_setup.sql` script in your Supabase SQL Editor!** 🚀

