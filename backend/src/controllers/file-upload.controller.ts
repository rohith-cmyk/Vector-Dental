import { Request, Response, NextFunction } from 'express'
import multer from 'multer'
import { prisma } from '../config/database'
import { errors } from '../utils/errors'
import { verifyAccessCode } from '../utils/tokens'
import { uploadFile } from '../utils/storage'
import { config } from '../config/env'

// Configure multer for memory storage (we'll upload to Supabase/local after processing)
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: {
    fileSize: config.maxFileSize, // 10MB default
  },
  fileFilter: (req, file, cb) => {
    // Accept common medical/document file types
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/pdf',
      'application/dicom',
      'application/x-dicom',
    ]

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error(`File type ${file.mimetype} is not allowed`))
    }
  },
})

// Middleware for handling file uploads
export const uploadMiddleware = upload.array('files', 10) // Max 10 files

/**
 * Upload files for a referral (public endpoint, requires token + access code verification)
 * POST /api/public/referral-link/:token/files
 * 
 * Note: This can be called before or after referral creation.
 * If before, files are uploaded and stored, then associated when referral is created.
 * If after, files are associated with existing referralId.
 */
export async function uploadReferralFiles(req: Request, res: Response, next: NextFunction) {
  try {
    const { token } = req.params
    const { accessCode, referralId } = req.body
    const files = req.files as Express.Multer.File[]

    if (!accessCode) {
      throw errors.badRequest('Access code is required')
    }

    if (!files || files.length === 0) {
      throw errors.badRequest('No files provided')
    }

    // Verify referral link and access code
    const referralLink = await prisma.referralLink.findUnique({
      where: { token },
    })

    if (!referralLink) {
      throw errors.notFound('Referral link not found')
    }

    if (!referralLink.isActive) {
      throw errors.badRequest('This referral link is currently inactive')
    }

    const isValid = await verifyAccessCode(accessCode, referralLink.accessCodeHash)
    if (!isValid) {
      throw errors.unauthorized('Invalid access code')
    }

    // If referralId provided, verify it belongs to this link
    if (referralId) {
      const referral = await prisma.referral.findFirst({
        where: {
          id: referralId,
          referralLinkId: referralLink.id,
        },
      })

      if (!referral) {
        throw errors.notFound('Referral not found or does not belong to this link')
      }
    }

    // Upload all files
    const uploadedFiles = await Promise.all(
      files.map(async (file) => {
        const uploadResult = await uploadFile(
          file.buffer,
          file.originalname,
          file.mimetype,
          referralId || undefined
        )

        // Create ReferralFile record if referralId exists
        if (referralId) {
          const referralFile = await prisma.referralFile.create({
            data: {
              referralId,
              fileName: uploadResult.fileName,
              fileType: file.mimetype,
              fileUrl: uploadResult.fileUrl,
              fileSize: uploadResult.fileSize,
              storageKey: uploadResult.storageKey,
              mimeType: uploadResult.mimeType,
            },
          })

          return referralFile
        } else {
          // Return file info to be associated later
          return {
            fileName: uploadResult.fileName,
            fileUrl: uploadResult.fileUrl,
            fileSize: uploadResult.fileSize,
            storageKey: uploadResult.storageKey,
            mimeType: uploadResult.mimeType,
          }
        }
      })
    )

    res.status(201).json({
      success: true,
      message: 'Files uploaded successfully',
      data: {
        files: uploadedFiles,
        referralId: referralId || null,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Upload files during referral submission (handled as part of submitMagicReferral)
 * This is an alternative approach where files are uploaded in the same request
 */
export async function uploadFilesDuringSubmission(req: Request, res: Response, next: NextFunction) {
  // This would be called as middleware before submitMagicReferral
  // Files would be attached to req.files and processed in submitMagicReferral
  next()
}

