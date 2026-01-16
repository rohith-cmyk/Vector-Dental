import { Request, Response, NextFunction } from 'express'
import { ApiError } from '../utils/errors'

/**
 * Global error handling middleware
 */
export function errorHandler(
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Handle Multer errors (file upload errors)
  if (err.name === 'MulterError' || (err as any).code === 'LIMIT_FILE_SIZE') {
    console.error('Multer error:', err.message)
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`,
    })
  }

  // Log error with more details in development
  if (process.env.NODE_ENV === 'development') {
    console.error('=== ERROR DETAILS ===')
    console.error('Error name:', err.name)
    console.error('Error message:', err.message)
    if (err instanceof ApiError) {
      console.error('Status code:', err.statusCode)
      console.error('Errors:', err.errors)
    } else {
      console.error('Stack:', err.stack)
    }
    console.error('Request method:', req.method)
    console.error('Request URL:', req.originalUrl)
    console.error('===================')
  } else {
    console.error('Error:', err.message)
  }

  // Handle ApiError
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    })
  }

  // Handle unknown errors
  return res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  })
}

