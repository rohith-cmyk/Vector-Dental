/**
 * Custom API Error class
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public errors?: Record<string, string[]>
  ) {
    super(message)
    this.name = 'ApiError'
    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * Common error creators
 */
export const errors = {
  badRequest: (message = 'Bad request', errors?: Record<string, string[]>) =>
    new ApiError(400, message, errors),
  
  unauthorized: (message = 'Unauthorized') =>
    new ApiError(401, message),
  
  forbidden: (message = 'Forbidden') =>
    new ApiError(403, message),
  
  notFound: (message = 'Resource not found') =>
    new ApiError(404, message),
  
  conflict: (message = 'Conflict') =>
    new ApiError(409, message),
  
  internal: (message = 'Internal server error') =>
    new ApiError(500, message),
}

