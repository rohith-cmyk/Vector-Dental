# Referral Status Tracking System - Implementation Plan

## Feature Overview

Create a unique status tracking page for each referral submitted via referral link, allowing GPs to view the real-time status of their patient's referral through a timeline interface.

## User Flow

```
1. GP submits referral via referral link form
   ↓
2. System generates unique status token and creates status tracking URL
   ↓
3. GP receives/receives link to status tracking page
   ↓
4. Specialist reviews referral and updates status (Reviewed → Appointment Scheduled → Patient Attended → Completed)
   ↓
5. GP can check status page at any time to see current status
```

## Implementation Plan

### 1. Database Schema Changes

**Add status tracking token to Referral model:**
- Add `statusToken` field (String, unique, nullable) to Referral model
- This is different from `shareToken` - `statusToken` is for status tracking, `shareToken` is for viewing referral details
- Generate token when referral is created (from referral link submission)

**Optional: Add status history/audit trail:**
- Could add a `ReferralStatusHistory` model to track status changes over time
- Or just use the current status field (simpler for MVP)

### 2. Status Flow/Timeline

Based on the screenshot, the status progression is:
1. **Reviewed** (initial status when referral is received)
2. **Appointment Scheduled** 
3. **Doctor is looking at / Patient Attended**
4. **Completed**

**Map to existing statuses:**
- `SUBMITTED` → "Reviewed" (initial)
- `ACCEPTED` → "Appointment Scheduled"
- `SENT` → "Doctor is looking at / Patient Attended" (or create new status)
- `COMPLETED` → "Completed"

**Or create new status values:**
- `REVIEWED`
- `APPOINTMENT_SCHEDULED`
- `PATIENT_ATTENDED` or `IN_PROGRESS`
- `COMPLETED`

### 3. Backend Implementation

#### A. Update Referral Submission
**File:** `backend/src/controllers/public.controller.ts`

- In `submitReferral`, generate `statusToken` when creating referral
- Store status tracking URL (e.g., `/referral-status/[statusToken]`)
- Optionally: Include status URL in confirmation/response (or send via email later)

#### B. Status Tracking Endpoint
**File:** `backend/src/controllers/public.controller.ts`

1. `getReferralStatus(req, res, next)`
   - GET /api/public/referral-status/:statusToken
   - Public endpoint (no auth required)
   - Returns referral status information (status, timeline, basic info - no PHI if possible)
   - Returns status history if tracking it

#### C. Update Status Endpoint (for specialists)
**File:** `backend/src/controllers/referrals.controller.ts`

- Update existing `updateReferralStatus` to handle new statuses
- Or create specific endpoint: `updateReferralStatusTimeline`
- POST/PATCH /api/referrals/:id/status
- Allows updating status through the timeline

### 4. Frontend Implementation

#### A. Status Tracking Page (Public)
**File:** `frontend/src/app/referral-status/[statusToken]/page.tsx`

- New public page for viewing referral status
- Display timeline/status tracker (vertical flow like screenshot)
- Show current status highlighted
- Show referral basic info (patient name, date submitted, clinic name)
- Clean, professional design
- No authentication required
- Auto-refresh status (optional - polling or websockets)

**Timeline Component:**
- Vertical timeline with 4 stages:
  1. Reviewed (blue)
  2. Appointment Scheduled (green with checkmark when active)
  3. Doctor is looking at / Patient Attended (green with checkmark when active)
  4. Completed (solid green with white checkmark)
- Current status should be highlighted
- Past statuses should be marked as completed
- Future statuses should be greyed out

#### B. Status Update in Dashboard (for specialists)
**File:** `frontend/src/components/referrals/ReferralDetailsModal.tsx`

- Add status update interface
- Allow specialist to update status through timeline
- Could be a dropdown or timeline interface
- Save updates to backend

#### C. Include Status URL in Referral Submission
**File:** `frontend/src/app/refer-magic/[token]/page.tsx`

- After successful submission, show status tracking URL
- Display link: "Track your referral status: [URL]"
- Optionally: Copy to clipboard button
- Optionally: Send status URL via email (future enhancement)

### 5. Status Token Generation

**File:** `backend/src/utils/tokens.ts`

- Add `generateStatusToken()` function (similar to shareToken)
- Generate unique, URL-safe token (32-64 characters)
- Store in database when referral is created

### 6. Email Integration (Future Enhancement)

- Send status tracking URL to GP's email after referral submission
- Send email notifications when status changes (optional)
- For now: Display URL on submission confirmation page

## Technical Details

### Status Token vs Share Token

- **Status Token** (`statusToken`): For viewing/updating referral status (timeline view)
- **Share Token** (`shareToken`): For viewing full referral details (read-only)
- Both can coexist - serve different purposes

### Status Mapping

**Option 1: Use existing statuses**
- Map existing statuses to timeline stages
- Pros: No schema changes needed
- Cons: May not match exactly to timeline

**Option 2: Add new statuses**
- Add new enum values to ReferralStatus
- Pros: Clear mapping to timeline
- Cons: Requires schema migration

**Recommended: Option 1 for MVP (use existing statuses with mapping)**

### Status Timeline Stages

1. **Reviewed** → Status: `SUBMITTED` (default when created)
2. **Appointment Scheduled** → Status: `ACCEPTED`
3. **Doctor is looking at / Patient Attended** → Status: `SENT` or new status
4. **Completed** → Status: `COMPLETED`

### URL Structure

- Status tracking: `/referral-status/[statusToken]`
- Share referral (existing): `/view-referral/[shareToken]`

## Files to Create/Modify

**Backend:**
- `backend/prisma/schema.prisma` (add statusToken field)
- Migration file for statusToken
- `backend/src/controllers/public.controller.ts` (add getReferralStatus, update submitReferral)
- `backend/src/controllers/referrals.controller.ts` (update status update logic)
- `backend/src/routes/public.routes.ts` (add status route)
- `backend/src/utils/tokens.ts` (add generateStatusToken)

**Frontend:**
- `frontend/src/app/referral-status/[statusToken]/page.tsx` (new status tracking page)
- `frontend/src/components/referrals/StatusTimeline.tsx` (new timeline component)
- `frontend/src/components/referrals/ReferralDetailsModal.tsx` (add status update UI)
- `frontend/src/app/refer-magic/[token]/page.tsx` (show status URL after submission)
- `frontend/src/services/referrals.service.ts` (add status tracking methods)

## Timeline Component Design

Based on screenshot:
- Vertical flow from top to bottom
- Circular nodes for each stage
- Color coding:
  - Blue: Initial/current (Reviewed)
  - Green with grey checkmark: In progress
  - Solid green with white checkmark: Completed
- Text labels to the left/right of nodes
- Connecting lines between nodes

## Questions to Confirm

1. **Status Values**: Use existing status enum or add new ones?
2. **Status URL Display**: Show URL on submission confirmation, or send via email only?
3. **Status Updates**: Allow specialists to update status from timeline, or only from referral details modal?
4. **Status History**: Track status change history, or just show current status?
5. **Auto-refresh**: Should status page auto-refresh, or manual refresh only?

## Estimated Complexity

- **Backend**: Medium (token generation, status endpoints, status mapping)
- **Frontend**: Medium-High (timeline component, status page, status updates)
- **Total**: Medium-High complexity feature

## Next Steps

1. Review and approve plan
2. Implement database schema changes (add statusToken)
3. Create status tracking page and timeline component
4. Implement status update functionality
5. Test end-to-end flow

