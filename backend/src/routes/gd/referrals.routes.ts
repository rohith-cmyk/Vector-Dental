import { Router } from 'express'
import { authenticate } from '../../middleware/auth.middleware'
import {
    getMyReferrals,
    getReferralById,
    createReferral,
    updateReferral,
} from '../../controllers/gd/referrals.controller'

const router = Router()

/**
 * @route   GET /api/gd/referrals
 * @desc    Get all referrals created by this GD
 * @access  Private (GD only)
 */
router.get('/', authenticate, getMyReferrals)

/**
 * @route   GET /api/gd/referrals/:id
 * @desc    Get single referral details
 * @access  Private (GD only)
 */
router.get('/:id', authenticate, getReferralById)

/**
 * @route   POST /api/gd/referrals
 * @desc    Create a new referral to a specialist
 * @access  Private (GD only)
 */
router.post('/', authenticate, createReferral)

/**
 * @route   PUT /api/gd/referrals/:id
 * @desc    Update an existing referral (drafts only)
 * @access  Private (GD only)
 */
router.put('/:id', authenticate, updateReferral)

export default router
