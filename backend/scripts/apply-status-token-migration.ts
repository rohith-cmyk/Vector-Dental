import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function applyMigration() {
  try {
    console.log('Applying statusToken migration...')
    
    // Add the statusToken column
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "referrals" 
      ADD COLUMN IF NOT EXISTS "statusToken" TEXT;
    `)
    console.log('✅ Added statusToken column')
    
    // Create unique index
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "referrals_statusToken_key" 
      ON "referrals"("statusToken");
    `)
    console.log('✅ Created unique index on statusToken')
    
    // Create regular index
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "referrals_statusToken_idx" 
      ON "referrals"("statusToken");
    `)
    console.log('✅ Created index on statusToken')
    
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

