import { Router } from 'express'
import { body } from 'express-validator'
import multer from 'multer'
import * as publicController from '../controllers/public.controller'
import { validateRequest } from '../middleware/validation.middleware'
import { config } from '../config/env'

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
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

const router = Router()

/**
 * Public routes (no authentication required)
 */

/**
 * @route   GET /api/public/clinic/:slug
 * @desc    Get clinic info by slug for public referral form
 * @access  Public
 */
router.get('/clinic/:slug', publicController.getClinicBySlug)

/**
 * @route   POST /api/public/referral/:slug
 * @desc    Submit public referral form
 * @access  Public
 */
router.post(
  '/referral/:slug',
  validateRequest([
    body('fromClinicName').notEmpty().withMessage('Your clinic name is required'),
    body('fromClinicEmail').isEmail().withMessage('Valid email is required'),
    body('referringDentist').notEmpty().withMessage('Referring dentist name is required'),
    body('patientName').notEmpty().withMessage('Patient name is required'),
    body('patientDob').notEmpty().withMessage('Patient date of birth is required'),
    body('reason').notEmpty().withMessage('Reason for referral is required'),
    body('urgency').optional().isIn(['ROUTINE', 'URGENT', 'EMERGENCY', 'routine', 'urgent', 'emergency']).withMessage('Invalid urgency level'),
  ]),
  publicController.submitPublicReferral
)

/**
 * @route   GET /api/public/referral-link/:token
 * @desc    Get referral link info by token (public)
 * @access  Public
 */
router.get('/referral-link/:token', publicController.getReferralLinkByToken)

/**
 * @route   POST /api/public/referral-link/:token/verify
 * @desc    Verify access code for a referral link
 * @access  Public
 */
router.post(
  '/referral-link/:token/verify',
  validateRequest([
    body('accessCode').notEmpty().matches(/^\d{4,8}$/).withMessage('Access code must be 4-8 digits'),
  ]),
  publicController.verifyReferralLinkAccessCode
)

/**
 * @route   POST /api/public/referral-link/:token/submit
 * @desc    Submit referral via magic link (requires access code)
 * @access  Public
 * @note    Accepts multipart/form-data for file uploads
 */
router.post(
  '/referral-link/:token/submit',
  // Multer must come FIRST to parse multipart/form-data and populate req.body
  upload.array('files', 10),
  // Then validate - multer will have already parsed req.body
  validateRequest([
    body('accessCode').notEmpty().matches(/^\d{4,8}$/).withMessage('Access code must be 4-8 digits'),
    body('patientFirstName').notEmpty().trim().withMessage('Patient first name is required'),
    body('patientLastName').notEmpty().trim().withMessage('Patient last name is required'),
    body('gpClinicName').notEmpty().trim().withMessage('GP clinic name is required'),
    body('submittedByName').notEmpty().trim().withMessage('Submitted by name is required'),
    body('reasonForReferral').notEmpty().trim().withMessage('Reason for referral is required'),
    body('patientDob').notEmpty().isISO8601().withMessage('Patient date of birth is required and must be a valid date'),
    body('insurance').optional().trim(),
    body('submittedByPhone').optional().trim(),
    body('notes').optional().trim(),
  ]),
  publicController.submitMagicReferral
)


export default router

