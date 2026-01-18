'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { DashboardLayout } from '@/components/layout'
import { Button, Card, CardContent, Badge, Select, Tabs, LoadingState, Modal } from '@/components/ui'
import { NewReferralModal } from '@/components/referrals/NewReferralModal'
import { ReferralDetailsModal } from '@/components/referrals/ReferralDetailsModal'
import { FileUpload } from '@/components/referrals/FileUpload'
import { Plus, Search, Eye, Edit, Trash2, ArrowDownLeft, ArrowUpRight, CheckCircle, XCircle, CheckIcon, CrossIcon, X, ClipboardList } from 'lucide-react'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import { REFERRAL_STATUSES, USE_MOCK_DATA } from '@/constants'
import type { Referral, ReferralStatus, Contact } from '@/types'
import { api } from '@/lib/api'
import { getCachedData, setCachedData } from '@/lib/cache'
import { referralsService } from '@/services/referrals.service'

// Mock data for development
const mockContacts: Contact[] = [
  {
    id: '1',
    clinicId: 'clinic1',
    name: 'Dr. Sarah Johnson',
    specialty: 'Orthodontics',
    phone: '(555) 123-4567',
    email: 'sarah.johnson@ortho.com',
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    clinicId: 'clinic1',
    name: 'Dr. Michael Chen',
    specialty: 'Oral Surgery',
    phone: '(555) 234-5678',
    email: 'michael.chen@oralsurg.com',
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    clinicId: 'clinic1',
    name: 'Dr. Emily Davis',
    specialty: 'Periodontics',
    phone: '(555) 345-6789',
    email: 'emily.davis@perio.com',
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
]

const mockReferrals: Referral[] = [
  // Incoming referrals (received)
  {
    id: '1',
    referralType: 'INCOMING',
    fromClinicId: 'external1',
    fromClinicName: 'Sunset Dental Clinic',
    fromClinicEmail: 'contact@sunsetdental.com',
    fromClinicPhone: '(555) 111-2222',
    referringDentist: 'Dr. Robert Smith',
    patientName: 'John Doe',
    patientDob: '1985-03-15',
    patientPhone: '(555) 555-0101',
    patientEmail: 'john.doe@email.com',
    reason: 'Patient requires orthodontic consultation for severe crowding and bite issues',
    urgency: 'ROUTINE',
    status: 'SENT',
    notes: 'Patient has mild anxiety, prefers morning appointments',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    referralType: 'INCOMING',
    fromClinicId: 'external2',
    fromClinicName: 'Riverside Family Dentistry',
    fromClinicEmail: 'info@riversidedental.com',
    fromClinicPhone: '(555) 222-3333',
    referringDentist: 'Dr. Lisa Wong',
    patientName: 'Jane Smith',
    patientDob: '1992-07-22',
    patientPhone: '(555) 555-0102',
    patientEmail: 'jane.smith@email.com',
    reason: 'Wisdom tooth extraction - impacted lower left wisdom tooth causing pain',
    urgency: 'URGENT',
    status: 'ACCEPTED',
    notes: 'Patient allergic to penicillin, prefers sedation',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    referralType: 'INCOMING',
    fromClinicId: 'external3',
    fromClinicName: 'Mountain View Dental',
    fromClinicEmail: 'appointments@mountainviewdental.com',
    fromClinicPhone: '(555) 333-4444',
    referringDentist: 'Dr. David Brown',
    patientName: 'Michael Johnson',
    patientDob: '1978-12-05',
    patientPhone: '(555) 555-0103',
    patientEmail: 'michael.johnson@email.com',
    reason: 'Periodontal treatment needed - advanced gum disease with bone loss',
    urgency: 'ROUTINE',
    status: 'COMPLETED',
    notes: 'Patient is a smoker, committed to quitting',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks ago
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    referralType: 'INCOMING',
    fromClinicId: 'external4',
    fromClinicName: 'Oak Valley Dental Center',
    fromClinicEmail: 'contact@oakvalleydental.com',
    fromClinicPhone: '(555) 444-5555',
    referringDentist: 'Dr. Amanda Garcia',
    patientName: 'Sarah Wilson',
    patientDob: '1988-05-18',
    patientPhone: '(555) 555-0104',
    patientEmail: 'sarah.wilson@email.com',
    reason: 'Emergency root canal - severe tooth pain, swelling present',
    urgency: 'EMERGENCY',
    status: 'SENT',
    notes: 'Patient in severe pain, needs immediate attention',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    referralType: 'INCOMING',
    fromClinicId: 'external5',
    fromClinicName: 'Lakeview Dental Practice',
    fromClinicEmail: 'info@lakeviewdental.com',
    fromClinicPhone: '(555) 555-6666',
    referringDentist: 'Dr. Thomas Lee',
    patientName: 'Robert Davis',
    patientDob: '1965-09-30',
    patientPhone: '(555) 555-0105',
    patientEmail: 'robert.davis@email.com',
    reason: 'Consultation for dental implants - multiple missing teeth',
    urgency: 'ROUTINE',
    status: 'CANCELLED',
    notes: 'Patient decided to pursue treatment elsewhere',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
  // Outgoing referrals (sent)
  {
    id: '6',
    referralType: 'OUTGOING',
    fromClinicId: 'clinic1',
    toContactId: '1',
    contact: mockContacts[0],
    patientName: 'Emma Thompson',
    patientDob: '1995-11-12',
    patientPhone: '(555) 555-0201',
    patientEmail: 'emma.thompson@email.com',
    reason: 'Orthodontic evaluation for braces - Class II malocclusion',
    urgency: 'ROUTINE',
    status: 'DRAFT',
    notes: 'Teenage patient, very motivated for treatment',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '7',
    referralType: 'OUTGOING',
    fromClinicId: 'clinic1',
    toContactId: '2',
    contact: mockContacts[1],
    patientName: 'William Rodriguez',
    patientDob: '1982-04-28',
    patientPhone: '(555) 555-0202',
    patientEmail: 'william.rodriguez@email.com',
    reason: 'Surgical extraction of impacted wisdom teeth - all four',
    urgency: 'URGENT',
    status: 'SENT',
    notes: 'Patient has anxiety, may need conscious sedation',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '8',
    referralType: 'OUTGOING',
    fromClinicId: 'clinic1',
    toContactId: '3',
    contact: mockContacts[2],
    patientName: 'Olivia Martinez',
    patientDob: '1975-01-15',
    patientPhone: '(555) 555-0203',
    patientEmail: 'olivia.martinez@email.com',
    reason: 'Periodontal therapy - generalized moderate periodontitis',
    urgency: 'ROUTINE',
    status: 'ACCEPTED',
    notes: 'Patient compliant with home care, good prognosis',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '9',
    referralType: 'OUTGOING',
    fromClinicId: 'clinic1',
    toContactId: '2',
    contact: mockContacts[1],
    patientName: 'James Anderson',
    patientDob: '1990-08-20',
    patientPhone: '(555) 555-0204',
    patientEmail: 'james.anderson@email.com',
    reason: 'Oral surgery consultation - failed root canal, extraction needed',
    urgency: 'ROUTINE',
    status: 'COMPLETED',
    notes: 'Treatment completed successfully, patient doing well',
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(), // 3 weeks ago
    updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '10',
    referralType: 'OUTGOING',
    fromClinicId: 'clinic1',
    toContactId: '1',
    contact: mockContacts[0],
    patientName: 'Sophia Taylor',
    patientDob: '2005-06-10',
    patientPhone: '(555) 555-0205',
    patientEmail: 'sophia.taylor@email.com',
    reason: 'Pediatric orthodontic consultation - early treatment needed',
    urgency: 'ROUTINE',
    status: 'SENT',
    notes: 'Young patient, parents very concerned about appearance',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export default function ReferralsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ReferralStatus | 'all'>('all')
  const [isNewReferralModalOpen, setIsNewReferralModalOpen] = useState(false)
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null)
  const [activeTab, setActiveTab] = useState('received')
  const [autoOpenHandled, setAutoOpenHandled] = useState(false)
  const [isOpsModalOpen, setIsOpsModalOpen] = useState(false)
  const [opsReferral, setOpsReferral] = useState<Referral | null>(null)
  const [opsComment, setOpsComment] = useState('')
  const [opsFiles, setOpsFiles] = useState<File[]>([])
  const [isSendingOps, setIsSendingOps] = useState(false)

  const [referrals, setReferrals] = useState<Referral[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const cacheKey = `referrals_${activeTab}_${statusFilter}_${searchQuery.trim().toLowerCase()}`
  const cacheTtl = 2 * 60 * 1000

  // Fetch referrals
  const fetchReferrals = useCallback(async (showLoading: boolean = true) => {
    try {
      setLoading(true)

      if (USE_MOCK_DATA) {
        // Use mock data for development
        let filteredReferrals = mockReferrals

        // Filter by type (received = INCOMING, sent = OUTGOING, ops-report = INCOMING)
        if (activeTab === 'received') {
          filteredReferrals = filteredReferrals.filter(r => r.referralType === 'INCOMING')
        } else if (activeTab === 'sent') {
          filteredReferrals = filteredReferrals.filter(r => r.referralType === 'OUTGOING')
        } else if (activeTab === 'ops-report') {
          filteredReferrals = filteredReferrals.filter(r => r.referralType === 'INCOMING')
        }

        // Filter by status
        if (statusFilter !== 'all') {
          filteredReferrals = filteredReferrals.filter(r => r.status === statusFilter)
        }

        // Filter by search query
        if (searchQuery) {
          const query = searchQuery.toLowerCase()
          filteredReferrals = filteredReferrals.filter(r =>
            r.patientName.toLowerCase().includes(query) ||
            r.reason.toLowerCase().includes(query) ||
            (r.fromClinicName && r.fromClinicName.toLowerCase().includes(query)) ||
            (r.referringDentist && r.referringDentist.toLowerCase().includes(query)) ||
            (r.contact?.name && r.contact.name.toLowerCase().includes(query))
          )
        }

        // Sort by created date (newest first)
        filteredReferrals = filteredReferrals.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )

        setReferrals(filteredReferrals)
        setTotal(filteredReferrals.length)
      } else {
        // Use real API
        const params: any = {
          type: activeTab === 'ops-report' ? 'received' : activeTab,
          limit: 50, // Get more for list view
        }

        if (statusFilter !== 'all') {
          params.status = statusFilter
        }

        if (searchQuery) {
          params.search = searchQuery
        }

        const response = await api.get('/referrals', { params })
        if (response.data.success) {
          setReferrals(response.data.data)
          setTotal(response.data.total)
        }
      }
    } catch (error) {
      console.error('Failed to fetch referrals:', error)
    } finally {
      if (showLoading) {
        setLoading(false)
      }
    }
  }, [activeTab, statusFilter, searchQuery, cacheKey])

  // Initial fetch and refetch on filters change
  useEffect(() => {
    const cached = getCachedData<{ referrals: Referral[]; total: number }>(cacheKey)
    if (cached) {
      setReferrals(cached.referrals)
      setTotal(cached.total)
      setLoading(false)
    }

    // Debounce search
    const timer = setTimeout(() => {
      fetchReferrals(!cached)
    }, 300)

    return () => clearTimeout(timer)
  }, [fetchReferrals, cacheKey])

  useEffect(() => {
    if (autoOpenHandled) return
    const referralId = searchParams.get('referralId')
    if (!referralId) return

    setAutoOpenHandled(true)
    referralsService.getById(referralId)
      .then(async (referral) => {
        const action = searchParams.get('action')
        if (action === 'accept' && (referral.status === 'SUBMITTED' || referral.status === 'SENT')) {
          try {
            const updated = await referralsService.updateStatus(referralId, 'ACCEPTED')
            setSelectedReferral(updated)
          } catch {
            setSelectedReferral(referral)
          }
        } else {
          setSelectedReferral(referral)
        }
        fetchReferrals(false)
      })
      .catch(() => {
        // ignore - handled by UI
      })
      .finally(() => {
        router.replace('/referrals', { scroll: false })
      })
  }, [autoOpenHandled, searchParams, fetchReferrals, router])

  // Handle status update
  const handleStatusUpdate = async (id: string, newStatus: ReferralStatus) => {
    try {
      if (USE_MOCK_DATA) {
        // Update mock data locally
        setReferrals(prevReferrals =>
          prevReferrals.map(referral =>
            referral.id === id
              ? { ...referral, status: newStatus, updatedAt: new Date().toISOString() }
              : referral
          )
        )
        // Also update selected referral if it's open in modal
        if (selectedReferral && selectedReferral.id === id) {
          setSelectedReferral(prev => prev ? { ...prev, status: newStatus, updatedAt: new Date().toISOString() } : null)
        }
      } else {
        // Use real API
        await api.patch(`/referrals/${id}/status`, { status: newStatus })
        fetchReferrals()
      }
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  function getStatusBadgeVariant(status: ReferralStatus) {
    if (!status) return 'default'
    switch (status) {
      case 'COMPLETED': return 'success'
      case 'SENT': return 'info'
      case 'ACCEPTED': return 'warning'
      case 'CANCELLED': return 'danger'
      default: return 'default'
    }
  }

  function getReceivedStatusLabel(status: ReferralStatus) {
    switch (status) {
      case 'COMPLETED':
        return 'COMPLETED'
      case 'ACCEPTED':
      case 'SENT':
        return 'SCHEDULED'
      case 'SUBMITTED':
      case 'PENDING_REVIEW':
        return 'ACCEPTED'
      case 'REJECTED':
        return 'REJECTED'
      case 'CANCELLED':
        return 'CANCELLED'
      default:
        return status
    }
  }

  function getOpsStatusLabel(status: ReferralStatus) {
    return status === 'COMPLETED' ? 'SENT' : 'DRAFT'
  }

  function getReceivedStatusVariant(label: string) {
    switch (label) {
      case 'COMPLETED':
        return 'success'
      case 'SCHEDULED':
        return 'warning'
      case 'ACCEPTED':
        return 'info'
      case 'REJECTED':
        return 'danger'
      case 'CANCELLED':
        return 'danger'
      default:
        return 'default'
    }
  }

  const openOpsModal = (referral: Referral) => {
    setOpsReferral(referral)
    setOpsComment(referral.notes || '')
    setOpsFiles([])
    setIsOpsModalOpen(true)
  }

  const closeOpsModal = () => {
    setIsOpsModalOpen(false)
    setOpsReferral(null)
    setOpsComment('')
    setOpsFiles([])
  }

  const handleSendOps = async () => {
    if (!opsReferral) return
    setIsSendingOps(true)
    try {
      // Placeholder until backend endpoint is available
      alert('Ops report sent successfully.')
      closeOpsModal()
    } finally {
      setIsSendingOps(false)
    }
  }

  function getUrgencyBadgeVariant(urgency: string) {
    if (!urgency) return 'default'
    switch (urgency) {
      case 'EMERGENCY': return 'danger'
      case 'URGENT': return 'warning'
      default: return 'default'
    }
  }

  // Count strictly pending incoming for badge
  // Note: This matches dashboard logic but for the badge we might want a separate API call or just rely on current list if loaded
  // For now, let's use a simpler approach or rely on dashboard stats if available.
  // Ideally, we'd fetch the count separately.
  const pendingIncomingCount = 0 // TODO: Fetch from stats API?

  return (
    <DashboardLayout title="Referrals">
      <div className="space-y-6">
        
        {/* Tabs for Received vs Sent vs Ops Report */}
        <Tabs
          tabs={[
            {
              id: 'received',
              label: 'Received',
              icon: <ArrowDownLeft className="h-4 w-4" />,
              // badge: pendingIncomingCount // Optional: re-enable if we have count
            },
            {
              id: 'sent',
              label: 'Sent',
              icon: <ArrowUpRight className="h-4 w-4" />
            },
            {
              id: 'ops-report',
              label: 'Ops Report',
              icon: <ClipboardList className="h-4 w-4" />
            },
          ]}
          defaultTab="received"
          onChange={(tabId) => {
            setLoading(true)
            setActiveTab(tabId)
          }}
        >
          {() => ( // We ignore the render prop argument and use state
            <>
              {/* Header Actions */}
              <div className="flex items-center justify-between gap-6 mb-6">
                <div className="flex items-center gap-3 flex-1">
                  <div className="relative flex-1 min-w-0" /* Remove max-w-sm to let input grow */>
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" strokeWidth={1.5} />
                    <input
                      type="text"
                      placeholder={`Search referrals`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="cursor-pointer w-full pl-10 pr-4 py-2 border border-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-100 bg-white text-sm text-neutral-700 placeholder-neutral-400 transition-colors"
                    />
                  </div>
                  <div className="flex-shrink-0">
                    <Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as ReferralStatus | 'all')}
                      options={[
                        { value: 'all', label: 'All Status' },
                        { value: 'DRAFT', label: 'Draft' },
                        { value: 'SENT', label: 'Sent' },
                        { value: 'ACCEPTED', label: 'Accepted' },
                        { value: 'COMPLETED', label: 'Completed' },
                        { value: 'CANCELLED', label: 'Cancelled' },
                      ]}
                    />
                  </div>
                </div>
                {(activeTab === 'sent' || activeTab === 'ops-report') && (
                  <button
                    onClick={() => setIsNewReferralModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-sm text-white rounded-full hover:bg-emerald-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" strokeWidth={1.5} />
                    New Referral
                  </button>
                )}
              </div>

              {/* Referrals Table - Changes Based on Tab */}
              <Card>
                <CardContent className="p-0">
                  {loading ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-400"></div>
                    </div>
                  ) : referrals.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-neutral-500">
                      <p>No referrals found</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-lg">
                      {activeTab === 'ops-report' ? (
                        // OPS REPORT TABLE
                        <table className="w-full">
                          <thead className="bg-neutral-50">
                            <tr>
                              <th className="px-6 py-4 text-left text-xs font-medium text-neutral-400 tracking-wide">
                                Patient
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-medium text-neutral-400 tracking-wide">
                                Date
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-medium text-neutral-400 tracking-wide">
                                Doctor
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-medium text-neutral-400 tracking-wide">
                                Refer From/To
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-medium text-neutral-400 tracking-wide">
                                Status
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-medium text-neutral-400 tracking-wide">
                                Ops Status
                              </th>
                              <th className="w-16 px-6 py-4 text-right text-xs font-medium text-neutral-400 tracking-wide">
                                
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-black/5">
                            {referrals.map((referral) => (
                              <tr
                                key={referral.id}
                                className="hover:bg-neutral-50 transition-colors cursor-pointer"
                                onClick={() => openOpsModal(referral)}
                              >
                                <td className="px-6 py-4">
                                  <div className="text-sm font-medium text-neutral-800">
                                    {referral.patientName}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm text-neutral-700" suppressHydrationWarning>
                                    {referral.createdAt && formatDate(referral.createdAt)}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm text-neutral-700">
                                    {referral.submittedByName || referral.referringDentist || 'N/A'}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm text-neutral-700">
                                    {referral.fromClinicName || referral.gpClinicName || referral.clinic?.name || 'N/A'}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <Badge variant={getReceivedStatusVariant(getReceivedStatusLabel(referral.status))}>
                                    {getReceivedStatusLabel(referral.status)}
                                  </Badge>
                                </td>
                                <td className="px-6 py-4">
                                  <Badge variant="default">
                                    {getOpsStatusLabel(referral.status)}
                                  </Badge>
                                </td>
                                <td className="w-16 px-6 py-4 text-right">
                                  <button
                                    onClick={() => setSelectedReferral(referral)}
                                    className="text-neutral-400 hover:text-neutral-800"
                                  >
                                    <Eye className="h-4 w-4" strokeWidth={1.5} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : activeTab === 'received' ? (
                        // RECEIVED REFERRALS TABLE
                        <table className="w-full">
                          <thead className="bg-neutral-50">
                            <tr>
                              <th className="px-6 py-4 text-left text-xs font-medium text-neutral-400 tracking-wide">
                                Patient
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-medium text-neutral-400 tracking-wide">
                                From Clinic
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-medium text-neutral-400 tracking-wide">
                                Reason
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-medium text-neutral-400 tracking-wide">
                                Urgency
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-medium text-neutral-400 tracking-wide">
                                Status
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-medium text-neutral-400 tracking-wide">
                                Received
                              </th>
                              <th className="w-48 px-6 py-4 text-right text-xs font-medium text-neutral-400 tracking-wide">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-black/5">
                            {referrals.map((referral) => (
                              <tr
                                key={referral.id}
                                className="hover:bg-neutral-50 cursor-pointer transition-colors"
                                onClick={() => setSelectedReferral(referral)}
                              >
                                <td className="px-6 py-4">
                                  <div className="text-sm font-medium text-neutral-700">
                                    {referral.patientName}
                                  </div>
                                  <div className="text-xs text-neutral-400">
                                    {referral.patientPhone}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm font-medium text-neutral-700">
                                    {referral.fromClinicName || 'Unknown'}
                                  </div>
                                  <div className="text-xs text-neutral-400">
                                    {referral.referringDentist ? `${referral.referringDentist}` : ''}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm text-neutral-400 max-w-xs truncate">
                                    {referral.reason}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <Badge variant={getUrgencyBadgeVariant(referral.urgency)}>
                                    {(referral.urgency || '')
                                      .toUpperCase()}
                                  </Badge>
                                </td>
                                <td className="px-6 py-4">
                                  <Badge variant={getReceivedStatusVariant(getReceivedStatusLabel(referral.status))}>
                                    {getReceivedStatusLabel(referral.status)}
                                  </Badge>
                                </td>
                                <td className="px-6 py-4 text-sm text-neutral-500" suppressHydrationWarning>
                                  {referral.createdAt && formatRelativeTime(referral.createdAt)}
                                </td>
                                <td className="w-48 px-6 py-4 text-right text-sm">
                                  <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                    {/* Always render accept/reject buttons but hide when not needed */}
                                    <div className={`flex gap-2 ${referral.status !== 'SENT' ? 'invisible' : ''}`}>
                                      <button
                                        onClick={() => handleStatusUpdate(referral.id, 'ACCEPTED')}
                                        className="flex items-center gap-2 px-2 py-2 text-sm bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors"
                                      >
                                        <CheckIcon className="h-4 w-4" strokeWidth={1.5} />
                                      </button>
                                      <button
                                        onClick={() => handleStatusUpdate(referral.id, 'REJECTED')}
                                        className="flex items-center gap-2 px-2 py-2 text-sm bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors"
                                      >
                                        <X className="h-4 w-4" strokeWidth={1.5} />
                                      </button>
                                    </div>
                                    <button
                                      onClick={() => setSelectedReferral(referral)}
                                      className="p-2 text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 rounded-lg transition-colors"
                                    >
                                      <Eye className="h-4 w-4" strokeWidth={1.5} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        // SENT REFERRALS TABLE
                        <table className="w-full">
                          <thead className="bg-neutral-50">
                            <tr>
                              <th className="px-6 py-4 text-left text-xs font-medium text-neutral-400 tracking-wide">
                                Patient
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-medium text-neutral-400 tracking-wide">
                                To Specialist
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-medium text-neutral-400 tracking-wide">
                                Reason
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-medium text-neutral-400 tracking-wide">
                                Urgency
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-medium text-neutral-400 tracking-wide">
                                Status
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-medium text-neutral-400 tracking-wide">
                                Sent
                              </th>
                              <th className="w-48 px-6 py-4 text-right text-xs font-medium text-neutral-400 tracking-wide">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-black/5">
                            {referrals.map((referral) => (
                              <tr key={referral.id} className="hover:bg-neutral-50 transition-colors">
                                <td className="px-6 py-4">
                                  <div className="text-sm font-medium text-neutral-800">
                                    {referral.patientName}
                                  </div>
                                  <div className="text-xs text-neutral-500">
                                    {referral.patientPhone}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm font-medium text-neutral-800">
                                    {referral.contact ? referral.contact.name : 'N/A'}
                                  </div>
                                  <div className="text-xs text-neutral-500">
                                    {referral.contact ? referral.contact.specialty : ''}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm text-neutral-700 max-w-xs truncate">
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
                                  {referral.createdAt && formatRelativeTime(referral.createdAt)}
                                </td>
                                <td className="w-48 px-6 py-4 text-right text-sm">
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      onClick={() => setSelectedReferral(referral)}
                                      className="p-2 text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 rounded-lg transition-colors"
                                    >
                                      <Eye className="h-4 w-4" strokeWidth={1.5} />
                                    </button>
                                    {/* Always render edit/trash buttons but hide when not needed */}
                                    <div className={`flex gap-2 ${referral.status !== 'DRAFT' ? 'invisible' : ''}`}>
                                      <button className="p-2 text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 rounded-lg transition-colors">
                                        <Edit className="h-4 w-4" strokeWidth={1.5} />
                                      </button>
                                      <button className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                        <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                                      </button>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </Tabs>

        {/* Details Modal */}
        <ReferralDetailsModal
          isOpen={!!selectedReferral}
          onClose={() => setSelectedReferral(null)}
          referral={selectedReferral}
          onStatusUpdate={() => {
            fetchReferrals()
            // Refresh the selected referral if modal is still open
            if (selectedReferral) {
              referralsService.getById(selectedReferral.id).then(setSelectedReferral).catch(console.error)
            }
          }}
        />

        {/* New Referral Modal */}
        <NewReferralModal
          isOpen={isNewReferralModalOpen}
          onClose={() => setIsNewReferralModalOpen(false)}
          onSuccess={() => {
            fetchReferrals()
            setIsNewReferralModalOpen(false)
          }}
        />

        <Modal
          isOpen={isOpsModalOpen}
          onClose={closeOpsModal}
          title="Ops Report"
          size="xl"
        >
          {opsReferral && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-xs text-neutral-400">Patient Name</div>
                  <div className="text-sm text-neutral-800 mt-1">{opsReferral.patientName}</div>
                </div>
                <div>
                  <div className="text-xs text-neutral-400">Patient Phone</div>
                  <div className="text-sm text-neutral-800 mt-1">{opsReferral.patientPhone || '—'}</div>
                </div>
                <div>
                  <div className="text-xs text-neutral-400">Patient Email</div>
                  <div className="text-sm text-neutral-800 mt-1">{opsReferral.patientEmail || '—'}</div>
                </div>
                <div>
                  <div className="text-xs text-neutral-400">Date of Birth</div>
                  <div className="text-sm text-neutral-800 mt-1" suppressHydrationWarning>
                    {opsReferral.patientDob ? formatDate(opsReferral.patientDob) : '—'}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold text-neutral-800 mb-2">Comments</div>
                <textarea
                  value={opsComment}
                  onChange={(e) => setOpsComment(e.target.value)}
                  placeholder="Add comments for ops report..."
                  className="w-full min-h-[120px] rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <div className="text-sm font-semibold text-neutral-800 mb-2">Documents</div>
                <FileUpload files={opsFiles} onFilesChange={setOpsFiles} />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={closeOpsModal}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleSendOps} isLoading={isSendingOps}>
                  Send Ops
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  )
}

