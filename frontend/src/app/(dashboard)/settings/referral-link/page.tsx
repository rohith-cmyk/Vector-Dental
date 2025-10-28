'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout'
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from '@/components/ui'
import { Copy, ExternalLink, QrCode, Mail, Check } from 'lucide-react'

export default function ReferralLinkPage() {
  const [copied, setCopied] = useState(false)
  
  // Mock clinic data
  const clinicData = {
    name: 'Demo Dental Clinic',
    slug: 'demo-dental-clinic',
    isActive: true,
  }

  const referralUrl = `http://localhost:3000/refer/${clinicData.slug}`

  const handleCopy = () => {
    navigator.clipboard.writeText(referralUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleToggleLink = () => {
    alert('Toggle link active/inactive - Feature coming soon!')
  }

  const handleEmailTemplate = () => {
    const subject = encodeURIComponent(`Referral Link - ${clinicData.name}`)
    const body = encodeURIComponent(`
Hello,

You can refer patients to ${clinicData.name} using this secure link:

${referralUrl}

Simply click the link and fill out the referral form. We'll receive it instantly and get back to you shortly.

Thank you!
${clinicData.name}
    `)
    
    window.open(`mailto:?subject=${subject}&body=${body}`)
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
            <p className="text-gray-600">
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
                    value={referralUrl}
                    readOnly
                    className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-mono text-sm"
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
                  onClick={() => window.open(referralUrl, '_blank')}
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Preview
                </Button>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-sm font-medium text-green-800">
                  Link is Active
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleLink}
              >
                Deactivate Link
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
            <p className="text-gray-600">
              Make it easy for other clinics to refer patients to you:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email Template */}
              <button
                onClick={handleEmailTemplate}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-brand-500 hover:bg-brand-50 transition-colors text-left"
              >
                <Mail className="h-8 w-8 text-brand-500 mb-2" />
                <h4 className="font-semibold text-gray-900">Email Template</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Send a pre-written email with your referral link
                </p>
              </button>

              {/* QR Code */}
              <button
                onClick={() => alert('QR Code generator coming soon!')}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-brand-500 hover:bg-brand-50 transition-colors text-left"
              >
                <QrCode className="h-8 w-8 text-brand-500 mb-2" />
                <h4 className="font-semibold text-gray-900">QR Code</h4>
                <p className="text-sm text-gray-600 mt-1">
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
            <p className="text-gray-600 mb-4">
              Add this code to your website to create a referral button:
            </p>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
              {`<a href="${referralUrl}" 
   target="_blank" 
   style="background: #84cc16; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block;">
  Refer a Patient
</a>`}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                navigator.clipboard.writeText(`<a href="${referralUrl}" target="_blank">Refer a Patient</a>`)
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

