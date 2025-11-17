import { Request, Response, NextFunction } from 'express'
import { prisma } from '../config/database'
import { errors } from '../utils/errors'

/**
 * Get all referrals for the clinic
 */
export async function getAllReferrals(req: Request, res: Response, next: NextFunction) {
  try {
    const clinicId = req.user!.clinicId
    const { page = 1, limit = 10, search, status, urgency } = req.query

    const skip = (Number(page) - 1) * Number(limit)
    const take = Number(limit)

    // Build where clause - referrals are linked via fromClinicId
    const where: any = { fromClinicId: clinicId }

    if (search) {
      where.OR = [
        { patientName: { contains: search as string, mode: 'insensitive' } },
        { reason: { contains: search as string, mode: 'insensitive' } },
      ]
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
      where: { id, fromClinicId: clinicId },
      include: {
        contact: true,
        files: true,
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

