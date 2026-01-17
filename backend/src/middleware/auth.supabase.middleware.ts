import { Request, Response, NextFunction } from 'express'
import { supabaseAdmin } from '../config/supabase'
import { prisma } from '../config/database'
import { errors } from '../utils/errors'

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string
        clinicId: string
        email: string
        role: string
      }
    }
  }
}

/**
 * Authentication middleware for Supabase Auth
 * Verifies Supabase JWT token and attaches user info to request
 */
export function authenticateSupabase(req: Request, _res: Response, next: NextFunction) {
  const asyncHandler = async () => {
    try {
      const authHeader = req.headers.authorization

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw errors.unauthorized('No token provided')
      }

      const token = authHeader.substring(7) // Remove 'Bearer ' prefix

      // Verify token with Supabase
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)

      if (error) {
        console.error('Supabase token verification error:', error.message)
        throw errors.unauthorized(`Invalid or expired token: ${error.message}`)
      }

      if (!user) {
        console.error('No user returned from Supabase')
        throw errors.unauthorized('Invalid or expired token: No user found')
      }

      // Check if email is verified (disabled for development)
      // if (!user.email_confirmed_at) {
      //   throw errors.unauthorized('Please verify your email before logging in')
      // }

      // Get user profile from database
      const userProfile = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          email: true,
          role: true,
          clinicId: true,
        },
      })

      if (!userProfile) {
        throw errors.unauthorized('User profile not found')
      }

      // Attach user info to request
      req.user = {
        userId: userProfile.id,
        clinicId: userProfile.clinicId,
        email: userProfile.email,
        role: userProfile.role,
      }

      next()
    } catch (error) {
      next(errors.unauthorized('Invalid or expired token'))
    }
  }

  asyncHandler()
}

/**
 * Role-based authorization middleware
 */
export function authorize(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(errors.unauthorized())
    }

    if (!roles.includes(req.user.role)) {
      return next(errors.forbidden('Insufficient permissions'))
    }

    next()
  }
}

