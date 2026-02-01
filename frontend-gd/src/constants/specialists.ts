import type { SpecialtyConfig } from '@/types/specialists'

export const INSURANCE_OPTIONS = [
  "Delta Dental PPO", "DeltaCare HMO / Delta Dental HMO",
  "Cigna Dental PPO", "Cigna Dental HMO",
  "UnitedHealthcare Dental PPO", "UnitedHealthcare Dental HMO",
  "Aetna Dental PPO", "Aetna Dental HMO",
  "MetLife Dental PPO", "MetLife Dental HMO",
  "Guardian Dental PPO", "Managed DentalGuard HMO",
  "Humana Dental PPO", "Humana Dental HMO",
  "Anthem / Blue Cross Blue Shield PPO", "Anthem / Blue Cross Blue Shield HMO",
  "Ameritas PPO", "Ameritas Dental HMO",
  "DentaQuest PPO", "DentaQuest HMO / DentaQuest DHMO",
  "Medicaid", "CHIP", "Medicare Advantage"
] as const

export const SPECIALTY_CATEGORIES: SpecialtyConfig[] = [
  { category: "General Dentistry", subSpecialties: ["Preventive Dentistry", "Cosmetic Dentistry", "Family Dentistry", "Adult & Pediatric General Dentistry"] },
  { category: "Orthodontics", subSpecialties: ["Traditional Braces", "Clear Aligners", "Lingual Braces", "Orthognathic Alignment", "Pediatric Orthodontics"] },
  { category: "Endodontics", subSpecialties: ["Root Canal Therapy", "Retreatment", "Apicoectomy", "Traumatic Dental Injuries"] },
  { category: "Periodontics", subSpecialties: ["Gum Disease Treatment", "Periodontal Surgery", "Crown Lengthening", "Dental Implants", "Soft Tissue Grafting"] },
  { category: "Prosthodontics", subSpecialties: ["Fixed Prosthodontics", "Removable Prosthodontics", "Implant-Supported", "Maxillofacial", "Cosmetic Prosthodontics"] },
  { category: "Pediatric Dentistry", subSpecialties: ["Preventive Care", "Restorative", "Pediatric Oral Surgery", "Sedation Management", "Early Ortho Intervention"] },
  { category: "Oral & Maxillofacial Surgery", subSpecialties: ["Tooth Extractions", "Dental Implant Surgery", "Corrective Jaw Surgery", "Facial Trauma", "TMJ Surgery", "Cleft Lip & Palate"] },
  { category: "Pathology & Biopsy", subSpecialties: ["Oral & Maxillofacial Pathology", "Diagnosis of Lesions", "Oral Cancer Screening", "Biopsy & Histopathology"] },
  { category: "Radiology", subSpecialties: ["Panoramic Imaging", "CBCT Imaging", "Cephalometric Analysis", "3D Interpretation"] },
  { category: "Special Care / Geriatric", subSpecialties: ["Special Needs Care", "Geriatric Dentistry", "Medically Complex Management", "Sedation for Special Needs"] },
  { category: "Implant Dentistry", subSpecialties: ["Single Tooth", "Full-Arch", "All-on-4 / All-on-6", "Implant Maintenance"] },
  { category: "TMJ & Orofacial Pain", subSpecialties: ["TMD Management", "Facial & Neuropathic Pain", "Occlusal Splints", "Muscle Therapy"] },
  { category: "Sleep Dentistry", subSpecialties: ["Oral Appliances for Sleep Apnea", "Snoring Treatment", "TMJ-Related Sleep Issues"] }
]

export const SORT_OPTIONS = [
  { value: 'fastest', label: 'Fastest Availability' },
  { value: 'highest-rated', label: 'Highest Rated' },
  { value: 'closest', label: 'Closest Distance' }
] as const
