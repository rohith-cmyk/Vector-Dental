# Testing Checklist - Magic Referral Links

## Server Status

**Backend:** http://localhost:5000
**Frontend:** http://localhost:3000 (or check your terminal output)

---

## Step-by-Step Testing Guide

### ✅ Step 1: Verify Servers Are Running

**Backend Health Check:**
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "..."
}
```

**Frontend:** Open http://localhost:3000 in your browser

---

### ✅ Step 2: Login as Specialist

1. Go to http://localhost:3000/login
2. Login with your credentials
3. Verify you're redirected to dashboard

---

### ✅ Step 3: Create Magic Referral Link

1. Navigate to **Settings** → **Magic Referral Links**
2. Click **"Create New Link"** button
3. Fill in:
   - **Label** (optional): "Test GP Link"
   - **Access Code** (optional): Leave blank for auto-generated, or enter "123456"
4. Click **"Create Link"**
5. **IMPORTANT:** 
   - You'll see the access code ONCE - save it!
   - Copy the referral URL
   - Click "Done"

---

### ✅ Step 4: Test Public Submission Flow (As GP)

1. **Open referral URL in incognito/private window** (to simulate GP not logged in)
   - Example: http://localhost:3000/refer-magic/YOUR_TOKEN_HERE

2. **Enter Access Code:**
   - Enter the access code you saved
   - Click "Continue"
   - Should proceed to form

3. **Fill Referral Form:**
   - **Your Information:**
     - GP Clinic Name: "Test Dental Clinic"
     - Your Name: "Dr. Test GP"
     - Phone (optional)
   
   - **Patient Information:**
     - First Name: "John"
     - Last Name: "Doe"
     - Date of Birth: Any date
     - Insurance (optional): "Blue Cross"
   
   - **Referral Details:**
     - Reason: "Root canal treatment needed"
     - Notes (optional): "Patient prefers morning appointments"
   
   - **Attachments (optional):** Upload files if needed

4. **Submit Referral:**
   - Click "Submit Referral"
   - Should see success message

---

### ✅ Step 5: Verify Referral in Specialist Dashboard

1. Go back to specialist dashboard (logged in window)
2. Navigate to **Referrals** page
3. Look for the new referral with:
   - Patient: "John Doe"
   - Status: "SUBMITTED"
   - From: "Test Dental Clinic"
4. Check **Notifications** - should have new referral notification

---

### ✅ Step 6: Test Link Management

1. Go to **Settings** → **Magic Referral Links**
2. **Test Actions:**
   - ✅ Copy URL (should copy to clipboard)
   - ✅ Toggle Active/Inactive
   - ✅ Update label
   - ✅ Regenerate access code (new code shown once)
   - ✅ Delete link (with confirmation)

---

## Expected Behaviors

### ✅ Success Cases

- [ ] Can create referral link successfully
- [ ] Access code is shown only once on creation
- [ ] Referral link URL is accessible publicly (no login)
- [ ] Access code verification works
- [ ] Invalid access code shows error
- [ ] Referral submission works
- [ ] Referral appears in specialist dashboard
- [ ] Notification is created
- [ ] Can manage links (edit, delete, toggle)

### ⚠️ Edge Cases to Test

- [ ] Invalid token in URL → Shows error
- [ ] Wrong access code → Shows error
- [ ] Inactive link → Shows error
- [ ] Missing required fields → Shows validation errors
- [ ] Regenerated access code → Old code no longer works
- [ ] Deleted link → Cannot access anymore

---

## Common Issues & Solutions

### Backend not starting
- Check if port 5000 is already in use
- Check `.env` file has all required variables
- Check database connection

### Frontend errors
- Check if backend is running
- Check browser console for errors
- Verify API URL in `.env` or `.env.local`

### Access code not working
- Make sure you're using the correct access code
- Check if link is still active
- If regenerated, use the NEW code

### Referral not appearing
- Check backend logs for errors
- Verify database has the referral
- Check referral status filter in dashboard

---

## API Testing (Optional)

Test endpoints directly with curl:

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"YOUR_EMAIL","password":"YOUR_PASSWORD"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# 2. Create link
curl -X POST http://localhost:5000/api/magic-referral-links \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"label":"Test Link","accessCode":"123456"}'

# 3. List links
curl http://localhost:5000/api/magic-referral-links \
  -H "Authorization: Bearer $TOKEN"
```

---

## Notes

- Access codes are hashed, so you can't retrieve them after creation
- Tokens are cryptographically secure and unique
- PHI (patient data) is not logged in server logs
- File upload is ready but may need endpoint connection

