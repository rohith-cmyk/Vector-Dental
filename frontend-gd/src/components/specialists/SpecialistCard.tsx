'use client'

import { Star, Calendar, Clock, Zap } from 'lucide-react'
import type { SpecialistProfile } from '@/types/specialists'
import { clsx } from 'clsx'

interface SpecialistCardProps {
  specialist: SpecialistProfile
  onClick: () => void
}

export function SpecialistCard({ specialist, onClick }: SpecialistCardProps) {
  const displayBadges = specialist.badges.slice(0, 2)

  return (
    <div
      onClick={onClick}
      className={clsx(
        "group relative flex flex-col p-5 h-full",
        "bg-white rounded-3xl border border-neutral-100 shadow-sm hover:shadow-md",
        "transition-all duration-300 ease-out",
        "hover:border-emerald-100/50",
        "cursor-pointer"
      )}
    >
      <div className="flex flex-col items-center mb-5">
        {specialist.headshotUrl ? (
          <img
            src={specialist.headshotUrl}
            alt={`${specialist.firstName} ${specialist.lastName}`}
            className="w-14 h-14 rounded-full object-cover mb-4 border border-emerald-100"
          />
        ) : (
          <div
            className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 mb-4"
            aria-label={`${specialist.firstName} ${specialist.lastName}`}
          />
        )}
        <div className="flex flex-col items-center gap-0.5">
          <h3 className="text-md font-semibold text-neutral-700 text-center">
            {specialist.firstName} {specialist.lastName}
          </h3>
          <p className="text-[10pt] font-medium text-emerald-600 text-center">
            {specialist.specialty}
          </p>
          <p className="text-sm font-normal text-neutral-400 text-center">
            {specialist.credentials} • {specialist.yearsInPractice} Years exp.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px bg-neutral-100 rounded-2xl overflow-hidden border border-neutral-100 mb-5">
        <div className="bg-white p-3 transition-colors">
          <div className="flex items-center gap-1.5 text-[10pt] font-medium text-neutral-400 mb-1">
            <Calendar className="h-3.5 w-3.5" /> Next Appt
          </div>
          <div className="text-sm font-bold text-neutral-700">
            {new Date(specialist.metrics.fastestAppt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        </div>
        <div className="bg-white p-3 transition-colors">
          <div className="flex items-center gap-1.5 text-[10pt] font-medium text-neutral-400 mb-1">
            <Clock className="h-3.5 w-3.5" /> Wait Time
          </div>
          <div className="text-sm font-bold text-neutral-700">
            {specialist.metrics.referralToApptDays.toFixed(0)} Days
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-auto justify-center">
        {displayBadges.map((badge, index) => (
          <span
            key={index}
            className="px-2.5 py-1 rounded-full text-sm font-normal bg-white border border-neutral-200 text-neutral-400"
          >
            {badge}
          </span>
        ))}
        {specialist.metrics.sameDayAvailability && (
          <span className="px-2.5 py-1 rounded-full text-sm font-normal bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center gap-1">
            <Zap className="h-3 w-3" fill="currentColor" /> Fast Track
          </span>
        )}
      </div>

      <div className="flex items-center justify-center pt-5 mt-4 border-t border-neutral-100">
        <div className="flex items-center gap-1.5">
          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
          <span className="text-sm font-bold text-neutral-900">
            {specialist.ratings.overallScore.toFixed(1)}
          </span>
          <span className="text-sm font-normal text-neutral-400">
            ({specialist.ratings.reviewCount})
          </span>
        </div>
      </div>
    </div>
  )
}
