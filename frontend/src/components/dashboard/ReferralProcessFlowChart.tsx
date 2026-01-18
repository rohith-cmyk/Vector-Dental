'use client'

import { Card, CardContent } from '@/components/ui'

interface ProcessStep {
  label: string
  count: number
  percentage: number
}

interface ReferralProcessFlowChartProps {
  data: ProcessStep[]
}

export function ReferralProcessFlowChart({ data }: ReferralProcessFlowChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Referral Process Flow</h3>
            <span className="text-sm text-neutral-500">This Month</span>
          </div>
          <div className="text-center py-8 text-neutral-500">No data available</div>
        </CardContent>
      </Card>
    )
  }

  // Calculate dimensions
  const width = 600
  const height = 250
  const nodeWidth = 120
  const nodePadding = 80
  const maxCount = Math.max(...data.map(d => d.count))

  // Colors for each stage - incrementing saturations of emerald
  const colors = [
    { fill: '#10b981', gradient: 'url(#emerald-gradient-1)' }, // emerald-500
    { fill: '#059669', gradient: 'url(#emerald-gradient-2)' }, // emerald-600
    { fill: '#047857', gradient: 'url(#emerald-gradient-3)' }, // emerald-700
  ]

  // Calculate node positions and heights
  const nodes = data.map((step, index) => {
    const x = index * (nodeWidth + nodePadding) + 40
    const nodeHeight = (step.count / maxCount) * 180 + 40 // Scale height based on count
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
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Referral Process Flow</h3>
          <span className="text-sm text-neutral-500">This Month</span>
        </div>

        {/* Sankey Diagram */}
        <div className="w-full overflow-x-auto">
          <svg width={width} height={height} className="mx-auto">
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
            {nodes.map((node, index) => (
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
                <text
                  x={node.x + nodeWidth / 2}
                  y={node.y + node.height / 2 - 15}
                  textAnchor="middle"
                  className="fill-white font-medium text-sm"
                >
                  {node.label}
                </text>
                
                {/* Node count */}
                <text
                  x={node.x + nodeWidth / 2}
                  y={node.y + node.height / 2 + 15}
                  textAnchor="middle"
                  className="fill-white font-semibold text-2xl"
                >
                  {node.count}
                </text>
                
                {/* Percentage below node */}
                <text
                  x={node.x + nodeWidth / 2}
                  y={node.y + node.height + 20}
                  textAnchor="middle"
                  className="fill-gray-600 text-xs"
                >
                  {node.percentage}%
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* Summary Stats */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="grid grid-cols-3 gap-4">
            {data.map((step, index) => {
              const color = colors[index % colors.length]
              return (
                <div key={`stat-${step.label}`} className="text-center">
                  <div 
                    className="text-2xl font-semibold"
                    style={{ color: color.fill }}
                  >
                    {step.count}
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">{step.label}</div>
                  <div className="text-xs text-neutral-400 mt-0.5">{step.percentage}% of total</div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}