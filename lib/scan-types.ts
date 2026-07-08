export type ScanMode = 'passive' | 'active' | 'full'
export type ScanStatus = 'idle' | 'running' | 'paused' | 'completed' | 'failed'
export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO'

export interface PhaseResult {
  id: number
  name: string
  shortName: string
  status: 'pending' | 'running' | 'done' | 'skipped' | 'failed'
  count: number
  duration?: number
  findings: Finding[]
  logs: LogEntry[]
}

export interface CVSSData {
  vector: string // "CVSS:3.1/AV:N/AC:L/..."
  baseScore: number
  baseSeverity: string
  exploitability: number
  impactScore: number
}

export interface Finding {
  id: string
  severity: Severity
  title: string
  url?: string
  description: string
  detectionMethod: string // Why it was identified this way
  phase: string
  timestamp: string
  tags: string[]
  cwe: string[] // e.g., ['CWE-89'] for SQL Injection
  owasp: string[] // e.g., ['A03:2021']
  cvss?: CVSSData // CVSS v3.1 vector and score
  cveId?: string // Real CVE ID if applicable
  affectedComponent?: string // Framework/library version
  remediationSteps: string[] // Detailed remediation
  references: string[] // Links to resources
  evidence?: string // Raw evidence from scanning
  toolsUsed: string[] // Tools that detected it (e.g., 'nuclei', 'burp', 'sqlmap')
}

export interface LogEntry {
  ts: string
  level: 'info' | 'success' | 'warn' | 'error' | 'debug'
  msg: string
  tool?: string // Which tool generated this log
}

export interface ScanConfig {
  target: string
  scopeUrl: string
  researcher: string
  rateLimit: number
  maxCrawlDepth: number
  crawlDuration: number
  mode: ScanMode
  githubToken?: string
  phases: number[]
}

export interface ScanSession {
  id: string
  config: ScanConfig
  status: ScanStatus
  startedAt: string
  completedAt?: string
  phases: PhaseResult[]
  summary: ScanSummary
}

export interface ScanSummary {
  // Asset Enumeration
  subdomainsPassive: number
  subdomainsResolved: number
  liveUrls: number
  uniqueEndpoints: number
  jsFiles: number
  
  // Parameter & Fuzzing Discovery
  crawlParams: number
  discoveredEndpoints: number
  
  // Cloud & Infrastructure
  openBuckets: number
  danglingCnames: number
  cloudAssets: number
  
  // Vulnerability Counts by Severity
  criticalFindings: number
  highFindings: number
  mediumFindings: number
  lowFindings: number
  infoFindings: number
  
  // Specific Vulnerability Types
  sqlInjectionFound: number
  xssFound: number
  corsIssues: number
  jwtFlaws: number
  authBypassChains: number
  subdoTakeovers: number
  missingSecurityHeaders: number
  weakCrypto: number
  
  // Technology Stack
  technologies: string[] // Frameworks, CMSs, etc.
  outdatedComponents: string[] // Known vulnerable versions
  
  // Risk Metrics
  riskScore: number // 0-100
  exploitableRisks: number
  affectedAssetCount: number
}

export const PHASE_DEFINITIONS = [
  { id: 1,  name: 'Passive Subdomain OSINT',       shortName: 'Passive Recon',    mode: ['passive', 'full'] },
  { id: 2,  name: 'DNS Resolution & Mutation',      shortName: 'DNS Enum',         mode: ['passive', 'active', 'full'] },
  { id: 3,  name: 'HTTP Probing & Fingerprinting',  shortName: 'HTTP Probe',       mode: ['active', 'full'] },
  { id: 4,  name: 'Headless Crawling & URL Mining', shortName: 'Crawl',            mode: ['active', 'full'] },
  { id: 5,  name: 'JS Analysis & Secret Extraction',shortName: 'JS Analysis',      mode: ['active', 'full'] },
  { id: 6,  name: 'Parameter Discovery',            shortName: 'Param Mining',     mode: ['active', 'full'] },
  { id: 7,  name: 'Directory & File Fuzzing',       shortName: 'Dir Fuzzing',      mode: ['active', 'full'] },
  { id: 8,  name: 'Cloud Asset & Bucket Hunting',   shortName: 'Cloud Hunt',       mode: ['passive', 'active', 'full'] },
  { id: 9,  name: 'Subdomain Takeover Detection',   shortName: 'Takeover',         mode: ['active', 'full'] },
  { id: 10, name: 'OAuth / JWT / OIDC Mapping',     shortName: 'Auth Surface',     mode: ['active', 'full'] },
  { id: 11, name: 'GraphQL & API Surface Mapping',  shortName: 'API Map',          mode: ['active', 'full'] },
  { id: 12, name: 'Nuclei Vulnerability Scanning',  shortName: 'Vuln Scan',        mode: ['active', 'full'] },
  { id: 13, name: 'CORS Misconfiguration Analysis', shortName: 'CORS',             mode: ['active', 'full'] },
  { id: 14, name: 'Report Generation',              shortName: 'Report',           mode: ['passive', 'active', 'full'] },
  { id: 15, name: 'Alert Notifications',            shortName: 'Notify',           mode: ['passive', 'active', 'full'] },
] as const

export const SEVERITY_COLORS: Record<Severity, string> = {
  critical: '#ff3b5c',
  high:     '#ff6b35',
  medium:   '#f7b731',
  low:      '#45d48a',
  info:     '#4ecdc4',
}

export const SEVERITY_BG: Record<Severity, string> = {
  critical: 'bg-[#ff3b5c]/10 text-[#ff3b5c] border-[#ff3b5c]/20',
  high:     'bg-[#ff6b35]/10 text-[#ff6b35] border-[#ff6b35]/20',
  medium:   'bg-[#f7b731]/10 text-[#f7b731] border-[#f7b731]/20',
  low:      'bg-[#45d48a]/10 text-[#45d48a] border-[#45d48a]/20',
  info:     'bg-[#4ecdc4]/10 text-[#4ecdc4] border-[#4ecdc4]/20',
}
