import { Router } from 'express'
import { body } from 'express-validator'
import * as referralLinkController from '../controllers/referral-link.controller'
import { validateRequest } from '../middleware/validation.middleware'

const router = Router()

/**
 * @route   GET /api/referral-link
 * @desc    Get referral link for clinic
 * @access  Private (or public for demo user)
 */
router.get('/', referralLinkController.getReferralLink)

/**
 * @route   PUT /api/referral-link
 * @desc    Update referral link (toggle active/inactive, update slug)
 * @access  Private
 */
router.put(
  '/',
  validateRequest([
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
    body('slug').optional().isString().trim().isLength({ min: 3, max: 50 }).withMessage('Slug must be between 3 and 50 characters'),
  ]),
  referralLinkController.updateReferralLink
)

export default router

