'use client'

import { DashboardLayout } from '@/components/layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'

export default function CompaniesPage() {
  return (
    <DashboardLayout title="Companies">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Companies</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Companies page coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

