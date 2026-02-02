'use client'

import { Card, CardContent } from '@/components/ui'
import { CheckSquare, Clock, Calendar, Timer } from 'lucide-react'

interface OverviewMetricsProps {
  dailyAverage: number
  avgSchedule: string
  avgAppointment: string
  avgTimeToTreatment: string
}

export function OverviewMetrics({
  dailyAverage,
  avgSchedule,
  avgAppointment,
  avgTimeToTreatment,
}: OverviewMetricsProps) {
  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Overview</h3>
        
        <div className="space-y-6">
          {/* Daily Average */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-emerald-600">{dailyAverage.toFixed(2)}</div>
              <div className="text-sm text-neutral-500 mt-1">Daily Average Appointments</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* Avg. Schedule */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-emerald-600">{avgSchedule}</div>
              <div className="text-sm text-neutral-500 mt-1">Avg. Time-to-Schedule</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* Avg. Appointment */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-emerald-600">{avgAppointment}</div>
              <div className="text-sm text-neutral-500 mt-1">Avg. Time-to-Appointment</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* Avg. Time-to-Treatment */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-emerald-600">{avgTimeToTreatment}</div>
              <div className="text-sm text-neutral-500 mt-1">Avg. Time-to-Treatment</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
              <Timer className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
