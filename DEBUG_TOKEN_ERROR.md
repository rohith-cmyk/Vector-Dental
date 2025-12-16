# Debugging "Invalid or expired token" Error

## What's Happening

The error occurs at this line in the backend:
```javascript
// backend/src/middleware/auth.supabase.middleware.ts:36
const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)

if (error || !user) {
  throw errors.unauthorized('Invalid or expired token')  // ← This is failing
}
```

This means Supabase cannot verify the token you're sending.

---

## Possible Causes & Solutions

### 1. 🔴 You're Not Logged In

**Check:**
```javascript
// Open browser console (F12) and run:
localStorage.getItem('auth_token')
```

**If returns `null`:**
- You need to login first
- Go to: `http://localhost:3000/login`
- Login with your credentials

---

### 2. 🔴 Wrong Authentication System

**Problem:** You might be logged in with regular JWT auth, but the route expects Supabase auth.

**Check:**
The magic referral links route uses `authenticateSupabase` which expects a **Supabase JWT token**, not a regular JWT token.

**Solution:**
- Make sure you login using the `/login` page (which uses Supabase auth)
- NOT using any other authentication method

---

### 3. 🔴 Token Expired

**Problem:** Supabase tokens expire after some time (usually 1 hour).

**Check:**
- Try logging out and logging back in
- Or refresh the page (might refresh the token)

**Solution:**
1. Logout: Run in console: `localStorage.removeItem('auth_token')`
2. Go to `/login` and login again
3. Try accessing the page again

---

### 4. 🔴 Supabase Configuration Issue

**Problem:** Backend can't verify token because Supabase config is wrong.

**Check backend `.env` file:**
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # ← This is critical!
```

**Verify:**
- Service role key has the right permissions
- Supabase project is active
- Keys are correct (no typos)

---

### 5. 🔴 User Doesn't Exist in Supabase

**Problem:** User exists in your database but not in Supabase Auth.

**Check:**
1. Login should create user in both places
2. If you created user manually in database, it won't have Supabase Auth record

**Solution:**
- User must login through Supabase auth system
- This creates the Supabase Auth user automatically

---

### 6. 🔴 User Profile Missing in Database

**Problem:** User exists in Supabase Auth but not in your `users` table.

**Check backend logs:**
- Should see: "User profile not found" (different error message)
- If you see this, you need to create user profile in database

---

## Step-by-Step Debugging

### Step 1: Check if Token Exists

Open browser console (F12 → Console tab):
```javascript
const token = localStorage.getItem('auth_token')
console.log('Token:', token ? 'EXISTS' : 'MISSING')
if (token) {
  console.log('Token length:', token.length)
  console.log('Token preview:', token.substring(0, 20) + '...')
}
```

**Expected:**
- Token exists
- Token length is around 200-300 characters (Supabase JWT tokens are long)
- Token starts with something like `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

### Step 2: Check Network Request

1. Open **Network** tab in Developer Tools
2. Try accessing Magic Referral Links page
3. Find the request to `/api/magic-referral-links`
4. Click on it → **Headers** tab
5. Check **Request Headers**:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

**If missing:**
- Token not being sent
- Check `api.ts` interceptor

**If present but still fails:**
- Token is invalid/expired
- Or Supabase can't verify it

---

### Step 3: Test Token with Supabase Directly

In browser console:
```javascript
// Get your token
const token = localStorage.getItem('auth_token')

// Test if it's a valid JWT format
try {
  const parts = token.split('.')
  if (parts.length !== 3) {
    console.error('❌ Not a valid JWT (should have 3 parts)')
  } else {
    console.log('✅ Token has correct JWT format')
    const payload = JSON.parse(atob(parts[1]))
    console.log('Token payload:', payload)
    console.log('Expires at:', new Date(payload.exp * 1000))
    console.log('Is expired?', Date.now() > payload.exp * 1000)
  }
} catch (e) {
  console.error('❌ Error parsing token:', e)
}
```

---

### Step 4: Check Backend Logs

Look at your backend terminal output. You should see:

**If token is missing:**
```
No token provided
```

**If token is invalid:**
```
Invalid or expired token
```

**If user profile missing:**
```
User profile not found
```

---

## Quick Fixes to Try

### Fix 1: Clear Everything and Login Fresh

```javascript
// In browser console:
localStorage.clear()
sessionStorage.clear()
// Then go to /login and login again
```

### Fix 2: Check Supabase Connection

Verify your Supabase credentials are correct in backend `.env`:
- Copy your Supabase Service Role Key from Supabase dashboard
- Make sure it's in `.env` file
- Restart backend server

### Fix 3: Verify User Exists

1. Check if user exists in Supabase Auth dashboard
2. Check if user exists in your database `users` table
3. They should match (same ID)

---

## Most Common Solution

**90% of the time, the issue is:**

1. **Not logged in** → Go to `/login` and login
2. **Token expired** → Logout and login again
3. **Wrong auth system** → Make sure using Supabase login (not JWT login)

---

## Still Not Working?

Check these in order:

1. ✅ Token exists in localStorage?
2. ✅ Token is being sent in Authorization header?
3. ✅ Token is valid JWT format?
4. ✅ Token is not expired?
5. ✅ Supabase config is correct?
6. ✅ User exists in Supabase Auth?
7. ✅ User exists in database users table?

If all checked, share:
- Backend error logs
- Network request headers (Authorization header value)
- Token format (first 50 chars only)

