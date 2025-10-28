'use client'

import { DashboardLayout } from '@/components/layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'

export default function CalendarPage() {
  return (
    <DashboardLayout title="Calendar">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Calendar page coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

