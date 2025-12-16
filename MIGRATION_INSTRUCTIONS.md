# Migration Instructions for Magic Referral Link

## Option 1: Using Prisma Migrations (Recommended)

If you're using Prisma migrations, you can let Prisma generate the SQL:

```bash
cd backend
npx prisma migrate dev --name add_magic_referral_link
```

This will:
1. Generate the migration SQL
2. Apply it to your database
3. Regenerate the Prisma client

## Option 2: Manual SQL (What you requested)

I've created the SQL file at: `backend/prisma/migrations/magic_referral_link_migration.sql`

**Important Notes:**

1. **Enum Handling**: The `ReferralStatus` enum needs to be updated. Prisma typically handles this, but if you run the SQL manually:
   - The enum values `SUBMITTED`, `PENDING_REVIEW`, and `REJECTED` need to be added
   - See the commented section in the SQL file for enum modification
   - **If you're using Prisma, it's better to let Prisma handle enum changes**

2. **Run the SQL in Supabase:**
   - Go to your Supabase project
   - Navigate to SQL Editor
   - Copy and paste the contents of `magic_referral_link_migration.sql`
   - Review the SQL (especially the enum part)
   - Execute

3. **After running SQL, regenerate Prisma client:**
   ```bash
   cd backend
   npx prisma generate
   ```

## What the Migration Does

1. ✅ Creates `referral_links` table with:
   - `id`, `specialistId`, `token`, `accessCodeHash`, `isActive`, `label`
   - Unique constraint on `token`
   - Foreign key to `users` table

2. ✅ Adds new fields to `referrals` table:
   - `patientFirstName`, `patientLastName`, `insurance`
   - `gpClinicName`, `submittedByName`, `submittedByPhone`
   - `referralLinkId` (foreign key to `referral_links`)

3. ✅ Adds new fields to `referral_files` table:
   - `storageKey`, `mimeType`

4. ✅ Updates `ReferralStatus` enum (if using native enum type)

## Verification

After running the migration, verify in Supabase:

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
