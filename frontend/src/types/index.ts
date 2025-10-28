// User and Authentication Types
export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'staff'
  clinicId: string
  clinic?: Clinic
  createdAt: string
  updatedAt: string
}

export interface Clinic {
  id: string
  name: string
  address?: string
  phone?: string
  email?: string
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupData {
  email: string
  password: string
  name: string
  clinicName: string
}

// Contact Types
export interface Contact {
  id: string
  clinicId: string
  name: string
  specialty: string
  phone: string
  email: string
  address?: string
  notes?: string
  status: 'active' | 'inactive'
  lastAccess?: string
  createdAt: string
  updatedAt: string
}

// Referral Types
export type ReferralStatus = 'draft' | 'sent' | 'accepted' | 'completed' | 'cancelled'
export type ReferralUrgency = 'routine' | 'urgent' | 'emergency'

export interface Referral {
  id: string
  clinicId: string
  contactId: string
  contact?: Contact
  patientName: string
  patientDob: string
  patientPhone?: string
  patientEmail?: string
  reason: string
  urgency: ReferralUrgency
  status: ReferralStatus
  notes?: string
  files?: ReferralFile[]
  createdAt: string
  updatedAt: string
}

export interface ReferralFile {
  id: string
  referralId: string
  fileName: string
  fileType: string
  fileUrl: string
  fileSize: number
  uploadedAt: string
}

// Dashboard Stats
export interface DashboardStats {
  totalReferrals: number
  pendingReferrals: number
  completedThisMonth: number
  referralsBySpecialty: Array<{
    specialty: string
    count: number
    percentage: number
  }>
  referralTrends: Array<{
    month: string
    count: number
  }>
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}

