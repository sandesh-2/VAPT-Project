# ReconForge - API Reference & Architecture

## Table of Contents

1. [Scan Engine API](#scan-engine-api)
2. [Type Definitions](#type-definitions)
3. [CVSS Scoring API](#cvss-scoring-api)
4. [Data Processing API](#data-processing-api)
5. [Export API](#export-api)
6. [State Management](#state-management)
7. [Component APIs](#component-apis)

---

## Scan Engine API

### Core Functions

#### `createScanSession(config: ScanConfig): Promise<ScanSession>`

Creates a new scan session with initial state.

**Parameters**:
- `config` - Scan configuration object

**Returns**: New ScanSession with ID and initialized phases

**Example**:
```typescript
const config: ScanConfig = {
  target: 'example.com',
  scopeUrl: 'https://www.example.com',
  rateLimit: 5,
  maxCrawlDepth: 5,
  crawlDuration: 300,
  mode: 'full'
}

const session = await createScanSession(config)
console.log(session.id)        // "scan_abc123"
console.log(session.status)    // "idle"
console.log(session.phases.length)  // 15
```

#### `startScan(session: ScanSession, onUpdate: UpdateCallback): void`

Begins scanning with real-time updates.

**Parameters**:
- `session` - Active session
- `onUpdate` - Callback for updates (fired after each phase completes)

**Callback Signature**:
```typescript
type UpdateCallback = (session: ScanSession) => void
```

**Example**:
```typescript
startScan(session, (updatedSession) => {
  console.log(`Phase ${updatedSession.currentPhase} complete`)
  console.log(`Findings: ${updatedSession.summary.total}`)
  setSession(updatedSession)  // Update React state
})
```

**Phase Progression**:
```
Starts at Phase 1 → executes 15 phases → completes at Phase 15
Status: 'idle' → 'running' → 'completed'
Real-time callbacks on phase completion
```

#### `pauseScan(session: ScanSession): ScanSession`

Pauses active scan.

**Parameters**:
- `session` - Active session

**Returns**: Updated session with status 'paused'

**Example**:
```typescript
const pausedSession = pauseScan(session)
console.log(pausedSession.status)  // "paused"
console.log(pausedSession.phases[2].status)  // "running" (halted mid-phase)
```

#### `resumeScan(session: ScanSession): ScanSession`

Resumes from paused state.

**Parameters**:
- `session` - Paused session

**Returns**: Updated session with status 'running'

**Important**: Cannot resume from completed/failed scans

**Example**:
```typescript
if (session.status === 'paused') {
  const resumedSession = resumeScan(session)
  startScan(resumedSession, onUpdate)
}
```

#### `stopScan(session: ScanSession): ScanSession`

Stops scan completely.

**Parameters**:
- `session` - Active or paused session

**Returns**: Updated session with status 'completed'

**Note**: Cannot restart after stop; creates new session for new scan

**Example**:
```typescript
const stoppedSession = stopScan(session)
console.log(stoppedSession.status)      // "completed"
console.log(stoppedSession.endTime)     // Date object
```

---

## Type Definitions

### ScanConfig

Configuration for a scanning session.

```typescript
interface ScanConfig {
  target: string
  scopeUrl: string
  researcher?: string
  rateLimit: number
  maxCrawlDepth: number
  crawlDuration: number
  mode: 'passive' | 'active' | 'full'
}
```

**Field Details**:

| Field | Type | Required | Default | Range |
|-------|------|----------|---------|-------|
| target | string | Yes | - | Valid domain |
| scopeUrl | string | Yes | - | Valid URL |
| researcher | string | No | "Anonymous" | 1-100 chars |
| rateLimit | number | No | 5 | 1-50 RPS |
| maxCrawlDepth | number | No | 5 | 1-10 |
| crawlDuration | number | No | 300 | 30-3600 sec |
| mode | enum | No | 'full' | 'passive'\|'active'\|'full' |

### ScanSession

Active or completed scan session.

```typescript
interface ScanSession {
  id: string
  config: ScanConfig
  status: 'idle' | 'running' | 'paused' | 'completed' | 'failed'
  startTime: Date
  endTime?: Date
  phases: Phase[]
  summary: ScanSummary
  currentPhaseId?: number
  progress: number  // 0-100
}
```

### Finding

Discovered vulnerability.

```typescript
interface Finding {
  id: string
  title: string
  description: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO'
  cvssScore: number        // 0-10
  cvssVector: string       // CVSS:3.1/...
  cweId: string           // CWE-XXX
  owaspCategory: string   // A01:2021, etc
  evidence: string        // Proof/PoC
  remediation: string     // Fix steps
  phaseId: number         // Phase discovered in
  timestamp: Date
}
```

### Phase

Scanning phase.

```typescript
interface Phase {
  id: number              // 1-15
  name: string
  description: string
  status: 'pending' | 'running' | 'done'
  findings: Finding[]
  logs: string[]
  startTime?: Date
  endTime?: Date
  duration?: number       // milliseconds
}
```

### ScanSummary

Aggregated scan statistics.

```typescript
interface ScanSummary {
  total: number
  bySeverity: {
    critical: number
    high: number
    medium: number
    low: number
    info: number
  }
  byPhase: {
    [phaseId: number]: number
  }
  riskScore: number       // 0-100
  coverage: number        // 0-100 %
  averageCVSS: number     // 0-10
}
```

### AppSettings

User configuration.

```typescript
interface AppSettings {
  defaultResearcher: string
  defaultRateLimit: number
  defaultCrawlDepth: number
  defaultCrawlTimeout: number
  sslVerification: boolean
  followRedirects: boolean
  dnsOverHttps: boolean
  notifyOnComplete: boolean
  alertCriticalFindings: boolean
}
```

---

## CVSS Scoring API

### `calculateCVSSBaseScore(metrics: CVSSMetrics): number`

Calculates CVSS v3.1 base score.

**Parameters**:
```typescript
interface CVSSMetrics {
  AV: 'N' | 'A' | 'L' | 'P'     // Attack Vector
  AC: 'L' | 'H'                  // Attack Complexity
  PR: 'N' | 'L' | 'H'           // Privileges Required
  UI: 'N' | 'R'                  // User Interaction
  S: 'U' | 'C'                   // Scope
  C: 'H' | 'L' | 'N'            // Confidentiality
  I: 'H' | 'L' | 'N'            // Integrity
  A: 'H' | 'L' | 'N'            // Availability
}
```

**Returns**: Score 0.0-10.0

**Example**:
```typescript
const metrics: CVSSMetrics = {
  AV: 'N',  // Network accessible
  AC: 'L',  // Low complexity
  PR: 'N',  // No privileges needed
  UI: 'N',  // No user interaction
  S: 'U',   // Scope unchanged
  C: 'H',   // High confidentiality impact
  I: 'H',   // High integrity impact
  A: 'H'    // High availability impact
}

const score = calculateCVSSBaseScore(metrics)
console.log(score)  // 9.8 (SQL injection example)
```

**Algorithm**:
```
BaseScore = min(10, (10 - Confidentiality) * Exploitability)
Exploitability = 8.22 * AV * AC * PR * UI
Confidentiality = 6.42 * (CI + II + AI - CI*II*AI)
```

### `getCVSSSeverity(score: number): Severity`

Gets severity rating for CVSS score.

**Parameters**:
- `score` - CVSS base score (0-10)

**Returns**: Severity enum

**Rating Breakdown**:
```
9.0-10.0   → CRITICAL
7.0-8.9    → HIGH
4.0-6.9    → MEDIUM
0.1-3.9    → LOW
0.0        → NONE
```

**Example**:
```typescript
const severity = getCVSSSeverity(9.8)
console.log(severity)  // "CRITICAL"
```

### `generateCVSSVector(metrics: CVSSMetrics): string`

Generates CVSS vector string.

**Parameters**:
- `metrics` - CVSSMetrics object

**Returns**: Vector string format

**Example**:
```typescript
const vector = generateCVSSVector(metrics)
console.log(vector)
// "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H"
```

**Vector Format**:
```
CVSS:3.1/AV:X/AC:X/PR:X/UI:X/S:X/C:X/I:X/A:X

Where:
AV  = N (Network), A (Adjacent), L (Local), P (Physical)
AC  = L (Low), H (High)
PR  = N (None), L (Low), H (High)
UI  = N (None), R (Required)
S   = U (Unchanged), C (Changed)
C   = N (None), L (Low), H (High)
I   = N (None), L (Low), H (High)
A   = N (None), L (Low), H (High)
```

---

## Data Processing API

### OWASP Mapping

#### `matchFindingToOWASP(title: string, cweId: string): string`

Maps finding to OWASP 2021 category.

**Parameters**:
- `title` - Vulnerability title
- `cweId` - CWE identifier

**Returns**: OWASP category string (A01:2021, etc.)

**Example**:
```typescript
const category = matchFindingToOWASP(
  'SQL Injection in login form',
  'CWE-89'
)
console.log(category)  // "A03:2021" (Injection)
```

**OWASP 2021 Categories**:
```
A01:2021 - Broken Access Control
A02:2021 - Cryptographic Failures
A03:2021 - Injection
A04:2021 - Insecure Design
A05:2021 - Security Misconfiguration
A06:2021 - Vulnerable Components
A07:2021 - Identification and Auth Failures
A08:2021 - Software and Data Integrity Failures
A09:2021 - Logging and Monitoring Failures
A10:2021 - SSRF
```

### Detection Patterns

#### `getDetectionPattern(cweId: string): VulnerabilityPattern | null`

Retrieves vulnerability pattern for CWE.

**Parameters**:
- `cweId` - CWE identifier (e.g., "CWE-89")

**Returns**: Pattern object or null if not found

**Example**:
```typescript
const pattern = getDetectionPattern('CWE-89')
console.log(pattern?.title)        // "SQL Injection"
console.log(pattern?.remediation)  // "Use parameterized queries..."
```

---

## Export API

### `generateMarkdownReport(session: ScanSession): string`

Generates Markdown format report.

**Parameters**:
- `session` - Completed scan session

**Returns**: Markdown string

**Output Structure**:
```markdown
# Vulnerability Assessment Report
## Executive Summary
- Date
- Findings count
- Risk rating

## Findings by Severity
### CRITICAL
[findings]

### HIGH
[findings]

...

## Remediation Guide
[organized by priority]

## Appendix
[CVSS vectors, references]
```

### `generateJSONReport(session: ScanSession): string`

Generates JSON format report.

**Parameters**:
- `session` - Completed scan session

**Returns**: JSON string

**Output Structure**:
```json
{
  "metadata": {
    "generated": "ISO timestamp",
    "target": "example.com",
    "scanner": "ReconForge v4.0"
  },
  "summary": { ... },
  "findings": [
    {
      "id": "finding_xxx",
      "title": "...",
      "cvssScore": 9.8,
      "severity": "CRITICAL",
      ...
    }
  ],
  "phases": [ ... ]
}
```

### `generateCSVReport(session: ScanSession): string`

Generates CSV format report.

**Parameters**:
- `session` - Completed scan session

**Returns**: CSV string

**Columns**:
```
ID, Title, Description, Severity, CVSS Score, CWE, OWASP, Phase, Evidence
```

### `downloadReport(content: string, filename: string, format: string): void`

Triggers file download.

**Parameters**:
- `content` - Report content
- `filename` - Desired filename
- `format` - File format (md, json, csv)

**Example**:
```typescript
const content = generateMarkdownReport(session)
downloadReport(content, 'scan_report', 'md')
// Downloads as "scan_report.md"
```

---

## State Management

### Page Component State

Main state management in `/app/page.tsx`:

```typescript
interface PageState {
  activeTab: string
  config: ScanConfig
  session: ScanSession | null
  status: ScanStatus
  selectedPhase?: number
  appSettings: AppSettings | null
}
```

### State Update Pattern

```typescript
// Update config
setConfig(prev => ({
  ...prev,
  rateLimit: 10
}))

// Update session
setSession(updatedSession)

// Change tab
setActiveTab('reports')

// Update settings
setAppSettings(newSettings)
```

### Data Flow

```
User Action
    ↓
Handler Function
    ↓
Update State (React)
    ↓
Component Re-render
    ↓
DOM Update
```

---

## Component APIs

### Dashboard View

```typescript
interface DashboardViewProps {
  session: ScanSession | null
  status: ScanStatus
  selectedPhase?: number
  onSelectPhase: (phaseId: number) => void
}
```

**Used in**: Main dashboard display

**Child Components**:
- StatsCards
- PhasePipeline
- SeverityChart
- FindingsTable
- LiveTerminal

### Scan Launcher

```typescript
interface ScanLauncherProps {
  config: ScanConfig
  onConfigChange: (config: ScanConfig) => void
  onStart: () => void
  disabled?: boolean
}
```

**Used in**: Scan Engine tab

**Features**:
- Form validation
- Mode selection
- Advanced options
- Launch button

### Findings Table

```typescript
interface FindingsTableProps {
  findings: Finding[]
  onSelectFinding?: (finding: Finding) => void
}
```

**Used in**: Vulnerabilities tab

**Features**:
- Severity filtering
- Sortable columns
- Expandable rows
- Detail panel

### Security Calculator

```typescript
interface SecurityCalculatorProps {
  // No required props
}
```

**Used in**: Calculators tab

**Sub-components**:
- CVSSCalculator
- ImpactMatrixCalculator
- Mode tabs

### Report Export

```typescript
interface ReportExportProps {
  session: ScanSession | null
}
```

**Used in**: Reports tab

**Features**:
- Markdown export
- JSON export
- CSV export
- Copy to clipboard

### Settings Panel

```typescript
interface SettingsPanelProps {
  onSettingsChange: (settings: AppSettings) => void
}
```

**Used in**: Settings tab

**Features**:
- Text inputs
- Toggle switches
- Export/Import/Reset
- localStorage persistence

---

## Error Handling

### Scan Errors

```typescript
try {
  const session = await createScanSession(config)
  startScan(session, onUpdate)
} catch (error) {
  console.error('[v0] Scan error:', error)
  setStatus('failed')
  setSession(null)
}
```

### Export Errors

```typescript
try {
  const markdown = generateMarkdownReport(session)
  downloadReport(markdown, 'report', 'md')
} catch (error) {
  console.error('[v0] Export error:', error)
  // Show error toast/modal
}
```

---

## Performance Considerations

### Optimization Tips

1. **Memoization**
   ```typescript
   const memoizedFindings = useMemo(() => 
     findings.filter(f => f.severity === 'CRITICAL'),
     [findings]
   )
   ```

2. **Lazy Loading**
   ```typescript
   const HeavyComponent = lazy(() => import('./HeavyComponent'))
   ```

3. **Pagination**
   ```typescript
   const [page, setPage] = useState(0)
   const paginated = findings.slice(page * 50, (page + 1) * 50)
   ```

4. **Virtualization** (for large lists)
   ```typescript
   import { FixedSizeList } from 'react-window'
   ```

---

## Rate Limits

Scanning rate limits (per ScanConfig):
- Min: 1 RPS (slow, production safe)
- Default: 5 RPS
- Max: 50 RPS (fast, lab only)

---

**Version**: 1.0  
**Last Updated**: July 9, 2024
