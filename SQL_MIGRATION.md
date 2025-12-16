# SQL Migration for Magic Referral Link

## Quick Start

Copy and paste the SQL below into your Supabase SQL Editor and run it.

---

## Complete SQL Migration

```sql
-- Migration: Add Magic Referral Link functionality
-- Run this SQL in your Supabase SQL editor

-- 1. Create referral_links table
CREATE TABLE IF NOT EXISTS "referral_links" (
    "id" TEXT NOT NULL,
    "specialistId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "accessCodeHash" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "label" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "referral_links_pkey" PRIMARY KEY ("id")
);

-- 2. Create unique index on token
CREATE UNIQUE INDEX IF NOT EXISTS "referral_links_token_key" ON "referral_links"("token");

-- 3. Create index on specialistId
CREATE INDEX IF NOT EXISTS "referral_links_specialistId_idx" ON "referral_links"("specialistId");

-- 4. Add foreign key constraint
ALTER TABLE "referral_links" ADD CONSTRAINT "referral_links_specialistId_fkey" 
    FOREIGN KEY ("specialistId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 5. Add new columns to referrals table
ALTER TABLE "referrals" 
    ADD COLUMN IF NOT EXISTS "patientFirstName" TEXT,
    ADD COLUMN IF NOT EXISTS "patientLastName" TEXT,
    ADD COLUMN IF NOT EXISTS "insurance" TEXT,
    ADD COLUMN IF NOT EXISTS "gpClinicName" TEXT,
    ADD COLUMN IF NOT EXISTS "submittedByName" TEXT,
    ADD COLUMN IF NOT EXISTS "submittedByPhone" TEXT,
    ADD COLUMN IF NOT EXISTS "referralLinkId" TEXT;

-- 6. Add foreign key constraint for referralLinkId
ALTER TABLE "referrals" ADD CONSTRAINT IF NOT EXISTS "referrals_referralLinkId_fkey" 
    FOREIGN KEY ("referralLinkId") REFERENCES "referral_links"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 7. Create index on referralLinkId
CREATE INDEX IF NOT EXISTS "referrals_referralLinkId_idx" ON "referrals"("referralLinkId");

-- 8. Add new columns to referral_files table
ALTER TABLE "referral_files"
    ADD COLUMN IF NOT EXISTS "storageKey" TEXT,
    ADD COLUMN IF NOT EXISTS "mimeType" TEXT;

-- 9. Add new status values to ReferralStatus enum
-- PostgreSQL doesn't support IF NOT EXISTS for enum values, so we need to check if they exist first
DO $$ 
BEGIN
    -- Check and add SUBMITTED
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'SUBMITTED' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'ReferralStatus')) THEN
        ALTER TYPE "ReferralStatus" ADD VALUE 'SUBMITTED';
    END IF;
    
    -- Check and add PENDING_REVIEW
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'PENDING_REVIEW' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'ReferralStatus')) THEN
        ALTER TYPE "ReferralStatus" ADD VALUE 'PENDING_REVIEW';
    END IF;
    
    -- Check and add REJECTED
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'REJECTED' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'ReferralStatus')) THEN
        ALTER TYPE "ReferralStatus" ADD VALUE 'REJECTED';
    END IF;
END $$;
```

---

## After Running the Migration

1. **Regenerate Prisma Client:**
   ```bash
   cd backend
   npx prisma generate
   ```

2. **Verify the migration:**
   ```sql
   -- Check referral_links table exists
   SELECT * FROM referral_links LIMIT 1;

   -- Check new columns in referrals
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'referrals' 
   AND column_name IN ('patientFirstName', 'referralLinkId', 'insurance');

   -- Check new columns in referral_files
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'referral_files' 
   AND column_name IN ('storageKey', 'mimeType');
   ```

---

## Notes

- The migration uses `IF NOT EXISTS` clauses to make it safe to run multiple times
- Enum values are added safely using a DO block that checks for existence first
- Foreign keys ensure referential integrity
- All new columns are nullable for backward compatibility
