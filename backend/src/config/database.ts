import { PrismaClient } from '@prisma/client'
import { logger } from '../utils/logger'

/**
 * Prisma Client Instance
 */
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

/**
 * Connect to database
 */
export async function connectDatabase() {
  try {
    await prisma.$connect()
    logger.info('Database connected successfully')
  } catch (error) {
    logger.fatal({ err: error }, 'Database connection failed')
    process.exit(1)
  }
}

/**
 * Disconnect from database
 */
export async function disconnectDatabase() {
  await prisma.$disconnect()
  logger.info('Database disconnected')
}

