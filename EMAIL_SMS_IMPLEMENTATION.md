# Email & SMS Implementation Guide for Referrals

## Overview
This document outlines strategies for implementing email notifications with open tracking and SMS notifications for the dental referral system.

---

## 📧 Email Implementation with Open Tracking

### Option 1: Resend (Recommended for Startups)
**Why:** Modern API, great developer experience, built-in analytics, reasonable pricing

**Features:**
- ✅ Built-in open tracking (pixel tracking)
- ✅ Click tracking
- ✅ Bounce/spam handling
- ✅ Webhook support for real-time events
- ✅ Free tier: 3,000 emails/month
- ✅ Paid: $20/month for 50,000 emails

**Implementation:**
```typescript
// Install: npm install resend

import { Resend } from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY)

// Send referral email with tracking
await resend.emails.send({
  from: 'referrals@yourdomain.com',
  to: contact.email,
  subject: `New Referral: ${patientName}`,
  html: emailTemplate,
  // Open tracking is automatic
  // Click tracking is automatic
})
```

**Webhook for Open Tracking:**
```typescript
// Webhook endpoint to receive open events
POST /api/webhooks/resend
{
  "type": "email.opened",
  "data": {
    "email_id": "...",
    "timestamp": "2025-11-17T..."
  }
}
```

---

### Option 2: SendGrid
**Why:** Enterprise-grade, very reliable, extensive features

**Features:**
- ✅ Open/click tracking
- ✅ Advanced analytics dashboard
- ✅ Email validation
- ✅ Free tier: 100 emails/day
- ✅ Paid: $19.95/month for 50,000 emails

**Implementation:**
```typescript
// Install: npm install @sendgrid/mail

import sgMail from '@sendgrid/mail'
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

await sgMail.send({
  to: contact.email,
  from: 'referrals@yourdomain.com',
  subject: `New Referral: ${patientName}`,
  html: emailTemplate,
  trackingSettings: {
    clickTracking: { enable: true },
    openTracking: { enable: true }
  }
})
```

---

### Option 3: Mailgun
**Why:** Developer-friendly, good for transactional emails

**Features:**
- ✅ Open/click tracking
- ✅ Email validation API
- ✅ Free tier: 5,000 emails/month (first 3 months)
- ✅ Paid: $35/month for 50,000 emails

---

### Option 4: AWS SES + SNS (Cost-Effective)
**Why:** Very cheap, scalable, but more setup required

**Features:**
- ✅ $0.10 per 1,000 emails
- ✅ Open tracking via CloudWatch events
- ⚠️ Requires more configuration
- ⚠️ Need to handle bounces manually

---

## 📱 SMS Implementation

### Option 1: Twilio (Most Popular)
**Why:** Reliable, global coverage, great documentation

**Features:**
- ✅ Delivery receipts
- ✅ Read receipts (for supported carriers)
- ✅ Two-way messaging
- ✅ Free trial: $15.50 credit
- ✅ Pricing: ~$0.0075 per SMS (US)

**Implementation:**
```typescript
// Install: npm install twilio

import twilio from 'twilio'
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

await client.messages.create({
  body: `Hi ${patientName}, you've been referred to ${contact.name}. 
         Please call ${contact.phone} to schedule an appointment.`,
  from: process.env.TWILIO_PHONE_NUMBER, // Your Twilio number
  to: patientPhone,
  statusCallback: 'https://yourapp.com/api/webhooks/twilio', // Delivery status
})
```

**Webhook for Delivery Status:**
```typescript
POST /api/webhooks/twilio
{
  "MessageSid": "...",
  "MessageStatus": "delivered", // queued, sent, delivered, failed
  "To": "+1234567890"
}
```

---

### Option 2: AWS SNS (Cost-Effective)
**Why:** Very cheap, integrates with AWS ecosystem

**Features:**
- ✅ $0.00645 per SMS (US)
- ✅ Delivery receipts via SNS
- ⚠️ Less user-friendly than Twilio
- ⚠️ Requires AWS setup

---

### Option 3: MessageBird
**Why:** Good international coverage, competitive pricing

**Features:**
- ✅ Global reach
- ✅ Delivery receipts
- ✅ ~$0.01 per SMS

---

### Option 4: Vonage (formerly Nexmo)
**Why:** Good alternative to Twilio

**Features:**
- ✅ Similar features to Twilio
- ✅ Competitive pricing
- ✅ Good documentation

---

## 🗄️ Database Schema Changes

### Add Email Tracking Table
```prisma
model EmailLog {
  id            String   @id @default(uuid())
  referralId    String
  recipientType String  // 'CONTACT', 'PATIENT', 'CLINIC'
  recipientEmail String
  subject       String
  status        EmailStatus @default(PENDING)
  sentAt        DateTime?
  openedAt      DateTime?
  clickedAt     DateTime?
  bounceReason  String?
  provider      String  // 'RESEND', 'SENDGRID', etc.
  providerId    String? // External email ID for tracking
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  referral      Referral @relation(fields: [referralId], references: [id], onDelete: Cascade)

  @@index([referralId])
  @@index([status])
  @@index([providerId])
  @@map("email_logs")
}

enum EmailStatus {
  PENDING
  SENT
  DELIVERED
  OPENED
  CLICKED
  BOUNCED
  FAILED
}
```

### Add SMS Tracking Table
```prisma
model SmsLog {
  id            String   @id @default(uuid())
  referralId    String
  recipientPhone String
  message       String
  status        SmsStatus @default(PENDING)
  sentAt        DateTime?
  deliveredAt   DateTime?
  readAt        DateTime? // If supported by carrier
  errorMessage  String?
  provider      String  // 'TWILIO', 'AWS_SNS', etc.
  providerId    String? // External SMS ID
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  referral      Referral @relation(fields: [referralId], references: [id], onDelete: Cascade)

  @@index([referralId])
  @@index([status])
  @@index([providerId])
  @@map("sms_logs")
}

enum SmsStatus {
  PENDING
  QUEUED
  SENT
  DELIVERED
  READ
  FAILED
  UNDELIVERED
}
```

### Update Referral Model
```prisma
model Referral {
  // ... existing fields ...
  
  // Add email/SMS preferences
  sendEmailToContact Boolean @default(true)
  sendSmsToPatient   Boolean @default(false)
  emailSentAt        DateTime?
  smsSentAt          DateTime?
  
  // Relations
  emailLogs          EmailLog[]
  smsLogs            SmsLog[]
}
```

---

## 🎯 Implementation Strategy

### Phase 1: Email to Contacts (Specialists)
**When:** Outgoing referral is created and status changes to "SENT"

**Flow:**
1. User creates referral → Status: DRAFT
2. User sends referral → Status: SENT
3. System automatically:
   - Generates email with referral details
   - Sends to contact.email
   - Creates EmailLog record
   - Tracks open/click events via webhook

**Email Template:**
```
Subject: New Referral: [Patient Name] - [Urgency]

Dear [Contact Name],

You have received a new referral from [Clinic Name]:

Patient: [Patient Name]
DOB: [Date of Birth]
Reason: [Reason]
Urgency: [URGENT/ROUTINE/EMERGENCY]

[View Referral Details] (link to referral page)

Best regards,
[Clinic Name]
```

---

### Phase 2: Email Open Tracking
**Implementation:**
1. Include tracking pixel in email HTML:
   ```html
   <img src="https://yourapp.com/api/track/email/[emailLogId]/open.png" 
        width="1" height="1" style="display:none" />
   ```

2. Create tracking endpoint:
   ```typescript
   GET /api/track/email/:emailLogId/open.png
   - Logs open event
   - Updates EmailLog.openedAt
   - Returns 1x1 transparent pixel
   ```

3. Webhook from email provider (more reliable):
   ```typescript
   POST /api/webhooks/resend
   - Receives open events from Resend
   - Updates EmailLog in database
   ```

---

### Phase 3: SMS to Patients
**When:** Outgoing referral is sent (optional, user can enable)

**Flow:**
1. User creates referral with `sendSmsToPatient: true`
2. When referral status → SENT:
   - System sends SMS to patientPhone
   - Creates SmsLog record
   - Tracks delivery via webhook

**SMS Template:**
```
Hi [Patient Name], you've been referred to [Contact Name] 
([Specialty]) by [Clinic Name]. 

Please call [Contact Phone] to schedule your appointment.

Reason: [Reason]
Urgency: [Urgency]

Reply STOP to opt out.
```

---

## 📋 Recommended Tech Stack

### For MVP/Startup:
- **Email:** Resend (easiest setup, good free tier)
- **SMS:** Twilio (most reliable, good docs)

### For Scale:
- **Email:** SendGrid or AWS SES
- **SMS:** Twilio or AWS SNS

---

## 🔧 Implementation Steps

### Step 1: Set Up Email Service
1. Sign up for Resend (or chosen provider)
2. Verify your domain
3. Get API key
4. Add to `.env`:
   ```
   RESEND_API_KEY=re_xxxxx
   EMAIL_FROM=noreply@yourdomain.com
   ```

### Step 2: Set Up SMS Service
1. Sign up for Twilio
2. Get phone number
3. Get Account SID and Auth Token
4. Add to `.env`:
   ```
   TWILIO_ACCOUNT_SID=ACxxxxx
   TWILIO_AUTH_TOKEN=xxxxx
   TWILIO_PHONE_NUMBER=+1234567890
   ```

### Step 3: Database Migration
1. Add EmailLog and SmsLog models to schema
2. Run migration: `npx prisma migrate dev`
3. Update Referral model

### Step 4: Create Email Service
```typescript
// backend/src/services/email.service.ts
export class EmailService {
  async sendReferralEmail(referral: Referral, contact: Contact) {
    // Generate email template
    // Send via Resend
    // Create EmailLog record
    // Return tracking info
  }
  
  async trackEmailOpen(emailLogId: string) {
    // Update EmailLog.openedAt
  }
}
```

### Step 5: Create SMS Service
```typescript
// backend/src/services/sms.service.ts
export class SmsService {
  async sendReferralSms(referral: Referral) {
    // Generate SMS message
    // Send via Twilio
    // Create SmsLog record
    // Return tracking info
  }
  
  async handleDeliveryStatus(providerId: string, status: string) {
    // Update SmsLog status
  }
}
```

### Step 6: Integrate into Referral Flow
```typescript
// In referrals.controller.ts - updateReferralStatus
if (status === 'SENT') {
  // Send email to contact
  await emailService.sendReferralEmail(referral, contact)
  
  // Send SMS to patient (if enabled)
  if (referral.sendSmsToPatient && referral.patientPhone) {
    await smsService.sendReferralSms(referral)
  }
}
```

### Step 7: Create Webhook Endpoints
```typescript
// backend/src/routes/webhooks.routes.ts
router.post('/resend', handleResendWebhook)
router.post('/twilio', handleTwilioWebhook)
```

---

## 📊 Tracking & Analytics

### Email Metrics to Track:
- ✅ Sent count
- ✅ Delivered count
- ✅ Opened count (and timestamp)
- ✅ Clicked count
- ✅ Bounce rate
- ✅ Open rate = (Opened / Delivered) × 100

### SMS Metrics to Track:
- ✅ Sent count
- ✅ Delivered count
- ✅ Failed count
- ✅ Delivery rate = (Delivered / Sent) × 100

### Dashboard Display:
- Show email/SMS status on referral detail page
- Show "Email opened" badge
- Show "SMS delivered" badge
- Timeline of communication events

---

## 💰 Cost Estimates

### Email (Resend):
- Free: 3,000 emails/month
- Paid: $20/month for 50,000 emails
- **Per referral:** ~$0.0004 (if sending 50k/month)

### SMS (Twilio):
- $0.0075 per SMS (US)
- **Per referral:** $0.0075
- **100 referrals/month:** ~$0.75

### Total Cost (100 referrals/month):
- Email: Free (under 3k limit)
- SMS: $0.75
- **Total: ~$0.75/month**

---

## 🔒 Privacy & Compliance

### HIPAA Considerations:
- ✅ Use BAA (Business Associate Agreement) with providers
- ✅ Encrypt patient data in transit
- ✅ Don't include PHI in SMS (or encrypt)
- ✅ Log all communications for audit trail
- ✅ Allow patients to opt-out

### Opt-Out Handling:
- Add `smsOptOut` field to Referral
- Check before sending SMS
- Respect opt-out requests immediately

---

## 🚀 Quick Start Recommendation

**For MVP:**
1. Start with **Resend** for email (easiest, free tier)
2. Start with **Twilio** for SMS (most reliable)
3. Implement basic email sending first
4. Add open tracking via webhook
5. Add SMS as optional feature
6. Build analytics dashboard later

**Priority:**
1. ✅ Email to contacts (high priority)
2. ✅ Email open tracking (high priority)
3. ⚠️ SMS to patients (medium priority - can be opt-in)
4. ⚠️ Advanced analytics (low priority - can add later)

---

## 📝 Next Steps

1. Choose email provider (recommend Resend)
2. Choose SMS provider (recommend Twilio)
3. Set up accounts and get API keys
4. Create database migrations
5. Implement email service
6. Implement SMS service
7. Add webhook endpoints
8. Integrate into referral flow
9. Test thoroughly
10. Deploy and monitor

