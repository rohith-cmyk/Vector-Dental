import { useEffect, useMemo, useState } from 'react'
import { Modal } from '@/components/ui'
import { referralService } from '@/services/api'
import type { Referral } from '@/types'
import { Check } from 'lucide-react'
import { clsx } from 'clsx'

interface ReferralDetailModalProps {
  isOpen: boolean
  referralId: string | null
  initialReferral?: Referral | null
  onClose: () => void
}

type TimelineStage = {
  key: string
  label: string
  status: Referral['status']
  isCompleted: boolean
  isCurrent: boolean
  isPending: boolean
  dateLabel?: string
}

const STATUS_ORDER: Referral['status'][] = ['SUBMITTED', 'ACCEPTED', 'SENT', 'COMPLETED']
const STATUS_LABELS: Record<Referral['status'], string> = {
  SUBMITTED: 'Referral Accepted',
  ACCEPTED: 'Appointment Scheduled',
  SENT: 'Appointment Completed',
  COMPLETED: 'Post Op Treatment Scheduled',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
  DRAFT: 'Draft',
}

const buildTimelineStages = (
  status: Referral['status'],
  stageDates: Partial<Record<Referral['status'], string>>
): TimelineStage[] => {
  const currentIndex = STATUS_ORDER.indexOf(status)
  return STATUS_ORDER.map((stepStatus, index) => {
    if (currentIndex === -1) {
      return {
        key: stepStatus,
        label: STATUS_LABELS[stepStatus],
        status: stepStatus,
        isCompleted: false,
        isCurrent: false,
        isPending: true,
        dateLabel: stageDates[stepStatus],
      }
    }
    if (stepStatus === 'SUBMITTED') {
      return {
        key: stepStatus,
        label: STATUS_LABELS[stepStatus],
        status: stepStatus,
        isCompleted: true,
        isCurrent: false,
        isPending: false,
        dateLabel: stageDates[stepStatus],
      }
    }
    if (index < currentIndex) {
      return {
        key: stepStatus,
        label: STATUS_LABELS[stepStatus],
        status: stepStatus,
        isCompleted: true,
        isCurrent: false,
        isPending: false,
        dateLabel: stageDates[stepStatus],
      }
    }
    if (index === currentIndex) {
      return {
        key: stepStatus,
        label: STATUS_LABELS[stepStatus],
        status: stepStatus,
        isCompleted: true,
        isCurrent: true,
        isPending: false,
        dateLabel: stageDates[stepStatus],
      }
    }
    return {
      key: stepStatus,
      label: STATUS_LABELS[stepStatus],
      status: stepStatus,
      isCompleted: false,
      isCurrent: false,
      isPending: true,
      dateLabel: stageDates[stepStatus],
    }
  })
}

const formatDate = (date?: string | null) => {
  if (!date) return '—'
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return '—'
  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const formatDateTime = (date?: string | null) => {
  if (!date) return '—'
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return '—'
  return parsed.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

const resolveFileUrl = (fileUrl?: string) => {
  if (!fileUrl) return ''
  if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
    return fileUrl
  }
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/gd'
  const serverBaseUrl = apiBaseUrl.replace(/\/api\/gd\/?$/, '')
  return fileUrl.startsWith('/') ? `${serverBaseUrl}${fileUrl}` : fileUrl
}

const isImageFile = (fileName?: string, fileUrl?: string) => {
  const candidate = (fileName || fileUrl || '').toLowerCase()
  return /\.(png|jpe?g|gif|webp|bmp)$/i.test(candidate)
}

export function ReferralDetailModal({ isOpen, referralId, initialReferral, onClose }: ReferralDetailModalProps) {
  const [referral, setReferral] = useState<Referral | null>(initialReferral || null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    if (!isOpen || !referralId) return
    let isMounted = true

    const loadReferral = async () => {
      try {
        setIsLoading(true)
        setLoadError('')
        const response = await referralService.getReferralById(referralId)
        if (isMounted) {
          setReferral(response.data)
        }
      } catch (error) {
        if (isMounted) {
          setReferral(null)
          setLoadError('Referral details unavailable.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadReferral()
    return () => {
      isMounted = false
    }
  }, [isOpen, referralId])

  useEffect(() => {
    if (isOpen && initialReferral) {
      setReferral(initialReferral)
    }
  }, [isOpen, initialReferral])

  const patientName = useMemo(() => {
    if (!referral) return '—'
    if (referral.patientName) return referral.patientName
    const parts = [referral.patientFirstName, referral.patientLastName].filter(Boolean)
    return parts.length ? parts.join(' ') : '—'
  }, [referral])

  const stages = useMemo(() => {
    if (!referral) return []
    const stageDates: Partial<Record<Referral['status'], string>> = {
      SUBMITTED: formatDateTime(referral.acceptedAt || referral.createdAt),
      ACCEPTED: formatDateTime(referral.scheduledAt),
      SENT: formatDateTime(referral.completedAt),
      COMPLETED: formatDateTime(referral.postOpScheduledAt),
    }
    return buildTimelineStages(referral.status, stageDates)
  }, [referral])

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="space-y-6 p-6">
        {loadError && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {loadError}
          </div>
        )}
        <div>
          <h2 className="text-2xl font-semibold text-neutral-800">Update Status</h2>
          <p className="text-sm text-neutral-500 mt-1">Progress through referral stages</p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-neutral-800">Patient Information</h3>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-xs text-neutral-400">Patient Name</div>
              <div className="text-sm font-semibold text-neutral-800">{patientName}</div>
            </div>
            <div>
              <div className="text-xs text-neutral-400">Date of Birth</div>
              <div className="text-sm font-semibold text-neutral-800">{formatDate(referral?.patientDob)}</div>
            </div>
            <div>
              <div className="text-xs text-neutral-400">Reason for Treatment</div>
              <div className="text-sm text-neutral-700">{referral?.reason || '—'}</div>
            </div>
            <div>
              <div className="text-xs text-neutral-400">Referral Submitted On</div>
              <div className="text-sm text-neutral-700">{formatDate(referral?.createdAt)}</div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-neutral-800">Status Timeline</h3>
          <div className="mt-6 relative">
            <div className="absolute left-5 top-2 bottom-2 w-px bg-neutral-200" />
            <div className="space-y-6">
              {stages.map((stage) => (
                <div key={stage.key} className="relative flex items-start gap-4">
                <div
                  className={clsx(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2',
                    stage.isCompleted
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : stage.isCurrent
                      ? 'border-emerald-500 bg-white text-emerald-500'
                      : 'border-neutral-200 bg-white text-neutral-300'
                  )}
                >
                  {stage.isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span
                      className={clsx(
                        'h-2 w-2 rounded-full',
                        stage.isCurrent ? 'bg-emerald-500' : 'bg-current'
                      )}
                    />
                  )}
                </div>
                <div className="pt-1">
                  <div className={clsx('text-sm font-semibold', stage.isPending ? 'text-neutral-400' : 'text-neutral-700')}>
                    {stage.label}
                    {stage.dateLabel && (stage.isCompleted || stage.isCurrent) && (
                      <span className="ml-2 text-sm font-medium text-neutral-400">({stage.dateLabel})</span>
                    )}
                  </div>
                  {stage.status === 'SENT' && referral?.operativeReports?.length ? (
                    <div className="mt-2 space-y-3">
                      {referral.operativeReports.flatMap((report) =>
                        (report.files || []).map((file) => {
                          const fileHref = resolveFileUrl(file.fileUrl)
                          const showPreview = isImageFile(file.fileName, file.fileUrl)
                          return (
                            <a
                              key={file.id}
                              href={fileHref}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-3 text-sm text-emerald-600 hover:text-emerald-700"
                            >
                              {showPreview ? (
                                <img
                                  src={fileHref}
                                  alt={file.fileName}
                                  className="w-[100px] h-[100px] rounded-md object-cover border border-emerald-100"
                                />
                              ) : null}
                              <span className="truncate">{file.fileName}</span>
                            </a>
                          )
                        })
                      )}
                    </div>
                  ) : null}
                </div>
              </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-neutral-800">Post Op Review</h3>
          <p className="text-sm text-neutral-500 mt-1">Comments and attachments</p>
          <div className="mt-4 space-y-3 text-sm text-neutral-600">
            {referral?.operativeReports?.length ? (
              referral.operativeReports.map((report) => (
                <div key={report.id} className="rounded-xl border border-neutral-100 p-4">
                  <div className="text-sm font-semibold text-neutral-800">
                    {report.createdBy?.name || 'Specialist'} • {formatDate(report.createdAt)}
                  </div>
                  <div className="mt-2 text-sm text-neutral-600">
                    {report.comment || 'No comments added yet.'}
                  </div>
                  {(report.files || []).length > 0 ? (
                    <div className="mt-3 space-y-3">
                      {(report.files || []).map((file) => {
                        const fileHref = resolveFileUrl(file.fileUrl)
                        const showPreview = isImageFile(file.fileName, file.fileUrl)
                        return (
                          <a
                            key={file.id}
                            href={fileHref}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-3 text-sm text-emerald-600 hover:text-emerald-700"
                          >
                            {showPreview ? (
                              <img
                                src={fileHref}
                                alt={file.fileName}
                                className="w-[100px] h-[100px] rounded-md object-cover border border-emerald-100"
                              />
                            ) : null}
                            <span className="truncate">{file.fileName}</span>
                          </a>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-neutral-400 mt-2">No documents attached.</div>
                  )}
                </div>
              ))
            ) : (
              <div>No comments added yet.</div>
            )}
          </div>
        </div>

        {isLoading && (
          <div className="text-sm text-neutral-400">Refreshing referral details...</div>
        )}
      </div>
    </Modal>
  )
}
