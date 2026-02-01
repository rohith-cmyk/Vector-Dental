'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { Modal } from '@/components/ui'
import {
  Star, Calendar, MapPin, Phone, Globe, X,
  Zap, Clock, ShieldCheck, Mail
} from 'lucide-react'
import type { SpecialistProfile } from '@/types/specialists'
import { clsx } from 'clsx'

const MapComponent = dynamic<{ lat: number; lng: number; address: string }>(
  () => import('@/components/specialists/MapComponent'),
  {
    ssr: false,
    loading: () => (
      <div className="aspect-video bg-neutral-100 rounded-2xl border border-neutral-200 flex items-center justify-center">
        <div className="text-sm font-normal text-neutral-400">Loading map...</div>
      </div>
    )
  }
)

interface SpecialistDetailModalProps {
  isOpen: boolean
  onClose: () => void
  specialist: SpecialistProfile | null
}

export function SpecialistDetailModal({ isOpen, onClose, specialist }: SpecialistDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'reviews' | 'location' | 'contact'>('overview')

  if (!specialist) return null

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'performance', label: 'Performance' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'location', label: 'Location' },
    { id: 'contact', label: 'Contact' },
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="flex flex-col" style={{ height: 'calc(100vh - 80px)', maxHeight: '850px' }}>
        <div className="bg-white px-8 pt-8 pb-4 z-10 relative flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-8 right-8 p-2 bg-neutral-100 hover:bg-neutral-200 rounded-full text-neutral-500 transition-all"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex flex-col items-center mb-6">
            {specialist.headshotUrl ? (
              <img
                src={specialist.headshotUrl}
                alt={`${specialist.firstName} ${specialist.lastName}`}
                className="w-20 h-20 rounded-full object-cover mb-4 border border-emerald-100"
              />
            ) : (
              <div
                className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 mb-4"
                aria-label={`${specialist.firstName} ${specialist.lastName}`}
              />
            )}
            <h2 className="text-lg font-semibold text-neutral-700 text-center">
              {specialist.firstName} {specialist.lastName}
            </h2>
            <p className="text-[10pt] font-medium text-emerald-600 text-center mt-1">{specialist.specialty}</p>
          </div>

          <div className="flex justify-center mb-8">
            <button className="bg-neutral-800 text-white py-2.5 px-8 rounded-full font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-sm hover:bg-neutral-900">
              <Calendar className="h-4 w-4 text-white" />
              Schedule
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 justify-center">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 25
                }}
                className={clsx(
                  "px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200 whitespace-nowrap border border-neutral-100",
                  activeTab === tab.id
                    ? "bg-neutral-100 text-neutral-900"
                    : "bg-white text-neutral-600 hover:bg-neutral-100"
                )}
              >
                {tab.label}
              </motion.button>
            ))}
          </div>
        </div>

        <motion.div
          layout
          className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar"
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30
          }}
        >
          <div className="space-y-8 mt-2">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                    mass: 0.8
                  }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-neutral-50 p-5 rounded-2xl border border-neutral-100">
                      <div className="text-[10pt] font-medium text-neutral-400 mb-1">Experience</div>
                      <div className="text-md font-bold text-neutral-700">{specialist.yearsInPractice} Years</div>
                    </div>
                    <div className="bg-neutral-50 p-5 rounded-2xl border border-neutral-100">
                      <div className="text-[10pt] font-medium text-neutral-400 mb-1">Credentials</div>
                      <div className="text-md font-bold text-neutral-700 truncate">{specialist.credentials}</div>
                      {specialist.boardCertified && (
                        <div className="flex items-center gap-1.5 mt-1 text-[10pt] font-medium text-emerald-600">
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Board Certified
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-md font-semibold text-neutral-700 mb-3">Languages & Focus</h3>
                    <div className="flex flex-wrap gap-2">
                      {specialist.languages.map(lang => (
                        <span key={lang} className="px-2.5 py-1 bg-white border border-neutral-200 rounded-full text-sm font-normal text-neutral-400">
                          {lang}
                        </span>
                      ))}
                      {specialist.badges.map(badge => (
                        <span key={badge} className="px-2.5 py-1 bg-white border border-neutral-200 rounded-full text-sm font-normal text-neutral-400">
                          {badge}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-md font-semibold text-neutral-700 mb-3">Insurance Accepted</h3>
                    <div className="text-sm font-normal text-neutral-400 leading-relaxed">
                      {specialist.insuranceAccepted.join(', ') || "Contact office for insurance details."}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'performance' && (
                <motion.div
                  key="performance"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                    mass: 0.8
                  }}
                  className="space-y-8"
                >
                  <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-100 shadow-sm">
                    <div className="mb-2">
                      <span className="text-[10pt] font-medium text-neutral-400">Referral to Appointment</span>
                    </div>
                    <div className="text-4xl font-bold tracking-tight mb-4 text-neutral-900">
                      {specialist.metrics.referralToApptDays.toFixed(1)} <span className="text-2xl text-neutral-500">days</span>
                    </div>
                    <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                        style={{ width: `${specialist.metrics.percentileSpeed}%` }}
                      />
                    </div>
                    <p className="text-sm font-normal text-neutral-400 mt-3">
                      Faster than {specialist.metrics.percentileSpeed}% of providers in your area
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <MetricCard
                      label="Op Report Return"
                      value={`${specialist.metrics.caseCompletionAvgDays.toFixed(1)} days`}
                      subtext="Average time"
                    />
                    <MetricCard
                      label="Case Completion"
                      value={`${specialist.metrics.caseCompletionAvgDays.toFixed(1)} days`}
                      subtext="Average turnaround"
                    />
                  </div>

                  <div className="flex gap-3">
                    {specialist.metrics.sameDayAvailability && (
                      <div className="flex items-center gap-2 px-2.5 py-1 bg-white border border-neutral-200 rounded-full text-sm font-normal text-neutral-400">
                        <Zap className="h-3 w-3" fill="currentColor" /> Fast Track
                      </div>
                    )}
                    {specialist.metrics.sameDayOpReport && (
                      <div className="flex items-center gap-2 px-2.5 py-1 bg-white border border-neutral-200 rounded-full text-sm font-normal text-neutral-400">
                        <Clock className="h-3 w-3" /> Fast Reporting
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'reviews' && (
                <motion.div
                  key="reviews"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                    mass: 0.8
                  }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-100">
                      <div className="text-[10pt] font-medium text-neutral-400 mb-1">Overall Rating</div>
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                        <span className="text-3xl font-bold text-neutral-700">
                          {specialist.ratings.overallScore.toFixed(1)}
                        </span>
                      </div>
                      <div className="text-sm font-normal text-neutral-400">
                        ({specialist.ratings.reviewCount} reviews)
                      </div>
                    </div>

                    <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-100">
                      <div className="text-[10pt] font-medium text-neutral-400 mb-1">Provider Review</div>
                      <div className="text-3xl py-4 font-bold text-neutral-700">
                        {specialist.ratings.providerMetrics.referAgain}%
                      </div>
                      <div className="text-sm font-normal text-neutral-400 mt-1">
                        of providers would refer again
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-md font-semibold text-neutral-700 mb-3">Provider Ratings</h3>
                    <div className="space-y-4">
                      <RatingRow label="Communication" score={specialist.ratings.providerMetrics.communication} />
                      <RatingRow label="Timeliness" score={specialist.ratings.providerMetrics.timeliness} />
                      <RatingRow label="Case Outcome" score={specialist.ratings.providerMetrics.caseOutcome} />
                      <RatingRow label="Scheduling" score={specialist.ratings.providerMetrics.easeOfScheduling} />
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'location' && (
                <motion.div
                  key="location"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                    mass: 0.8
                  }}
                  className="space-y-6"
                >
                  <div className="aspect-video rounded-2xl border border-neutral-200 overflow-hidden relative">
                    <MapComponent
                      lat={specialist.location.coordinates.lat}
                      lng={specialist.location.coordinates.lng}
                      address={`${specialist.location.address}, ${specialist.location.city}, ${specialist.location.state} ${specialist.location.zip}`}
                    />
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${specialist.location.address}, ${specialist.location.city}, ${specialist.location.state} ${specialist.location.zip}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm hover:bg-white transition-colors flex items-center gap-1.5"
                    >
                      <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                      View in Maps
                    </a>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-neutral-50 border border-neutral-100">
                    <MapPin className="h-5 w-5 text-neutral-400 mt-0.5" />
                    <div>
                      <p className="text-md font-semibold text-neutral-700">Office Address</p>
                      <p className="text-sm font-normal text-neutral-400 mt-0.5">
                        {specialist.location.address}<br />
                        {specialist.location.city}, {specialist.location.state} {specialist.location.zip}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'contact' && (
                <motion.div
                  key="contact"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                    mass: 0.8
                  }}
                  className="space-y-6"
                >
                  <div className="flex flex-col gap-4">
                    <a href={`tel:${specialist.location.phone}`} className="flex items-center gap-3 p-4 rounded-2xl bg-neutral-50 border border-neutral-100 hover:bg-neutral-100 transition-colors">
                      <Phone className="h-5 w-5 text-neutral-400" />
                      <div className="overflow-hidden">
                        <p className="text-[10pt] font-medium text-neutral-400">Phone</p>
                        <p className="text-sm font-bold text-neutral-700 truncate">{specialist.location.phone}</p>
                      </div>
                    </a>
                    <a href={`https://${specialist.location.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 rounded-2xl bg-neutral-50 border border-neutral-100 hover:bg-neutral-100 transition-colors">
                      <Globe className="h-5 w-5 text-neutral-400" />
                      <div className="overflow-hidden">
                        <p className="text-[10pt] font-medium text-neutral-400">Website</p>
                        <p className="text-sm font-bold text-neutral-700 truncate">Visit Site</p>
                      </div>
                    </a>
                    {specialist.location.email ? (
                      <a href={`mailto:${specialist.location.email}`} className="flex items-center gap-3 p-4 rounded-2xl bg-neutral-50 border border-neutral-100 hover:bg-neutral-100 transition-colors">
                        <Mail className="h-5 w-5 text-neutral-400" />
                        <div className="overflow-hidden">
                          <p className="text-[10pt] font-medium text-neutral-400">Email</p>
                          <p className="text-sm font-bold text-neutral-700 truncate">{specialist.location.email}</p>
                        </div>
                      </a>
                    ) : (
                      <div className="flex items-center gap-3 p-4 rounded-2xl bg-neutral-50 border border-neutral-100">
                        <Mail className="h-5 w-5 text-neutral-400" />
                        <div className="overflow-hidden">
                          <p className="text-[10pt] font-medium text-neutral-400">Email</p>
                          <p className="text-sm font-bold text-neutral-400 truncate">Not available</p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </Modal>
  )
}

function MetricCard({ label, value, subtext }: { label: string, value: string, subtext: string }) {
  return (
    <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-100">
      <p className="text-[10pt] font-medium text-neutral-400 mb-1">{label}</p>
      <p className="text-sm font-bold text-neutral-700">{value}</p>
      <p className="text-sm font-normal text-neutral-400 mt-1">{subtext}</p>
    </div>
  )
}

function RatingRow({ label, score }: { label: string, score: number }) {
  return (
    <div>
      <div className="flex justify-between items-end mb-2">
        <span className="text-[10pt] font-medium text-neutral-400">{label}</span>
        <span className="text-sm font-bold text-neutral-900">{score.toFixed(1)}</span>
      </div>
      <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 rounded-full"
          style={{ width: `${(score / 5) * 100}%` }}
        />
      </div>
    </div>
  )
}
