# How Magic Referral Link is Created - Complete Flow

## Overview

When a Specialist (logged-in user) creates a magic referral link, here's exactly what happens step-by-step:

---

## Step-by-Step Flow

### 1️⃣ **User Action (Frontend)**

**Location:** `/settings/magic-referral-links` page

**User does:**
1. Clicks **"Create New Link"** button
2. Modal opens asking for:
   - **Label** (optional): e.g., "GP Standing Link"
   - **Access Code** (optional): Can set custom code like "123456", or leave blank for auto-generation
3. Clicks **"Create Link"** button

---

### 2️⃣ **Frontend Service Call**

**File:** `frontend/src/services/magic-referral-link.service.ts`

```typescript
async create(data: CreateReferralLinkRequest): Promise<CreateReferralLinkResponse> {
  const response = await api.post('/magic-referral-links', {
    label: "GP Standing Link",  // optional
    accessCode: "123456"        // optional, or undefined for auto-generated
  })
  return response.data.data
}
```

**What happens:**
- Makes POST request to `/api/magic-referral-links`
- Sends label and optional access code
- **Authorization header** is automatically added by `api.ts` interceptor:
  ```javascript
  Authorization: Bearer <user's-supabase-token>
  ```

---

### 3️⃣ **Backend Route Handler**

**File:** `backend/src/routes/magic-referral-link.routes.ts`

```typescript
router.post(
  '/',
  authenticateSupabase,  // ← Verifies user is logged in
  validateRequest([...]), // ← Validates input
  magicReferralLinkController.createReferralLink
)
```

**What happens:**
1. **Authentication middleware** checks the Bearer token:
   - Verifies token with Supabase
   - Extracts user info (userId, clinicId, email, role)
   - Attaches `req.user` to the request
   
2. **Validation middleware** checks:
   - Label is optional, max 100 chars
   - Access code is optional, must be 4-8 digits if provided

---

### 4️⃣ **Controller - Create Referral Link**

**File:** `backend/src/controllers/magic-referral-link.controller.ts`

```typescript
export async function createReferralLink(req, res, next) {
  const userId = req.user.userId  // From authentication middleware
  
  // 1. Generate secure random token (32 bytes, base64url encoded)
  const token = generateReferralToken()
  // Example: "xK9pL2mN8qR4tV6wY0zA1bC3dE5fG7hI9jK1lM3nO5pQ7rS9tU1vW3xY5z"
  
  // 2. Generate or use provided access code
  const accessCode = providedAccessCode || generateAccessCode(6)
  // Example: "123456" (if provided) or "847392" (if auto-generated)
  
  // 3. Hash the access code (NEVER store plaintext!)
  const accessCodeHash = await hashAccessCode(accessCode)
  // Example: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
  
  // 4. Save to database
  const referralLink = await prisma.referralLink.create({
    data: {
      specialistId: userId,        // Who created it
      token: token,                 // Unique, unguessable token
      accessCodeHash: accessCodeHash, // Hashed code (never plaintext)
      label: label || null,         // Optional label
      isActive: true,               // Starts as active
    }
  })
  
  // 5. Return response with plaintext access code (ONLY TIME shown)
  res.json({
    referralLink: { ... },
    accessCode: "123456",  // ← Plaintext code (shown once)
    referralUrl: "http://localhost:3000/refer-magic/xK9pL2mN8qR4tV6wY0zA..."
  })
}
```

---

### 5️⃣ **Token Generation**

**File:** `backend/src/utils/tokens.ts`

```typescript
export function generateReferralToken(): string {
  // Generate 32 random bytes
  const randomBytes = crypto.randomBytes(32)
  // Convert to base64url (URL-safe, no padding)
  return randomBytes.toString('base64url')
}
```

**Example token:** `xK9pL2mN8qR4tV6wY0zA1bC3dE5fG7hI9jK1lM3nO5pQ7rS9tU1vW3xY5z`

**Properties:**
- ✅ Cryptographically secure (uses Node.js crypto.randomBytes)
- ✅ 32 bytes = 43 characters when base64url encoded
- ✅ URL-safe (can be used in URLs)
- ✅ Unique (database constraint prevents duplicates)

---

### 6️⃣ **Access Code Generation**

**File:** `backend/src/utils/tokens.ts`

```typescript
export function generateAccessCode(length: number = 6): string {
  const min = Math.pow(10, length - 1)  // 100000
  const max = Math.pow(10, length) - 1  // 999999
  const code = crypto.randomInt(min, max + 1)  // Random 6-digit number
  return code.toString().padStart(length, '0')  // Ensure 6 digits
}
```

**Example:** `847392`

**Properties:**
- ✅ Random 6-digit number (default)
- ✅ Cryptographically secure (crypto.randomInt)
- ✅ Configurable length (4-8 digits)

---

### 7️⃣ **Access Code Hashing**

**File:** `backend/src/utils/tokens.ts` and `backend/src/utils/hash.ts`

```typescript
export async function hashAccessCode(accessCode: string): Promise<string> {
  // Uses bcrypt with 10 salt rounds
  return hashPassword(accessCode)
  // Returns: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
}
```

**Security:**
- ✅ Plaintext code is **NEVER** stored in database
- ✅ Uses bcrypt hashing (salt rounds: 10)
- ✅ One-way hash (cannot be reversed)
- ✅ Plaintext code only shown **once** in response

---

### 8️⃣ **Database Storage**

**Table:** `referral_links`

```sql
INSERT INTO referral_links (
  id,                    -- UUID: "550e8400-e29b-41d4-a716-446655440000"
  specialistId,          -- UUID: User who created it
  token,                 -- "xK9pL2mN8qR4tV6wY0zA1bC3dE5fG7hI9jK1lM3nO5pQ7rS9tU1vW3xY5z"
  accessCodeHash,        -- "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
  isActive,              -- true
  label,                 -- "GP Standing Link" or NULL
  createdAt,             -- 2024-01-15T10:30:00Z
  updatedAt              -- 2024-01-15T10:30:00Z
)
```

**Database Constraints:**
- `token` must be UNIQUE (enforced by database)
- `specialistId` references `users.id`
- Foreign key cascade on delete

---

### 9️⃣ **Response to Frontend**

**Backend returns:**
```json
{
  "success": true,
  "data": {
    "referralLink": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "token": "xK9pL2mN8qR4tV6wY0zA1bC3dE5fG7hI9jK1lM3nO5pQ7rS9tU1vW3xY5z",
      "isActive": true,
      "label": "GP Standing Link",
      "createdAt": "2024-01-15T10:30:00Z",
      "specialist": { ... }
    },
    "accessCode": "123456",  // ← Plaintext (shown ONLY once!)
    "referralUrl": "http://localhost:3000/refer-magic/xK9pL2mN8qR4tV6wY0zA1bC3dE5fG7hI9jK1lM3nO5pQ7rS9tU1vW3xY5z"
  }
}
```

**Important:** 
- `accessCodeHash` is **NEVER** returned in API responses
- Plaintext `accessCode` is only shown **once** during creation

---

### 🔟 **Frontend Displays Result**

**File:** `frontend/src/app/(dashboard)/settings/magic-referral-links/page.tsx`

**Modal shows:**
1. ⚠️ Warning: "Save these details now - the access code will not be shown again!"
2. **Access Code:** `123456` (with copy button)
3. **Referral URL:** `http://localhost:3000/refer-magic/...` (with copy button)
4. **"Done"** button to close

---

## Security Features

### 🔒 Token Security
- **Unguessable:** 32 bytes of cryptographically secure random data
- **Unique:** Database enforces uniqueness
- **URL-safe:** Base64url encoding allows use in URLs

### 🔒 Access Code Security
- **Hashed:** Stored as bcrypt hash (never plaintext)
- **Shown once:** Plaintext only in creation response
- **Cannot retrieve:** Once lost, must regenerate

### 🔒 Authentication
- **Required:** User must be logged in (verified by Supabase token)
- **Ownership:** Links are tied to `specialistId` (userId)
- **Cannot access others:** Users can only see/manage their own links

---

## Complete Data Flow Diagram

```
User clicks "Create New Link"
         ↓
Frontend: POST /api/magic-referral-links
         ↓
Backend: authenticateSupabase middleware
         ↓ (verifies user token)
Backend: Controller receives request
         ↓
Backend: generateReferralToken() → "xK9pL2..."
Backend: generateAccessCode(6) → "847392" (or use provided)
Backend: hashAccessCode("847392") → "$2a$10$..."
         ↓
Database: INSERT INTO referral_links
         ↓
Backend: Return response with plaintext code
         ↓
Frontend: Show modal with access code & URL
         ↓
User: Saves access code and URL
```

---

## Key Points

1. **Token** = Public identifier in URL (unguessable, unique)
2. **Access Code** = Second factor authentication (hashed in DB, shown once)
3. **Specialist ID** = Links the referral link to the creator
4. **Security** = Token + Access Code = Dual authentication
5. **One-Time Display** = Access code plaintext only shown during creation

---

## Example: Complete Creation

**Input:**
- Label: "GP Standing Link"
- Access Code: (auto-generated)

**Generated:**
- Token: `xK9pL2mN8qR4tV6wY0zA1bC3dE5fG7hI9jK1lM3nO5pQ7rS9tU1vW3xY5z`
- Access Code: `847392`
- Hash: `$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy`

**Stored in DB:**
- ✅ Token
- ✅ Hash (NOT plaintext code)
- ✅ Specialist ID
- ✅ Label

**Shown to User:**
- ✅ Access Code: `847392` (once)
- ✅ URL: `http://localhost:3000/refer-magic/xK9pL2...`

**Never Stored/Shown Again:**
- ❌ Plaintext access code (lost forever after creation)

