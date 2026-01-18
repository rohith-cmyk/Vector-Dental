'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout'
import { Button, Card, CardContent, Input } from '@/components/ui'
import { authService } from '@/services/auth.supabase.service'
import type { User } from '@/types'

export default function ProfileSettingsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [clinicName, setClinicName] = useState('')
  const [clinicEmail, setClinicEmail] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileMessage, setProfileMessage] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const current = await authService.getCurrentUser()
        if (current) {
          setUser(current)
          setClinicName(current.clinic?.name || '')
          setClinicEmail(current.clinic?.email || '')
        }
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  const handleSaveProfile = async () => {
    setProfileMessage('')
    setSavingProfile(true)
    try {
      const updated = await authService.updateProfile({
        clinicName: clinicName.trim() || undefined,
        clinicEmail: clinicEmail.trim() || undefined,
      })
      setUser(updated)
      setProfileMessage('Profile updated successfully.')
    } catch (error: any) {
      setProfileMessage(error.message || 'Failed to update profile.')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleChangePassword = async () => {
    setPasswordMessage('')
    setPasswordError('')
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match.')
      return
    }
    try {
      await authService.updatePassword(password)
      setPassword('')
      setConfirmPassword('')
      setPasswordMessage('Password updated successfully.')
    } catch (error: any) {
      setPasswordError(error.message || 'Failed to update password.')
    }
  }

  return (
    <DashboardLayout title="Profile Settings">
      <div className="max-w-3xl space-y-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Clinic Profile</h2>
            {profileMessage && (
              <div className="text-sm text-gray-600">{profileMessage}</div>
            )}
            <Input
              label="Clinic Name"
              value={clinicName}
              onChange={(e) => setClinicName(e.target.value)}
              placeholder="Your clinic name"
            />
            <Input
              label="Clinic Email"
              value={clinicEmail}
              onChange={(e) => setClinicEmail(e.target.value)}
              placeholder="clinic@email.com"
              type="email"
            />
            <Input
              label="Account Email"
              value={user?.email || ''}
              disabled
            />
            <Button
              variant="primary"
              isLoading={savingProfile}
              onClick={handleSaveProfile}
              disabled={loading}
            >
              Save Changes
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
            {passwordMessage && (
              <div className="text-sm text-green-700">{passwordMessage}</div>
            )}
            {passwordError && (
              <div className="text-sm text-red-600">{passwordError}</div>
            )}
            <Input
              label="New Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
            />
            <Button variant="outline" onClick={handleChangePassword}>
              Update Password
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
