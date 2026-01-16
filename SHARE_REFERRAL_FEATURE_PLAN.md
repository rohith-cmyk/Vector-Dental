# Share Referral Link Feature - Implementation Plan

## Feature Overview

When a referral is submitted and appears in the dashboard, add the ability to:
1. Generate a unique, view-only link for that specific referral
2. Send that link via email to the referring doctor/clinic

## User Flow

```
1. GP/Doctor submits referral via referral link form
   ↓
2. Referral appears in dashboard (status: SUBMITTED)
   ↓
3. Specialist views referral details in modal
   ↓
4. Specialist clicks "Share Referral" button
   ↓
5. System generates unique shareable link (e.g., /view-referral/[token])
   ↓
6. System sends email with link to referring clinic's email
   ↓
7. GP receives email with link to view the referral
```

## Implementation Plan

### 1. Database Schema

**Option A: Add share token to Referral model**
- Add `shareToken` field (String, unique, nullable) to Referral model
- Generated when first shared (unique token, similar to referral links)
- Index for fast lookup

**Option B: Create separate SharedReferralView model**
- Store share token separately
- Allows tracking of sharing history
- More flexible for future features

**Recommended: Option A (simpler for MVP)**

### 2. Backend Implementation

#### A. Database Migration
- Add `shareToken` String? @unique field to Referral model
- Generate migration

#### B. Controller Functions
**File:** `backend/src/controllers/referrals.controller.ts`

1. `shareReferral(req, res, next)`
   - POST /api/referrals/:id/share
   - Authenticated endpoint (specialist only)
   - Generate unique share token if doesn't exist
   - Save token to referral
   - Send email with link
   - Return share URL

#### C. Public View Endpoint
**File:** `backend/src/controllers/public.controller.ts`

1. `getSharedReferral(req, res, next)`
   - GET /api/public/referral/:shareToken
   - Public endpoint (no auth required)
   - Fetch referral by shareToken
   - Return referral data (read-only)
   - Include clinic info, patient info, reason, files, etc.

#### D. Email Service
- Use existing email infrastructure (Supabase or email service)
- Send email with:
  - Subject: "Referral Shared - [Patient Name]"
  - Body: Link to view referral + brief message
  - Recipient: referral.fromClinicEmail (GP's email)

#### E. Routes
**File:** `backend/src/routes/referrals.routes.ts`
- POST /api/referrals/:id/share - Share referral

**File:** `backend/src/routes/public.routes.ts`
- GET /api/public/referral/:shareToken - View shared referral

### 3. Frontend Implementation

#### A. ReferralDetailsModal
**File:** `frontend/src/components/referrals/ReferralDetailsModal.tsx`

- Add "Share Referral" button in footer actions
- Button icon: Share2 or Mail
- On click: Call share API endpoint
- Show loading state
- Show success message/confirmation

#### B. Public View Page
**File:** `frontend/src/app/view-referral/[shareToken]/page.tsx`

- New page for viewing shared referrals
- Similar layout to ReferralDetailsModal but as standalone page
- Read-only view (no edit capabilities)
- Clean, professional design
- Display all referral information
- Allow file downloads
- No authentication required

#### C. Service
**File:** `frontend/src/services/referrals.service.ts`

- Add `shareReferral(id: string): Promise<{ shareUrl: string }>` method
- Calls POST /api/referrals/:id/share

### 4. Email Template

```
Subject: Referral Shared - [Patient Name]

Hello [GP/Doctor Name],

Your referral for [Patient Name] has been reviewed. You can view the referral details using the link below:

[View Referral Link]

This link provides a read-only view of the referral information you submitted.

Thank you,
[Clinic Name]
```

## Technical Details

### Share Token Generation
- Use similar approach to referral link tokens
- Generate unique, unguessable token (32-64 chars)
- Store in database for lookup
- URL format: `/view-referral/[shareToken]`

### Security Considerations
- Share tokens should be unique and unguessable
- No sensitive operations via shared link (read-only)
- Consider token expiration (optional for MVP)
- Log access for audit trail (optional)

### Email Service
- Check if email service exists in backend
- If using Supabase, use Supabase email
- If not, may need to integrate email service (SendGrid, AWS SES, etc.)
- Or use mailto: link as fallback (less ideal)

## Questions to Confirm

1. **Email Recipient**: Send to `fromClinicEmail` (the GP's email from referral)?
2. **Token Expiration**: Should share tokens expire after a certain time?
3. **Email Service**: Do you have email sending configured, or should we use mailto: as fallback?
4. **Button Location**: In ReferralDetailsModal footer, or in the referrals list?
5. **Share URL Format**: `/view-referral/[token]` or `/shared/[token]`?

## Files to Create/Modify

**Backend:**
- `backend/src/controllers/referrals.controller.ts` (add shareReferral)
- `backend/src/controllers/public.controller.ts` (add getSharedReferral)
- `backend/src/routes/referrals.routes.ts` (add share route)
- `backend/src/routes/public.routes.ts` (add view route)
- `backend/prisma/schema.prisma` (add shareToken field)
- Migration file

**Frontend:**
- `frontend/src/app/view-referral/[shareToken]/page.tsx` (new public view page)
- `frontend/src/components/referrals/ReferralDetailsModal.tsx` (add share button)
- `frontend/src/services/referrals.service.ts` (add share method)

## Estimated Complexity

- **Backend**: Medium (token generation, email sending, new endpoint)
- **Frontend**: Low-Medium (new page, button, service method)
- **Total**: Medium complexity feature

