import { Router } from 'express'
import { body } from 'express-validator'
import * as authController from '../controllers/auth.controller'
import { authenticate } from '../middleware/auth.middleware'
import { validateRequest } from '../middleware/validation.middleware'

const router = Router()

/**
 * @route   POST /api/auth/signup
 * @desc    Register new user and clinic
 * @access  Public
 */
router.post(
  '/signup',
  validateRequest([
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('name').notEmpty().withMessage('Name is required'),
    body('clinicName').notEmpty().withMessage('Clinic name is required'),
  ]),
  authController.signup
)

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  '/login',
  validateRequest([
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ]),
  authController.login
)

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', authenticate, authController.getCurrentUser)

export default router

