'use client'

import { ScanSession } from '@/lib/scan-types'
import { LiveTerminal } from './live-terminal'
import { FindingsTable } from './findings-table'
import { Globe, Link2, Archive, Server, Search, Radio } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PassiveReconViewProps {
  session: ScanSession | null
}

interface SourceCard {
  label: string
  desc: string
  icon: React.ElementType
  color: string
  bg: string
  phase: number
}

const SOURCES: SourceCard[] = [
  { label: 'Subfinder',       desc: '52 passive API sources (crt.sh, SecurityTrails, VirusTotal…)', icon: Search,   color: 'text-[#00d4aa]', bg: 'bg-[#00d4aa]/10', phase: 1 },
  { label: 'BBOT Passive',    desc: 'BinaryEdge, Shodan, VirusTotal, GitHub correlation',             icon: Globe,    color: 'text-[#4ecdc4]', bg: 'bg-[#4ecdc4]/10', phase: 1 },
  { label: 'crt.sh',          desc: 'Certificate transparency log — SANs & wildcard certs',           icon: Server,   color: 'text-[#4ecdc4]', bg: 'bg-[#4ecdc4]/10', phase: 1 },
  { label: 'Wayback Machine', desc: 'Historical CDX API — leaked subdomains & old endpoints',         icon: Archive,  color: 'text-[#f7b731]', bg: 'bg-[#f7b731]/10', phase: 1 },
  { label: 'AlienVault OTX',  desc: 'Passive DNS records from OTX threat intelligence feed',          icon: Radio,    color: 'text-[#ff6b35]', bg: 'bg-[#ff6b35]/10', phase: 1 },
  { label: 'RapidDNS',        desc: 'Additional CT log aggregator with full subdomain history',       icon: Link2,    color: 'text-[#64748b]', bg: 'bg-[#64748b]/10', phase: 1 },
  { label: 'Assetfinder',     desc: 'Certificate + BGP-based subdomain enumeration',                  icon: Search,   color: 'text-[#64748b]', bg: 'bg-[#64748b]/10', phase: 1 },
  { label: 'GitHub Subdomains','desc': 'GitHub code search for leaked subdomain references',          icon: Globe,    color: 'text-[#64748b]', bg: 'bg-[#64748b]/10', phase: 1 },
]

const DNS_TOOLS = [
  { label: 'PureDNS',  desc: 'Wildcard detection, rate-limited resolution, trusted resolvers' },
  { label: 'DNSGen',   desc: 'Permutation & mutation wordlist generation from passive list' },
  { label: 'dig',      desc: 'A, CNAME, MX, TXT, NS record enrichment per subdomain' },
]

export function PassiveReconView({ session }: PassiveReconViewProps) {
  const phase1 = session?.phases.find(p => p.id === 1)
  const phase2 = session?.phases.find(p => p.id === 2)

  const passiveFindings = [...(phase1?.findings ?? []), ...(phase2?.findings ?? [])]
  const passiveLogs = [...(phase1?.logs ?? []), ...(phase2?.logs ?? [])]

  if (!session) {
    return (
      <div className="space-y-5">
        <div className="bg-[#0f1117] border border-[#1e2535] rounded-xl p-10 text-center">
          <Radio className="w-12 h-12 text-[#1e2535] mx-auto mb-4" />
          <p className="text-lg font-semibold text-white mb-2">Passive Reconnaissance</p>
          <p className="text-sm text-[#64748b]">
            OSINT sources, DNS enumeration, and passive data collection — no active traffic generated
          </p>
          <p className="text-xs text-[#334155] mt-3">Start a scan to begin passive recon</p>
        </div>

        {/* Source grid - informational */}
        <div className="bg-[#0f1117] border border-[#1e2535] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1e2535]">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#4ecdc4]" />
              <span className="text-sm font-semibold text-white">Passive OSINT Sources</span>
              <span className="text-[10px] font-mono text-[#64748b] bg-[#1c1f2e] px-2 py-0.5 rounded">Phase 1 — Zero active traffic</span>
            </div>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {SOURCES.map(src => {
              const Icon = src.icon
              return (
                <div key={src.label} className="bg-[#0a0b0f] border border-[#1e2535] rounded-lg p-4 hover:border-[#2a3347] transition-colors opacity-50">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-3", src.bg)}>
                    <Icon className={cn("w-4 h-4", src.color)} strokeWidth={1.5} />
                  </div>
                  <p className="text-sm font-semibold text-white mb-1">{src.label}</p>
                  <p className="text-[10px] text-[#64748b] leading-relaxed">{src.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Source grid */}
      <div className="bg-[#0f1117] border border-[#1e2535] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1e2535]">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#4ecdc4]" />
            <span className="text-sm font-semibold text-white">Passive OSINT Sources</span>
            <span className="text-[10px] font-mono text-[#64748b] bg-[#1c1f2e] px-2 py-0.5 rounded">Phase 1 — Zero active traffic</span>
          </div>
          <div className="flex items-center gap-2">
            {phase1 && (
              <span className={cn(
                "text-[10px] font-mono px-2 py-1 rounded border uppercase",
                phase1.status === 'done'    ? "text-[#45d48a] bg-[#45d48a]/10 border-[#45d48a]/20" :
                phase1.status === 'running' ? "text-[#00d4aa] bg-[#00d4aa]/10 border-[#00d4aa]/20" :
                "text-[#334155] bg-[#161821] border-[#1e2535]"
              )}>
                {phase1.status}
              </span>
            )}
          </div>
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SOURCES.map(src => {
            const Icon = src.icon
            return (
              <div key={src.label} className="bg-[#0a0b0f] border border-[#1e2535] rounded-lg p-4 hover:border-[#2a3347] transition-colors">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-3", src.bg)}>
                  <Icon className={cn("w-4 h-4", src.color)} strokeWidth={1.5} />
                </div>
                <p className="text-sm font-semibold text-white mb-1">{src.label}</p>
                <p className="text-[10px] text-[#64748b] leading-relaxed">{src.desc}</p>
              </div>
            )
          })}
        </div>
        <div className="px-4 pb-4">
          <div className="bg-[#0a0b0f] border border-[#1e2535] rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-white">Passive Subdomain Count</span>
              {phase1?.count !== undefined && (
                <span className="text-lg font-bold font-mono text-[#00d4aa]">{phase1.count.toLocaleString()}</span>
              )}
            </div>
            <div className="h-1.5 bg-[#1e2535] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#00d4aa] rounded-full transition-all duration-1000"
                style={{ width: phase1?.status === 'done' ? '100%' : phase1?.status === 'running' ? '60%' : '0%' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* DNS resolution */}
      <div className="bg-[#0f1117] border border-[#1e2535] rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#1e2535]">
          <Server className="w-4 h-4 text-[#00d4aa]" />
          <span className="text-sm font-semibold text-white">DNS Resolution & Mutation</span>
          <span className="text-[10px] font-mono text-[#64748b] bg-[#1c1f2e] px-2 py-0.5 rounded">Phase 2</span>
          {phase2?.count !== undefined && phase2.count > 0 && (
            <span className="ml-auto text-[#00d4aa] font-mono text-sm font-bold">{phase2.count} live</span>
          )}
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {DNS_TOOLS.map(t => (
            <div key={t.label} className="bg-[#0a0b0f] border border-[#1e2535] rounded-lg p-4 hover:border-[#2a3347] transition-colors">
              <p className="text-sm font-semibold text-white mb-1">{t.label}</p>
              <p className="text-[10px] text-[#64748b] leading-relaxed">{t.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Logs + Findings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LiveTerminal logs={passiveLogs} title="passive_dns.log" maxHeight="300px" />
        {passiveFindings.length > 0 && (
          <FindingsTable findings={passiveFindings} title="Passive Findings" />
        )}
      </div>
    </div>
  )
}
