export interface User {
    id: string
    email: string
    name: string
    role: 'GENERAL_DENTIST'
    userType: 'GENERAL_DENTIST'
    clinicId: string
    createdAt: string
    updatedAt: string
}

export interface Clinic {
    id: string
    name: string
    address: string | null
    phone: string | null
    email: string | null
    logoUrl: string | null
}

export interface Specialist {
    id: string
    name: string
    email: string
    clinic: Clinic
    referralCount: number
    rating: number
    distance?: number | null
    specialistProfile?: {
        firstName?: string | null
        lastName?: string | null
        credentials?: string | null
        specialty?: string | null
        subSpecialties?: string[] | null
        yearsInPractice?: number | null
        boardCertified?: boolean | null
        languages?: string[] | null
        insuranceAccepted?: string[] | null
        phone?: string | null
        email?: string | null
        website?: string | null
        photoUrl?: string | null
        address?: string | null
        city?: string | null
        state?: string | null
        zip?: string | null
    } | null
}

export interface Referral {
    id: string
    patientFirstName: string
    patientLastName: string
    patientName: string
    patientDob: string
    patientPhone?: string | null
    patientEmail?: string | null
    insurance?: string | null
    reason: string
    urgency: 'ROUTINE' | 'URGENT' | 'EMERGENCY'
    status: 'DRAFT' | 'SENT' | 'SUBMITTED' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED'
    selectedTeeth: string[]
    notes?: string | null
    appointmentDate?: string | null
    appointmentNotes?: string | null
    patientAttendedAt?: string | null
    treatmentStartedAt?: string | null
    treatmentCompletedAt?: string | null
    createdAt: string
    updatedAt: string
    intendedRecipient?: {
        id: string
        name: string
        email: string
        clinic: Clinic
    }
    files?: ReferralFile[]
    operativeReports?: OperativeReport[]
    postTreatmentReports?: PostTreatmentReport[]
}

export interface ReferralFile {
    id: string
    filename: string
    fileUrl: string
    fileType: string
    uploadedAt: string
}

export interface OperativeReport {
    id: string
    referralId: string
    findings: string
    diagnosis?: string | null
    treatmentPlan: string
    notes?: string | null
    reportDate: string
    createdAt: string
    createdBy: {
        id: string
        name: string
    }
}

export interface PostTreatmentReport {
    id: string
    referralId: string
    treatmentSummary: string
    outcome: string
    complications?: string | null
    recommendations: string
    followUpNeeded: boolean
    reportDate: string
    createdAt: string
    createdBy: {
        id: string
        name: string
    }
}

export interface DashboardStats {
    total: number
    pending: number
    accepted: number
    completed: number
    rejected: number
}

export interface AuthResponse {
    success: boolean
    data: {
        user: User
        clinic?: Clinic
        token: string
    }
}

export interface ApiResponse<T> {
    success: boolean
    data: T
    message?: string
}

export interface PaginatedResponse<T> {
    success: boolean
    data: {
        [key: string]: T[]
        pagination: {
            page: number
            limit: number
            total: number
            totalPages: number
        }
    }
}
