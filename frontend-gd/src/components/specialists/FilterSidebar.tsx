'use client'

import { useState, useMemo } from 'react'
import { Select } from '@/components/ui'
import { Search, X, Check, Filter } from 'lucide-react'
import { SPECIALTY_CATEGORIES, INSURANCE_OPTIONS, SORT_OPTIONS } from '@/constants/specialists'
import type { InsuranceProvider } from '@/types/specialists'
import { clsx } from 'clsx'

interface FilterSidebarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  primarySpecialty: string
  onPrimarySpecialtyChange: (specialty: string) => void
  subSpecialties: string[]
  onSubSpecialtiesChange: (subSpecialties: string[]) => void
  selectedInsurance: InsuranceProvider[]
  onInsuranceChange: (insurance: InsuranceProvider[]) => void
  sortBy: string
  onSortChange: (sort: string) => void
}

export function FilterSidebar({
  searchQuery,
  onSearchChange,
  primarySpecialty,
  onPrimarySpecialtyChange,
  subSpecialties,
  onSubSpecialtiesChange,
  selectedInsurance,
  onInsuranceChange,
  sortBy,
  onSortChange,
}: FilterSidebarProps) {
  const [insuranceSearchQuery, setInsuranceSearchQuery] = useState('')
  const [showInsuranceDropdown, setShowInsuranceDropdown] = useState(false)

  const availableSubSpecialties = useMemo(() => {
    if (!primarySpecialty) return []
    const category = SPECIALTY_CATEGORIES.find(c => c.category === primarySpecialty)
    return category?.subSpecialties || []
  }, [primarySpecialty])

  const filteredInsuranceOptions = useMemo(() => {
    if (!insuranceSearchQuery) return INSURANCE_OPTIONS
    return INSURANCE_OPTIONS.filter(insurance =>
      insurance.toLowerCase().includes(insuranceSearchQuery.toLowerCase())
    )
  }, [insuranceSearchQuery])

  const handleSubSpecialtyToggle = (subSpecialty: string) => {
    if (subSpecialties.includes(subSpecialty)) {
      onSubSpecialtiesChange(subSpecialties.filter(s => s !== subSpecialty))
    } else {
      onSubSpecialtiesChange([...subSpecialties, subSpecialty])
    }
  }

  const handleInsuranceSelect = (insurance: InsuranceProvider) => {
    if (!selectedInsurance.includes(insurance)) {
      onInsuranceChange([...selectedInsurance, insurance])
    }
    setInsuranceSearchQuery('')
    setShowInsuranceDropdown(false)
  }

  const handleInsuranceRemove = (insurance: InsuranceProvider) => {
    onInsuranceChange(selectedInsurance.filter(i => i !== insurance))
  }

  return (
    <div className="w-72 flex-shrink-0">
      <div className="bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm sticky top-24">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-neutral-50">
          <Filter className="h-4 w-4 text-emerald-600" />
          <h2 className="text-md font-semibold text-neutral-700">Filter</h2>
        </div>

        <div className="space-y-8">
          <div className="space-y-2">
            <Label>Search</Label>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 group-focus-within:text-emerald-600 transition-colors" />
              <input
                type="text"
                placeholder="Name or Practice"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border-transparent rounded-xl text-sm text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
              />
            </div>
          </div>

          <div>
            <Select
              label="Primary Specialty"
              value={primarySpecialty}
              onChange={(e) => {
                onPrimarySpecialtyChange(e.target.value)
                onSubSpecialtiesChange([])
              }}
              options={[
                { value: '', label: 'All Specialties' },
                ...SPECIALTY_CATEGORIES.map(cat => ({ value: cat.category, label: cat.category }))
              ]}
            />
          </div>

          {primarySpecialty && availableSubSpecialties.length > 0 && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
              <Label>Focus Area</Label>
              <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                {availableSubSpecialties.map((subSpecialty) => {
                  const isChecked = subSpecialties.includes(subSpecialty)
                  return (
                    <label
                      key={subSpecialty}
                      className="flex items-center gap-3 cursor-pointer group p-1.5 rounded-lg hover:bg-neutral-50 transition-colors"
                    >
                      <div
                        className={clsx(
                          "w-5 h-5 rounded-[6px] border flex items-center justify-center transition-all duration-200",
                          isChecked
                            ? "bg-emerald-500 border-emerald-500"
                            : "bg-white border-neutral-200 group-hover:border-neutral-300"
                        )}
                      >
                        <Check className={clsx("h-3.5 w-3.5 text-white transition-transform", isChecked ? "scale-100" : "scale-0")} strokeWidth={3} />
                      </div>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleSubSpecialtyToggle(subSpecialty)}
                        className="sr-only"
                      />
                      <span className={clsx("text-sm font-normal transition-colors", isChecked ? "text-neutral-900 font-medium" : "text-neutral-400")}>
                        {subSpecialty}
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Label>Insurance</Label>
            <div className="relative">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 group-focus-within:text-emerald-600 transition-colors" />
                <input
                  type="text"
                  placeholder="Add insurance..."
                  value={insuranceSearchQuery}
                  onChange={(e) => {
                    setInsuranceSearchQuery(e.target.value)
                    setShowInsuranceDropdown(true)
                  }}
                  onFocus={() => setShowInsuranceDropdown(true)}
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border-transparent rounded-xl text-sm text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                />
              </div>

              {showInsuranceDropdown && insuranceSearchQuery && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowInsuranceDropdown(false)} />
                  <div className="absolute z-20 w-full mt-2 bg-white border border-neutral-100 rounded-xl shadow-xl shadow-neutral-200/50 max-h-60 overflow-y-auto py-1">
                    {filteredInsuranceOptions.length === 0 ? (
                      <div className="px-4 py-3 text-sm font-normal text-neutral-400 text-center">No matches found</div>
                    ) : (
                      filteredInsuranceOptions
                        .filter(i => !selectedInsurance.includes(i))
                        .map((insurance) => (
                          <button
                            key={insurance}
                            onClick={() => handleInsuranceSelect(insurance)}
                            className="w-full text-left px-4 py-2 hover:bg-emerald-50 hover:text-emerald-700 text-sm font-normal text-neutral-400 transition-colors"
                          >
                            {insurance}
                          </button>
                        ))
                    )}
                  </div>
                </>
              )}
            </div>

            {selectedInsurance.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedInsurance.map((insurance) => (
                  <span
                    key={insurance}
                    className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 bg-neutral-100 border border-neutral-200 text-neutral-700 text-xs rounded-full font-medium"
                  >
                    <span className="max-w-[140px] truncate">{insurance}</span>
                    <button
                      onClick={() => handleInsuranceRemove(insurance)}
                      className="hover:bg-neutral-200 text-neutral-400 hover:text-neutral-600 rounded-full p-0.5 transition-colors"
                    >
                      <X className="h-3 w-3" strokeWidth={2} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-neutral-50">
            <Select
              label="Sort By"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              options={SORT_OPTIONS.map(opt => ({ value: opt.value, label: opt.label }))}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[10pt] font-medium text-neutral-400 ml-1 mb-1.5">
      {children}
    </label>
  )
}
