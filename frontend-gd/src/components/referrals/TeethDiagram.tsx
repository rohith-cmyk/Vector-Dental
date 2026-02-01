'use client'

import { useState } from 'react'
import { Settings, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TeethDiagramProps {
  selectedTeeth: Array<string | number>
  onTeethChange: (teeth: Array<string | number>) => void
}

const ADULT_TEETH_UPPER = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
const ADULT_TEETH_LOWER = [17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32]

const PRIMARY_TEETH_UPPER = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
const PRIMARY_TEETH_LOWER = ['K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T']

type Section = 'upper' | 'lower'

export function TeethDiagram({ selectedTeeth, onTeethChange }: TeethDiagramProps) {
  const [showPrimary, setShowPrimary] = useState(false)

  const toggleTooth = (tooth: string | number) => {
    const isSelected = selectedTeeth.includes(tooth)
    if (isSelected) {
      onTeethChange(selectedTeeth.filter(t => t !== tooth))
    } else {
      onTeethChange([...selectedTeeth, tooth])
    }
  }

  const selectSection = (section: Section) => {
    let sectionTeeth: Array<string | number> = []

    if (showPrimary) {
      sectionTeeth = section === 'upper' ? PRIMARY_TEETH_UPPER : PRIMARY_TEETH_LOWER
    } else {
      sectionTeeth = section === 'upper' ? ADULT_TEETH_UPPER : ADULT_TEETH_LOWER
    }

    const allSelected = sectionTeeth.every(tooth => selectedTeeth.includes(tooth))

    if (allSelected) {
      onTeethChange(selectedTeeth.filter(t => !sectionTeeth.includes(t)))
    } else {
      const newSelected = [...new Set([...selectedTeeth, ...sectionTeeth])]
      onTeethChange(newSelected)
    }
  }

  const selectFullMouth = () => {
    const allTeeth = showPrimary
      ? [...PRIMARY_TEETH_UPPER, ...PRIMARY_TEETH_LOWER]
      : [...ADULT_TEETH_UPPER, ...ADULT_TEETH_LOWER]

    const allSelected = allTeeth.every(tooth => selectedTeeth.includes(tooth))
    onTeethChange(allSelected ? [] : allTeeth)
  }

  const clearSelection = () => {
    onTeethChange([])
  }

  const isSectionSelected = (section: Section): boolean => {
    let sectionTeeth: Array<string | number> = []

    if (showPrimary) {
      sectionTeeth = section === 'upper' ? PRIMARY_TEETH_UPPER : PRIMARY_TEETH_LOWER
    } else {
      sectionTeeth = section === 'upper' ? ADULT_TEETH_UPPER : ADULT_TEETH_LOWER
    }

    return sectionTeeth.length > 0 && sectionTeeth.every(tooth => selectedTeeth.includes(tooth))
  }

  const renderTooth = (tooth: string | number, index: number, total: number, isUpper: boolean) => {
    const isSelected = selectedTeeth.includes(tooth)
    const position = (index / (total - 1)) * 100
    const angle = isUpper ? (50 - position) * 0.2 : (position - 50) * 0.2
    const offsetY = isUpper ? (Math.abs(position - 50) ** 2) / 40 : -(Math.abs(position - 50) ** 2) / 40

    return (
      <button
        key={tooth}
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          toggleTooth(tooth)
        }}
        className={cn(
          'relative w-8 h-12 rounded-2xl border flex items-center justify-center text-xs font-medium transition-all duration-200',
          'hover:scale-105 hover:shadow-md focus:outline-none z-10',
          'bg-gradient-to-br from-white to-gray-50',
          isSelected
            ? 'border-gray-200 text-gray-700 ring-2 ring-cyan-400 shadow-[0_0_12px_rgba(56,189,248,0.4)]'
            : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:shadow-sm'
        )}
        style={{
          transform: `rotate(${angle}deg) translateY(${offsetY}px)`,
          transformOrigin: 'center center',
        }}
        title={`Tooth ${tooth}`}
      >
        {tooth}
      </button>
    )
  }

  const renderArch = (
    section: Section,
    adultTeeth: Array<number>,
    primaryTeeth: Array<string>,
    label: string,
    isUpper: boolean
  ) => {
    const sectionSelected = isSectionSelected(section)
    const teeth = showPrimary ? primaryTeeth : adultTeeth

    return (
      <div
        className={cn(
          'relative p-4 rounded-lg border transition-all cursor-pointer min-h-[140px]',
          sectionSelected
            ? 'border-cyan-300 bg-cyan-50/30'
            : 'border-gray-200 bg-white/50 hover:border-gray-300 hover:bg-gray-50',
          isUpper ? 'pb-24' : 'pt-24'
        )}
        onClick={() => selectSection(section)}
        title={`Click to select/deselect ${label} section`}
      >
        <div className="absolute top-2 left-3 text-xs font-medium text-gray-400 z-20">
          {label}
        </div>

        <div className="flex items-center gap-1 mt-8 justify-center">
          {teeth.map((tooth, index) => renderTooth(tooth, index, teeth.length, isUpper))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-xl font-semibold text-neutral-800">Teeth</h4>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={selectFullMouth}
            className="px-4 py-2 text-sm font-medium text-neutral-700 hover:text-neutral-800 bg-neutral-100 rounded-lg hover:border-neutral-300 transition-colors"
          >
            Select full mouth
          </button>
          <button
            type="button"
            className="p-2 text-neutral-400 hover:text-neutral-600 bg-neutral-100 rounded-lg border border-black/10 hover:border-neutral-300 transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowPrimary(false)}
          className={cn(
            'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
            !showPrimary
              ? 'bg-neutral-800 text-white'
              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
          )}
        >
          Adult
        </button>
        <button
          type="button"
          onClick={() => setShowPrimary(true)}
          className={cn(
            'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
            showPrimary
              ? 'bg-neutral-800 text-white'
              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
          )}
        >
          Primary
        </button>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <div className="mb-8 mt-4">
          {renderArch('upper', ADULT_TEETH_UPPER, PRIMARY_TEETH_UPPER, 'Upper', true)}
        </div>
        <div className="mb-4">
          {renderArch('lower', ADULT_TEETH_LOWER, PRIMARY_TEETH_LOWER, 'Lower', false)}
        </div>
      </div>

      {selectedTeeth.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <span className="text-sm font-medium text-neutral-700">Selected:</span>
          {selectedTeeth
            .sort((a, b) => {
              if (typeof a === 'number' && typeof b === 'number') return a - b
              if (typeof a === 'string' && typeof b === 'string') return a.localeCompare(b)
              return typeof a === 'number' ? -1 : 1
            })
            .map(tooth => (
              <button
                key={tooth}
                type="button"
                onClick={() => toggleTooth(tooth)}
                className="px-3 py-1 text-sm font-medium bg-cyan-500 text-white rounded-full hover:bg-cyan-600 flex items-center gap-1 transition-colors shadow-sm"
              >
                {tooth}
                <X className="w-3 h-3" />
              </button>
            ))}
          <button
            type="button"
            onClick={clearSelection}
            className="ml-auto px-3 py-1 text-xs text-neutral-500 hover:text-neutral-700 font-medium"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  )
}
