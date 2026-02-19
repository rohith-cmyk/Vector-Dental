import { Request, Response } from 'express'
import { prisma } from '../config/database'
import { logger } from '../utils/logger'

/**
 * Health check endpoint
 * Used by load balancers, Kubernetes, Docker, uptime monitors
 * Returns 200 if healthy, 503 if unhealthy
 */
export async function getHealth(_req: Request, res: Response) {
  const start = Date.now()
  const timestamp = new Date().toISOString()

  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`
    const dbLatency = Date.now() - start

    res.status(200).json({
      success: true,
      status: 'healthy',
      timestamp,
      uptime: process.uptime(),
      checks: {
        database: { status: 'ok', latencyMs: dbLatency },
      },
    })
  } catch (error) {
    logger.error({ err: error }, 'Health check failed: database unreachable')

    res.status(503).json({
      success: false,
      status: 'unhealthy',
      timestamp,
      uptime: process.uptime(),
      checks: {
        database: { status: 'error', message: 'Connection failed' },
      },
    })
  }
}
