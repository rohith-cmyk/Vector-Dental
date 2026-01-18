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
  logoUrl?: string
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
  status: 'ACTIVE' | 'INACTIVE'
  lastAccess?: string
  createdAt: string
  updatedAt: string
}

// Referral Types
export type ReferralStatus = 'DRAFT' | 'SENT' | 'SUBMITTED' | 'ACCEPTED' | 'COMPLETED' | 'CANCELLED' | 'REJECTED'
export type ReferralUrgency = 'ROUTINE' | 'URGENT' | 'EMERGENCY'
export type ReferralType = 'OUTGOING' | 'INCOMING'

export interface Referral {
  id: string

  // Referral Direction
  referralType: ReferralType

  // For OUTGOING (you send)
  fromClinicId: string
  toContactId?: string
  toClinicId?: string
  contact?: Contact
  clinic?: Clinic

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

  // New fields for magic link flow
  patientFirstName?: string
  patientLastName?: string
  insurance?: string
  gpClinicName?: string
  submittedByName?: string
  submittedByPhone?: string
  selectedTeeth?: string[]

  // Files
  files?: ReferralFile[]

  // Status tracking
  statusToken?: string // Token for status tracking page (only for referrals submitted via referral link)

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

// Referral Link (token-based with access code)
export interface ReferralLink {
  id: string
  specialistId: string
  token: string
  isActive: boolean
  label?: string
  specialty?: string
  referralCount?: number
  referralUrl?: string
  createdAt: string
  updatedAt: string
}

export interface CreateReferralLinkRequest {
  label?: string
  accessCode?: string
  specialty?: string
}

export interface CreateReferralLinkResponse {
  referralLink: ReferralLink
  referralUrl: string
}

export interface ReferralSubmission {
  accessCode: string
  patientFirstName: string
  patientLastName: string
  patientDob?: string
  insurance?: string
  reasonForReferral: string
  notes?: string
  gpClinicName: string
  submittedByName: string
  submittedByPhone?: string
  files?: File[]
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

  // Percentage changes (compared to previous period)
  outgoingChange?: number  // Percentage change for outgoing referrals
  incomingChange?: number  // Percentage change for incoming referrals
  completedChange?: number // Percentage change for completed referrals

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
  referralsByOffice: Array<{
    office: string
    count: number
    percentage: number
  }>
  referralTrends: Array<{
    month: string
    outgoing: number
    incoming: number
  }>
  referralProcessFlow?: Array<{
    label: string
    count: number
    percentage: number
  }>
  
  // Overview metrics
  overviewMetrics?: {
    dailyAverage: number
    avgSchedule: string
    avgAppointment: string
    avgTimeToTreatment: string
  }
  
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

