'use client'

import { ScanSession } from '@/lib/scan-types'
import {
  generateMarkdownReport,
  generateJSONReport,
  generateCSVReport,
  downloadReport,
  copyToClipboard,
} from '@/lib/export-utils'
import { FileDown, Copy, Check } from 'lucide-react'
import { useState } from 'react'

interface ReportExportProps {
  session: ScanSession | null | undefined
}

export function ReportExport({ session }: ReportExportProps) {
  if (!session) {
    return (
      <div className="bg-[#0f1117] border border-[#1e2535] rounded-xl p-10 flex flex-col items-center justify-center gap-3">
        <FileDown className="w-10 h-10 text-[#1e2535]" />
        <p className="text-sm text-[#334155] font-mono">No scan available for export</p>
        <p className="text-xs text-[#334155]">Run a scan to export reports</p>
      </div>
    )
  }
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState<string | null>(null)

  const handleExport = async (format: 'markdown' | 'json' | 'csv') => {
    setDownloading(format)

    try {
      let content = ''
      let filename = `scan-report-${session.config.target}-${new Date().getTime()}`
      let mimeType = 'text/plain'

      switch (format) {
        case 'markdown':
          content = generateMarkdownReport(session)
          filename += '.md'
          mimeType = 'text/markdown'
          break
        case 'json':
          content = generateJSONReport(session)
          filename += '.json'
          mimeType = 'application/json'
          break
        case 'csv':
          content = generateCSVReport(session)
          filename += '.csv'
          mimeType = 'text/csv'
          break
      }

      downloadReport(filename, content, mimeType)
    } finally {
      setDownloading(null)
    }
  }

  const handleCopyMarkdown = async () => {
    const content = generateMarkdownReport(session)
    const success = await copyToClipboard(content)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="bg-[#0f1117] border border-[#1e2535] rounded-xl p-6 space-y-4">
      <div>
        <h3 className="font-semibold text-sm mb-4 text-white">Export Report</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            onClick={() => handleExport('markdown')}
            disabled={downloading !== null}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#7c3aed] text-white hover:bg-[#6d28d9] disabled:opacity-50 transition font-medium text-sm"
          >
            {downloading === 'markdown' ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4" />
                Markdown
              </>
            )}
          </button>

          <button
            onClick={() => handleExport('json')}
            disabled={downloading !== null}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#00d4aa]/20 text-[#00d4aa] border border-[#00d4aa]/40 hover:bg-[#00d4aa]/30 disabled:opacity-50 transition font-medium text-sm"
          >
            {downloading === 'json' ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4" />
                JSON
              </>
            )}
          </button>

          <button
            onClick={() => handleExport('csv')}
            disabled={downloading !== null}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#f7b731]/20 text-[#f7b731] border border-[#f7b731]/40 hover:bg-[#f7b731]/30 disabled:opacity-50 transition font-medium text-sm"
          >
            {downloading === 'csv' ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4" />
                CSV
              </>
            )}
          </button>

          <button
            onClick={handleCopyMarkdown}
            disabled={downloading !== null}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#1e2535] text-[#64748b] border border-[#2a3347] hover:border-[#3a4357] disabled:opacity-50 transition font-medium text-sm"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      <div className="text-xs text-[#64748b] space-y-1 pt-4 border-t border-[#1e2535]">
        <p><strong className="text-[#e2e8f0]">Markdown:</strong> Professional formatted report for email and documentation</p>
        <p><strong className="text-[#e2e8f0]">JSON:</strong> Machine-readable format for integration with other tools</p>
        <p><strong className="text-[#e2e8f0]">CSV:</strong> Spreadsheet format for findings management</p>
      </div>
    </div>
  )
}
