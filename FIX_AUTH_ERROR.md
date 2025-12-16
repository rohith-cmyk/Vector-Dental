# Fix Authentication Error (401 Unauthorized)

## Problem
The "Invalid or expired token" error means the API request doesn't have a valid authentication token.

## Quick Fix

### Step 1: Check if you're logged in
1. Open browser Developer Tools (F12 or Cmd+Option+I)
2. Go to **Console** tab
3. Run this command:
   ```javascript
   localStorage.getItem('auth_token')
   ```
4. If it returns `null` → You're not logged in, go to Step 2
5. If it returns a long string → You're logged in but token might be invalid, go to Step 3

### Step 2: Login First
1. Navigate to: `http://localhost:3000/login`
2. Enter your email and password
3. After successful login, you should be redirected to dashboard
4. Then try accessing Magic Referral Links again

### Step 3: Refresh Token (if already logged in)
If you have a token but still get 401:

1. **Logout and Login Again:**
   - Click logout button (if available)
   - Or run in console: `localStorage.removeItem('auth_token')`
   - Then login again at `/login`

2. **Check Supabase Connection:**
   - Make sure your Supabase credentials are correct in `.env` files
   - The backend needs valid Supabase credentials to verify tokens

## Verification Steps

After logging in, verify token is being sent:

1. Open **Network** tab in Developer Tools
2. Try accessing Magic Referral Links page
3. Look for the request to `/api/magic-referral-links`
4. Click on it → Check **Headers** tab
5. Look for `Authorization: Bearer ...` header
   - ✅ If present: Token is being sent (might be invalid)
   - ❌ If missing: Token not in localStorage

## Common Causes

1. **Not logged in** - Most common
2. **Token expired** - Supabase tokens expire after some time
3. **Wrong auth system** - Make sure you're using Supabase login, not JWT login
4. **Supabase config issue** - Backend can't verify token with Supabase

## Still Not Working?

Check backend logs - they should show what's wrong:
- "No token provided" → Token not being sent
- "Invalid or expired token" → Token can't be verified by Supabase
- "User profile not found" → User exists in Supabase but not in your database

