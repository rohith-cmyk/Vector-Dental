import { Router } from 'express'
import { body } from 'express-validator'
import * as magicReferralLinkController from '../controllers/magic-referral-link.controller'
import { validateRequest } from '../middleware/validation.middleware'
import { authenticateSupabase } from '../middleware/auth.supabase.middleware'

const router = Router()

// All routes require authentication
router.use(authenticateSupabase)

/**
 * Referral Link routes (authenticated - specialist only)
 */

/**
 * @route   POST /api/referral-links
 * @desc    Create a new referral link with access code
 * @access  Private (authenticated specialist)
 */
router.post(
  '/',
  validateRequest([
    body('label').optional().isString().trim().isLength({ max: 100 }).withMessage('Label must be less than 100 characters'),
  ]),
  magicReferralLinkController.createReferralLink
)

/**
 * @route   GET /api/referral-links
 * @desc    Get all referral links for the logged-in specialist
 * @access  Private (authenticated specialist)
 */
router.get('/', magicReferralLinkController.listReferralLinks)

/**
 * @route   GET /api/referral-links/:id
 * @desc    Get a specific referral link by ID
 * @access  Private (authenticated specialist)
 */
router.get('/:id', magicReferralLinkController.getReferralLink)

/**
 * @route   PUT /api/referral-links/:id
 * @desc    Update a referral link (toggle active, update label, regenerate access code)
 * @access  Private (authenticated specialist)
 */
router.put(
  '/:id',
  validateRequest([
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
    body('label').optional().isString().trim().isLength({ max: 100 }).withMessage('Label must be less than 100 characters'),
    body('regenerateAccessCode').optional().isBoolean().withMessage('regenerateAccessCode must be a boolean'),
  ]),
  magicReferralLinkController.updateReferralLink
)

/**
 * @route   DELETE /api/referral-links/:id
 * @desc    Delete a referral link
 * @access  Private (authenticated specialist)
 */
router.delete('/:id', magicReferralLinkController.deleteReferralLink)

export default router
