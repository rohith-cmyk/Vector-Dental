# Quick Backend API Test Guide

## 1. Start the Backend Server

```bash
cd backend
npm run dev
```

Server should start on `http://localhost:5000`

## 2. Test with curl (Command Line)

### Step 1: Login to get a token
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@dental.com","password":"your-password"}'
```

**Copy the `token` from the response**

### Step 2: Create a Magic Referral Link
```bash
curl -X POST http://localhost:5000/api/magic-referral-links \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"label":"Test Link","accessCode":"123456"}'
```

**Save the `token` and `accessCode` from the response**

### Step 3: List your links
```bash
curl -X GET http://localhost:5000/api/magic-referral-links \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Step 4: Test public endpoint (get link info)
```bash
curl http://localhost:5000/api/public/referral-link/TOKEN_FROM_STEP_2
```

### Step 5: Verify access code
```bash
curl -X POST http://localhost:5000/api/public/referral-link/TOKEN_FROM_STEP_2/verify \
  -H "Content-Type: application/json" \
  -d '{"accessCode":"123456"}'
```

### Step 6: Submit a referral (full flow)
```bash
curl -X POST http://localhost:5000/api/public/referral-link/TOKEN_FROM_STEP_2/submit \
  -H "Content-Type: application/json" \
  -d '{
    "accessCode":"123456",
    "patientFirstName":"John",
    "patientLastName":"Doe",
    "patientDob":"1990-01-15",
    "gpClinicName":"Family Dental",
    "submittedByName":"Dr. Smith",
    "reasonForReferral":"Root canal needed"
  }'
```

---

## Using Postman (Easier GUI Option)

1. **Download Postman**: https://www.postman.com/downloads/

2. **Create a new Collection**: "Magic Referral Links API"

3. **Set Environment Variables**:
   - `base_url`: `http://localhost:5000/api`
   - `token`: (set after login)
   - `link_token`: (set after creating link)

4. **Create Requests**:
   - POST `{{base_url}}/auth/login` → Save token to environment
   - POST `{{base_url}}/magic-referral-links` with `Authorization: Bearer {{token}}`
   - GET `{{base_url}}/magic-referral-links` with `Authorization: Bearer {{token}}`
   - GET `{{base_url}}/public/referral-link/{{link_token}}`
   - POST `{{base_url}}/public/referral-link/{{link_token}}/verify`
   - POST `{{base_url}}/public/referral-link/{{link_token}}/submit`

---

## Using httpie (Pretty curl alternative)

```bash
# Install: brew install httpie (Mac) or pip install httpie

# Login
http POST localhost:5000/api/auth/login email=admin@dental.com password=your-password

# Create link (save token from login first)
http POST localhost:5000/api/magic-referral-links \
  Authorization:"Bearer YOUR_TOKEN" \
  label="Test Link" \
  accessCode="123456"

# List links
http GET localhost:5000/api/magic-referral-links \
  Authorization:"Bearer YOUR_TOKEN"

# Public: Get link info
http GET localhost:5000/api/public/referral-link/TOKEN_HERE

# Public: Verify code
http POST localhost:5000/api/public/referral-link/TOKEN_HERE/verify \
  accessCode="123456"

# Public: Submit referral
http POST localhost:5000/api/public/referral-link/TOKEN_HERE/submit \
  accessCode="123456" \
  patientFirstName="John" \
  patientLastName="Doe" \
  patientDob="1990-01-15" \
  gpClinicName="Family Dental" \
  submittedByName="Dr. Smith" \
  reasonForReferral="Root canal needed"
```

---

## Check if Server is Running

```bash
curl http://localhost:5000/api/health
```

Should return:
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "..."
}
```

