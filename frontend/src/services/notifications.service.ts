import { api } from '@/lib/api'
import type { Notification } from '@/types'

/**
 * Notifications Service
 */
export const notificationsService = {
  /**
   * Get all notifications
   */
  async getAll(filter: 'all' | 'unread' = 'all'): Promise<Notification[]> {
    try {
      const response = await api.get<{ success: boolean; data: Notification[] }>(
        `/notifications?filter=${filter}`
      )

      if (response.data.success && response.data.data) {
        return response.data.data
      }

      return []
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      throw error
    }
  },

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<number> {
    try {
      const response = await api.get<{ success: boolean; data: { count: number } }>(
        '/notifications/unread-count'
      )

      if (response.data.success && response.data.data) {
        return response.data.data.count
      }

      return 0
    } catch (error) {
      console.error('Failed to fetch unread count:', error)
      return 0
    }
  },

  /**
   * Mark notification as read
   */
  async markAsRead(id: string): Promise<void> {
    try {
      await api.patch(`/notifications/${id}/read`)
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
      throw error
    }
  },

  /**
   * Mark notification as read by referral ID
   */
  async markAsReadByReferral(referralId: string): Promise<void> {
    try {
      await api.patch(`/notifications/referral/${referralId}/read`)
    } catch (error) {
      console.error('Failed to mark notification as read by referral:', error)
      // Don't throw, just log - this is a background action
    }
  },

  /**
   * Delete notifications by referral ID
   */
  async deleteByReferral(referralId: string): Promise<void> {
    try {
      await api.delete(`/notifications/referral/${referralId}`)
    } catch (error) {
      console.error('Failed to delete notifications by referral:', error)
      // Don't throw, just log - this is a background action
    }
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    try {
      await api.patch('/notifications/mark-all-read')
    } catch (error) {
      console.error('Failed to mark all as read:', error)
      throw error
    }
  },

  /**
   * Delete notification
   */
  async delete(id: string): Promise<void> {
    try {
      await api.delete(`/notifications/${id}`)
    } catch (error) {
      console.error('Failed to delete notification:', error)
      throw error
    }
  },
}

