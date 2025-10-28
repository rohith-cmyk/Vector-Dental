/**
 * Shared types for Dental Referral System
 * These can be used by both frontend and backend
 */

// User Roles
export type UserRole = 'ADMIN' | 'STAFF'

// Contact Status
export type ContactStatus = 'ACTIVE' | 'INACTIVE'

// Referral Status
export type ReferralStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'COMPLETED' | 'CANCELLED'

// Referral Urgency
export type ReferralUrgency = 'ROUTINE' | 'URGENT' | 'EMERGENCY'

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

export type DentalSpecialty = (typeof DENTAL_SPECIALTIES)[number]

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  errors?: Record<string, string[]>
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

