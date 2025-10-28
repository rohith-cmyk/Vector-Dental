'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout'
import { Card, CardContent, Badge, Button } from '@/components/ui'
import { Bell, CheckCheck, Trash2, ArrowDownLeft, CheckCircle, XCircle } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'
import type { Notification } from '@/types'

export default function NotificationsPage() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  // Mock notifications
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 'notif-1',
      clinicId: 'clinic-1',
      type: 'new_incoming_referral',
      referralId: 'ref-1',
      title: 'New Incoming Referral',
      message: 'Oak Street Dental referred patient John Doe for orthodontic evaluation (URGENT)',
      isRead: false,
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 min ago
    },
    {
      id: 'notif-2',
      clinicId: 'clinic-1',
      type: 'referral_accepted',
      referralId: 'ref-2',
      title: 'Referral Accepted',
      message: 'Dr. Brian Fred M. accepted your referral for patient Bob Wilson',
      isRead: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    },
    {
      id: 'notif-3',
      clinicId: 'clinic-1',
      type: 'new_incoming_referral',
      referralId: 'ref-3',
      title: 'New Incoming Referral',
      message: 'Pine Dental Clinic referred patient Jane Smith for wisdom tooth removal',
      isRead: false,
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    },
    {
      id: 'notif-4',
      clinicId: 'clinic-1',
      type: 'referral_completed',
      referralId: 'ref-4',
      title: 'Referral Completed',
      message: 'Dr. Courtney Henry completed treatment for patient Alice Brown',
      isRead: true,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    },
  ])

  const unreadCount = notifications.filter(n => !n.isRead).length
  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.isRead)
    : notifications

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
  }

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }

  const handleDelete = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
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
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-brand-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'unread'
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
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Bell className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-500">No notifications</p>
                <p className="text-sm text-gray-400">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      !notification.isRead ? 'bg-blue-50' : ''
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
                              {notification.title}
                              {!notification.isRead && (
                                <span className="ml-2 inline-block h-2 w-2 rounded-full bg-blue-500"></span>
                              )}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
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
                            onClick={() => alert(`View referral ${notification.referralId}`)}
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

