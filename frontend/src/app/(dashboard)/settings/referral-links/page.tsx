'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout'
import { Card, CardHeader, CardTitle, CardContent, Button, Input, LoadingState, Modal } from '@/components/ui'
import {
  Copy,
  ExternalLink,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Loader2,
  Link2,
  Calendar,
} from 'lucide-react'
import { referralLinkService } from '@/services/referral-link.service'
import type { ReferralLink } from '@/types'
import { getCachedData, setCachedData, clearCache } from '@/lib/cache'

interface CreateLinkModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

function CreateLinkModal({ isOpen, onClose, onSuccess }: CreateLinkModalProps) {
  const [label, setLabel] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdLink, setCreatedLink] = useState<{
    referralUrl: string
  } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const data = await referralLinkService.create({
        label: label.trim() || undefined,
      })

      setCreatedLink({
        referralUrl: data.referralUrl,
      })
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create referral link')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCopyUrl = () => {
    if (createdLink) {
      navigator.clipboard.writeText(createdLink.referralUrl)
      alert('Referral URL copied to clipboard!')
    }
  }

  const handleClose = () => {
    const hadCreatedLink = !!createdLink
    setLabel('')
    setCreatedLink(null)
    onClose()
    if (hadCreatedLink) {
      onSuccess()
    }
  }

  if (createdLink) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Link Created Successfully">
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800 font-medium mb-2">
              ✅ Your referral link is ready! Share this URL with anyone who needs to submit a referral.
            </p>
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
            <p className="text-xs text-gray-500 mt-1">
              Anyone with this link can submit a referral directly - no login required!
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button onClick={handleClose}>Done</Button>
          </div>
        </div>
      </Modal>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Referral Link">
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

export default function ReferralLinksPage() {
  const [links, setLinks] = useState<ReferralLink[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ReferralLink | null>(null)
  const [deleting, setDeleting] = useState(false)
  const cacheKey = 'referral_links'
  const cacheTtl = 2 * 60 * 1000

  const fetchLinks = async (showLoading: boolean = true) => {
    try {
      if (showLoading) {
        setLoading(true)
      }
      setError(null)
      const data = await referralLinkService.list()
      setLinks(data)
      setCachedData(cacheKey, data, cacheTtl)
    } catch (error: any) {
      console.error('Failed to load referral links:', error)
      setError(error.response?.data?.message || 'Failed to load referral links')
    } finally {
      if (showLoading) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    const cached = getCachedData<ReferralLink[]>(cacheKey)
    if (cached) {
      setLinks(cached)
      setLoading(false)
      fetchLinks(false)
      return
    }

    fetchLinks(true)
  }, [])

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const data = await referralLinkService.update(id, {
        isActive: !currentStatus,
      })
      clearCache(cacheKey)
      await fetchLinks(false)
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update link')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      setDeleting(true)
      await referralLinkService.delete(id)
      clearCache(cacheKey)
      await fetchLinks(false)
      setDeleteTarget(null)
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete link')
    } finally {
      setDeleting(false)
    }
  }

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }


  if (loading) {
    return (
      <DashboardLayout title="Referral Links">
        <LoadingState
          className="h-64"
          title="Loading referral links..."
          subtitle="Preparing your shareable links"
        />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Referral Links">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Referral Links</h1>
            <p className="text-gray-600 mt-1">
              Create secure token-based referral links for GPs to submit referrals directly
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
                Create your first referral link to start accepting referrals from GPs
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
                        onClick={() => setDeleteTarget(link)}
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
        onSuccess={() => {
          clearCache(cacheKey)
          fetchLinks(false)
        }}
      />

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => {
          if (!deleting) {
            setDeleteTarget(null)
          }
        }}
        title="Delete Referral Link"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete{' '}
            <span className="font-medium text-gray-900">{deleteTarget?.label || 'this link'}</span>?
            This cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => deleteTarget && handleDelete(deleteTarget.id)}
              isLoading={deleting}
            >
              Delete Link
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  )
}


