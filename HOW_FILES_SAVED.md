# How JPG Files Are Saved to Supabase

## Important: Files Don't Go in the Database!

**Files (like JPG images) are NOT saved directly in the database.** Here's how it actually works:

---

## File Storage Architecture

### 1. **Supabase Storage** (For Files)
- Files (JPG, PDF, etc.) are stored in **Supabase Storage** (object storage, like S3)
- Storage is separate from the database
- Files are stored as binary data

### 2. **Database** (For Metadata Only)
- Only **metadata** about files is stored in the database
- `referral_files` table stores:
  - File name
  - File size
  - MIME type (e.g., "image/jpeg")
  - Storage key (path in Supabase Storage)
  - File URL (public URL to access the file)
  - Link to referral (foreign key)

---

## Complete Flow: How a JPG File Gets Saved

### Step 1: User Selects File (Frontend)

```javascript
// User selects a JPG file
const file = event.target.files[0] // File object
// Example: "image.jpg", size: 276.9 KB, type: "image/jpeg"
```

### Step 2: File Sent to Backend

The file is sent as part of the form submission (using FormData for multipart/form-data):

```javascript
const formData = new FormData()
formData.append('accessCode', '123456')
formData.append('patientFirstName', 'John')
formData.append('file', file) // ← JPG file here
```

### Step 3: Backend Receives File

Backend receives the file buffer/stream from the request.

### Step 4: Upload to Supabase Storage

**File:** `backend/src/utils/storage.ts`

```javascript
// Upload file to Supabase Storage
const { data, error } = await supabaseAdmin.storage
  .from('referral-files')  // Bucket name
  .upload('referrals/REFERRAL_ID/unique-id-image.jpg', fileBuffer, {
    contentType: 'image/jpeg',
    upsert: false
  })

// Result:
// storageKey = "referrals/abc123/def456-image.jpg"
// publicUrl = "https://your-project.supabase.co/storage/v1/object/public/referral-files/referrals/abc123/def456-image.jpg"
```

### Step 5: Save Metadata to Database

**File:** `backend/src/controllers/public.controller.ts`

```javascript
// Save file metadata to database
await prisma.referralFile.create({
  data: {
    referralId: referral.id,
    fileName: 'image.jpg',
    fileType: 'image/jpeg',
    fileUrl: publicUrl,              // ← URL to access file
    fileSize: 276900,                // Size in bytes
    storageKey: 'referrals/abc123/def456-image.jpg',  // ← Path in storage
    mimeType: 'image/jpeg',
  }
})
```

---

## Database Schema (Metadata Only)

```sql
-- referral_files table structure
CREATE TABLE referral_files (
  id UUID PRIMARY KEY,
  referral_id UUID,           -- Links to referral
  file_name TEXT,             -- "image.jpg"
  file_type TEXT,             -- "image/jpeg"
  file_url TEXT,              -- Public URL
  file_size INTEGER,          -- Bytes
  storage_key TEXT,           -- Path in Supabase Storage
  mime_type TEXT,             -- "image/jpeg"
  uploaded_at TIMESTAMP
)
```

**What's stored:**
- ✅ File metadata (name, size, type)
- ✅ Storage location (storage_key)
- ✅ Public URL (file_url)
- ❌ NOT the actual file data (that's in Storage)

---

## File Storage Location in Supabase

**Storage Bucket:** `referral-files`

**File Path Structure:**
```
referral-files/
  └── referrals/
      └── {referralId}/
          └── {uniqueId}-{fileName}
```

**Example:**
```
referral-files/
  └── referrals/
      └── abc-123-def-456/
          └── xyz789-Screenshot 2025-12-13 at 12.20.49 PM.png
```

---

## Current Implementation Status

### ✅ What's Working:
- Storage utility functions exist
- File upload abstraction (Supabase Storage or local filesystem)
- Database schema supports file metadata

### ⚠️ What Needs Fixing:
1. **Frontend:** Files are collected but not uploaded
2. **Backend:** `submitMagicReferral` doesn't handle file uploads
3. **Integration:** Need to connect file upload to referral submission

---

## How Files Should Be Uploaded

### Option 1: Upload After Referral Created (Recommended)

```javascript
// 1. Create referral first (no files)
const referral = await prisma.referral.create({ ... })

// 2. Upload files if any
if (files && files.length > 0) {
  for (const file of files) {
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
        fileUrl: uploadResult.fileUrl,
        storageKey: uploadResult.storageKey,
        // ... etc
      }
    })
  }
}
```

### Option 2: Multipart Form Data

Frontend sends form data with files:
```javascript
const formData = new FormData()
formData.append('accessCode', accessCode)
formData.append('patientFirstName', firstName)
formData.append('files', file1)
formData.append('files', file2)

fetch('/api/public/referral-link/TOKEN/submit', {
  method: 'POST',
  body: formData  // ← Not JSON, FormData!
})
```

Backend uses multer to parse:
```javascript
import multer from 'multer'
const upload = multer({ storage: multer.memoryStorage() })

router.post('/submit', upload.array('files'), submitMagicReferral)
```

---

## Supabase Storage Setup Required

To use Supabase Storage, you need to:

1. **Create Storage Bucket in Supabase:**
   - Go to Supabase Dashboard → Storage
   - Create bucket named `referral-files`
   - Set as public (if files should be publicly accessible)

2. **Set Environment Variable:**
   ```env
   USE_SUPABASE_STORAGE=true
   SUPABASE_STORAGE_BUCKET=referral-files
   ```

3. **Or Use Local Storage (Development):**
   - Files saved to `backend/uploads/` folder
   - No Supabase Storage setup needed
   - Files accessible at `/uploads/...`

---

## Summary

**Files (JPG, etc.):**
- Stored in **Supabase Storage** (object storage)
- NOT in the database

**Database:**
- Only stores **metadata** about files
- Links files to referrals
- Stores URLs to access files

**Current Issue:**
- File upload is not integrated into submission flow
- Need to add file handling to `submitMagicReferral` function

