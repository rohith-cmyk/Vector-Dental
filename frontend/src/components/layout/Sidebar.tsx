'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Referrals', href: '/referrals', icon: FileText },
  { name: 'Doctors Network', href: '/contacts', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar-white p-4">
      <div className="flex h-full flex-col border border-black/10 rounded-2xl bg-white">
        {/* Logo */}
        <div className="flex flex-col gap-3 px-6 py-12">
          <img 
            src="/logo.png" 
            alt="Logo" 
            className="h-14 w-14 object-contain"
          />
          <span className="text-md font-bold text-neutral-700 leading-normal">Dental Referral</span>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-neutral-200 text-neutral-900'
                    : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'
                )}
              >
                <Icon className="h-4 w-4 text-neutral-500" strokeWidth={1.5}  />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}

