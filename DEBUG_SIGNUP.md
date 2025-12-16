# Debug Signup Issues

## Database Connection Status

✅ **Database is connected and working:**
- Can connect to database
- Can query users (7 users exist)
- Can query clinics (8 clinics exist)
- Referral links table exists

## Signup Flow

The signup process has 3 steps:

1. **Validate input** (email, password, name, clinicName)
2. **Create user in Supabase Auth** (using Supabase admin API)
3. **Create clinic and user in database** (using Prisma transaction)

## Common Signup Errors

### Error 1: "User with this email already exists"
- **Cause:** Email is already registered
- **Fix:** Use a different email

### Error 2: "Failed to create auth user"
- **Cause:** Supabase connection issue or invalid Supabase config
- **Check:**
  - `SUPABASE_URL` in `.env`
  - `SUPABASE_SERVICE_ROLE_KEY` in `.env`
  - Supabase project is active

### Error 3: Database transaction error
- **Cause:** Database constraint violation or connection lost
- **Check:** Backend logs for specific error

### Error 4: Missing required fields
- **Cause:** Frontend not sending all required fields
- **Required:** email, password (min 6 chars), name, clinicName

## Test Signup Endpoint

Test directly with curl:

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "password123",
    "name": "New User",
    "clinicName": "New Clinic"
  }'
```

**Expected success response:**
```json
{
  "success": true,
  "message": "Account created! Please check your email to verify your account.",
  "data": {
    "user": { ... },
    "requiresEmailVerification": true
  }
}
```

## Check Backend Logs

When you try to signup, check your backend terminal for:
- Supabase auth errors
- Database errors
- Validation errors

## Verify Supabase Config

Check your `.env` file has:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

To get these:
1. Go to Supabase Dashboard
2. Project Settings → API
3. Copy "Project URL" → `SUPABASE_URL`
4. Copy "service_role" key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

## Frontend Signup Test

Check browser Network tab when signing up:
1. Find the `/api/auth/signup` request
2. Check Request payload (should have all 4 fields)
3. Check Response (will show the error)

