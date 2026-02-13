/**
 * Shared constants for Vector Referral
 */

// Pagination
export const DEFAULT_PAGE_SIZE = 10
export const MAX_PAGE_SIZE = 100

// File Upload
export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const

// Validation
export const PASSWORD_MIN_LENGTH = 6
export const PHONE_REGEX = /^[\d\s\-\+\(\)]+$/
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

