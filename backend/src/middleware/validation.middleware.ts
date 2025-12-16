import { Request, Response, NextFunction } from 'express'
import { validationResult, ValidationChain } from 'express-validator'
import { errors } from '../utils/errors'

/**
 * Validation middleware
 * Checks for validation errors from express-validator
 */
export function validate(req: Request, res: Response, next: NextFunction) {
  const validationErrors = validationResult(req)

  if (!validationErrors.isEmpty()) {
    const formattedErrors: Record<string, string[]> = {}

    validationErrors.array().forEach((error) => {
      if (error.type === 'field') {
        const field = error.path
        if (!formattedErrors[field]) {
          formattedErrors[field] = []
        }
        formattedErrors[field].push(error.msg)
      }
    })

    // Log validation errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Validation errors:', formattedErrors)
      console.error('Request body keys:', Object.keys(req.body || {}))
    }

    throw errors.badRequest('Validation failed', formattedErrors)
  }

  next()
}

/**
 * Helper to run validation chains
 */
export function validateRequest(validations: ValidationChain[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map((validation) => validation.run(req)))
    validate(req, res, next)
  }
}

