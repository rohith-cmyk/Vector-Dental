import express from 'express'
import cors from 'cors'
import { config } from './config/env'
import { connectDatabase, disconnectDatabase } from './config/database'
import routes from './routes'
import { errorHandler, notFoundHandler } from './middleware/error.middleware'

/**
 * Initialize Express app
 */
const app = express()

/**
 * Middleware
 */
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true)
    
    // Allow localhost on any port
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true)
    }
    
    // Allow configured origin
    if (origin === config.corsOrigin) {
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

/**
 * Routes
 */
app.use('/api', routes)

/**
 * Error handling
 */
app.use(notFoundHandler)
app.use(errorHandler)

/**
 * Start server
 */
async function startServer() {
  try {
    // Connect to database
    await connectDatabase()

    // Start listening
    app.listen(config.port, () => {
      console.log(`🚀 Server running on port ${config.port}`)
      console.log(`📍 Environment: ${config.nodeEnv}`)
      console.log(`🌐 CORS enabled for: ${config.corsOrigin}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

/**
 * Graceful shutdown
 */
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...')
  await disconnectDatabase()
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...')
  await disconnectDatabase()
  process.exit(0)
})

// Start the server
startServer()

