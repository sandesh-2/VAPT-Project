'use client'

import { Settings, Shield, Database, Bell, FileText, HelpCircle, ExternalLink } from 'lucide-react'

export function SettingsPanel() {
  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="w-6 h-6 text-[#00d4aa]" />
          <h1 className="text-2xl font-bold text-white">Settings</h1>
        </div>
        <p className="text-sm text-[#64748b]">Configuration and application preferences</p>
      </div>

      {/* Scan Configuration */}
      <div className="bg-[#0f1117] border border-[#1e2535] rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-[#1e2535] bg-[#0a0b0f]">
          <Database className="w-4 h-4 text-[#00d4aa]" />
          <h2 className="text-sm font-semibold text-white">Scan Defaults</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#64748b] uppercase tracking-widest block mb-2">
              Default Researcher Name
            </label>
            <input
              type="text"
              defaultValue="VAPT-Platform"
              className="w-full bg-[#0a0b0f] border border-[#1e2535] rounded-lg px-3 py-2 text-sm text-[#e2e8f0] placeholder-[#334155] focus:outline-none focus:border-[#00d4aa]/50 transition"
              placeholder="Your name or team"
            />
            <p className="text-[10px] text-[#334155] mt-1">Identifies scans in reports and logs</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#64748b] uppercase tracking-widest block mb-2">
                Rate Limit (req/s)
              </label>
              <input
                type="number"
                defaultValue="3"
                min="1"
                max="50"
                className="w-full bg-[#0a0b0f] border border-[#1e2535] rounded-lg px-3 py-2 text-sm text-[#e2e8f0] focus:outline-none focus:border-[#00d4aa]/50 transition"
              />
              <p className="text-[10px] text-[#334155] mt-1">Requests per second</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#64748b] uppercase tracking-widest block mb-2">
                Crawl Depth
              </label>
              <input
                type="number"
                defaultValue="5"
                min="1"
                max="10"
                className="w-full bg-[#0a0b0f] border border-[#1e2535] rounded-lg px-3 py-2 text-sm text-[#e2e8f0] focus:outline-none focus:border-[#00d4aa]/50 transition"
              />
              <p className="text-[10px] text-[#334155] mt-1">Max crawl depth</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#64748b] uppercase tracking-widest block mb-2">
                Crawl Timeout (s)
              </label>
              <input
                type="number"
                defaultValue="600"
                min="60"
                max="3600"
                className="w-full bg-[#0a0b0f] border border-[#1e2535] rounded-lg px-3 py-2 text-sm text-[#e2e8f0] focus:outline-none focus:border-[#00d4aa]/50 transition"
              />
              <p className="text-[10px] text-[#334155] mt-1">Seconds</p>
            </div>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-[#0f1117] border border-[#1e2535] rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-[#1e2535] bg-[#0a0b0f]">
          <Shield className="w-4 h-4 text-[#ff6b35]" />
          <h2 className="text-sm font-semibold text-white">Security</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between p-3 bg-[#0a0b0f] border border-[#1e2535] rounded-lg">
            <div>
              <p className="text-sm font-semibold text-white">SSL/TLS Verification</p>
              <p className="text-[10px] text-[#64748b] mt-1">Verify SSL certificates during scans</p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="w-4 h-4 rounded border-[#1e2535] bg-[#0a0b0f] accent-[#00d4aa] cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-[#0a0b0f] border border-[#1e2535] rounded-lg">
            <div>
              <p className="text-sm font-semibold text-white">Follow Redirects</p>
              <p className="text-[10px] text-[#64748b] mt-1">Follow HTTP redirects (max 10)</p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="w-4 h-4 rounded border-[#1e2535] bg-[#0a0b0f] accent-[#00d4aa] cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-[#0a0b0f] border border-[#1e2535] rounded-lg">
            <div>
              <p className="text-sm font-semibold text-white">DNS Over HTTPS</p>
              <p className="text-[10px] text-[#64748b] mt-1">Use DoH for DNS queries</p>
            </div>
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-[#1e2535] bg-[#0a0b0f] accent-[#00d4aa] cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-[#0f1117] border border-[#1e2535] rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-[#1e2535] bg-[#0a0b0f]">
          <Bell className="w-4 h-4 text-[#4ecdc4]" />
          <h2 className="text-sm font-semibold text-white">Notifications</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between p-3 bg-[#0a0b0f] border border-[#1e2535] rounded-lg">
            <div>
              <p className="text-sm font-semibold text-white">Scan Complete</p>
              <p className="text-[10px] text-[#64748b] mt-1">Notify when scan finishes</p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="w-4 h-4 rounded border-[#1e2535] bg-[#0a0b0f] accent-[#00d4aa] cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-[#0a0b0f] border border-[#1e2535] rounded-lg">
            <div>
              <p className="text-sm font-semibold text-white">Critical Findings</p>
              <p className="text-[10px] text-[#64748b] mt-1">Alert on CRITICAL severity discoveries</p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="w-4 h-4 rounded border-[#1e2535] bg-[#0a0b0f] accent-[#00d4aa] cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Export & Integration */}
      <div className="bg-[#0f1117] border border-[#1e2535] rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-[#1e2535] bg-[#0a0b0f]">
          <FileText className="w-4 h-4 text-[#f7b731]" />
          <h2 className="text-sm font-semibold text-white">Export & Integration</h2>
        </div>
        <div className="p-6 space-y-3">
          <button className="w-full flex items-center justify-between p-3 bg-[#0a0b0f] border border-[#1e2535] rounded-lg hover:border-[#00d4aa]/40 transition">
            <div className="text-left">
              <p className="text-sm font-semibold text-white">Export Settings</p>
              <p className="text-[10px] text-[#64748b] mt-0.5">Download as JSON</p>
            </div>
            <ExternalLink className="w-4 h-4 text-[#334155]" />
          </button>

          <button className="w-full flex items-center justify-between p-3 bg-[#0a0b0f] border border-[#1e2535] rounded-lg hover:border-[#00d4aa]/40 transition">
            <div className="text-left">
              <p className="text-sm font-semibold text-white">Import Settings</p>
              <p className="text-[10px] text-[#64748b] mt-0.5">Load from JSON file</p>
            </div>
            <ExternalLink className="w-4 h-4 text-[#334155]" />
          </button>

          <button className="w-full flex items-center justify-between p-3 bg-[#0a0b0f] border border-[#1e2535] rounded-lg hover:border-[#00d4aa]/40 transition">
            <div className="text-left">
              <p className="text-sm font-semibold text-white">Reset to Defaults</p>
              <p className="text-[10px] text-[#64748b] mt-0.5">Restore all settings</p>
            </div>
            <ExternalLink className="w-4 h-4 text-[#334155]" />
          </button>
        </div>
      </div>

      {/* Help & About */}
      <div className="bg-[#0f1117] border border-[#1e2535] rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-[#1e2535] bg-[#0a0b0f]">
          <HelpCircle className="w-4 h-4 text-[#64748b]" />
          <h2 className="text-sm font-semibold text-white">Help & About</h2>
        </div>
        <div className="p-6 space-y-3">
          <div className="text-sm space-y-2">
            <p className="text-[#64748b]">
              <strong>ReconForge</strong> v4.0 — Production-grade VAPT and Bug Bounty automation platform
            </p>
            <p className="text-[10px] text-[#334155]">
              Comprehensive 15-phase scanning engine with CVSS v3.1 scoring, OWASP Impact Matrix assessment, 
              and detailed vulnerability reporting for security professionals and bug bounty hunters.
            </p>
          </div>
          <div className="pt-4 border-t border-[#1e2535]">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-[#64748b] font-mono uppercase text-[9px] tracking-widest mb-1">Version</p>
                <p className="text-[#e2e8f0] font-mono">4.0.0</p>
              </div>
              <div>
                <p className="text-[#64748b] font-mono uppercase text-[9px] tracking-widest mb-1">Build</p>
                <p className="text-[#e2e8f0] font-mono">{new Date().toISOString().split('T')[0]}</p>
              </div>
              <div>
                <p className="text-[#64748b] font-mono uppercase text-[9px] tracking-widest mb-1">Status</p>
                <p className="text-[#45d48a] font-mono">Production Ready</p>
              </div>
              <div>
                <p className="text-[#64748b] font-mono uppercase text-[9px] tracking-widest mb-1">License</p>
                <p className="text-[#e2e8f0] font-mono">Proprietary</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
