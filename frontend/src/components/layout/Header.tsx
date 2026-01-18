'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, LogOut, User, Settings, Bell } from 'lucide-react'
import { cn } from '@/lib/utils'
import { notificationsService } from '@/services/notifications.service'
import { authService } from '@/services/auth.supabase.service'
import type { User as UserType } from '@/types'

interface HeaderProps {
  title: string
}

export function Header({ title }: HeaderProps) {
  const [user, setUser] = useState<UserType | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  
  // Load user data on mount
  useEffect(() => {
    loadUser()
  }, [])
  
  // Load unread count
  useEffect(() => {
    loadUnreadCount()
    // Refresh every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])
  
  const loadUser = async () => {
    try {
      // Check if token exists first
      const token = localStorage.getItem('auth_token')
      if (!token) {
        console.warn('No auth token found')
        setUser(null)
        return
      }
      
      const currentUser = await authService.getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
      } else {
        // If getCurrentUser returns null, token might be invalid
        console.warn('getCurrentUser returned null - token might be invalid')
        setUser(null)
      }
    } catch (error) {
      console.error('Failed to load user:', error)
      setUser(null)
    }
  }
  
  const loadUnreadCount = async () => {
    try {
      const count = await notificationsService.getUnreadCount()
      setUnreadCount(count)
    } catch (error) {
      console.error('Failed to load unread count:', error)
    }
  }
  
  const handleLogout = async () => {
    await authService.logout()
    window.location.href = '/login'
  }

  return (
    <header className="top-0 z-30 flex h-16 items-center justify-between px-8 pt-8">
      <h1 className="text-2xl font-bold text-neutral-700">{title}</h1>

      <div className="flex items-center gap-3">
        {/* Notifications Bell */}
        <button
          onClick={() => window.location.href = '/notifications'}
          className="relative p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-800 rounded-lg transition-colors"
          title="Notifications"
        >
          <Bell className="h-4 w-4" strokeWidth={1.5} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-medium">
              {unreadCount}
            </span>
          )}
        </button>
        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-neutral-100 transition-colors"
          >
            <img
              src="/logo.png"
              alt="User"
              className="h-8 w-8 rounded-full object-cover"
            />
            <ChevronDown className="h-4 w-4 text-neutral-400" strokeWidth={1.5} />
          </button>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-lg bg-white border border-black/10 shadow-lg z-20">
                <div className="px-4 py-3 border-b border-black/10">
                  {user ? (
                    <>
                      <p className="text-sm font-medium text-neutral-800">{user.name}</p>
                      <p className="text-xs text-neutral-400">{user.email}</p>
                      {user.clinic && (
                        <p className="text-xs text-neutral-500 mt-1">{user.clinic.name}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-neutral-500">Not logged in</p>
                  )}
                </div>

                <div className="py-1">
                  <button
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-100"
                    onClick={() => {
                      setDropdownOpen(false)
                      window.location.href = '/profile'
                    }}
                  >
                    <User className="h-4 w-4 text-neutral-400" strokeWidth={1.5} />
                    Profile
                  </button>
                  <button
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-100"
                    onClick={() => {
                      setDropdownOpen(false)
                      window.location.href = '/settings'
                    }}
                  >
                    <Settings className="h-4 w-4 text-neutral-400" strokeWidth={1.5} />
                    Settings
                  </button>
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

