'use client'

import { useState } from 'react'
import { Info } from 'lucide-react'

interface ReferralReasonButtonsProps {
  selectedReason: string
  customReason: string
  onReasonSelect: (reason: string) => void
  onCustomReasonChange: (value: string) => void
  error?: string
}

const COMMON_REASONS = [
  'Pain Evaluation',
  'Extraction',
  'Implant Evaluation',
  'Sinus Lift',
  'Evaluation of Lesion',
  'Panoramic X-Ray',
  'Third Molar Evaluation',
  'Third Molar Extraction',
]

export function ReferralReasonButtons({
  selectedReason,
  customReason,
  onReasonSelect,
  onCustomReasonChange,
  error,
}: ReferralReasonButtonsProps) {
  const [showPreferredDoctor, setShowPreferredDoctor] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h4 className="text-lg font-semibold text-gray-900">
          Reason for Referral (Oral Surgeon)
        </h4>
        <div className="group relative">
          <Info className="w-4 h-4 text-gray-400 cursor-help" />
          <div className="hidden group-hover:block absolute left-0 top-full mt-1 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10">
            Select a common reason or enter a custom reason for this referral
          </div>
        </div>
      </div>

      {/* Common Reason Buttons */}
      <div className="flex flex-wrap gap-2">
        {COMMON_REASONS.map((reason) => (
          <button
            key={reason}
            type="button"
            onClick={() => onReasonSelect(reason)}
            className={`px-4 py-2 text-sm font-medium rounded-lg border-2 transition-colors ${
              selectedReason === reason
                ? 'bg-emerald-600 border-emerald-600 text-white'
                : 'bg-white border-gray-300 text-gray-700 hover:border-emerald-400 hover:bg-emerald-50'
            }`}
          >
            {reason}
          </button>
        ))}
      </div>

      {/* Custom Reason */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Comment
        </label>
        <textarea
          value={customReason}
          onChange={(e) => {
            onCustomReasonChange(e.target.value)
            if (selectedReason) {
              onReasonSelect('')
            }
          }}
          rows={3}
          placeholder="Enter custom reason for referral..."
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
            error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
          }`}
        />
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>

      {/* Preferred Doctor (Optional) */}
      <button
        type="button"
        onClick={() => setShowPreferredDoctor(!showPreferredDoctor)}
        className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
      >
        {showPreferredDoctor ? '−' : '+'} Choose preferred doctor
      </button>
      {showPreferredDoctor && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">
            Preferred doctor selection will be available when contact selection is implemented.
          </p>
        </div>
      )}
    </div>
  )
}

