import { Router } from 'express'
import { body } from 'express-validator'
import multer from 'multer'
import * as publicController from '../controllers/public.controller'
import { validateRequest } from '../middleware/validation.middleware'

const router = Router()

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
})

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
 * @desc    Submit referral via referral link
 * @access  Public
 */
router.post(
  '/referral-link/:token/submit',
  upload.array('files', 10), // Accept up to 10 files
  validateRequest([
    body('patientFirstName').notEmpty().withMessage('Patient first name is required'),
    body('patientLastName').notEmpty().withMessage('Patient last name is required'),
    body('gpClinicName').notEmpty().withMessage('GP clinic name is required'),
    body('submittedByName').notEmpty().withMessage('Submitted by name is required'),
    body('reasonForReferral').notEmpty().withMessage('Reason for referral is required'),
    body('patientDob').optional().isISO8601().withMessage('Patient date of birth must be a valid date'),
    body('insurance').optional().isString().trim(),
    body('submittedByPhone').optional().isString().trim(),
    body('notes').optional().isString().trim(),
  ]),
  publicController.submitReferral
)

export default router

