# Fix File Upload for Magic Referral Submission

## Current Issue

When submitting a referral via magic link with a JPG file:
1. Frontend collects the file but doesn't upload it
2. Backend doesn't handle file uploads in the submission endpoint
3. Files are not saved

## How Files Should Be Saved

### Architecture:
- **Files** → Saved to **Supabase Storage** (not database)
- **Metadata** → Saved to **database** (`referral_files` table)

### Flow:
1. User selects JPG file
2. Submit referral (creates referral record)
3. Upload files to Supabase Storage
4. Save file metadata to database

---

## Solution: Add File Upload Support

### Step 1: Update Backend Route (Accept Files)

**File:** `backend/src/routes/public.routes.ts`

```typescript
import multer from 'multer'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
})

router.post(
  '/referral-link/:token/submit',
  upload.array('files', 10), // Accept up to 10 files
  validateRequest([...]),
  publicController.submitMagicReferral
)
```

### Step 2: Update Controller to Handle Files

**File:** `backend/src/controllers/public.controller.ts`

```typescript
import { uploadFile } from '../utils/storage'

export async function submitMagicReferral(req, res, next) {
  // ... existing code ...
  
  // Create referral first
  const referral = await prisma.referral.create({ ... })
  
  // Upload files if any
  const files = req.files as Express.Multer.File[]
  if (files && files.length > 0) {
    for (const file of files) {
      try {
        // Upload to Supabase Storage
        const uploadResult = await uploadFile(
          file.buffer,
          file.originalname,
          file.mimetype,
          referral.id
        )
        
        // Save metadata to database
        await prisma.referralFile.create({
          data: {
            referralId: referral.id,
            fileName: uploadResult.fileName,
            fileType: uploadResult.mimeType,
            fileUrl: uploadResult.fileUrl,
            fileSize: uploadResult.fileSize,
            storageKey: uploadResult.storageKey,
            mimeType: uploadResult.mimeType,
          },
        })
      } catch (fileError) {
        console.error('Failed to upload file:', fileError)
        // Continue with other files even if one fails
      }
    }
  }
  
  // ... rest of code ...
}
```

### Step 3: Update Frontend to Send Files

**File:** `frontend/src/app/refer-magic/[token]/page.tsx`

Change from JSON to FormData:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  
  if (!validateForm()) return

  try {
    setSubmitting(true)
    
    // Create FormData instead of JSON
    const formData = new FormData()
    formData.append('accessCode', accessCode)
    formData.append('patientFirstName', formData.patientFirstName)
    formData.append('patientLastName', formData.patientLastName)
    formData.append('patientDob', formData.patientDob)
    formData.append('gpClinicName', formData.gpClinicName)
    formData.append('submittedByName', formData.submittedByName)
    formData.append('reasonForReferral', formData.reasonForReferral)
    
    if (formData.insurance) formData.append('insurance', formData.insurance)
    if (formData.submittedByPhone) formData.append('submittedByPhone', formData.submittedByPhone)
    if (formData.notes) formData.append('notes', formData.notes)
    
    // Append files
    files.forEach((file) => {
      formData.append('files', file)
    })

    // Send FormData (not JSON)
    const response = await api.post(
      `/public/referral-link/${token}/submit`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    
    // ... handle success ...
  } catch (error) {
    // ... handle error ...
  }
}
```

---

## Quick Fix for Now (Without Files)

If you want to test submission without files first:

1. The submission should work without files
2. The "Internal server error" is likely due to a validation or database error
3. Check backend logs for the specific error

---

## Supabase Storage Setup

To enable file uploads to Supabase:

1. **Create Storage Bucket:**
   - Go to Supabase Dashboard → Storage
   - Create bucket: `referral-files`
   - Make it public (or configure RLS)

2. **Set Environment Variable:**
   ```env
   USE_SUPABASE_STORAGE=true
   SUPABASE_STORAGE_BUCKET=referral-files
   ```

3. **Or Use Local Storage (Dev):**
   - Files saved to `backend/uploads/` folder
   - No additional setup needed

