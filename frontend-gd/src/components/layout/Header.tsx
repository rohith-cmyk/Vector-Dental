'use client'

import { type ReactNode, useState } from 'react'
import { ChevronDown, LogOut, Building2, User } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface HeaderProps {
  title: string
  subtitle?: string
  actions?: ReactNode
}

export function Header({ title, subtitle, actions }: HeaderProps) {
  const { user, clinic, logout } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)

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
