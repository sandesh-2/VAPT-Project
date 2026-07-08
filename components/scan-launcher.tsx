'use client'

import { useState } from 'react'
import { Play, Square, Pause, Settings2, Target, Globe, User, Gauge, ChevronDown } from 'lucide-react'
import { ScanConfig, ScanMode, ScanStatus } from '@/lib/scan-types'
import { cn } from '@/lib/utils'

interface ScanLauncherProps {
  config: ScanConfig
  onConfigChange: (cfg: ScanConfig) => void
  status: ScanStatus
  onStart: () => void
  onStop: () => void
  onPause: () => void
}

const RATE_OPTIONS = [1, 2, 3, 5, 10, 20]

// Input validators
const validators = {
  domain: (v: string): boolean => {
    if (!v || v.length === 0) return false
    if (v.length > 253) return false
    // Basic domain validation: alphanumeric, dots, hyphens only
    return /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i.test(v)
  },
  url: (v: string): boolean => {
    if (!v || v.length === 0) return false
    try {
      const url = new URL(v)
      return url.protocol === 'http:' || url.protocol === 'https:'
    } catch {
      return false
    }
  },
  researcher: (v: string): boolean => Boolean(v) && v.length > 0 && v.length <= 100,
}

export function ScanLauncher({ config, onConfigChange, status, onStart, onStop, onPause }: ScanLauncherProps) {
  const [advanced, setAdvanced] = useState(false)
  const isRunning = status === 'running'
  const isPaused  = status === 'paused'
  const isActive  = isRunning || isPaused

  const set = (patch: Partial<ScanConfig>) => onConfigChange({ ...config, ...patch })
  
  const isValidForScan = validators.domain(config.target) && validators.url(config.scopeUrl) && validators.researcher(config.researcher)

  return (
    <div className="bg-[#0f1117] border border-[#1e2535] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#1e2535]">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-[#00d4aa]" />
          <span className="text-sm font-semibold text-white">Scan Configuration</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Mode selector */}
          {(['passive', 'active', 'full'] as ScanMode[]).map(m => (
            <button
              key={m}
              onClick={() => !isActive && set({ mode: m })}
              disabled={isActive}
              className={cn(
                "px-2.5 py-1 text-[11px] font-mono rounded border transition-all uppercase tracking-wider",
                config.mode === m
                  ? "bg-[#00d4aa]/15 text-[#00d4aa] border-[#00d4aa]/40"
                  : "text-[#64748b] border-[#1e2535] hover:text-[#e2e8f0] hover:border-[#2a3347]",
                isActive && "opacity-40 cursor-not-allowed"
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Main inputs */}
      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Target */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-[#64748b] font-mono uppercase tracking-widest flex items-center gap-1.5">
            <Globe className="w-3 h-3" /> Target Domain
          </label>
          <input
            value={config.target}
            onChange={e => !isActive && set({ target: e.target.value })}
            disabled={isActive}
            placeholder="example.com"
            className={cn(
              "bg-[#161821] border border-[#1e2535] rounded-lg px-3 py-2.5 text-sm text-white font-mono placeholder:text-[#334155] focus:outline-none focus:border-[#00d4aa]/50 transition-colors",
              isActive && "opacity-50 cursor-not-allowed"
            )}
          />
        </div>

        {/* Scope URL */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-[#64748b] font-mono uppercase tracking-widest flex items-center gap-1.5">
            <Target className="w-3 h-3" /> Scope URL
          </label>
          <input
            value={config.scopeUrl}
            onChange={e => !isActive && set({ scopeUrl: e.target.value })}
            disabled={isActive}
            placeholder="https://www.example.com"
            className={cn(
              "bg-[#161821] border border-[#1e2535] rounded-lg px-3 py-2.5 text-sm text-white font-mono placeholder:text-[#334155] focus:outline-none focus:border-[#00d4aa]/50 transition-colors",
              isActive && "opacity-50 cursor-not-allowed"
            )}
          />
        </div>

        {/* Researcher */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-[#64748b] font-mono uppercase tracking-widest flex items-center gap-1.5">
            <User className="w-3 h-3" /> Researcher Handle
          </label>
          <input
            value={config.researcher}
            onChange={e => !isActive && set({ researcher: e.target.value })}
            disabled={isActive}
            placeholder="researcher"
            className={cn(
              "bg-[#161821] border border-[#1e2535] rounded-lg px-3 py-2.5 text-sm text-white font-mono placeholder:text-[#334155] focus:outline-none focus:border-[#00d4aa]/50 transition-colors",
              isActive && "opacity-50 cursor-not-allowed"
            )}
          />
        </div>

        {/* Rate limit */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-[#64748b] font-mono uppercase tracking-widest flex items-center gap-1.5">
            <Gauge className="w-3 h-3" /> Rate Limit (RPS)
          </label>
          <div className="flex gap-2">
            {RATE_OPTIONS.map(r => (
              <button
                key={r}
                onClick={() => !isActive && set({ rateLimit: r })}
                disabled={isActive}
                className={cn(
                  "flex-1 py-2.5 text-xs font-mono rounded-lg border transition-all",
                  config.rateLimit === r
                    ? "bg-[#00d4aa]/15 text-[#00d4aa] border-[#00d4aa]/40"
                    : "bg-[#161821] text-[#64748b] border-[#1e2535] hover:text-white hover:border-[#2a3347]",
                  isActive && "opacity-40 cursor-not-allowed"
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Advanced */}
      <div className="px-5 pb-2">
        <button
          onClick={() => setAdvanced(v => !v)}
          className="flex items-center gap-1.5 text-[11px] text-[#64748b] hover:text-[#e2e8f0] transition-colors"
        >
          <Settings2 className="w-3.5 h-3.5" />
          Advanced options
          <ChevronDown className={cn("w-3 h-3 transition-transform", advanced && "rotate-180")} />
        </button>
        {advanced && (
          <div className="mt-3 grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-[#64748b] font-mono uppercase tracking-widest">Crawl Depth</label>
              <input
                type="number" min={1} max={10}
                value={config.maxCrawlDepth}
                onChange={e => !isActive && set({ maxCrawlDepth: parseInt(e.target.value) })}
                disabled={isActive}
                className="bg-[#161821] border border-[#1e2535] rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-[#00d4aa]/50"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-[#64748b] font-mono uppercase tracking-widest">Crawl Duration (s)</label>
              <input
                type="number" min={60} max={3600} step={60}
                value={config.crawlDuration}
                onChange={e => !isActive && set({ crawlDuration: parseInt(e.target.value) })}
                disabled={isActive}
                className="bg-[#161821] border border-[#1e2535] rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-[#00d4aa]/50"
              />
            </div>
            <div className="col-span-2 flex flex-col gap-1.5">
              <label className="text-[10px] text-[#64748b] font-mono uppercase tracking-widest">GitHub Token (optional)</label>
              <input
                type="password"
                value={config.githubToken ?? ''}
                onChange={e => !isActive && set({ githubToken: e.target.value })}
                disabled={isActive}
                placeholder="ghp_••••••••••••••••"
                className="bg-[#161821] border border-[#1e2535] rounded-lg px-3 py-2 text-sm text-white font-mono placeholder:text-[#334155] focus:outline-none focus:border-[#00d4aa]/50"
              />
            </div>
          </div>
        )}
      </div>

      {/* Action bar */}
      <div className="flex items-center gap-3 px-5 py-4 border-t border-[#1e2535] mt-2">
        {!isActive ? (
          <button
            onClick={onStart}
            disabled={!isValidForScan}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all",
              isValidForScan
                ? "bg-[#00d4aa] text-[#0a0b0f] hover:bg-[#00a884] shadow-[0_0_20px_rgba(0,212,170,0.2)]"
                : "bg-[#1c1f2e] text-[#334155] cursor-not-allowed"
            )}
            title={!isValidForScan ? "Enter valid domain, scope URL, and researcher name" : "Start security scan"}
          >
            <Play className="w-4 h-4" />
            Launch Scan
          </button>
        ) : (
          <>
            <button
              onClick={onPause}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-[#f7b731]/10 text-[#f7b731] border border-[#f7b731]/20 hover:bg-[#f7b731]/20 transition-all"
            >
              <Pause className="w-4 h-4" />
              {isPaused ? 'Resume' : 'Pause'}
            </button>
            <button
              onClick={onStop}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-[#ff3b5c]/10 text-[#ff3b5c] border border-[#ff3b5c]/20 hover:bg-[#ff3b5c]/20 transition-all"
            >
              <Square className="w-4 h-4" />
              Stop
            </button>
          </>
        )}

        <div className="ml-auto flex items-center gap-2">
          {isRunning && <span className="w-2 h-2 rounded-full bg-[#00d4aa] scan-pulse" />}
          {isPaused  && <span className="w-2 h-2 rounded-full bg-[#f7b731]" />}
          <span className={cn(
            "text-xs font-mono uppercase tracking-widest",
            isRunning ? "text-[#00d4aa]" : isPaused ? "text-[#f7b731]" : "text-[#334155]"
          )}>
            {status}
          </span>
        </div>
      </div>
    </div>
  )
}
