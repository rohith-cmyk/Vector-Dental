# Debug Token Issue - Step by Step

## Problem
You're logged in but getting 401 errors. Profile shows "Loading..."

## Step 1: Check if Token Exists

Open browser console (F12) and run:

```javascript
// Check if token exists
const token = localStorage.getItem('auth_token')
console.log('Token exists?', token ? 'YES' : 'NO')

if (token) {
  console.log('Token length:', token.length)
  console.log('Token preview:', token.substring(0, 50) + '...')
  
  // Check if it's a valid JWT
  const parts = token.split('.')
  if (parts.length === 3) {
    console.log('✅ Token is valid JWT format')
    try {
      const payload = JSON.parse(atob(parts[1]))
      console.log('Token payload:', payload)
      const expiresAt = new Date(payload.exp * 1000)
      console.log('Token expires at:', expiresAt)
      console.log('Is expired?', Date.now() > payload.exp * 1000)
    } catch(e) {
      console.error('❌ Error parsing token:', e)
    }
  } else {
    console.error('❌ Token is NOT a valid JWT (should have 3 parts)')
  }
} else {
  console.error('❌ No token found - you need to login!')
}
```

## Step 2: Check Network Request

1. Open **Network** tab in DevTools
2. Try accessing Magic Referral Links page
3. Find the request to `/api/magic-referral-links`
4. Click on it → **Headers** tab
5. Look for **Request Headers** → `Authorization: Bearer ...`

**What to check:**
- ✅ If `Authorization` header exists → Token is being sent
- ❌ If missing → Token not being sent (check api.ts interceptor)

## Step 3: Verify Login Actually Stored Token

After logging in, immediately check:

```javascript
// Run this right after login
localStorage.getItem('auth_token')
```

If it's still null after login, the login process isn't storing the token properly.

## Step 4: Check Backend Logs

Look at your backend terminal. You should see:

**If token is missing:**
```
No token provided
```

**If token is invalid:**
```
Supabase token verification error: [specific error message]
```

This will tell you exactly what's wrong.

---

## Quick Fixes to Try

### Fix 1: Clear Everything and Re-login

```javascript
// In browser console:
localStorage.clear()
sessionStorage.clear()
// Then:
// 1. Go to /login
// 2. Login again
// 3. Immediately check: localStorage.getItem('auth_token')
```

### Fix 2: Check Login Response

After clicking "Login", check the Network tab:
1. Find the login request
2. Check the Response
3. Verify it contains a token

### Fix 3: Manual Token Check

After login, verify token is stored:

```javascript
// Should return a long string (200-300 chars)
localStorage.getItem('auth_token')
```

---

## Most Likely Issue

Based on the errors, **the token exists but Supabase can't verify it**. This could mean:

1. **Token expired** → Logout and login again
2. **Wrong Supabase config** → Backend can't verify token
3. **User doesn't exist in Supabase** → User was created in DB but not in Supabase Auth

---

## Run This Diagnostic

Copy and paste this entire block into your browser console:

```javascript
console.log('=== TOKEN DIAGNOSTIC ===')
const token = localStorage.getItem('auth_token')
console.log('1. Token exists?', token ? '✅ YES' : '❌ NO')

if (token) {
  console.log('2. Token length:', token.length, 'characters')
  
  const parts = token.split('.')
  console.log('3. JWT format?', parts.length === 3 ? '✅ YES' : '❌ NO')
  
  if (parts.length === 3) {
    try {
      const payload = JSON.parse(atob(parts[1]))
      console.log('4. Token expires:', new Date(payload.exp * 1000).toLocaleString())
      console.log('5. Is expired?', Date.now() > payload.exp * 1000 ? '❌ YES' : '✅ NO')
      console.log('6. Token payload:', payload)
    } catch(e) {
      console.error('4. Error parsing token:', e)
    }
  }
} else {
  console.log('❌ You need to login first!')
  console.log('   Go to /login and login again')
}

console.log('=== END DIAGNOSTIC ===')
```

This will tell you exactly what's wrong!

