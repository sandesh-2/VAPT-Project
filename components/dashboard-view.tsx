'use client'

import { ScanSession } from '@/lib/scan-types'
import { StatsCards } from './stats-cards'
import { SeverityChart } from './severity-chart'
import { FindingsTable } from './findings-table'
import { LiveTerminal } from './live-terminal'
import { PhasePipeline } from './phase-pipeline'
import { Shield, Zap, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardViewProps {
  session: ScanSession | null
  onSelectPhase: (id: number) => void
  selectedPhase?: number
}

export function DashboardView({ session, onSelectPhase, selectedPhase }: DashboardViewProps) {
  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-[#00d4aa]/10 border border-[#00d4aa]/20 flex items-center justify-center">
            <Shield className="w-9 h-9 text-[#00d4aa]" strokeWidth={1} />
          </div>
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#00d4aa]/20 border border-[#00d4aa]/30 flex items-center justify-center">
            <Zap className="w-3 h-3 text-[#00d4aa]" />
          </span>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">ReconForge v4.0</h2>
          <p className="text-sm text-[#64748b] max-w-md leading-relaxed">
            Automated Bug Bounty & VAPT platform. Configure a target in the Scan Engine tab to launch
            a full 15-phase active/passive reconnaissance pipeline.
          </p>
        </div>
        <div className="flex gap-6 text-center">
          {[
            { v: '15', l: 'Scan Phases' },
            { v: '50+', l: 'Passive Sources' },
            { v: '2000+', l: 'Nuclei Templates' },
          ].map(({ v, l }) => (
            <div key={l}>
              <p className="text-2xl font-bold font-mono text-[#00d4aa]">{v}</p>
              <p className="text-xs text-[#64748b]">{l}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const allFindings = session.phases.flatMap(p => p.findings)
  const allLogs = session.phases.flatMap(p => p.logs).slice(-100)
  const activePhase = session.phases.find(p => p.status === 'running')

  return (
    <div className="space-y-5">
      {/* Stats */}
      <StatsCards summary={session.summary} isScanning={session.status === 'running'} />

      {/* Charts row */}
      <SeverityChart findings={allFindings} />

      {/* Pipeline + Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PhasePipeline
          phases={session.phases}
          activePhase={activePhase?.id}
          onSelectPhase={onSelectPhase}
          selectedPhase={selectedPhase}
        />
        <LiveTerminal logs={allLogs} title={`run_${session.config.target}.log`} />
      </div>

      {/* Findings */}
      {allFindings.length > 0 && (
        <FindingsTable findings={allFindings} title="All Findings" />
      )}
    </div>
  )
}
