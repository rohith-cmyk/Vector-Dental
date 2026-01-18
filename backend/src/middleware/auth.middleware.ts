import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/jwt'
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
 * Authentication middleware
 * Verifies JWT token and attaches user info to request
 */
export function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw errors.unauthorized('No token provided')
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    const payload = verifyToken(token)
    req.user = payload

    next()
  } catch (error) {
    next(errors.unauthorized('Invalid or expired token'))
  }
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

