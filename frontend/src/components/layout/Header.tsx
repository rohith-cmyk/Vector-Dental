'use client'

import { useState } from 'react'
import { ChevronDown, LogOut, User, Settings, Bell } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HeaderProps {
  title: string
}

export function Header({ title }: HeaderProps) {
  // Mock user for development
  const user = {
    name: 'Demo User',
    email: 'demo@clinic.com',
    clinic: { name: 'Demo Dental Clinic' }
  }
  const [dropdownOpen, setDropdownOpen] = useState(false)
  
  const handleLogout = () => {
    window.location.href = '/login'
  }
  
  // Mock notifications
  const unreadCount = 3

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-8">
      <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
      
      <div className="flex items-center gap-4">
        {/* Notifications Bell */}
        <button 
          onClick={() => window.location.href = '/notifications'}
          className="relative p-2 text-gray-600 hover:text-brand-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-medium">
              {unreadCount}
            </span>
          )}
        </button>
        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-100 transition-colors"
          >
            <img 
              src="/logo.png" 
              alt="User" 
              className="h-8 w-8 rounded-full object-cover"
            />
            <ChevronDown className="h-4 w-4 text-gray-600" />
          </button>
          
          {dropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-20">
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                  <p className="text-xs text-gray-400 mt-1">{user?.clinic?.name}</p>
                </div>
                
                <div className="py-1">
                  <button
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      setDropdownOpen(false)
                      window.location.href = '/profile'
                    }}
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </button>
                  <button
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      setDropdownOpen(false)
                      window.location.href = '/settings'
                    }}
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </button>
                </div>
                
                <div className="border-t border-gray-200 py-1">
                  <button
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
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

