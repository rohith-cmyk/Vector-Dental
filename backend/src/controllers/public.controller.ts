import { Request, Response, NextFunction } from 'express'
import { prisma } from '../config/database'
import { config } from '../config/env'
import { errors } from '../utils/errors'
import { verifyAccessCode, generateStatusToken, generateAccessCode, hashAccessCode } from '../utils/tokens'
import { uploadFile } from '../utils/storage'
import { sendEmail } from '../utils/email'
import { sendSms } from '../utils/sms'
import { sendInitialSchedulingNotice, scheduleSchedulingReminders } from '../utils/patient-scheduling'

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
        logoUrl: referralLink.clinic.logoUrl,
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

    // Generate status token for status tracking page
    const statusToken = generateStatusToken()

    const statusAccessCode = generateAccessCode()
    const statusAccessCodeHash = await hashAccessCode(statusAccessCode)

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
        statusToken,
        statusAccessCodeHash,
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

    if (patientPhone) {
      const clinicName = referralLink.clinic.name || 'the clinic'
      const message =
        `Hi ${patientName}, your referral has been submitted to ${clinicName}. ` +
        `We will contact you soon with next steps.`
      try {
        await sendSms(patientPhone, message)
      } catch (smsError) {
        console.warn('Failed to send referral submission SMS:', smsError)
      }
    }

    // Send status tracking link to referring clinic
    if (fromClinicEmail) {
      const statusUrl = `${config.corsOrigin}/referral-status/${statusToken}`
      await sendEmail({
        to: fromClinicEmail,
        replyTo: fromClinicEmail,
        subject: `Action Required: Patient Tracking Access for ${referralLink.clinic.name}`,
        body:
          `Dear Practice Manager / Clinical Team,\n\n` +
          `Please find the requested tracking information for your records below. This data is provided to assist with ongoing patient monitoring and care coordination.\n\n` +
          `To view the tracking dashboard, please use the secure link and your unique access code provided:\n\n` +
          `Tracking Link: ${statusUrl}\n\n` +
          `Your Access Code: ${statusAccessCode}\n\n` +
          `Next Steps:\n\n` +
          `Click the link above.\n\n` +
          `Enter your unique code when prompted.\n\n` +
          `If you encounter any technical issues or have questions regarding the data, please reply to this email.\n\n` +
          `Best regards,\n` +
          `${referralLink.clinic.name}`,
      })
    }

    res.status(201).json({
      success: true,
      message: 'Referral submitted successfully',
      data: {
        referralId: referral.id,
        statusToken,
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
                logoUrl: true,
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
        clinicLogoUrl: referralLink.specialist.clinic.logoUrl,
        specialistName: referralLink.specialist.name,
        specialty: referralLink.specialty,
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
 * Submit referral via referral link (public - no auth required)
 * POST /api/public/referral-link/:token/submit
 */
export async function submitReferral(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { token } = req.params
    const {
      // Patient information
      patientFirstName,
      patientLastName,
      patientDob,
      insurance,
      patientEmail,
      // GP/Submitter information
      gpClinicName,
      submittedByName,
      submittedByEmail,
      submittedByPhone,
      patientPhone,
      // Referral details
      reasonForReferral,
      notes,
      urgency,
      selectedTeeth: rawSelectedTeeth,
    } = req.body

    // Validate required fields (access code no longer required)
    if (
      !patientFirstName ||
      !patientLastName ||
      !gpClinicName ||
      !submittedByName ||
      !reasonForReferral
    ) {
      throw errors.badRequest('Missing required fields')
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

    const parsedSelectedTeeth = (() => {
      if (!rawSelectedTeeth) return []
      if (Array.isArray(rawSelectedTeeth)) {
        return rawSelectedTeeth.map((tooth) => String(tooth)).filter(Boolean)
      }
      if (typeof rawSelectedTeeth === 'string') {
        const trimmed = rawSelectedTeeth.trim()
        if (!trimmed) return []
        try {
          const parsed = JSON.parse(trimmed)
          if (Array.isArray(parsed)) {
            return parsed.map((tooth) => String(tooth)).filter(Boolean)
          }
        } catch {
          // Fall through to comma-delimited parsing
        }
        return trimmed
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean)
      }
      return []
    })()

    // Generate status token for status tracking page
    const statusToken = generateStatusToken()
    const statusAccessCode = generateAccessCode()
    const statusAccessCodeHash = await hashAccessCode(statusAccessCode)

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
        patientDob: patientDob ? new Date(patientDob) : new Date(), // Default to today if not provided
        patientPhone: patientPhone || null,
        patientEmail: patientEmail || null,
        insurance: insurance || null,
        gpClinicName,
        submittedByName,
        fromClinicEmail: submittedByEmail || null, // Store email in fromClinicEmail field
        submittedByPhone: submittedByPhone || null,
        reason: reasonForReferral,
        notes: notes || null,
        status: 'SUBMITTED', // New status for magic link submissions
        urgency: (urgency || 'ROUTINE').toUpperCase() as 'ROUTINE' | 'URGENT' | 'EMERGENCY',
        statusToken, // Store the status token for status tracking page
        statusAccessCodeHash,
        selectedTeeth: parsedSelectedTeeth,
        // Map to existing fields for backward compatibility
        fromClinicName: gpClinicName,
        referringDentist: submittedByName,
      },
      include: {
        files: true,
      },
    })

    // Upload files if any
    const files = req.files as Express.Multer.File[]
    if (files && files.length > 0) {
      for (const file of files) {
        try {
          // Upload to storage (Supabase or local)
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
              fileType: uploadResult.mimeType.split('/')[1] || 'unknown', // Extract extension
              fileUrl: uploadResult.fileUrl,
              fileSize: uploadResult.fileSize,
              storageKey: uploadResult.storageKey,
              mimeType: uploadResult.mimeType,
            },
          })
        } catch (fileError: any) {
          console.error('Failed to upload file:', fileError)
          // Continue with other files even if one fails
          // Don't fail the entire referral submission if file upload fails
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
        message: `New referral received via referral link from ${gpClinicName}`,
      },
    })

    const patientDisplayName =
      patientFirstName && patientLastName
        ? `${patientFirstName} ${patientLastName}`
        : patientFirstName || patientLastName || referral.patientName

    await sendInitialSchedulingNotice({
      referralId: referral.id,
      name: patientDisplayName,
      phone: patientPhone || undefined,
      email: patientEmail || undefined,
    })

    scheduleSchedulingReminders({
      referralId: referral.id,
      name: patientDisplayName,
      phone: patientPhone || undefined,
      email: patientEmail || undefined,
    })

    // Send status tracking link to submitter (if email provided)
    if (submittedByEmail) {
      const statusUrl = `${config.corsOrigin}/referral-status/${statusToken}`
      await sendEmail({
        to: submittedByEmail,
        replyTo: submittedByEmail,
        subject: `Action Required: Patient Tracking Access for ${referralLink.specialist.clinic.name}`,
        body:
          `Dear Practice Manager / Clinical Team,\n\n` +
          `Please find the requested tracking information for your records below. This data is provided to assist with ongoing patient monitoring and care coordination.\n\n` +
          `To view the tracking dashboard, please use the secure link and your unique access code provided:\n\n` +
          `Tracking Link: ${statusUrl}\n\n` +
          `Your Access Code: ${statusAccessCode}\n\n` +
          `Next Steps:\n\n` +
          `Click the link above.\n\n` +
          `Enter your unique code when prompted.\n\n` +
          `If you encounter any technical issues or have questions regarding the data, please reply to this email.\n\n` +
          `Best regards,\n` +
          `${referralLink.specialist.clinic.name}`,
      })
    }

    res.status(201).json({
      success: true,
      message: 'Referral submitted successfully',
      data: {
        referralId: referral.id,
        statusToken,
      },
    })
  } catch (error) {
    // HIPAA: Do not log PHI in error logs
    // The error middleware will handle logging without PHI
    next(error)
  }
}


/**
 * Get referral status by status token (public - no auth required)
 * GET /api/public/referral-status/:statusToken
 * Returns referral status information for status tracking page
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
            logoUrl: true,
          },
        },
        files: {
          select: {
            id: true,
            fileName: true,
            fileUrl: true,
            fileSize: true,
          },
        },
      },
    })

    if (!referral) {
      throw errors.notFound('Referral status not found')
    }

    // Status mapping for timeline display
    const STATUS_TO_TIMELINE_STAGE: Record<string, string> = {
      SUBMITTED: 'referral_accepted',
      ACCEPTED: 'appointment_scheduled',
      SENT: 'appointment_completed',
      COMPLETED: 'post_op_treatment_scheduled',
    }

    const TIMELINE_STAGES = [
      { key: 'referral_accepted', label: 'Referral Accepted', status: 'SUBMITTED' },
      { key: 'appointment_scheduled', label: 'Appointment Scheduled', status: 'ACCEPTED' },
      { key: 'appointment_completed', label: 'Appointment Completed', status: 'SENT' },
      { key: 'post_op_treatment_scheduled', label: 'Post Op Treatment Scheduled', status: 'COMPLETED' },
    ]

    // Determine current timeline stage based on status
    const currentStage = STATUS_TO_TIMELINE_STAGE[referral.status] || 'referral_accepted'

    const formatDateTime = (value?: Date | string | null) => {
      if (!value) return undefined
      const date = typeof value === 'string' ? new Date(value) : value
      if (Number.isNaN(date.getTime())) return undefined
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }) + `, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
    }

    const stageDates: Record<string, string | undefined> = {
      referral_accepted: formatDateTime(referral.acceptedAt),
      appointment_scheduled: formatDateTime(referral.scheduledAt),
      appointment_completed: formatDateTime(referral.completedAt),
      post_op_treatment_scheduled: formatDateTime(referral.postOpScheduledAt),
    }

    const firstMissingIndex = TIMELINE_STAGES.findIndex((stage) => !stageDates[stage.key])
    const currentIndex = firstMissingIndex === -1 ? TIMELINE_STAGES.length - 1 : firstMissingIndex
    const isCompletedStage = firstMissingIndex === -1

    // Build timeline stages
    const timeline = TIMELINE_STAGES.map((stage) => {
      const stageIndex = TIMELINE_STAGES.findIndex((s) => s.key === stage.key)
      
      return {
        key: stage.key,
        label: stage.label,
        status: stage.status,
        isCompleted: stageIndex < currentIndex || (isCompletedStage && stageIndex === currentIndex),
        isCurrent: stageIndex === currentIndex && !isCompletedStage,
        isPending: stageIndex > currentIndex,
        dateLabel: stageDates[stage.key],
      }
    })

    res.json({
      success: true,
      data: {
        referralId: referral.id,
        patientName: referral.patientFirstName && referral.patientLastName
          ? `${referral.patientFirstName} ${referral.patientLastName}`
          : referral.patientName,
        patientDob: referral.patientDob,
        reason: referral.reason,
        status: referral.status,
        currentStage,
        timeline,
        submittedAt: referral.createdAt,
        acceptedAt: referral.acceptedAt,
        scheduledAt: referral.scheduledAt,
        completedAt: referral.completedAt,
        postOpScheduledAt: referral.postOpScheduledAt,
        opsReportComment: referral.notes,
        opsReportUrl: referral.files?.[0]?.fileUrl || null,
        opsReportFiles: referral.files || [],
        clinic: referral.clinic,
      },
    })
  } catch (error) {
    next(error)
  }
}
