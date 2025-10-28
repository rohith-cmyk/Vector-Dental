# 🗄️ Database Quick Reference

Quick commands for checking and managing your database.

---

## ⚡ Most Common Commands

### **1. Check If Database Exists**
```bash
/opt/homebrew/opt/postgresql@14/bin/psql -l | grep dental_referral
```
✅ Should show: `dental_referral`

---

### **2. List All Tables**
```bash
/opt/homebrew/opt/postgresql@14/bin/psql -d dental_referral -c "\dt"
```
✅ Should show 6 tables: clinics, users, contacts, referrals, referral_files, _prisma_migrations

---

### **3. Check If Data Exists**
```bash
/opt/homebrew/opt/postgresql@14/bin/psql -d dental_referral -c "
SELECT 'clinics' as table, COUNT(*) FROM clinics
UNION ALL SELECT 'users', COUNT(*) FROM users
UNION ALL SELECT 'contacts', COUNT(*) FROM contacts
UNION ALL SELECT 'referrals', COUNT(*) FROM referrals;"
```

---

### **4. View All Contacts**
```bash
/opt/homebrew/opt/postgresql@14/bin/psql -d dental_referral -c "SELECT name, specialty, email, phone FROM contacts;"
```

---

### **5. View All Referrals**
```bash
/opt/homebrew/opt/postgresql@14/bin/psql -d dental_referral -c "SELECT \"patientName\", reason, status, urgency FROM referrals;"
```

---

### **6. Open Visual Database Editor (Easiest!)**
```bash
cd "/Users/rohithperumandla/R&D venture Studio/code/dental-referral/backend"
npm run prisma:studio
```
Opens at: **http://localhost:5555** 🎨

---

## 🔧 Database Management

### **Start PostgreSQL**
```bash
brew services start postgresql@14
```

### **Stop PostgreSQL**
```bash
brew services stop postgresql@14
```

### **Check PostgreSQL Status**
```bash
brew services list | grep postgresql
```

---

## 🧪 Insert Test Data

### **Quick Test Data (Copy & Paste)**

```bash
/opt/homebrew/opt/postgresql@14/bin/psql -d dental_referral << 'EOF'
-- Insert test clinic
INSERT INTO clinics (id, name, phone, email, "createdAt", "updatedAt")
VALUES ('test-clinic-1', 'Test Dental Clinic', '(555) 000-0000', 'test@clinic.com', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert test contact
INSERT INTO contacts (id, "clinicId", name, specialty, phone, email, status, "createdAt", "updatedAt")
VALUES ('test-contact-1', 'test-clinic-1', 'Dr. Test Doctor', 'Orthodontics', '(555) 111-1111', 'test@doctor.com', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
EOF
```

---

## 🗑️ Clear All Data

```bash
/opt/homebrew/opt/postgresql@14/bin/psql -d dental_referral << 'EOF'
DELETE FROM referral_files;
DELETE FROM referrals;
DELETE FROM contacts;
DELETE FROM users;
DELETE FROM clinics;
EOF
```

---

## 📊 One-Command Health Check

```bash
cd "/Users/rohithperumandla/R&D venture Studio/code/dental-referral/backend" && \
/opt/homebrew/opt/postgresql@14/bin/psql -d dental_referral -c "
SELECT 
  (SELECT COUNT(*) FROM clinics) as clinics,
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM contacts) as contacts,
  (SELECT COUNT(*) FROM referrals) as referrals,
  (SELECT COUNT(*) FROM referral_files) as files;
"
```

---

## 🎯 Current Status

✅ **Database:** `dental_referral` exists  
✅ **Tables:** 6 tables created  
✅ **Status:** Empty but ready for data  
✅ **Location:** `localhost:5432`  

---

## 📖 Need More Details?

See the complete guide: `docs/DATABASE.md`

---

**TIP:** Use **Prisma Studio** for the easiest database management experience!

```bash
cd backend && npm run prisma:studio
```

