'use client'

import { useState, useMemo, useCallback } from 'react'
import { Calculator, ChevronDown, Copy, Check, RotateCcw, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  calculateCVSSBaseScore,
  getCVSSSeverity,
  buildVector,
  getMetricExplanation,
} from '@/lib/cvss-utils'

// ── Types ────────────────────────────────────────────────────────────────────

type CalculatorMode = 'cvss' | 'impact'

// CVSS v3.1 metric types
interface CVSSMetrics {
  AV: 'N' | 'A' | 'L' | 'P'
  AC: 'L' | 'H'
  PR: 'N' | 'L' | 'H'
  UI: 'N' | 'R'
  S: 'U' | 'C'
  C: 'N' | 'L' | 'H'
  I: 'N' | 'L' | 'H'
  A: 'N' | 'L' | 'H'
  // Temporal (optional)
  E?: 'X' | 'U' | 'P' | 'F' | 'H'
  RL?: 'X' | 'O' | 'T' | 'W' | 'U'
  RC?: 'X' | 'U' | 'R' | 'C'
  [key: string]: string | undefined
}

// OWASP Risk Rating / Impact Matrix
interface ImpactMetrics {
  // Threat Agent Factors
  skillLevel: number
  motive: number
  opportunity: number
  size: number
  // Vulnerability Factors
  easeOfDiscovery: number
  easeOfExploit: number
  awareness: number
  intrusionDetection: number
  // Technical Impact
  lossOfConfidentiality: number
  lossOfIntegrity: number
  lossOfAvailability: number
  lossOfAccountability: number
  // Business Impact
  financialDamage: number
  reputationDamage: number
  nonCompliance: number
  privacyViolation: number
}

// ── CVSS Metric Definitions ───────────────────────────────────────────────────

const CVSS_BASE_METRICS = [
  {
    id: 'AV',
    label: 'Attack Vector',
    abbr: 'AV',
    description: 'How the vulnerability is exploited — via network, adjacent network, locally, or physically.',
    options: [
      { value: 'N', label: 'Network',   short: 'N', description: 'Exploitable remotely across the internet with no physical or local access needed.' },
      { value: 'A', label: 'Adjacent',  short: 'A', description: 'Requires access to the same local network, Bluetooth, or logical network segment.' },
      { value: 'L', label: 'Local',     short: 'L', description: 'Attacker must have local system access (interactive login or terminal session).' },
      { value: 'P', label: 'Physical',  short: 'P', description: 'Attacker must have physical access to the component (e.g., keyboard, USB).' },
    ],
  },
  {
    id: 'AC',
    label: 'Attack Complexity',
    abbr: 'AC',
    description: 'Conditions beyond the attacker\'s control that must exist to exploit the vulnerability.',
    options: [
      { value: 'L', label: 'Low',  short: 'L', description: 'No special conditions required. Attacker can exploit reliably without preparation.' },
      { value: 'H', label: 'High', short: 'H', description: 'Specific conditions such as race conditions, configuration state, or social engineering must exist.' },
    ],
  },
  {
    id: 'PR',
    label: 'Privileges Required',
    abbr: 'PR',
    description: 'Level of privileges an attacker must possess before successfully exploiting the vulnerability.',
    options: [
      { value: 'N', label: 'None',  short: 'N', description: 'No authentication or privileges required to exploit.' },
      { value: 'L', label: 'Low',   short: 'L', description: 'Requires basic user-level privileges (e.g., authenticated user, guest account).' },
      { value: 'H', label: 'High',  short: 'H', description: 'Requires administrative, root, or highly privileged account to exploit.' },
    ],
  },
  {
    id: 'UI',
    label: 'User Interaction',
    abbr: 'UI',
    description: 'Whether successful exploitation requires a human user (other than the attacker) to perform actions.',
    options: [
      { value: 'N', label: 'None',     short: 'N', description: 'No user interaction required. Attacker can exploit independently.' },
      { value: 'R', label: 'Required', short: 'R', description: 'A legitimate user must take some action (click a link, open a file, etc.).' },
    ],
  },
  {
    id: 'S',
    label: 'Scope',
    abbr: 'S',
    description: 'Whether a vulnerability in one component can affect resources managed by other components (scope change).',
    options: [
      { value: 'U', label: 'Unchanged', short: 'U', description: 'Exploited vulnerability can only affect resources managed by the same authority.' },
      { value: 'C', label: 'Changed',   short: 'C', description: 'Exploited vulnerability can affect resources beyond the scope of the affected component.' },
    ],
  },
  {
    id: 'C',
    label: 'Confidentiality Impact',
    abbr: 'C',
    description: 'Impact on confidentiality of information resources managed by the component due to the exploited vulnerability.',
    options: [
      { value: 'N', label: 'None', short: 'N', description: 'No confidentiality impact. No data disclosure.' },
      { value: 'L', label: 'Low',  short: 'L', description: 'Limited disclosure of restricted information. Attacker has no control over what is obtained.' },
      { value: 'H', label: 'High', short: 'H', description: 'Total loss of confidentiality. All data is accessible, including sensitive secrets.' },
    ],
  },
  {
    id: 'I',
    label: 'Integrity Impact',
    abbr: 'I',
    description: 'Impact to integrity of information following a successful exploit.',
    options: [
      { value: 'N', label: 'None', short: 'N', description: 'No integrity impact. Data cannot be modified.' },
      { value: 'L', label: 'Low',  short: 'L', description: 'Limited modification of data. Attacker has partial control over changes.' },
      { value: 'H', label: 'High', short: 'H', description: 'Total loss of integrity. Attacker can modify any/all files or data at will.' },
    ],
  },
  {
    id: 'A',
    label: 'Availability Impact',
    abbr: 'A',
    description: 'Impact to availability of the impacted component resulting from a successfully exploited vulnerability.',
    options: [
      { value: 'N', label: 'None', short: 'N', description: 'No availability impact. Service is not interrupted.' },
      { value: 'L', label: 'Low',  short: 'L', description: 'Reduced performance or interruptions. No complete denial of service.' },
      { value: 'H', label: 'High', short: 'H', description: 'Total loss of availability. Attacker can fully deny access to the affected component.' },
    ],
  },
] as const

const CVSS_TEMPORAL_METRICS = [
  {
    id: 'E',
    label: 'Exploit Code Maturity',
    abbr: 'E',
    description: 'Likelihood of the vulnerability being attacked based on the current state of exploit techniques or code availability.',
    options: [
      { value: 'X', label: 'Not Defined',     short: 'X', description: 'Skip — no adjustment to the Base Score.' },
      { value: 'U', label: 'Unproven',         short: 'U', description: 'No exploit code exists, or it is theoretical.' },
      { value: 'P', label: 'Proof-of-Concept', short: 'P', description: 'Proof-of-concept code available. Not fully weaponized.' },
      { value: 'F', label: 'Functional',       short: 'F', description: 'Functional exploit code that works in most situations.' },
      { value: 'H', label: 'High',             short: 'H', description: 'Reliable, weaponized code works in all situations.' },
    ],
  },
  {
    id: 'RL',
    label: 'Remediation Level',
    abbr: 'RL',
    description: 'The official fix status — affects the urgency of applying patches.',
    options: [
      { value: 'X', label: 'Not Defined',    short: 'X', description: 'Skip — no adjustment.' },
      { value: 'O', label: 'Official Fix',   short: 'O', description: 'Complete vendor fix is available.' },
      { value: 'T', label: 'Temporary Fix',  short: 'T', description: 'Unofficial, temporary patch is available.' },
      { value: 'W', label: 'Workaround',     short: 'W', description: 'Unofficial workaround or configuration change is available.' },
      { value: 'U', label: 'Unavailable',    short: 'U', description: 'No solution available or it is impossible to apply.' },
    ],
  },
  {
    id: 'RC',
    label: 'Report Confidence',
    abbr: 'RC',
    description: 'Degree of confidence in the existence of the vulnerability and the credibility of known technical details.',
    options: [
      { value: 'X', label: 'Not Defined', short: 'X', description: 'Skip — no adjustment.' },
      { value: 'U', label: 'Unknown',     short: 'U', description: 'There are unconfirmed reports or limited sources of information.' },
      { value: 'R', label: 'Reasonable',  short: 'R', description: 'Significant information supports the vulnerability, but not independently confirmed.' },
      { value: 'C', label: 'Confirmed',   short: 'C', description: 'Detailed reports confirmed through independent sources or the vendor.' },
    ],
  },
] as const

// ── CVSS Temporal Score Modifiers ────────────────────────────────────────────

const TEMPORAL_MODIFIERS = {
  E: { X: 1.00, U: 0.91, P: 0.94, F: 0.97, H: 1.00 },
  RL: { X: 1.00, O: 0.87, T: 0.90, W: 0.95, U: 1.00 },
  RC: { X: 1.00, U: 0.92, R: 0.96, C: 1.00 },
}

function calculateTemporalScore(baseScore: number, E: string, RL: string, RC: string): number {
  const e  = TEMPORAL_MODIFIERS.E[E as keyof typeof TEMPORAL_MODIFIERS.E] ?? 1.00
  const rl = TEMPORAL_MODIFIERS.RL[RL as keyof typeof TEMPORAL_MODIFIERS.RL] ?? 1.00
  const rc = TEMPORAL_MODIFIERS.RC[RC as keyof typeof TEMPORAL_MODIFIERS.RC] ?? 1.00
  const raw = baseScore * e * rl * rc
  return Math.ceil(raw * 10) / 10
}

// ── Impact Matrix Definitions ─────────────────────────────────────────────────

const IMPACT_GROUPS = [
  {
    group: 'Threat Agent Factors',
    description: 'How likely is a particular threat agent to exploit a vulnerability?',
    color: 'text-[#4ecdc4]',
    borderColor: 'border-[#4ecdc4]/30',
    bgColor: 'bg-[#4ecdc4]/5',
    metrics: [
      {
        id: 'skillLevel',
        label: 'Skill Level',
        description: 'Technical skill level of the threat agent (1=no technical skill, 9=penetration testing skills).',
        levels: [
          { value: 1, label: 'No technical skills' },
          { value: 3, label: 'Some technical skills' },
          { value: 5, label: 'Advanced computer user' },
          { value: 6, label: 'Network & programming skills' },
          { value: 9, label: 'Security penetration skills' },
        ],
      },
      {
        id: 'motive',
        label: 'Motive',
        description: 'Motivation of the attacker — how rewarding is the exploitation? (1=low reward, 9=high reward).',
        levels: [
          { value: 1, label: 'Low or no reward' },
          { value: 4, label: 'Possible reward' },
          { value: 9, label: 'High reward' },
        ],
      },
      {
        id: 'opportunity',
        label: 'Opportunity',
        description: 'Resources and opportunities required to attack (0=full access required, 9=no access required).',
        levels: [
          { value: 0, label: 'Full access or expensive resources required' },
          { value: 4, label: 'Special access or resources required' },
          { value: 7, label: 'Some access or resources required' },
          { value: 9, label: 'No access or resources required' },
        ],
      },
      {
        id: 'size',
        label: 'Size of Group',
        description: 'How large is the group of threat agents? (2=developers, 9=anonymous internet users).',
        levels: [
          { value: 2, label: 'Developers' },
          { value: 4, label: 'System administrators' },
          { value: 5, label: 'Intranet users' },
          { value: 6, label: 'Partners' },
          { value: 8, label: 'Authenticated users' },
          { value: 9, label: 'Anonymous internet users' },
        ],
      },
    ],
  },
  {
    group: 'Vulnerability Factors',
    description: 'How likely is the vulnerability to be discovered and exploited?',
    color: 'text-[#f7b731]',
    borderColor: 'border-[#f7b731]/30',
    bgColor: 'bg-[#f7b731]/5',
    metrics: [
      {
        id: 'easeOfDiscovery',
        label: 'Ease of Discovery',
        description: 'How easy is it to discover this vulnerability? (1=practically impossible, 9=automated tools available).',
        levels: [
          { value: 1, label: 'Practically impossible' },
          { value: 3, label: 'Difficult' },
          { value: 7, label: 'Easy' },
          { value: 9, label: 'Automated tools available' },
        ],
      },
      {
        id: 'easeOfExploit',
        label: 'Ease of Exploit',
        description: 'How easy is it to actually exploit? (1=theoretical, 9=automated tools available).',
        levels: [
          { value: 1, label: 'Theoretical' },
          { value: 3, label: 'Difficult' },
          { value: 5, label: 'Easy' },
          { value: 9, label: 'Automated tools available' },
        ],
      },
      {
        id: 'awareness',
        label: 'Awareness',
        description: 'How well known is the vulnerability to this group of threat agents? (1=unknown, 9=public knowledge).',
        levels: [
          { value: 1, label: 'Unknown' },
          { value: 4, label: 'Hidden' },
          { value: 6, label: 'Obvious' },
          { value: 9, label: 'Public knowledge' },
        ],
      },
      {
        id: 'intrusionDetection',
        label: 'Intrusion Detection',
        description: 'How likely is an exploit to be detected? (1=active detection, 9=not logged).',
        levels: [
          { value: 1, label: 'Active detection in application' },
          { value: 3, label: 'Logged and reviewed' },
          { value: 8, label: 'Logged without review' },
          { value: 9, label: 'Not logged' },
        ],
      },
    ],
  },
  {
    group: 'Technical Impact',
    description: 'What would be the direct technical impact of a successful exploit?',
    color: 'text-[#ff6b35]',
    borderColor: 'border-[#ff6b35]/30',
    bgColor: 'bg-[#ff6b35]/5',
    metrics: [
      {
        id: 'lossOfConfidentiality',
        label: 'Loss of Confidentiality',
        description: 'How much data can be disclosed and how sensitive is it? (2=minimal, 9=all data disclosed).',
        levels: [
          { value: 2, label: 'Minimal non-sensitive data disclosed' },
          { value: 6, label: 'Extensive non-critical data' },
          { value: 6, label: 'Minimal critical data disclosed' },
          { value: 7, label: 'Extensive critical data disclosed' },
          { value: 9, label: 'All data disclosed' },
        ],
      },
      {
        id: 'lossOfIntegrity',
        label: 'Loss of Integrity',
        description: 'How much data can be corrupted and how severe is the corruption? (1=minimal, 9=all data corrupted).',
        levels: [
          { value: 1, label: 'Minimal slightly corrupt data' },
          { value: 3, label: 'Minimal seriously corrupt data' },
          { value: 5, label: 'Extensive slightly corrupt data' },
          { value: 7, label: 'Extensive seriously corrupt data' },
          { value: 9, label: 'All data totally corrupt' },
        ],
      },
      {
        id: 'lossOfAvailability',
        label: 'Loss of Availability',
        description: 'How much service can be lost and how vital is it? (1=minimal, 9=all services unavailable).',
        levels: [
          { value: 1, label: 'Minimal secondary services interrupted' },
          { value: 5, label: 'Minimal primary services interrupted' },
          { value: 5, label: 'Extensive secondary services interrupted' },
          { value: 7, label: 'Extensive primary services interrupted' },
          { value: 9, label: 'All services completely lost' },
        ],
      },
      {
        id: 'lossOfAccountability',
        label: 'Loss of Accountability',
        description: 'Can actions be traced to individuals? (1=fully traceable, 9=completely anonymous).',
        levels: [
          { value: 1, label: 'Fully traceable' },
          { value: 7, label: 'Possibly traceable' },
          { value: 9, label: 'Completely anonymous' },
        ],
      },
    ],
  },
  {
    group: 'Business Impact',
    description: 'What business impact would a successful attack have?',
    color: 'text-[#ff3b5c]',
    borderColor: 'border-[#ff3b5c]/30',
    bgColor: 'bg-[#ff3b5c]/5',
    metrics: [
      {
        id: 'financialDamage',
        label: 'Financial Damage',
        description: 'How much financial damage will result from exploitation? (1=less than cost to fix, 9=bankruptcy).',
        levels: [
          { value: 1, label: 'Less than the cost to fix the vulnerability' },
          { value: 3, label: 'Minor effect on annual profit' },
          { value: 7, label: 'Significant effect on annual profit' },
          { value: 9, label: 'Bankruptcy' },
        ],
      },
      {
        id: 'reputationDamage',
        label: 'Reputation Damage',
        description: 'Would an exploit result in reputational damage? (1=minimal, 9=brand destruction).',
        levels: [
          { value: 1, label: 'Minimal damage' },
          { value: 4, label: 'Loss of major accounts' },
          { value: 5, label: 'Loss of goodwill' },
          { value: 9, label: 'Brand damage' },
        ],
      },
      {
        id: 'nonCompliance',
        label: 'Non-Compliance',
        description: 'How much exposure does this vulnerability introduce to non-compliance? (2=minor, 7=high profile violation).',
        levels: [
          { value: 2, label: 'Minor violation' },
          { value: 5, label: 'Clear violation' },
          { value: 7, label: 'High profile violation' },
        ],
      },
      {
        id: 'privacyViolation',
        label: 'Privacy Violation',
        description: 'How many people\'s private information could be exposed? (3=one individual, 9=millions of people).',
        levels: [
          { value: 3, label: 'One individual' },
          { value: 5, label: 'Hundreds of people' },
          { value: 7, label: 'Thousands of people' },
          { value: 9, label: 'Millions of people' },
        ],
      },
    ],
  },
]

// ── Impact Matrix Calculator ──────────────────────────────────────────────────

function classifyImpact(score: number): { label: string; color: string; bg: string } {
  if (score < 3) return { label: 'NOTE',     color: 'text-[#4ecdc4]',  bg: 'bg-[#4ecdc4]/10' }
  if (score < 6) return { label: 'LOW',      color: 'text-[#45d48a]',  bg: 'bg-[#45d48a]/10' }
  if (score < 9) return { label: 'MEDIUM',   color: 'text-[#f7b731]',  bg: 'bg-[#f7b731]/10' }
  return            { label: 'HIGH',     color: 'text-[#ff6b35]',  bg: 'bg-[#ff6b35]/10' }
}

function classifyRisk(likelihood: number, impact: number): { label: string; color: string; bg: string; description: string } {
  const ll = classifyImpact(likelihood).label
  const il = classifyImpact(impact).label

  const matrix: Record<string, Record<string, { label: string; color: string; bg: string; description: string }>> = {
    HIGH: {
      HIGH:   { label: 'CRITICAL', color: 'text-[#ff3b5c]', bg: 'bg-[#ff3b5c]/15', description: 'Immediate action required — high exploitability with severe impact.' },
      MEDIUM: { label: 'HIGH',     color: 'text-[#ff6b35]', bg: 'bg-[#ff6b35]/15', description: 'Urgent remediation needed — high exploitability with significant impact.' },
      LOW:    { label: 'MEDIUM',   color: 'text-[#f7b731]', bg: 'bg-[#f7b731]/15', description: 'Address in regular patching cycle — high likelihood but limited impact.' },
      NOTE:   { label: 'LOW',      color: 'text-[#45d48a]', bg: 'bg-[#45d48a]/15', description: 'Monitor — highly likely but negligible business impact.' },
    },
    MEDIUM: {
      HIGH:   { label: 'HIGH',     color: 'text-[#ff6b35]', bg: 'bg-[#ff6b35]/15', description: 'Urgent remediation — moderate probability, severe impact if exploited.' },
      MEDIUM: { label: 'MEDIUM',   color: 'text-[#f7b731]', bg: 'bg-[#f7b731]/15', description: 'Address in next sprint cycle — moderate risk across the board.' },
      LOW:    { label: 'LOW',      color: 'text-[#45d48a]', bg: 'bg-[#45d48a]/15', description: 'Low priority — moderate likelihood, minimal impact.' },
      NOTE:   { label: 'NOTE',     color: 'text-[#4ecdc4]', bg: 'bg-[#4ecdc4]/15', description: 'Informational — very limited risk.' },
    },
    LOW: {
      HIGH:   { label: 'MEDIUM',   color: 'text-[#f7b731]', bg: 'bg-[#f7b731]/15', description: 'Address when convenient — unlikely but severe if exploited.' },
      MEDIUM: { label: 'LOW',      color: 'text-[#45d48a]', bg: 'bg-[#45d48a]/15', description: 'Low priority — unlikely and limited impact.' },
      LOW:    { label: 'NOTE',     color: 'text-[#4ecdc4]', bg: 'bg-[#4ecdc4]/15', description: 'Informational — very low risk.' },
      NOTE:   { label: 'NOTE',     color: 'text-[#4ecdc4]', bg: 'bg-[#4ecdc4]/15', description: 'Informational — negligible risk.' },
    },
    NOTE: {
      HIGH:   { label: 'LOW',      color: 'text-[#45d48a]', bg: 'bg-[#45d48a]/15', description: 'Negligible — extremely unlikely even with high impact.' },
      MEDIUM: { label: 'NOTE',     color: 'text-[#4ecdc4]', bg: 'bg-[#4ecdc4]/15', description: 'Informational.' },
      LOW:    { label: 'NOTE',     color: 'text-[#4ecdc4]', bg: 'bg-[#4ecdc4]/15', description: 'Informational.' },
      NOTE:   { label: 'NOTE',     color: 'text-[#4ecdc4]', bg: 'bg-[#4ecdc4]/15', description: 'Informational.' },
    },
  }

  return matrix[ll]?.[il] ?? { label: 'NOTE', color: 'text-[#4ecdc4]', bg: 'bg-[#4ecdc4]/15', description: 'Informational.' }
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface MetricButtonProps {
  active: boolean
  label: string
  short: string
  description: string
  onClick: () => void
}

function MetricButton({ active, label, short, description, onClick }: MetricButtonProps) {
  return (
    <button
      onClick={onClick}
      title={description}
      className={cn(
        'group relative flex flex-col items-center px-3 py-2 rounded-lg border text-xs font-mono transition-all',
        active
          ? 'bg-[#00d4aa]/15 text-[#00d4aa] border-[#00d4aa]/50 shadow-[0_0_12px_rgba(0,212,170,0.15)]'
          : 'bg-[#161821] text-[#64748b] border-[#1e2535] hover:text-[#e2e8f0] hover:border-[#2a3347]',
      )}
    >
      <span className="font-bold text-sm leading-none">{short}</span>
      <span className="text-[9px] mt-0.5 leading-none truncate max-w-[60px] text-center">{label}</span>
    </button>
  )
}

interface ScoreGaugeProps {
  score: number
  label: string
  color: string
  maxScore?: number
  size?: 'sm' | 'lg'
}

function ScoreGauge({ score, label, color, maxScore = 10, size = 'sm' }: ScoreGaugeProps) {
  const pct = Math.min(score / maxScore, 1)
  const radius = size === 'lg' ? 52 : 36
  const stroke = size === 'lg' ? 7 : 5
  const dim = (radius + stroke) * 2
  const circumference = 2 * Math.PI * radius

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`} className="-rotate-90">
        <circle cx={dim/2} cy={dim/2} r={radius} fill="none" stroke="#1e2535" strokeWidth={stroke} />
        <circle
          cx={dim/2} cy={dim/2} r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - pct)}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="text-center -mt-1">
        <p className="font-bold font-mono text-white" style={{ fontSize: size === 'lg' ? 26 : 16 }}>{score.toFixed(1)}</p>
        <p className="text-[9px] text-[#64748b] uppercase tracking-wide leading-none mt-0.5">{label}</p>
      </div>
    </div>
  )
}

// ── CVSS Calculator ────────────────────────────────────────────────────────────

const DEFAULT_CVSS: CVSSMetrics = { AV: 'N', AC: 'L', PR: 'N', UI: 'N', S: 'U', C: 'N', I: 'N', A: 'N', E: 'X', RL: 'X', RC: 'X' }

function CVSSCalculator() {
  const [metrics, setMetrics] = useState<CVSSMetrics>(DEFAULT_CVSS)
  const [showTemporal, setShowTemporal] = useState(false)
  const [copied, setCopied] = useState(false)

  const set = useCallback((key: keyof CVSSMetrics, value: string) => {
    setMetrics(prev => ({ ...prev, [key]: value }))
  }, [])

  const vectorString = useMemo(() => buildVector({
    AV: metrics.AV, AC: metrics.AC, PR: metrics.PR,
    UI: metrics.UI, S: metrics.S, C: metrics.C, I: metrics.I, A: metrics.A,
  }), [metrics])

  const baseScore = useMemo(() => calculateCVSSBaseScore(vectorString), [vectorString])
  const baseSeverity = useMemo(() => getCVSSSeverity(baseScore), [baseScore])

  const temporalScore = useMemo(() => {
    if (!showTemporal || !metrics.E || !metrics.RL || !metrics.RC) return null
    const t = calculateTemporalScore(baseScore, metrics.E, metrics.RL, metrics.RC)
    return (metrics.E === 'X' && metrics.RL === 'X' && metrics.RC === 'X') ? null : t
  }, [baseScore, metrics, showTemporal])

  const temporalSeverity = useMemo(() => temporalScore ? getCVSSSeverity(temporalScore) : null, [temporalScore])

  const severityColors: Record<string, { color: string; glow: string }> = {
    NONE:     { color: '#94a3b8', glow: 'rgba(148,163,184,0.15)' },
    LOW:      { color: '#45d48a', glow: 'rgba(69,212,138,0.15)' },
    MEDIUM:   { color: '#f7b731', glow: 'rgba(247,183,49,0.15)' },
    HIGH:     { color: '#ff6b35', glow: 'rgba(255,107,53,0.15)' },
    CRITICAL: { color: '#ff3b5c', glow: 'rgba(255,59,92,0.15)' },
  }

  const sc = severityColors[baseSeverity] ?? severityColors.NONE
  const tsc = temporalSeverity ? (severityColors[temporalSeverity] ?? severityColors.NONE) : null

  const fullVector = useMemo(() => {
    if (!showTemporal || (!metrics.E || metrics.E === 'X') && (!metrics.RL || metrics.RL === 'X') && (!metrics.RC || metrics.RC === 'X')) {
      return vectorString
    }
    return `${vectorString}/E:${metrics.E ?? 'X'}/RL:${metrics.RL ?? 'X'}/RC:${metrics.RC ?? 'X'}`
  }, [vectorString, metrics, showTemporal])

  const handleCopy = () => {
    navigator.clipboard.writeText(fullVector)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleReset = () => {
    setMetrics(DEFAULT_CVSS)
  }

  return (
    <div className="space-y-5">
      {/* Score Summary */}
      <div className="bg-[#0a0b0f] border border-[#1e2535] rounded-xl p-5 flex flex-wrap items-center gap-6"
        style={{ boxShadow: `0 0 40px ${sc.glow}` }}>
        <ScoreGauge score={baseScore} label="Base Score" color={sc.color} size="lg" />
        {temporalScore !== null && tsc && (
          <ScoreGauge score={temporalScore} label="Temporal" color={tsc.color} size="sm" />
        )}
        <div className="flex-1 min-w-[160px]">
          <div className="flex items-center gap-3 mb-3">
            <span
              className="px-3 py-1.5 rounded-lg text-sm font-bold font-mono border"
              style={{ color: sc.color, borderColor: sc.color + '40', background: sc.color + '15' }}
            >
              {baseSeverity}
            </span>
            {temporalSeverity && tsc && temporalSeverity !== baseSeverity && (
              <span
                className="px-2 py-1 rounded text-xs font-mono border"
                style={{ color: tsc.color, borderColor: tsc.color + '40', background: tsc.color + '10' }}
              >
                Temporal: {temporalSeverity}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-[10px] font-mono text-[#64748b] bg-[#0f1117] border border-[#1e2535] rounded px-2 py-1.5 break-all leading-relaxed">
              {fullVector}
            </code>
            <button
              onClick={handleCopy}
              className="p-2 rounded-lg bg-[#1c1f2e] border border-[#1e2535] hover:border-[#2a3347] transition-all flex-shrink-0"
              aria-label="Copy CVSS vector"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#45d48a]" /> : <Copy className="w-3.5 h-3.5 text-[#64748b]" />}
            </button>
          </div>
        </div>
      </div>

      {/* Base Metrics */}
      <div className="bg-[#0f1117] border border-[#1e2535] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#1e2535] flex items-center justify-between">
          <span className="text-xs font-semibold text-white uppercase tracking-widest">Base Score Metrics</span>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-[11px] text-[#64748b] hover:text-[#e2e8f0] transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>
        <div className="p-4 space-y-5">
          {CVSS_BASE_METRICS.map(metric => (
            <div key={metric.id}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <label className="text-xs font-semibold text-[#e2e8f0]">{metric.label}</label>
                  <p className="text-[10px] text-[#64748b] mt-0.5 leading-relaxed max-w-lg">{metric.description}</p>
                </div>
                <span className="text-[10px] font-mono text-[#00d4aa] bg-[#00d4aa]/10 px-2 py-0.5 rounded border border-[#00d4aa]/20 flex-shrink-0">
                  {metric.abbr}:{metrics[metric.id]}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {metric.options.map(opt => (
                  <MetricButton
                    key={opt.value}
                    active={(metrics as Record<string, string>)[metric.id] === opt.value}
                    label={opt.label}
                    short={opt.short}
                    description={opt.description}
                    onClick={() => set(metric.id as keyof CVSSMetrics, opt.value)}
                  />
                ))}
              </div>
              <p className="text-[10px] text-[#4ecdc4] mt-1.5 pl-1">
                {getMetricExplanation(metric.id, (metrics as Record<string, string>)[metric.id])}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Temporal Metrics */}
      <div className="bg-[#0f1117] border border-[#1e2535] rounded-xl overflow-hidden">
        <button
          className="w-full flex items-center justify-between px-4 py-3 border-b border-[#1e2535] hover:bg-[#161821] transition-colors"
          onClick={() => setShowTemporal(v => !v)}
        >
          <span className="text-xs font-semibold text-white uppercase tracking-widest">Temporal Score Metrics (Optional)</span>
          <ChevronDown className={cn('w-4 h-4 text-[#64748b] transition-transform', showTemporal && 'rotate-180')} />
        </button>
        {showTemporal && (
          <div className="p-4 space-y-5">
            <p className="text-[11px] text-[#64748b] leading-relaxed">
              Temporal metrics adjust the Base Score to reflect characteristics that may change over time, such as exploit maturity and remediation status. Use <strong className="text-[#e2e8f0]">Not Defined (X)</strong> to preserve the Base Score unchanged.
            </p>
            {CVSS_TEMPORAL_METRICS.map(metric => (
              <div key={metric.id}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <label className="text-xs font-semibold text-[#e2e8f0]">{metric.label}</label>
                    <p className="text-[10px] text-[#64748b] mt-0.5 leading-relaxed max-w-lg">{metric.description}</p>
                  </div>
                  <span className="text-[10px] font-mono text-[#00d4aa] bg-[#00d4aa]/10 px-2 py-0.5 rounded border border-[#00d4aa]/20 flex-shrink-0">
                    {metric.abbr}:{(metrics as Record<string, string>)[metric.id] ?? 'X'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {metric.options.map(opt => (
                    <MetricButton
                      key={opt.value}
                      active={(metrics as Record<string, string>)[metric.id] === opt.value}
                      label={opt.label}
                      short={opt.short}
                      description={opt.description}
                      onClick={() => set(metric.id as keyof CVSSMetrics, opt.value)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Score Breakdown Table */}
      <div className="bg-[#0f1117] border border-[#1e2535] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#1e2535]">
          <span className="text-xs font-semibold text-white uppercase tracking-widest">Score Breakdown</span>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Base Score',     value: baseScore.toFixed(1),   color: sc.color     },
              { label: 'Severity',       value: baseSeverity,           color: sc.color     },
              { label: 'Temporal Score', value: temporalScore?.toFixed(1) ?? 'N/A', color: tsc?.color ?? '#64748b' },
              { label: 'Temp. Severity', value: temporalSeverity ?? 'N/A',          color: tsc?.color ?? '#64748b' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-[#0a0b0f] border border-[#1e2535] rounded-lg p-3">
                <p className="text-[10px] text-[#64748b] mb-1 uppercase tracking-wide">{label}</p>
                <p className="text-lg font-bold font-mono" style={{ color }}>{value}</p>
              </div>
            ))}
          </div>

          {/* CVSS Severity Scale Reference */}
          <div className="mt-4 pt-4 border-t border-[#1e2535]">
            <p className="text-[10px] text-[#64748b] uppercase tracking-widest mb-3">CVSS v3.1 Severity Scale Reference</p>
            <div className="flex flex-wrap gap-2">
              {[
                { range: 'N/A',     label: 'None',     color: '#94a3b8' },
                { range: '0.1–3.9', label: 'Low',      color: '#45d48a' },
                { range: '4.0–6.9', label: 'Medium',   color: '#f7b731' },
                { range: '7.0–8.9', label: 'High',     color: '#ff6b35' },
                { range: '9.0–10.0',label: 'Critical', color: '#ff3b5c' },
              ].map(({ range, label, color }) => (
                <div key={label} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0a0b0f] border border-[#1e2535]">
                  <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                  <span className="text-[11px] font-semibold" style={{ color }}>{label}</span>
                  <span className="text-[10px] text-[#64748b] font-mono">{range}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Impact Matrix Calculator ───────────────────────────────────────────────────

const DEFAULT_IMPACT: ImpactMetrics = {
  skillLevel: 5, motive: 4, opportunity: 4, size: 6,
  easeOfDiscovery: 5, easeOfExploit: 5, awareness: 6, intrusionDetection: 5,
  lossOfConfidentiality: 5, lossOfIntegrity: 5, lossOfAvailability: 5, lossOfAccountability: 5,
  financialDamage: 3, reputationDamage: 3, nonCompliance: 2, privacyViolation: 5,
}

function ImpactMatrixCalculator() {
  const [metrics, setMetrics] = useState<ImpactMetrics>(DEFAULT_IMPACT)

  const set = useCallback((key: keyof ImpactMetrics, value: number) => {
    setMetrics(prev => ({ ...prev, [key]: value }))
  }, [])

  const likelihood = useMemo(() => {
    const ta = (metrics.skillLevel + metrics.motive + metrics.opportunity + metrics.size) / 4
    const vf = (metrics.easeOfDiscovery + metrics.easeOfExploit + metrics.awareness + metrics.intrusionDetection) / 4
    return (ta + vf) / 2
  }, [metrics])

  const technicalImpact = useMemo(() =>
    (metrics.lossOfConfidentiality + metrics.lossOfIntegrity + metrics.lossOfAvailability + metrics.lossOfAccountability) / 4,
    [metrics]
  )

  const businessImpact = useMemo(() =>
    (metrics.financialDamage + metrics.reputationDamage + metrics.nonCompliance + metrics.privacyViolation) / 4,
    [metrics]
  )

  const overallImpact = useMemo(() => Math.max(technicalImpact, businessImpact), [technicalImpact, businessImpact])

  const likelihoodClass = useMemo(() => classifyImpact(likelihood), [likelihood])
  const techImpactClass = useMemo(() => classifyImpact(technicalImpact), [technicalImpact])
  const bizImpactClass  = useMemo(() => classifyImpact(businessImpact), [businessImpact])
  const overallClass    = useMemo(() => classifyImpact(overallImpact), [overallImpact])
  const riskRating      = useMemo(() => classifyRisk(likelihood, overallImpact), [likelihood, overallImpact])

  const handleReset = () => setMetrics(DEFAULT_IMPACT)

  return (
    <div className="space-y-5">
      {/* Risk Summary */}
      <div
        className="bg-[#0a0b0f] border rounded-xl p-5"
        style={{ borderColor: riskRating.color.replace('text-', '').replace('[', '').replace(']', '') + '40' }}
      >
        <div className="flex flex-wrap items-start gap-6">
          {/* Overall Risk Badge */}
          <div className="flex flex-col items-center gap-2">
            <div className={cn('w-24 h-24 rounded-2xl flex flex-col items-center justify-center border-2', riskRating.bg)}
              style={{ borderColor: riskRating.color.split('[')[1]?.split(']')[0] || '#00d4aa' }}>
              <span className={cn('text-2xl font-black font-mono', riskRating.color)}>{riskRating.label}</span>
              <span className="text-[9px] text-[#64748b] uppercase tracking-wide mt-0.5">RISK</span>
            </div>
          </div>

          {/* Gauges */}
          <div className="flex flex-wrap gap-5 items-end">
            <div className="text-center">
              <div className="flex gap-4">
                <div>
                  <div className={cn('text-lg font-bold font-mono', likelihoodClass.color)}>{likelihood.toFixed(2)}</div>
                  <div className="text-[9px] text-[#64748b] uppercase">Likelihood</div>
                  <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded font-mono', likelihoodClass.color, likelihoodClass.bg)}>{likelihoodClass.label}</span>
                </div>
                <div className="w-px bg-[#1e2535]" />
                <div>
                  <div className={cn('text-lg font-bold font-mono', techImpactClass.color)}>{technicalImpact.toFixed(2)}</div>
                  <div className="text-[9px] text-[#64748b] uppercase">Tech Impact</div>
                  <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded font-mono', techImpactClass.color, techImpactClass.bg)}>{techImpactClass.label}</span>
                </div>
                <div className="w-px bg-[#1e2535]" />
                <div>
                  <div className={cn('text-lg font-bold font-mono', bizImpactClass.color)}>{businessImpact.toFixed(2)}</div>
                  <div className="text-[9px] text-[#64748b] uppercase">Biz Impact</div>
                  <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded font-mono', bizImpactClass.color, bizImpactClass.bg)}>{bizImpactClass.label}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Description */}
          <div className="flex-1 min-w-[200px]">
            <p className="text-xs text-[#64748b] leading-relaxed">{riskRating.description}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
              <div className="bg-[#0f1117] border border-[#1e2535] rounded px-2 py-1.5">
                <span className="text-[#64748b]">OWASP Rating Method</span>
              </div>
              <div className="bg-[#0f1117] border border-[#1e2535] rounded px-2 py-1.5">
                <span className="text-[#64748b]">Formula: max(Tech, Business)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Groups */}
      {IMPACT_GROUPS.map(group => (
        <div key={group.group} className={cn('bg-[#0f1117] border rounded-xl overflow-hidden', group.borderColor)}>
          <div className={cn('px-4 py-3 border-b flex items-center justify-between', group.borderColor, group.bgColor)}>
            <div>
              <span className={cn('text-xs font-semibold uppercase tracking-widest', group.color)}>{group.group}</span>
              <p className="text-[10px] text-[#64748b] mt-0.5">{group.description}</p>
            </div>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {group.metrics.map(metric => {
              const currentVal = metrics[metric.id as keyof ImpactMetrics]
              return (
                <div key={metric.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-[#e2e8f0]">{metric.label}</label>
                    <span className={cn('text-sm font-bold font-mono', group.color)}>{currentVal}</span>
                  </div>
                  <p className="text-[10px] text-[#64748b] leading-relaxed mb-2.5">{metric.description}</p>
                  <div className="space-y-1.5">
                    {metric.levels.map(level => (
                      <button
                        key={`${metric.id}-${level.value}-${level.label}`}
                        onClick={() => set(metric.id as keyof ImpactMetrics, level.value)}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2 rounded-lg border text-left text-xs transition-all',
                          currentVal === level.value
                            ? cn('border-opacity-50 text-white', group.bgColor, group.borderColor.replace('/30', '/60'))
                            : 'bg-[#161821] text-[#64748b] border-[#1e2535] hover:border-[#2a3347] hover:text-[#e2e8f0]',
                        )}
                      >
                        <span className={cn(
                          'w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold font-mono flex-shrink-0',
                          currentVal === level.value ? cn(group.color, group.bgColor) : 'text-[#334155] bg-[#1e2535]'
                        )}>
                          {level.value}
                        </span>
                        <span className="leading-tight">{level.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* Risk Matrix Visualization */}
      <div className="bg-[#0f1117] border border-[#1e2535] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#1e2535] flex items-center justify-between">
          <span className="text-xs font-semibold text-white uppercase tracking-widest">OWASP Risk Rating Matrix</span>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-[11px] text-[#64748b] hover:text-[#e2e8f0] transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>
        <div className="p-4">
          {/* 4x4 Risk Matrix */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[400px]">
              <thead>
                <tr>
                  <th className="text-[9px] text-[#64748b] text-right pr-3 pb-2 w-24">
                    <div className="flex flex-col items-end gap-1">
                      <span>Likelihood</span>
                      <span className="text-[#334155]">↕</span>
                      <span>Impact →</span>
                    </div>
                  </th>
                  {['Note', 'Low', 'Medium', 'High'].map(col => (
                    <th key={col} className="text-[10px] text-[#64748b] font-normal text-center pb-2">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {['High', 'Medium', 'Low', 'Note'].map(ll => (
                  <tr key={ll}>
                    <td className="text-[10px] text-[#64748b] text-right pr-3 py-1">{ll}</td>
                    {['Note', 'Low', 'Medium', 'High'].map(il => {
                      const cell = classifyRisk(
                        ll === 'High' ? 7 : ll === 'Medium' ? 4.5 : ll === 'Low' ? 1.5 : 0.5,
                        il === 'High' ? 7 : il === 'Medium' ? 4.5 : il === 'Low' ? 1.5 : 0.5,
                      )
                      const isActive = likelihoodClass.label === ll.toUpperCase() && overallClass.label === il.toUpperCase()
                      return (
                        <td key={il} className="py-1 px-1 text-center">
                          <div className={cn(
                            'rounded-lg py-1.5 px-2 text-[10px] font-bold font-mono transition-all',
                            cell.bg, cell.color,
                            isActive && 'ring-2 ring-white/30 scale-105',
                          )}>
                            {cell.label}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-[#64748b] mt-3 leading-relaxed">
            Active cell (highlighted with ring) reflects your current likelihood and impact scores. Based on the OWASP Risk Rating Methodology.
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Main Calculator ────────────────────────────────────────────────────────────

export function SecurityCalculator() {
  const [mode, setMode] = useState<CalculatorMode>('cvss')

  return (
    <div className="space-y-5">
      {/* Mode Selector */}
      <div className="bg-[#0f1117] border border-[#1e2535] rounded-xl p-4">
        <div className="flex items-center gap-3 mb-3">
          <Calculator className="w-4 h-4 text-[#00d4aa]" />
          <span className="text-sm font-semibold text-white">Security Risk Calculator</span>
        </div>
        <p className="text-xs text-[#64748b] mb-4 leading-relaxed">
          Select a scoring methodology below. CVSS v3.1 provides a standardized vulnerability severity score accepted by NVD, CVE, and bug bounty platforms. The OWASP Impact Matrix provides a contextual risk rating based on likelihood and business impact.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setMode('cvss')}
            className={cn(
              'flex-1 flex flex-col gap-1 px-4 py-3 rounded-xl border text-left transition-all',
              mode === 'cvss'
                ? 'bg-[#00d4aa]/10 border-[#00d4aa]/40 text-[#00d4aa]'
                : 'bg-[#161821] border-[#1e2535] text-[#64748b] hover:border-[#2a3347] hover:text-[#e2e8f0]',
            )}
          >
            <span className="text-sm font-bold font-mono">CVSS v3.1</span>
            <span className="text-[10px] leading-relaxed">
              Common Vulnerability Scoring System — industry standard 0–10 score with vector string. Used by NVD, CVE, bug bounty platforms.
            </span>
          </button>
          <button
            onClick={() => setMode('impact')}
            className={cn(
              'flex-1 flex flex-col gap-1 px-4 py-3 rounded-xl border text-left transition-all',
              mode === 'impact'
                ? 'bg-[#00d4aa]/10 border-[#00d4aa]/40 text-[#00d4aa]'
                : 'bg-[#161821] border-[#1e2535] text-[#64748b] hover:border-[#2a3347] hover:text-[#e2e8f0]',
            )}
          >
            <span className="text-sm font-bold font-mono">OWASP Impact Matrix</span>
            <span className="text-[10px] leading-relaxed">
              Risk-based rating using threat agent factors, vulnerability factors, technical and business impact — produces NOTE / LOW / MEDIUM / HIGH / CRITICAL.
            </span>
          </button>
        </div>
      </div>

      {/* Calculator Content */}
      {mode === 'cvss' ? <CVSSCalculator /> : <ImpactMatrixCalculator />}
    </div>
  )
}
