'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout'
import { Card, CardContent, Badge, Button, LoadingState } from '@/components/ui'
import { Bell, CheckCheck, Trash2, ArrowDownLeft, CheckCircle, XCircle } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'
import { notificationsService } from '@/services/notifications.service'
import { getCachedData, setCachedData, clearCache } from '@/lib/cache'
import type { Notification } from '@/types'

export default function NotificationsPage() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const cacheKey = `notifications_${filter}`
  const cacheTtl = 2 * 60 * 1000

  // Load notifications
  useEffect(() => {
    const cached = getCachedData<Notification[]>(cacheKey)
    if (cached) {
      setNotifications(cached)
      setLoading(false)
      loadNotifications(false)
      return
    }

    loadNotifications(true)
  }, [filter])

  const loadNotifications = async (showLoading: boolean = true) => {
    try {
      if (showLoading) {
        setLoading(true)
      }
      setError(null)
      const data = await notificationsService.getAll(filter)
      setNotifications(data)
      setCachedData(cacheKey, data, cacheTtl)
    } catch (err) {
      console.error('Failed to load notifications:', err)
      setError(err instanceof Error ? err.message : 'Failed to load notifications')
    } finally {
      if (showLoading) {
        setLoading(false)
      }
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length
  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.isRead)
    : notifications

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsService.markAsRead(id)
      // Update local state optimistically
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
      clearCache('notifications_all')
      clearCache('notifications_unread')
    } catch (err) {
      console.error('Failed to mark as read:', err)
      // Reload to sync with server
      loadNotifications()
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsService.markAllAsRead()
      // Update local state optimistically
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      clearCache('notifications_all')
      clearCache('notifications_unread')
    } catch (err) {
      console.error('Failed to mark all as read:', err)
      // Reload to sync with server
      loadNotifications()
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await notificationsService.delete(id)
      // Update local state optimistically
      setNotifications(prev => prev.filter(n => n.id !== id))
      clearCache('notifications_all')
      clearCache('notifications_unread')
    } catch (err) {
      console.error('Failed to delete notification:', err)
      // Reload to sync with server
      loadNotifications()
    }
  }

  const extractClinicName = (message: string): string | null => {
    const match = message.match(/from\s+(.+?)(?:\s+for\b|$)/i)
    return match?.[1]?.trim() || null
  }

  const getDisplayTitle = (notification: Notification): string => {
    if (notification.type === 'new_incoming_referral') {
      return extractClinicName(notification.message) || notification.title
    }
    return notification.title
  }

  const getDisplayMessage = (notification: Notification): string => {
    if (notification.type === 'new_incoming_referral') {
      return notification.message.replace(/from\s+(.+?)(?:\s+for\b|$)/i, '').trim()
    }
    return notification.message
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_incoming_referral':
        return <ArrowDownLeft className="h-5 w-5 text-blue-500" />
      case 'referral_accepted':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'referral_rejected':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'referral_completed':
        return <CheckCheck className="h-5 w-5 text-purple-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <DashboardLayout title="Notifications">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'all'
                ? 'bg-brand-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'unread'
                ? 'bg-brand-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="gap-2"
            >
              <CheckCheck className="h-4 w-4" />
              Mark All as Read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <LoadingState
                className="py-12"
                title="Loading notifications..."
                subtitle="Checking for new updates"
              />
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-red-500 mb-2">{error}</p>
                <Button variant="outline" size="sm" onClick={() => loadNotifications(true)}>
                  Try Again
                </Button>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Bell className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-500">No notifications</p>
                <p className="text-sm text-gray-400">You&apos;re all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${!notification.isRead ? 'bg-blue-50' : ''
                      }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-sm font-semibold text-gray-900">
                              {getDisplayTitle(notification)}
                              {!notification.isRead && (
                                <span className="ml-2 inline-block h-2 w-2 rounded-full bg-blue-500"></span>
                              )}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {getDisplayMessage(notification)}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              {formatRelativeTime(notification.createdAt)}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            {!notification.isRead && (
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="p-2 text-gray-600 hover:text-brand-600 hover:bg-white rounded-lg transition-colors"
                                title="Mark as read"
                              >
                                <CheckCheck className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(notification.id)}
                              className="p-2 text-gray-600 hover:text-red-600 hover:bg-white rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* View Referral Link */}
                        {notification.referralId && (
                          <button
                            onClick={async () => {
                              const referralId = notification.referralId
                              if (referralId) {
                                setNotifications((prev) => prev.filter((n) => n.referralId !== referralId))
                                await notificationsService.deleteByReferral(referralId)
                                clearCache('notifications_all')
                                clearCache('notifications_unread')
                              }
                              window.location.href = `/referrals?id=${notification.referralId}`
                            }}
                            className="mt-2 text-sm text-brand-600 hover:text-brand-700 font-medium"
                          >
                            View Referral →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

