# How to Check Backend Errors

## Quick Steps

### 1. Find Your Backend Terminal
- Look for the terminal window running the backend server
- It should show: `🚀 Server running on port 5000` (or your configured port)

### 2. When You Submit the Form
Watch for these error messages in the backend terminal:

#### A. Multer File Upload Error
```
Multer error: File too large
```
or
```
Multer error: File type image/gif is not allowed
```

#### B. Validation Error
```
Error: Validation failed
```

#### C. Database Error
```
Error submitting magic referral: {
  message: "..."  ← Look for this
  code: "..."
  name: "..."
}
```

#### D. Prisma/Database Error
```
PrismaClientKnownRequestError
```
or
```
Invalid value for argument
```

### 3. Common Error Messages

**"Missing required fields"**
→ Check that all fields are filled in the form

**"Referral link not found"**
→ The token in the URL is invalid

**"Invalid access code"**
→ The access code doesn't match

**"File upload error"**
→ File is too large (>10MB) or wrong type

**Database constraint errors**
→ Usually means a required field is missing or invalid

---

## What to Do Next

1. **Copy the error message** from backend terminal
2. **Share it here** so I can help fix it
3. **Or try submitting without files** to isolate the issue

---

## If You Don't See Backend Terminal

1. Open a new terminal
2. `cd backend`
3. `npm run dev`
4. Watch for errors when you submit the form
