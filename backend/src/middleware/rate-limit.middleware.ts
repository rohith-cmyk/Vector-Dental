import rateLimit from 'express-rate-limit'
import { config } from '../config/env'

const WINDOW_MS = 15 * 60 * 1000 // 15 minutes

/**
 * Stricter limit for auth endpoints (login, signup, OAuth)
 * Prevents brute force and credential stuffing
 */
export const authRateLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: parseInt(process.env.RATE_LIMIT_AUTH_MAX || '10', 10),
  message: { success: false, message: 'Too many attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => config.nodeEnv !== 'production',
})

/**
 * Moderate limit for public endpoints (referral forms)
 * Prevents spam submissions
 */
export const publicRateLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: parseInt(process.env.RATE_LIMIT_PUBLIC_MAX || '30', 10),
  message: { success: false, message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => config.nodeEnv !== 'production',
})

/**
 * General API rate limit
 * Applies to all /api routes
 */
export const generalRateLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: parseInt(process.env.RATE_LIMIT_GENERAL_MAX || '100', 10),
  message: { success: false, message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => config.nodeEnv !== 'production',
})
