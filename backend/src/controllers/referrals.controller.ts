import { Request, Response, NextFunction } from 'express'
import { prisma } from '../config/database'
import { errors } from '../utils/errors'
import { generateShareToken } from '../utils/tokens'
import { sendEmail } from '../utils/email'
import { config } from '../config/env'

/**
 * Status mapping for timeline display
 * Maps referral statuses to timeline stages
 */
const STATUS_TO_TIMELINE_STAGE: Record<string, string> = {
  SUBMITTED: 'reviewed',
  ACCEPTED: 'appointment_scheduled',
  SENT: 'patient_attended',
  COMPLETED: 'completed',
}

const TIMELINE_STAGES = [
  { key: 'reviewed', label: 'Reviewed', status: 'SUBMITTED' },
  { key: 'appointment_scheduled', label: 'Appointment Scheduled', status: 'ACCEPTED' },
  { key: 'patient_attended', label: 'Patient Attended', status: 'SENT' },
  { key: 'completed', label: 'Completed', status: 'COMPLETED' },
]

/**
 * Get all referrals for the clinic
 */
export async function getAllReferrals(req: Request, res: Response, next: NextFunction) {
  try {
    const clinicId = req.user!.clinicId
    const { page = 1, limit = 10, search, status, urgency, type } = req.query

    const skip = (Number(page) - 1) * Number(limit)
    const take = Number(limit)

    // Build where clause
    const where: any = {}

    // Filter by type (sent vs received)
    if (type === 'received') {
      // Incoming referrals:
      // 1. P2P: Sent TO this clinic (toClinicId = clinicId)
      // 2. Magic Link/Legacy: Created presumably by this clinic with type INCOMING (fromClinicId = clinicId AND referralType = INCOMING)
      where.OR = [
        { toClinicId: clinicId },
        {
          fromClinicId: clinicId,
          referralType: 'INCOMING'
        }
      ]
    } else {
      // Default or 'sent': Outgoing referrals
      // Sent BY this clinic (fromClinicId = clinicId AND referralType = OUTGOING)
      where.fromClinicId = clinicId
      where.referralType = 'OUTGOING'
    }

    if (search) {
      const searchFilter = [
        { patientName: { contains: search as string, mode: 'insensitive' } },
        { reason: { contains: search as string, mode: 'insensitive' } },
      ]

      if (where.OR) {
        where.AND = [
          { OR: where.OR },
          { OR: searchFilter }
        ]
        delete where.OR // Move original OR to AND block
      } else {
        where.OR = searchFilter
      }
    }

    if (status) {
      where.status = status
    }

    if (urgency) {
      where.urgency = urgency
    }

    // Get referrals with pagination
    const [referrals, total] = await Promise.all([
      prisma.referral.findMany({
        where,
        skip,
        take,
        include: {
          contact: true,
          files: true,
          clinic: true, // Include sending clinic info
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.referral.count({ where }),
    ])

    res.json({
      success: true,
      data: referrals,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / take),
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Get referral by ID
 */
export async function getReferralById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params
    const clinicId = req.user!.clinicId

    const referral = await prisma.referral.findFirst({
      where: {
        id,
        OR: [
          { fromClinicId: clinicId }, // Sender
          { toClinicId: clinicId },   // Receiver
        ]
      },
      include: {
        contact: true,
        files: true,
        clinic: true,
      },
    })

    if (!referral) {
      throw errors.notFound('Referral not found')
    }

    res.json({
      success: true,
      data: referral,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Create new referral
 */
export async function createReferral(req: Request, res: Response, next: NextFunction) {
  try {
    const clinicId = req.user!.clinicId
    const {
      contactId,
      patientName,
      patientDob,
      patientPhone,
      patientEmail,
      reason,
      urgency,
      notes,
    } = req.body

    // Verify contact belongs to clinic
    const contact = await prisma.contact.findFirst({
      where: { id: contactId, clinicId },
    })

    if (!contact) {
      throw errors.badRequest('Invalid contact')
    }

    const referral = await prisma.referral.create({
      data: {
        referralType: 'OUTGOING',
        fromClinicId: clinicId,
        toContactId: contactId,
        patientName,
        patientDob: new Date(patientDob),
        patientPhone,
        patientEmail,
        reason,
        urgency: urgency || 'ROUTINE',
        status: 'DRAFT',
        notes,
      },
      include: {
        contact: true,
      },
    })

    res.status(201).json({
      success: true,
      data: referral,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Update referral
 */
export async function updateReferral(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params
    const clinicId = req.user!.clinicId
    const {
      contactId,
      patientName,
      patientDob,
      patientPhone,
      patientEmail,
      reason,
      urgency,
      notes,
    } = req.body

    // Check if referral exists and belongs to clinic
    const existingReferral = await prisma.referral.findFirst({
      where: { id, fromClinicId: clinicId },
    })

    if (!existingReferral) {
      throw errors.notFound('Referral not found')
    }

    // If contactId is being updated, verify it
    if (contactId) {
      const contact = await prisma.contact.findFirst({
        where: { id: contactId, clinicId },
      })

      if (!contact) {
        throw errors.badRequest('Invalid contact')
      }
    }

    const referral = await prisma.referral.update({
      where: { id },
      data: {
        toContactId: contactId,
        patientName,
        patientDob: patientDob ? new Date(patientDob) : undefined,
        patientPhone,
        patientEmail,
        reason,
        urgency,
        notes,
      },
      include: {
        contact: true,
        files: true,
      },
    })

    res.json({
      success: true,
      data: referral,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Update referral status
 */
export async function updateReferralStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params
    const clinicId = req.user!.clinicId
    const { status } = req.body

    // Check if referral exists and belongs to clinic
    const existingReferral = await prisma.referral.findFirst({
      where: { id, fromClinicId: clinicId },
    })

    if (!existingReferral) {
      throw errors.notFound('Referral not found')
    }

    const referral = await prisma.referral.update({
      where: { id },
      data: { status },
      include: {
        contact: true,
      },
    })

    res.json({
      success: true,
      data: referral,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Delete referral
 */
export async function deleteReferral(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params
    const clinicId = req.user!.clinicId

    // Check if referral exists and belongs to clinic
    const referral = await prisma.referral.findFirst({
      where: { id, fromClinicId: clinicId },
    })

    if (!referral) {
      throw errors.notFound('Referral not found')
    }

    await prisma.referral.delete({
      where: { id },
    })

    res.json({
      success: true,
      message: 'Referral deleted successfully',
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Get referral status by status token (for status tracking page)
 */
export async function getReferralStatusByToken(req: Request, res: Response, next: NextFunction) {
  try {
    const { statusToken } = req.params

    if (!statusToken) {
      throw errors.badRequest('Status token is required')
    }

    // Find referral by status token
    const referral = await prisma.referral.findUnique({
      where: { statusToken },
      include: {
        clinic: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
            email: true,
          },
        },
      },
    })

    if (!referral) {
      throw errors.notFound('Referral status not found')
    }

    // Determine current timeline stage based on status
    const currentStage = STATUS_TO_TIMELINE_STAGE[referral.status] || 'reviewed'

    // Build timeline stages
    const timeline = TIMELINE_STAGES.map((stage) => {
      const stageIndex = TIMELINE_STAGES.findIndex((s) => s.key === stage.key)
      const currentIndex = TIMELINE_STAGES.findIndex((s) => s.key === currentStage)
      const isCompletedStage = currentStage === 'completed'
      
      return {
        key: stage.key,
        label: stage.label,
        status: stage.status,
        isCompleted: stageIndex < currentIndex || (isCompletedStage && stageIndex === currentIndex),
        isCurrent: stageIndex === currentIndex && !isCompletedStage,
        isPending: stageIndex > currentIndex,
      }
    })

    res.json({
      success: true,
      data: {
        referralId: referral.id,
        patientName: referral.patientFirstName && referral.patientLastName
          ? `${referral.patientFirstName} ${referral.patientLastName}`
          : referral.patientName,
        status: referral.status,
        currentStage,
        timeline,
        submittedAt: referral.createdAt,
        clinic: referral.clinic,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Share referral - Generate share token and send email
 */
export async function shareReferral(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params
    const clinicId = req.user!.clinicId

    // Find referral - must belong to clinic
    // For INCOMING referrals: fromClinicId is the receiving clinic
    // For OUTGOING referrals: fromClinicId is the sending clinic
    const referral = await prisma.referral.findFirst({
      where: {
        id,
        fromClinicId: clinicId, // Clinic must own this referral (receiving for INCOMING, sending for OUTGOING)
      },
      include: {
        clinic: {
          select: {
            name: true,
          },
        },
      },
    })

    if (!referral) {
      throw errors.notFound('Referral not found')
    }

    // Generate share token if it doesn't exist
    let shareToken = referral.shareToken
    if (!shareToken) {
      shareToken = generateShareToken()
      await prisma.referral.update({
        where: { id },
        data: { shareToken },
      })
    }

    // Get recipient email (GP's email - the one who submitted the referral)
    const recipientEmail = referral.fromClinicEmail

    if (!recipientEmail) {
      throw errors.badRequest('No email address found for the referring clinic')
    }

    // Get patient name
    const patientName = referral.patientFirstName && referral.patientLastName
      ? `${referral.patientFirstName} ${referral.patientLastName}`
      : referral.patientName

    // Build share URL
    const shareUrl = `${config.corsOrigin}/view-referral/${shareToken}`

    // Prepare email
    const emailSubject = `Referral Shared - ${patientName}`
    const emailBody = `Hello ${referral.submittedByName || referral.referringDentist || 'there'},

Your referral for ${patientName} has been reviewed by ${referral.clinic.name}. You can view the referral details using the link below:

${shareUrl}

This link provides a read-only view of the referral information you submitted.

Thank you,
${referral.clinic.name}`

    // Send email (or get mailto link)
    const emailResult = await sendEmail({
      to: recipientEmail,
      subject: emailSubject,
      body: emailBody,
    })

    res.json({
      success: true,
      message: 'Referral shared successfully',
      data: {
        shareUrl,
        shareToken,
        emailSent: !!emailResult.mailtoLink, // Will be true for mailto fallback
        mailtoLink: emailResult.mailtoLink, // For client to handle if needed
      },
    })
  } catch (error) {
    next(error)
  }
}

