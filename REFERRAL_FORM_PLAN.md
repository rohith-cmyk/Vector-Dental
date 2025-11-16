# 📋 Referral Form Implementation Plan

## 🎯 Overview
Create a comprehensive referral form modal that opens when clicking "New Referral" button. The form should match the design from the attached images with all sections.

## 📐 Form Structure

### 1. **Modal Header** 
- Clinic information at the top (fetched from user context)
  - Clinic name (large)
  - Clinic address with location icon
  - Clinic phone with phone icon
  - Clinic icon/logo area
- "Change Practice" button (optional, top right)
- Close button (X)

### 2. **Form Sections** (in order):

#### **Section 1: Referring Doctor**
- First Name (input)
- Last Name (input)
- Info icon tooltip

#### **Section 2: Patient Information**
- First Name (input)
- Last Name (input)
- Phone (input with info icon)
- Toggle: "Text patient a copy" (with info icon)
- Expandable link: "+ Additional patient information"
  - When expanded:
    - Date of Birth (date picker)
    - Email (input)
    - Address (textarea)

#### **Section 3: Reason for Referral**
- Heading: "Reason for Referral (Oral Surgeon)" with info icon
- Button chips for common reasons:
  - Pain Evaluation
  - Extraction
  - Implant Evaluation
  - Sinus Lift
  - Evaluation of Lesion
  - Panoramic X-Ray
  - Third Molar Evaluation
  - Third Molar Extraction
- Comment textarea (for custom reason)
- "+ Choose preferred doctor" button (if referring to contact)

#### **Section 4: Clinic/Contact Selection**
- Dropdown/Selector to choose who to refer to
- Options:
  - Select from contacts list (by specialty)
  - Manual entry (if not in contacts)

#### **Section 5: Teeth Diagram**
- Clickable interactive teeth map
- **Adult Teeth (1-32)**:
  - Upper Right: 1-8
  - Upper Left: 9-16
  - Lower Left: 17-24
  - Lower Right: 25-32
- **Primary Teeth (A-T)**:
  - Upper Right: A-E
  - Upper Left: F-J
  - Lower Left: K-O
  - Lower Right: P-T
- "Select full mouth" button
- Selected teeth highlighted/stored in state
- Teeth selection displayed as chips/tags

#### **Section 6: File Upload**
- Drag & drop area with dashed border
- Icon showing two overlapping images
- Text: "Browse or drop files"
- Text: "X-Rays, DICOM, JPG, PDF and more"
- File list showing uploaded files
- Remove file buttons
- File size validation

#### **Section 7: Additional Options**
- Urgency selector (ROUTINE, URGENT, EMERGENCY)
- Notes textarea
- Save as Draft / Send buttons

## 🧩 Components to Create

### 1. `NewReferralModal.tsx`
- Main modal component
- Handles all form state
- Form submission
- Sections organization

### 2. `TeethDiagram.tsx`
- Interactive teeth visualization
- Handles tooth selection
- Displays selected teeth
- Supports adult and primary teeth

### 3. `FileUpload.tsx`
- Drag & drop file upload
- File validation
- File preview/list
- Remove files

### 4. `ReferralReasonButtons.tsx`
- Chip buttons for common reasons
- Comment field for custom reasons
- Preferred doctor selector

## 📊 Data Flow

```
User clicks "New Referral" 
  ↓
Open NewReferralModal
  ↓
Fetch clinic info from user context (useAuth)
Fetch contacts list (contactsService.getAll)
  ↓
User fills form:
  - Referring doctor info
  - Patient info
  - Selects clinic/contact to refer to
  - Selects reason for referral
  - Selects teeth (if applicable)
  - Uploads files
  - Sets urgency
  ↓
On submit:
  - Validate form
  - Upload files to Supabase Storage (future) or prepare for backend
  - Create referral via referralsService.create()
  - Include:
    - fromClinicId (current user's clinic)
    - toContactId (selected contact)
    - patientName (first + last)
    - patientDob, patientPhone, patientEmail
    - reason (from buttons or comment)
    - urgency
    - teeth (array of selected tooth numbers/letters)
    - files (array of file metadata)
    - status: 'DRAFT' or 'SENT'
  ↓
Close modal and refresh referrals list
```

## 🔗 API Integration

### Backend Endpoint (already exists):
```
POST /api/referrals
Body: {
  referralType: 'OUTGOING',
  fromClinicId: string,
  toContactId?: string,
  patientName: string,
  patientDob: string,
  patientPhone?: string,
  patientEmail?: string,
  reason: string,
  urgency: 'ROUTINE' | 'URGENT' | 'EMERGENCY',
  notes?: string,
  // Teeth selection (to be added to schema)
  // Files (already supported via ReferralFile model)
}
```

## 🎨 Styling Notes
- Dark theme (matching images)
- Form sections with clear spacing
- Consistent input styling
- Info icons with tooltips
- Button states (hover, active, disabled)
- Responsive layout
- Scrollable modal content if needed

## ✅ Implementation Order

1. Create NewReferralModal component structure
2. Add clinic info header (fetch from user)
3. Add form sections (referring doctor, patient info)
4. Create TeethDiagram component
5. Create FileUpload component
6. Add clinic/contact selector
7. Add reason for referral buttons
8. Wire up form submission
9. Connect "New Referral" button to modal
10. Add validation and error handling

## 📝 Notes
- Teeth selection should be stored as array (e.g., [1, 2, 3, "A", "B"])
- Files can be handled in frontend first, backend upload later
- Contact selector should filter by specialty if possible
- All form fields should have proper validation
- Modal should be scrollable for long forms

