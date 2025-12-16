# Understanding Magic Referral Links vs User Profile

## Important Clarification

The **Magic Referral Link** we built is **NOT** for changing your profile. It's for **GPs to submit referrals** to you.

---

## What Magic Referral Links Do

### Purpose
- Allows **GPs (General Practitioners)** who are **NOT logged in** to submit referrals to specialists
- Creates a secure, token-based submission form
- Two-factor authentication: Token (in URL) + Access Code (entered by GP)

### Flow:
```
1. Specialist (YOU) creates a magic referral link
   ↓
2. Specialist gets a URL + access code
   ↓
3. Specialist shares URL + code with a GP
   ↓
4. GP opens URL (no login needed)
   ↓
5. GP enters access code
   ↓
6. GP fills referral form (patient info, reason, etc.)
   ↓
7. GP submits referral
   ↓
8. Referral appears in YOUR dashboard as "SUBMITTED"
```

---

## What Your Profile Shows

Your profile information (Demo User, demo@clinic.com, Demo Dental Clinic) is:
- **Your logged-in account** (Specialist account)
- **Separate** from the magic referral link functionality
- **Not affected** by creating or using magic referral links

---

## How to Test Magic Referral Links

### As Specialist (You - Logged In):

1. **Create a Magic Referral Link:**
   - Go to: Settings → Magic Referral Links
   - Click "Create New Link"
   - Save the access code and URL that's shown

2. **Share with a GP:**
   - Copy the referral URL
   - Share it with a GP along with the access code

### As GP (Not Logged In):

1. **Open the referral URL** (in incognito window or different browser)
   - Example: `http://localhost:3000/refer-magic/xK9pL2mN8qR4tV6wY0zA...`

2. **Enter the access code** you were given
   - Example: `123456`

3. **Fill out the referral form:**
   - GP clinic name
   - Patient information
   - Reason for referral
   - etc.

4. **Submit the referral**

5. **Go back to your dashboard** (as specialist):
   - Check "Referrals" page
   - You should see the new referral with status "SUBMITTED"

---

## Your Profile vs Magic Links

| Your Profile | Magic Referral Links |
|-------------|---------------------|
| Your account info | Submission tool for GPs |
| Shows: Demo User, demo@clinic.com | Creates: Referral submission URL |
| Used for: Authentication, settings | Used for: Accepting referrals |
| Changes when: You update profile | Creates: New referral entries |

---

## If You Want to Change Your Profile

To change your profile information (name, email, clinic):
1. Go to **Settings → Profile** (if that page exists)
2. Or update it in the database directly
3. The magic referral link feature doesn't handle profile updates

---

## Testing Checklist

To properly test the magic referral link feature:

- [ ] As Specialist: Create a magic referral link
- [ ] Save the access code and URL
- [ ] Open the URL in incognito/private window (simulate GP)
- [ ] Enter the access code
- [ ] Fill out referral form
- [ ] Submit referral
- [ ] Go back to specialist dashboard
- [ ] Verify referral appears in "Referrals" list
- [ ] Verify referral has status "SUBMITTED"

---

## Summary

- ✅ **Magic Referral Links** = Tool for GPs to submit referrals to you
- ✅ **Your Profile** = Your account information (separate feature)
- ❌ Magic links do NOT change your profile
- ✅ Magic links create NEW REFERRALS in your system

