'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Flag } from 'lucide-react'
import { cn } from '@/lib/utils'
import api from '@/lib/api'

const FEEDBACK_TYPES = [
  { value: 'BUG', label: 'Bug / Something is broken' },
  { value: 'UI_CONFUSING', label: 'UI confusing / Hard to use' },
  { value: 'FEATURE_IDEA', label: 'Feature idea / Improvement' },
  { value: 'DATA_ISSUE', label: 'Data issue (wrong values, timing, etc.)' },
] as const

const SEVERITIES = [
  { value: 'BLOCKING', label: 'Blocking (cannot continue task)' },
  { value: 'HIGH', label: 'High (major disruption)' },
  { value: 'MEDIUM', label: 'Medium (annoying but workaround exists)' },
  { value: 'LOW', label: 'Low (minor or cosmetic)' },
] as const

const SCREEN_NAMES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/referrals': 'Referrals',
  '/specialists': 'Specialist Directory',
  '/settings': 'Settings',
  '/settings/clinic-profile': 'Clinic Profile',
  '/settings/user-profiles': 'User Profiles',
  '/settings/appearance': 'Appearance',
  '/settings/security': 'Security',
}

function getScreenName(pathname: string): string {
  for (const [path, name] of Object.entries(SCREEN_NAMES)) {
    if (pathname === path || pathname.startsWith(path + '/')) return name
  }
  return pathname || 'Unknown'
}

export function FeedbackButton() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [type, setType] = useState<string>('')
  const [description, setDescription] = useState('')
  const [severity, setSeverity] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!type || !description.trim() || !severity) return

    setSubmitting(true)
    try {
      await api.post('/feedback', {
        type,
        description: description.trim(),
        severity,
        screen: getScreenName(pathname || ''),
      })
      setSubmitted(true)
      setType('')
      setDescription('')
      setSeverity('')
      setTimeout(() => {
        setSubmitted(false)
        setIsOpen(false)
      }, 2000)
    } catch {
      // Error handled by interceptor
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!submitting) {
      setIsOpen(false)
      setSubmitted(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
          isOpen
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'
        )}
        aria-label="Feedback"
      >
        <Flag
          className={cn('h-4 w-4', isOpen ? 'text-emerald-600' : 'text-neutral-500')}
          strokeWidth={1.5}
        />
        <span>Feedback</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4" onClick={handleClose}>
          <div
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {submitted ? (
              <p className="py-8 text-center text-emerald-600 font-medium">
                Thanks, your feedback has been sent.
              </p>
            ) : (
              <>
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Send Feedback</h3>
                <p className="mb-4 text-sm text-gray-500">
                  Use this to quickly report bugs or suggest improvements during your session.
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Type of feedback <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      required
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="">Select...</option>
                      {FEEDBACK_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      rows={4}
                      placeholder="Describe the issue or suggestion..."
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Severity / impact <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value)}
                      required
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="">Select...</option>
                      {SEVERITIES.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {submitting ? 'Sending...' : 'Send'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
