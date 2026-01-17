'use client'

import { useMemo } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface TimelineStage {
  key: string
  label: string
  status: string
  isCompleted: boolean
  isCurrent: boolean
  isPending: boolean
}

interface StatusTimelineProps {
  stages: TimelineStage[]
}

export function StatusTimeline({ stages }: StatusTimelineProps) {
  const appointmentDateTime = useMemo(() => {
    const now = new Date()
    const daysToAdd = 1 + Math.floor(Math.random() * 7)
    const appointment = new Date(now)
    appointment.setDate(now.getDate() + daysToAdd)
    const hour = 9 + Math.floor(Math.random() * 8) // 9 AM - 4 PM
    const minute = Math.random() < 0.5 ? 0 : 30
    appointment.setHours(hour, minute, 0, 0)
    return appointment
  }, [])

  const appointmentLabel = useMemo(() => {
    return appointmentDateTime.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }) + `, ${appointmentDateTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
  }, [appointmentDateTime])

  const completedDateTime = useMemo(() => {
    const completed = new Date(appointmentDateTime)
    const daysToAdd = 1 + Math.floor(Math.random() * 5)
    completed.setDate(completed.getDate() + daysToAdd)
    const hour = 9 + Math.floor(Math.random() * 8)
    const minute = Math.random() < 0.5 ? 0 : 30
    completed.setHours(hour, minute, 0, 0)
    return completed
  }, [appointmentDateTime])

  const completedLabel = useMemo(() => {
    return completedDateTime.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }) + `, ${completedDateTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
  }, [completedDateTime])

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />
      
      {/* Timeline stages */}
      <div className="space-y-8">
        {stages.map((stage, index) => (
          <div key={stage.key} className="relative flex items-start gap-4">
            {/* Timeline node */}
            <div
              className={cn(
                'relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-4 transition-colors',
                stage.isCompleted
                  ? 'border-green-500 bg-green-500' // Completed - solid green
                  : stage.isCurrent
                  ? 'border-green-400 bg-white' // Current - green border, white center
                  : 'border-gray-300 bg-white' // Pending - grey border
              )}
            >
              {stage.isCompleted ? (
                <Check className="h-6 w-6 text-white" />
              ) : stage.isCurrent ? (
                <div className="h-3 w-3 rounded-full bg-green-400" />
              ) : (
                <div className="h-3 w-3 rounded-full bg-gray-300" />
              )}
            </div>
            
            {/* Stage label */}
            <div className="flex-1 pt-2">
              <div
                className={cn(
                  'text-base font-medium',
                  stage.isCompleted || stage.isCurrent
                    ? 'text-gray-900'
                    : 'text-gray-500'
                )}
              >
                {stage.label}
                {stage.key === 'appointment_scheduled' && (stage.isCompleted || stage.isCurrent) && (
                  <span className="ml-2 text-sm text-gray-500">({appointmentLabel})</span>
                )}
                {stage.key === 'completed' && (stage.isCompleted || stage.isCurrent) && (
                  <span className="ml-2 text-sm text-gray-500">({completedLabel})</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

