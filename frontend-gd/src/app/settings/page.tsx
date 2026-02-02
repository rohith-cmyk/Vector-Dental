'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Building2, Lock, Palette, Users } from 'lucide-react'
import { DashboardLayout } from '@/components/layout'
import { useAuth } from '@/contexts/AuthContext'

export default function SettingsPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  const settingsSections = [
    {
      title: 'Clinic Profile',
      description: 'Manage your clinic details and contact information',
      icon: <Building2 className="h-6 w-6 text-neutral-500" />,
      href: '/settings/clinic-profile',
    },
    {
      title: 'Security',
      description: 'Change password and manage security settings',
      icon: <Lock className="h-6 w-6 text-neutral-500" />,
      href: '/settings/security',
    },
    {
      title: 'Appearance',
      description: 'Customize theme and display preferences',
      icon: <Palette className="h-6 w-6 text-neutral-500" />,
      href: '/settings/appearance',
    },
    {
      title: 'User Profiles',
      description: 'Manage team members and user access',
      icon: <Users className="h-6 w-6 text-neutral-500" />,
      href: '/settings/user-profiles',
    },
  ]

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [isLoading, user, router])

  if (isLoading || !user) {
    return (
      <DashboardLayout title="Settings" subtitle="Loading your preferences">
        <div className="flex items-center justify-center min-h-[360px]">
          <div className="text-sm text-neutral-500">Loading...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-neutral-400 mt-2">Manage your account preferences and configurations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {settingsSections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="group flex items-center gap-4 p-6 bg-white border border-gray-200 rounded-xl hover:border-emerald-200 hover:bg-emerald-50/50 transition-all duration-200 hover:shadow-sm"
            >
              <div className="flex-shrink-0 p-2 bg-gray-50 rounded-lg group-hover:bg-emerald-100 transition-colors">
                {section.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-emerald-900 transition-colors">
                    {section.title}
                  </h3>
                </div>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  {section.description}
                </p>
              </div>
              <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
