import pino from 'pino'
import { config } from '../config/env'

/**
 * Structured logger (Pino)
 * - Production: JSON output for log aggregators
 * - Development: Pretty-printed for readability
 */
export const logger = pino({
  level: process.env.LOG_LEVEL || (config.nodeEnv === 'production' ? 'info' : 'debug'),
  ...(config.nodeEnv !== 'production'
    ? {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
          },
        },
      }
    : {}),
})
