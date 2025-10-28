'use client'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Skip authentication check in development
  return <>{children}</>
}

