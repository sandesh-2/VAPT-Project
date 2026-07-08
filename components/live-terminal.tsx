'use client'

import { useEffect, useRef } from 'react'
import { LogEntry } from '@/lib/scan-types'
import { cn } from '@/lib/utils'
import { Terminal } from 'lucide-react'

interface LiveTerminalProps {
  logs: LogEntry[]
  title?: string
  maxHeight?: string
}

const LOG_STYLES = {
  info:    { prefix: '[*]', color: 'text-[#4ecdc4]' },
  success: { prefix: '[+]', color: 'text-[#45d48a]' },
  warn:    { prefix: '[!]', color: 'text-[#f7b731]' },
  error:   { prefix: '[-]', color: 'text-[#ff3b5c]' },
}

export function LiveTerminal({ logs, title = 'Live Output', maxHeight = '260px' }: LiveTerminalProps) {
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  return (
    <div className="bg-[#0a0b0f] border border-[#1e2535] rounded-xl overflow-hidden">
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#1e2535] bg-[#0f1117]">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff3b5c]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#f7b731]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#45d48a]" />
        </div>
        <Terminal className="w-3.5 h-3.5 text-[#64748b] ml-1" />
        <span className="text-[11px] text-[#64748b] font-mono">{title}</span>
      </div>

      {/* Log output */}
      <div
        className="overflow-y-auto p-4 font-mono text-[11px] leading-relaxed"
        style={{ maxHeight }}
      >
        {logs.length === 0 ? (
          <span className="text-[#334155]">Awaiting scan start...</span>
        ) : (
          logs.map((log, i) => {
            const style = LOG_STYLES[log.level]
            return (
              <div key={i} className="log-entry flex gap-2 mb-1">
                <span className="text-[#334155] flex-shrink-0 select-none">
                  {log.ts.slice(11, 19)}
                </span>
                <span className={cn("flex-shrink-0 select-none", style.color)}>
                  {style.prefix}
                </span>
                <span className="text-[#c8d3e0]">{log.msg}</span>
              </div>
            )
          })
        )}
        {/* Blinking cursor */}
        <div className="flex gap-2 mt-1">
          <span className="text-[#334155] select-none">
            {logs.length > 0 ? logs[logs.length - 1]?.ts.slice(11, 19) : '--:--:--'}
          </span>
          <span className="text-[#00d4aa] cursor-blink" />
        </div>
        <div ref={endRef} />
      </div>
    </div>
  )
}
