import { useEffect, useState } from 'react'
import { formatDate, cn } from '@/lib/utils'
import { Modal, Badge } from '@/components/ui'
import { FileText, Download, Phone, Mail, Calendar, CalendarCheck, Loader2, ExternalLink, CheckCircle, Check, CheckCircle2, MapPin } from 'lucide-react'
import type { Referral, ReferralStatus } from '@/types'
import { API_URL } from '@/lib/api'
import { InteractiveToothChart } from './InteractiveToothChart'
import { notificationsService } from '@/services/notifications.service'
import { referralsService } from '@/services/referrals.service'

interface ReferralDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    referral: Referral | null
    onStatusUpdate?: () => void
}

export function ReferralDetailsModal({ isOpen, onClose, referral, onStatusUpdate }: ReferralDetailsModalProps) {
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
    const [statusUpdateSuccess, setStatusUpdateSuccess] = useState(false)
    const [currentReferral, setCurrentReferral] = useState<Referral | null>(referral)

    // Update current referral when referral prop changes
    useEffect(() => {
        setCurrentReferral(referral)
    }, [referral])

    // Clear associated notifications when viewing referral
    useEffect(() => {
        if (isOpen && referral?.id) {
            notificationsService.deleteByReferral(referral.id)
        }
        // Reset share state when modal opens/closes
        setStatusUpdateSuccess(false)
    }, [isOpen, referral?.id])

    if (!referral || !currentReferral) return null

    const handleStatusUpdate = async (newStatus: ReferralStatus) => {
        if (!referral || !referral.id || isUpdatingStatus) return

        try {
            setIsUpdatingStatus(true)
            setStatusUpdateSuccess(false)
            const updatedReferral = await referralsService.updateStatus(referral.id, newStatus)
            // Update the local state with the returned referral data
            setCurrentReferral(updatedReferral)
            setStatusUpdateSuccess(true)
            setTimeout(() => setStatusUpdateSuccess(false), 2000)
            // Notify parent to refresh the referrals list
            onStatusUpdate?.()
        } catch (error: any) {
            console.error('Failed to update referral status:', error)
            alert(error.response?.data?.message || 'Failed to update status. Please try again.')
        } finally {
            setIsUpdatingStatus(false)
        }
    }

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'success'
            case 'SENT': return 'info'
            case 'ACCEPTED': return 'warning'
            case 'CANCELLED': return 'danger'
            case 'SUBMITTED': return 'info'
            default: return 'default'
        }
    }

    const getUrgencyVariant = (urgency: string) => {
        switch (urgency) {
            case 'EMERGENCY': return 'danger'
            case 'URGENT': return 'warning'
            default: return 'default'
        }
    }

    // Status progression mapping
    const STATUS_ORDER: ReferralStatus[] = ['SUBMITTED', 'ACCEPTED', 'SENT', 'COMPLETED']
    const STATUS_LABELS: Record<ReferralStatus, string> = {
        SUBMITTED: 'Reviewed',
        REJECTED: 'Rejected',
        ACCEPTED: 'Appointment Scheduled',
        SENT: 'Patient Attended',
        COMPLETED: 'Completed',
        CANCELLED: 'Cancelled',
        DRAFT: 'Draft',
    }

    // Determine timeline state
    const getStatusState = (status: ReferralStatus) => {
        const currentStatus = displayReferral.status
        const currentIndex = STATUS_ORDER.indexOf(currentStatus)
        const statusIndex = STATUS_ORDER.indexOf(status)

        if (statusIndex === -1) {
            // Status not in progression (like CANCELLED)
            return { isCompleted: false, isCurrent: false, isPending: true }
        }

        // If current status is SUBMITTED, "Reviewed" (SUBMITTED) is current
        // If current status is ACCEPTED, "Reviewed" (SUBMITTED) is completed, "Appointment Scheduled" (ACCEPTED) is current
        // And so on...
        if (statusIndex < currentIndex) {
            return { isCompleted: true, isCurrent: false, isPending: false }
        } else if (statusIndex === currentIndex) {
            if (currentStatus === 'COMPLETED') {
                return { isCompleted: true, isCurrent: false, isPending: false }
            }
            return { isCompleted: false, isCurrent: true, isPending: false }
        } else {
            return { isCompleted: false, isCurrent: false, isPending: true }
        }
    }

    // Get next status in progression
    const getNextStatus = (currentStatus: ReferralStatus): ReferralStatus | null => {
        const currentIndex = STATUS_ORDER.indexOf(currentStatus)
        if (currentIndex === -1 || currentIndex >= STATUS_ORDER.length - 1) {
            return null
        }
        return STATUS_ORDER[currentIndex + 1]
    }

    const getAppointmentDisplay = () => {
        const appointmentDate = new Date()
        appointmentDate.setDate(appointmentDate.getDate() + 1)
        appointmentDate.setHours(10, 0, 0, 0)
        return appointmentDate.toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        })
    }

    // Use currentReferral for display (updated when status changes)
    const displayReferral = currentReferral

    const STATUS_RANK: Record<ReferralStatus, number> = {
        SUBMITTED: 0,
        PENDING_REVIEW: 0,
        ACCEPTED: 1,
        SENT: 1,
        COMPLETED: 2,
        REJECTED: -1,
        CANCELLED: -1,
        DRAFT: -1,
    }

    const statusSteps = [
        { label: 'Received', icon: Mail },
        { label: 'Scheduled', icon: CalendarCheck },
        { label: 'Completed', icon: CheckCircle2 },
    ]
    const currentStepIndex = STATUS_RANK[displayReferral.status] ?? 0

    // Get patient name - use new fields if available, otherwise fall back to patientName
    const patientName = displayReferral.patientFirstName && displayReferral.patientLastName
        ? `${displayReferral.patientFirstName} ${displayReferral.patientLastName}`
        : displayReferral.patientName

    // Get clinic name and doctor - use new fields if available
    const clinicName = displayReferral.gpClinicName || displayReferral.fromClinicName || 'Unknown Clinic'
    const doctorName = displayReferral.submittedByName || displayReferral.referringDentist
    const preferredDoctor = displayReferral.contact?.name || 'Any (First Available)'
    const clinicInfo = displayReferral.clinic

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title=""
            size="xl"
        >
            <div className="space-y-8">
                {/* Sticky Status */}
                <div className="sticky top-0 z-10 -mx-6 px-6 pt-2 pb-4 bg-white border-b border-neutral-200">
                    <div className="flex items-center justify-center gap-3 text-sm text-neutral-400">
                        {statusSteps.map((step, index) => {
                            const isCompleted = currentStepIndex > index
                              || (currentStepIndex === index && displayReferral.status === 'COMPLETED')
                            const isCurrent = currentStepIndex === index && !isCompleted
                            const Icon = step.icon
                            return (
                                <div key={step.label} className="flex items-center gap-3">
                                    <div
                                        className={cn(
                                            'flex items-center gap-2 text-xs uppercase tracking-wide',
                                            isCompleted && 'text-emerald-600',
                                            isCurrent && 'text-neutral-700',
                                            !isCompleted && !isCurrent && 'text-neutral-400'
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                'h-6 w-6 rounded-full flex items-center justify-center border',
                                                isCompleted
                                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                                                    : isCurrent
                                                    ? 'bg-neutral-100 border-neutral-200 text-neutral-700'
                                                    : 'bg-neutral-50 border-neutral-200 text-neutral-400'
                                            )}
                                        >
                                            <Icon className="h-3.5 w-3.5" />
                                        </span>
                                        <span
                                            className={cn(
                                                'h-2.5 w-2.5 rounded-full',
                                                isCompleted ? 'bg-emerald-500' : isCurrent ? 'bg-neutral-700' : 'bg-neutral-300'
                                            )}
                                        />
                                        {step.label}
                                    </div>
                                    {index < statusSteps.length - 1 && <span className="text-neutral-300">→</span>}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Clinic Header */}
                <div className="flex items-start justify-between gap-6">
                    <div className="flex items-start gap-4">
                        {clinicInfo?.logoUrl ? (
                            <div className="h-14 w-14 rounded-xl border border-neutral-200 bg-white flex items-center justify-center overflow-hidden">
                                <img src={clinicInfo.logoUrl} alt={`${clinicInfo.name} logo`} className="h-full w-full object-contain" />
                            </div>
                        ) : null}
                        <div className="space-y-2">
                            <div className="text-xl font-semibold text-neutral-800">{clinicInfo?.name || 'Clinic'}</div>
                            {clinicInfo?.address && (
                                <div className="flex items-center gap-2 text-sm text-neutral-500">
                                    <MapPin className="h-4 w-4" />
                                    <span>{clinicInfo.address}</span>
                                </div>
                            )}
                            {clinicInfo?.phone && (
                                <div className="flex items-center gap-2 text-sm text-neutral-500">
                                    <Phone className="h-4 w-4" />
                                    <span>{clinicInfo.phone}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="text-sm text-neutral-500">
                        {formatDate(displayReferral.createdAt)}
                    </div>
                </div>

                {/* Referred From / Preferred Doctor */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide border-b border-neutral-200 pb-2">
                            Referred From
                        </div>
                        <div className="pt-3 text-sm text-neutral-700 space-y-2">
                            <div className="font-medium">{doctorName || 'Unknown Doctor'}</div>
                            <div className="text-neutral-500">{clinicName}</div>
                        </div>
                    </div>
                    <div>
                        <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide border-b border-neutral-200 pb-2">
                            Preferred Doctor
                        </div>
                        <div className="pt-3 text-sm text-neutral-700">{preferredDoctor}</div>
                    </div>
                </div>

                {/* Patient Information */}
                <div>
                    <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide border-b border-neutral-200 pb-2">
                        Patient Information
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 text-sm">
                        <div>
                            <div className="text-xs text-neutral-400">Name</div>
                            <div className="text-neutral-700 mt-1">{patientName}</div>
                        </div>
                        <div>
                            <div className="text-xs text-neutral-400">Phone</div>
                            <div className="text-neutral-700 mt-1">{displayReferral.patientPhone || '—'}</div>
                        </div>
                        <div>
                            <div className="text-xs text-neutral-400">Email</div>
                            <div className="text-neutral-700 mt-1">{displayReferral.patientEmail || '—'}</div>
                        </div>
                        <div>
                            <div className="text-xs text-neutral-400">Date of Birth</div>
                            <div className="text-neutral-700 mt-1 flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-neutral-400" />
                                <span suppressHydrationWarning>{formatDate(displayReferral.patientDob)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reason / Teeth */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide border-b border-neutral-200 pb-2">
                            Reason for Referral
                        </div>
                        <div className="pt-3 text-sm text-neutral-600 whitespace-pre-wrap leading-relaxed">
                            {displayReferral.reason || '—'}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide border-b border-neutral-200 pb-2">
                            Teeth
                        </div>
                        <div className="pt-3">
                            {displayReferral.selectedTeeth && displayReferral.selectedTeeth.length > 0 ? (
                                <div className="bg-white rounded-lg p-4 border border-neutral-200">
                                    <div className="scale-90 origin-top">
                                        <InteractiveToothChart
                                            selectedTeeth={displayReferral.selectedTeeth}
                                            onTeethChange={() => { }}
                                            readOnly={true}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="text-sm text-neutral-400">No teeth selected</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Comment */}
                <div>
                    <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide border-b border-neutral-200 pb-2">
                        Comment
                    </div>
                    <div className="pt-3 text-sm text-neutral-600 whitespace-pre-wrap leading-relaxed">
                        {displayReferral.notes || '—'}
                    </div>
                </div>

                {/* Status Update Card */}
                <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-neutral-700">Update Status</h3>
                        {statusUpdateSuccess && (
                            <div className="flex items-center gap-2 text-emerald-600 text-sm bg-black/5 px-3 py-1 rounded-lg">
                                <CheckCircle className="h-4 w-4" />
                                Status updated!
                            </div>
                        )}
                    </div>
                    <div className="space-y-5">
                        <p className="text-sm text-neutral-500">Progress through referral stages</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {STATUS_ORDER.map((status) => {
                                const state = getStatusState(status)
                                // Allow clicking completed steps (to go back) or current step (to advance)
                                const canClick = !isUpdatingStatus && (state.isCompleted || state.isCurrent)

                                return (
                                    <button
                                        key={status}
                                        type="button"
                                        onClick={() => {
                                            if (canClick) {
                                                if (state.isCompleted) {
                                                    // Clicking a completed step - go back to that status
                                                    handleStatusUpdate(status)
                                                } else if (state.isCurrent) {
                                                    // Clicking the current step - advance to next status
                                                    const nextStatus = getNextStatus(displayReferral.status)
                                                    if (nextStatus) {
                                                        handleStatusUpdate(nextStatus)
                                                    } else {
                                                        // Already at last step - just ensure it's marked as completed
                                                        handleStatusUpdate(status)
                                                    }
                                                }
                                            }
                                        }}
                                        disabled={!canClick}
                                        className={cn(
                                            'relative p-4 text-sm rounded-lg border transition-all flex flex-col items-center gap-2 min-h-[70px] justify-center',
                                            state.isCompleted
                                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                                : state.isCurrent
                                                ? 'bg-white border-neutral-200 text-neutral-700'
                                                : 'bg-white border-neutral-200 text-neutral-500 hover:border-neutral-300',
                                            !canClick && 'opacity-50 cursor-not-allowed',
                                            canClick && 'hover:bg-neutral-50 cursor-pointer'
                                        )}
                                    >
                                        {state.isCompleted && (
                                            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                                                <Check className="h-3 w-3 text-white" />
                                            </div>
                                        )}
                                        {state.isCurrent && !state.isCompleted && (
                                            <div className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-emerald-500"></div>
                                        )}
                                        {!state.isCompleted && !state.isCurrent && (
                                            <div className="flex-shrink-0 w-5 h-5 rounded-full border border-neutral-300 bg-white"></div>
                                        )}
                                        <span className="text-center leading-tight text-xs">{STATUS_LABELS[status]}</span>
                                    </button>
                                )
                            })}
                        </div>
                        {/* Cancelled option (separate from progression) */}
                        {displayReferral.status !== 'CANCELLED' && (
                            <div className="pt-4 border-t border-neutral-200">
                                <button
                                    type="button"
                                    onClick={() => !isUpdatingStatus && handleStatusUpdate('CANCELLED')}
                                    disabled={isUpdatingStatus}
                                    className="w-full px-4 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                >
                                    {STATUS_LABELS.CANCELLED}
                                </button>
                            </div>
                        )}
                        {isUpdatingStatus && (
                            <div className="flex items-center justify-center gap-2 text-neutral-500 bg-black/5 px-4 py-2 rounded-lg">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="text-sm">Updating status...</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Attached Files Card */}
                <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <h3 className="text-lg font-semibold text-neutral-700">
                            Attached Files ({displayReferral.files?.length || 0})
                        </h3>
                    </div>
                    {displayReferral.files && displayReferral.files.length > 0 ? (
                        <div className="space-y-4">
                            {displayReferral.files.map((file) => {
                                // Handle local development URLs
                                const fileUrl = file.fileUrl.startsWith('/')
                                    ? `${API_URL.replace('/api', '')}${file.fileUrl}`
                                    : file.fileUrl

                                return (
                                    <a
                                        key={file.id}
                                        href={fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between p-5 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 hover:border-neutral-300 transition-all"
                                    >
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <div className="flex-shrink-0 p-3 bg-neutral-50 rounded-lg">
                                                <FileText className="h-5 w-5 text-neutral-500" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-neutral-700 truncate">
                                                    {file.fileName}
                                                </p>
                                                <p className="text-xs text-neutral-500 mt-2">
                                                    {(file.fileSize / 1024).toFixed(1)} KB
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex-shrink-0 ml-4">
                                            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors">
                                                <Download className="h-4 w-4" />
                                                Download
                                            </button>
                                        </div>
                                    </a>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-sm text-neutral-500">No files attached to this referral</p>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="flex justify-between items-center pt-6 border-t border-neutral-200">
                    <div className="flex gap-3">
                        {displayReferral.statusToken && (
                            <button
                                onClick={() => {
                                    window.open(`/referral-status/${displayReferral.statusToken}`, '_blank')
                                }}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-700 bg-white rounded-lg hover:bg-neutral-50 transition-colors border border-neutral-200"
                            >
                                <ExternalLink className="h-4 w-4" />
                                View Status Page
                            </button>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    )
}
