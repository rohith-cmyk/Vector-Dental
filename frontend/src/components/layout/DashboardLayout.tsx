'use client'

import { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { FeedbackButton } from '@/components/feedback/FeedbackButton'

interface DashboardLayoutProps {
  children: ReactNode
  title: string
  subtitle?: string
  actions?: ReactNode
}

export function DashboardLayout({ children, title, subtitle, actions }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="pl-64">
        <Header title={title} subtitle={subtitle} actions={actions} />
        
        <main className="px-8 pb-8 pt-2">
          {children}
        </main>
      </div>

      <FeedbackButton />
    </div>
  )
}

