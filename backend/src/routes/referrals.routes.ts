import { Router } from 'express'
import { body } from 'express-validator'
import multer from 'multer'
import * as referralsController from '../controllers/referrals.controller'
import { authenticateSupabase } from '../middleware/auth.supabase.middleware'
import { validateRequest } from '../middleware/validation.middleware'

const router = Router()
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
})

// All routes require authentication
router.use(authenticateSupabase)

/**
 * @route   GET /api/referrals
 * @desc    Get all referrals
 * @access  Private
 */
router.get('/', referralsController.getAllReferrals)

/**
 * @route   POST /api/referrals
 * @desc    Create new referral
 * @access  Private
 */
router.post(
  '/',
  validateRequest([
    body('contactId').notEmpty().withMessage('Contact is required'),
    body('patientName').notEmpty().withMessage('Patient name is required'),
    body('patientDob').isISO8601().withMessage('Valid date of birth is required'),
    body('reason').notEmpty().withMessage('Reason is required'),
    body('urgency').optional().isIn(['ROUTINE', 'URGENT', 'EMERGENCY']).withMessage('Invalid urgency'),
  ]),
  referralsController.createReferral
)

/**
 * @route   POST /api/referrals/:id/share
 * @desc    Share referral - Generate share token and send email
 * @access  Private
 */
router.post('/:id/share', referralsController.shareReferral)

/**
 * @route   PATCH /api/referrals/:id/status
 * @desc    Update referral status
 * @access  Private
 */
router.patch(
  '/:id/status',
  validateRequest([
    body('status')
      .isIn(['DRAFT', 'SENT', 'SUBMITTED', 'ACCEPTED', 'COMPLETED', 'CANCELLED'])
      .withMessage('Invalid status'),
  ]),
  referralsController.updateReferralStatus
)

/**
 * @route   POST /api/referrals/:id/ops-report
 * @desc    Submit ops report with attachments
 * @access  Private
 */
router.post(
  '/:id/ops-report',
  upload.array('files'),
  referralsController.submitOperativeReport
)


/**
 * @route   GET /api/referrals/:id
 * @desc    Get referral by ID
 * @access  Private
 */
router.get('/:id', referralsController.getReferralById)

/**
 * @route   PUT /api/referrals/:id
 * @desc    Update referral
 * @access  Private
 */
router.put('/:id', referralsController.updateReferral)

/**
 * @route   DELETE /api/referrals/:id
 * @desc    Delete referral
 * @access  Private
 */
router.delete('/:id', referralsController.deleteReferral)

export default router

