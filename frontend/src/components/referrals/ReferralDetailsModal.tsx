import { useEffect, useState } from 'react'
import type { ComponentType } from 'react'
import { useRouter } from 'next/navigation'
import { formatDate, cn } from '@/lib/utils'
import { Modal, Badge, Button, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { FileText, Download, Phone, Mail, Calendar, User, Building2, Share2, Loader2, ExternalLink, CheckCircle, Check, Copy } from 'lucide-react'
import type { Referral, ReferralFile, ReferralStatus } from '@/types'
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
    const router = useRouter()
    const [isSharing, setIsSharing] = useState(false)
    const [shareSuccess, setShareSuccess] = useState(false)
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
    const [statusUpdateSuccess, setStatusUpdateSuccess] = useState(false)
    const [currentReferral, setCurrentReferral] = useState<Referral | null>(referral)
    const [copiedField, setCopiedField] = useState<string | null>(null)

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
        setShareSuccess(false)
        setStatusUpdateSuccess(false)
    }, [isOpen, referral?.id])

    if (!referral || !currentReferral) return null

    const handleShareReferral = async () => {
        if (!referral) return

        try {
            setIsSharing(true)
            const result = await referralsService.shareReferral(referral.id)
            setShareSuccess(true)

            // If mailto link is provided, open email client
            if (result.mailtoLink) {
                window.location.href = result.mailtoLink
            } else {
                // Copy share URL to clipboard
                await navigator.clipboard.writeText(result.shareUrl)
                alert('Share link copied to clipboard!')
            }
        } catch (error: any) {
            console.error('Failed to share referral:', error)
            alert(error.response?.data?.message || 'Failed to share referral. Please try again.')
        } finally {
            setIsSharing(false)
        }
    }

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

    // Use currentReferral for display (updated when status changes)
    const displayReferral = currentReferral

    // Get patient name - use new fields if available, otherwise fall back to patientName
    const patientName = displayReferral.patientFirstName && displayReferral.patientLastName
        ? `${displayReferral.patientFirstName} ${displayReferral.patientLastName}`
        : displayReferral.patientName

    // Get clinic name and doctor - use new fields if available
    const clinicName = displayReferral.gpClinicName || displayReferral.fromClinicName || 'Unknown Clinic'
    const doctorName = displayReferral.submittedByName || displayReferral.referringDentist

    const handleCopy = async (value: string | undefined | null, field: string) => {
        if (!value) return
        try {
            await navigator.clipboard.writeText(value)
            setCopiedField(field)
            setTimeout(() => setCopiedField((current) => (current === field ? null : current)), 1500)
        } catch (error) {
            console.error('Failed to copy value:', error)
        }
    }

    const CopyButton = ({ value, field }: { value?: string | null; field: string }) => {
        if (!value) return null
        const isCopied = copiedField === field
        return (
            <button
                type="button"
                onClick={() => handleCopy(value, field)}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-gray-500 hover:text-gray-900"
                title={isCopied ? 'Copied' : 'Copy'}
            >
                {isCopied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                {isCopied ? 'Copied' : 'Copy'}
            </button>
        )
    }

    const FieldRow = ({
        label,
        value,
        field,
        icon: Icon,
        href,
    }: {
        label: string
        value?: string | null
        field: string
        icon?: ComponentType<{ className?: string }>
        href?: string
    }) => {
        if (!value) return null
        return (
            <div className="flex items-start justify-between gap-3 py-3">
                <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500">{label}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-900">
                        {Icon && <Icon className="h-4 w-4 text-gray-400" />}
                        {href ? (
                            <a href={href} className="text-brand-600 hover:text-brand-700">
                                {value}
                            </a>
                        ) : (
                            <span className="text-gray-900">{value}</span>
                        )}
                    </div>
                </div>
                <CopyButton value={value} field={field} />
            </div>
        )
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Referral Details"
            size="xl"
        >
            <div className="space-y-6">
                {/* Patient Information Card */}
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-2xl">{patientName}</CardTitle>
                                <p className="text-sm text-gray-500 mt-1">Patient Information</p>
                            </div>
                            <div className="flex gap-2">
                                <Badge variant={getUrgencyVariant(displayReferral.urgency)}>
                                    {displayReferral.urgency || 'ROUTINE'}
                                </Badge>
                                <Badge variant={getStatusVariant(displayReferral.status)}>
                                    {displayReferral.status}
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                                <h4 className="text-sm font-semibold text-gray-900 mb-2">Patient Information</h4>
                                <div className="divide-y divide-gray-200">
                                    <FieldRow
                                        label="First Name"
                                        value={displayReferral.patientFirstName || patientName.split(' ')[0]}
                                        field="patientFirstName"
                                        icon={User}
                                    />
                                    <FieldRow
                                        label="Last Name"
                                        value={displayReferral.patientLastName || patientName.split(' ').slice(1).join(' ') || ''}
                                        field="patientLastName"
                                        icon={User}
                                    />
                                    <FieldRow
                                        label="Date of Birth"
                                        value={formatDate(displayReferral.patientDob)}
                                        field="patientDob"
                                        icon={Calendar}
                                    />
                                </div>
                            </div>
                            <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                                <h4 className="text-sm font-semibold text-gray-900 mb-2">Contact Information</h4>
                                <div className="divide-y divide-gray-200">
                                    <FieldRow
                                        label="Email"
                                        value={displayReferral.patientEmail}
                                        field="patientEmail"
                                        icon={Mail}
                                        href={displayReferral.patientEmail ? `mailto:${displayReferral.patientEmail}` : undefined}
                                    />
                                    <FieldRow
                                        label="Phone"
                                        value={displayReferral.patientPhone}
                                        field="patientPhone"
                                        icon={Phone}
                                        href={displayReferral.patientPhone ? `tel:${displayReferral.patientPhone}` : undefined}
                                    />
                                    <FieldRow
                                        label="Insurance"
                                        value={displayReferral.insurance}
                                        field="insurance"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Referrer Information Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Referring Clinic</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="divide-y divide-gray-100">
                            <FieldRow label="Clinic Name" value={clinicName} field="clinicName" icon={Building2} />
                            <FieldRow
                                label="Doctor"
                                value={doctorName ? (doctorName.startsWith('Dr.') ? doctorName : `Dr. ${doctorName}`) : undefined}
                                field="doctorName"
                                icon={User}
                            />
                            <FieldRow
                                label="Clinic Email"
                                value={displayReferral.fromClinicEmail}
                                field="clinicEmail"
                                icon={Mail}
                                href={displayReferral.fromClinicEmail ? `mailto:${displayReferral.fromClinicEmail}` : undefined}
                            />
                            <FieldRow
                                label="Clinic Phone"
                                value={displayReferral.fromClinicPhone}
                                field="clinicPhone"
                                icon={Phone}
                                href={displayReferral.fromClinicPhone ? `tel:${displayReferral.fromClinicPhone}` : undefined}
                            />
                            <FieldRow
                                label="Contact Phone"
                                value={displayReferral.submittedByPhone || displayReferral.fromClinicPhone}
                                field="contactPhone"
                                icon={Phone}
                                href={(displayReferral.submittedByPhone || displayReferral.fromClinicPhone)
                                    ? `tel:${displayReferral.submittedByPhone || displayReferral.fromClinicPhone}`
                                    : undefined}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Referral Details Card */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Reason for Referral</CardTitle>
                            <CopyButton value={displayReferral.reason} field="reason" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-gray-900 whitespace-pre-wrap">{displayReferral.reason}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Notes Card */}
                {displayReferral.notes && (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Additional Notes</CardTitle>
                                <CopyButton value={displayReferral.notes} field="notes" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-gray-700 whitespace-pre-wrap text-sm">{displayReferral.notes}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Selected Teeth Card */}
                {displayReferral.selectedTeeth && displayReferral.selectedTeeth.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Selected Teeth</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="border rounded-lg overflow-hidden bg-gray-900">
                                <div className="scale-90 origin-top">
                                    <InteractiveToothChart
                                        selectedTeeth={displayReferral.selectedTeeth}
                                        onTeethChange={() => { }}
                                        readOnly={true}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Status Update Card */}
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Update Status</CardTitle>
                            {statusUpdateSuccess && (
                                <div className="flex items-center gap-2 text-green-600 text-sm">
                                    <CheckCircle className="h-4 w-4" />
                                    Status updated!
                                </div>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <p className="text-sm font-medium text-gray-700">Change Referral Status</p>
                            <div className="flex flex-wrap gap-2">
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
                                                'relative px-4 py-2 text-sm font-medium rounded-lg border-2 transition-all flex items-center gap-2',
                                                state.isCompleted
                                                    ? 'bg-green-50 border-green-500 text-green-700'
                                                    : state.isCurrent
                                                    ? 'bg-white border-green-500 text-gray-900 ring-2 ring-green-500 ring-offset-2'
                                                    : 'bg-white border-gray-300 text-gray-500',
                                                !canClick && 'opacity-50 cursor-not-allowed',
                                                canClick && 'hover:bg-green-50 cursor-pointer'
                                            )}
                                        >
                                            {state.isCompleted && (
                                                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                                                    <Check className="h-3 w-3 text-white" />
                                                </div>
                                            )}
                                            {state.isCurrent && !state.isCompleted && (
                                                <div className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-green-500 bg-white"></div>
                                            )}
                                            {!state.isCompleted && !state.isCurrent && (
                                                <div className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-gray-300 bg-white"></div>
                                            )}
                                            <span>{STATUS_LABELS[status]}</span>
                                        </button>
                                    )
                                })}
                                {/* Cancelled option (separate from progression) */}
                                {displayReferral.status !== 'CANCELLED' && (
                                    <button
                                        type="button"
                                        onClick={() => !isUpdatingStatus && handleStatusUpdate('CANCELLED')}
                                        disabled={isUpdatingStatus}
                                        className={cn(
                                            'px-4 py-2 text-sm font-medium rounded-lg border-2 transition-all',
                                            'bg-white border-red-300 text-red-700 hover:border-red-400 hover:bg-red-50',
                                            isUpdatingStatus && 'opacity-50 cursor-not-allowed'
                                        )}
                                    >
                                        {STATUS_LABELS.CANCELLED}
                                    </button>
                                )}
                            </div>
                            {isUpdatingStatus && (
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span className="text-sm">Updating...</span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Attached Files Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Attached Files ({displayReferral.files?.length || 0})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {displayReferral.files && displayReferral.files.length > 0 ? (
                            <div className="space-y-3">
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
                                            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all group"
                                        >
                                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                                <div className="flex-shrink-0 p-3 bg-gray-100 rounded-lg">
                                                    <FileText className="h-5 w-5 text-gray-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {file.fileName}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {(file.fileSize / 1024).toFixed(1)} KB
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex-shrink-0 ml-4">
                                                <Button variant="outline" size="sm" className="group-hover:bg-gray-100">
                                                    <Download className="h-4 w-4 mr-2" />
                                                    Download
                                                </Button>
                                            </div>
                                        </a>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-sm text-gray-500">No files attached</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Footer Actions */}
                <div className="flex justify-between items-center pt-4 border-t">
                    <div className="flex gap-2">
                        {displayReferral.statusToken && (
                            <Button
                                variant="outline"
                                onClick={() => {
                                    window.open(`/referral-status/${displayReferral.statusToken}`, '_blank')
                                }}
                                className="gap-2"
                            >
                                <ExternalLink className="h-4 w-4" />
                                View Status
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onClose}>
                            Close
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    )
}
