import { Router } from 'express'
import { body } from 'express-validator'
import * as referralsController from '../controllers/referrals.controller'
import { authenticate } from '../middleware/auth.middleware'
import { validateRequest } from '../middleware/validation.middleware'

const router = Router()

// All routes require authentication
router.use(authenticate)

/**
 * @route   GET /api/referrals
 * @desc    Get all referrals
 * @access  Private
 */
router.get('/', referralsController.getAllReferrals)

/**
 * @route   GET /api/referrals/:id
 * @desc    Get referral by ID
 * @access  Private
 */
router.get('/:id', referralsController.getReferralById)

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
 * @route   PUT /api/referrals/:id
 * @desc    Update referral
 * @access  Private
 */
router.put('/:id', referralsController.updateReferral)

/**
 * @route   PATCH /api/referrals/:id/status
 * @desc    Update referral status
 * @access  Private
 */
router.patch(
  '/:id/status',
  validateRequest([
    body('status')
      .isIn(['DRAFT', 'SENT', 'ACCEPTED', 'COMPLETED', 'CANCELLED'])
      .withMessage('Invalid status'),
  ]),
  referralsController.updateReferralStatus
)

/**
 * @route   DELETE /api/referrals/:id
 * @desc    Delete referral
 * @access  Private
 */
router.delete('/:id', referralsController.deleteReferral)

export default router

