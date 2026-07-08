'use client'

import { ScanSession, Severity, SEVERITY_BG, SEVERITY_COLORS } from '@/lib/scan-types'
import { FindingsTable } from './findings-table'
import { LiveTerminal } from './live-terminal'
import { Bug, ShieldAlert, Lock, Cloud, Key, Code2, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VulnScannerViewProps {
  session: ScanSession | null
}

const NUCLEI_TAGS = [
  'cve', 'exposures', 'misconfiguration', 'default-login', 'panel', 'backup', 'debug',
  'redirect', 'sqli', 'ssrf', 'xss', 'lfi', 'rce', 'idor',
  'log4j', 'spring4shell', 'confluence', 'fortinet', 'atlassian', 'mfa-bypass',
]

function SeverityBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? (count / total) * 100 : 0
  return (
    <div className="flex items-center gap-3">
      <span className="w-16 text-[10px] font-mono uppercase" style={{ color }}>{label}</span>
      <div className="flex-1 h-2 bg-[#1e2535] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="w-8 text-right text-[11px] font-mono text-[#e2e8f0]">{count}</span>
    </div>
  )
}

export function VulnScannerView({ session }: VulnScannerViewProps) {
  const phase12 = session?.phases.find(p => p.id === 12)
  const phase13 = session?.phases.find(p => p.id === 13)
  const phase8  = session?.phases.find(p => p.id === 8)
  const phase9  = session?.phases.find(p => p.id === 9)
  const phase10 = session?.phases.find(p => p.id === 10)
  const phase5  = session?.phases.find(p => p.id === 5)

  const allVulnFindings = [
    ...(phase12?.findings ?? []),
    ...(phase13?.findings ?? []),
    ...(phase8?.findings ?? []),
    ...(phase9?.findings ?? []),
    ...(phase10?.findings ?? []),
    ...(phase5?.findings.filter(f => f.tags.includes('secret')) ?? []),
  ]

  const critical = allVulnFindings.filter(f => f.severity === 'CRITICAL').length
  const high     = allVulnFindings.filter(f => f.severity === 'HIGH').length
  const medium   = allVulnFindings.filter(f => f.severity === 'MEDIUM').length
  const low      = allVulnFindings.filter(f => f.severity === 'LOW').length
  const total    = allVulnFindings.length

  const nucleiLogs = [...(phase12?.logs ?? []), ...(phase13?.logs ?? [])]

  return (
    <div className="space-y-5">
      {/* Nuclei overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Severity breakdown */}
        <div className="lg:col-span-2 bg-[#0f1117] border border-[#1e2535] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <Bug className="w-4 h-4 text-[#ff3b5c]" />
            <span className="text-sm font-semibold text-white">Nuclei Vulnerability Scan</span>
            <span className="text-[10px] font-mono text-[#64748b] bg-[#1c1f2e] px-2 py-0.5 rounded">Phase 12</span>
            <span className="ml-auto text-sm font-bold font-mono text-white">{total} total</span>
          </div>
          <div className="space-y-3">
            <SeverityBar label="Critical" count={critical} total={total} color={SEVERITY_COLORS.CRITICAL} />
            <SeverityBar label="High"     count={high}     total={total} color={SEVERITY_COLORS.HIGH}     />
            <SeverityBar label="Medium"   count={medium}   total={total} color={SEVERITY_COLORS.MEDIUM}   />
            <SeverityBar label="Low"      count={low}      total={total} color={SEVERITY_COLORS.LOW}      />
          </div>
          {/* Tag cloud */}
          <div className="mt-5">
            <p className="text-[10px] text-[#64748b] font-mono uppercase tracking-widest mb-2.5">Active Template Tags</p>
            <div className="flex flex-wrap gap-1.5">
              {NUCLEI_TAGS.map(tag => {
                const hasMatch = allVulnFindings.some(f => f.tags.includes(tag))
                return (
                  <span key={tag} className={cn(
                    "px-2 py-0.5 text-[10px] font-mono rounded border",
                    hasMatch
                      ? "bg-[#ff3b5c]/10 text-[#ff3b5c] border-[#ff3b5c]/20"
                      : "bg-[#161821] text-[#334155] border-[#1e2535]"
                  )}>
                    {tag}
                  </span>
                )
              })}
            </div>
          </div>
        </div>

        {/* Category quick cards */}
        <div className="flex flex-col gap-3">
          {[
            { label: 'CORS Issues',        icon: Lock,         findings: phase13?.findings ?? [],  phase: 'CORS',       color: 'text-[#f7b731]' },
            { label: 'Open Buckets',        icon: Cloud,        findings: phase8?.findings ?? [],   phase: 'Cloud',      color: 'text-[#ff3b5c]' },
            { label: 'Subdomain Takeovers', icon: AlertTriangle,findings: phase9?.findings ?? [],   phase: 'Takeover',   color: 'text-[#ff3b5c]' },
            { label: 'Secrets Found',       icon: Key,          findings: phase5?.findings.filter(f => f.tags.includes('secret')) ?? [], phase: 'JS Analysis', color: 'text-[#ff6b35]' },
            { label: 'GraphQL Issues',      icon: Code2,        findings: phase10?.findings.filter(f => f.tags.includes('graphql')) ?? [], phase: 'Auth', color: 'text-[#f7b731]' },
          ].map(({ label, icon: Icon, findings, phase, color }) => (
            <div key={label} className="bg-[#0f1117] border border-[#1e2535] rounded-xl p-4 flex items-center gap-3 hover:border-[#2a3347] transition-colors">
              <Icon className={cn("w-4 h-4 flex-shrink-0", color)} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white">{label}</p>
                <p className="text-[10px] text-[#64748b]">{phase}</p>
              </div>
              <span className={cn(
                "text-sm font-bold font-mono",
                findings.length > 0 ? color : "text-[#334155]"
              )}>
                {findings.length}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Nuclei terminal */}
      <LiveTerminal logs={nucleiLogs} title="nuclei_scan.log" maxHeight="220px" />

      {/* Findings */}
      {allVulnFindings.length > 0 && (
        <FindingsTable findings={allVulnFindings} title="Vulnerability Findings" />
      )}
    </div>
  )
}
