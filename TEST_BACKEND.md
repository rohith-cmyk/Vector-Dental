# Testing Backend API - Magic Referral Links

This guide shows you how to test the backend API without the frontend using `curl` or Postman.

## Prerequisites

1. Backend server must be running:
   ```bash
   cd backend
   npm run dev
   ```

2. You'll need an authentication token. Get one by logging in first (see Step 1 below).

## Base URL

Default: `http://localhost:5000/api`

---

## Step 1: Get Authentication Token

First, you need to authenticate and get a JWT token.

### Option A: Login (if you have an existing user)

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@dental.com",
    "password": "your-password"
  }'
```

Response will include a `token` field. Copy this token for subsequent requests.

### Option B: Signup (create a new user)

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Dr. Test User",
    "clinicName": "Test Clinic"
  }'
```

---

## Step 2: Create a Magic Referral Link

**Endpoint:** `POST /api/magic-referral-links`

**Headers:**
- `Authorization: Bearer YOUR_TOKEN_HERE`
- `Content-Type: application/json`

**Request Body:**
```json
{
  "label": "GP Standing Referral Link",
  "accessCode": "123456"
}
```

**Example:**
```bash
curl -X POST http://localhost:5000/api/magic-referral-links \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "label": "GP Standing Referral Link",
    "accessCode": "123456"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "referralLink": {
      "id": "uuid-here",
      "token": "random-token-here",
      "isActive": true,
      "label": "GP Standing Referral Link",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "specialist": { ... }
    },
    "accessCode": "123456",
    "referralUrl": "http://localhost:3000/refer-magic/random-token-here"
  }
}
```

**Important:** Save the `token` and `accessCode` from the response - you'll need them for testing the public endpoints!

---

## Step 3: List Your Referral Links

**Endpoint:** `GET /api/magic-referral-links`

```bash
curl -X GET http://localhost:5000/api/magic-referral-links \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Step 4: Get Link Details

**Endpoint:** `GET /api/magic-referral-links/:id`

```bash
curl -X GET http://localhost:5000/api/magic-referral-links/LINK_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Step 5: Update a Link

**Endpoint:** `PUT /api/magic-referral-links/:id`

**Toggle active status:**
```bash
curl -X PUT http://localhost:5000/api/magic-referral-links/LINK_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "isActive": false
  }'
```

**Update label:**
```bash
curl -X PUT http://localhost:5000/api/magic-referral-links/LINK_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "label": "Updated Label"
  }'
```

**Regenerate access code:**
```bash
curl -X PUT http://localhost:5000/api/magic-referral-links/LINK_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "regenerateAccessCode": true
  }'
```

---

## Step 6: Delete a Link

**Endpoint:** `DELETE /api/magic-referral-links/:id`

```bash
curl -X DELETE http://localhost:5000/api/magic-referral-links/LINK_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Testing Public Endpoints (No Auth Required)

These endpoints don't require authentication, but need a valid token + access code.

### Get Link Info by Token

**Endpoint:** `GET /api/public/referral-link/:token`

```bash
curl -X GET http://localhost:5000/api/public/referral-link/TOKEN_FROM_STEP_2
```

### Verify Access Code

**Endpoint:** `POST /api/public/referral-link/:token/verify`

```bash
curl -X POST http://localhost:5000/api/public/referral-link/TOKEN_FROM_STEP_2/verify \
  -H "Content-Type: application/json" \
  -d '{
    "accessCode": "123456"
  }'
```

### Submit a Referral (Magic Link Flow)

**Endpoint:** `POST /api/public/referral-link/:token/submit`

```bash
curl -X POST http://localhost:5000/api/public/referral-link/TOKEN_FROM_STEP_2/submit \
  -H "Content-Type: application/json" \
  -d '{
    "accessCode": "123456",
    "patientFirstName": "John",
    "patientLastName": "Doe",
    "patientDob": "1990-01-15",
    "insurance": "Blue Cross Blue Shield",
    "gpClinicName": "Family Dental Practice",
    "submittedByName": "Dr. Smith",
    "submittedByPhone": "555-1234",
    "reasonForReferral": "Root canal treatment needed",
    "notes": "Patient prefers morning appointments"
  }'
```

---

## Using Postman

1. **Import Collection:**
   - Create a new collection in Postman
   - Add the requests above
   - Set environment variables:
     - `base_url`: `http://localhost:5000/api`
     - `token`: Your auth token (update after login)
     - `link_token`: Token from created referral link
     - `link_id`: ID from created referral link
     - `access_code`: Access code from created referral link

2. **Use Variables:**
   - Replace `YOUR_TOKEN_HERE` with `{{token}}`
   - Replace `TOKEN_FROM_STEP_2` with `{{link_token}}`
   - Replace `LINK_ID_HERE` with `{{link_id}}`

---

## Quick Test Script

Save this as `test-api.sh` and run: `chmod +x test-api.sh && ./test-api.sh`

```bash
#!/bin/bash

BASE_URL="http://localhost:5000/api"
EMAIL="admin@dental.com"
PASSWORD="your-password"

echo "1. Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Token: $TOKEN"

echo -e "\n2. Creating referral link..."
LINK_RESPONSE=$(curl -s -X POST "$BASE_URL/magic-referral-links" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"label":"Test Link","accessCode":"123456"}')

echo "$LINK_RESPONSE" | jq '.'

LINK_TOKEN=$(echo $LINK_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo -e "\nLink Token: $LINK_TOKEN"

echo -e "\n3. Listing referral links..."
curl -s -X GET "$BASE_URL/magic-referral-links" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

echo -e "\n4. Getting public link info..."
curl -s -X GET "$BASE_URL/public/referral-link/$LINK_TOKEN" | jq '.'

echo -e "\n5. Verifying access code..."
curl -s -X POST "$BASE_URL/public/referral-link/$LINK_TOKEN/verify" \
  -H "Content-Type: application/json" \
  -d '{"accessCode":"123456"}' | jq '.'

echo -e "\nDone!"
```

---

## Troubleshooting

1. **"Connection refused"**: Make sure backend server is running (`npm run dev`)

2. **"Unauthorized"**: Check that your token is valid and properly formatted (should start with `Bearer `)

3. **"Token not found"**: The referral link token should be from Step 2 response

4. **"Invalid access code"**: Make sure you're using the access code that was returned when creating the link

