import { Request, Response, NextFunction } from 'express'
import { prisma } from '../config/database'
import { errors } from '../utils/errors'
import { verifyAccessCode } from '../utils/tokens'
import { uploadFile } from '../utils/storage'

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

/**
 * Get referral link info by token (public - no auth required)
 * GET /api/public/referral-link/:token
 * Returns basic info about the referral link (clinic name, etc.) without PHI
 */
export async function getReferralLinkByToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { token } = req.params

    // Find referral link by token
    const referralLink = await prisma.referralLink.findUnique({
      where: { token },
      include: {
        specialist: {
          select: {
            id: true,
            name: true,
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
        },
      },
    })

    if (!referralLink) {
      throw errors.notFound('Referral link not found')
    }

    if (!referralLink.isActive) {
      throw errors.badRequest('This referral link is currently inactive')
    }

    // Return safe public info (no PHI, no access code hash)
    res.json({
      success: true,
      data: {
        token: referralLink.token,
        label: referralLink.label,
        clinicName: referralLink.specialist.clinic.name,
        clinicAddress: referralLink.specialist.clinic.address,
        clinicPhone: referralLink.specialist.clinic.phone,
        clinicEmail: referralLink.specialist.clinic.email,
        specialistName: referralLink.specialist.name,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Verify access code for a referral link (public - no auth required)
 * POST /api/public/referral-link/:token/verify
 */
export async function verifyReferralLinkAccessCode(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { token } = req.params
    const { accessCode } = req.body

    if (!accessCode) {
      throw errors.badRequest('Access code is required')
    }

    // Find referral link by token
    const referralLink = await prisma.referralLink.findUnique({
      where: { token },
    })

    if (!referralLink) {
      throw errors.notFound('Referral link not found')
    }

    if (!referralLink.isActive) {
      throw errors.badRequest('This referral link is currently inactive')
    }

    // Verify access code
    const isValid = await verifyAccessCode(
      accessCode,
      referralLink.accessCodeHash
    )

    if (!isValid) {
      throw errors.unauthorized('Invalid access code')
    }

    // Return success (access code is valid)
    res.json({
      success: true,
      message: 'Access code verified successfully',
      data: {
        token: referralLink.token,
        verified: true,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Submit referral via magic link (public - no auth required)
 * POST /api/public/referral-link/:token/submit
 * Requires access code verification
 */
export async function submitMagicReferral(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { token } = req.params

    const {
      accessCode,
      // Patient information
      patientFirstName,
      patientLastName,
      patientDob,
      insurance,
      // GP/Submitter information
      gpClinicName,
      submittedByName,
      submittedByPhone,
      // Referral details
      reasonForReferral,
      notes,
    } = req.body

    // Validate required fields (manual check as backup)
    const missingFields: string[] = []
    if (!accessCode) missingFields.push('accessCode')
    if (!patientFirstName) missingFields.push('patientFirstName')
    if (!patientLastName) missingFields.push('patientLastName')
    if (!patientDob) missingFields.push('patientDob')
    if (!gpClinicName) missingFields.push('gpClinicName')
    if (!submittedByName) missingFields.push('submittedByName')
    if (!reasonForReferral) missingFields.push('reasonForReferral')

    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields)
      throw errors.badRequest(`Missing required fields: ${missingFields.join(', ')}`)
    }

    // Find and verify referral link
    const referralLink = await prisma.referralLink.findUnique({
      where: { token },
      include: {
        specialist: {
          select: {
            id: true,
            clinicId: true,
            clinic: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })

    if (!referralLink) {
      throw errors.notFound('Referral link not found')
    }

    if (!referralLink.isActive) {
      throw errors.badRequest('This referral link is currently inactive')
    }

    // Verify access code
    const isValid = await verifyAccessCode(
      accessCode,
      referralLink.accessCodeHash
    )

    if (!isValid) {
      throw errors.unauthorized('Invalid access code')
    }

    // Create referral with new fields
    // Use the specialist's clinic as the receiving clinic
    const referral = await prisma.referral.create({
      data: {
        referralType: 'INCOMING',
        fromClinicId: referralLink.specialist.clinicId, // Receiving clinic (specialist's clinic)
        referralLinkId: referralLink.id,
        // New fields
        patientFirstName,
        patientLastName,
        patientName: `${patientFirstName} ${patientLastName}`, // Keep for backward compatibility
        patientDob: new Date(patientDob), // patientDob is required and validated above
        insurance: insurance || null,
        gpClinicName,
        submittedByName,
        submittedByPhone: submittedByPhone || null,
        reason: reasonForReferral,
        notes: notes || null,
        status: 'SUBMITTED', // New status for magic link submissions
        urgency: 'ROUTINE', // Default urgency
        // Map to existing fields for backward compatibility
        fromClinicName: gpClinicName,
        referringDentist: submittedByName,
      },
      include: {
        files: true,
      },
    })

    // Upload files if any (from multipart form data)
    const files = (req.files as Express.Multer.File[]) || []
    if (files && files.length > 0) {
      for (const file of files) {
        try {
          // Upload to storage (Supabase Storage or local filesystem)
          const uploadResult = await uploadFile(
            file.buffer,
            file.originalname,
            file.mimetype,
            referral.id
          )

          // Save file metadata to database
          await prisma.referralFile.create({
            data: {
              referralId: referral.id,
              fileName: uploadResult.fileName,
              fileType: uploadResult.mimeType || file.mimetype || 'application/octet-stream',
              fileUrl: uploadResult.fileUrl,
              fileSize: uploadResult.fileSize,
              storageKey: uploadResult.storageKey || null,
              mimeType: uploadResult.mimeType || file.mimetype || null,
            },
          })
        } catch (fileError: any) {
          console.error('Failed to upload file:', fileError.message)
          // Continue with other files even if one fails
          // Don't fail the entire submission if file upload fails
        }
      }
    }

    // Create notification for clinic (do not include PHI in message)
    await prisma.notification.create({
      data: {
        clinicId: referralLink.specialist.clinicId,
        type: 'NEW_INCOMING_REFERRAL',
        referralId: referral.id,
        title: 'New Referral Received',
        // Don't log PHI - just generic message
        message: `New referral received via magic link from ${gpClinicName}`,
      },
    })

    res.status(201).json({
      success: true,
      message: 'Referral submitted successfully',
      data: {
        referralId: referral.id,
      },
    })
  } catch (error: any) {
    // Log error for debugging (without PHI)
    console.error('Error submitting magic referral:', {
      message: error.message,
      code: error.code,
      name: error.name,
      // Include stack in development
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
      // Don't log patient info or PHI
    })
    // HIPAA: Do not log PHI in error logs
    // The error middleware will handle logging without PHI
    next(error)
  }
}

