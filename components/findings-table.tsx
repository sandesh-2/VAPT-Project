'use client'

import { useState } from 'react'
import { Finding, Severity, SEVERITY_BG } from '@/lib/scan-types'
import { ChevronDown, ChevronUp, ExternalLink, Info, Shield, ShieldAlert } from 'lucide-react'
import { cn } from '@/lib/utils'

function safeHref(url: string | undefined): string {
  if (!url) return '#'
  try {
    const p = new URL(url)
    return p.protocol === 'http:' || p.protocol === 'https:' ? p.href : '#'
  } catch { return '#' }
}

interface FindingsTableProps {
  findings: Finding[]
  title?: string
}

const SORDER: Severity[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO']

function sortFindings(findings: Finding[]) {
  return [...findings].sort((a, b) => SORDER.indexOf(a.severity) - SORDER.indexOf(b.severity))
}

export function FindingsTable({ findings, title = 'Findings' }: FindingsTableProps) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filter, setFilter] = useState<Severity | 'all'>('all')

  const sorted = sortFindings(findings)
  const filtered = filter === 'all' ? sorted : sorted.filter(f => f.severity === filter)

  const counts = SORDER.reduce((acc, s) => {
    acc[s] = findings.filter(f => f.severity === s).length
    return acc
  }, {} as Record<Severity, number>)

  return (
    <div className="bg-[#0f1117] border border-[#1e2535] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2535] flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#ff3b5c]" />
          <span className="text-sm font-semibold text-white">{title}</span>
          <span className="text-[10px] text-[#64748b] font-mono bg-[#1c1f2e] px-2 py-0.5 rounded">
            {findings.length}
          </span>
        </div>
        {/* Severity filter chips */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setFilter('all')}
            className={cn(
              "px-2.5 py-1 text-[10px] font-mono rounded border transition-all",
              filter === 'all' ? "bg-[#00d4aa]/15 text-[#00d4aa] border-[#00d4aa]/40" : "text-[#64748b] border-[#1e2535] hover:border-[#2a3347]"
            )}
          >
            ALL ({findings.length})
          </button>
          {SORDER.filter(s => counts[s] > 0).map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                "px-2.5 py-1 text-[10px] font-mono rounded border transition-all uppercase",
                filter === s
                  ? `${SEVERITY_BG[s]} border-current`
                  : "text-[#64748b] border-[#1e2535] hover:border-[#2a3347]"
              )}
            >
              {s} ({counts[s]})
            </button>
          ))}
        </div>
      </div>

      {/* Findings list */}
      <div className="divide-y divide-[#1e2535]">
        {filtered.length === 0 && (
          <div className="flex items-center justify-center gap-2 py-10 text-[#334155]">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-mono">No findings in this category</span>
          </div>
        )}
        {filtered.map(finding => (
          <div key={finding.id} className="group">
            <button
              onClick={() => setExpanded(expanded === finding.id ? null : finding.id)}
              className="w-full flex items-start gap-3 px-4 py-3 hover:bg-[#161821] transition-colors text-left"
            >
              {/* Severity badge */}
              <span className={cn(
                "px-2 py-0.5 text-[9px] font-mono rounded border uppercase flex-shrink-0 mt-0.5",
                SEVERITY_BG[finding.severity]
              )}>
                {finding.severity}
              </span>
              {/* Title + phase */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#e2e8f0] font-medium leading-snug">{finding.title}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-[10px] text-[#64748b] font-mono">{finding.phase}</span>
                  {finding.cveId && (
                    <span className="text-[10px] font-mono bg-[#ff3b5c]/10 text-[#ff3b5c] border border-[#ff3b5c]/20 px-1.5 py-0.5 rounded">
                      {finding.cveId}
                    </span>
                  )}
                  {finding.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-[9px] font-mono bg-[#1c1f2e] text-[#64748b] border border-[#1e2535] px-1.5 py-0.5 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              {/* Expand icon */}
              <div className="flex-shrink-0 text-[#334155] group-hover:text-[#64748b] transition-colors mt-0.5">
                {expanded === finding.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </div>
            </button>

            {/* Expanded detail */}
            {expanded === finding.id && (
              <div className="px-4 pb-4 bg-[#0a0b0f] border-t border-[#1e2535]">
                <div className="pt-4 space-y-3">
                  {/* Description */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Info className="w-3 h-3 text-[#4ecdc4]" />
                      <span className="text-[10px] text-[#64748b] font-mono uppercase tracking-widest">Description</span>
                    </div>
                    <p className="text-sm text-[#c8d3e0] leading-relaxed">{finding.description}</p>
                  </div>
                  {/* URL */}
                  {finding.url && (
                    <div>
                      <span className="text-[10px] text-[#64748b] font-mono uppercase tracking-widest block mb-1">URL</span>
                      <a href={safeHref(finding.url)} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-[11px] text-[#00d4aa] font-mono hover:underline">
                        {finding.url}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                  {/* Remediation */}
                  {finding.remediationSteps && finding.remediationSteps.length > 0 && (
                    <div className="bg-[#45d48a]/5 border border-[#45d48a]/20 rounded-lg p-3">
                      <span className="text-[10px] text-[#45d48a] font-mono uppercase tracking-widest block mb-1.5">Remediation</span>
                      {finding.remediationSteps.map((step, idx) => (
                        <p key={idx} className="text-xs text-[#c8d3e0] leading-relaxed">{idx + 1}. {step}</p>
                      ))}
                    </div>
                  )}
                  {/* Timestamp */}
                  <p className="text-[10px] text-[#334155] font-mono">
                    Discovered: {new Date(finding.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
