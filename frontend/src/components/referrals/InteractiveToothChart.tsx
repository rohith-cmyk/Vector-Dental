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

// Tooth Definition
interface ToothData {
    id: string // UNS number as ID for consistency
    uns: string
    fdi: string
    quadrant: 'UR' | 'UL' | 'LL' | 'LR'
    x: number
    y: number
    rotation: number
}

export function InteractiveToothChart({
    selectedTeeth,
    onTeethChange,
    readOnly = false,
    variant = 'dark',
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
        toothFill: isDark ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.9)',
        toothStroke: isDark ? '#4b5563' : '#d1d5db',
        divider: isDark ? '#1f2937' : '#e5e7eb',
        label: isDark ? '#6b7280' : '#9ca3af',
        emptyText: isDark ? 'text-gray-600' : 'text-gray-400',
    }
    const sizeClass = size === 'sm' ? 'max-w-md p-4' : 'max-w-lg p-6'

    // Generate Teeth Data with position on an arch
    const teethData = useMemo(() => {
        const teeth: ToothData[] = []

        // Arch parameters
        const width = 400
        const height = 500
        const cx = width / 2
        const cy = height / 2 - 20 // Center of the mouth
        const rx = 140 // Horizontal radius
        const ry = 160 // Vertical radius

        // Helper to generate a tooth
        const addTooth = (
            uns: number,
            fdi: number,
            quad: 'UR' | 'UL' | 'LL' | 'LR',
            indexFromCenter: number, // 0 is central incisor, 7 is wisdom
            isUpper: boolean,
            isRight: boolean
        ) => {
            // Angle distribution: -90 is top center.
            // Spread teeth from near center to back.
            // Top arch: -90 +/- (10 + index * 12) degrees

            const angleStep = 11 // Degrees per tooth
            const startAngle = 10 // Offset from center line

            let angleDeg: number
            if (isUpper) {
                // Upper arch: -90 is up. 
                // Right side (UR): moves clockwise from -90? No, standard math angle: -90 is bottom?
                // Let's stick to standard SVG coordinates: 0 is right, 90 down, 180 left, 270 (-90) up.
                // Upper Right (Quadrant 1): Angle between -90 (top) and 0 (right).
                // Actually, let's just use parametric ellipse equation.
                // x = cx + rx * cos(theta)
                // y = cy + ry * sin(theta)

                // Upper Arch: theta from 180 (left) to 360/0 (right)
                // Center is 270 (-90).
                // UR (Right side of face = Left side of view? No, Dental chart is patient's view facing you)
                // UR is Upper Right of Patient -> Top Left on Screen usually?
                // Wait, standard dental chart:
                // Left side of screen = Right side of patient (UR/LR)
                // Right side of screen = Left side of patient (UL/LL)
                // Let's Verify with the image user provided:
                // "Upper Right" label is on the LEFT side of the image. (Teeth 1-8).
                // "Upper Left" label is on the RIGHT side of the image. (Teeth 9-16).

                if (isRight) {
                    // Patient Right = Screen Left
                    // Index 0 (Central Incisor #8) should be near center-top.
                    // Index 7 (Wisdom #1) should be far left-top.
                    // Angle from -90 (top center) to -180 (left).
                    // Center at -90. angle = -90 - offset
                    angleDeg = -90 - (startAngle + indexFromCenter * angleStep)
                } else {
                    // Patient Left = Screen Right
                    // Index 0 (#9) near center.
                    // Angle from -90 (top center) to 0 (right).
                    angleDeg = -90 + (startAngle + indexFromCenter * angleStep)
                }
            } else {
                // Lower Arch
                // Lower Right (Patient Right = Screen Left) -> Teeth 32..25
                // Lower Left (Patient Left = Screen Right) -> Teeth 17..24

                if (isRight) {
                    // Lower Right (Screen Left)
                    // Index 0 (#25) near center-bottom.
                    // Center is 90 (bottom).
                    // Screen Left is toward 180.
                    // angle = 90 + offset
                    angleDeg = 90 + (startAngle + indexFromCenter * angleStep)
                } else {
                    // Lower Left (Screen Right)
                    // Index 0 (#24) near center-bottom.
                    // Screen Right is toward 0.
                    // angle = 90 - offset
                    angleDeg = 90 - (startAngle + indexFromCenter * angleStep)
                }
            }

            const angleRad = (angleDeg * Math.PI) / 180

            // Calculate position
            const x = cx + rx * Math.cos(angleRad)
            const y = cy + ry * Math.sin(angleRad) + (isUpper ? 0 : 40) // Separate upper/lower arches slightly

            teeth.push({
                id: uns.toString(),
                uns: uns.toString(),
                fdi: fdi.toString(),
                quadrant: quad,
                x,
                y,
                rotation: angleDeg + 90 // Rotation for the tooth shape to face perpendicular to arch
            })
        }

        // UR (1-8 UNS, 18-11 FDI) - Screen Left Top
        // Order: 1 (Back) -> 8 (Front)
        // Loop 0..7 where 0 is Front (#8) and 7 is Back (#1)
        // Actually standard loop 1..8:
        // Tooth 8 is Central -> Index 0. Tooth 1 is 3rd Molar -> Index 7.
        for (let i = 0; i < 8; i++) {
            // UNS: 8 - i (8, 7, ... 1)
            // FDI: 11 + i (11, 12 ... 18)
            addTooth(8 - i, 11 + i, 'UR', i, true, true)
        }

        // UL (9-16 UNS, 21-28 FDI) - Screen Right Top
        // Order: 9 (Front) -> 16 (Back)
        for (let i = 0; i < 8; i++) {
            // UNS: 9 + i
            // FDI: 21 + i
            addTooth(9 + i, 21 + i, 'UL', i, true, false)
        }

        // LL (17-24 UNS, 31-38 FDI) - Screen Right Bottom
        // Order: 24 (Front) -> 17 (Back)
        for (let i = 0; i < 8; i++) {
            // UNS: 24 - i
            // FDI: 31 + i
            addTooth(24 - i, 31 + i, 'LL', i, false, false)
        }

        // LR (25-32 UNS, 41-48 FDI) - Screen Left Bottom
        // Order: 25 (Front) -> 32 (Back)
        for (let i = 0; i < 8; i++) {
            // UNS: 25 + i
            // FDI: 41 + i
            addTooth(25 + i, 41 + i, 'LR', i, false, true)
        }

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
            // Add missing ones
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

    // --- Render Helpers ---

    // Quadrant Arc Path generator
    // We need arcs that encompass the teeth of each quadrant.
    const getQuadrantPath = (quad: 'UR' | 'UL' | 'LL' | 'LR') => {
        // Similar logic to teeth positioning but larger radius
        const cx = 200
        const cy = 250 - 20
        const rx = 185
        const ry = 205
        const yOffset = (quad === 'UL' || quad === 'UR') ? 0 : 40

        // Start/End angles (radians) matching the teeth spread
        // UR (Screen Left Top): -180 to -90
        // UL (Screen Right Top): -90 to 0
        // LL (Screen Right Bottom): 0 to 90
        // LR (Screen Left Bottom): 90 to 180
        // We'll add some padding/gap between arcs

        let startAngle = 0
        let endAngle = 0

        const gap = 0.05 // Radian gap (approx 3 degrees)

        switch (quad) {
            case 'UR': // Screen Left Top: PI to 1.5 PI (reverse? logic: 0 right, PI left)
                // Math.PI (180 left) -> 1.5 PI (270 top) ? No.
                // Standard Canvas/SVG: 0 is Right (3 o'clock). Clockwise positive.
                // Top is 1.5 PI or -0.5 PI. Left is PI.
                // UR is Top-Left quadrant visually. Angle: PI to 1.5 PI (if clockwise).
                // Let's use negative for CCW from 0.
                // Top (-PI/2) to Left (-PI).
                startAngle = -Math.PI + gap
                endAngle = -Math.PI / 2 - gap
                break
            case 'UL': // Screen Right Top. Top (-PI/2) to Right (0).
                startAngle = -Math.PI / 2 + gap
                endAngle = -gap
                break
            case 'LL': // Screen Right Bottom. Right (0) to Bottom (PI/2).
                startAngle = gap
                endAngle = Math.PI / 2 - gap
                break
            case 'LR': // Screen Left Bottom. Bottom (PI/2) to Left (PI).
                startAngle = Math.PI / 2 + gap
                endAngle = Math.PI - gap
                break
        }

        // Draw Arc
        // Mx,y A rx,ry x-axis-rot large-arc-flag sweep-flag x,y

        const x1 = cx + rx * Math.cos(startAngle)
        const y1 = cy + ry * Math.sin(startAngle) + yOffset

        const x2 = cx + rx * Math.cos(endAngle)
        const y2 = cy + ry * Math.sin(endAngle) + yOffset

        // Large arc flag is 0 for quarter circles
        return `M ${x1} ${y1} A ${rx} ${ry} 0 0 1 ${x2} ${y2}`
    }

    // Define quadrant centers for labels - moved further out/away from teeth
    const quadLabels = [
        { id: 'UR', label: 'Upper Right', x: 48, y: 48 },
        { id: 'UL', label: 'Upper Left', x: 352, y: 48 },
        { id: 'LR', label: 'Lower Right', x: 62, y: 495 },
        { id: 'LL', label: 'Lower Left', x: 352, y: 495 },
    ]

    // Checking selection status for quadrants
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
            {/* Header */}
            <div className="w-full flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-100">Teeth</h3>

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

            {/* SVG Chart */}
            <div className="relative w-full aspect-[4/5] select-none">
                <svg viewBox="0 0 400 560" className="w-full h-full drop-shadow-2xl">
                    {/* Defs for glow effects */}
                    <defs>
                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>

                    {/* Quadrant Arcs (Outer Ring) */}
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
                                    "transition-all duration-300 cursor-pointer hover:stroke-emerald-500 hover:stroke-[3]",
                                    status !== 'none' && "filter drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                                )}
                                onClick={() => toggleQuadrant(quad)}
                            />
                        )
                    })}

                    {/* Connecting lines for quadrants? Maybe simple lines if needed. 
                The user image shows subtle white lines separating quadrants.
                Our gaps handle this.
            */}

                    {/* Teeth */}
                    {teethData.map((tooth) => {
                        const isSelected = selectedTeeth.includes(tooth.id)
                        // Tooth shape: Simple rounded rect or path rotated
                        return (
                            <g
                                key={tooth.id}
                                transform={`translate(${tooth.x}, ${tooth.y}) rotate(${tooth.rotation})`}
                                onClick={() => toggleTooth(tooth.id)}
                                className="cursor-pointer group"
                            >
                                {/* Tooth Body Outline (Root + Crown abstract) */}
                                {/* Drawing a simple shape that looks like a tooth from occlusal view (ovalish) */}
                                <ellipse
                                    rx="14"
                                    ry="10"
                                    fill={isSelected ? 'rgba(16, 185, 129, 0.2)' : theme.toothFill}
                                    stroke={isSelected ? '#34d399' : theme.toothStroke}
                                    strokeWidth={isSelected ? 2 : 1.5}
                                    className={cn(
                                        "transition-all duration-200 group-hover:stroke-emerald-400",
                                        isSelected && "filter drop-shadow-[0_0_5px_rgba(52,211,153,0.4)]"
                                    )}
                                />

                                {/* Selecting Indicator (Inner fill) */}
                                {isSelected && (
                                    <path
                                        d="M -6 -4 L 0 4 L 6 -4"
                                        fill="none" // Just a symbol? Or maybe just full fill.
                                    // Let's just rely on the fill above.
                                    />
                                )}

                                {/* Label Number */}
                                <text
                                    y="40" // Push label "outside" the tooth (towards the lips/cheeks usually)
                                    // Oops, rotation makes Y relative.
                                    // We want the text to be upright or aligned?
                                    // In the image, text is outside the arch.
                                    // So we need to put text at a radius > tooth radius.
                                    // Better to do text as separate <text> element in main coordinate space to avoid rotation.
                                    fill="none"
                                />
                            </g>
                        )
                    })}

                    {/* Labels (Separate loop to avoid rotation transform issues) */}
                    {teethData.map((tooth) => {
                        const isSelected = selectedTeeth.includes(tooth.id)
                        // Position text slightly further out from center to be outside the arch
                        const angleRad = (tooth.rotation - 90) * Math.PI / 180
                        // Increase radius for labels to clear selected glow and shape
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
                                fill={isSelected ? '#34d399' : theme.label}
                                fontSize="11"
                                fontWeight={isSelected ? 'bold' : 'normal'}
                                className="pointer-events-none select-none transition-colors"
                            >
                                {system === 'UNS' ? tooth.uns : tooth.fdi}
                            </text>
                        )
                    })}

                    {/* Center Cross / Divider - faint lines */}
                    <line x1="200" y1="40" x2="200" y2="240" stroke={theme.divider} strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="200" y1="280" x2="200" y2="480" stroke={theme.divider} strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="50" y1="260" x2="350" y2="260" stroke={theme.divider} strokeWidth="1" strokeDasharray="4 4" />

                    {/* Quadrant Text Labels - Positioned better */}
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

                    {/* Correcting the quadrant labels - The user image has UL text in the center? 
                Actually the user image has "UL Upper Left" in the center.
                And "Upper Right" at the top left.
                Let's emulate that.
            */}

                </svg>

                {/* Selected Summary Chips */}
                <div className="flex flex-wrap gap-2 mt-4 justify-center">
                    {selectedTeeth.sort((a, b) => parseInt(a) - parseInt(b)).map(id => (
                        <div key={id} className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-lg">
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
