'use client'

import { useState, useCallback, useRef } from 'react'
import { Sidebar } from '@/components/sidebar'
import { ScanLauncher } from '@/components/scan-launcher'
import { DashboardView } from '@/components/dashboard-view'
import { PassiveReconView } from '@/components/passive-recon-view'
import { ActiveScanView } from '@/components/active-scan-view'
import { VulnScannerView } from '@/components/vuln-scanner-view'
import { ReportPanel } from '@/components/report-panel'
import { ScanConfig, ScanSession, ScanStatus, PHASE_DEFINITIONS } from '@/lib/scan-types'
import { buildMockSession, simulatePhaseData, computeSummary } from '@/lib/scan-engine'
import { Settings2, Bell, ChevronRight, Terminal } from 'lucide-react'

const DEFAULT_CONFIG: ScanConfig = {
  target: '',
  scopeUrl: '',
  researcher: 'cipherdecrypter',
  rateLimit: 3,
  maxCrawlDepth: 5,
  crawlDuration: 600,
  mode: 'full',
  phases: PHASE_DEFINITIONS.map(p => p.id),
}

export default function Page() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [config, setConfig] = useState<ScanConfig>(DEFAULT_CONFIG)
  const [session, setSession] = useState<ScanSession | null>(null)
  const [status, setStatus] = useState<ScanStatus>('idle')
  const [selectedPhase, setSelectedPhase] = useState<number | undefined>()
  const scanRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const phaseIdxRef = useRef(0)
  const pausedRef = useRef(false)

  const scanProgress = session
    ? Math.round((session.phases.filter(p => p.status === 'done').length / session.phases.length) * 100)
    : 0

  const advancePhase = useCallback((sess: ScanSession, idx: number) => {
    if (pausedRef.current) {
      scanRef.current = setTimeout(() => advancePhase(sess, idx), 800)
      return
    }

    if (idx >= sess.phases.length) {
      setSession(prev => {
        if (!prev) return prev
        return { ...prev, status: 'completed', completedAt: new Date().toISOString() }
      })
      setStatus('completed')
      return
    }

    const phaseId = sess.phases[idx].id
    const phaseData = simulatePhaseData(phaseId, sess.config.target)

    // Mark current as running
    setSession(prev => {
      if (!prev) return prev
      const phases = prev.phases.map(p =>
        p.id === phaseId ? { ...p, status: 'running' as const } : p
      )
      return { ...prev, phases }
    })

    // Duration per phase
    const duration = 1800 + Math.random() * 1200

    scanRef.current = setTimeout(() => {
      setSession(prev => {
        if (!prev) return prev
        const phases = prev.phases.map(p =>
          p.id === phaseId
            ? {
                ...p,
                status: 'done' as const,
                count: phaseData.count ?? 0,
                findings: phaseData.findings ?? [],
                logs: phaseData.logs ?? [],
                duration: Math.round(duration),
              }
            : p
        )
        const updated = { ...prev, phases }
        return { ...updated, summary: computeSummary(phases) }
      })

      phaseIdxRef.current = idx + 1
      advancePhase(sess, idx + 1)
    }, duration)
  }, [])

  const handleStart = useCallback(() => {
    if (!config.target) return
    pausedRef.current = false
    phaseIdxRef.current = 0

    const newSession = buildMockSession(config)
    setSession(newSession)
    setStatus('running')
    setActiveTab('dashboard')
    advancePhase(newSession, 0)
  }, [config, advancePhase])

  const handleStop = useCallback(() => {
    if (scanRef.current) clearTimeout(scanRef.current)
    pausedRef.current = false
    setStatus('idle')
    setSession(prev => prev ? { ...prev, status: 'idle' } : prev)
  }, [])

  const handlePause = useCallback(() => {
    if (status === 'running') {
      pausedRef.current = true
      setStatus('paused')
      setSession(prev => prev ? { ...prev, status: 'paused' } : prev)
    } else if (status === 'paused') {
      pausedRef.current = false
      setStatus('running')
      setSession(prev => prev ? { ...prev, status: 'running' } : prev)
    }
  }, [status])

  const renderContent = () => {
    switch (activeTab) {
      case 'scanner':
        return (
          <div className="space-y-5">
            <ScanLauncher
              config={config}
              onConfigChange={setConfig}
              status={status}
              onStart={handleStart}
              onStop={handleStop}
              onPause={handlePause}
            />
            {session && (
              <div className="bg-[#0f1117] border border-[#1e2535] rounded-xl p-5">
                <h3 className="text-xs font-semibold text-white mb-4 uppercase tracking-widest">Phase Overview</h3>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {session.phases.map(p => (
                    <div
                      key={p.id}
                      className={`p-3 rounded-lg border text-center cursor-pointer transition-all
                        ${p.status === 'done'    ? 'bg-[#45d48a]/10 border-[#45d48a]/20' :
                          p.status === 'running' ? 'bg-[#00d4aa]/10 border-[#00d4aa]/30' :
                          p.status === 'failed'  ? 'bg-[#ff3b5c]/10 border-[#ff3b5c]/20' :
                          'bg-[#161821] border-[#1e2535]'}`}
                      onClick={() => { setSelectedPhase(p.id); setActiveTab('active') }}
                    >
                      <p className={`text-[10px] font-mono
                        ${p.status === 'done' ? 'text-[#45d48a]' :
                          p.status === 'running' ? 'text-[#00d4aa]' :
                          'text-[#334155]'}`}
                      >{String(p.id).padStart(2,'0')}</p>
                      <p className="text-[9px] text-[#64748b] mt-0.5 leading-tight">{p.shortName}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      case 'passive':
        return <PassiveReconView session={session} />
      case 'active':
        return <ActiveScanView session={session} onSelectPhase={setSelectedPhase} selectedPhase={selectedPhase} />
      case 'vulns':
        return <VulnScannerView session={session} />
      case 'report':
        return <ReportPanel session={session} />
      case 'settings':
        return (
          <div className="bg-[#0f1117] border border-[#1e2535] rounded-xl p-8 flex flex-col items-center justify-center gap-4 min-h-[300px]">
            <Settings2 className="w-10 h-10 text-[#1e2535]" />
            <div className="text-center">
              <p className="text-sm font-semibold text-white mb-1">Settings</p>
              <p className="text-xs text-[#64748b]">Configure tool paths, API keys, notify channels, and wordlists</p>
            </div>
            <div className="w-full max-w-sm space-y-3">
              {[
                { label: 'SecLists Path',    placeholder: '/usr/share/wordlists/seclists' },
                { label: 'Amass Config',     placeholder: '/etc/amass/config.ini' },
                { label: 'Resolvers File',   placeholder: 'resolvers.txt' },
                { label: 'Notify Config',    placeholder: '/etc/notify/provider-config.yaml' },
              ].map(({ label, placeholder }) => (
                <div key={label} className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-[#64748b] font-mono uppercase tracking-widest">{label}</label>
                  <input
                    placeholder={placeholder}
                    className="bg-[#161821] border border-[#1e2535] rounded-lg px-3 py-2 text-sm text-white font-mono placeholder:text-[#334155] focus:outline-none focus:border-[#00d4aa]/50"
                  />
                </div>
              ))}
            </div>
          </div>
        )
      default:
        return (
          <DashboardView
            session={session}
            onSelectPhase={id => { setSelectedPhase(id); setActiveTab('active') }}
            selectedPhase={selectedPhase}
          />
        )
    }
  }

  const tabTitle: Record<string, string> = {
    dashboard: 'Dashboard',
    scanner:   'Scan Engine',
    passive:   'Passive Reconnaissance',
    active:    'Active Scan',
    vulns:     'Vulnerability Scanner',
    report:    'Reports',
    settings:  'Settings',
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0b0f]">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isScanning={status === 'running'}
        scanProgress={scanProgress}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 h-14 border-b border-[#1e2535] bg-[#0f1117] flex-shrink-0">
          <div className="flex items-center gap-2 text-xs text-[#64748b]">
            <Terminal className="w-3.5 h-3.5 text-[#00d4aa]" />
            <span className="font-mono text-[#00d4aa]">reconforge</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#e2e8f0]">{tabTitle[activeTab] ?? activeTab}</span>
            {session && status !== 'idle' && (
              <>
                <ChevronRight className="w-3 h-3" />
                <span className="font-mono text-[#64748b]">{session.config.target}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            {session && status !== 'idle' && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0a0b0f] border border-[#1e2535] rounded-lg">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0
                  ${status === 'running'   ? 'bg-[#00d4aa] scan-pulse' :
                    status === 'paused'    ? 'bg-[#f7b731]' :
                    status === 'completed' ? 'bg-[#45d48a]' :
                    'bg-[#334155]'}`}
                />
                <span className={`text-[10px] font-mono uppercase
                  ${status === 'running'   ? 'text-[#00d4aa]' :
                    status === 'paused'    ? 'text-[#f7b731]' :
                    status === 'completed' ? 'text-[#45d48a]' :
                    'text-[#334155]'}`}
                >{status}</span>
                {status === 'running' && (
                  <span className="text-[10px] font-mono text-[#64748b]">{scanProgress}%</span>
                )}
              </div>
            )}
            {session && (
              <button
                onClick={() => setActiveTab('report')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-medium text-[#64748b] bg-[#0a0b0f] border border-[#1e2535] rounded-lg hover:text-white hover:border-[#2a3347] transition-all"
              >
                <Bell className="w-3 h-3" />
                Report
              </button>
            )}
          </div>
        </header>

        {/* Scroll area */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-5 py-6">
            {/* Quick-start banner when no session */}
            {!session && activeTab !== 'scanner' && (
              <div className="mb-5 flex items-center gap-3 px-4 py-3 bg-[#00d4aa]/5 border border-[#00d4aa]/20 rounded-xl">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00d4aa] scan-pulse flex-shrink-0" />
                <p className="text-xs text-[#e2e8f0]">
                  No active scan. Go to{' '}
                  <button
                    onClick={() => setActiveTab('scanner')}
                    className="text-[#00d4aa] hover:underline font-medium"
                  >
                    Scan Engine
                  </button>{' '}
                  to configure a target and launch the 15-phase pipeline.
                </p>
              </div>
            )}
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  )
}
