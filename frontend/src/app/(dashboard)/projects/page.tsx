'use client'

import { DashboardLayout } from '@/components/layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'

export default function ProjectsPage() {
  return (
    <DashboardLayout title="Projects">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Projects page coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

