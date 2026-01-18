// App Configuration
export const APP_NAME = 'Dental Referral System'
export const APP_DESCRIPTION = 'A CRM tool for managing dental and clinical referrals'

// Development Mode - Set NEXT_PUBLIC_USE_MOCK_DATA=true to use mock data
export const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'

// API Configuration
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

// Pagination
export const DEFAULT_PAGE_SIZE = 10
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

// Specialist referral reasons
export const SPECIALIST_REASON_OPTIONS: Record<string, string[]> = {
  Endodontist: [
    'Root Canal Treatment',
    'Retreatment',
    'Evaluation Only',
    'Pain Evaluation',
    'Swelling / Abscess',
    'Cracked Tooth Evaluation',
    'Trauma',
  ],
  'Oral & Maxillofacial Surgeon': [
    'Tooth Extraction',
    'Surgical Extraction',
    'Third Molar Evaluation',
    'Implant Placement',
    'Bone Grafting',
    'Pathology / Biopsy',
    'Exposure & Bonding',
    'TMJ Evaluation',
  ],
  Periodontist: [
    'Periodontal Evaluation',
    'Scaling & Root Planing',
    'Gingival Grafting',
    'Osseous Surgery',
    'Crown Lengthening',
    'Implant Placement',
    'Peri-Implantitis Treatment',
  ],
  Prosthodontist: [
    'Full Mouth Rehabilitation',
    'Implant-Supported Prosthesis',
    'Complex Crown & Bridge',
    'Occlusal Reconstruction',
    'Esthetic Consultation',
    'Denture / Overdenture',
  ],
  Orthodontist: [
    'Orthodontic Evaluation',
    'Comprehensive Treatment',
    'Limited Treatment',
    'Clear Aligners',
    'Interceptive Orthodontics',
    'Surgical Orthodontics',
  ],
  'Pediatric Dentist': [
    'Pediatric Dental Evaluation',
    'Caries Management',
    'Pulp Therapy',
    'Extractions',
    'Space Maintainer',
    'Sedation / GA',
    'Behavior Management',
  ],
  'Oral Medicine / Pathology': [
    'Oral Lesion Evaluation',
    'Biopsy',
    'TMJ Disorder',
    'Orofacial Pain',
    'Mucosal Disease',
    'Burning Mouth Syndrome',
  ],
}

export const SPECIALIST_OPTIONS = Object.keys(SPECIALIST_REASON_OPTIONS).map((specialty) => ({
  value: specialty,
  label: specialty,
}))

export const DEFAULT_REFERRAL_REASONS = [
  'Pain Evaluation',
  'Extraction',
  'Implant Evaluation',
  'Sinus Lift',
  'Evaluation of Lesion',
  'Panoramic X-Ray',
  'Third Molar Evaluation',
  'Third Molar Extraction',
]

// Referral Statuses
export const REFERRAL_STATUSES = {
  DRAFT: { label: 'Draft', color: 'gray' },
  SENT: { label: 'Sent', color: 'blue' },
  SUBMITTED: { label: 'Submitted', color: 'orange' },
  ACCEPTED: { label: 'Accepted', color: 'yellow' },
  REJECTED: { label: 'Rejected', color: 'red' },
  COMPLETED: { label: 'Completed', color: 'green' },
  CANCELLED: { label: 'Cancelled', color: 'red' },
} as const

// Referral Urgency Levels
export const URGENCY_LEVELS = {
  ROUTINE: { label: 'Routine', color: 'green' },
  URGENT: { label: 'Urgent', color: 'yellow' },
  EMERGENCY: { label: 'Emergency', color: 'red' },
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

