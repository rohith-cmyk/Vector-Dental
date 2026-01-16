import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function applyMigration() {
  try {
    console.log('Applying shareToken migration...')
    
    // Add the shareToken column
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "referrals" 
      ADD COLUMN IF NOT EXISTS "shareToken" TEXT;
    `)
    console.log('✅ Added shareToken column')
    
    // Create unique index
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "referrals_shareToken_key" 
      ON "referrals"("shareToken");
    `)
    console.log('✅ Created unique index on shareToken')
    
    // Create regular index
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "referrals_shareToken_idx" 
      ON "referrals"("shareToken");
    `)
    console.log('✅ Created index on shareToken')
    
    console.log('✅ Migration applied successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

applyMigration()
  .then(() => {
    console.log('Migration completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Migration failed:', error)
    process.exit(1)
  })

