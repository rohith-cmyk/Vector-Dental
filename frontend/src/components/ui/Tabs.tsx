'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface Tab {
  id: string
  label: string
  icon?: React.ReactNode
  badge?: number
}

interface TabsProps {
  tabs: Tab[]
  defaultTab?: string
  onChange?: (tabId: string) => void
  children: (activeTab: string) => React.ReactNode
}

export function Tabs({ tabs, defaultTab, onChange, children }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id)

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    onChange?.(tabId)
  }

  return (
    <div>
      <div className="bg-white border border-black/10 rounded-2xl p-1.5 max-w-fit shadow-sm">
        <nav className="flex gap-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                'flex w-fit items-center gap-2 py-3 px-6 rounded-xl border font-semibold text-sm transition-all duration-200 flex-1 justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200',
                activeTab === tab.id
                  ? 'bg-emerald-50 text-emerald-700 shadow-md border-emerald-200'
                  : 'text-neutral-500 bg-neutral-50/60 hover:bg-neutral-100 border-transparent hover:text-neutral-800 hover:shadow-sm'
              )}
            >
              {tab.icon}
              <span className="whitespace-nowrap">{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className={cn(
                  'ml-1 py-0.5 px-2 rounded-full text-xs font-medium',
                  activeTab === tab.id
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-neutral-200 text-neutral-500'
                )}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-6">
        {children(activeTab)}
      </div>
    </div>
  )
}

