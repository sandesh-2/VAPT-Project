'use client'

import { ScanSession } from '@/lib/scan-types'
import { LiveTerminal } from './live-terminal'
import { FindingsTable } from './findings-table'
import { PhasePipeline } from './phase-pipeline'
import { Activity, Cpu, Gauge, Layers, Network, Bug, Lock, Cloud } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ActiveScanViewProps {
  session: ScanSession | null
  onSelectPhase: (id: number) => void
  selectedPhase?: number
}

const ACTIVE_PHASES = [
  { id: 3,  label: 'HTTP Probe',     icon: Network, desc: 'httpx — tech-detect, CDN, WAF, screenshots, header audit' },
  { id: 4,  label: 'Crawl',          icon: Layers,  desc: 'katana headless + gau + hakrawler + uro dedup' },
  { id: 5,  label: 'JS Analysis',    icon: Bug,     desc: 'mantra AST + SecretFinder + TruffleHog + gf patterns' },
  { id: 6,  label: 'Param Mining',   icon: Cpu,     desc: 'x8 differential + arjun multi-method + passive harvest' },
  { id: 7,  label: 'Dir Fuzzing',    icon: Gauge,   desc: 'ffuf + raft-large-dirs + sensitive file sweep' },
  { id: 9,  label: 'Takeover',       icon: Lock,    desc: 'nuclei takeover templates + subjack + dangling CNAME' },
  { id: 10, label: 'Auth Surface',   icon: Lock,    desc: 'OIDC probe + JWT extraction + nuclei auth templates' },
  { id: 11, label: 'API Map',        icon: Activity,desc: 'GraphQL introspection + Swagger/OpenAPI discovery + kiterunner' },
  { id: 12, label: 'Vuln Scan',      icon: Bug,     desc: 'Nuclei: CVE, misconfig, default-login, XSS, SQLi, RCE, SSRF' },
  { id: 13, label: 'CORS',           icon: Network, desc: '5 malicious origin probes — reflected, credentialed, null' },
]

export function ActiveScanView({ session, onSelectPhase, selectedPhase }: ActiveScanViewProps) {
  const activeLogs = session?.phases
    .filter(p => [3,4,5,6,7,9,10,11,12,13].includes(p.id))
    .flatMap(p => p.logs) ?? []

  const activeFindings = session?.phases
    .filter(p => [3,4,5,6,7,9,10,11,12,13].includes(p.id))
    .flatMap(p => p.findings) ?? []

  const selectedPhaseData = selectedPhase
    ? session?.phases.find(p => p.id === selectedPhase)
    : null

  return (
    <div className="space-y-5">
      {/* Active tool grid */}
      <div className="bg-[#0f1117] border border-[#1e2535] rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#1e2535]">
          <Activity className="w-4 h-4 text-[#ff6b35]" />
          <span className="text-sm font-semibold text-white">Active Scan Modules</span>
          <span className="text-[10px] font-mono text-[#ff6b35]/80 bg-[#ff6b35]/10 px-2 py-0.5 rounded border border-[#ff6b35]/20">
            Phases 3–13 — Rate-limited
          </span>
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {ACTIVE_PHASES.map(phase => {
            const Icon = phase.icon
            const phaseData = session?.phases.find(p => p.id === phase.id)
            const status = phaseData?.status ?? 'pending'
            return (
              <button
                key={phase.id}
                onClick={() => onSelectPhase(phase.id)}
                className={cn(
                  "bg-[#0a0b0f] border rounded-lg p-3.5 text-left hover:border-[#2a3347] transition-all",
                  selectedPhase === phase.id
                    ? "border-[#00d4aa]/40 bg-[#00d4aa]/5"
                    : "border-[#1e2535]"
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className={cn(
                    "w-7 h-7 rounded flex items-center justify-center",
                    status === 'done'    ? "bg-[#45d48a]/10" :
                    status === 'running' ? "bg-[#00d4aa]/10" :
                    status === 'failed'  ? "bg-[#ff3b5c]/10" :
                    "bg-[#161821]"
                  )}>
                    <Icon className={cn(
                      "w-3.5 h-3.5",
                      status === 'done'    ? "text-[#45d48a]" :
                      status === 'running' ? "text-[#00d4aa]" :
                      status === 'failed'  ? "text-[#ff3b5c]" :
                      "text-[#334155]"
                    )} />
                  </div>
                  <span className="text-[9px] font-mono text-[#334155]">{String(phase.id).padStart(2, '0')}</span>
                </div>
                <p className="text-xs font-semibold text-white mb-1">{phase.label}</p>
                <p className="text-[9px] text-[#64748b] leading-relaxed">{phase.desc}</p>
                {phaseData && phaseData.count > 0 && (
                  <p className="text-[10px] font-mono text-[#00d4aa] mt-1.5">{phaseData.count.toLocaleString()} found</p>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected phase detail */}
      {selectedPhaseData && (
        <div className="bg-[#0f1117] border border-[#1e2535] rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#1e2535]">
            <span className="text-[10px] font-mono text-[#64748b]">Phase {selectedPhaseData.id}</span>
            <span className="text-sm font-semibold text-white">{selectedPhaseData.name}</span>
          </div>
          <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <LiveTerminal logs={selectedPhaseData.logs} title={`phase_${selectedPhaseData.id}.log`} maxHeight="220px" />
            {selectedPhaseData.findings.length > 0
              ? <FindingsTable findings={selectedPhaseData.findings} title="Phase Findings" />
              : <div className="bg-[#0a0b0f] border border-[#1e2535] rounded-xl flex items-center justify-center p-10 text-sm text-[#334155] font-mono">
                  {selectedPhaseData.status === 'pending' ? 'Phase not yet run' : 'No findings in this phase'}
                </div>
            }
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LiveTerminal logs={activeLogs} title="active_scan.log" maxHeight="300px" />
        {activeFindings.length > 0 && (
          <FindingsTable findings={activeFindings} title="Active Scan Findings" />
        )}
      </div>
    </div>
  )
}
