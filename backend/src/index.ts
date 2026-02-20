import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import path from 'path'
import { config } from './config/env'
import { connectDatabase, disconnectDatabase } from './config/database'
import { ensureStorageBucket } from './utils/storage-setup'
import routes from './routes'
import { errorHandler, notFoundHandler } from './middleware/error.middleware'
import {
  authRateLimiter,
  publicRateLimiter,
  generalRateLimiter,
} from './middleware/rate-limit.middleware'
import * as healthController from './controllers/health.controller'
import { logger } from './utils/logger'

/**
 * Initialize Express app
 */
const app = express()

/**
 * Middleware
 */
// Security headers (production only)
if (config.nodeEnv === 'production') {
  app.use(helmet({
    contentSecurityPolicy: false, // API returns JSON, not HTML
    crossOriginEmbedderPolicy: false, // Allow cross-origin for API clients
  }))
}

const allowedCorsOrigins = (config.corsOrigin || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true)

    // Development: allow localhost on any port
    if (config.nodeEnv !== 'production') {
      if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        return callback(null, true)
      }
    }

    // Allow only configured origins (production: strict; dev: CORS_ORIGIN)
    if (allowedCorsOrigins.includes(origin)) {
      return callback(null, true)
    }

    callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve static files in development (for local uploads)
if (config.nodeEnv !== 'production') {
  app.use('/uploads', express.static(path.join(process.cwd(), config.uploadDir || 'uploads')))
}

// Liveness (no DB check - for Railway/K8s deploy healthchecks)
app.get('/health', healthController.getLiveness)
// Full readiness check (includes DB)
app.get('/health/ready', healthController.getHealth)

/**
 * Rate limiting (production only)
 * Order: stricter limits first, then general
 */
app.use('/api/auth', authRateLimiter)
app.use('/api/gd/auth', authRateLimiter)
app.use('/api/public', publicRateLimiter)
app.use('/api', generalRateLimiter, routes)

/**
 * Error handlers (must be last)
 */
app.use(notFoundHandler)
app.use(errorHandler)

/**
 * Start server
 * Listen first so Railway/load balancers can reach /health, then connect DB in background
 */
const startServer = async () => {
  // Start listening immediately (allows healthchecks to reach the app)
  // Bind to 0.0.0.0 so Railway can reach the container
  app.listen(config.port, '0.0.0.0', () => {
    logger.info({
      msg: 'Server listening',
      port: config.port,
      env: config.nodeEnv,
      corsOrigins: config.corsOrigin,
    })
  })

  try {
    // Connect to database (health will return 503 until this succeeds)
    await connectDatabase()

    // Ensure Supabase Storage bucket exists (production)
    if (config.nodeEnv === 'production') {
      await ensureStorageBucket()
    }

    // Warn if email/SMS not configured (referrals will not send notifications)
    if (!config.resendApiKey) {
      logger.warn('RESEND_API_KEY not set - referral emails will not be sent. Add it in .env (local) or Railway Variables (production).')
    }
    if (!config.twilioAccountSid || !config.twilioAuthToken || !config.twilioPhoneNumber) {
      logger.warn('Twilio not configured (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER) - referral SMS will not be sent.')
    }

    logger.info('Startup complete')
  } catch (error) {
    logger.fatal({ err: error }, 'Startup failed - database or storage unreachable. Add DATABASE_URL and redeploy. Server stays up for healthchecks.')
    // Don't exit - keep server running so /health returns 200 and deploy succeeds
    // User can add DATABASE_URL in Railway Variables and redeploy
  }
}

/**
 * Graceful shutdown
 */
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...')
  await disconnectDatabase()
  process.exit(0)
})

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...')
  await disconnectDatabase()
  process.exit(0)
})

// Start the server
startServer()
