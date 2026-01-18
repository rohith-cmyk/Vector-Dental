'use client'

import { useState } from 'react'
import { Info } from 'lucide-react'
import { DEFAULT_REFERRAL_REASONS, SPECIALIST_REASON_OPTIONS } from '@/constants'

interface ReferralReasonButtonsProps {
  selectedReasons: string[]
  customReason: string
  onReasonToggle: (reason: string) => void
  onCustomReasonChange: (value: string) => void
  error?: string
  specialty?: string
  reasons?: string[]
  showPreferredDoctor?: boolean
}

export function ReferralReasonButtons({
  selectedReasons,
  customReason,
  onReasonToggle,
  onCustomReasonChange,
  error,
  specialty,
  reasons,
  showPreferredDoctor = true,
}: ReferralReasonButtonsProps) {
  const [isPreferredDoctorOpen, setIsPreferredDoctorOpen] = useState(false)
  const resolvedReasons =
    reasons ||
    (specialty && SPECIALIST_REASON_OPTIONS[specialty]) ||
    DEFAULT_REFERRAL_REASONS

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="text-xl font-semibold text-gray-900">
            Referral Reason
          </h4>
          <div className="group relative">
            <Info className="w-4 h-4 text-gray-400 cursor-help" />
            <div className="hidden group-hover:block absolute left-0 top-full mt-1 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10">
              Select a common reason or enter a custom reason for this referral
            </div>
          </div>
        </div>
        {specialty && (
          <span className="text-xs text-neutral-400">
            showing reasons for {specialty}
          </span>
        )}
      </div>

      {/* Common Reason Buttons */}
      <div className="flex flex-wrap gap-2">
        {resolvedReasons.map((reason) => (
          <button
            key={reason}
            type="button"
            onClick={() => onReasonToggle(reason)}
            className={`px-3 py-1.5 text-sm font-normal rounded-full border border-neutral-200 transition-colors ${
              selectedReasons.includes(reason)
                ? 'bg-emerald-600 border-emerald-600 text-white'
                : 'bg-white border-neutral-200 text-gray-600 hover:border-emerald-500 hover:bg-emerald-50'
            }`}
          >
            {reason}
          </button>
        ))}
      </div>

      {/* Custom Reason */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Additional Comments
        </label>
        <textarea
          value={customReason}
          onChange={(e) => onCustomReasonChange(e.target.value)}
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

      {showPreferredDoctor && (
        <>
          <button
            type="button"
            onClick={() => setIsPreferredDoctorOpen(!isPreferredDoctorOpen)}
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            {isPreferredDoctorOpen ? '−' : '+'} Choose preferred doctor
          </button>
          {isPreferredDoctorOpen && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">
                Preferred doctor selection will be available when contact selection is implemented.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

