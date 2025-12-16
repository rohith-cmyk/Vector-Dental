# Debugging 500 Internal Server Error

## Current Issue
Getting a 500 error when submitting the magic referral form.

## How to Debug

### 1. Check Backend Terminal Logs
The backend should show the actual error. Look for:
- "Error submitting magic referral:" logs
- Any stack traces
- Database errors
- Validation errors

### 2. Common Causes of 500 Errors

#### A. Multer File Upload Error
- **Symptom**: Error happens when files are included
- **Check**: Backend logs for "Multer error:"
- **Fix**: Check file size (max 10MB) and file type (JPG, PNG, PDF, DICOM)

#### B. Database Error
- **Symptom**: Error during referral creation
- **Check**: Backend logs for Prisma errors
- **Possible causes**:
  - Missing required fields
  - Invalid date format for patientDob
  - Foreign key constraint (clinicId doesn't exist)
  - ReferralLink not found

#### C. Validation Error Not Caught
- **Symptom**: Validation fails but returns 500 instead of 400
- **Check**: Backend logs for "Validation failed"
- **Fix**: Check that all required fields are sent

#### D. File Upload Storage Error
- **Symptom**: Error when saving files
- **Check**: Backend logs for "Failed to upload file:"
- **Possible causes**:
  - Supabase Storage not configured
  - Storage bucket doesn't exist
  - Permission issues

### 3. Quick Test Without Files

Try submitting WITHOUT any files to isolate the issue:

1. Fill out the form
2. Don't attach any files
3. Submit
4. If it works → issue is with file upload
5. If it fails → issue is with form data validation/processing

### 4. Check Request Payload

In browser DevTools → Network tab:
1. Find the `/submit` request
2. Check the Request Payload
3. Verify all required fields are present:
   - `accessCode`
   - `patientFirstName`
   - `patientLastName`
   - `patientDob` (should be ISO date string)
   - `gpClinicName`
   - `submittedByName`
   - `reasonForReferral`

### 5. Check Backend Response

In Network tab, check the Response:
- Should show the actual error message in development mode
- Will show "Internal server error" in production

---

## Next Steps

1. **Check your backend terminal** - this will show the exact error
2. **Share the error message** from backend logs
3. If no logs appear, the error might be happening before the controller

---

## Recent Changes Made

1. ✅ Added multer error handling
2. ✅ Added better error logging in controller
3. ✅ Fixed patientDob validation

The error should now show in backend logs with more details.
