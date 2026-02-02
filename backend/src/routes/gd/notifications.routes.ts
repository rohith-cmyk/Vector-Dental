import { Router } from 'express'
import { authenticate } from '../../middleware/auth.middleware'
import {
  getNotifications,
  getUnreadCount,
  markAllAsRead,
  markAsRead,
} from '../../controllers/gd/notifications.controller'

const router = Router()

/**
 * @route   GET /api/gd/notifications
 * @desc    Get notifications for clinic
 * @access  Private (GD only)
 */
router.get('/', authenticate, getNotifications)

/**
 * @route   GET /api/gd/notifications/unread-count
 * @desc    Get unread notification count
 * @access  Private (GD only)
 */
router.get('/unread-count', authenticate, getUnreadCount)

/**
 * @route   PATCH /api/gd/notifications/mark-all-read
 * @desc    Mark all notifications as read
 * @access  Private (GD only)
 */
router.patch('/mark-all-read', authenticate, markAllAsRead)

/**
 * @route   PATCH /api/gd/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private (GD only)
 */
router.patch('/:id/read', authenticate, markAsRead)

export default router
