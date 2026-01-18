'use client'

import { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

interface DashboardLayoutProps {
  children: ReactNode
  title: string
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="pl-64">
        <Header title={title} />
        
        <main className="px-8 pb-8 pt-2">
          {children}
        </main>
      </div>
    </div>
  )
}

