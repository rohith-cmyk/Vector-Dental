'use client'

import Link from 'next/link'
import { DashboardLayout } from '@/components/layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { Link as LinkIcon, User, Bell, Lock, Palette, Key } from 'lucide-react'

export default function SettingsPage() {
  const settingsSections = [
    {
      title: 'Referral Links',
      description: 'Create secure token-based referral links with access codes',
      icon: <Key className="h-6 w-6 text-purple-500" />,
      href: '/settings/referral-links',
      badge: 'New',
    },
    // Disabled: Referral Link (singular) - not currently in use
    // {
    //   title: 'Referral Link',
    //   description: 'Manage your public referral link and share it with other clinics',
    //   icon: <LinkIcon className="h-6 w-6 text-brand-500" />,
    //   href: '/settings/referral-link',
    // },
    {
      title: 'Profile Settings',
      description: 'Update your personal information and preferences',
      icon: <User className="h-6 w-6 text-blue-500" />,
      href: '/settings/profile',
    },
    {
      title: 'Notifications',
      description: 'Configure email and in-app notification preferences',
      icon: <Bell className="h-6 w-6 text-purple-500" />,
      href: '/settings/notifications',
    },
    {
      title: 'Security',
      description: 'Change password and manage security settings',
      icon: <Lock className="h-6 w-6 text-red-500" />,
      href: '/settings/security',
    },
    {
      title: 'Appearance',
      description: 'Customize theme and display preferences',
      icon: <Palette className="h-6 w-6 text-pink-500" />,
      href: '/settings/appearance',
    },
  ]

  return (
    <DashboardLayout title="Settings">
      <div className="max-w-4xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {settingsSections.map((section) => (
                <Link
                  key={section.href}
                  href={section.href}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-brand-500 hover:bg-brand-50 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      {section.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        {section.title}
                        {section.badge && (
                          <span className="px-2 py-0.5 text-xs bg-brand-100 text-brand-700 rounded-full">
                            {section.badge}
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-600 mt-0.5">
                        {section.description}
                      </p>
                    </div>
                  </div>
                  <svg className="h-5 w-5 text-gray-400 group-hover:text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

