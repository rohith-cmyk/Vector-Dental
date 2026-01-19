'use client'

import { Check } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface TimelineStage {
  key: string
  label: string
  status: string
  isCompleted: boolean
  isCurrent: boolean
  isPending: boolean
  dateLabel?: string
}

interface StatusTimelineProps {
  stages: TimelineStage[]
  renderAfterStage?: (stage: TimelineStage) => ReactNode
}

export function StatusTimeline({ stages, renderAfterStage }: StatusTimelineProps) {
  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />
      
      {/* Timeline stages */}
      <div className="space-y-8">
        {stages.map((stage) => (
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
            <div className="flex-1 pt-2 space-y-2">
              <div
                className={cn(
                  'text-base font-medium',
                  stage.isCompleted || stage.isCurrent
                    ? 'text-gray-900'
                    : 'text-gray-500'
                )}
              >
                {stage.label}
                {stage.dateLabel && (stage.isCompleted || stage.isCurrent) && (
                  <span className="ml-2 text-sm text-gray-500">({stage.dateLabel})</span>
                )}
              </div>
              {renderAfterStage?.(stage)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

