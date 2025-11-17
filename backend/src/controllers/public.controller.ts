import { Request, Response, NextFunction } from 'express'
import { prisma } from '../config/database'
import { errors } from '../utils/errors'

/**
 * Get clinic by slug (public - no auth required)
 * Used for public referral form
 */
export async function getClinicBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    const { slug } = req.params

    // Find clinic referral link by slug
    const referralLink = await prisma.clinicReferralLink.findUnique({
      where: { slug },
      include: {
        clinic: true,
      },
    })

    if (!referralLink) {
      throw errors.notFound('Referral link not found')
    }

    if (!referralLink.isActive) {
      throw errors.badRequest('This referral link is currently inactive')
    }

    // Return clinic info (safe to expose publicly)
    res.json({
      success: true,
      data: {
        name: referralLink.clinic.name,
        address: referralLink.clinic.address,
        phone: referralLink.clinic.phone,
        email: referralLink.clinic.email,
        slug: referralLink.slug,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Submit public referral (no auth required)
 * Creates an INCOMING referral for the clinic
 */
export async function submitPublicReferral(req: Request, res: Response, next: NextFunction) {
  try {
    const { slug } = req.params
    const {
      // Referring clinic information
      fromClinicName,
      fromClinicEmail,
      fromClinicPhone,
      referringDentist,
      // Patient information
      patientName,
      patientDob,
      patientPhone,
      patientEmail,
      // Referral details
      reason,
      urgency = 'ROUTINE',
      notes,
      // Files (will be handled separately via file upload)
    } = req.body

    // Validate required fields
    if (!fromClinicName || !fromClinicEmail || !referringDentist || !patientName || !patientDob || !reason) {
      throw errors.badRequest('Missing required fields')
    }

    // Find clinic by slug
    const referralLink = await prisma.clinicReferralLink.findUnique({
      where: { slug },
      include: {
        clinic: true,
      },
    })

    if (!referralLink) {
      throw errors.notFound('Referral link not found')
    }

    if (!referralLink.isActive) {
      throw errors.badRequest('This referral link is currently inactive')
    }

    // Create INCOMING referral
    const referral = await prisma.referral.create({
      data: {
        referralType: 'INCOMING',
        fromClinicId: referralLink.clinicId, // Receiving clinic
        fromClinicName,
        fromClinicEmail,
        fromClinicPhone,
        referringDentist,
        patientName,
        patientDob: new Date(patientDob),
        patientPhone,
        patientEmail,
        reason,
        urgency: urgency.toUpperCase() as 'ROUTINE' | 'URGENT' | 'EMERGENCY',
        status: 'SENT', // Ready for clinic to review
        notes,
      },
      include: {
        files: true,
      },
    })

    // Create notification for clinic
    await prisma.notification.create({
      data: {
        clinicId: referralLink.clinicId,
        type: 'NEW_INCOMING_REFERRAL',
        referralId: referral.id,
        title: 'New Referral Received',
        message: `New referral received from ${fromClinicName} for patient ${patientName}`,
      },
    })

    res.status(201).json({
      success: true,
      message: 'Referral submitted successfully',
      data: {
        referralId: referral.id,
      },
    })
  } catch (error) {
    next(error)
  }
}

