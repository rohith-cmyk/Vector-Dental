'use client'

import { useState } from 'react'
import { Settings, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TeethDiagramProps {
  selectedTeeth: Array<string | number>
  onTeethChange: (teeth: Array<string | number>) => void
}

// Adult teeth: 1-32 (FDI numbering system)
// 1-8: Upper Right, 9-16: Upper Left, 17-24: Lower Left, 25-32: Lower Right
// Primary teeth: A-T (FDI numbering system)
// A-E: Upper Right, F-J: Upper Left, K-O: Lower Left, P-T: Lower Right

const ADULT_TEETH_UPPER_RIGHT = [1, 2, 3, 4, 5, 6, 7, 8]
const ADULT_TEETH_UPPER_LEFT = [9, 10, 11, 12, 13, 14, 15, 16]
const ADULT_TEETH_LOWER_LEFT = [17, 18, 19, 20, 21, 22, 23, 24]
const ADULT_TEETH_LOWER_RIGHT = [25, 26, 27, 28, 29, 30, 31, 32]

const PRIMARY_TEETH_UPPER_RIGHT = ['A', 'B', 'C', 'D', 'E']
const PRIMARY_TEETH_UPPER_LEFT = ['F', 'G', 'H', 'I', 'J']
const PRIMARY_TEETH_LOWER_LEFT = ['K', 'L', 'M', 'N', 'O']
const PRIMARY_TEETH_LOWER_RIGHT = ['P', 'Q', 'R', 'S', 'T']

type Section = 'upper-right' | 'upper-left' | 'lower-left' | 'lower-right'

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
      switch (section) {
        case 'upper-right':
          sectionTeeth = PRIMARY_TEETH_UPPER_RIGHT
          break
        case 'upper-left':
          sectionTeeth = PRIMARY_TEETH_UPPER_LEFT
          break
        case 'lower-left':
          sectionTeeth = PRIMARY_TEETH_LOWER_LEFT
          break
        case 'lower-right':
          sectionTeeth = PRIMARY_TEETH_LOWER_RIGHT
          break
      }
    } else {
      switch (section) {
        case 'upper-right':
          sectionTeeth = ADULT_TEETH_UPPER_RIGHT
          break
        case 'upper-left':
          sectionTeeth = ADULT_TEETH_UPPER_LEFT
          break
        case 'lower-left':
          sectionTeeth = ADULT_TEETH_LOWER_LEFT
          break
        case 'lower-right':
          sectionTeeth = ADULT_TEETH_LOWER_RIGHT
          break
      }
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
      ? [...PRIMARY_TEETH_UPPER_RIGHT, ...PRIMARY_TEETH_UPPER_LEFT, ...PRIMARY_TEETH_LOWER_LEFT, ...PRIMARY_TEETH_LOWER_RIGHT]
      : [...ADULT_TEETH_UPPER_RIGHT, ...ADULT_TEETH_UPPER_LEFT, ...ADULT_TEETH_LOWER_LEFT, ...ADULT_TEETH_LOWER_RIGHT]
    
    const allSelected = allTeeth.every(tooth => selectedTeeth.includes(tooth))
    onTeethChange(allSelected ? [] : allTeeth)
  }

  const clearSelection = () => {
    onTeethChange([])
  }

  const isSectionSelected = (section: Section): boolean => {
    let sectionTeeth: Array<string | number> = []
    
    if (showPrimary) {
      switch (section) {
        case 'upper-right': sectionTeeth = PRIMARY_TEETH_UPPER_RIGHT; break
        case 'upper-left': sectionTeeth = PRIMARY_TEETH_UPPER_LEFT; break
        case 'lower-left': sectionTeeth = PRIMARY_TEETH_LOWER_LEFT; break
        case 'lower-right': sectionTeeth = PRIMARY_TEETH_LOWER_RIGHT; break
      }
    } else {
      switch (section) {
        case 'upper-right': sectionTeeth = ADULT_TEETH_UPPER_RIGHT; break
        case 'upper-left': sectionTeeth = ADULT_TEETH_UPPER_LEFT; break
        case 'lower-left': sectionTeeth = ADULT_TEETH_LOWER_LEFT; break
        case 'lower-right': sectionTeeth = ADULT_TEETH_LOWER_RIGHT; break
      }
    }
    
    return sectionTeeth.length > 0 && sectionTeeth.every(tooth => selectedTeeth.includes(tooth))
  }

  const renderTooth = (tooth: string | number, index: number, total: number, isUpper: boolean, isLeft: boolean) => {
    const isSelected = selectedTeeth.includes(tooth)
    // Create curved arch effect using transform
    const position = (index / (total - 1)) * 100 // 0 to 100%
    const angle = isUpper ? (position - 50) * 0.3 : (50 - position) * 0.3 // Curve angle
    const offsetY = isUpper ? -(Math.abs(position - 50) ** 2) / 25 : (Math.abs(position - 50) ** 2) / 25
    
    return (
      <button
        key={tooth}
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          toggleTooth(tooth)
        }}
        className={cn(
          'relative w-11 h-16 rounded-full border-2 flex items-center justify-center text-xs font-medium transition-all',
          'hover:scale-110 hover:shadow-lg focus:outline-none z-10',
          isSelected
            ? 'bg-emerald-400 border-emerald-300 text-white shadow-lg'
            : 'bg-gray-800 border-gray-600 text-white hover:border-gray-500'
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
    isUpper: boolean,
    isLeft: boolean
  ) => {
    const sectionSelected = isSectionSelected(section)
    const teethToShow = showPrimary ? primaryTeeth : adultTeeth
    
    return (
      <div
        className={cn(
          'relative p-4 rounded-lg border-2 transition-all cursor-pointer min-h-[120px]',
          sectionSelected
            ? 'border-emerald-400 bg-emerald-900/20'
            : 'border-gray-700 bg-gray-900/50 hover:border-gray-600'
        )}
        onClick={() => selectSection(section)}
        title={`Click to select/deselect ${label} section`}
      >
        <div className="absolute top-2 left-3 text-xs font-medium text-gray-400 uppercase z-20">
          {label}
        </div>
        
        {/* Teeth arranged in an arch */}
        <div className={cn(
          'flex items-center gap-1 mt-8 justify-center',
          isLeft ? 'flex-row-reverse' : 'flex-row'
        )}>
          {teethToShow.map((tooth, index) => renderTooth(tooth, index, teethToShow.length, isUpper, isLeft))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-gray-300">Teeth</h4>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={selectFullMouth}
            className="px-4 py-2 text-sm font-medium text-emerald-400 hover:text-emerald-300 bg-gray-800 rounded-lg border border-gray-700 hover:border-emerald-400 transition-colors"
          >
            Select full mouth
          </button>
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-gray-300 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Toggle Adult/Primary */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowPrimary(false)}
          className={cn(
            'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
            !showPrimary
              ? 'bg-emerald-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
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
              ? 'bg-emerald-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          )}
        >
          Primary
        </button>
      </div>

      {/* Mouth-shaped Teeth Diagram - Curved arches */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
        {/* Upper Arch - Curved down */}
        <div className="mb-8">
          <div className="grid grid-cols-2 gap-4">
            {renderArch('upper-left', ADULT_TEETH_UPPER_LEFT, PRIMARY_TEETH_UPPER_LEFT, 'Upper Left', true, true)}
            {renderArch('upper-right', ADULT_TEETH_UPPER_RIGHT, PRIMARY_TEETH_UPPER_RIGHT, 'Upper Right', true, false)}
          </div>
        </div>

        {/* Lower Arch - Curved up */}
        <div>
          <div className="grid grid-cols-2 gap-4">
            {renderArch('lower-left', ADULT_TEETH_LOWER_LEFT, PRIMARY_TEETH_LOWER_LEFT, 'Lower Left', false, true)}
            {renderArch('lower-right', ADULT_TEETH_LOWER_RIGHT, PRIMARY_TEETH_LOWER_RIGHT, 'Lower Right', false, false)}
          </div>
        </div>
      </div>

      {/* Selected Teeth Display - Chips at bottom */}
      {selectedTeeth.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 p-4 bg-emerald-900/20 rounded-lg border border-emerald-700/50">
          <span className="text-sm font-medium text-gray-300">Selected:</span>
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
                className="px-3 py-1 text-sm font-medium bg-emerald-600 text-white rounded-full hover:bg-emerald-700 flex items-center gap-1 transition-colors"
              >
                {tooth}
                <X className="w-3 h-3" />
              </button>
            ))}
          <button
            type="button"
            onClick={clearSelection}
            className="ml-auto px-3 py-1 text-xs text-gray-400 hover:text-gray-300 font-medium"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  )
}
