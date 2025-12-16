import { useEffect } from 'react'
import { formatDate } from '@/lib/utils'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { FileText, Download, X, Phone, Mail, Calendar, User, Building2 } from 'lucide-react'
import type { Referral, ReferralFile } from '@/types'
import { API_URL } from '@/lib/api'
import { InteractiveToothChart } from './InteractiveToothChart'
import { notificationsService } from '@/services/notifications.service'

interface ReferralDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    referral: Referral | null
}

export function ReferralDetailsModal({ isOpen, onClose, referral }: ReferralDetailsModalProps) {
    // Mark associated notifications as read when viewing referral
    useEffect(() => {
        if (isOpen && referral) {
            notificationsService.markAsReadByReferral(referral.id)
        }
    }, [isOpen, referral?.id])

    if (!referral) return null

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'success'
            case 'SENT': return 'info'
            case 'ACCEPTED': return 'warning'
            case 'CANCELLED': return 'danger'
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

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Referral Details"
            size="xl"
        >
            <div className="space-y-6">
                {/* Header - Patient Info */}
                <div className="flex justify-between items-start border-b pb-4">
                    <div>
                        <h3 className="text-xl font-semibold text-gray-900">{referral.patientName}</h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span suppressHydrationWarning>DOB: {formatDate(referral.patientDob)}</span>
                            </div>
                            {referral.patientPhone && (
                                <div className="flex items-center gap-1">
                                    <Phone className="h-4 w-4" />
                                    <span>{referral.patientPhone}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Badge variant={getUrgencyVariant(referral.urgency)}>
                            {referral.urgency}
                        </Badge>
                        <Badge variant={getStatusVariant(referral.status)}>
                            {referral.status}
                        </Badge>
                    </div>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column - Clinical Info */}
                    <div className="space-y-4">
                        <div>
                            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">From</h4>
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="font-medium text-gray-900">{referral.fromClinicName}</p>
                                {referral.referringDentist && (
                                    <p className="text-sm text-gray-600 mt-1">Dr. {referral.referringDentist}</p>
                                )}
                                {referral.fromClinicEmail && (
                                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                                        <Mail className="h-3 w-3" />
                                        <span>{referral.fromClinicEmail}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Reason for Referral</h4>
                            <div className="bg-white border rounded-lg p-3 text-gray-700 min-h-[100px]">
                                {referral.reason}
                            </div>
                        </div>

                        {referral.selectedTeeth && referral.selectedTeeth.length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Selected Teeth</h4>
                                <div className="border rounded-lg overflow-hidden bg-gray-900">
                                    {/* Scale down slightly to fit in modal column if needed, or keeping full size */}
                                    <div className="scale-90 origin-top">
                                        <InteractiveToothChart
                                            selectedTeeth={referral.selectedTeeth}
                                            onTeethChange={() => { }} // No-op for read-only
                                            readOnly={true}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {referral.notes && (
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Notes</h4>
                                <div className="bg-white border rounded-lg p-3 text-gray-600 text-sm">
                                    {referral.notes}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Files & Insurance */}
                    <div className="space-y-4">
                        {referral.insurance && (
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Insurance</h4>
                                <div className="bg-blue-50 text-blue-900 p-3 rounded-lg text-sm font-medium">
                                    {referral.insurance}
                                </div>
                            </div>
                        )}

                        <div>
                            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                                Attached Files ({referral.files?.length || 0})
                            </h4>
                            <div className="space-y-2">
                                {referral.files && referral.files.length > 0 ? (
                                    referral.files.map((file) => {
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
                                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-gray-100 rounded text-gray-500">
                                                        <FileText className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-700 max-w-[180px] truncate">
                                                            {file.fileName}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {(file.fileSize / 1024).toFixed(1)} KB
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                            </a>
                                        )
                                    })
                                ) : (
                                    <p className="text-sm text-gray-500 italic">No files attached</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </div>
        </Modal>
    )
}
