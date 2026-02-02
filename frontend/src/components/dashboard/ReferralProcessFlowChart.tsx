'use client'

import { Card, CardContent } from '@/components/ui'

interface ProcessStep {
  label: string
  count: number
  percentage: number
  footerLabel?: string
}

type TimeRange = 'weekly' | 'monthly' | 'yearly'

interface ReferralProcessFlowChartProps {
  data: ProcessStep[]
  period: TimeRange
  onPeriodChange: (period: TimeRange) => void
}

const periodLabelMap: Record<TimeRange, string> = {
  weekly: 'This Week',
  monthly: 'This Month',
  yearly: 'This Year',
}

export function ReferralProcessFlowChart({ data, period, onPeriodChange }: ReferralProcessFlowChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Referral Process Flow</h3>
            <select
              value={period}
              onChange={(event) => onPeriodChange(event.target.value as TimeRange)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white hover:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <div className="flex items-center justify-center text-neutral-500" style={{ minHeight: 250 }}>
            No data available
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calculate dimensions
  const width = 600
  const height = 260
  const labelPaddingBottom = 70
  const nodeWidth = 120
  const nodePadding = 80
  const maxCount = Math.max(...data.map(d => d.count), 1)

  // Colors for each stage - incrementing saturations of emerald
  const colors = [
    { fill: '#10b981', gradient: 'url(#emerald-gradient-1)' }, // emerald-500
    { fill: '#059669', gradient: 'url(#emerald-gradient-2)' }, // emerald-600
    { fill: '#047857', gradient: 'url(#emerald-gradient-3)' }, // emerald-700
  ]

  // Calculate node positions and heights
  const nodes = data.map((step, index) => {
    const x = index * (nodeWidth + nodePadding) + 40
    const minNodeHeight = 80
    const proportion = step.percentage > 0 ? Math.min(step.percentage, 100) / 100 : step.count / maxCount
    const nodeHeight = Math.max(minNodeHeight, minNodeHeight + proportion * 140)
    const y = (height - nodeHeight) / 2
    return { ...step, x, y, height: nodeHeight, color: colors[index % colors.length] }
  })

  // Generate curved path between nodes (Sankey-style)
  const generatePath = (source: typeof nodes[0], target: typeof nodes[0]) => {
    const sourceX = source.x + nodeWidth
    const sourceY = source.y + source.height / 2
    const targetX = target.x
    const targetY = target.y + target.height / 2
    
    const controlPointOffset = (targetX - sourceX) / 2
    
    // Create a curved path using cubic bezier
    return `
      M ${sourceX} ${sourceY - source.height / 4}
      C ${sourceX + controlPointOffset} ${sourceY - source.height / 4},
        ${targetX - controlPointOffset} ${targetY - target.height / 4},
        ${targetX} ${targetY - target.height / 4}
      L ${targetX} ${targetY + target.height / 4}
      C ${targetX - controlPointOffset} ${targetY + target.height / 4},
        ${sourceX + controlPointOffset} ${sourceY + source.height / 4},
        ${sourceX} ${sourceY + source.height / 4}
      Z
    `
  }

  return (
    <Card className="h-full">
      <CardContent className="p-6 h-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Referral Process Flow</h3>
          <div className="flex items-center gap-3">
            <select
              value={period}
              onChange={(event) => onPeriodChange(event.target.value as TimeRange)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white hover:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>

        {/* Sankey Diagram */}
        <div className="w-full overflow-x-auto">
          <svg width={width} height={height + labelPaddingBottom} className="mx-auto">
            <defs>
              {/* Gradient definitions - incrementing emerald saturations */}
              <linearGradient id="emerald-gradient-1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.4" />
              </linearGradient>
              <linearGradient id="emerald-gradient-2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#059669" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#059669" stopOpacity="0.4" />
              </linearGradient>
              <linearGradient id="emerald-gradient-3" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#047857" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#047857" stopOpacity="0.4" />
              </linearGradient>
            </defs>

            {/* Draw connecting flows */}
            {nodes.slice(0, -1).map((node, index) => {
              const nextNode = nodes[index + 1]
              return (
                <path
                  key={`flow-${index}`}
                  d={generatePath(node, nextNode)}
                  fill={node.color.gradient}
                  opacity="0.3"
                  className="transition-opacity hover:opacity-50"
                />
              )
            })}

            {/* Draw nodes */}
            {nodes.map((node) => (
              <g key={node.label}>
                {/* Node rectangle */}
                <rect
                  x={node.x}
                  y={node.y}
                  width={nodeWidth}
                  height={node.height}
                  fill={node.color.fill}
                  rx="8"
                  className="transition-all hover:opacity-90"
                />
                
                {/* Node label */}
                {(() => {
                  const lines = node.label.split('\n')
                  const lineHeight = 14
                  const startY = node.y + node.height / 2 - (lines.length - 1) * lineHeight / 2 - 18
                  return (
                    <text
                      x={node.x + nodeWidth / 2}
                      y={startY}
                      textAnchor="middle"
                      className="fill-white font-medium text-sm"
                    >
                      {lines.map((line, idx) => (
                        <tspan key={`${node.label}-${idx}`} x={node.x + nodeWidth / 2} dy={idx === 0 ? 0 : lineHeight}>
                          {line}
                        </tspan>
                      ))}
                    </text>
                  )
                })()}
                
                {/* Node count */}
                <text
                  x={node.x + nodeWidth / 2}
                  y={node.y + node.height / 2 + 24}
                  textAnchor="middle"
                  className="fill-white font-semibold text-2xl"
                >
                  {node.count}
                </text>
                
                {/* Label + percentage below node */}
                <text
                  x={node.x + nodeWidth / 2}
                  y={node.y + node.height + 20}
                  textAnchor="middle"
                  className="fill-gray-600 text-xs font-medium"
                >
                  {node.footerLabel ?? node.label}
                </text>
                <text
                  x={node.x + nodeWidth / 2}
                  y={node.y + node.height + 36}
                  textAnchor="middle"
                  className="fill-gray-400 text-[11px]"
                >
                  {node.percentage}% of total
                </text>
              </g>
            ))}
          </svg>
        </div>

      </CardContent>
    </Card>
  )
}