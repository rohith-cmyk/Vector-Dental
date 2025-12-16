# Magic Referral Link + Access Code Implementation Plan

## Executive Summary

This document outlines the plan to implement a "magic referral link" system with access codes for specialist referral intake. Specialists can create secure token-based links with access codes, and GPs (not logged in) can submit referrals through these links.

---

## Current State Analysis

### Existing Functionality

1. **Referral Link System (Clinic-based)**
   - `ClinicReferralLink` model exists with slug-based URLs (e.g., `/refer/smith-dental-clinic`)
   - No access codes
   - Clinic-level, not specialist-level
   - Located in: `backend/src/controllers/referral-link.controller.ts`

2. **Referral System**
   - `Referral` model exists but with different field names:
     - Uses `patientName` (single field) vs required `patient_first_name` + `patient_last_name`
     - Uses `fromClinicName`, `referringDentist` vs required `gp_clinic_name`, `submitted_by_name`
     - Missing `insurance` field
     - Missing `referral_link_id` foreign key
     - Different status enum: `DRAFT | SENT | ACCEPTED | COMPLETED | CANCELLED` vs required `submitted | pending_review | accepted | rejected`
     - Located in: `backend/prisma/schema.prisma`

3. **File Storage**
   - `ReferralFile` model exists with `fileUrl` field
   - No actual file upload implementation (TODO comments in code)
   - Uses Supabase storage (based on config)
   - Missing `storage_key` and `mime_type` fields as specified

4. **Authentication**
   - Clinic-based system (users belong to clinics)
   - No explicit "specialist" entity
   - Users have roles: `ADMIN | STAFF`
   - **Key Decision**: Map `specialist_id` → `userId` (the logged-in user creating the link)

---

## Required Changes

### 1. Database Schema Changes

#### New Table: `referral_links`
```prisma
model ReferralLink {
  id              String   @id @default(uuid())
  specialistId    String   // FK to User.id (the specialist creating the link)
  token           String   @unique // Random 32-64 char token
  accessCodeHash  String   // Hashed access code (bcrypt)
  isActive        Boolean  @default(true)
  label           String?  // Optional label like "Standing GP Link"
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  specialist      User     @relation(fields: [specialistId], references: [id], onDelete: Cascade)
  referrals       Referral[]

  @@index([specialistId])
  @@index([token])
  @@map("referral_links")
}
```

#### Updates to `Referral` Model
Add new fields to support the magic link flow:
```prisma
model Referral {
  // ... existing fields ...
  
  // New fields for magic link flow
  referralLinkId        String?  // FK to ReferralLink
  patientFirstName      String?  // Split from patientName for new flow
  patientLastName       String?  // Split from patientName for new flow
  insurance             String?  // New field
  gpClinicName          String?  // Maps to fromClinicName
  submittedByName       String?  // Maps to referringDentist
  submittedByPhone      String?  // New field
  
  // Relation
  referralLink          ReferralLink? @relation(fields: [referralLinkId], references: [id], onDelete: SetNull)
  
  // ... rest of existing fields ...
}
```

**Note**: Keep existing fields for backward compatibility. Use new fields when `referralLinkId` is present.

#### Updates to `ReferralFile` Model
```prisma
model ReferralFile {
  // ... existing fields ...
  
  storageKey     String?  // Where file lives (S3 key, Supabase path, etc.)
  mimeType       String?  // More accurate than fileType
  
  // ... rest of existing fields ...
}
```

#### Updates to `User` Model
Add relation to `ReferralLink`:
```prisma
model User {
  // ... existing fields ...
  referralLinks  ReferralLink[]
  // ... rest of existing fields ...
}
```

#### New Referral Status Enum (Optional Enhancement)
Consider adding new statuses while keeping existing ones:
```prisma
enum ReferralStatus {
  DRAFT
  SENT
  SUBMITTED        // New: from magic link
  PENDING_REVIEW   // New
  ACCEPTED
  REJECTED         // New
  COMPLETED
  CANCELLED
}
```

---

### 2. Backend Implementation

#### A. Utility Functions (`backend/src/utils/tokens.ts`)
Create new file for token and access code generation:
- `generateReferralToken()`: Generate secure random token (32-64 chars)
- `generateAccessCode()`: Generate random access code (6-8 digits)
- `hashAccessCode()`: Hash code using bcrypt
- `verifyAccessCode()`: Verify code against hash

#### B. Storage Abstraction (`backend/src/utils/storage.ts`)
Create storage abstraction layer:
- Support Supabase Storage (existing)
- Support local file system (dev)
- Support S3 (future)
- Functions: `uploadFile()`, `getFileUrl()`, `deleteFile()`

#### C. Controllers

**Create `backend/src/controllers/magic-referral-link.controller.ts`**:
1. `createReferralLink(req, res, next)`
   - Authenticated endpoint
   - Generate token + access code
   - Hash access code
   - Save to DB
   - Return link URL + plaintext access code (only time shown)

2. `listReferralLinks(req, res, next)`
   - Authenticated endpoint
   - List all links for logged-in specialist
   - **DO NOT** return access codes (hashed only)

3. `updateReferralLink(req, res, next)`
   - Authenticated endpoint
   - Update `isActive`, `label`
   - Can regenerate access code (returns new plaintext)

4. `deleteReferralLink(req, res, next)`
   - Authenticated endpoint
   - Soft delete or hard delete

**Update `backend/src/controllers/public.controller.ts`**:
1. `getReferralLinkByToken(req, res, next)`
   - Public endpoint
   - Verify token exists and is active
   - Return clinic/specialist info (no PHI)

2. `verifyAccessCode(req, res, next)`
   - Public endpoint
   - Verify token + access code
   - Return session token or success flag

3. `submitMagicReferral(req, res, next)`
   - Public endpoint (no auth required)
   - Verify token + access code
   - Create referral with new fields
   - Handle file uploads
   - Create notification
   - **HIPAA**: Do not log PHI

**Create `backend/src/controllers/file-upload.controller.ts`**:
1. `uploadReferralFile(req, res, next)`
   - Public endpoint (with token verification)
   - Upload file to storage
   - Return file metadata

#### D. Routes

**Create `backend/src/routes/magic-referral-link.routes.ts`**:
- `POST /api/magic-referral-links` - Create link
- `GET /api/magic-referral-links` - List links
- `PUT /api/magic-referral-links/:id` - Update link
- `DELETE /api/magic-referral-links/:id` - Delete link

**Update `backend/src/routes/public.routes.ts`**:
- `GET /api/public/referral-link/:token` - Get link info
- `POST /api/public/referral-link/:token/verify` - Verify access code
- `POST /api/public/referral-link/:token/submit` - Submit referral
- `POST /api/public/referral-link/:token/files` - Upload files

---

### 3. Frontend Implementation

#### A. Specialist Dashboard (Logged In)

**Create/Update `frontend/src/app/(dashboard)/settings/magic-referral-links/page.tsx`**:
- List all referral links
- Create new link (shows access code once)
- Toggle active/inactive
- Delete links
- Copy link URL

**Components**:
- `MagicReferralLinkCard.tsx` - Display link info
- `CreateMagicLinkModal.tsx` - Form to create link

#### B. Public Submission Flow (Not Logged In)

**Create `frontend/src/app/refer-magic/[token]/page.tsx`**:
1. Step 1: Access Code Entry
   - Form with access code input
   - Verify code on submit

2. Step 2: Referral Form
   - All referral fields (matching new schema)
   - File upload
   - Submit referral

3. Step 3: Success Page
   - Confirmation message

**Components**:
- `AccessCodeForm.tsx` - Access code entry
- `MagicReferralForm.tsx` - Referral submission form
- Update `FileUpload.tsx` if needed

#### C. Services

**Create `frontend/src/services/magic-referral-link.service.ts`**:
- `create()`, `list()`, `update()`, `delete()` methods

**Update `frontend/src/services/referrals.service.ts`**:
- Add `submitMagicReferral()` method

---

### 4. Types

**Update `shared/src/types.ts`**:
```typescript
export interface ReferralLink {
  id: string
  specialistId: string
  token: string
  isActive: boolean
  label?: string
  createdAt: string
  updatedAt: string
  // Note: accessCodeHash is never exposed
}

export interface CreateReferralLinkRequest {
  label?: string
  accessCode: string // Plaintext, will be hashed on backend
}

export interface CreateReferralLinkResponse {
  referralLink: ReferralLink
  accessCode: string // Returned once, plaintext
  referralUrl: string // Full URL with token
}

export interface MagicReferralSubmission {
  accessCode: string
  patientFirstName: string
  patientLastName: string
  patientDob?: string
  insurance?: string
  reasonForReferral?: string
  notes?: string
  gpClinicName?: string
  submittedByName?: string
  submittedByPhone?: string
  files?: File[]
}
```

---

## Implementation Steps

### Phase 1: Database Schema
1. ✅ Create migration for `referral_links` table
2. ✅ Add fields to `Referral` model
3. ✅ Add fields to `ReferralFile` model
4. ✅ Update `User` model with relation
5. ✅ Run migration

### Phase 2: Backend Utilities
1. ✅ Create `tokens.ts` utility
2. ✅ Create `storage.ts` abstraction
3. ✅ Test utilities

### Phase 3: Backend Controllers & Routes
1. ✅ Implement magic referral link controller
2. ✅ Update public controller
3. ✅ Create file upload controller
4. ✅ Create/update routes
5. ✅ Add validation middleware
6. ✅ Test endpoints

### Phase 4: Frontend Specialist Dashboard
1. ✅ Create magic referral links page
2. ✅ Create components
3. ✅ Create service
4. ✅ Test flow

### Phase 5: Frontend Public Flow
1. ✅ Create public submission page
2. ✅ Implement access code verification
3. ✅ Implement referral form
4. ✅ Implement file upload
5. ✅ Test complete flow

### Phase 6: Integration & Testing
1. ✅ End-to-end testing
2. ✅ Security audit (no PHI in logs)
3. ✅ Error handling
4. ✅ Documentation

---

## Security Considerations

1. **Token Generation**: Use cryptographically secure random generator (Node.js `crypto.randomBytes`)
2. **Access Code**: Hash with bcrypt (salt rounds: 10)
3. **PHI Logging**: 
   - Do not log patient names, DOB, insurance in server logs
   - Only log token, referral ID, timestamps
4. **Rate Limiting**: Consider adding rate limiting to public endpoints
5. **Token Uniqueness**: Ensure tokens are unique (database constraint)

---

## Design Decisions

1. **specialist_id → userId**: Since there's no specialist entity, we map to the logged-in user creating the link. The user represents the specialist.

2. **Backward Compatibility**: Keep existing referral fields for backward compatibility. New fields are used when `referralLinkId` is present.

3. **Access Code Display**: Access code is shown in plaintext only once when created/regenerated. Never stored or returned in plaintext after that.

4. **Storage**: Use abstraction layer to support multiple storage backends (Supabase, S3, local).

5. **File Upload**: Upload files separately or as part of referral submission. Consider multipart form data.

---

## Open Questions

1. Should we support multiple active referral links per specialist?
   - **Answer**: Yes, multiple links with different labels (e.g., "GP Referrals", "Standing Link")

2. Should access codes be regeneratable?
   - **Answer**: Yes, allow regeneration (invalidates old code)

3. Should we track access code verification attempts?
   - **Answer**: Consider rate limiting to prevent brute force

4. How long should referral links remain active?
   - **Answer**: Indefinitely until manually deactivated (MVP)

5. Should we support expiration dates?
   - **Answer**: Not in MVP, can add later

---

## Next Steps

1. Review and approve this plan
2. Start with Phase 1 (Database Schema)
3. Iterate through phases
4. Test thoroughly
5. Deploy

