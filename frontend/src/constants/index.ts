// App Configuration
export const APP_NAME = 'Dental Referral System'
export const APP_DESCRIPTION = 'A CRM tool for managing dental and clinical referrals'

// API Configuration
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

// Pagination
export const DEFAULT_PAGE_SIZE = 10
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

// Referral Statuses
export const REFERRAL_STATUSES = {
  draft: { label: 'Draft', color: 'gray' },
  sent: { label: 'Sent', color: 'blue' },
  accepted: { label: 'Accepted', color: 'yellow' },
  completed: { label: 'Completed', color: 'green' },
  cancelled: { label: 'Cancelled', color: 'red' },
} as const

// Referral Urgency Levels
export const URGENCY_LEVELS = {
  routine: { label: 'Routine', color: 'green' },
  urgent: { label: 'Urgent', color: 'yellow' },
  emergency: { label: 'Emergency', color: 'red' },
} as const

// Common Dental Specialties
export const DENTAL_SPECIALTIES = [
  'Orthodontics',
  'Oral Surgery',
  'Periodontics',
  'Endodontics',
  'Prosthodontics',
  'Pediatric Dentistry',
  'Oral Medicine',
  'Oral Pathology',
  'General Dentistry',
] as const

// File Upload Configuration
export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const

// Date Formats
export const DATE_FORMAT = 'MMM dd, yyyy'
export const DATETIME_FORMAT = 'MMM dd, yyyy HH:mm'
export const TIME_FORMAT = 'HH:mm'

