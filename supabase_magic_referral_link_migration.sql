-- Migration: Add Magic Referral Link functionality
-- Run this SQL in your Supabase SQL Editor
-- This migration adds support for token-based referral links with access codes

-- 1. Create referral_links table
CREATE TABLE IF NOT EXISTS "referral_links" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "specialistId" TEXT NOT NULL,
    "token" TEXT NOT NULL UNIQUE,
    "accessCodeHash" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "label" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Add indexes for referral_links
CREATE INDEX IF NOT EXISTS "referral_links_specialistId_idx" ON "referral_links"("specialistId");
CREATE INDEX IF NOT EXISTS "referral_links_token_idx" ON "referral_links"("token");

-- 3. Add foreign key constraint for referral_links.specialistId -> users.id
ALTER TABLE "referral_links" 
ADD CONSTRAINT "referral_links_specialistId_fkey" 
FOREIGN KEY ("specialistId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 4. Add new columns to referrals table (if they don't exist)
-- Check if columns exist first (PostgreSQL doesn't support IF NOT EXISTS for columns directly)
DO $$ 
BEGIN
    -- Add patientFirstName
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='referrals' AND column_name='patientFirstName') THEN
        ALTER TABLE "referrals" ADD COLUMN "patientFirstName" TEXT;
    END IF;

    -- Add patientLastName
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='referrals' AND column_name='patientLastName') THEN
        ALTER TABLE "referrals" ADD COLUMN "patientLastName" TEXT;
    END IF;

    -- Add insurance
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='referrals' AND column_name='insurance') THEN
        ALTER TABLE "referrals" ADD COLUMN "insurance" TEXT;
    END IF;

    -- Add gpClinicName
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='referrals' AND column_name='gpClinicName') THEN
        ALTER TABLE "referrals" ADD COLUMN "gpClinicName" TEXT;
    END IF;

    -- Add submittedByName
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='referrals' AND column_name='submittedByName') THEN
        ALTER TABLE "referrals" ADD COLUMN "submittedByName" TEXT;
    END IF;

    -- Add submittedByPhone
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='referrals' AND column_name='submittedByPhone') THEN
        ALTER TABLE "referrals" ADD COLUMN "submittedByPhone" TEXT;
    END IF;

    -- Add referralLinkId
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='referrals' AND column_name='referralLinkId') THEN
        ALTER TABLE "referrals" ADD COLUMN "referralLinkId" TEXT;
    END IF;
END $$;

-- 5. Add foreign key constraint for referrals.referralLinkId -> referral_links.id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'referrals_referralLinkId_fkey'
    ) THEN
        ALTER TABLE "referrals" 
        ADD CONSTRAINT "referrals_referralLinkId_fkey" 
        FOREIGN KEY ("referralLinkId") REFERENCES "referral_links"("id") 
        ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- 6. Add index for referralLinkId
CREATE INDEX IF NOT EXISTS "referrals_referralLinkId_idx" ON "referrals"("referralLinkId");

-- 7. Add new columns to referral_files table (if they don't exist)
DO $$ 
BEGIN
    -- Add storageKey
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='referral_files' AND column_name='storageKey') THEN
        ALTER TABLE "referral_files" ADD COLUMN "storageKey" TEXT;
    END IF;

    -- Add mimeType
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='referral_files' AND column_name='mimeType') THEN
        ALTER TABLE "referral_files" ADD COLUMN "mimeType" TEXT;
    END IF;
END $$;

-- 8. Update ReferralStatus enum if new values don't exist
-- Note: This depends on how your enum is set up. 
-- If using Prisma, the enum should be updated via Prisma schema.
-- For PostgreSQL native enums, you'd use:
-- ALTER TYPE "ReferralStatus" ADD VALUE IF NOT EXISTS 'SUBMITTED';
-- ALTER TYPE "ReferralStatus" ADD VALUE IF NOT EXISTS 'PENDING_REVIEW';
-- ALTER TYPE "ReferralStatus" ADD VALUE IF NOT EXISTS 'REJECTED';
-- However, Prisma uses a TEXT field with CHECK constraint, so we'll handle this via Prisma.

-- Verification queries (run these to verify the migration worked):
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'referral_links';
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'referrals' AND column_name LIKE 'patient%' OR column_name IN ('insurance', 'gpClinicName', 'submittedByName', 'submittedByPhone', 'referralLinkId');
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'referral_files' AND column_name IN ('storageKey', 'mimeType');
