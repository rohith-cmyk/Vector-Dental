'use client'

import { useEffect, useMemo, useState } from 'react'
import { DashboardLayout } from '@/components/layout'
import { Button, Card, CardContent, Input, Modal } from '@/components/ui'
import { SPECIALTY_CATEGORIES } from '@/constants/specialists'
import { handleApiError } from '@/lib/api'
import {
  specialistProfilesService,
  type SpecialistProfileEntry,
  type SpecialistRole,
} from '@/services/specialist-profiles.service'

type SpecialistEntry = SpecialistProfileEntry

export default function SpecialistProfilesSettingsPage() {
  const [profiles, setProfiles] = useState<SpecialistEntry[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<SpecialistRole>('Admin')
  const [credentials, setCredentials] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [yearsInPractice, setYearsInPractice] = useState('')
  const [boardCertified, setBoardCertified] = useState(false)
  const [phone, setPhone] = useState('')
  const [website, setWebsite] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zip, setZip] = useState('')
  const [languages, setLanguages] = useState('')
  const [subSpecialties, setSubSpecialties] = useState('')
  const [insuranceAccepted, setInsuranceAccepted] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [formError, setFormError] = useState('')
  const [loadError, setLoadError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [confirmDeleteName, setConfirmDeleteName] = useState('')

  useEffect(() => {
    const loadProfiles = async () => {
      setLoadError('')
      setIsLoading(true)
      try {
        const response = await specialistProfilesService.getAll()
        setProfiles(response.data)
      } catch (error) {
        setLoadError(handleApiError(error))
      } finally {
        setIsLoading(false)
      }
    }

    loadProfiles()
  }, [])

  const openAddModal = () => {
    setEditingId(null)
    setFullName('')
    setEmail('')
    setRole('Admin')
    setCredentials('')
    setSpecialty('')
    setYearsInPractice('')
    setBoardCertified(false)
    setPhone('')
    setWebsite('')
    setAddress('')
    setCity('')
    setState('')
    setZip('')
    setLanguages('')
    setSubSpecialties('')
    setInsuranceAccepted('')
    setPhotoFile(null)
    setFormError('')
    setIsModalOpen(true)
  }

  const openEditModal = (entry: SpecialistEntry) => {
    setEditingId(entry.id)
    setFullName(entry.fullName)
    setEmail(entry.email)
    setRole(entry.role)
    setCredentials(entry.credentials)
    setSpecialty(entry.specialty)
    setYearsInPractice(entry.yearsInPractice)
    setBoardCertified(entry.boardCertified)
    setPhone(entry.phone)
    setWebsite(entry.website)
    setAddress(entry.address)
    setCity(entry.city)
    setState(entry.state)
    setZip(entry.zip)
    setLanguages(entry.languages)
    setSubSpecialties(entry.subSpecialties)
    setInsuranceAccepted(entry.insuranceAccepted)
    setPhotoFile(null)
    setFormError('')
    setIsModalOpen(true)
  }

  const splitList = (value: string) =>
    value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)

  const handleSave = async () => {
    setFormError('')
    if (!fullName.trim() || !email.trim()) {
      setFormError('Full name and email are required.')
      return
    }

    setIsSaving(true)
    try {
      const payload = {
        fullName: fullName.trim(),
        email: email.trim(),
        role,
        credentials: credentials.trim(),
        specialty: specialty.trim(),
        yearsInPractice: yearsInPractice.trim(),
        boardCertified,
        phone: phone.trim(),
        website: website.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        zip: zip.trim(),
        languages: splitList(languages),
        subSpecialties: splitList(subSpecialties),
        insuranceAccepted: splitList(insuranceAccepted),
      }

      if (editingId) {
        const response = await specialistProfilesService.update(editingId, payload)
        let nextEntry = response.data
        if (photoFile) {
          const photoResponse = await specialistProfilesService.uploadPhoto(editingId, photoFile)
          nextEntry = photoResponse.data
        }
        setProfiles((prev) => prev.map((entry) => (entry.id === editingId ? nextEntry : entry)))
      } else {
        const response = await specialistProfilesService.create(payload)
        let nextEntry = response.data
        if (photoFile) {
          const photoResponse = await specialistProfilesService.uploadPhoto(response.data.id, photoFile)
          nextEntry = photoResponse.data
        }
        setProfiles((prev) => [nextEntry, ...prev])
      }

      setIsModalOpen(false)
    } catch (error) {
      setFormError(handleApiError(error))
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteRequest = (entry: SpecialistEntry) => {
    setConfirmDeleteId(entry.id)
    setConfirmDeleteName(entry.fullName)
  }

  const handleDeleteConfirm = async () => {
    if (!confirmDeleteId) return
    setLoadError('')
    setDeletingId(confirmDeleteId)
    try {
      await specialistProfilesService.remove(confirmDeleteId)
      setProfiles((prev) => prev.filter((profile) => profile.id !== confirmDeleteId))
      setConfirmDeleteId(null)
      setConfirmDeleteName('')
    } catch (error) {
      setLoadError(handleApiError(error))
    } finally {
      setDeletingId(null)
    }
  }

  const sortedProfiles = useMemo(() => {
    return [...profiles].sort((a, b) => a.fullName.localeCompare(b.fullName))
  }, [profiles])

  return (
    <DashboardLayout title="Specialist Profiles">
      <div className="space-y-4">
        <div className="flex items-center justify-end">
          <Button
            variant="primary"
            onClick={openAddModal}
            className="bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-600"
          >
            Add user
          </Button>
        </div>
        {loadError && <div className="text-sm text-amber-600">{loadError}</div>}

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="text-[11px] text-neutral-400 border-b border-neutral-200">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium">Full Name</th>
                    <th className="px-6 py-3 text-left font-medium">Email</th>
                    <th className="px-6 py-3 text-left font-medium">Role</th>
                    <th className="px-6 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-400" />
                          <p className="text-sm text-neutral-500">Loading specialists...</p>
                        </div>
                      </td>
                    </tr>
                  ) : sortedProfiles.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-sm text-neutral-400">
                        No specialists added yet.
                      </td>
                    </tr>
                  ) : (
                    sortedProfiles.map((entry) => (
                      <tr key={entry.id} className="border-b border-neutral-100 last:border-b-0">
                        <td className="px-6 py-4 text-sm text-neutral-700">{entry.fullName}</td>
                        <td className="px-6 py-4 text-sm text-neutral-500">{entry.email}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                            {entry.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            className="text-sm text-neutral-500 hover:text-neutral-700"
                            onClick={() => openEditModal(entry)}
                          >
                            Edit
                          </button>
                          <button
                            className="ml-3 text-sm text-red-500 hover:text-red-700"
                            onClick={() => handleDeleteRequest(entry)}
                            disabled={deletingId === entry.id}
                          >
                            {deletingId === entry.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Specialist' : 'Add Specialist'}>
        <div className="space-y-4">
          {formError && <div className="text-sm text-red-600">{formError}</div>}
          <Input
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Dr. Sam Asaro"
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="sam@refera.com"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Credentials"
              value={credentials}
              onChange={(e) => setCredentials(e.target.value)}
              placeholder="DDS, MS"
            />
            <div className="space-y-2">
              <label className="block text-[10pt] text-neutral-400">Specialty</label>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-700"
              >
                <option value="">All Specialties</option>
                {SPECIALTY_CATEGORIES.map((category) => (
                  <option key={category.category} value={category.category}>
                    {category.category}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Years in Practice"
              type="number"
              value={yearsInPractice}
              onChange={(e) => setYearsInPractice(e.target.value)}
              placeholder="10"
            />
            <div className="flex items-center gap-3">
              <input
                id="board-certified"
                type="checkbox"
                checked={boardCertified}
                onChange={(e) => setBoardCertified(e.target.checked)}
                className="h-4 w-4 rounded border-neutral-300"
              />
              <label htmlFor="board-certified" className="text-[10pt] text-neutral-500">
                Board Certified
              </label>
            </div>
          </div>
          <Input
            label="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(555) 555-1234"
          />
          <Input
            label="Website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="www.example.com"
          />
          <Input
            label="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="123 Dental Ln"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Austin"
            />
            <Input
              label="State"
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="TX"
            />
            <Input
              label="Zip"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              placeholder="78701"
            />
          </div>
          <Input
            label="Languages (comma separated)"
            value={languages}
            onChange={(e) => setLanguages(e.target.value)}
            placeholder="English, Spanish"
          />
          <Input
            label="Sub-specialties (comma separated)"
            value={subSpecialties}
            onChange={(e) => setSubSpecialties(e.target.value)}
            placeholder="Root Canal Therapy, Retreatment"
          />
          <Input
            label="Insurance Accepted (comma separated)"
            value={insuranceAccepted}
            onChange={(e) => setInsuranceAccepted(e.target.value)}
            placeholder="Delta Dental PPO, Cigna Dental PPO"
          />
          <Input
            label="Doctor Photo"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0] || null
              setPhotoFile(file)
            }}
          />
          <div className="space-y-2">
            <label className="block text-[10pt] text-neutral-400">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as SpecialistRole)}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-700"
            >
              <option value="Admin">Admin</option>
              <option value="Staff">Staff</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!confirmDeleteId}
        onClose={() => {
          if (deletingId) return
          setConfirmDeleteId(null)
          setConfirmDeleteName('')
        }}
        title="Delete specialist?"
      >
        <div className="space-y-4">
          <p className="text-sm text-neutral-600">
            Delete {confirmDeleteName}? This cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setConfirmDeleteId(null)
                setConfirmDeleteName('')
              }}
              disabled={!!deletingId}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleDeleteConfirm} disabled={!!deletingId}>
              {deletingId ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  )
}
