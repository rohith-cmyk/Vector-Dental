'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout'
import { Card, CardHeader, CardTitle, CardContent, Button, Input, LoadingState } from '@/components/ui'
import { Copy, ExternalLink, QrCode, Mail, Check, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'

interface ReferralLinkData {
  slug: string
  isActive: boolean
  clinicName: string
  referralUrl: string
}

export default function ReferralLinkPage() {
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [referralLink, setReferralLink] = useState<ReferralLinkData | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Fetch referral link from API
  useEffect(() => {
    const fetchReferralLink = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await api.get<{ success: boolean; data: ReferralLinkData }>('/referral-link')
        if (response.data.success && response.data.data) {
          setReferralLink(response.data.data)
        } else {
          setError('Failed to load referral link')
        }
      } catch (error: any) {
        console.error('Failed to load referral link:', error)
        setError(error.response?.data?.message || 'Failed to load referral link')
      } finally {
        setLoading(false)
      }
    }

    fetchReferralLink()
  }, [])

  const handleToggleLink = async () => {
    if (!referralLink) return

    try {
      setUpdating(true)
      const response = await api.put<{ success: boolean; data: ReferralLinkData }>('/referral-link', {
        isActive: !referralLink.isActive,
      })
      
      if (response.data.success && response.data.data) {
        setReferralLink(response.data.data)
      } else {
        throw new Error('Failed to update referral link')
      }
    } catch (error: any) {
      console.error('Failed to toggle referral link:', error)
      alert(error.response?.data?.message || 'Failed to update referral link')
    } finally {
      setUpdating(false)
    }
  }

  const handleEmailTemplate = () => {
    if (!referralLink) return

    const subject = encodeURIComponent(`Referral Link - ${referralLink.clinicName}`)
    const body = encodeURIComponent(`
Hello,

You can refer patients to ${referralLink.clinicName} using this secure link:

${referralLink.referralUrl}

Simply click the link and fill out the referral form. We'll receive it instantly and get back to you shortly.

Thank you!
${referralLink.clinicName}
    `)
    
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  const handleCopy = () => {
    if (!referralLink) return
    navigator.clipboard.writeText(referralLink.referralUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <DashboardLayout title="Referral Link">
        <div className="flex items-center justify-center h-64">
          <div className="text-sm text-neutral-500">Loading referral link...</div>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !referralLink) {
    return (
      <DashboardLayout title="Referral Link">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="text-sm text-neutral-500">{error || 'Failed to load referral link'}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
          >
            Try Again
          </button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Referral Link">
      <div className="max-w-4xl space-y-6">
        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Your Public Referral Link</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-neutral-400">
              Share this link with other dental clinics to make it easy for them to refer patients to you.
              No account or login required!
            </p>

            {/* Referral URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Referral Link
              </label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={referralLink.referralUrl}
                    readOnly
                    className="cursor-pointer w-full pl-10 pr-4 py-2 border border-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-100 bg-white text-sm text-neutral-700 placeholder-neutral-400 transition-colors"
                  />
                  <button
                    onClick={handleCopy}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-600 hover:text-brand-600 rounded-lg hover:bg-gray-200 transition-colors"
                    title="Copy link"
                  >
                    {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                <Button
                  variant="outline"
                  onClick={() => window.open(referralLink.referralUrl, '_blank')}
                  className="gap-2 px-3 py-1.5 text-sm font-normal rounded-full border border-neutral-200 bg-white text-gray-600 hover:border-emerald-500 hover:bg-emerald-50"
                >
                  <ExternalLink className="h-4 w-4" />
                  Preview
                </Button>
              </div>
            </div>

            {/* Status */}
            <div className={`flex items-center justify-between p-4 rounded-lg border ${
              referralLink.isActive 
                ? 'bg-green-50 border-green-200' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${
                  referralLink.isActive ? 'bg-green-500' : 'bg-gray-400'
                }`}></div>
                <span className={`text-sm font-medium ${
                  referralLink.isActive ? 'text-green-800' : 'text-gray-600'
                }`}>
                  Link is {referralLink.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleLink}
                disabled={updating}
                className="px-3 py-1.5 text-sm font-normal rounded-full border border-neutral-200 bg-white text-gray-600 hover:border-emerald-500 hover:bg-emerald-50"
              >
                {updating ? 'Updating...' : referralLink.isActive ? 'Deactivate Link' : 'Activate Link'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Share Options */}
        <Card>
          <CardHeader>
            <CardTitle>Share Your Link</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-neutral-400">
              Make it easy for other clinics to refer patients to you:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email Template */}
              <button
                onClick={handleEmailTemplate}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-colors text-left"
              >
                <Mail className="h-8 w-8 text-emerald-500 mb-2" />
                <h4 className="font-semibold text-gray-900">Email Template</h4>
                <p className="text-sm text-neutral-400 mt-1">
                  Send a pre-written email with your referral link
                </p>
              </button>

              {/* QR Code */}
              <button
                onClick={() => alert('QR Code generator coming soon!')}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-colors text-left"
              >
                <QrCode className="h-8 w-8 text-emerald-500 mb-2" />
                <h4 className="font-semibold text-gray-900">QR Code</h4>
                <p className="text-sm text-neutral-400 mt-1">
                  Generate a QR code for easy mobile access
                </p>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Embed Code */}
        <Card>
          <CardHeader>
            <CardTitle>Embed on Your Website</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-neutral-400 mb-4">
              Add this code to your website to create a referral button:
            </p>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
              {`<a href="${referralLink.referralUrl}" 
   target="_blank" 
   style="background: #84cc16; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block;">
  Refer a Patient
</a>`}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 px-3 py-1.5 text-sm font-normal rounded-full border border-neutral-200 bg-white text-gray-600 hover:border-emerald-500 hover:bg-emerald-50"
              onClick={() => {
                navigator.clipboard.writeText(`<a href="${referralLink.referralUrl}" target="_blank">Refer a Patient</a>`)
                alert('Code copied to clipboard!')
              }}
            >
              Copy Code
            </Button>
          </CardContent>
        </Card>

        {/* Usage Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Referral Link Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600">Total Clicks</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">127</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Referrals Submitted</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">42</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">33%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

