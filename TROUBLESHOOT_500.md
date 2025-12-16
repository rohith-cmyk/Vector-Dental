# Troubleshooting 500 Internal Server Error

## Quick Fix Steps

### 1. **Restart Backend Server**
Stop and restart your backend to pick up the new error logging:
```bash
cd backend
# Press Ctrl+C to stop
npm run dev
```

### 2. **Submit Form and Check Backend Terminal**

When you submit the form, **watch your backend terminal**. You should see:

#### Success (should show):
```
=== SUBMIT MAGIC REFERRAL ===
Request body keys: [...]
Request body values (sanitized): {...}
```

#### Error (will show):
```
=== ERROR DETAILS ===
Error name: [error name]
Error message: [error message]
Stack: [stack trace]
===================
```

### 3. **Common Errors and Fixes**

#### A. "Missing required fields"
**Fix**: Check that all form fields are filled

#### B. "Validation failed"
**Fix**: Check the validation errors shown in logs

#### C. "MulterError" or file upload error
**Fix**: 
- File too large? Reduce file size (max 10MB)
- Wrong file type? Use JPG, PNG, PDF, or DICOM

#### D. Database/Prisma error
**Possible causes**:
- `patientDob` format is wrong
- `clinicId` doesn't exist
- `referralLinkId` is invalid

**Fix**: Check the specific Prisma error message

#### E. "Referral link not found"
**Fix**: The token in the URL is invalid or expired

---

## Still Not Working?

### Option 1: Test Without Files
Submit the form **without any files attached**. This will tell us if the issue is:
- ✅ Works without files → Problem is with file upload
- ❌ Still fails → Problem is with form data

### Option 2: Check Browser Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Submit the form
4. Click on the failed request
5. Check:
   - **Request Payload**: Does it show FormData?
   - **Response**: What error message does it show?

### Option 3: Share Backend Logs
**Copy and paste the backend terminal output** when you submit the form. Look for:
- Lines starting with `===`
- Lines with `Error:`
- Any red text

---

## What to Share for Help

Please share:
1. **Backend terminal output** when you submit (the error logs)
2. **Browser console errors** (F12 → Console tab)
3. **Network tab response** (F12 → Network → click failed request → Response tab)

This will help identify the exact issue!
