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
export type ReferralType = 'outgoing' | 'incoming'

export interface Referral {
  id: string
  
  // Referral Direction
  referralType: ReferralType
  
  // For OUTGOING (you send)
  fromClinicId: string
  toContactId?: string
  toClinicId?: string
  contact?: Contact
  
  // For INCOMING (you receive)
  fromClinicName?: string
  fromClinicEmail?: string
  fromClinicPhone?: string
  referringDentist?: string
  
  // Patient Information
  patientName: string
  patientDob: string
  patientPhone?: string
  patientEmail?: string
  
  // Referral Details
  reason: string
  urgency: ReferralUrgency
  status: ReferralStatus
  notes?: string
  
  // Files
  files?: ReferralFile[]
  
  // Timestamps
  createdAt: string
  updatedAt: string
}

// Notification Types
export type NotificationType = 
  | 'new_incoming_referral'
  | 'referral_accepted'
  | 'referral_rejected'
  | 'referral_completed'
  | 'referral_status_update'
  | 'system_message'

export interface Notification {
  id: string
  clinicId: string
  userId?: string
  type: NotificationType
  referralId?: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
  referral?: Referral
}

// Clinic Referral Link
export interface ClinicReferralLink {
  id: string
  clinicId: string
  slug: string
  isActive: boolean
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

// Dashboard Stats (Updated for Two-Way System)
export interface DashboardStats {
  // Overall stats
  totalReferrals: number
  totalOutgoing: number
  totalIncoming: number
  
  // Action needed
  pendingIncoming: number  // Need to accept/reject
  pendingOutgoing: number  // Waiting for response
  
  // Completed
  completedThisMonth: number
  
  // Charts
  referralsBySpecialty: Array<{
    specialty: string
    count: number
    percentage: number
  }>
  referralTrends: Array<{
    month: string
    outgoing: number
    incoming: number
  }>
  
  // Recent referrals
  recentIncoming: Referral[]
  recentOutgoing: Referral[]
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

