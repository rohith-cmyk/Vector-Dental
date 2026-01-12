import { useEffect } from 'react'
import { formatDate } from '@/lib/utils'
import { Modal, Badge, Button, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { FileText, Download, Phone, Mail, Calendar, User, Building2 } from 'lucide-react'
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

    // Get patient name - use new fields if available, otherwise fall back to patientName
    const patientName = referral.patientFirstName && referral.patientLastName
        ? `${referral.patientFirstName} ${referral.patientLastName}`
        : referral.patientName

    // Get clinic name and doctor - use new fields if available
    const clinicName = referral.gpClinicName || referral.fromClinicName || 'Unknown Clinic'
    const doctorName = referral.submittedByName || referral.referringDentist

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
                                <div className="flex items-center gap-4 mt-2">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Calendar className="h-4 w-4" />
                                        <span suppressHydrationWarning>
                                            DOB: {formatDate(referral.patientDob)}
                                        </span>
                                    </div>
                                    {referral.patientPhone && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Phone className="h-4 w-4" />
                                            <span>{referral.patientPhone}</span>
                                        </div>
                                    )}
                                    {referral.patientEmail && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Mail className="h-4 w-4" />
                                            <span>{referral.patientEmail}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Badge variant={getUrgencyVariant(referral.urgency)}>
                                    {referral.urgency || 'ROUTINE'}
                                </Badge>
                                <Badge variant={getStatusVariant(referral.status)}>
                                    {referral.status}
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {referral.insurance && (
                            <div className="mb-4">
                                <p className="text-sm font-medium text-gray-500 mb-1">Insurance</p>
                                <p className="text-base text-gray-900">{referral.insurance}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Referrer Information Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>From</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Clinic Name</p>
                                <p className="text-base text-gray-900">{clinicName}</p>
                            </div>
                            {doctorName && (
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">Doctor</p>
                                    <p className="text-base text-gray-900">
                                        {doctorName.startsWith('Dr.') ? doctorName : `Dr. ${doctorName}`}
                                    </p>
                                </div>
                            )}
                            {referral.fromClinicEmail && (
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">Email</p>
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-gray-400" />
                                        <a href={`mailto:${referral.fromClinicEmail}`} className="text-base text-blue-600 hover:text-blue-800">
                                            {referral.fromClinicEmail}
                                        </a>
                                    </div>
                                </div>
                            )}
                            {referral.fromClinicPhone && (
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">Phone</p>
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-gray-400" />
                                        <a href={`tel:${referral.fromClinicPhone}`} className="text-base text-blue-600 hover:text-blue-800">
                                            {referral.fromClinicPhone}
                                        </a>
                                    </div>
                                </div>
                            )}
                            {(referral.submittedByPhone || referral.fromClinicPhone) && (
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">Contact Phone</p>
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-gray-400" />
                                        <a href={`tel:${referral.submittedByPhone || referral.fromClinicPhone}`} className="text-base text-blue-600 hover:text-blue-800">
                                            {referral.submittedByPhone || referral.fromClinicPhone}
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Referral Details Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Reason for Referral</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-gray-900 whitespace-pre-wrap">{referral.reason}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Notes Card */}
                {referral.notes && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Additional Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-gray-700 whitespace-pre-wrap text-sm">{referral.notes}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Selected Teeth Card */}
                {referral.selectedTeeth && referral.selectedTeeth.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Selected Teeth</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="border rounded-lg overflow-hidden bg-gray-900">
                                <div className="scale-90 origin-top">
                                    <InteractiveToothChart
                                        selectedTeeth={referral.selectedTeeth}
                                        onTeethChange={() => { }}
                                        readOnly={true}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Attached Files Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Attached Files ({referral.files?.length || 0})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {referral.files && referral.files.length > 0 ? (
                            <div className="space-y-3">
                                {referral.files.map((file) => {
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
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </div>
        </Modal>
    )
}
