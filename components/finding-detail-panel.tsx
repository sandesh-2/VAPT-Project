'use client'

import { Finding } from '@/lib/scan-types'
import { getOWASPCategory } from '@/lib/owasp-mapping'
import { getSeverityColor } from '@/lib/cvss-utils'
import { ChevronDown, ExternalLink, Copy, Check } from 'lucide-react'
import { useState } from 'react'

interface FindingDetailPanelProps {
  finding: Finding
  isOpen: boolean
  onClose: () => void
}

/** Allow only http/https hrefs to prevent javascript: XSS */
function safeHref(url: string | undefined): string {
  if (!url) return '#'
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return '#'
    return parsed.href
  } catch {
    return '#'
  }
}

export function FindingDetailPanel({ finding, isOpen, onClose }: FindingDetailPanelProps) {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const colors = getSeverityColor(finding.severity)
  const owaspLinks = finding.owasp.map(id => getOWASPCategory(id)).filter(Boolean)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end overflow-y-auto">
      <div className="bg-card border-t border-border w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom">
        {/* Header */}
        <div className={`${colors.bg} ${colors.border} border-b p-6 sticky top-0`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors.badge} border`}>
                  {finding.severity}
                </span>
                {finding.cvss && (
                  <span className="px-3 py-1 rounded-full text-xs font-mono bg-muted/50 text-foreground/80">
                    CVSS {finding.cvss.baseScore}/10
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold">{finding.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition"
              aria-label="Close"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Quick Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {finding.url && (
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase mb-2 block">
                  Affected URL
                </label>
                <div className="flex items-center gap-2 font-mono text-sm bg-muted/30 rounded-lg p-3 border border-border">
                  <span className="flex-1 truncate">{finding.url}</span>
                  <a
                    href={safeHref(finding.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 p-2 hover:bg-muted rounded transition"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            )}
            {finding.phase && (
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase mb-2 block">
                  Discovery Phase
                </label>
                <div className="px-3 py-2 rounded-lg bg-muted/30 border border-border text-sm">
                  {finding.phase}
                </div>
              </div>
            )}
          </div>

          {/* CVSS Vector Detail */}
          {finding.cvss && (
            <div className="border border-border rounded-lg p-4 bg-muted/20">
              <h3 className="font-semibold text-sm mb-3">CVSS v3.1 Scoring</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground">Vector String</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 text-xs bg-background rounded px-2 py-1 font-mono overflow-x-auto">
                      {finding.cvss.vector}
                    </code>
                    <button
                      onClick={() => copyToClipboard(finding.cvss?.vector || '')}
                      className="p-2 hover:bg-muted rounded transition"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground text-xs">Base Score</span>
                    <div className="font-mono font-bold">{finding.cvss.baseScore}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">Exploitability</span>
                    <div className="font-mono">{finding.cvss.exploitability?.toFixed(1) || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">Impact</span>
                    <div className="font-mono">{finding.cvss.impactScore?.toFixed(1) || 'N/A'}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Detection Method */}
          <div>
            <h3 className="font-semibold text-sm mb-2">How It Was Detected</h3>
            <div className="bg-muted/20 border border-border rounded-lg p-4">
              <p className="text-sm text-foreground leading-relaxed">{finding.detectionMethod}</p>
              {finding.evidence && (
                <div className="mt-3 pt-3 border-t border-border/50">
                  <p className="text-xs text-muted-foreground mb-2">Evidence</p>
                  <code className="text-xs bg-background rounded p-2 block font-mono overflow-x-auto text-foreground/80">
                    {finding.evidence}
                  </code>
                </div>
              )}
            </div>
          </div>

          {/* Classification */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {finding.cwe.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm mb-2">CWE References</h3>
                <div className="space-y-2">
                  {finding.cwe.map(cwe => (
                    <a
                      key={cwe}
                      href={`https://cwe.mitre.org/data/definitions/${cwe.split('-')[1]}.html`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30 hover:bg-muted/50 border border-border transition text-sm font-mono"
                    >
                      {cwe}
                      <ExternalLink className="w-3 h-3 ml-auto" />
                    </a>
                  ))}
                </div>
              </div>
            )}
            {owaspLinks.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm mb-2">OWASP Top 10</h3>
                <div className="space-y-2">
                  {owaspLinks.map(category => (
                    <a
                      key={category?.id}
                      href={`https://owasp.org/www-project-top-ten/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30 hover:bg-muted/50 border border-border transition text-sm font-mono"
                    >
                      {category?.id}: {category?.title}
                      <ExternalLink className="w-3 h-3 ml-auto" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold text-sm mb-2">Description</h3>
            <p className="text-sm text-foreground/90 leading-relaxed">{finding.description}</p>
          </div>

          {/* Remediation */}
          {finding.remediationSteps.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm mb-3">Remediation Steps</h3>
              <ol className="space-y-2">
                {finding.remediationSteps.map((step, idx) => (
                  <li key={idx} className="flex gap-3 text-sm">
                    <span className="font-mono text-xs bg-muted rounded px-2 py-1 h-fit shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-foreground/90">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Tools & References */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {finding.toolsUsed.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm mb-2">Detection Tools</h3>
                <div className="flex flex-wrap gap-2">
                  {finding.toolsUsed.map(tool => (
                    <span
                      key={tool}
                      className="px-2 py-1 text-xs rounded bg-muted border border-border font-mono"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {finding.references.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm mb-2">Resources</h3>
                <div className="space-y-1">
                  {finding.references.map((ref, idx) => (
                    <a
                      key={idx}
                      href={safeHref(ref)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 truncate"
                    >
                      {ref}
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
