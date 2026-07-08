/**
 * CVSS v3.1 Calculator & Utilities
 * Based on FIRST CVSS v3.1 Specification
 * https://www.first.org/cvss/v3.1/specification-document
 */

export interface CVSSVector {
  CVSS: string; // e.g., "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H"
  baseScore: number;
  baseSeverity: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  temporalScore?: number;
  temporalSeverity?: string;
  environmentalScore?: number;
  environmentalSeverity?: string;
  exploitability?: number;
  impactSubscore?: number;
}

// CVSS v3.1 Base Score Severity Ratings
const SEVERITY_RATINGS = {
  NONE: { min: 0.0, max: 0.0 },
  LOW: { min: 0.1, max: 3.9 },
  MEDIUM: { min: 4.0, max: 6.9 },
  HIGH: { min: 7.0, max: 8.9 },
  CRITICAL: { min: 9.0, max: 10.0 },
};

// Metric Score Lookups for CVSS v3.1
const METRICS = {
  AV: { N: 0.85, A: 0.62, L: 0.55, P: 0.2 }, // Attack Vector
  AC: { L: 0.77, H: 0.44 }, // Attack Complexity
  PR: { N: 0.85, L: 0.62, H: 0.27 }, // Privileges Required
  UI: { N: 0.85, R: 0.62 }, // User Interaction
  S: { U: 1, C: 1 }, // Scope
  C: { N: 0, L: 0.22, H: 0.56 }, // Confidentiality
  I: { N: 0, L: 0.22, H: 0.56 }, // Integrity
  A: { N: 0, L: 0.22, H: 0.56 }, // Availability
} as const;

/**
 * Calculate CVSS v3.1 base score from vector string
 * @param vectorString e.g., "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H"
 * @returns Calculated base score (0-10)
 */
export function calculateCVSSBaseScore(vectorString: string): number {
  try {
    const parts = vectorString.split('/');
    const metrics: Record<string, string> = {};

    // Parse vector string
    parts.forEach((part) => {
      const [key, value] = part.split(':');
      metrics[key] = value;
    });

    // Extract metrics with defaults for required ones
    const AV = METRICS.AV[metrics.AV as keyof typeof METRICS.AV] || 0.85;
    const AC = METRICS.AC[metrics.AC as keyof typeof METRICS.AC] || 0.77;
    const PR = METRICS.PR[metrics.PR as keyof typeof METRICS.PR] || 0.85;
    const UI = METRICS.UI[metrics.UI as keyof typeof METRICS.UI] || 0.85;
    const S = metrics.S === 'C' ? 1 : 1; // Scope (always 1 for base calculation in v3.1)
    const C = METRICS.C[metrics.C as keyof typeof METRICS.C] || 0;
    const I = METRICS.I[metrics.I as keyof typeof METRICS.I] || 0;
    const A = METRICS.A[metrics.A as keyof typeof METRICS.A] || 0;

    // Calculate Impact SubScore
    const impactSubscore = 1 - (1 - C) * (1 - I) * (1 - A);

    // Calculate Exploitability
    const exploitability = 8.22 * AV * AC * PR * UI;

    // Calculate Base Score
    let baseScore: number;
    if (impactSubscore <= 0) {
      baseScore = 0;
    } else if (S === 1) {
      baseScore = Math.min(impactSubscore + exploitability, 10);
    } else {
      baseScore = Math.min(1.08 * (impactSubscore + exploitability), 10);
    }

    return Math.round(baseScore * 10) / 10; // Round to 1 decimal
  } catch (error) {
    console.error('[CVSS] Invalid vector string:', vectorString, error);
    return 0;
  }
}

/**
 * Get CVSS severity from score
 */
export function getCVSSSeverity(
  score: number,
): 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  if (score >= SEVERITY_RATINGS.CRITICAL.min) return 'CRITICAL';
  if (score >= SEVERITY_RATINGS.HIGH.min) return 'HIGH';
  if (score >= SEVERITY_RATINGS.MEDIUM.min) return 'MEDIUM';
  if (score >= SEVERITY_RATINGS.LOW.min) return 'LOW';
  return 'NONE';
}

/**
 * Parse CVSS vector string and validate
 */
export function parseAndValidateVector(
  vectorString: string,
): { valid: boolean; score?: number; severity?: string; error?: string } {
  if (!vectorString.startsWith('CVSS:3.1/')) {
    return { valid: false, error: 'Invalid CVSS version' };
  }

  const requiredMetrics = ['AV', 'AC', 'PR', 'UI', 'S', 'C', 'I', 'A'];
  const parts = vectorString.split('/');

  for (const metric of requiredMetrics) {
    const found = parts.some((p) => p.startsWith(metric + ':'));
    if (!found) {
      return { valid: false, error: `Missing required metric: ${metric}` };
    }
  }

  const score = calculateCVSSBaseScore(vectorString);
  const severity = getCVSSSeverity(score);

  return { valid: true, score, severity };
}

/**
 * Build a CVSS vector from individual metrics
 */
export function buildVector(metrics: {
  AV: 'N' | 'A' | 'L' | 'P';
  AC: 'L' | 'H';
  PR: 'N' | 'L' | 'H';
  UI: 'N' | 'R';
  S: 'U' | 'C';
  C: 'N' | 'L' | 'H';
  I: 'N' | 'L' | 'H';
  A: 'N' | 'L' | 'H';
}): string {
  return `CVSS:3.1/AV:${metrics.AV}/AC:${metrics.AC}/PR:${metrics.PR}/UI:${metrics.UI}/S:${metrics.S}/C:${metrics.C}/I:${metrics.I}/A:${metrics.A}`;
}

/**
 * Get human-readable explanation of a metric value
 */
export function getMetricExplanation(metric: string, value: string): string {
  const explanations: Record<string, Record<string, string>> = {
    AV: {
      N: 'Network - Exploitable remotely',
      A: 'Adjacent - Same network segment',
      L: 'Local - Local access required',
      P: 'Physical - Physical access required',
    },
    AC: {
      L: 'Low - No special conditions needed',
      H: 'High - Special conditions required',
    },
    PR: {
      N: 'None - No authentication required',
      L: 'Low - Requires basic user privileges',
      H: 'High - Requires admin/root privileges',
    },
    UI: {
      N: 'None - No user interaction required',
      R: 'Required - User interaction necessary',
    },
    S: {
      U: 'Unchanged - Scope limited to affected component',
      C: 'Changed - Can affect resources beyond scope',
    },
    C: {
      N: 'None - No confidentiality impact',
      L: 'Low - Limited information disclosure',
      H: 'High - Total confidentiality breach',
    },
    I: {
      N: 'None - No integrity impact',
      L: 'Low - Limited data modification',
      H: 'High - Total integrity compromise',
    },
    A: {
      N: 'None - No availability impact',
      L: 'Low - Performance degradation',
      H: 'High - Complete service disruption',
    },
  };

  return explanations[metric]?.[value] || 'Unknown metric';
}

/**
 * Get color for severity level (Tailwind compatible)
 */
export function getSeverityColor(
  severity: string,
): {
  bg: string;
  text: string;
  border: string;
  badge: string;
} {
  const colors: Record<
    string,
    { bg: string; text: string; border: string; badge: string }
  > = {
    CRITICAL: {
      bg: 'bg-red-950/30',
      text: 'text-red-400',
      border: 'border-red-500/30',
      badge: 'bg-red-500/10 text-red-400 border-red-500/20',
    },
    HIGH: {
      bg: 'bg-orange-950/30',
      text: 'text-orange-400',
      border: 'border-orange-500/30',
      badge: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    },
    MEDIUM: {
      bg: 'bg-yellow-950/30',
      text: 'text-yellow-400',
      border: 'border-yellow-500/30',
      badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    },
    LOW: {
      bg: 'bg-blue-950/30',
      text: 'text-blue-400',
      border: 'border-blue-500/30',
      badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    },
    INFO: {
      bg: 'bg-cyan-950/30',
      text: 'text-cyan-400',
      border: 'border-cyan-500/30',
      badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    },
  };

  return (
    colors[severity] || {
      bg: 'bg-slate-900/30',
      text: 'text-slate-400',
      border: 'border-slate-500/30',
      badge: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    }
  );
}

/**
 * Predefined CVE vectors for common vulnerabilities
 */
export const COMMON_VECTORS = {
  UNAUTHENTICATED_RCE:
    'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H', // Score: 9.8
  AUTHENTICATED_RCE:
    'CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H', // Score: 8.8
  SQL_INJECTION: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H', // Score: 9.8
  XSS: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N', // Score: 6.1
  OPEN_REDIRECT: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N', // Score: 6.1
  INFORMATION_DISCLOSURE: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N', // Score: 7.5
  AUTHENTICATION_BYPASS:
    'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H', // Score: 9.8
  BROKEN_CORS: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:H/I:H/A:N', // Score: 8.7
  INSECURE_DESERIALIZATION:
    'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H', // Score: 9.8
  PATH_TRAVERSAL: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:N', // Score: 8.2
  WEAK_CRYPTO: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N', // Score: 7.5
  SUBDOMAIN_TAKEOVER: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:H/A:N', // Score: 7.5
};
