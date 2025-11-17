# 🎯 Quick Test User Setup

## ✅ Email Verification DISABLED for Development

I've disabled email verification so you can sign up and login immediately!

---

## Option 1: Use the UI (Easiest) ✨

### 1. Make sure your backend is running:
```bash
cd "/Users/rohithperumandla/R&D venture Studio/code/dental-referral/backend"
npm run dev
```

### 2. Go to signup page:
```
http://localhost:3000/signup
```

### 3. Create your account:
- **Your Name:** Dr. John Smith
- **Email:** admin@dental.com
- **Password:** dental123
- **Clinic Name:** Smith Dental Clinic

### 4. Login:
```
http://localhost:3000/login
```
- **Email:** admin@dental.com  
- **Password:** dental123

---

## Option 2: Quick API Test 🚀

### Create user via API:
```bash
curl -X POST http://localhost:54112/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@dental.com",
    "password": "dental123",
    "name": "Dr. John Smith",
    "clinicName": "Smith Dental Clinic"
  }'
```

### Then login:
```bash
curl -X POST http://localhost:54112/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@dental.com",
    "password": "dental123"
  }'
```

---

## 🔧 Changes Made

### 1. Auto-confirm emails (no verification needed)
**File:** `backend/src/controllers/auth.supabase.controller.ts`
```typescript
email_confirm: true  // ✅ No email verification required
```

### 2. Disabled email verification check
**File:** `backend/src/middleware/auth.supabase.middleware.ts`
```typescript
// Email verification check is commented out for development
```

---

## ⚠️ Important Notes

1. **Restart your backend** after these changes:
   ```bash
   # Stop backend (Ctrl+C)
   # Then start again:
   npm run dev
   ```

2. **For production:** Re-enable email verification by:
   - Setting `email_confirm: false`
   - Uncommenting the verification check in middleware

3. **If you already created an account** that needs verification:
   - Either create a new account with a different email
   - Or manually verify it in Supabase dashboard

---

## 🎉 Ready to Test!

Your backend is now configured for **instant signup/login** without email verification!

Just:
1. ✅ Restart backend
2. ✅ Go to http://localhost:3000/signup
3. ✅ Create account
4. ✅ Login immediately!

No emails required! 🚀

