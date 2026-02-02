'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout'
import { Button, Input, Modal } from '@/components/ui'

type UserProfile = {
  id: string
  name: string
  email: string
  phone: string
}

const initialUsers: UserProfile[] = [
  { id: 'user-1', name: 'Dr. Rohith', email: 'rohith@rdventurestudios.com', phone: '(575) 757-5775' },
]

export default function UserProfilesSettingsPage() {
  const [users, setUsers] = useState<UserProfile[]>(initialUsers)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newUser, setNewUser] = useState({ name: '', email: '', phone: '' })

  const handleAddUser = () => {
    if (!newUser.name.trim() || !newUser.email.trim()) return
    setUsers((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        name: newUser.name.trim(),
        email: newUser.email.trim(),
        phone: newUser.phone.trim(),
      },
    ])
    setNewUser({ name: '', email: '', phone: '' })
    setIsModalOpen(false)
  }

  return (
    <DashboardLayout title="User Profiles" subtitle="Manage users and access">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-neutral-900">User Profiles</h2>
          <Button className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setIsModalOpen(true)}>
            Add User
          </Button>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between px-6 py-4">
              <div>
                <div className="text-sm font-semibold text-neutral-900">{user.name}</div>
                <div className="text-xs text-neutral-500">{user.email}</div>
              </div>
              <div className="text-sm text-neutral-500">{user.phone || '—'}</div>
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add User" size="md">
        <div className="space-y-4">
          <Input
            label="Name"
            value={newUser.name}
            onChange={(e) => setNewUser((prev) => ({ ...prev, name: e.target.value }))}
          />
          <Input
            label="Email"
            type="email"
            value={newUser.email}
            onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))}
          />
          <Input
            label="Contact Information"
            value={newUser.phone}
            onChange={(e) => setNewUser((prev) => ({ ...prev, phone: e.target.value }))}
            placeholder="(555) 555-0101"
          />

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleAddUser}>
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  )
}
