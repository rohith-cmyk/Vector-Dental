import { Request, Response } from 'express'
import { prisma } from '../../config/database'
import { errors } from '../../utils/errors'
import { uploadFile } from '../../utils/storage'
import { sendSmsSafe } from '../../utils/sms'
import crypto from 'crypto'

/**
 * Get all referrals created by this GD
 */
export async function getMyReferrals(req: Request, res: Response) {
    try {
        const { page = 1, limit = 10, status, search } = req.query

        const skip = (Number(page) - 1) * Number(limit)
        const take = Number(limit)

        const gdUser = await prisma.user.findUnique({
            where: { id: req.user!.userId },
            include: { clinic: true },
        })

        const clinicId = gdUser?.clinicId || req.user?.clinicId
        const clinicEmail = gdUser?.clinic?.email || undefined
        const clinicName = gdUser?.clinic?.name || undefined
        const tokenEmail = req.user?.email

        if (!clinicId && !tokenEmail && !clinicEmail && !clinicName) {
            throw errors.notFound('Clinic not found for user')
        }

        const whereOr: any[] = []
        if (clinicId) whereOr.push({ fromClinicId: clinicId })
        if (clinicEmail) whereOr.push({ fromClinicEmail: clinicEmail })
        if (clinicName) whereOr.push({ fromClinicName: clinicName })
        if (tokenEmail) whereOr.push({ fromClinicEmail: tokenEmail })

        // Build where clause
        const where: any = whereOr.length ? { OR: whereOr } : {}

        if (status && status !== 'all') {
            where.status = status
        }

        if (search) {
            where.OR = [
                { patientName: { contains: search as string, mode: 'insensitive' } },
                { patientFirstName: { contains: search as string, mode: 'insensitive' } },
                { patientLastName: { contains: search as string, mode: 'insensitive' } },
            ]
        }

        // Get referrals and total count
        const [referrals, total] = await Promise.all([
            prisma.referral.findMany({
                where,
                skip,
                take,
                orderBy: { createdAt: 'desc' },
                include: {
                    intendedRecipient: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            clinic: {
                                select: {
                                    id: true,
                                    name: true,
                                    address: true,
                                    phone: true,
                                }
                            }
                        }
                    },
                    files: true,
                }
            }),
            prisma.referral.count({ where })
        ])

        res.json({
            success: true,
            data: {
                referrals,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    totalPages: Math.ceil(total / Number(limit))
                }
            }
        })
    } catch (error: any) {
        console.error('Get my referrals error:', error)
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Failed to fetch referrals'
        })
    }
}

const parseSelectedTeeth = (value: unknown): string[] => {
    if (!value) return []
    if (Array.isArray(value)) return value.map(String)
    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value)
            if (Array.isArray(parsed)) return parsed.map(String)
        } catch {
            return value.split(',').map((item) => item.trim()).filter(Boolean)
        }
    }
    return []
}

/**
 * Get single referral details
 */
export async function getReferralById(req: Request, res: Response) {
    try {
        const { id } = req.params

        const gdUser = await prisma.user.findUnique({
            where: { id: req.user!.userId },
            include: { clinic: true },
        })

        const clinicId = gdUser?.clinicId || req.user?.clinicId
        const clinicEmail = gdUser?.clinic?.email || undefined
        const clinicName = gdUser?.clinic?.name || undefined
        const tokenEmail = req.user?.email

        if (!clinicId && !tokenEmail && !clinicEmail && !clinicName) {
            throw errors.notFound('Clinic not found for user')
        }

        const whereOr: any[] = []
        if (clinicId) whereOr.push({ fromClinicId: clinicId })
        if (clinicEmail) whereOr.push({ fromClinicEmail: clinicEmail })
        if (clinicName) whereOr.push({ fromClinicName: clinicName })
        if (tokenEmail) whereOr.push({ fromClinicEmail: tokenEmail })

        const referral = await prisma.referral.findFirst({
            where: {
                id,
                OR: whereOr,
            },
            include: {
                intendedRecipient: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        clinic: {
                            select: {
                                id: true,
                                name: true,
                                address: true,
                                phone: true,
                                email: true,
                            }
                        }
                    }
                },
                files: true,
                operativeReports: {
                    include: {
                        createdBy: {
                            select: {
                                id: true,
                                name: true,
                            }
                        },
                        files: true,
                    }
                },
            }
        })

        if (!referral) {
            throw errors.notFound('Referral not found')
        }

        res.json({
            success: true,
            data: referral
        })
    } catch (error: any) {
        console.error('Get referral by ID error:', error)
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Failed to fetch referral'
        })
    }
}

/**
 * Create a new referral from GD to specialist
 */
export async function createReferral(req: Request, res: Response) {
    try {
        const userId = req.user!.userId

        const {
            // Specialist info
            specialistUserId,

            // Patient info
            patientFirstName,
            patientLastName,
            patientDob,
            patientPhone,
            patientEmail,
            insurance,

            // Referral details
            reason,
            urgency = 'ROUTINE',
            selectedTeeth,
            notes,
            status,
        } = req.body

        console.log('[GD Referral] Received patientPhone:', patientPhone, 'type:', typeof patientPhone)

        // Validate required fields
        if (!specialistUserId || !patientFirstName || !patientLastName || !patientDob || !reason) {
            throw errors.badRequest('Missing required fields')
        }

        // Get GD user and clinic info
        const gdUser = await prisma.user.findUnique({
            where: { id: userId },
            include: { clinic: true }
        })

        if (!gdUser) {
            throw errors.notFound('User not found')
        }
        if (!gdUser.clinicId) {
            throw errors.notFound('Clinic not found for user')
        }

        // Get specialist info
        const specialist = await prisma.user.findFirst({
            where: {
                id: specialistUserId,
                role: { in: ['ADMIN', 'STAFF'] },
            },
            include: { clinic: true }
        })

        if (!specialist) {
            throw errors.notFound('Specialist not found')
        }

        // Generate status token for tracking
        const statusToken = crypto.randomBytes(32).toString('hex')

        const normalizedSelectedTeeth = parseSelectedTeeth(selectedTeeth)

        // Create referral
        const referral = await prisma.referral.create({
            data: {
                // Direction
                referralType: 'OUTGOING',

                // From (GD)
                fromClinicId: gdUser.clinicId,
                fromClinicName: gdUser.clinic.name,
                fromClinicEmail: gdUser.clinic.email,
                fromClinicPhone: gdUser.clinic.phone,
                referringDentist: gdUser.name,
                submittedByName: gdUser.name,

                // To (Specialist)
                toClinicId: specialist.clinicId,
                intendedRecipientId: specialistUserId,

                // Patient info
                patientFirstName,
                patientLastName,
                patientName: `${patientFirstName} ${patientLastName}`,
                patientDob: new Date(patientDob),
                patientPhone,
                patientEmail,
                insurance,

                // Referral details
                reason,
                urgency,
                selectedTeeth: normalizedSelectedTeeth,
                notes,

                // Status
                status: status === 'DRAFT' ? 'DRAFT' : 'SUBMITTED',
                statusToken,
            },
            include: {
                intendedRecipient: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        clinic: {
                            select: {
                                id: true,
                                name: true,
                            }
                        }
                    }
                }
            }
        })

        const files = (req.files as Express.Multer.File[]) || []
        if (files.length > 0) {
            for (const file of files) {
                const uploadResult = await uploadFile(file.buffer, file.originalname, file.mimetype, referral.id)
                await prisma.referralFile.create({
                    data: {
                        referralId: referral.id,
                        fileName: uploadResult.fileName,
                        fileType: uploadResult.mimeType.split('/')[1] || 'unknown',
                        fileUrl: uploadResult.fileUrl,
                        fileSize: uploadResult.fileSize,
                        storageKey: uploadResult.storageKey,
                        mimeType: uploadResult.mimeType,
                    },
                })
            }
        }

        const referralWithFiles = await prisma.referral.findUnique({
            where: { id: referral.id },
            include: {
                intendedRecipient: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        clinic: {
                            select: {
                                id: true,
                                name: true,
                            }
                        }
                    }
                },
                files: true,
            }
        })

        // Create notification for specialist
        await prisma.notification.create({
            data: {
                clinicId: specialist.clinicId,
                userId: specialistUserId,
                type: 'NEW_INCOMING_REFERRAL',
                referralId: referral.id,
                title: 'New Referral Received',
                message: `New referral from ${gdUser.clinic.name} for ${patientFirstName} ${patientLastName}`
            }
        })

        // Send confirmation SMS to patient (referral from GD portal)
        const phoneToUse = typeof patientPhone === 'string' ? patientPhone.trim() : (patientPhone ? String(patientPhone).trim() : '')
        if (phoneToUse) {
            const patientName = `${patientFirstName} ${patientLastName}`.trim()
            const specialistClinicName = specialist.clinic?.name || 'the specialist'
            const message =
                `Hi ${patientName}, your referral has been submitted to ${specialistClinicName}. ` +
                `We will contact you soon with next steps.`
            console.log('[SMS] Sending referral confirmation to:', phoneToUse)
            await sendSmsSafe(phoneToUse, message)
        }

        // TODO: Send email notification to specialist

        res.status(201).json({
            success: true,
            data: referralWithFiles || referral
        })
    } catch (error: any) {
        console.error('Create referral error:', error)
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Failed to create referral'
        })
    }
}

/**
 * Update an existing referral (drafts only)
 */
export async function updateReferral(req: Request, res: Response) {
    try {
        const { id } = req.params
        const userId = req.user!.userId

        const {
            specialistUserId,
            patientFirstName,
            patientLastName,
            patientDob,
            patientPhone,
            patientEmail,
            insurance,
            reason,
            urgency = 'ROUTINE',
            selectedTeeth,
            notes,
            status,
        } = req.body

        const gdUser = await prisma.user.findUnique({
            where: { id: userId },
            include: { clinic: true },
        })

        const clinicId = gdUser?.clinicId || req.user?.clinicId
        const clinicEmail = gdUser?.clinic?.email || undefined
        const clinicName = gdUser?.clinic?.name || undefined
        const tokenEmail = req.user?.email

        if (!clinicId && !tokenEmail && !clinicEmail && !clinicName) {
            throw errors.notFound('Clinic not found for user')
        }

        const whereOr: any[] = []
        if (clinicId) whereOr.push({ fromClinicId: clinicId })
        if (clinicEmail) whereOr.push({ fromClinicEmail: clinicEmail })
        if (clinicName) whereOr.push({ fromClinicName: clinicName })
        if (tokenEmail) whereOr.push({ fromClinicEmail: tokenEmail })

        const existing = await prisma.referral.findFirst({
            where: {
                id,
                OR: whereOr,
            },
        })

        if (!existing) {
            throw errors.notFound('Referral not found')
        }

        if (existing.status !== 'DRAFT') {
            throw errors.badRequest('Only draft referrals can be edited')
        }

        const normalizedSelectedTeeth = parseSelectedTeeth(selectedTeeth)
        const updated = await prisma.referral.update({
            where: { id },
            data: {
                intendedRecipientId: specialistUserId || existing.intendedRecipientId,
                patientFirstName: patientFirstName || existing.patientFirstName,
                patientLastName: patientLastName || existing.patientLastName,
                patientName: patientFirstName && patientLastName
                    ? `${patientFirstName} ${patientLastName}`
                    : existing.patientName,
                patientDob: patientDob ? new Date(patientDob) : existing.patientDob,
                patientPhone: patientPhone || existing.patientPhone,
                patientEmail: patientEmail || existing.patientEmail,
                insurance: insurance ?? existing.insurance,
                reason: reason || existing.reason,
                urgency,
                selectedTeeth: normalizedSelectedTeeth.length ? normalizedSelectedTeeth : existing.selectedTeeth,
                notes: notes ?? existing.notes,
                status: status || existing.status,
            },
        })

        const files = (req.files as Express.Multer.File[]) || []
        if (files.length > 0) {
            for (const file of files) {
                const uploadResult = await uploadFile(file.buffer, file.originalname, file.mimetype, updated.id)
                await prisma.referralFile.create({
                    data: {
                        referralId: updated.id,
                        fileName: uploadResult.fileName,
                        fileType: uploadResult.mimeType.split('/')[1] || 'unknown',
                        fileUrl: uploadResult.fileUrl,
                        fileSize: uploadResult.fileSize,
                        storageKey: uploadResult.storageKey,
                        mimeType: uploadResult.mimeType,
                    },
                })
            }
        }

        const updatedWithFiles = await prisma.referral.findUnique({
            where: { id: updated.id },
            include: {
                intendedRecipient: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        clinic: {
                            select: {
                                id: true,
                                name: true,
                            }
                        }
                    }
                },
                files: true,
            }
        })

        res.json({
            success: true,
            data: updatedWithFiles || updated,
        })
    } catch (error: any) {
        console.error('Update referral error:', error)
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Failed to update referral',
        })
    }
}
