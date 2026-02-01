'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { DashboardLayout } from '@/components/layout'
import { FilterSidebar } from '@/components/specialists/FilterSidebar'
import { SpecialistCard } from '@/components/specialists/SpecialistCard'
import { SpecialistDetailModal } from '@/components/specialists/SpecialistDetailModal'
import { Plus } from 'lucide-react'
import { MOCK_SPECIALISTS } from '@/data/mockSpecialists'
import type { SpecialistProfile, InsuranceProvider } from '@/types/specialists'
import type { Specialist } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { specialistService } from '@/services/api'

export default function DoctorNetworkPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [directorySpecialists, setDirectorySpecialists] = useState<SpecialistProfile[]>(MOCK_SPECIALISTS)
  const [isDirectoryLoading, setIsDirectoryLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [primarySpecialty, setPrimarySpecialty] = useState('')
  const [subSpecialties, setSubSpecialties] = useState<string[]>([])
  const [selectedInsurance, setSelectedInsurance] = useState<InsuranceProvider[]>([])
  const [sortBy, setSortBy] = useState('fastest')
  const [selectedSpecialist, setSelectedSpecialist] = useState<SpecialistProfile | null>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [isLoading, user, router])

  useEffect(() => {
    if (isLoading || !user) return

    let isMounted = true

    const fetchDirectory = async () => {
      try {
        const response = await specialistService.getDirectory()
        const specialists = response.data.specialists || []
        const mapped = mapDirectoryToProfiles(specialists)
        if (isMounted) {
          setDirectorySpecialists(mapped.length > 0 ? mapped : MOCK_SPECIALISTS)
        }
      } catch (error) {
        if (isMounted) {
          setDirectorySpecialists(MOCK_SPECIALISTS)
        }
      } finally {
        if (isMounted) {
          setIsDirectoryLoading(false)
        }
      }
    }

    fetchDirectory()

    return () => {
      isMounted = false
    }
  }, [isLoading, user])

  const filteredSpecialists = useMemo(() => {
    let filtered = [...directorySpecialists]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(s =>
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(query) ||
        s.specialty.toLowerCase().includes(query)
      )
    }

    if (primarySpecialty) {
      filtered = filtered.filter(s => s.specialty === primarySpecialty)
    }

    if (subSpecialties.length > 0) {
      filtered = filtered.filter(s =>
        subSpecialties.some(sub => s.subSpecialties.includes(sub))
      )
    }

    if (selectedInsurance.length > 0) {
      filtered = filtered.filter(s =>
        selectedInsurance.some(insurance => s.insuranceAccepted.includes(insurance))
      )
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'fastest':
          return a.metrics.referralToApptDays - b.metrics.referralToApptDays
        case 'highest-rated':
          return b.ratings.overallScore - a.ratings.overallScore
        case 'closest':
          return 0
        default:
          return 0
      }
    })

    return filtered
  }, [searchQuery, primarySpecialty, subSpecialties, selectedInsurance, sortBy])

  if (isLoading || !user) {
    return (
      <DashboardLayout title="Specialist Directory" subtitle="Loading doctor directory">
        <div className="flex items-center justify-center min-h-[360px]">
          <div className="text-sm text-neutral-500">Loading...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Specialist Directory" subtitle="Find and manage specialists">
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            mass: 0.8
          }}
          className="flex items-center justify-between gap-6"
        >
          <div className="flex items-center gap-3 flex-1">
            <button
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-sm font-semibold text-white rounded-full hover:bg-emerald-700 transition-all shadow-sm"
            >
              <Plus className="h-4 w-4" strokeWidth={2} />
              Add Specialist
            </button>
          </div>
        </motion.div>

        <div className="flex gap-6">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              mass: 0.8,
              delay: 0.1
            }}
          >
            <FilterSidebar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              primarySpecialty={primarySpecialty}
              onPrimarySpecialtyChange={setPrimarySpecialty}
              subSpecialties={subSpecialties}
              onSubSpecialtiesChange={setSubSpecialties}
              selectedInsurance={selectedInsurance}
              onInsuranceChange={setSelectedInsurance}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              delay: 0.2
            }}
            className="flex-1"
          >
            <AnimatePresence mode="wait">
              {isDirectoryLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30
                  }}
                  className="bg-white rounded-3xl border border-neutral-100 p-12"
                >
                  <div className="flex flex-col items-center justify-center text-center">
                    <p className="text-sm font-normal text-neutral-400">Loading specialists...</p>
                  </div>
                </motion.div>
              ) : filteredSpecialists.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30
                  }}
                  className="bg-white rounded-3xl border border-neutral-100 p-12"
                >
                  <div className="flex flex-col items-center justify-center text-center">
                    <p className="text-sm font-normal text-neutral-400">No specialists found</p>
                    <p className="text-[10pt] font-medium text-neutral-400 mt-2">Try adjusting your filters</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
                >
                  {filteredSpecialists.map((specialist, index) => (
                    <motion.div
                      key={specialist.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                        mass: 0.8,
                        delay: index * 0.05
                      }}
                      layout
                    >
                      <SpecialistCard
                        specialist={specialist}
                        onClick={() => setSelectedSpecialist(specialist)}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        <SpecialistDetailModal
          isOpen={!!selectedSpecialist}
          onClose={() => setSelectedSpecialist(null)}
          specialist={selectedSpecialist}
        />
      </div>
    </DashboardLayout>
  )
}

function mapDirectoryToProfiles(specialists: Specialist[]): SpecialistProfile[] {
  return specialists.map((specialist, index) => {
    const fallback = MOCK_SPECIALISTS[index % MOCK_SPECIALISTS.length]
    const profile = specialist.specialistProfile
    const [firstName, ...lastNameParts] = (profile?.firstName && profile?.lastName)
      ? [profile.firstName, profile.lastName]
      : (specialist.name || 'Specialist').split(' ')

    return {
      id: specialist.id,
      firstName: firstName || fallback.firstName,
      lastName: (lastNameParts.join(' ') || profile?.lastName || fallback.lastName),
      credentials: profile?.credentials || fallback.credentials,
      specialty: profile?.specialty || fallback.specialty,
      subSpecialties: (profile?.subSpecialties && profile.subSpecialties.length > 0)
        ? profile.subSpecialties
        : fallback.subSpecialties,
      yearsInPractice: profile?.yearsInPractice ?? fallback.yearsInPractice,
      boardCertified: profile?.boardCertified ?? fallback.boardCertified,
      languages: (profile?.languages && profile.languages.length > 0)
        ? profile.languages
        : fallback.languages,
      headshotUrl: fallback.headshotUrl,
      officePhotoUrl: fallback.officePhotoUrl,
      location: {
        address: profile?.address || specialist.clinic?.address || fallback.location.address,
        city: profile?.city || fallback.location.city,
        state: profile?.state || fallback.location.state,
        zip: profile?.zip || fallback.location.zip,
        coordinates: fallback.location.coordinates,
        officeHours: fallback.location.officeHours,
        emergencyHours: fallback.location.emergencyHours,
        phone: profile?.phone || specialist.clinic?.phone || fallback.location.phone,
        website: profile?.website || fallback.location.website,
        email: profile?.email || specialist.email || fallback.location.email,
      },
      insuranceAccepted: (profile?.insuranceAccepted && profile.insuranceAccepted.length > 0)
        ? profile.insuranceAccepted as InsuranceProvider[]
        : fallback.insuranceAccepted,
      financingOptions: fallback.financingOptions,
      metrics: fallback.metrics,
      ratings: fallback.ratings,
      badges: fallback.badges,
    }
  })
}
