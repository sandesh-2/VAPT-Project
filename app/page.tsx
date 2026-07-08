'use client'

import { useState, useCallback } from 'react'
import { Sidebar } from '@/components/sidebar'
import { ScanLauncher } from '@/components/scan-launcher'
import { DashboardView } from '@/components/dashboard-view'
import { PassiveReconView } from '@/components/passive-recon-view'
import { ActiveScanView } from '@/components/active-scan-view'
import { ReportPanel } from '@/components/report-panel'
import { FindingsList } from '@/components/findings-list'
import { ReportExport } from '@/components/report-export'
import { ScanConfig, ScanSession, ScanStatus, PHASE_DEFINITIONS } from '@/lib/scan-types'
import { createScanSession, startScan, pauseScan, resumeScan, stopScan } from '@/lib/scan-engine'
import { SecurityCalculator } from '@/components/security-calculator'

const DEFAULT_CONFIG: ScanConfig = {
  target: '',
  scopeUrl: '',
  researcher: 'VAPT-Platform',
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
  const [selectedPhase, setSelectedPhase] = useState<number | undefined>(undefined)

  const scanProgress = session
    ? Math.round((session.phases.filter(p => p.status === 'done').length / session.phases.length) * 100)
    : 0

  const handleStart = useCallback(async () => {
    if (!config.target || !config.scopeUrl) return

    try {
      // Create new session
      const newSession = await createScanSession(config)
      if (!newSession) throw new Error('Failed to create scan session')
      
      setSession(newSession)
      setStatus('running')
      setActiveTab('dashboard')

      // Start scanning with callback updates
      startScan(newSession, (updated) => {
        setSession(updated)
        if (updated.status === 'completed') {
          setStatus('completed')
        }
      })
    } catch (error) {
      console.error('[v0] Scan start error:', error)
      setStatus('failed')
      setSession(null)
    }
  }, [config])

  const handlePause = useCallback(() => {
    if (status === 'running') {
      pauseScan()
      setStatus('paused')
      setSession(prev => (prev ? { ...prev, status: 'paused' } : prev))
    } else if (status === 'paused' && session) {
      setStatus('running')
      setSession(prev => (prev ? { ...prev, status: 'running' } : prev))
      resumeScan(session, (updated) => {
        setSession(updated)
        if (updated.status === 'completed') {
          setStatus('completed')
        }
      })
    }
  }, [status, session])

  const handleStop = useCallback(() => {
    if (session) {
      stopScan(session)
      setStatus('idle')
      setSession(prev => (prev ? { ...prev, status: 'failed' } : prev))
    }
  }, [session])

  const allFindings = session
    ? session.phases.flatMap(p => p.findings).sort((a, b) => (b.cvss?.baseScore || 0) - (a.cvss?.baseScore || 0))
    : []

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            session={session}
            onSelectPhase={setSelectedPhase}
            selectedPhase={selectedPhase}
          />
        )

      case 'scanner':
        return (
          <ScanLauncher
            config={config}
            onConfigChange={setConfig}
            status={status}
            onStart={handleStart}
            onStop={handleStop}
            onPause={handlePause}
          />
        )

      case 'passive':
        return session ? <PassiveReconView session={session} /> : null

      case 'active':
        return session ? (
          <ActiveScanView
            session={session}
            onSelectPhase={setSelectedPhase}
            selectedPhase={selectedPhase}
          />
        ) : null

      case 'vulns':
        return <FindingsList findings={allFindings} />

      case 'calculator':
        return <SecurityCalculator />

      case 'report':
        return session ? (
          <div className="space-y-6">
            <ReportPanel session={session} />
            <ReportExport session={session} />
          </div>
        ) : null

      default:
        return null
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isScanning={status === 'running'}
        scanProgress={scanProgress}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">ReconForge</h1>
              <p className="text-sm text-muted-foreground mt-1">Automated Bug Bounty & VAPT Platform</p>
            </div>
            {session && (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">Scan Progress</div>
                  <div className="text-2xl font-bold font-mono">{scanProgress}%</div>
                </div>
                <div className="w-1 h-16 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ height: `${scanProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="bg-card border border-border rounded-lg p-6">{renderContent()}</div>

          {/* Stats Footer */}
          {session && (
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="text-xs text-muted-foreground uppercase mb-1">Total Findings</div>
                <div className="text-2xl font-bold">{allFindings.length}</div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="text-xs text-muted-foreground uppercase mb-1">Critical</div>
                <div className="text-2xl font-bold text-red-400">{session.summary.criticalFindings ?? 0}</div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="text-xs text-muted-foreground uppercase mb-1">High</div>
                <div className="text-2xl font-bold text-orange-400">{session.summary.highFindings ?? 0}</div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="text-xs text-muted-foreground uppercase mb-1">Risk Score</div>
                <div className="text-2xl font-bold text-primary">{Math.min(100, session.summary.riskScore ?? 0)}</div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
