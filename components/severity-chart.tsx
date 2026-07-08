'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'
import { Finding, Severity, SEVERITY_COLORS } from '@/lib/scan-types'

interface SeverityChartProps {
  findings: Finding[]
}

const SEVERITY_ORDER: Severity[] = ['critical', 'high', 'medium', 'low', 'info']

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    const { name, value, fill } = payload[0]
    return (
      <div className="bg-[#161821] border border-[#1e2535] rounded-lg px-3 py-2 text-xs font-mono shadow-xl">
        <span style={{ color: fill }} className="capitalize font-semibold">{name}</span>
        <span className="text-[#e2e8f0] ml-2">{value}</span>
      </div>
    )
  }
  return null
}

export function SeverityChart({ findings }: SeverityChartProps) {
  const data = SEVERITY_ORDER
    .map(s => ({
      name: s,
      value: findings.filter(f => f.severity === s).length,
      fill: SEVERITY_COLORS[s],
    }))
    .filter(d => d.value > 0)

  const phaseData = Array.from(
    findings.reduce((map, f) => {
      const key = f.phase
      if (!map.has(key)) map.set(key, { phase: key, critical: 0, high: 0, medium: 0, low: 0, info: 0 })
      map.get(key)![f.severity]++
      return map
    }, new Map<string, any>()).values()
  )

  if (findings.length === 0) {
    return (
      <div className="bg-[#0f1117] border border-[#1e2535] rounded-xl p-6 flex items-center justify-center min-h-[220px]">
        <p className="text-sm text-[#334155] font-mono">No findings yet — start a scan</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Donut */}
      <div className="bg-[#0f1117] border border-[#1e2535] rounded-xl p-5">
        <p className="text-xs font-semibold text-white mb-4">Severity Distribution</p>
        <div className="flex items-center gap-4">
          <ResponsiveContainer width={130} height={130}>
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={38} outerRadius={58} dataKey="value" paddingAngle={3}>
                {data.map((entry, i) => <Cell key={i} fill={entry.fill} stroke="transparent" />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-2">
            {data.map(d => (
              <div key={d.name} className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.fill }} />
                <span className="text-[#e2e8f0] capitalize">{d.name}</span>
                <span className="font-mono ml-auto text-[#64748b] pl-4">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bar by phase */}
      <div className="bg-[#0f1117] border border-[#1e2535] rounded-xl p-5">
        <p className="text-xs font-semibold text-white mb-4">Findings by Phase</p>
        <ResponsiveContainer width="100%" height={130}>
          <BarChart data={phaseData} barSize={6} margin={{ left: -20, right: 0, top: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="2 4" stroke="#1e2535" vertical={false} />
            <XAxis
              dataKey="phase"
              tick={{ fontSize: 9, fill: '#64748b', fontFamily: 'monospace' }}
              axisLine={false}
              tickLine={false}
              interval={0}
              angle={-25}
              textAnchor="end"
              height={40}
            />
            <YAxis tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar dataKey="critical" fill={SEVERITY_COLORS.critical} radius={[2,2,0,0]} />
            <Bar dataKey="high"     fill={SEVERITY_COLORS.high}     radius={[2,2,0,0]} />
            <Bar dataKey="medium"   fill={SEVERITY_COLORS.medium}   radius={[2,2,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
