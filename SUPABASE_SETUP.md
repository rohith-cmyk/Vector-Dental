# 🚀 Supabase Connection Setup

## ✅ Your Supabase Project Details

- **Project Reference**: `oezqvqdlmdowtloygkmz`
- **Project URL**: `https://oezqvqdlmdowtloygkmz.supabase.co`
- **Region**: `us-east-1`
- **Password**: `dental-referral1`

---

## 📝 Backend .env Configuration

Your `backend/.env` file should contain:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Supabase Database Connection (Transaction Mode - Recommended for Prisma)
DATABASE_URL="postgresql://postgres.oezqvqdlmdowtloygkmz:dental-referral1@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# JWT Configuration
JWT_SECRET=dental-referral-super-secret-jwt-key-change-in-production-2024
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Supabase Configuration (Optional - for future features)
SUPABASE_URL=https://oezqvqdlmdowtloygkmz.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lenF2cWRsbWRvd3Rsb3lna216Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NDMxOTEsImV4cCI6MjA3NzQxOTE5MX0.liivtZV-2-R9RMkKSkSdEWbi3KnWKBGUA2eaiIvXs0o
```

---

## 🔄 Alternative Connection String Options

### Option 1: Transaction Pooling (Recommended) ⭐
```
postgresql://postgres.oezqvqdlmdowtloygkmz:dental-referral1@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

**Best for**: Prisma, serverless functions, most use cases

### Option 2: Direct Connection
```
postgresql://postgres:dental-referral1@db.oezqvqdlmdowtloygkmz.supabase.co:5432/postgres
```

**Best for**: Long-running connections, migrations (if pooling has issues)

---

## 🚀 Setup Steps

### Step 1: Update .env file
The .env file is already created. We just need to update the DATABASE_URL.

### Step 2: Generate Prisma Client
```bash
cd backend
npm run prisma:generate
```

### Step 3: Run Migrations (Create all tables in Supabase)
```bash
npm run prisma:migrate
```

Or if you want to deploy existing migrations:
```bash
npx prisma migrate deploy
```

### Step 4: Verify Connection
```bash
npm run prisma:studio
```
Opens at http://localhost:5555 - You'll see your Supabase database!

### Step 5: Start Backend Server
```bash
npm run dev
```

---

## 📊 Expected Results

After running migrations, your Supabase database will have these tables:
1. ✅ clinics
2. ✅ users
3. ✅ contacts
4. ✅ referrals
5. ✅ referral_files
6. ✅ clinic_referral_links
7. ✅ notifications
8. ✅ _prisma_migrations

---

## 🔍 Verify in Supabase Dashboard

1. Go to: https://supabase.com/dashboard/project/oezqvqdlmdowtloygkmz/editor
2. Click **Table Editor** in the left sidebar
3. You should see all your tables listed!

---

## ⚠️ Important Notes

- **Connection Limit**: The `connection_limit=1` parameter is required for Prisma with PgBouncer
- **Password Security**: Never commit this file to git (it's in .gitignore)
- **JWT Secret**: Change to a strong random string in production
- **Region**: Your database is in `us-east-1` (East US)

---

## 🆘 Troubleshooting

### Error: "Can't reach database server"
- Check your internet connection
- Verify password is correct
- Check if Supabase project is active

### Error: "Prepared statements not supported"
- Make sure you're using `pgbouncer=true&connection_limit=1` in the connection string

### Error: "SSL required"
- Supabase requires SSL by default (already included in the connection string)

---

## ✅ Connection Status

- [x] Supabase project created
- [x] Project details obtained
- [x] Connection string configured
- [ ] Migrations pending (run next)
- [ ] Tables to be created
- [ ] Backend to be tested

---

**Ready to proceed? Follow the steps above!** 🚀






