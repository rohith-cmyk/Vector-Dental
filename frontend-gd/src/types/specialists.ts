// Insurance Provider Types
export type InsuranceProvider =
  | "Delta Dental PPO" | "DeltaCare HMO / Delta Dental HMO"
  | "Cigna Dental PPO" | "Cigna Dental HMO"
  | "UnitedHealthcare Dental PPO" | "UnitedHealthcare Dental HMO"
  | "Aetna Dental PPO" | "Aetna Dental HMO"
  | "MetLife Dental PPO" | "MetLife Dental HMO"
  | "Guardian Dental PPO" | "Managed DentalGuard HMO"
  | "Humana Dental PPO" | "Humana Dental HMO"
  | "Anthem / Blue Cross Blue Shield PPO" | "Anthem / Blue Cross Blue Shield HMO"
  | "Ameritas PPO" | "Ameritas Dental HMO"
  | "DentaQuest PPO" | "DentaQuest HMO / DentaQuest DHMO"
  | "Medicaid" | "CHIP" | "Medicare Advantage";

export interface SpecialtyConfig {
  category: string;
  subSpecialties: string[];
}

export interface MetricStats {
  referralToApptDays: number;
  fastestAppt: string;
  caseCompletionAvgDays: number;
  percentileSpeed: number;
  sameDayAvailability: boolean;
  sameDayOpReport: boolean;
}

export interface RatingStats {
  overallScore: number;
  googleRating: number;
  reviewCount: number;
  providerMetrics: {
    communication: number;
    timeliness: number;
    caseOutcome: number;
    easeOfScheduling: number;
    referAgain: number;
  };
}

export interface LocationInfo {
  address: string;
  city: string;
  state: string;
  zip: string;
  coordinates: { lat: number; lng: number };
  officeHours: string;
  emergencyHours: string | null;
  phone: string;
  website: string;
  email?: string;
}

export interface SpecialistProfile {
  id: string;
  firstName: string;
  lastName: string;
  credentials: string;
  specialty: string;
  subSpecialties: string[];
  yearsInPractice: number;
  boardCertified: boolean;
  languages: string[];
  headshotUrl: string;
  officePhotoUrl: string;
  location: LocationInfo;
  insuranceAccepted: InsuranceProvider[];
  financingOptions: string[];
  metrics: MetricStats;
  ratings: RatingStats;
  badges: string[];
}
