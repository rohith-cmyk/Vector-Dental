'use client'

import { useMemo, useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout'
import { Button, Card, CardContent, Badge, LoadingState } from '@/components/ui'
import { referralsService } from '@/services/referrals.service'
import { getCachedData, setCachedData } from '@/lib/cache'
import { formatPhoneNumber } from '@/lib/utils'
import type { Referral } from '@/types'

type ClinicGroup = {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  referrals: Referral[]
  total: number
  lastReferralAt?: string
}

export default function ContactsPage() {
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [loading, setLoading] = useState(true)
  const cacheKey = 'received_referrals_for_network'
  const cacheTtl = 2 * 60 * 1000

  // Load incoming referrals from API
  useEffect(() => {
    const cached = getCachedData<Referral[]>(cacheKey)
    if (cached) {
      setReferrals(cached)
      setLoading(false)
      loadReferrals(false)
      return
    }

    loadReferrals(true)
  }, [])

  const loadReferrals = async (showLoading: boolean = true) => {
    try {
      if (showLoading) {
        setLoading(true)
      }

      const response = await referralsService.getAll({ limit: 200, type: 'received' })
      setReferrals(response.data || [])
      setCachedData(cacheKey, response.data || [], cacheTtl)
    } catch (error: any) {
      console.error('Failed to load referrals:', error)
      console.error('Error details:', error.response?.data || error.message)
      setReferrals([])
      alert(`Failed to load referrals: ${error.response?.data?.message || error.message || 'Unknown error'}`)
    } finally {
      if (showLoading) {
        setLoading(false)
      }
    }
  }

  const clinicGroups = useMemo(() => {
    const groups = new Map<string, ClinicGroup>()
    referrals.forEach((referral) => {
      const name =
        referral.gpClinicName ||
        referral.fromClinicName ||
        referral.clinic?.name ||
        'Unknown Clinic'
      const email = referral.fromClinicEmail || referral.clinic?.email
      const phone = referral.fromClinicPhone || referral.clinic?.phone
      const address = referral.clinic?.address
      const key = `${name.toLowerCase()}|${email || ''}|${phone || ''}`
      const existing = groups.get(key)
      const createdAt = referral.createdAt

      if (!existing) {
        groups.set(key, {
          id: key,
          name,
          email,
          phone,
          address,
          referrals: [referral],
          total: 1,
          lastReferralAt: createdAt,
        })
      } else {
        existing.referrals.push(referral)
        existing.total += 1
        if (!existing.lastReferralAt || new Date(createdAt) > new Date(existing.lastReferralAt)) {
          existing.lastReferralAt = createdAt
        }
      }
    })

    return Array.from(groups.values()).sort((a, b) => b.total - a.total)
  }, [referrals])

  const filteredClinics = clinicGroups

  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null)
  const selectedClinic = filteredClinics.find((clinic) => clinic.id === selectedClinicId) || filteredClinics[0]

  useEffect(() => {
    if (!selectedClinicId && filteredClinics.length > 0) {
      setSelectedClinicId(filteredClinics[0].id)
    }
  }, [filteredClinics, selectedClinicId])

  return (
    <DashboardLayout title="Doctors Network">
      <div className="space-y-6">
        <div className="flex items-center justify-end">
          <Button variant="outline" onClick={() => loadReferrals(true)}>
            Refresh
          </Button>
        </div>

        {loading ? (
          <LoadingState title="Loading referrals..." />
        ) : filteredClinics.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-neutral-500">
              No inbound referral clinics found yet.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardContent className="p-0">
                <div className="divide-y divide-neutral-200">
                  {filteredClinics.map((clinic) => {
                    const isSelected = clinic.id === selectedClinicId
                    return (
                      <button
                        key={clinic.id}
                        onClick={() => setSelectedClinicId(clinic.id)}
                        className={`w-full text-left px-4 py-4 hover:bg-neutral-50 transition-colors border-l-4 ${
                          isSelected ? 'bg-emerald-50/60 border-emerald-500' : 'border-transparent'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-semibold text-neutral-900">{clinic.name}</div>
                            <div className="text-xs text-neutral-400 mt-1">
                              {clinic.email || 'No email'}
                            </div>
                          </div>
                          <Badge variant="default">{clinic.total}</Badge>
                        </div>
                        {clinic.phone && (
                          <div className="text-xs text-neutral-400 mt-2">
                            {formatPhoneNumber(clinic.phone)}
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardContent className="p-6 space-y-6">
                {selectedClinic ? (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-neutral-900">{selectedClinic.name}</h2>
                        <Badge variant="success">{selectedClinic.total} referrals</Badge>
                      </div>
                      <div className="text-sm text-neutral-500 space-y-1">
                        {selectedClinic.email && <div>Email: {selectedClinic.email}</div>}
                        {selectedClinic.phone && (
                          <div>Phone: {formatPhoneNumber(selectedClinic.phone)}</div>
                        )}
                        {selectedClinic.address && <div>Address: {selectedClinic.address}</div>}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-neutral-800 mb-3">Recent Referrals</h3>
                      <div className="space-y-3">
                        {selectedClinic.referrals.slice(0, 6).map((referral) => (
                          <div
                            key={referral.id}
                            className="flex items-center justify-between rounded-lg border border-neutral-100 px-4 py-3"
                          >
                            <div>
                              <div className="text-sm font-medium text-neutral-900">
                                {referral.patientName}
                              </div>
                              <div className="text-xs text-neutral-400 mt-1">
                                {new Date(referral.createdAt).toLocaleDateString()} • {referral.reason}
                              </div>
                            </div>
                            <Badge variant="default">{referral.status}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-neutral-500">Select a clinic to see details.</div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

