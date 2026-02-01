'use client'

import { useState, useMemo } from 'react'
import { Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InteractiveToothChartProps {
  selectedTeeth: string[]
  onTeethChange: (teeth: string[]) => void
  readOnly?: boolean
  variant?: 'dark' | 'light'
  size?: 'md' | 'sm'
  className?: string
}

type NumberingSystem = 'UNS' | 'FDI'

interface ToothData {
  id: string
  uns: string
  fdi: string
  quadrant: 'UR' | 'UL' | 'LL' | 'LR'
  x: number
  y: number
  rotation: number
  type: ToothType
}

type ToothType = 'incisor' | 'canine' | 'premolar' | 'molar'
type ToothQuadrant = 'upper-left' | 'upper-right' | 'lower-left' | 'lower-right'

const TOOTH_BASE_WIDTH = 100
const TOOTH_BASE_HEIGHT = 120
const TOOTH_SCALE = 0.35
const LOWER_ARCH_Y_OFFSET = 60
const PRIMARY_TOOTH_SCALE = 0.26
const PRIMARY_LOWER_OFFSET = 32

const TOOTH_SHAPES: Record<ToothType, string> = {
  incisor:
    'M32 12 C34 10 38 8 42 8 H58 C62 8 66 10 68 12 C70 14 72 18 74 24 L78 50 C78 58 78 66 76 72 L68 100 C66 104 62 108 58 110 C56 111 54 112 50 112 C46 112 44 111 42 110 C38 108 34 104 32 100 L24 72 C22 66 22 58 22 50 L26 24 C28 18 30 14 32 12 Z',
  canine:
    'M26 16 C32 10 38 8 44 10 L50 12 L56 10 C62 8 68 10 74 16 L82 44 C84 54 82 62 76 70 L62 102 C58 108 54 112 50 112 C46 112 42 108 38 102 L24 70 C18 62 16 54 18 44 Z',
  premolar:
    'M22 20 C28 12 38 10 46 12 L50 14 L54 12 C62 10 72 12 78 20 L86 46 C88 56 86 66 80 76 L66 102 C60 108 54 112 50 112 C46 112 40 108 34 102 L20 76 C14 66 12 56 14 46 Z',
  molar:
    'M18 30 C24 18 36 14 46 16 L50 18 L54 16 C64 14 76 18 82 30 L90 52 C94 64 92 76 86 88 L70 108 C62 114 56 116 50 116 C44 116 38 114 30 108 L14 88 C8 76 6 64 10 52 Z',
}

const TOOTH_INNER_SHADING: Record<ToothType, string> = {
  incisor:
    'M36 22 C38 20 42 18 46 18 H54 C58 18 62 20 64 22 C66 24 68 28 69 32 L72 50 C72 56 72 62 70 66 L64 90 C62 94 58 98 54 100 C52 101 51 102 50 102 C49 102 48 101 46 100 C42 98 38 94 36 90 L30 66 C28 62 28 56 28 50 L31 32 C32 28 34 24 36 22 Z',
  canine:
    'M32 26 C36 20 42 18 46 20 L50 22 L54 20 C58 18 64 20 68 26 L74 44 C76 52 74 60 70 68 L56 94 C54 98 52 100 50 100 C48 100 46 98 44 94 L30 68 C26 60 24 52 26 44 Z',
  premolar:
    'M30 30 C36 24 42 22 46 24 L50 26 L54 24 C58 22 64 24 70 30 L76 46 C78 54 76 62 72 70 L58 94 C56 98 52 100 50 100 C48 100 44 98 42 94 L28 70 C24 62 22 54 24 46 Z',
  molar:
    'M30 38 C36 30 42 28 46 30 L50 32 L54 30 C58 28 64 30 70 38 L76 54 C78 62 76 70 72 78 L60 92 C56 96 52 98 50 98 C48 98 44 96 40 92 L28 78 C24 70 22 62 24 54 Z',
}

const TOOTH_OCCLUSAL_DETAIL: Record<ToothType, string | null> = {
  incisor: null,
  canine: null,
  premolar: null,
  molar: 'M50 48 L62 60 L50 72 L38 60 Z M50 54 L56 60 L50 66 L44 60 Z',
}

const getToothType = (indexFromCenter: number): ToothType => {
  if (indexFromCenter <= 1) return 'incisor'
  if (indexFromCenter === 2) return 'canine'
  if (indexFromCenter === 3 || indexFromCenter === 4) return 'premolar'
  return 'molar'
}

const getPrimaryToothType = (label: string): ToothType => {
  if (['A', 'J', 'T', 'K'].includes(label)) return 'molar'
  if (['B', 'I', 'S', 'L'].includes(label)) return 'canine'
  return 'incisor'
}

const mapQuadrant = (quad: ToothData['quadrant']): ToothQuadrant => {
  switch (quad) {
    case 'UR':
      return 'upper-right'
    case 'UL':
      return 'upper-left'
    case 'LL':
      return 'lower-left'
    case 'LR':
      return 'lower-right'
  }
}

const ToothShape = ({
  type,
  selected,
  quadrant,
  scale = TOOTH_SCALE,
  isPrimary = false,
}: {
  type: ToothType
  selected: boolean
  quadrant: ToothQuadrant
  scale?: number
  isPrimary?: boolean
}) => {
  const isUpper = quadrant.startsWith('upper')
  const isLeft = quadrant.endsWith('left')
  const scaleX = isLeft ? -1 : 1
  const scaleY = isUpper ? 1 : -1
  const translateToCenter = `translate(${-TOOTH_BASE_WIDTH / 2}, ${-TOOTH_BASE_HEIGHT / 2})`
  const occlusalFill = quadrant.startsWith('lower') ? 'rgba(120, 102, 84, 0.22)' : 'rgba(120, 102, 84, 0.35)'

  return (
    <g transform={`scale(${scale})`}>
      <g transform={`scale(${scaleX}, ${scaleY})`}>
        <g transform={translateToCenter}>
          {selected && (
            <path
              d={TOOTH_SHAPES[type]}
              fill="none"
              stroke="rgba(16, 185, 129, 0.8)"
              strokeWidth="6"
            />
          )}
          <path
            d={TOOTH_SHAPES[type]}
            fill={isPrimary ? "url(#primary-tooth-gradient)" : "url(#tooth-enamel)"}
            stroke="rgba(209, 213, 219, 0.6)"
            strokeWidth="1.8"
          />
          <path
            d={TOOTH_INNER_SHADING[type]}
            fill={isPrimary ? "url(#primary-tooth-shade)" : "url(#tooth-shade)"}
            opacity="0.55"
          />
          {TOOTH_OCCLUSAL_DETAIL[type] && (
            <path
              d={TOOTH_OCCLUSAL_DETAIL[type] as string}
              fill={occlusalFill}
            />
          )}
        </g>
      </g>
    </g>
  )
}

export function InteractiveToothChart({
  selectedTeeth,
  onTeethChange,
  readOnly = false,
  variant = 'light',
  size = 'md',
  className,
}: InteractiveToothChartProps) {
  const [system, setSystem] = useState<NumberingSystem>('UNS')
  const isDark = variant === 'dark'
  const theme = {
    container: isDark
      ? 'bg-[#111827] border-gray-800 text-gray-100 shadow-2xl'
      : 'bg-white border-gray-200 text-gray-900 shadow-lg',
    subtext: isDark ? 'fill-gray-500' : 'fill-gray-400',
    button: isDark
      ? 'text-emerald-400 hover:text-emerald-300 border-emerald-900 bg-emerald-950/30'
      : 'text-emerald-700 hover:text-emerald-800 border-emerald-200 bg-emerald-50',
    toggleWrap: isDark ? 'bg-gray-800' : 'bg-gray-100',
    toggleActive: 'bg-emerald-600 text-white',
    toggleInactive: isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800',
    arcDefault: isDark ? '#374151' : '#e5e7eb',
    toothStroke: isDark ? '#4b5563' : '#d1d5db',
    divider: isDark ? '#1f2937' : '#e5e7eb',
    label: isDark ? '#6b7280' : '#9ca3af',
    emptyText: isDark ? 'text-gray-600' : 'text-gray-400',
  }
  const sizeClass = size === 'sm' ? 'max-w-md p-4' : 'max-w-lg p-6'

  const teethData = useMemo(() => {
    const teeth: ToothData[] = []
    const width = 400
    const height = 500
    const cx = width / 2
    const cy = height / 2 - 20
    const rx = 140
    const ry = 160

    const addTooth = (
      uns: number,
      fdi: number,
      quad: 'UR' | 'UL' | 'LL' | 'LR',
      indexFromCenter: number,
      isUpper: boolean,
      isRight: boolean
    ) => {
      const angleStep = 11
      const startAngle = 6

      let angleDeg: number
      if (isUpper) {
        if (isRight) {
          angleDeg = -90 - (startAngle + indexFromCenter * angleStep)
        } else {
          angleDeg = -90 + (startAngle + indexFromCenter * angleStep)
        }
      } else {
        if (isRight) {
          angleDeg = 90 + (startAngle + indexFromCenter * angleStep)
        } else {
          angleDeg = 90 - (startAngle + indexFromCenter * angleStep)
        }
      }

      const angleRad = (angleDeg * Math.PI) / 180
      const frontOffset = indexFromCenter <= 1 ? -12 : 0
      const localRx = rx + frontOffset
      const localRy = ry + frontOffset

      const x = cx + localRx * Math.cos(angleRad)
      const y = cy + localRy * Math.sin(angleRad) + (isUpper ? 0 : LOWER_ARCH_Y_OFFSET)

      teeth.push({
        id: uns.toString(),
        uns: uns.toString(),
        fdi: fdi.toString(),
        quadrant: quad,
        x,
        y,
        rotation: angleDeg + 90,
        type: getToothType(indexFromCenter),
      })
    }

    for (let i = 0; i < 8; i++) {
      addTooth(8 - i, 11 + i, 'UR', i, true, true)
    }

    for (let i = 0; i < 8; i++) {
      addTooth(9 + i, 21 + i, 'UL', i, true, false)
    }

    for (let i = 0; i < 8; i++) {
      addTooth(24 - i, 31 + i, 'LL', i, false, false)
    }

    for (let i = 0; i < 8; i++) {
      addTooth(25 + i, 41 + i, 'LR', i, false, true)
    }

    return teeth
  }, [])

  const primaryTeethData = useMemo(() => {
    const teeth: ToothData[] = []
    const width = 400
    const height = 500
    const cx = width / 2
    const cy = height / 2 - 10
    const rx = 85
    const ry = 95

    const addPrimaryTooth = (
      label: string,
      quad: 'UR' | 'UL' | 'LL' | 'LR',
      indexFromCenter: number,
      isUpper: boolean,
      isRight: boolean
    ) => {
      const angleStep = 12
      const startAngle = 8

      let angleDeg: number
      if (isUpper) {
        angleDeg = isRight
          ? -90 - (startAngle + indexFromCenter * angleStep)
          : -90 + (startAngle + indexFromCenter * angleStep)
      } else {
        angleDeg = isRight
          ? 90 + (startAngle + indexFromCenter * angleStep)
          : 90 - (startAngle + indexFromCenter * angleStep)
      }

      const angleRad = (angleDeg * Math.PI) / 180
      const x = cx + rx * Math.cos(angleRad)
      const y = cy + ry * Math.sin(angleRad) + (isUpper ? 0 : PRIMARY_LOWER_OFFSET)

      teeth.push({
        id: label,
        uns: label,
        fdi: label,
        quadrant: quad,
        x,
        y,
        rotation: angleDeg + 90,
        type: getPrimaryToothType(label),
      })
    }

    const upperRight = ['E', 'D', 'C', 'B', 'A']
    const upperLeft = ['F', 'G', 'H', 'I', 'J']
    const lowerLeft = ['O', 'N', 'M', 'L', 'K']
    const lowerRight = ['P', 'Q', 'R', 'S', 'T']

    upperRight.forEach((label, i) => addPrimaryTooth(label, 'UR', i, true, true))
    upperLeft.forEach((label, i) => addPrimaryTooth(label, 'UL', i, true, false))
    lowerLeft.forEach((label, i) => addPrimaryTooth(label, 'LL', i, false, false))
    lowerRight.forEach((label, i) => addPrimaryTooth(label, 'LR', i, false, true))

    return teeth
  }, [])

  const toggleTooth = (id: string) => {
    if (readOnly) return
    const newSelection = selectedTeeth.includes(id)
      ? selectedTeeth.filter(t => t !== id)
      : [...selectedTeeth, id]
    onTeethChange(newSelection)
  }

  const toggleQuadrant = (quad: 'UR' | 'UL' | 'LL' | 'LR') => {
    if (readOnly) return
    const quadTeeth = teethData.filter(t => t.quadrant === quad).map(t => t.id)
    const allSelected = quadTeeth.every(id => selectedTeeth.includes(id))

    let newSelection = [...selectedTeeth]
    if (allSelected) {
      newSelection = newSelection.filter(id => !quadTeeth.includes(id))
    } else {
      quadTeeth.forEach(id => {
        if (!newSelection.includes(id)) newSelection.push(id)
      })
    }
    onTeethChange(newSelection)
  }

  const selectFullMouth = () => {
    if (readOnly) return
    const allIds = teethData.map(t => t.id)
    const allSelected = allIds.every(id => selectedTeeth.includes(id))
    onTeethChange(allSelected ? [] : allIds)
  }

  const getQuadrantPath = (quad: 'UR' | 'UL' | 'LL' | 'LR') => {
    const cx = 200
    const cy = 250 - 20
    const rx = 185
    const ry = 205
    const yOffset = (quad === 'UL' || quad === 'UR') ? 0 : LOWER_ARCH_Y_OFFSET

    let startAngle = 0
    let endAngle = 0

    const gap = 0.05

    switch (quad) {
      case 'UR':
        startAngle = -Math.PI + gap
        endAngle = -Math.PI / 2 - gap
        break
      case 'UL':
        startAngle = -Math.PI / 2 + gap
        endAngle = -gap
        break
      case 'LL':
        startAngle = gap
        endAngle = Math.PI / 2 - gap
        break
      case 'LR':
        startAngle = Math.PI / 2 + gap
        endAngle = Math.PI - gap
        break
    }

    const x1 = cx + rx * Math.cos(startAngle)
    const y1 = cy + ry * Math.sin(startAngle) + yOffset

    const x2 = cx + rx * Math.cos(endAngle)
    const y2 = cy + ry * Math.sin(endAngle) + yOffset

    return `M ${x1} ${y1} A ${rx} ${ry} 0 0 1 ${x2} ${y2}`
  }

  const quadLabels = [
    { id: 'UR', label: 'Upper Right', x: 48, y: 48 },
    { id: 'UL', label: 'Upper Left', x: 352, y: 48 },
    { id: 'LR', label: 'Lower Right', x: 62, y: 495 },
    { id: 'LL', label: 'Lower Left', x: 352, y: 495 },
  ]

  const getQuadStatus = (quad: 'UR' | 'UL' | 'LL' | 'LR') => {
    const quadTeethIds = teethData.filter(t => t.quadrant === quad).map(t => t.id)
    const selectedCount = quadTeethIds.filter(id => selectedTeeth.includes(id)).length
    if (selectedCount === quadTeethIds.length) return 'all'
    if (selectedCount > 0) return 'some'
    return 'none'
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center rounded-xl mx-auto border',
        theme.container,
        sizeClass,
        className
      )}
    >
      <div className="w-full flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900">Teeth</h3>

        <div className="flex items-center gap-3">
          <button
            onClick={selectFullMouth}
            className={cn(
              'text-xs font-medium border px-3 py-1.5 rounded-full transition-colors',
              theme.button
            )}
            type="button"
          >
            Select full mouth
          </button>

          <div className={cn('flex rounded-lg p-1', theme.toggleWrap)}>
            <button
              onClick={() => setSystem('UNS')}
              className={cn(
                "text-xs px-2 py-1 rounded-md transition-colors font-medium",
                system === 'UNS' ? theme.toggleActive : theme.toggleInactive
              )}
            >
              UNS
            </button>
            <button
              onClick={() => setSystem('FDI')}
              className={cn(
                "text-xs px-2 py-1 rounded-md transition-colors font-medium",
                system === 'FDI' ? theme.toggleActive : theme.toggleInactive
              )}
            >
              FDI
            </button>
          </div>
        </div>
      </div>

      <div className="relative w-full aspect-[4/5] select-none">
        <svg viewBox="0 0 400 560" className="w-full h-full drop-shadow-2xl">
          <defs>
            <linearGradient id="tooth-enamel" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="45%" stopColor="#FAFAFA" />
              <stop offset="78%" stopColor="#F5F5F5" />
              <stop offset="100%" stopColor="#F0F0F0" />
            </linearGradient>
            <linearGradient id="primary-tooth-gradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#F3F4F6" />
              <stop offset="45%" stopColor="#E5E7EB" />
              <stop offset="78%" stopColor="#D1D5DB" />
              <stop offset="100%" stopColor="#C4C8CC" />
            </linearGradient>
            <radialGradient id="tooth-shade" cx="42%" cy="32%" r="62%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#F5F5F5" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#E5E5E5" stopOpacity="0.2" />
            </radialGradient>
            <radialGradient id="primary-tooth-shade" cx="42%" cy="32%" r="62%">
              <stop offset="0%" stopColor="#E5E7EB" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#D1D5DB" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#B8BCC2" stopOpacity="0.3" />
            </radialGradient>
            <filter id="tooth-shadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="rgba(15, 23, 42, 0.25)" />
            </filter>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {(['UR', 'UL', 'LR', 'LL'] as const).map(quad => {
            const status = getQuadStatus(quad)
            return (
              <path
                key={`quad-${quad}`}
                d={getQuadrantPath(quad)}
                fill="none"
                stroke={status === 'all' ? '#10b981' : status === 'some' ? '#34d399' : theme.arcDefault}
                strokeWidth="2"
                strokeLinecap="round"
                className={cn(
                  "transition-all duration-300 cursor-pointer hover:stroke-cyan-400 hover:stroke-[3]",
                  status !== 'none' && "filter drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                )}
                onClick={() => toggleQuadrant(quad)}
              />
            )
          })}

          {teethData.map((tooth) => {
            const isSelected = selectedTeeth.includes(tooth.id)
            return (
              <g
                key={tooth.id}
                transform={`translate(${tooth.x}, ${tooth.y}) rotate(${tooth.rotation})`}
                onClick={() => toggleTooth(tooth.id)}
                className="cursor-pointer group"
              >
                <g
                  className={cn(
                    'transition-all duration-200 origin-center',
                    'group-hover:drop-shadow-[0_6px_10px_rgba(0,0,0,0.18)]',
                    isSelected && 'drop-shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                  )}
                  style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                  filter="url(#tooth-shadow)"
                >
                  <ToothShape
                    type={tooth.type}
                    selected={isSelected}
                    quadrant={mapQuadrant(tooth.quadrant)}
                  />
                </g>
              </g>
            )
          })}

          {primaryTeethData.map((tooth) => {
            const isSelected = selectedTeeth.includes(tooth.id)
            return (
              <g
                key={`primary-${tooth.id}`}
                transform={`translate(${tooth.x}, ${tooth.y}) rotate(${tooth.rotation})`}
                onClick={() => toggleTooth(tooth.id)}
                className="cursor-pointer group"
              >
                <g
                  className={cn(
                    'transition-all duration-200 origin-center',
                    'group-hover:drop-shadow-[0_6px_10px_rgba(0,0,0,0.18)]',
                    isSelected && 'drop-shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                  )}
                  style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                  filter="url(#tooth-shadow)"
                >
                  <ToothShape
                    type={tooth.type}
                    selected={isSelected}
                    quadrant={mapQuadrant(tooth.quadrant)}
                    scale={PRIMARY_TOOTH_SCALE}
                    isPrimary={true}
                  />
                </g>
              </g>
            )
          })}

          {teethData.map((tooth) => {
            const isSelected = selectedTeeth.includes(tooth.id)
            const angleRad = (tooth.rotation - 90) * Math.PI / 180
            const labelR = 32

            const lx = tooth.x + Math.cos(angleRad) * labelR
            const ly = tooth.y + Math.sin(angleRad) * labelR

            return (
              <text
                key={`label-${tooth.id}`}
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={isSelected ? '#10b981' : theme.label}
                fontSize="11"
                fontWeight={isSelected ? 'bold' : 'normal'}
                className="pointer-events-none select-none transition-colors"
              >
                {system === 'UNS' ? tooth.uns : tooth.fdi}
              </text>
            )
          })}

          {primaryTeethData.map((tooth) => {
            const isSelected = selectedTeeth.includes(tooth.id)
            const angleRad = (tooth.rotation - 90) * Math.PI / 180
            const labelR = 20
            const lx = tooth.x + Math.cos(angleRad) * labelR
            const ly = tooth.y + Math.sin(angleRad) * labelR

            return (
              <text
                key={`primary-label-${tooth.id}`}
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={isSelected ? '#10b981' : theme.label}
                fontSize="10"
                fontWeight={isSelected ? 'bold' : 'normal'}
                className="pointer-events-none select-none opacity-90"
              >
                {tooth.id}
              </text>
            )
          })}

          <line x1="200" y1="40" x2="200" y2="240" stroke={theme.divider} strokeWidth="1" strokeDasharray="4 4" />
          <line x1="200" y1="280" x2="200" y2="480" stroke={theme.divider} strokeWidth="1" strokeDasharray="4 4" />
          <line x1="50" y1="260" x2="350" y2="260" stroke={theme.divider} strokeWidth="1" strokeDasharray="4 4" />

          {quadLabels.map(label => (
            <text
              key={label.id}
              x={label.x}
              y={label.y}
              className={cn('text-sm font-medium uppercase tracking-wider', theme.subtext)}
              textAnchor="middle"
            >
              {label.label}
            </text>
          ))}
        </svg>

        <div className="flex flex-wrap gap-2 mt-4 justify-center">
          {selectedTeeth.sort((a, b) => parseInt(a) - parseInt(b)).map(id => (
            <div key={id} className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-lg">
              {system === 'UNS' ? id : teethData.find(t => t.id === id)?.fdi}
            </div>
          ))}
          {selectedTeeth.length === 0 && (
            <span className={cn('text-sm italic', theme.emptyText)}>No teeth selected</span>
          )}
        </div>
      </div>
    </div>
  )
}
