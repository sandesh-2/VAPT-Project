'use client'

import { CheckCircle2, Circle, Loader2, AlertCircle, MinusCircle, ChevronRight } from 'lucide-react'
import { PhaseResult } from '@/lib/scan-types'
import { cn } from '@/lib/utils'

interface PhasePipelineProps {
  phases: PhaseResult[]
  activePhase?: number
  onSelectPhase: (id: number) => void
  selectedPhase?: number
}

const STATUS_ICON = {
  pending: Circle,
  running: Loader2,
  done:    CheckCircle2,
  skipped: MinusCircle,
  failed:  AlertCircle,
}

const STATUS_COLOR = {
  pending: 'text-[#334155]',
  running: 'text-[#00d4aa]',
  done:    'text-[#45d48a]',
  skipped: 'text-[#334155]',
  failed:  'text-[#ff3b5c]',
}

const STATUS_BG = {
  pending: 'bg-[#161821]',
  running: 'bg-[#00d4aa]/10',
  done:    'bg-[#45d48a]/10',
  skipped: 'bg-[#161821]',
  failed:  'bg-[#ff3b5c]/10',
}

export function PhasePipeline({ phases, activePhase, onSelectPhase, selectedPhase }: PhasePipelineProps) {
  return (
    <div className="bg-[#0f1117] border border-[#1e2535] rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2535]">
        <span className="text-xs font-semibold text-white uppercase tracking-widest">Pipeline — 15 Phases</span>
        <div className="flex items-center gap-3 text-[10px] font-mono text-[#64748b]">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#45d48a]" />Done</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#00d4aa] scan-pulse" />Running</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#334155]" />Pending</span>
        </div>
      </div>

      <div className="p-3 grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-3 xl:grid-cols-5 gap-2">
        {phases.map((phase, idx) => {
          const Icon = STATUS_ICON[phase.status]
          const isSelected = selectedPhase === phase.id
          const isActive = activePhase === phase.id

          return (
            <button
              key={phase.id}
              onClick={() => onSelectPhase(phase.id)}
              className={cn(
                "relative flex flex-col gap-1 p-2.5 rounded-lg border text-left transition-all",
                STATUS_BG[phase.status],
                isSelected
                  ? "border-[#00d4aa]/50 ring-1 ring-[#00d4aa]/20"
                  : "border-[#1e2535] hover:border-[#2a3347]"
              )}
            >
              {/* Phase number */}
              <div className="flex items-center justify-between">
                <span className={cn("text-[10px] font-mono", STATUS_COLOR[phase.status])}>
                  {String(phase.id).padStart(2, '0')}
                </span>
                <Icon
                  className={cn(
                    "w-3.5 h-3.5",
                    STATUS_COLOR[phase.status],
                    phase.status === 'running' && "animate-spin"
                  )}
                />
              </div>
              {/* Name */}
              <span className={cn(
                "text-[10px] font-medium leading-tight line-clamp-2",
                phase.status === 'pending' ? "text-[#334155]" : "text-[#e2e8f0]"
              )}>
                {phase.shortName}
              </span>
              {/* Count */}
              {phase.count > 0 && (
                <span className="text-[10px] font-mono text-[#00d4aa]">{phase.count.toLocaleString()}</span>
              )}
              {/* Active indicator */}
              {isActive && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#00d4aa] scan-pulse" />
              )}
            </button>
          )
        })}
      </div>

      {/* Progress bar */}
      <div className="px-3 pb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-[#64748b] font-mono">Progress</span>
          <span className="text-[10px] text-[#00d4aa] font-mono">
            {phases.filter(p => p.status === 'done').length}/{phases.length} phases
          </span>
        </div>
        <div className="h-1 bg-[#1e2535] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#00d4aa] rounded-full transition-all duration-700"
            style={{ width: `${(phases.filter(p => p.status === 'done').length / phases.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
