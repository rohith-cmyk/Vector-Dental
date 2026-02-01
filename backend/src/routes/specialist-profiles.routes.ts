import { Router } from 'express'
import { body } from 'express-validator'
import multer from 'multer'
import { authenticateSupabase } from '../middleware/auth.supabase.middleware'
import { validateRequest } from '../middleware/validation.middleware'
import * as specialistProfilesController from '../controllers/specialist-profiles.controller'

const router = Router()
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
})

router.use(authenticateSupabase)

/**
 * @route   GET /api/specialist-profiles
 * @desc    Get specialist profiles for current clinic
 * @access  Private
 */
router.get('/', specialistProfilesController.getSpecialistProfiles)

/**
 * @route   POST /api/specialist-profiles
 * @desc    Create specialist profile for current clinic
 * @access  Private
 */
router.post(
  '/',
  validateRequest([
    body('fullName').notEmpty().withMessage('Full name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('role').notEmpty().withMessage('Role is required'),
  ]),
  specialistProfilesController.createSpecialistProfile
)

/**
 * @route   PUT /api/specialist-profiles/:id
 * @desc    Update specialist profile for current clinic
 * @access  Private
 */
router.put(
  '/:id',
  validateRequest([
    body('fullName').notEmpty().withMessage('Full name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('role').notEmpty().withMessage('Role is required'),
  ]),
  specialistProfilesController.updateSpecialistProfile
)

/**
 * @route   DELETE /api/specialist-profiles/:id
 * @desc    Delete specialist profile for current clinic
 * @access  Private
 */
router.delete('/:id', specialistProfilesController.deleteSpecialistProfile)

/**
 * @route   POST /api/specialist-profiles/:id/photo
 * @desc    Upload specialist photo
 * @access  Private
 */
router.post(
  '/:id/photo',
  upload.single('photo'),
  specialistProfilesController.uploadSpecialistPhotoForProfile
)

export default router
