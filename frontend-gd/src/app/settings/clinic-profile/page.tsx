'use client'

import { useState } from 'react'
import Image from 'next/image'
import { DashboardLayout } from '@/components/layout'
import { Button, Input } from '@/components/ui'

export default function ClinicProfileSettingsPage() {
  const [clinicName, setClinicName] = useState('Edge water clinic')
  const [clinicEmail, setClinicEmail] = useState('')
  const [accountEmail, setAccountEmail] = useState('rohith@rdventurestudios.com')
  const [logoFileName, setLogoFileName] = useState('No file chosen')

  return (
    <DashboardLayout title="Clinic Profile" subtitle="Manage your clinic details">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-xl p-8 space-y-6">
          <h2 className="text-xl font-semibold text-neutral-900">Clinic Profile</h2>

          <Input
            label="Clinic Name"
            value={clinicName}
            onChange={(e) => setClinicName(e.target.value)}
          />

          <Input
            label="Clinic Email"
            type="email"
            value={clinicEmail}
            onChange={(e) => setClinicEmail(e.target.value)}
            placeholder="clinic@email.com"
          />

          <Input
            label="Account Email"
            type="email"
            value={accountEmail}
            onChange={(e) => setAccountEmail(e.target.value)}
          />

          <div className="space-y-3">
            <label className="block text-[11px] font-semibold text-neutral-400 ml-1">
              Clinic Logo
            </label>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-lg border border-neutral-200 bg-white flex items-center justify-center overflow-hidden">
                <Image src="/logo.png" alt="Clinic Logo" width={48} height={48} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-neutral-700 mb-2">Upload Logo</div>
                <div className="flex items-center gap-3">
                  <label className="px-3 py-2 border border-neutral-300 rounded-lg text-sm text-neutral-700 cursor-pointer bg-white hover:border-emerald-300">
                    Choose file
                    <input
                      type="file"
                      className="hidden"
                      accept="image/png,image/jpeg"
                      onChange={(e) => setLogoFileName(e.target.files?.[0]?.name || 'No file chosen')}
                    />
                  </label>
                  <span className="text-sm text-neutral-400">{logoFileName}</span>
                </div>
                <p className="text-xs text-neutral-400 mt-2">Recommended: square image, PNG or JPG.</p>
              </div>
            </div>
            <Button variant="outline" className="rounded-lg">
              Upload Logo
            </Button>
          </div>

          <Button className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white w-fit">
            Save Changes
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
