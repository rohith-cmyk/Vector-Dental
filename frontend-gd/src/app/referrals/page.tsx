'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowUpRight, Eye, Search } from 'lucide-react'
import { DashboardLayout } from '@/components/layout'
import { Badge, Card, CardContent, LoadingState } from '@/components/ui'
import { NewReferralForm } from '@/components/referrals/NewReferralModal'
import { ReferralDetailModal } from '@/components/referrals/ReferralDetailModal'
import { referralService } from '@/services/api'
import { useAuth } from '@/contexts/AuthContext'
import type { Referral } from '@/types'

type StatusFilter = Referral['status'] | 'all'

const statusOptions: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All Status' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SENT', label: 'Sent' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'ACCEPTED', label: 'Accepted' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

const mockReferrals: Referral[] = [
  {
    id: 'mock-1',
    patientFirstName: 'Captain',
    patientLastName: 'Doe',
    patientName: 'Captain Doe',
    patientDob: '1986-06-12',
    patientPhone: '+1 7739432531',
    patientEmail: 'captain.doe@example.com',
    insurance: null,
    reason: 'Surgical Orthodontics consult',
    urgency: 'URGENT',
    status: 'COMPLETED',
    selectedTeeth: [],
    notes: null,
    appointmentDate: null,
    appointmentNotes: null,
    patientAttendedAt: null,
    treatmentStartedAt: null,
    treatmentCompletedAt: null,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    intendedRecipient: {
      id: 'spec-1',
      name: 'Raise Canes',
      email: 'raise.canes@example.com',
      clinic: {
        id: 'clinic-1',
        name: 'Edgewater',
        address: null,
        phone: null,
        email: null,
        logoUrl: null,
      },
    },
  },
  {
    id: 'mock-2',
    patientFirstName: 'Peter',
    patientLastName: 'Parker',
    patientName: 'Peter Parker',
    patientDob: '1992-07-22',
    patientPhone: '+1 7739432531',
    patientEmail: 'peter.parker@example.com',
    insurance: null,
    reason: 'Interceptive Orthodontics consult',
    urgency: 'URGENT',
    status: 'COMPLETED',
    selectedTeeth: [],
    notes: null,
    appointmentDate: null,
    appointmentNotes: null,
    patientAttendedAt: null,
    treatmentStartedAt: null,
    treatmentCompletedAt: null,
    createdAt: new Date('2026-01-21T12:00:00Z').toISOString(),
    updatedAt: new Date('2026-01-21T12:00:00Z').toISOString(),
    intendedRecipient: {
      id: 'spec-2',
      name: 'dr sundaram',
      email: 'sundaram@example.com',
      clinic: {
        id: 'clinic-2',
        name: 'Cuday',
        address: null,
        phone: null,
        email: null,
        logoUrl: null,
      },
    },
  },
  {
    id: 'mock-3',
    patientFirstName: 'Dylan',
    patientLastName: 'Gerstenhaber',
    patientName: 'Dylan Gerstenhaber',
    patientDob: '1988-05-18',
    patientPhone: '',
    patientEmail: 'dylan.gerstenhaber@example.com',
    insurance: null,
    reason: 'Root Canal Treatment',
    urgency: 'ROUTINE',
    status: 'COMPLETED',
    selectedTeeth: [],
    notes: null,
    appointmentDate: null,
    appointmentNotes: null,
    patientAttendedAt: null,
    treatmentStartedAt: null,
    treatmentCompletedAt: null,
    createdAt: new Date('2026-01-19T12:00:00Z').toISOString(),
    updatedAt: new Date('2026-01-19T12:00:00Z').toISOString(),
    intendedRecipient: {
      id: 'spec-3',
      name: 'Dylan Gerstenhaber',
      email: 'dylan@example.com',
      clinic: {
        id: 'clinic-3',
        name: 'Dylan',
        address: null,
        phone: null,
        email: null,
        logoUrl: null,
      },
    },
  },
  {
    id: 'mock-4',
    patientFirstName: 'Dylan',
    patientLastName: 'Gerstenhaber',
    patientName: 'Dylan Gerstenhaber',
    patientDob: '1988-05-18',
    patientPhone: '',
    patientEmail: 'dylan.gerstenhaber@example.com',
    insurance: null,
    reason: 'Full Mouth Rehab',
    urgency: 'URGENT',
    status: 'ACCEPTED',
    selectedTeeth: [],
    notes: null,
    appointmentDate: null,
    appointmentNotes: null,
    patientAttendedAt: null,
    treatmentStartedAt: null,
    treatmentCompletedAt: null,
    createdAt: new Date('2026-01-19T12:00:00Z').toISOString(),
    updatedAt: new Date('2026-01-19T12:00:00Z').toISOString(),
    intendedRecipient: {
      id: 'spec-4',
      name: 'Dylan Gerstenhaber',
      email: 'dylan@example.com',
      clinic: {
        id: 'clinic-4',
        name: 'Dylan',
        address: null,
        phone: null,
        email: null,
        logoUrl: null,
      },
    },
  },
  {
    id: 'mock-5',
    patientFirstName: 'Dylan',
    patientLastName: 'Gerstenhaber',
    patientName: 'Dylan Gerstenhaber',
    patientDob: '1988-05-18',
    patientPhone: '',
    patientEmail: 'dylan.gerstenhaber@example.com',
    insurance: null,
    reason: 'Pediatric Dental',
    urgency: 'ROUTINE',
    status: 'COMPLETED',
    selectedTeeth: [],
    notes: null,
    appointmentDate: null,
    appointmentNotes: null,
    patientAttendedAt: null,
    treatmentStartedAt: null,
    treatmentCompletedAt: null,
    createdAt: new Date('2026-01-19T12:00:00Z').toISOString(),
    updatedAt: new Date('2026-01-19T12:00:00Z').toISOString(),
    intendedRecipient: {
      id: 'spec-5',
      name: 'Dylan Gerstenhaber',
      email: 'dylan@example.com',
      clinic: {
        id: 'clinic-5',
        name: 'Dylan',
        address: null,
        phone: null,
        email: null,
        logoUrl: null,
      },
    },
  },
  {
    id: 'mock-6',
    patientFirstName: 'Dylan',
    patientLastName: 'Gerstenhaber',
    patientName: 'Dylan Gerstenhaber',
    patientDob: '1988-05-18',
    patientPhone: '',
    patientEmail: 'dylan.gerstenhaber@example.com',
    insurance: null,
    reason: 'Pediatric Dental',
    urgency: 'ROUTINE',
    status: 'ACCEPTED',
    selectedTeeth: [],
    notes: null,
    appointmentDate: null,
    appointmentNotes: null,
    patientAttendedAt: null,
    treatmentStartedAt: null,
    treatmentCompletedAt: null,
    createdAt: new Date('2026-01-19T12:00:00Z').toISOString(),
    updatedAt: new Date('2026-01-19T12:00:00Z').toISOString(),
    intendedRecipient: {
      id: 'spec-6',
      name: 'Dylan Gerstenhaber',
      email: 'dylan@example.com',
      clinic: {
        id: 'clinic-6',
        name: 'Dylan',
        address: null,
        phone: null,
        email: null,
        logoUrl: null,
      },
    },
  },
  {
    id: 'mock-7',
    patientFirstName: 'John',
    patientLastName: 'Doe',
    patientName: 'John Doe',
    patientDob: '1985-03-15',
    patientPhone: '+1 7739432531',
    patientEmail: 'john.doe@example.com',
    insurance: null,
    reason: 'Sedation / GA',
    urgency: 'ROUTINE',
    status: 'CANCELLED',
    selectedTeeth: [],
    notes: null,
    appointmentDate: null,
    appointmentNotes: null,
    patientAttendedAt: null,
    treatmentStartedAt: null,
    treatmentCompletedAt: null,
    createdAt: new Date('2026-01-19T12:00:00Z').toISOString(),
    updatedAt: new Date('2026-01-19T12:00:00Z').toISOString(),
    intendedRecipient: {
      id: 'spec-7',
      name: 'Dr. McDonalds',
      email: 'mcdonalds@example.com',
      clinic: {
        id: 'clinic-7',
        name: 'Edgewater',
        address: null,
        phone: null,
        email: null,
        logoUrl: null,
      },
    },
  },
  {
    id: 'mock-8',
    patientFirstName: 'John',
    patientLastName: 'Doe',
    patientName: 'John Doe',
    patientDob: '1985-03-15',
    patientPhone: '+1 7739432531',
    patientEmail: 'john.doe@example.com',
    insurance: null,
    reason: 'Orthodontic Evaluation',
    urgency: 'URGENT',
    status: 'COMPLETED',
    selectedTeeth: [],
    notes: null,
    appointmentDate: null,
    appointmentNotes: null,
    patientAttendedAt: null,
    treatmentStartedAt: null,
    treatmentCompletedAt: null,
    createdAt: new Date('2026-01-18T12:00:00Z').toISOString(),
    updatedAt: new Date('2026-01-18T12:00:00Z').toISOString(),
    intendedRecipient: {
      id: 'spec-8',
      name: 'Dr. McDonalds',
      email: 'mcdonalds@example.com',
      clinic: {
        id: 'clinic-8',
        name: 'Cuday loyola',
        address: null,
        phone: null,
        email: null,
        logoUrl: null,
      },
    },
  },
]

function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000)

  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`

  return d.toLocaleDateString()
}

function getUrgencyBadgeVariant(urgency?: Referral['urgency']) {
  if (!urgency) return 'default'
  switch (urgency) {
    case 'EMERGENCY':
      return 'danger'
    case 'URGENT':
      return 'warning'
    default:
      return 'default'
  }
}

function getStatusBadgeVariant(status?: Referral['status']) {
  if (!status) return 'default'
  switch (status) {
    case 'COMPLETED':
      return 'success'
    case 'SENT':
    case 'SUBMITTED':
      return 'info'
    case 'ACCEPTED':
      return 'warning'
    case 'REJECTED':
    case 'CANCELLED':
      return 'danger'
    default:
      return 'default'
  }
}

function getPatientName(referral: Referral) {
  if (referral.patientName) return referral.patientName
  const parts = [referral.patientFirstName, referral.patientLastName].filter(Boolean)
  return parts.length ? parts.join(' ') : 'Unknown'
}

function getReferralsList(payload: unknown): Referral[] {
  if (!payload || typeof payload !== 'object') return []
  if (Array.isArray(payload)) return payload as Referral[]
  const record = payload as Record<string, unknown>
  if (Array.isArray(record.referrals)) return record.referrals as Referral[]
  if (Array.isArray(record.items)) return record.items as Referral[]
  const firstArray = Object.values(record).find(Array.isArray)
  return (firstArray as Referral[]) || []
}

function ReferralsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoading: authLoading } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [activeTab, setActiveTab] = useState<'sent' | 'draft'>('sent')
  const [view, setView] = useState<'list' | 'form'>('list')
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [loading, setLoading] = useState(true)
  const [useMockReferrals, setUseMockReferrals] = useState(false)
  const [selectedReferralId, setSelectedReferralId] = useState<string | null>(null)
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null)
  const [editingDraft, setEditingDraft] = useState<Referral | null>(null)
  const [prefillSpecialistId, setPrefillSpecialistId] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    const openId = searchParams.get('openId')
    if (!openId) return
    setView('list')
    setActiveTab('sent')

    const existing = referrals.find((referral) => referral.id === openId) || null
    if (existing) {
      setSelectedReferralId(openId)
      setSelectedReferral(existing)
      return
    }

    referralService
      .getReferralById(openId)
      .then((response) => {
        if (response.data) {
          setSelectedReferralId(openId)
          setSelectedReferral(response.data)
        }
      })
      .catch((error) => {
        console.error('Failed to load referral from link:', error)
      })
  }, [searchParams, referrals, router])

  useEffect(() => {
    const specialistId = searchParams.get('specialistId')
    if (!specialistId) return
    setPrefillSpecialistId(specialistId)
    setEditingDraft(null)
    setView('form')
  }, [searchParams])

  const fetchReferrals = async () => {
    setLoading(true)
    try {
      const response = await referralService.getMyReferrals({
        limit: 50,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchQuery.trim() || undefined,
      })
      setReferrals(getReferralsList(response.data))
      setUseMockReferrals(false)
    } catch (error) {
      console.error('Failed to fetch referrals:', error)
      setReferrals([])
      setUseMockReferrals(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) return
    const timer = setTimeout(() => {
      fetchReferrals()
    }, 300)

    return () => clearTimeout(timer)
  }, [user, searchQuery, statusFilter])

  const effectiveReferrals = useMockReferrals ? mockReferrals : referrals
  const tabFilteredReferrals = effectiveReferrals.filter((referral) =>
    activeTab === 'draft' ? referral.status === 'DRAFT' : referral.status !== 'DRAFT'
  )
  const hasResults = tabFilteredReferrals.length > 0

  const statusValue = useMemo(() => statusFilter, [statusFilter])

  if (authLoading) {
    return (
      <DashboardLayout title="Referrals" subtitle="Loading your referrals">
        <div className="flex items-center justify-center min-h-[360px]">
          <LoadingState title="Loading referrals..." subtitle="Fetching your latest updates" />
        </div>
      </DashboardLayout>
    )
  }

  if (!user) return null

  return (
    <DashboardLayout title="Referrals" subtitle="Track referrals you have sent">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="relative inline-flex items-center rounded-full border border-black/10 bg-white p-1 shadow-sm">
            {view === 'list' && (
              <span
                className={`absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full border border-emerald-200 bg-emerald-50 transition-transform duration-300 ${activeTab === 'draft' ? 'translate-x-full' : ''
                  }`}
              />
            )}
            <button
              type="button"
              onClick={() => {
                setActiveTab('sent')
                setStatusFilter('all')
                setView('list')
              }}
              className={`relative z-10 flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${view === 'list' && activeTab === 'sent'
                ? 'text-emerald-700'
                : 'text-neutral-500 hover:text-neutral-700'
                }`}
            >
              <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
              Sent
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('draft')
                setStatusFilter('DRAFT')
                setView('list')
              }}
              className={`relative z-10 flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${view === 'list' && activeTab === 'draft'
                ? 'text-emerald-700'
                : 'text-neutral-500 hover:text-neutral-700'
                }`}
            >
              Draft
            </button>
          </div>
          {view === 'form' && (
            <button
              type="button"
              onClick={() => setView('list')}
              className="px-3 py-1.5 text-sm font-medium text-neutral-500 hover:text-neutral-700 border border-neutral-200 rounded-full hover:border-neutral-300"
            >
              Back to list
            </button>
          )}
        </div>

        {view === 'list' && (
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" strokeWidth={1.5} />
                <input
                  type="text"
                  placeholder="Search referrals"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="cursor-pointer w-full pl-10 pr-4 py-2 border border-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-100 bg-white text-sm text-neutral-700 placeholder-neutral-400 transition-colors"
                />
              </div>
              <div className="flex-shrink-0">
                <select
                  value={statusValue}
                  onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                  className="cursor-pointer w-full min-w-[160px] appearance-none rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-100"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingDraft(null)
                setView('form')
              }}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-sm text-white rounded-full hover:bg-emerald-700 transition-colors"
            >
              New Referral
            </button>
          </div>
        )}

        {view === 'form' ? (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-neutral-900">Create Referral</h2>
              <p className="text-sm text-neutral-500">Fill in the details and send to a specialist.</p>
            </div>
            <Card className="max-w-4xl mx-auto w-full">
              <CardContent className="p-6">
                <NewReferralForm
                  initialReferral={editingDraft}
                  initialSpecialistId={prefillSpecialistId}
                  onCancel={() => {
                    setView('list')
                    setEditingDraft(null)
                    setPrefillSpecialistId(null)
                  }}
                  onSuccess={() => {
                    fetchReferrals()
                    setView('list')
                    setEditingDraft(null)
                    setPrefillSpecialistId(null)
                  }}
                />
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-400"></div>
                </div>
              ) : !hasResults ? (
                <div className="flex flex-col items-center justify-center h-64 text-neutral-500">
                  <p>{activeTab === 'draft' ? 'No draft referrals found' : 'No referrals found'}</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg">
                  <table className="w-full table-fixed">
                    <thead className="bg-neutral-50">
                      <tr>
                        <th className="w-52 px-6 py-4 text-left text-xs font-medium text-neutral-400 tracking-wide">
                          Patient
                        </th>
                        <th className="w-56 px-6 py-4 text-left text-xs font-medium text-neutral-400 tracking-wide">
                          To Clinic
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-neutral-400 tracking-wide">
                          Reason
                        </th>
                        <th className="w-28 px-6 py-4 text-left text-xs font-medium text-neutral-400 tracking-wide">
                          Urgency
                        </th>
                        <th className="w-28 px-6 py-4 text-left text-xs font-medium text-neutral-400 tracking-wide">
                          Status
                        </th>
                        <th className="w-32 px-6 py-4 text-left text-xs font-medium text-neutral-400 tracking-wide">
                          Sent
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-black/5">
                      {tabFilteredReferrals.map((referral) => (
                        <tr
                          key={referral.id}
                          className="hover:bg-gray-100 transition-colors cursor-pointer"
                          onClick={() => {
                            if (activeTab === 'draft' && referral.status === 'DRAFT') {
                              setEditingDraft(referral)
                              setView('form')
                              return
                            }
                            setSelectedReferralId(referral.id)
                            setSelectedReferral(referral)
                          }}
                        >
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-neutral-700">
                              {getPatientName(referral)}
                            </div>
                            <div className="text-xs text-neutral-400">
                              {referral.patientPhone || '—'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-neutral-700">
                              {referral.intendedRecipient?.clinic?.name || 'Clinic'}
                            </div>
                            <div className="text-xs text-neutral-400">
                              {referral.intendedRecipient?.name || 'Specialist'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-neutral-400 truncate">
                              {referral.reason}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={getUrgencyBadgeVariant(referral.urgency)}>
                              {(referral.urgency || '').toUpperCase()}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={getStatusBadgeVariant(referral.status)}>
                              {(referral.status || '').toUpperCase()}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-sm text-neutral-500" suppressHydrationWarning>
                            {referral.createdAt ? formatRelativeTime(referral.createdAt) : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <ReferralDetailModal
        isOpen={!!selectedReferralId}
        referralId={selectedReferralId}
        initialReferral={selectedReferral}
        onClose={() => {
          setSelectedReferralId(null)
          setSelectedReferral(null)
          fetchReferrals()
        }}
      />
    </DashboardLayout>
  )
}

export default function ReferralsPage() {
  return (
    <Suspense fallback={<LoadingState title="Loading referrals..." subtitle="Preparing referral list" />}>
      <ReferralsPageContent />
    </Suspense>
  )
}
