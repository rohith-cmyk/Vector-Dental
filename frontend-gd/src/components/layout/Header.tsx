'use client'

import { type ReactNode, useEffect, useState } from 'react'
import { Bell, ChevronDown, LogOut, Building2, User, Check } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { notificationService } from '@/services/api'
import type { NotificationItem } from '@/types'

interface HeaderProps {
  title: string
  subtitle?: string
  actions?: ReactNode
}

export function Header({ title, subtitle, actions }: HeaderProps) {
  const { user, clinic, logout } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    notificationService
      .getUnreadCount()
      .then((response) => setUnreadCount(response.data.count || 0))
      .catch(() => setUnreadCount(0))
  }, [])

  const loadNotifications = async () => {
    try {
      const response = await notificationService.getNotifications('unread')
      setNotifications(response.data || [])
    } catch {
      setNotifications([])
    }
  }

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead()
    setUnreadCount(0)
    setNotifications([])
    setNotificationsOpen(false)
  }

  const handleLogout = () => {
    logout()
    window.location.href = '/login'
  }

  return (
    <header className="top-0 z-30 flex min-h-16 items-center justify-between gap-4 px-8 pt-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold text-neutral-700 truncate">{title}</h1>
        {subtitle && <p className="text-sm text-neutral-400 mt-1 truncate pb-4">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {actions && <div className="flex items-center gap-3">{actions}</div>}
        <div className="relative">
          <button
            onClick={async () => {
              const nextOpen = !notificationsOpen
              setNotificationsOpen(nextOpen)
              if (nextOpen) {
                await loadNotifications()
              }
            }}
            className="relative flex items-center justify-center rounded-full h-10 w-10 hover:bg-neutral-100 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5 text-neutral-500" strokeWidth={1.5} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-semibold rounded-full h-5 min-w-[20px] px-1.5 flex items-center justify-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setNotificationsOpen(false)} />
              <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-lg bg-white border border-black/10 shadow-lg z-20">
                <div className="flex items-center justify-between px-4 py-3 border-b border-black/10">
                  <p className="text-sm font-semibold text-neutral-800">Notifications</p>
                  {notifications.length > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-emerald-600 hover:text-emerald-700"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-sm text-neutral-500 text-center">
                      No new notifications
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div key={notif.id} className="px-4 py-3 border-b border-neutral-100">
                        <div className="flex items-start gap-2">
                          <div className="mt-1 h-6 w-6 rounded-full bg-emerald-50 flex items-center justify-center">
                            <Check className="h-3 w-3 text-emerald-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-neutral-800">{notif.title}</p>
                            <p className="text-xs text-neutral-500 mt-1">{notif.message}</p>
                            <p className="text-[11px] text-neutral-400 mt-1">
                              {new Date(notif.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-neutral-100 transition-colors"
          >
            <img src="/logo.png" alt="User" className="h-8 w-8 rounded-full object-cover" />
            <ChevronDown className="h-4 w-4 text-neutral-400" strokeWidth={1.5} />
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-lg bg-white border border-black/10 shadow-lg z-20">
                <div className="px-4 py-3 border-b border-black/10">
                  {user ? (
                    <>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-neutral-400" strokeWidth={1.5} />
                        <p className="text-sm font-medium text-neutral-800">{user.name}</p>
                      </div>
                      <p className="text-xs text-neutral-400 mt-1">{user.email}</p>
                      {clinic && (
                        <div className="flex items-center gap-2 mt-2">
                          <Building2 className="h-4 w-4 text-neutral-400" strokeWidth={1.5} />
                          <p className="text-xs text-neutral-500">{clinic.name}</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-neutral-500">Not logged in</p>
                  )}
                </div>

                <div className="border-t border-black/10 py-1">
                  <button
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 text-red-400" strokeWidth={1.5} />
                    Logout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
