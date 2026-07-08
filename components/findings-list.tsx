'use client'

import { Finding, Severity } from '@/lib/scan-types'
import { getSeverityColor } from '@/lib/cvss-utils'
import { ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { FindingDetailPanel } from './finding-detail-panel'

interface FindingsListProps {
  findings: Finding[]
  showSeverityFilter?: boolean
}

export function FindingsList({ findings, showSeverityFilter = true }: FindingsListProps) {
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null)
  const [severityFilter, setSeverityFilter] = useState<Severity | 'ALL'>('ALL')

  const severities: (Severity | 'ALL')[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO', 'ALL']

  const filtered =
    severityFilter === 'ALL' ? findings : findings.filter(f => f.severity === severityFilter)

  const grouped = filtered.reduce(
    (acc, finding) => {
      if (!acc[finding.severity]) {
        acc[finding.severity] = []
      }
      acc[finding.severity].push(finding)
      return acc
    },
    {} as Record<Severity, Finding[]>,
  )

  // Sort by CVSS score desc
  Object.keys(grouped).forEach(severity => {
    grouped[severity as Severity].sort((a, b) => (b.cvss?.baseScore || 0) - (a.cvss?.baseScore || 0))
  })

  return (
    <>
      {showSeverityFilter && (
        <div className="flex gap-2 mb-6 pb-4 border-b border-border overflow-x-auto">
          {severities.map(sev => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition whitespace-nowrap ${
                severityFilter === sev
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No findings in this category</p>
        </div>
      ) : (
        <div className="space-y-3">
          {Object.entries(grouped)
            .filter(([_, items]) => items.length > 0)
            .map(([severity, items]) => (
              <div key={severity}>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1">
                  {severity} ({items.length})
                </h3>
                <div className="space-y-2">
                  {items.map(finding => {
                    const colors = getSeverityColor(finding.severity)
                    return (
                      <button
                        key={finding.id}
                        onClick={() => setSelectedFinding(finding)}
                        className={`w-full text-left p-4 rounded-lg border transition ${colors.border} ${colors.bg} hover:bg-opacity-100 group`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm mb-1 group-hover:underline truncate">
                              {finding.title}
                            </h4>
                            <p className="text-xs text-foreground/60 line-clamp-2 mb-2">
                              {finding.description}
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                              {finding.cvss && (
                                <span className="text-xs font-mono bg-background/50 px-2 py-1 rounded">
                                  CVSS {finding.cvss.baseScore}
                                </span>
                              )}
                              {finding.cwe.length > 0 && (
                                <span className="text-xs bg-background/50 px-2 py-1 rounded">
                                  {finding.cwe[0]}
                                </span>
                              )}
                              {finding.toolsUsed.length > 0 && (
                                <span className="text-xs bg-background/50 px-2 py-1 rounded font-mono">
                                  {finding.toolsUsed[0]}
                                </span>
                              )}
                              {finding.tags.length > 0 && (
                                <span className="text-xs text-muted-foreground">
                                  +{finding.tags.length} tags
                                </span>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 shrink-0 text-muted-foreground group-hover:translate-x-1 transition mt-1" />
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
        </div>
      )}

      <FindingDetailPanel
        finding={selectedFinding!}
        isOpen={!!selectedFinding}
        onClose={() => setSelectedFinding(null)}
      />
    </>
  )
}
