# 🔄 Two-Way Referral System - Redesign Plan

## 🎯 Vision

Transform the dental referral system from a **one-way directory** to a **complete referral network** where clinics can:
- ✅ Send referrals TO specialists
- ✅ Receive referrals FROM other clinics
- ✅ Share a public link for easy referral submission
- ✅ Get notified of new incoming referrals
- ✅ Track both outgoing and incoming referral status

---

## 🏗️ Architecture Changes

### **Current System (One-Way):**
```
Your Clinic
    ↓
Creates Referral
    ↓
Sends to Contact (from your directory)
```

### **New System (Two-Way Network):**
```
                    YOUR CLINIC
                         │
        ┌────────────────┴────────────────┐
        ↓                                  ↓
  OUTGOING REFERRALS              INCOMING REFERRALS
  (You send out)                  (Others send to you)
        ↓                                  ↓
  To your contacts                 From other clinics
  Track status                     Accept/Reject/Complete
```

---

## 📊 Database Schema Updates

### **1. Update Referrals Table**

**Add New Fields:**
```prisma
model Referral {
  // Existing fields
  id            String
  patientName   String
  patientDob    DateTime
  reason        String
  urgency       ReferralUrgency
  status        ReferralStatus
  notes         String?
  createdAt     DateTime
  updatedAt     DateTime
  
  // NEW: Referral Direction
  referralType  ReferralType  // OUTGOING or INCOMING
  
  // For OUTGOING referrals (you send)
  fromClinicId  String        // Your clinic
  toContactId   String?       // Specialist from your contacts
  toClinicId    String?       // If referring to another clinic in system
  
  // For INCOMING referrals (you receive)
  // fromClinicId is still your clinic (receiving)
  fromClinicName    String?   // Name of referring clinic (external)
  fromClinicEmail   String?   // Their contact email
  fromClinicPhone   String?   // Their contact phone
  referringDentist  String?   // Name of dentist who referred
  
  // Common
  files         ReferralFile[]
}

enum ReferralType {
  OUTGOING
  INCOMING
}
```

### **2. Add Shareable Links Table**

```prisma
model ClinicReferralLink {
  id          String   @id @default(uuid())
  clinicId    String   @unique
  slug        String   @unique  // e.g., "smith-dental-clinic"
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  clinic      Clinic   @relation(fields: [clinicId], references: [id])
}
```

**Example Usage:**
```
https://dentalreferral.com/refer/smith-dental-clinic
```

### **3. Add Notifications Table**

```prisma
model Notification {
  id          String            @id @default(uuid())
  clinicId    String
  userId      String?
  type        NotificationType
  referralId  String?
  title       String
  message     String
  isRead      Boolean           @default(false)
  createdAt   DateTime          @default(now())
  
  clinic      Clinic   @relation(fields: [clinicId], references: [id])
  referral    Referral? @relation(fields: [referralId], references: [id])
}

enum NotificationType {
  NEW_INCOMING_REFERRAL
  REFERRAL_ACCEPTED
  REFERRAL_REJECTED
  REFERRAL_COMPLETED
  STATUS_UPDATE
}
```

---

## 🎨 Updated Dashboard Design

### **New Dashboard Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│  STATS CARDS                                                 │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ Sent Out     │ │ Received     │ │ Pending      │        │
│  │ 45 referrals │ │ 32 referrals │ │ 12 actions   │        │
│  │ ↑ 16%        │ │ ↑ 8%         │ │ 🔔 Urgent    │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
├─────────────────────────────────────────────────────────────┤
│  CHARTS                                                      │
│  ┌──────────────────────────────┐  ┌─────────────────┐     │
│  │ Referral Trends              │  │ By Specialty    │     │
│  │ [Sent Line] [Received Line]  │  │ [Donut Chart]   │     │
│  └──────────────────────────────┘  └─────────────────┘     │
├─────────────────────────────────────────────────────────────┤
│  🔔 PENDING INCOMING REFERRALS (Need Your Action)           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Patient   │ From Clinic  │ Reason  │ Urgency │ Action│  │
│  │ John Doe  │ Oak Dental   │ Braces  │ URGENT  │Accept │  │
│  │ Jane Smith│ Pine Clinic  │ Surgery │ ROUTINE │Accept │  │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  📤 RECENT OUTGOING REFERRALS (Sent by You)                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Patient   │ To Specialist│ Status   │ Date    │View  │  │
│  │ Bob Jones │ Dr. Williams │ ACCEPTED │ 2d ago  │ 👁   │  │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📱 Updated Pages

### **1. Dashboard** (Redesigned)
- Two separate tables: Incoming vs Outgoing
- Priority: Incoming referrals that need action
- Stats split by direction

### **2. Referrals Page** (Two Tabs)
```
┌─────────────────────────────────────┐
│  [📥 Received]  [📤 Sent]            │
├─────────────────────────────────────┤
│                                      │
│  RECEIVED Tab:                       │
│  - All referrals sent TO you         │
│  - Filter: Pending/Accepted/etc      │
│  - Actions: Accept, Reject, Complete │
│                                      │
│  SENT Tab:                           │
│  - All referrals you sent OUT        │
│  - Filter by status                  │
│  - View specialist responses         │
└─────────────────────────────────────┘
```

### **3. New: Public Referral Form**
**Route:** `/refer/[clinicSlug]`

**Features:**
- No login required
- Simple form for referring clinics
- Submit directly
- Email confirmation

### **4. New: Notifications Page**
**Route:** `/notifications`

**Features:**
- List of all notifications
- Unread badge
- Mark as read
- Filter by type
- Click to view referral

### **5. New: My Referral Link Page**
**Route:** `/settings/referral-link`

**Features:**
- Show your unique link
- Copy to clipboard
- QR code
- Email template to share with others
- Enable/disable link

---

## 🔧 API Endpoints to Add

### **Referrals:**
```
POST   /api/referrals/outgoing          # Create outgoing referral
POST   /api/referrals/incoming          # Create incoming referral
GET    /api/referrals/outgoing          # List sent referrals
GET    /api/referrals/incoming          # List received referrals
PATCH  /api/referrals/:id/accept        # Accept incoming referral
PATCH  /api/referrals/:id/reject        # Reject incoming referral
```

### **Public Form:**
```
GET    /api/public/clinic/:slug         # Get clinic info for form
POST   /api/public/refer/:slug          # Submit referral (no auth)
```

### **Notifications:**
```
GET    /api/notifications                # List all notifications
GET    /api/notifications/unread         # Count unread
PATCH  /api/notifications/:id/read      # Mark as read
PATCH  /api/notifications/read-all      # Mark all as read
```

### **Shareable Link:**
```
GET    /api/clinic/referral-link        # Get your link
POST   /api/clinic/referral-link        # Generate link
PATCH  /api/clinic/referral-link        # Update/toggle active
```

---

## 📧 Email Notifications

### **Trigger Events:**
1. **New Incoming Referral** → Email to clinic
2. **Referral Accepted** → Email to referring clinic
3. **Referral Rejected** → Email to referring clinic
4. **Referral Completed** → Email to both parties

### **Email Service:**
- Use SendGrid or AWS SES
- Or start with simple nodemailer

---

## 🎯 Implementation Priority

### **Phase 1: Core Two-Way System** (Do First)
1. ✅ Update database schema
2. ✅ Redesign dashboard (incoming/outgoing)
3. ✅ Update referrals page with tabs
4. ✅ Basic create/accept/reject flow

### **Phase 2: Public Form** (Next)
5. ✅ Create shareable link system
6. ✅ Build public referral form
7. ✅ Email notifications for new referrals

### **Phase 3: Advanced** (Later)
8. ✅ In-app notification center
9. ✅ Email templates
10. ✅ QR codes for referral links
11. ✅ Analytics on referral sources

---

## 📊 User Stories

### **As a General Dentist:**
1. I want to send patients to specialists
2. I want to track if they accepted my referrals
3. I want to see when treatment is completed

### **As a Specialist:**
1. I want to receive referrals from general dentists
2. I want a shareable link to make it easy for them
3. I want to review and accept/reject referrals
4. I want to notify them when I've completed treatment

### **As Any Clinic:**
1. I want to see both incoming and outgoing in one place
2. I want notifications when something needs my attention
3. I want a dashboard showing what needs action TODAY

---

## 🚀 **Ready to Start?**

This is the complete redesign plan! 

**Shall I start implementing?** I'll begin with:
1. Database schema updates
2. Dashboard redesign
3. Then move to public form and notifications

**Let's build this properly!** 💪
