'use client'

import { Shield, LayoutDashboard, Bug, Globe, Cpu, FileText, Settings, ChevronRight, Zap, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  isScanning: boolean
  scanProgress: number
}

const navItems = [
  { id: 'dashboard',  label: 'Dashboard',     icon: LayoutDashboard },
  { id: 'scanner',    label: 'Scan Engine',    icon: Zap },
  { id: 'passive',    label: 'Passive Recon',  icon: Globe },
  { id: 'active',     label: 'Active Scan',    icon: Activity },
  { id: 'vulns',      label: 'Vulnerabilities',icon: Bug },
  { id: 'report',     label: 'Reports',        icon: FileText },
  { id: 'settings',   label: 'Settings',       icon: Settings },
]

export function Sidebar({ activeTab, onTabChange, isScanning, scanProgress }: SidebarProps) {
  return (
    <aside className="flex flex-col w-14 lg:w-56 flex-shrink-0 bg-[#0f1117] border-r border-[#1e2535] h-screen sticky top-0 z-20">
      {/* Logo */}
      <div className="flex items-center gap-3 px-3 lg:px-4 h-14 border-b border-[#1e2535] flex-shrink-0">
        <div className="relative flex-shrink-0">
          <div className={cn(
            "w-7 h-7 rounded bg-[#00d4aa]/10 border border-[#00d4aa]/30 flex items-center justify-center",
            isScanning && "ring-pulse"
          )}>
            <Shield className="w-4 h-4 text-[#00d4aa]" strokeWidth={1.5} />
          </div>
        </div>
        <div className="hidden lg:block overflow-hidden">
          <p className="text-sm font-semibold text-white tracking-tight leading-none">ReconForge</p>
          <p className="text-[10px] text-[#64748b] font-mono mt-0.5">v4.0 — VAPT Platform</p>
        </div>
      </div>

      {/* Status bar */}
      {isScanning && (
        <div className="px-3 lg:px-4 py-2 border-b border-[#1e2535] flex-shrink-0">
          <div className="hidden lg:flex items-center justify-between mb-1">
            <span className="text-[10px] text-[#64748b] font-mono uppercase tracking-widest">Scan Active</span>
            <span className="text-[10px] text-[#00d4aa] font-mono">{scanProgress}%</span>
          </div>
          <div className="h-0.5 bg-[#1e2535] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#00d4aa] rounded-full transition-all duration-500"
              style={{ width: `${scanProgress}%` }}
            />
          </div>
          <div className="flex items-center justify-center lg:justify-start gap-1.5 mt-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00d4aa] scan-pulse flex-shrink-0" />
            <span className="hidden lg:block text-[10px] text-[#00d4aa] font-mono">SCANNING</span>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 py-3 flex flex-col gap-0.5 px-2 overflow-y-auto">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={cn(
              "flex items-center gap-3 px-2 py-2.5 rounded-md w-full text-left transition-all group",
              activeTab === id
                ? "bg-[#00d4aa]/10 text-[#00d4aa]"
                : "text-[#64748b] hover:text-[#e2e8f0] hover:bg-[#1c1f2e]"
            )}
          >
            <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
            <span className="hidden lg:block text-xs font-medium flex-1">{label}</span>
            {activeTab === id && (
              <ChevronRight className="hidden lg:block w-3 h-3 text-[#00d4aa]/60" />
            )}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 lg:px-4 py-3 border-t border-[#1e2535] flex-shrink-0">
        <div className="hidden lg:flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#00d4aa]/20 border border-[#00d4aa]/30 flex items-center justify-center flex-shrink-0">
            <Cpu className="w-3 h-3 text-[#00d4aa]" />
          </div>
          <div className="overflow-hidden">
            <p className="text-[10px] text-[#e2e8f0] font-mono truncate">cipherdecrypter</p>
            <p className="text-[9px] text-[#64748b]">researcher</p>
          </div>
        </div>
        <div className="flex lg:hidden justify-center">
          <div className="w-6 h-6 rounded-full bg-[#00d4aa]/20 border border-[#00d4aa]/30 flex items-center justify-center">
            <Cpu className="w-3 h-3 text-[#00d4aa]" />
          </div>
        </div>
      </div>
    </aside>
  )
}
