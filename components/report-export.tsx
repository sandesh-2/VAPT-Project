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
  session: ScanSession
}

export function ReportExport({ session }: ReportExportProps) {
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
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-sm mb-3">Export Report</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            onClick={() => handleExport('markdown')}
            disabled={downloading !== null}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-opacity-90 disabled:opacity-50 transition font-medium text-sm"
          >
            {downloading === 'markdown' ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4" />
                Download Markdown
              </>
            )}
          </button>

          <button
            onClick={() => handleExport('json')}
            disabled={downloading !== null}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-muted text-foreground hover:bg-muted/80 disabled:opacity-50 transition font-medium text-sm"
          >
            {downloading === 'json' ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4" />
                Download JSON
              </>
            )}
          </button>

          <button
            onClick={() => handleExport('csv')}
            disabled={downloading !== null}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-muted text-foreground hover:bg-muted/80 disabled:opacity-50 transition font-medium text-sm"
          >
            {downloading === 'csv' ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4" />
                Download CSV
              </>
            )}
          </button>

          <button
            onClick={handleCopyMarkdown}
            disabled={downloading !== null}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-muted text-foreground hover:bg-muted/80 disabled:opacity-50 transition font-medium text-sm"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Markdown
              </>
            )}
          </button>
        </div>
      </div>

      <div className="text-xs text-muted-foreground">
        <p>• <strong>Markdown:</strong> Professional formatted report for email/documentation</p>
        <p>• <strong>JSON:</strong> Machine-readable format for integration with other tools</p>
        <p>• <strong>CSV:</strong> Spreadsheet format for findings management</p>
      </div>
    </div>
  )
}
