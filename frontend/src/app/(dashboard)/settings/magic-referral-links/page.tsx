'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout'
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from '@/components/ui'
import {
  Copy,
  ExternalLink,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Loader2,
  Key,
  Link2,
  Calendar,
} from 'lucide-react'
import { magicReferralLinkService } from '@/services/magic-referral-link.service'
import type { ReferralLink } from '@/types'
import { Modal } from '@/components/ui'

interface CreateLinkModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

function CreateLinkModal({ isOpen, onClose, onSuccess }: CreateLinkModalProps) {
  const [label, setLabel] = useState('')
  const [customAccessCode, setCustomAccessCode] = useState('')
  const [useCustomCode, setUseCustomCode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdLink, setCreatedLink] = useState<{
    accessCode: string
    referralUrl: string
  } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const data = await magicReferralLinkService.create({
        label: label.trim() || undefined,
        accessCode: useCustomCode ? customAccessCode.trim() : undefined,
      })

      setCreatedLink({
        accessCode: data.accessCode,
        referralUrl: data.referralUrl,
      })
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create referral link')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCopyCode = () => {
    if (createdLink) {
      navigator.clipboard.writeText(createdLink.accessCode)
      alert('Access code copied to clipboard!')
    }
  }

  const handleCopyUrl = () => {
    if (createdLink) {
      navigator.clipboard.writeText(createdLink.referralUrl)
      alert('Referral URL copied to clipboard!')
    }
  }

  const handleClose = () => {
    setLabel('')
    setCustomAccessCode('')
    setUseCustomCode(false)
    setCreatedLink(null)
    onClose()
    if (createdLink) {
      onSuccess()
    }
  }

  if (createdLink) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Link Created Successfully">
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800 font-medium mb-2">
              ⚠️ Save these details now - the access code will not be shown again!
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Access Code
            </label>
            <div className="flex items-center gap-2">
              <Input
                value={createdLink.accessCode}
                readOnly
                className="font-mono text-lg font-bold"
              />
              <Button onClick={handleCopyCode} size="sm" variant="outline">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Referral URL
            </label>
            <div className="flex items-center gap-2">
              <Input value={createdLink.referralUrl} readOnly className="text-sm" />
              <Button onClick={handleCopyUrl} size="sm" variant="outline">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button onClick={handleClose}>Done</Button>
          </div>
        </div>
      </Modal>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Magic Referral Link">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Label (Optional)
          </label>
          <Input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g., Standing GP Link, Emergency Referrals"
            maxLength={100}
          />
          <p className="text-xs text-gray-500 mt-1">
            Helpful name to identify this link (only visible to you)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="useCustomCode"
            checked={useCustomCode}
            onChange={(e) => setUseCustomCode(e.target.checked)}
            className="rounded"
          />
          <label htmlFor="useCustomCode" className="text-sm text-gray-700">
            Set custom access code (leave unchecked for auto-generated)
          </label>
        </div>

        {useCustomCode && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Access Code (4-8 digits)
            </label>
            <Input
              value={customAccessCode}
              onChange={(e) => setCustomAccessCode(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              pattern="[0-9]{4,8}"
              maxLength={8}
            />
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Creating...
              </>
            ) : (
              'Create Link'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default function MagicReferralLinksPage() {
  const [links, setLinks] = useState<ReferralLink[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const fetchLinks = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await magicReferralLinkService.list()
      setLinks(data)
    } catch (error: any) {
      console.error('Failed to load referral links:', error)
      setError(error.response?.data?.message || 'Failed to load referral links')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLinks()
  }, [])

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const data = await magicReferralLinkService.update(id, {
        isActive: !currentStatus,
      })
      await fetchLinks()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update link')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this referral link? This cannot be undone.')) {
      return
    }

    try {
      await magicReferralLinkService.delete(id)
      await fetchLinks()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete link')
    }
  }

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleRegenerateCode = async (id: string) => {
    if (
      !confirm(
        'Are you sure you want to regenerate the access code? The old code will no longer work. Make sure to share the new code with authorized users.'
      )
    ) {
      return
    }

    try {
      const data = await magicReferralLinkService.update(id, {
        regenerateAccessCode: true,
      })
      alert(`New access code: ${data.accessCode}\n\n⚠️ Save this code - it will not be shown again!`)
      await fetchLinks()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to regenerate access code')
    }
  }

  if (loading) {
    return (
      <DashboardLayout title="Magic Referral Links">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">Loading referral links...</span>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Magic Referral Links">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Magic Referral Links</h1>
            <p className="text-gray-600 mt-1">
              Create secure token-based referral links with access codes for GPs to submit
              referrals
            </p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create New Link
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && links.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Link2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No referral links yet</h3>
              <p className="text-gray-600 mb-4">
                Create your first magic referral link to start accepting referrals from GPs
              </p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Link
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Links List */}
        {links.length > 0 && (
          <div className="grid gap-4">
            {links.map((link) => (
              <Card key={link.id} className={!link.isActive ? 'opacity-75' : ''}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {link.label || 'Unnamed Link'}
                        </h3>
                        {link.isActive ? (
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                            Inactive
                          </span>
                        )}
                      </div>

                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Link2 className="h-4 w-4" />
                          <span className="font-mono text-xs break-all">{link.referralUrl}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Created {new Date(link.createdAt).toLocaleDateString()} •{' '}
                            {link.referralCount || 0} referral{link.referralCount !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopyUrl(link.referralUrl || '', link.id)}
                      >
                        {copiedId === link.id ? (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-1" />
                            Copy URL
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRegenerateCode(link.id)}
                        title="Regenerate access code"
                      >
                        <Key className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleActive(link.id, link.isActive)}
                      >
                        {link.isActive ? (
                          <>
                            <X className="h-4 w-4 mr-1" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            Activate
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(link.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <CreateLinkModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchLinks}
      />
    </DashboardLayout>
  )
}

