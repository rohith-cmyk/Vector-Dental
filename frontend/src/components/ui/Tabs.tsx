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
      <div className="bg-white border border-black/5 rounded-xl p-1 max-w-fit shadow-sm">
        <nav className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                'flex w-fit items-center gap-2 py-2 px-4 rounded-lg border font-medium text-xs transition-all duration-200 flex-1 justify-center',
                activeTab === tab.id
                  ? 'bg-white text-neutral-600 shadow-sm border-black/5'
                  : 'text-neutral-400 hover:bg-neutral-100 border-transparent hover:text-neutral-700 hover:shadow-sm'
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className={cn(
                  'ml-1 py-0.5 px-2 rounded-full text-xs font-medium',
                  activeTab === tab.id
                    ? 'bg-neutral-100 text-neutral-600'
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

