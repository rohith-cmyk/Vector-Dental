'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout'
import { Button, Card, CardContent, Input } from '@/components/ui'
import { authService } from '@/services/auth.supabase.service'
import { API_URL } from '@/lib/api'
import type { User } from '@/types'

export default function ProfileSettingsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [clinicName, setClinicName] = useState('')
  const [clinicEmail, setClinicEmail] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileMessage, setProfileMessage] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState('')
  const [logoMessage, setLogoMessage] = useState('')
  const [logoError, setLogoError] = useState('')
  const [savingLogo, setSavingLogo] = useState(false)
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
          setLogoPreview(current.clinic?.logoUrl || '')
        }
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  useEffect(() => {
    if (!logoFile) return
    const objectUrl = URL.createObjectURL(logoFile)
    setLogoPreview(objectUrl)
    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [logoFile])

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


  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLogoMessage('')
    setLogoError('')
    const file = event.target.files?.[0] || null
    if (!file) {
      setLogoFile(null)
      setLogoPreview(user?.clinic?.logoUrl || '')
      return
    }
    if (!file.type.startsWith('image/')) {
      setLogoError('Please select an image file (PNG or JPG).')
      return
    }
    setLogoFile(file)
  }

  const handleUploadLogo = async () => {
    if (!logoFile) {
      setLogoError('Please choose a logo to upload.')
      return
    }
    setSavingLogo(true)
    setLogoMessage('')
    setLogoError('')
    try {
      const updated = await authService.uploadClinicLogo(logoFile)
      setUser(updated)
      setLogoPreview(updated.clinic?.logoUrl || '')
      setLogoFile(null)
      setLogoMessage('Clinic logo updated successfully.')
    } catch (error: any) {
      setLogoError(error.message || 'Failed to upload clinic logo.')
    } finally {
      setSavingLogo(false)
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

  const resolveLogoUrl = (url?: string) => {
    if (!url) return ''
    if (url.startsWith('/')) {
      return `${API_URL.replace('/api', '')}${url}`
    }
    return url
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
            <div className="space-y-3">
              <div className="text-[10pt] text-neutral-400">Clinic Logo</div>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-lg border border-neutral-200 bg-white flex items-center justify-center overflow-hidden">
                  {logoPreview ? (
                    <img src={resolveLogoUrl(logoPreview)} alt="Clinic logo" className="h-full w-full object-contain" />
                  ) : (
                    <span className="text-xs text-neutral-400">No logo</span>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <Input
                    label="Upload Logo"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handleLogoChange}
                  />
                  <div className="text-xs text-neutral-400">Recommended: square image, PNG or JPG.</div>
                </div>
              </div>
              {logoMessage && <div className="text-sm text-green-700">{logoMessage}</div>}
              {logoError && <div className="text-sm text-red-600">{logoError}</div>}
              <Button
                variant="outline"
                onClick={handleUploadLogo}
                isLoading={savingLogo}
                disabled={loading}
              >
                Upload Logo
              </Button>
            </div>
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

