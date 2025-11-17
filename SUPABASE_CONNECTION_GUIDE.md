# 🔧 Supabase Connection Troubleshooting Guide

## ❌ Current Issue

We're unable to connect to your Supabase database with the current connection string:
```
postgresql://postgres:dental-referral1@db.oezqvqdlmdowtloygkmz.supabase.co:5432/postgres
```

Error: `Can't reach database server`

---

## ✅ Step-by-Step Solution

### Step 1: Verify Your Supabase Project is Active

1. Go to: **https://supabase.com/dashboard/project/oezqvqdlmdowtloygkmz**
2. Check if the project shows "Active" or "Paused"
3. If **Paused**: Click the "Resume" or "Restore" button
4. Wait 1-2 minutes for the project to start up

---

### Step 2: Get the CORRECT Connection String

1. Go to: **https://supabase.com/dashboard/project/oezqvqdlmdowtloygkmz/settings/database**

2. Scroll down to the **"Connection string"** section

3. You'll see two tabs:
   - **URI** (use this one)
   - **Connection parameters**

4. Click on **"URI"** tab

5. You'll see multiple connection string options:
   
   **A. Connection Pooling** (Recommended for most use cases)
   ```
   Transaction mode (Select this one)
   postgresql://postgres.[PROJECT_REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
   ```
   
   **B. Direct Connection** (For migrations)
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
   ```

6. **Copy the ENTIRE string** (including all parameters)

7. Replace `[YOUR-PASSWORD]` with: `dental-referral1`

---

### Step 3: Common Issues & Solutions

#### Issue 1: Project is Paused
**Solution**: Go to your project dashboard and click "Restore project". Free tier projects pause after 1 week of inactivity.

#### Issue 2: Wrong Region
Your project might be in a different region. The connection string will show the correct one:
- `aws-0-us-east-1` (East US)
- `aws-0-us-west-1` (West US)
- `aws-0-eu-west-1` (Europe)
- `aws-0-ap-southeast-1` (Asia)

#### Issue 3: IPv6 Required
Some Supabase projects require IPv6. Check your network supports it.

#### Issue 4: Project Just Created
Wait 3-5 minutes after creation for the database to be fully provisioned.

---

### Step 4: Update Your .env File

Once you have the correct connection string from Step 2:

#### For Development (Use Direct Connection):
```bash
cd "/Users/rohithperumandla/R&D venture Studio/code/dental-referral/backend"

# Update .env file with the correct string
cat > .env << 'EOF'
PORT=5000
NODE_ENV=development

# Replace with YOUR actual connection string from Supabase dashboard
DATABASE_URL="[PASTE YOUR CONNECTION STRING HERE]"

JWT_SECRET=dental-referral-super-secret-jwt-key-change-in-production-2024
JWT_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:3000

SUPABASE_URL=https://oezqvqdlmdowtloygkmz.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lenF2cWRsbWRvd3Rsb3lna216Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NDMxOTEsImV4cCI6MjA3NzQxOTE5MX0.liivtZV-2-R9RMkKSkSdEWbi3KnWKBGUA2eaiIvXs0o
EOF
```

---

### Step 5: Test the Connection

#### Option A: Using Prisma (Recommended)
```bash
cd backend
npx prisma db push
```

If successful, you'll see:
```
✔ Generated Prisma Client
Your database is now in sync with your Prisma schema
```

#### Option B: Using psql (if available)
```bash
psql "[YOUR CONNECTION STRING HERE]" -c "SELECT NOW();"
```

---

## 📋 What to Share With Me

Please share the following (you can mask sensitive parts):

1. **Is your project Active or Paused?**
   - Check on dashboard

2. **What's the exact connection string format from Supabase?**
   - Copy from Settings → Database → URI tab
   - You can share it like: `postgresql://postgres.XXX:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:XXXX/postgres`

3. **What region is shown?**
   - us-east-1, eu-west-1, etc.

4. **Any error messages?**
   - Share the exact error if connection still fails

---

## 🎯 Quick Checklist

- [ ] Go to Supabase dashboard
- [ ] Check project status (Active/Paused)
- [ ] If paused, restore it and wait 2 minutes
- [ ] Go to Settings → Database
- [ ] Copy the EXACT connection string from "URI" tab
- [ ] Replace password placeholder with: `dental-referral1`
- [ ] Update backend/.env with the new string
- [ ] Test with: `npx prisma db push`

---

## 💡 Example Connection Strings

### If Transaction Pooling:
```env
DATABASE_URL="postgresql://postgres.oezqvqdlmdowtloygkmz:dental-referral1@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
```

### If Direct Connection:
```env
DATABASE_URL="postgresql://postgres:dental-referral1@db.oezqvqdlmdowtloygkmz.supabase.co:5432/postgres"
```

### Additional SSL Parameters (if needed):
```env
DATABASE_URL="postgresql://postgres:dental-referral1@db.oezqvqdlmdowtloygkmz.supabase.co:5432/postgres?sslmode=require"
```

---

## 🚀 Once Connected

After successful connection, run:

```bash
cd backend

# Push schema to Supabase
npx prisma db push

# Generate Prisma Client
npm run prisma:generate

# View your database
npm run prisma:studio

# Start backend server
npm run dev
```

---

**Let me know what you find in your Supabase dashboard and we'll get this working!** 🎉


