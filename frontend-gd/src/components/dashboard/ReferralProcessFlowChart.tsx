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
          <div className="flex items-center justify-center text-neutral-500" style={{ minHeight: 250 }}>
            No data available
          </div>
        </CardContent>
      </Card>
    )
  }

  const width = 600
  const height = 280
  const labelPaddingBottom = 70
  const nodeWidth = 120
  const nodePadding = 80
  const maxCount = Math.max(...data.map((step) => step.count))
  const safeMaxCount = maxCount > 0 ? maxCount : 1

  const colors = [
    { fill: '#10b981', gradient: 'url(#emerald-gradient-1)' },
    { fill: '#059669', gradient: 'url(#emerald-gradient-2)' },
    { fill: '#047857', gradient: 'url(#emerald-gradient-3)' },
  ]

  const nodes = data.map((step, index) => {
    const x = index * (nodeWidth + nodePadding) + 40
    const minNodeHeight = 80
    const nodeHeight = Math.max(minNodeHeight, (step.count / safeMaxCount) * 160 + 40)
    const y = (height - nodeHeight) / 2
    return { ...step, x, y, height: nodeHeight, color: colors[index % colors.length] }
  })

  const svgHeight = height + labelPaddingBottom

  const generatePath = (source: typeof nodes[0], target: typeof nodes[0]) => {
    const sourceX = source.x + nodeWidth
    const sourceY = source.y + source.height / 2
    const targetX = target.x
    const targetY = target.y + target.height / 2
    const controlPointOffset = (targetX - sourceX) / 2

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
          <select
            defaultValue="monthly"
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white hover:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

        <div className="w-full overflow-x-auto">
          <svg width={width} height={svgHeight} className="mx-auto">
            <defs>
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

            {nodes.map((node) => (
              <g key={node.label}>
                <rect
                  x={node.x}
                  y={node.y}
                  width={nodeWidth}
                  height={node.height}
                  fill={node.color.fill}
                  rx="8"
                  className="transition-all hover:opacity-90"
                />

                <text
                  x={node.x + nodeWidth / 2}
                  y={node.y + node.height / 2 - 12}
                  textAnchor="middle"
                  className="fill-white font-medium text-sm"
                >
                  {node.label}
                </text>

                <text
                  x={node.x + nodeWidth / 2}
                  y={node.y + node.height / 2 + 16}
                  textAnchor="middle"
                  className="fill-white font-semibold text-2xl"
                >
                  {node.count}
                </text>

                <text
                  x={node.x + nodeWidth / 2}
                  y={node.y + node.height + 32}
                  textAnchor="middle"
                  className="fill-gray-500 text-xs font-medium"
                >
                  {node.label}
                </text>
                <text
                  x={node.x + nodeWidth / 2}
                  y={node.y + node.height + 50}
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
