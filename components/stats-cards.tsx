'use client'

import { ScanSummary } from '@/lib/scan-types'
import { Globe, Link2, Shield, AlertTriangle, Cloud, Key, Crosshair, Database, Bug, Lock, Code2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardsProps {
  summary: ScanSummary
  isScanning?: boolean
}

interface StatCard {
  label: string
  value: number
  icon: React.ElementType
  color: string
  bg: string
  highlight?: boolean
}

export function StatsCards({ summary, isScanning }: StatsCardsProps) {
  const cards: StatCard[] = [
    { label: 'Passive Subdomains',  value: summary.subdomainsPassive,  icon: Globe,         color: 'text-[#4ecdc4]', bg: 'bg-[#4ecdc4]/10' },
    { label: 'Live Subdomains',     value: summary.subdomainsResolved, icon: Link2,         color: 'text-[#4ecdc4]', bg: 'bg-[#4ecdc4]/10' },
    { label: 'Live URLs',           value: summary.liveUrls,           icon: Crosshair,     color: 'text-[#00d4aa]', bg: 'bg-[#00d4aa]/10' },
    { label: 'Unique Endpoints',    value: summary.uniqueEndpoints,    icon: Database,      color: 'text-[#00d4aa]', bg: 'bg-[#00d4aa]/10' },
    { label: 'Critical Findings',   value: summary.criticalFindings,   icon: AlertTriangle, color: 'text-[#ff3b5c]', bg: 'bg-[#ff3b5c]/10', highlight: summary.criticalFindings > 0 },
    { label: 'High Findings',       value: summary.highFindings,       icon: Shield,        color: 'text-[#ff6b35]', bg: 'bg-[#ff6b35]/10', highlight: summary.highFindings > 0 },
    { label: 'Medium Findings',     value: summary.mediumFindings,     icon: Bug,           color: 'text-[#f7b731]', bg: 'bg-[#f7b731]/10' },
    { label: 'CORS Issues',         value: summary.corsIssues,         icon: Lock,          color: 'text-[#f7b731]', bg: 'bg-[#f7b731]/10', highlight: summary.corsIssues > 0 },
    { label: 'Open Buckets',        value: summary.openBuckets,        icon: Cloud,         color: 'text-[#ff3b5c]', bg: 'bg-[#ff3b5c]/10', highlight: summary.openBuckets > 0 },
    { label: 'Takeovers',           value: summary.subdoTakeovers,     icon: AlertTriangle, color: 'text-[#ff3b5c]', bg: 'bg-[#ff3b5c]/10', highlight: summary.subdoTakeovers > 0 },
    { label: 'JWT Flaws',           value: summary.jwtFlaws,           icon: Key,           color: 'text-[#ff6b35]', bg: 'bg-[#ff6b35]/10', highlight: summary.jwtFlaws > 0 },
    { label: 'Headers Missing',     value: summary.missingSecurityHeaders, icon: Code2,    color: 'text-[#f7b731]', bg: 'bg-[#f7b731]/10', highlight: summary.missingSecurityHeaders > 0 },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
      {cards.map(card => {
        const Icon = card.icon
        return (
          <div
            key={card.label}
            className={cn(
              "bg-[#0f1117] border rounded-xl p-4 flex flex-col gap-3 transition-all",
              card.highlight && card.value > 0
                ? "border-current/30 shadow-[0_0_20px_rgba(255,59,92,0.06)]"
                : "border-[#1e2535]"
            )}
          >
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", card.bg)}>
              <Icon className={cn("w-4 h-4", card.color)} strokeWidth={1.5} />
            </div>
            <div>
              <p className={cn(
                "text-2xl font-bold font-mono leading-none",
                card.value === 0
                  ? "text-[#334155]"
                  : card.highlight
                    ? card.color
                    : "text-white",
                isScanning && card.value > 0 && "transition-all"
              )}>
                {card.value.toLocaleString()}
              </p>
              <p className="text-[10px] text-[#64748b] mt-1 leading-tight">{card.label}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
