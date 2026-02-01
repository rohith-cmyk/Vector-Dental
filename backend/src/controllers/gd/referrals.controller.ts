import { Request, Response } from 'express'
import { prisma } from '../../config/database'
import { errors } from '../../utils/errors'
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

/**
 * Get single referral details
 */
export async function getReferralById(req: Request, res: Response) {
    try {
        const clinicId = req.user!.clinicId
        const { id } = req.params

        const referral = await prisma.referral.findFirst({
            where: {
                id,
                fromClinicId: clinicId, // Ensure GD can only see their clinic's referrals
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
            selectedTeeth = [],
            notes,
            status,
        } = req.body

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
                selectedTeeth,
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

        // TODO: Send email notification to specialist

        res.status(201).json({
            success: true,
            data: referral
        })
    } catch (error: any) {
        console.error('Create referral error:', error)
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Failed to create referral'
        })
    }
}
