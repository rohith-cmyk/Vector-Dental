import { Router } from 'express'
import { body } from 'express-validator'
import * as contactsController from '../controllers/contacts.controller'
import { authenticate } from '../middleware/auth.middleware'
import { validateRequest } from '../middleware/validation.middleware'

const router = Router()

// All routes require authentication
router.use(authenticate)

/**
 * @route   GET /api/contacts
 * @desc    Get all contacts
 * @access  Private
 */
router.get('/', contactsController.getAllContacts)

/**
 * @route   GET /api/contacts/:id
 * @desc    Get contact by ID
 * @access  Private
 */
router.get('/:id', contactsController.getContactById)

/**
 * @route   POST /api/contacts
 * @desc    Create new contact
 * @access  Private
 */
router.post(
  '/',
  validateRequest([
    body('name').notEmpty().withMessage('Name is required'),
    body('specialty').notEmpty().withMessage('Specialty is required'),
    body('phone').notEmpty().withMessage('Phone is required'),
    body('email').isEmail().withMessage('Valid email is required'),
  ]),
  contactsController.createContact
)

/**
 * @route   PUT /api/contacts/:id
 * @desc    Update contact
 * @access  Private
 */
router.put(
  '/:id',
  validateRequest([
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('specialty').optional().notEmpty().withMessage('Specialty cannot be empty'),
    body('phone').optional().notEmpty().withMessage('Phone cannot be empty'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
  ]),
  contactsController.updateContact
)

/**
 * @route   DELETE /api/contacts/:id
 * @desc    Delete contact
 * @access  Private
 */
router.delete('/:id', contactsController.deleteContact)

export default router

