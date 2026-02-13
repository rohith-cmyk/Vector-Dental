# 🗄️ Database Guide

Complete guide for managing and verifying the PostgreSQL database for Vector Referral.

---

## 📋 Table of Contents

1. [Database Overview](#database-overview)
2. [Check If Database Exists](#check-if-database-exists)
3. [Check If Tables Are Created](#check-if-tables-are-created)
4. [View Table Structure](#view-table-structure)
5. [Check If Data Is Inserted](#check-if-data-is-inserted)
6. [Insert Test Data](#insert-test-data)
7. [Query Data](#query-data)
8. [Delete Data](#delete-data)
9. [Using Prisma Studio (GUI)](#using-prisma-studio-gui)
10. [Common Issues](#common-issues)

---

## 📊 Database Overview

**Database Name:** `dental_referral`  
**Type:** PostgreSQL 14  
**Port:** 5432  
**Location:** localhost  

**Tables:**
- `clinics` - Dental clinic information
- `users` - Clinic staff with roles
- `contacts` - Specialist directory
- `referrals` - Patient referrals
- `referral_files` - Attached files
- `_prisma_migrations` - Migration history (system table)

---

## 1. Check If Database Exists

### **Method 1: Using Command Line**

```bash
# List all databases
/opt/homebrew/opt/postgresql@14/bin/psql -l
```

**Expected Output:**
```
                                List of databases
      Name       |      Owner       | Encoding | ...
-----------------+------------------+----------+-----
 dental_referral | rohithperumandla | UTF8     | ...
 postgres        | rohithperumandla | UTF8     | ...
```

If you see `dental_referral` in the list, ✅ database exists!

### **Method 2: Using psql**

```bash
# Connect to PostgreSQL
/opt/homebrew/opt/postgresql@14/bin/psql postgres

# Inside psql, list databases
\l

# Exit
\q
```

### **Method 3: Try to Connect**

```bash
# If this connects without error, database exists
/opt/homebrew/opt/postgresql@14/bin/psql -d dental_referral
```

If successful, you'll see:
```
psql (14.19)
Type "help" for help.

dental_referral=#
```

---

## 2. Check If Tables Are Created

### **Method 1: Using psql Command**

```bash
/opt/homebrew/opt/postgresql@14/bin/psql -d dental_referral -c "\dt"
```

**Expected Output:**
```
                   List of relations
 Schema |        Name        | Type  |      Owner       
--------+--------------------+-------+------------------
 public | _prisma_migrations | table | rohithperumandla
 public | clinics            | table | rohithperumandla
 public | contacts           | table | rohithperumandla
 public | referral_files     | table | rohithperumandla
 public | referrals          | table | rohithperumandla
 public | users              | table | rohithperumandla
(6 rows)
```

✅ **You should see 6 tables!**

### **Method 2: Using psql Interactive**

```bash
# Connect to database
/opt/homebrew/opt/postgresql@14/bin/psql -d dental_referral

# List tables
\dt

# Exit
\q
```

### **Method 3: Count Tables**

```bash
/opt/homebrew/opt/postgresql@14/bin/psql -d dental_referral -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';"
```

**Expected:** `6` tables

---

## 3. View Table Structure

### **View All Columns in a Table**

```bash
# Clinics table
/opt/homebrew/opt/postgresql@14/bin/psql -d dental_referral -c "\d clinics"

# Contacts table
/opt/homebrew/opt/postgresql@14/bin/psql -d dental_referral -c "\d contacts"

# Referrals table
/opt/homebrew/opt/postgresql@14/bin/psql -d dental_referral -c "\d referrals"

# Users table
/opt/homebrew/opt/postgresql@14/bin/psql -d dental_referral -c "\d users"

# Referral Files table
/opt/homebrew/opt/postgresql@14/bin/psql -d dental_referral -c "\d referral_files"
```

### **Expected Structures:**

#### **Clinics Table:**
- `id` (text, primary key)
- `name` (text, required)
- `address` (text, optional)
- `phone` (text, optional)
- `email` (text, optional)
- `createdAt`, `updatedAt` (timestamps)

#### **Contacts Table:**
- `id` (text, primary key)
- `clinicId` (text, foreign key)
- `name` (text, required)
- `specialty` (text, required)
- `phone` (text, required)
- `email` (text, required)
- `address` (text, optional)
- `notes` (text, optional)
- `status` (enum: ACTIVE/INACTIVE)
- `createdAt`, `updatedAt` (timestamps)

#### **Referrals Table:**
- `id` (text, primary key)
- `clinicId` (text, foreign key)
- `contactId` (text, foreign key)
- `patientName` (text, required)
- `patientDob` (timestamp, required)
- `patientPhone`, `patientEmail` (optional)
- `reason` (text, required)
- `urgency` (enum: ROUTINE/URGENT/EMERGENCY)
- `status` (enum: DRAFT/SENT/ACCEPTED/COMPLETED/CANCELLED)
- `notes` (text, optional)
- `createdAt`, `updatedAt` (timestamps)

---

## 4. Check If Data Is Inserted

### **Check All Tables for Data**

```bash
# Check clinics
/opt/homebrew/opt/postgresql@14/bin/psql -d dental_referral -c "SELECT COUNT(*) as clinic_count FROM clinics;"

# Check users
/opt/homebrew/opt/postgresql@14/bin/psql -d dental_referral -c "SELECT COUNT(*) as user_count FROM users;"

# Check contacts
/opt/homebrew/opt/postgresql@14/bin/psql -d dental_referral -c "SELECT COUNT(*) as contact_count FROM contacts;"

# Check referrals
/opt/homebrew/opt/postgresql@14/bin/psql -d dental_referral -c "SELECT COUNT(*) as referral_count FROM referrals;"
```

### **Quick Status Check (All Tables at Once)**

```bash
/opt/homebrew/opt/postgresql@14/bin/psql -d dental_referral -c "
SELECT 
  (SELECT COUNT(*) FROM clinics) as clinics,
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM contacts) as contacts,
  (SELECT COUNT(*) FROM referrals) as referrals,
  (SELECT COUNT(*) FROM referral_files) as files;
"
```

**Expected Output (Fresh Database):**
```
 clinics | users | contacts | referrals | files 
---------+-------+----------+-----------+-------
       0 |     0 |        0 |         0 |     0
```

If all show `0`, database is **empty but ready**.

---

## 5. Insert Test Data

### **Insert Sample Clinic & User**

```bash
/opt/homebrew/opt/postgresql@14/bin/psql -d dental_referral << 'EOF'
-- Insert a clinic
INSERT INTO clinics (id, name, address, phone, email, "createdAt", "updatedAt")
VALUES (
  'clinic-001',
  'Smith Dental Clinic',
  '123 Main Street, New York, NY 10001',
  '(555) 123-4567',
  'info@smithdental.com',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Insert a user (password: 'password123' hashed with bcrypt)
INSERT INTO users (id, email, password, name, role, "clinicId", "createdAt", "updatedAt")
VALUES (
  'user-001',
  'admin@smithdental.com',
  '$2a$10$rKvxF.R.5qKGfN8kJ3yGJ.YhYqGq9Z5N8.YhYqGq9Z5N8YhYqGq9Z',
  'Dr. John Smith',
  'ADMIN',
  'clinic-001',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);
EOF
```

### **Insert Sample Contacts**

```bash
/opt/homebrew/opt/postgresql@14/bin/psql -d dental_referral << 'EOF'
-- Insert contacts
INSERT INTO contacts (id, "clinicId", name, specialty, phone, email, address, notes, status, "createdAt", "updatedAt")
VALUES 
  (
    'contact-001',
    'clinic-001',
    'Dr. Brian Fred M.',
    'Orthodontics',
    '(319) 555-0115',
    'brianfred@email.com',
    '456 Oak Avenue, Chicago, IL 60601',
    'Specializes in adult orthodontics',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'contact-002',
    'clinic-001',
    'Dr. Courtney Henry',
    'Oral Surgery',
    '(405) 555-0128',
    'courtney.h@email.com',
    '789 Pine Street, Boston, MA 02101',
    'Expert in wisdom teeth removal',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  );
EOF
```

### **Insert Sample Referral**

```bash
/opt/homebrew/opt/postgresql@14/bin/psql -d dental_referral << 'EOF'
-- Insert a referral
INSERT INTO referrals (id, "clinicId", "contactId", "patientName", "patientDob", "patientPhone", "patientEmail", reason, urgency, status, notes, "createdAt", "updatedAt")
VALUES (
  'referral-001',
  'clinic-001',
  'contact-001',
  'John Patient',
  '1990-05-15',
  '(555) 987-6543',
  'john.patient@email.com',
  'Needs orthodontic evaluation for braces',
  'ROUTINE',
  'DRAFT',
  'Patient prefers morning appointments',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);
EOF
```

---

## 6. Query Data

### **View All Data in a Table**

```bash
# View all clinics
/opt/homebrew/opt/postgresql@14/bin/psql -d dental_referral -c "SELECT * FROM clinics;"

# View all contacts
/opt/homebrew/opt/postgresql@14/bin/psql -d dental_referral -c "SELECT * FROM contacts;"

# View all referrals
/opt/homebrew/opt/postgresql@14/bin/psql -d dental_referral -c "SELECT * FROM referrals;"

# View all users
/opt/homebrew/opt/postgresql@14/bin/psql -d dental_referral -c "SELECT * FROM users;"
```

### **Formatted View (Easier to Read)**

```bash
# View contacts with specific columns
/opt/homebrew/opt/postgresql@14/bin/psql -d dental_referral -c "
SELECT 
  name, 
  specialty, 
  email, 
  phone, 
  status 
FROM contacts;
"
```

### **Search Data**

```bash
# Find contacts by specialty
/opt/homebrew/opt/postgresql@14/bin/psql -d dental_referral -c "
SELECT name, specialty, email 
FROM contacts 
WHERE specialty = 'Orthodontics';
"

# Find active contacts
/opt/homebrew/opt/postgresql@14/bin/psql -d dental_referral -c "
SELECT name, specialty, status 
FROM contacts 
WHERE status = 'ACTIVE';
"

# Count referrals by status
/opt/homebrew/opt/postgresql@14/bin/psql -d dental_referral -c "
SELECT status, COUNT(*) 
FROM referrals 
GROUP BY status;
"
```

### **Join Tables (See Related Data)**

```bash
# View referrals with contact names
/opt/homebrew/opt/postgresql@14/bin/psql -d dental_referral -c "
SELECT 
  r.\"patientName\",
  c.name as specialist,
  c.specialty,
  r.status,
  r.urgency
FROM referrals r
JOIN contacts c ON r.\"contactId\" = c.id;
"
```

---

## 7. Delete Data

### **Delete All Data (Keep Tables)**

```bash
# Clear all tables (in correct order due to foreign keys)
/opt/homebrew/opt/postgresql@14/bin/psql -d dental_referral << 'EOF'
DELETE FROM referral_files;
DELETE FROM referrals;
DELETE FROM contacts;
DELETE FROM users;
DELETE FROM clinics;
EOF
```

### **Delete Specific Records**

```bash
# Delete a specific contact
/opt/homebrew/opt/postgresql@14/bin/psql -d dental_referral -c "
DELETE FROM contacts WHERE id = 'contact-001';
"

# Delete all inactive contacts
/opt/homebrew/opt/postgresql@14/bin/psql -d dental_referral -c "
DELETE FROM contacts WHERE status = 'INACTIVE';
"
```

### **Reset Database Completely**

```bash
# Drop and recreate database
/opt/homebrew/opt/postgresql@14/bin/dropdb dental_referral
/opt/homebrew/opt/postgresql@14/bin/createdb dental_referral

# Then re-run migrations
cd "/Users/rohithperumandla/R&D venture Studio/code/dental-referral/backend"
npm run prisma:migrate
```

---

## 8. Using Prisma Studio (GUI)

**Prisma Studio** is a visual database editor - the easiest way to view/edit data!

### **Start Prisma Studio**

```bash
cd "/Users/rohithperumandla/R&D venture Studio/code/dental-referral/backend"
npm run prisma:studio
```

**What Opens:**
- Browser opens at `http://localhost:5555`
- Visual interface showing all tables
- Click any table to view/edit/delete data
- Add new records with a form
- Filter and search data

### **Features:**
- ✅ View all tables
- ✅ Add/Edit/Delete records visually
- ✅ See relationships between tables
- ✅ No SQL commands needed
- ✅ Auto-updates in real-time

---

## 9. Useful Database Commands

### **Connection Commands**

```bash
# Connect to dental_referral database
/opt/homebrew/opt/postgresql@14/bin/psql -d dental_referral

# Connect to postgres (default database)
/opt/homebrew/opt/postgresql@14/bin/psql postgres
```

### **Inside psql (Interactive Mode)**

Once connected, you can use these commands:

```sql
-- List all databases
\l

-- List all tables
\dt

-- Describe a table
\d contacts

-- View table with relationships
\d+ referrals

-- List all schemas
\dn

-- List all users/roles
\du

-- Show current database
SELECT current_database();

-- Show current user
SELECT current_user;

-- Exit psql
\q
```

### **Quick Data Verification Queries**

```bash
# Check total records in each table
/opt/homebrew/opt/postgresql@14/bin/psql -d dental_referral -c "
SELECT 
  'clinics' as table_name, COUNT(*) FROM clinics
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'contacts', COUNT(*) FROM contacts
UNION ALL
SELECT 'referrals', COUNT(*) FROM referrals
UNION ALL
SELECT 'referral_files', COUNT(*) FROM referral_files;
"
```

---

## 10. Common Verification Scenarios

### **Scenario 1: Verify Fresh Installation**

After running migrations, check if tables exist:

```bash
cd "/Users/rohithperumandla/R&D venture Studio/code/dental-referral/backend"

# Should show 6 tables
/opt/homebrew/opt/postgresql@14/bin/psql -d dental_referral -c "\dt"

# Should all show 0 (empty database)
/opt/homebrew/opt/postgresql@14/bin/psql -d dental_referral -c "
SELECT COUNT(*) FROM clinics;
"
```

### **Scenario 2: After Creating a User via API**

Check if signup worked:

```bash
# View all users
/opt/homebrew/opt/postgresql@14/bin/psql -d dental_referral -c "
SELECT id, email, name, role, \"clinicId\" FROM users;
"

# View associated clinic
/opt/homebrew/opt/postgresql@14/bin/psql -d dental_referral -c "
SELECT u.name as user_name, u.email, c.name as clinic_name
FROM users u
JOIN clinics c ON u.\"clinicId\" = c.id;
"
```

### **Scenario 3: After Adding Contacts**

```bash
# View all contacts
/opt/homebrew/opt/postgresql@14/bin/psql -d dental_referral -c "
SELECT name, specialty, email, phone, status FROM contacts;
"

# Count contacts by specialty
/opt/homebrew/opt/postgresql@14/bin/psql -d dental_referral -c "
SELECT specialty, COUNT(*) as count 
FROM contacts 
GROUP BY specialty 
ORDER BY count DESC;
"
```

### **Scenario 4: After Creating Referrals**

```bash
# View referrals with patient and specialist info
/opt/homebrew/opt/postgresql@14/bin/psql -d dental_referral -c "
SELECT 
  r.\"patientName\",
  c.name as specialist,
  r.reason,
  r.status,
  r.urgency
FROM referrals r
JOIN contacts c ON r.\"contactId\" = c.id;
"

# Count referrals by status
/opt/homebrew/opt/postgresql@14/bin/psql -d dental_referral -c "
SELECT status, COUNT(*) 
FROM referrals 
GROUP BY status;
"
```

---

## 11. Database Backup & Restore

### **Backup Database**

```bash
# Backup entire database
/opt/homebrew/opt/postgresql@14/bin/pg_dump dental_referral > backup.sql

# Backup with timestamp
/opt/homebrew/opt/postgresql@14/bin/pg_dump dental_referral > "backup_$(date +%Y%m%d_%H%M%S).sql"
```

### **Restore Database**

```bash
# Restore from backup
/opt/homebrew/opt/postgresql@14/bin/psql -d dental_referral < backup.sql
```

---

## 12. PostgreSQL Service Management

### **Check If PostgreSQL Is Running**

```bash
# Check service status
brew services list | grep postgresql

# Or check if it's listening on port 5432
lsof -i :5432
```

### **Start/Stop PostgreSQL**

```bash
# Start
brew services start postgresql@14

# Stop
brew services stop postgresql@14

# Restart
brew services restart postgresql@14
```

---

## 13. Common Issues & Solutions

### **Issue: "database does not exist"**

**Solution:**
```bash
/opt/homebrew/opt/postgresql@14/bin/createdb dental_referral
```

### **Issue: "connection refused"**

**Solution:**
```bash
# Start PostgreSQL
brew services start postgresql@14

# Wait a few seconds, then try again
```

### **Issue: "permission denied"**

**Solution:**
```bash
# Check current user
whoami

# Update DATABASE_URL in backend/.env with your username
DATABASE_URL="postgresql://YOUR_USERNAME@localhost:5432/dental_referral"
```

### **Issue: "tables not found"**

**Solution:**
```bash
# Run migrations
cd backend
npm run prisma:migrate
```

### **Issue: Can't see data I just added**

**Solution:**
```bash
# Refresh your query
/opt/homebrew/opt/postgresql@14/bin/psql -d dental_referral -c "SELECT * FROM contacts;"

# Or use Prisma Studio (refreshes automatically)
cd backend
npm run prisma:studio
```

---

## 14. Quick Reference Commands

### **Most Used Commands:**

```bash
# 1. Check if database exists
/opt/homebrew/opt/postgresql@14/bin/psql -l | grep dental_referral

# 2. List all tables
/opt/homebrew/opt/postgresql@14/bin/psql -d dental_referral -c "\dt"

# 3. Count records in all tables
/opt/homebrew/opt/postgresql@14/bin/psql -d dental_referral -c "
SELECT 'clinics' as table, COUNT(*) FROM clinics
UNION ALL SELECT 'users', COUNT(*) FROM users
UNION ALL SELECT 'contacts', COUNT(*) FROM contacts
UNION ALL SELECT 'referrals', COUNT(*) FROM referrals;"

# 4. View all contacts
/opt/homebrew/opt/postgresql@14/bin/psql -d dental_referral -c "SELECT name, specialty, email FROM contacts;"

# 5. Open visual editor
cd backend && npm run prisma:studio
```

---

## 15. Database Schema Diagram

```
┌─────────────┐
│   Clinics   │
│             │
│ - id (PK)   │
│ - name      │
│ - address   │
│ - phone     │
│ - email     │
└──────┬──────┘
       │
       │ 1:N
       ├────────────┬────────────┬
       ▼            ▼            ▼
┌──────────┐  ┌──────────┐  ┌──────────────┐
│  Users   │  │ Contacts │  │  Referrals   │
│          │  │          │  │              │
│ - id     │  │ - id     │  │ - id         │
│ - email  │  │ - name   │  │ - patientName│
│ - name   │  │ - specialty  │ - reason    │
│ - role   │  │ - email  │  │ - status     │
│ - clinicId│ │ - phone  │  │ - urgency    │
└──────────┘  └────┬─────┘  │ - contactId  │
                   │        │ - clinicId   │
                   │ 1:N    └──────┬───────┘
                   └────────┘      │
                                   │ 1:N
                                   ▼
                            ┌──────────────┐
                            │ReferralFiles │
                            │              │
                            │ - id         │
                            │ - fileName   │
                            │ - fileUrl    │
                            │ - referralId │
                            └──────────────┘
```

---

## 16. Development Workflow

### **Typical Development Flow:**

1. **Start PostgreSQL**
   ```bash
   brew services start postgresql@14
   ```

2. **View Database Visually**
   ```bash
   cd backend
   npm run prisma:studio
   ```
   Opens at http://localhost:5555

3. **Add Test Data**
   - Use Prisma Studio GUI, or
   - Use INSERT commands above, or
   - Use the backend API

4. **Verify Data**
   - Check in Prisma Studio, or
   - Run SELECT queries

5. **Start Backend API**
   ```bash
   cd backend
   npm run dev
   ```

6. **Test API**
   - Use frontend UI, or
   - Use curl/Postman

---

## 17. Connection String Reference

Your database connection string is in `backend/.env`:

```env
DATABASE_URL="postgresql://USERNAME@localhost:5432/dental_referral?schema=public"
```

**Format:**
```
postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]?schema=public
```

**Current Setup:**
- User: `rohithperumandla` (your Mac username)
- Password: (none - local dev)
- Host: `localhost`
- Port: `5432` (PostgreSQL default)
- Database: `dental_referral`
- Schema: `public`

---

## 📚 Additional Resources

- **Prisma Docs:** https://www.prisma.io/docs
- **PostgreSQL Docs:** https://www.postgresql.org/docs/14/
- **SQL Tutorial:** https://www.postgresql.org/docs/14/tutorial.html

---

## 🎯 Summary

✅ **Database exists:** `dental_referral`  
✅ **Tables created:** 6 tables (5 main + 1 system)  
✅ **Migrations applied:** All schema changes synced  
✅ **Connection ready:** Backend can connect  
✅ **Prisma Studio available:** Visual database editor  

**Database is 100% ready to use!** 🚀

---

**Quick Health Check:**

```bash
# One command to verify everything
cd "/Users/rohithperumandla/R&D venture Studio/code/dental-referral/backend" && \
echo "=== DATABASE HEALTH CHECK ===" && \
echo "" && \
echo "Database exists:" && \
/opt/homebrew/opt/postgresql@14/bin/psql -l | grep dental_referral && \
echo "" && \
echo "Tables created:" && \
/opt/homebrew/opt/postgresql@14/bin/psql -d dental_referral -c "\dt" && \
echo "" && \
echo "Record counts:" && \
/opt/homebrew/opt/postgresql@14/bin/psql -d dental_referral -c "
SELECT 'clinics' as table, COUNT(*) FROM clinics
UNION ALL SELECT 'users', COUNT(*) FROM users
UNION ALL SELECT 'contacts', COUNT(*) FROM contacts
UNION ALL SELECT 'referrals', COUNT(*) FROM referrals;" && \
echo "" && \
echo "✅ Database is healthy!"
```

