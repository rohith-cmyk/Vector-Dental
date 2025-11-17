# 🚀 How to Start Both Servers

## ⚠️ Quick Fix Needed

Your frontend has a yarn/npm conflict. Here's how to start both servers:

---

## Option 1: Manual Start (Recommended)

### Terminal 1 - Backend:
```bash
cd "/Users/rohithperumandla/R&D venture Studio/code/dental-referral/backend"
npm run dev
```

Should show:
```
✅ Database connected successfully
🚀 Server running on port 54112
```

### Terminal 2 - Frontend:
```bash
cd "/Users/rohithperumandla/R&D venture Studio/code/dental-referral/frontend"
export PORT=3000
export NODE_ENV=development
npm run dev
```

Should show:
```
✓ Ready in 2s
○ Local:        http://localhost:3000
```

---

## Option 2: If Frontend Still Fails

If you see yarn errors, do this:

```bash
cd "/Users/rohithperumandla/R&D venture Studio/code/dental-referral/frontend"

# Remove all lock files
rm -f yarn.lock package-lock.json

# Clean install
rm -rf node_modules
npm install

# Start
PORT=3000 npm run dev
```

---

## ✅ Verify Both Running

```bash
# Check ports
lsof -i :3000  # Should show frontend
lsof -i :54112 # Should show backend

# Test backend
curl http://localhost:54112/api/auth/me
# Response: {"success":false,"message":"Invalid or expired token"} ✅

# Test frontend
open http://localhost:3000
# Should open your app in browser ✅
```

---

## 🎯 Next: Configure Supabase & Test!

Once both are running:

1. **Configure Supabase:**
   - Go to: https://supabase.com/dashboard/project/oezqvqdlmdowtloygkmz/auth/settings
   - Enable "Email confirmations"
   - Add redirect URLs
   - Save

2. **Test Signup:**
   - Go to: http://localhost:3000/signup
   - Sign up with real email
   - Check email for verification
   - Click link
   - Login!

---

**Current Status:**
- ✅ Backend: Running on 54112
- ⏳ Frontend: Needs manual start (yarn/npm conflict)





