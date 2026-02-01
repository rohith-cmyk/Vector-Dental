'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent } from '@/components/ui'

export default function SettingsPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

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
    <DashboardLayout title="Settings" subtitle="Manage your account">
      <Card>
        <CardContent className="py-10 text-center text-sm text-neutral-500">
          Settings page coming soon.
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
