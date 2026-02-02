'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout'
import { Button, Input } from '@/components/ui'

export default function SecuritySettingsPage() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  return (
    <DashboardLayout title="Security" subtitle="Manage your security settings">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-xl p-8 space-y-6">
          <h2 className="text-xl font-semibold text-neutral-900">Change Password</h2>

          <Input
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />

          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <Input
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <Button className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white w-fit">
            Update Password
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
