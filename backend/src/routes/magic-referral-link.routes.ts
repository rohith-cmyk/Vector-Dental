import { Router } from 'express'
import { body } from 'express-validator'
import * as magicReferralLinkController from '../controllers/magic-referral-link.controller'
import { validateRequest } from '../middleware/validation.middleware'
import { authenticateSupabase } from '../middleware/auth.supabase.middleware'

const router = Router()

// All routes require authentication
router.use(authenticateSupabase)

/**
 * @route   POST /api/magic-referral-links
 * @desc    Create a new magic referral link
 * @access  Private
 */
router.post(
  '/',
  validateRequest([
    body('label').optional().isString().trim().isLength({ max: 100 }).withMessage('Label must be less than 100 characters'),
    body('accessCode').optional().matches(/^\d{4,8}$/).withMessage('Access code must be 4-8 digits'),
  ]),
  magicReferralLinkController.createReferralLink
)

/**
 * @route   GET /api/magic-referral-links
 * @desc    List all referral links for the authenticated specialist
 * @access  Private
 */
router.get('/', magicReferralLinkController.listReferralLinks)

/**
 * @route   GET /api/magic-referral-links/:id
 * @desc    Get a single referral link by ID
 * @access  Private
 */
router.get('/:id', magicReferralLinkController.getReferralLink)

/**
 * @route   PUT /api/magic-referral-links/:id
 * @desc    Update a referral link (toggle active, update label, regenerate access code)
 * @access  Private
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
 * @route   DELETE /api/magic-referral-links/:id
 * @desc    Delete a referral link
 * @access  Private
 */
router.delete('/:id', magicReferralLinkController.deleteReferralLink)

export default router
