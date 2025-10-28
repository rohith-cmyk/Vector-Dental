'use client'

import { DashboardLayout } from '@/components/layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'

export default function NotificationsPage() {
  return (
    <DashboardLayout title="Notifications">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Notifications page coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

