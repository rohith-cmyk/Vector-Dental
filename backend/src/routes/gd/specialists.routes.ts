import { Router } from 'express'
import { authenticate } from '../../middleware/auth.middleware'
import {
    getSpecialistDirectory,
    getSpecialistProfile,
} from '../../controllers/gd/specialist-directory.controller'

const router = Router()

/**
 * @route   GET /api/gd/specialists
 * @desc    Get list of all specialists
 * @access  Private (GD only)
 */
router.get('/', authenticate, getSpecialistDirectory)

/**
 * @route   GET /api/gd/specialists/:id
 * @desc    Get specialist profile details
 * @access  Private (GD only)
 */
router.get('/:id', authenticate, getSpecialistProfile)

export default router
