import { Router } from 'express'
import { body } from 'express-validator'
import * as publicController from '../controllers/public.controller'
import { validateRequest } from '../middleware/validation.middleware'

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

export default router

