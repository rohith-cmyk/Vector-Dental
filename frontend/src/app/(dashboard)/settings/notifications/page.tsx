'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout'
import { Card, CardContent, Button } from '@/components/ui'

const SOUND_PREF_KEY = 'notification_sound_enabled'

export default function NotificationSettingsPage() {
  const [soundEnabled, setSoundEnabled] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem(SOUND_PREF_KEY)
    if (stored !== null) {
      setSoundEnabled(stored === 'true')
    }
  }, [])

  const handleToggle = () => {
    const nextValue = !soundEnabled
    setSoundEnabled(nextValue)
    localStorage.setItem(SOUND_PREF_KEY, String(nextValue))
  }

  return (
    <DashboardLayout title="Notification Settings">
      <div className="max-w-3xl space-y-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Sounds</h2>
            <p className="text-sm text-gray-600">
              Play a sound when a new notification arrives.
            </p>
            <Button variant={soundEnabled ? 'primary' : 'outline'} onClick={handleToggle}>
              {soundEnabled ? 'Sounds Enabled' : 'Sounds Disabled'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
