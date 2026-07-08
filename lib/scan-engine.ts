import { Finding, LogEntry, PhaseResult, ScanConfig, ScanSession, ScanSummary, Severity, PHASE_DEFINITIONS } from './scan-types'

let scanInterval: ReturnType<typeof setInterval> | null = null

// ── Realistic synthetic data generators ─────────────────────────────────────

function ts() { return new Date().toISOString() }

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }

const SUBDOMAINS = ['api', 'admin', 'dev', 'staging', 'mail', 'cdn', 'auth', 'app', 'portal',
  'dashboard', 'internal', 'test', 'beta', 'docs', 'static', 'assets', 'login', 'sso',
  'vpn', 'git', 'jira', 'confluence', 'jenkins', 'grafana', 'kibana', 'elastic', 'vault']

function genSubdomains(target: string, n: number): string[] {
  return SUBDOMAINS.slice(0, n).map(s => `${s}.${target}`)
}

function genPassiveLogs(target: string): LogEntry[] {
  return [
    { ts: ts(), level: 'info',    msg: `[subfinder] Querying 52 passive sources for ${target}` },
    { ts: ts(), level: 'info',    msg: `[crt.sh] Certificate transparency lookup → 43 results` },
    { ts: ts(), level: 'info',    msg: `[AlienVault OTX] DNS passive records fetched` },
    { ts: ts(), level: 'info',    msg: `[Wayback Machine] Historical subdomain mining → 18 leaks` },
    { ts: ts(), level: 'info',    msg: `[RapidDNS] Additional CT source queried` },
    { ts: ts(), level: 'success', msg: `Merged & deduplicated → ${randomInt(40, 120)} passive candidates` },
  ]
}

function genDnsLogs(target: string): LogEntry[] {
  return [
    { ts: ts(), level: 'info',    msg: `[puredns] Wildcard detection on ${target}...` },
    { ts: ts(), level: 'warn',    msg: `Wildcard DNS detected — threshold filtering enabled` },
    { ts: ts(), level: 'info',    msg: `[dnsgen] Permutation wordlist generated → 8,400 mutations` },
    { ts: ts(), level: 'info',    msg: `[puredns] Resolving at 3 RPS with 6 trusted resolvers` },
    { ts: ts(), level: 'info',    msg: `[dig] DNS record enrichment: A, CNAME, MX, TXT, NS` },
    { ts: ts(), level: 'success', msg: `DNS phase complete — ${randomInt(15, 40)} live subdomains confirmed` },
  ]
}

function genHttpLogs(): LogEntry[] {
  return [
    { ts: ts(), level: 'info',    msg: `[httpx] Probing live hosts — tech-detect, status, title` },
    { ts: ts(), level: 'info',    msg: `[httpx] CDN detection enabled (Cloudflare, Akamai, Fastly)` },
    { ts: ts(), level: 'info',    msg: `[wafw00f] WAF fingerprinting on ${randomInt(8, 20)} hosts` },
    { ts: ts(), level: 'warn',    msg: `WAF detected: Cloudflare on 3 hosts — rate limiting active` },
    { ts: ts(), level: 'info',    msg: `[gowitness] Screenshots captured for visual triage` },
    { ts: ts(), level: 'info',    msg: `Security header audit: HSTS, CSP, X-Frame-Options, COEP` },
    { ts: ts(), level: 'success', msg: `HTTP probe done — ${randomInt(10, 30)} live URLs with metadata` },
  ]
}

function genCrawlLogs(): LogEntry[] {
  return [
    { ts: ts(), level: 'info',    msg: `[katana] Headless JS-rendering crawl started (depth 5)` },
    { ts: ts(), level: 'info',    msg: `[katana] Automatic form fill + JS crawl enabled` },
    { ts: ts(), level: 'info',    msg: `[gau] AlienVault OTX + Wayback + CommonCrawl aggregation` },
    { ts: ts(), level: 'info',    msg: `[hakrawler] Lightweight parallel crawler — in-scope filtering` },
    { ts: ts(), level: 'info',    msg: `[uro] Smart URL deduplication (param-level uniqueness)` },
    { ts: ts(), level: 'success', msg: `Crawl complete — ${randomInt(800, 3000)} unique endpoints discovered` },
  ]
}

function genJsLogs(): LogEntry[] {
  return [
    { ts: ts(), level: 'info',    msg: `[mantra] AST-based API route extraction from JS bundles` },
    { ts: ts(), level: 'info',    msg: `[xnLinkFinder] Deep link + endpoint extraction` },
    { ts: ts(), level: 'warn',    msg: `[SecretFinder] Potential secret found in vendor.js` },
    { ts: ts(), level: 'info',    msg: `[TruffleHog] Entropy-based secret scanning (verified only)` },
    { ts: ts(), level: 'warn',    msg: `[regex sweep] Hardcoded credential pattern matched in main.js` },
    { ts: ts(), level: 'info',    msg: `[gf] Pattern matching: XSS, SQLi, SSRF, IDOR, LFI, RCE, SSTI` },
    { ts: ts(), level: 'success', msg: `JS analysis complete — ${randomInt(3, 12)} potential secrets flagged` },
  ]
}

function genVulnLogs(): LogEntry[] {
  return [
    { ts: ts(), level: 'info',    msg: `[nuclei] Template update check — using latest community templates` },
    { ts: ts(), level: 'info',    msg: `[nuclei] Tags: cve,exposures,misconfiguration,default-login,panel,sqli,ssrf,xss,lfi,rce` },
    { ts: ts(), level: 'info',    msg: `[nuclei] Severity filter: critical,high,medium` },
    { ts: ts(), level: 'warn',    msg: `[nuclei] CVE Spotlight: log4j, spring4shell, atlassian templates active` },
    { ts: ts(), level: 'success', msg: `Nuclei scan complete — findings categorized by severity` },
  ]
}

// ── Finding generators ───────────────────────────────────────────────────────

function genPassiveFindings(target: string, n = 3): Finding[] {
  const items: Finding[] = [
    {
      id: crypto.randomUUID(),
      severity: 'info',
      title: `${randomInt(40, 120)} passive subdomains enumerated`,
      description: `Multi-source OSINT collected subdomains from crt.sh, Subfinder, OTX, Wayback Machine, and RapidDNS. Raw list deduplicated and scope-filtered.`,
      phase: 'Passive Recon', timestamp: ts(),
      tags: ['osint', 'subdomain', 'passive'],
    },
    {
      id: crypto.randomUUID(),
      severity: 'info',
      title: 'Certificate transparency records found',
      description: `crt.sh returned ${randomInt(30, 80)} certificate SAN entries. Wildcard certs detected exposing subdomains not in DNS.`,
      phase: 'Passive Recon', timestamp: ts(),
      tags: ['crt.sh', 'ct-log', 'passive'],
    },
    {
      id: crypto.randomUUID(),
      severity: 'medium',
      title: 'Historical subdomains leaked via Wayback Machine',
      description: `Wayback CDX API revealed ${randomInt(5, 20)} historical endpoints including decommissioned staging and dev subdomains that may still be live.`,
      phase: 'Passive Recon', timestamp: ts(),
      tags: ['wayback', 'historical', 'passive'],
    },
  ]
  return items.slice(0, n)
}

function genDnsFindings(target: string): Finding[] {
  return [
    {
      id: crypto.randomUUID(),
      severity: 'medium',
      title: `Wildcard DNS detected on *.${target}`,
      description: 'A wildcard A record resolves all undefined subdomains. This can mask real subdomains and produce false positives in enumeration.',
      phase: 'DNS Enum', timestamp: ts(),
      tags: ['dns', 'wildcard', 'false-positive-risk'],
    },
    {
      id: crypto.randomUUID(),
      severity: 'info',
      title: `${randomInt(15, 40)} live subdomains after DNS resolution`,
      description: 'PureDNS resolved all passive candidates against trusted resolvers at rate-limited RPS. Permutation mutations added new discoveries.',
      phase: 'DNS Enum', timestamp: ts(),
      tags: ['dns', 'resolution'],
    },
  ]
}

function genHttpFindings(target: string): Finding[] {
  return [
    {
      id: crypto.randomUUID(),
      severity: 'medium',
      title: 'Missing security headers on multiple hosts',
      description: 'Strict-Transport-Security, Content-Security-Policy, and X-Frame-Options absent on 60%+ of live hosts.',
      phase: 'HTTP Probe', timestamp: ts(),
      tags: ['headers', 'misconfiguration'],
      remediation: 'Add HSTS, CSP, X-Frame-Options, Permissions-Policy to all HTTP responses.',
    },
    {
      id: crypto.randomUUID(),
      severity: 'info',
      title: `WAF detected — Cloudflare on api.${target}`,
      description: 'Cloudflare WAF fingerprinted via wafw00f. Active scanning rate-limited accordingly.',
      phase: 'HTTP Probe', timestamp: ts(),
      tags: ['waf', 'cloudflare', 'fingerprint'],
    },
    {
      id: crypto.randomUUID(),
      severity: 'high',
      title: `Admin panel exposed on admin.${target}`,
      description: 'HTTP 200 response on /admin with no authentication challenge. Default login credentials should be tested.',
      phase: 'HTTP Probe', timestamp: ts(),
      tags: ['admin', 'exposure', 'authentication'],
      remediation: 'Restrict /admin to internal networks or VPN. Enforce MFA.',
    },
  ]
}

function genJsFindings(target: string): Finding[] {
  return [
    {
      id: crypto.randomUUID(),
      severity: 'critical',
      title: 'Hardcoded AWS secret key in main.js',
      description: 'Regex sweep matched AWS_SECRET_ACCESS_KEY pattern in minified JavaScript. TruffleHog verification pending.',
      phase: 'JS Analysis', timestamp: ts(),
      tags: ['secret', 'aws', 'credentials', 'critical'],
      cve: undefined,
      remediation: 'Rotate the key immediately. Move secrets to environment variables or a secrets manager.',
    },
    {
      id: crypto.randomUUID(),
      severity: 'high',
      title: 'Internal API routes exposed in JS bundle',
      description: `Mantra AST analysis found ${randomInt(12, 40)} internal /api/ routes not exposed in public documentation, including /api/admin/users.`,
      phase: 'JS Analysis', timestamp: ts(),
      tags: ['api', 'exposure', 'idor-risk'],
      remediation: 'Audit all API routes for proper auth enforcement. Remove dev-only routes from production builds.',
    },
    {
      id: crypto.randomUUID(),
      severity: 'medium',
      title: 'Stripe publishable key leaked in vendor bundle',
      description: 'Non-secret publishable key found. Review whether any secret keys are also present in the bundle.',
      phase: 'JS Analysis', timestamp: ts(),
      tags: ['stripe', 'api-key', 'payment'],
    },
  ]
}

function genVulnFindings(target: string): Finding[] {
  return [
    {
      id: crypto.randomUUID(),
      severity: 'critical',
      title: 'CVE-2021-44228 — Log4Shell RCE',
      description: `Log4j JNDI injection detected on api.${target}/v1/search. Unpatched Log4j 2.x in Java stack.`,
      phase: 'Vuln Scan', timestamp: ts(),
      tags: ['cve', 'rce', 'log4j', 'critical'],
      cve: 'CVE-2021-44228',
      remediation: 'Upgrade Log4j to 2.17.1+. Apply JVM flag -Dlog4j2.formatMsgNoLookups=true as immediate mitigation.',
    },
    {
      id: crypto.randomUUID(),
      severity: 'critical',
      title: 'SQL Injection — Login endpoint',
      description: `Time-based blind SQLi confirmed on POST /api/auth/login parameter "username". DB: MySQL 8.0.`,
      phase: 'Vuln Scan', timestamp: ts(),
      tags: ['sqli', 'injection', 'authentication'],
      remediation: 'Use parameterized queries / prepared statements. Apply WAF rules as secondary control.',
    },
    {
      id: crypto.randomUUID(),
      severity: 'high',
      title: 'Server-Side Request Forgery (SSRF)',
      description: `SSRF via /api/fetch?url= parameter. Internal metadata endpoint http://169.254.169.254/ reachable.`,
      phase: 'Vuln Scan', timestamp: ts(),
      tags: ['ssrf', 'aws-metadata', 'cloud'],
      remediation: 'Whitelist allowed fetch targets. Block 169.254.0.0/16 and 10.0.0.0/8 ranges in outbound requests.',
    },
    {
      id: crypto.randomUUID(),
      severity: 'high',
      title: 'Reflected Cross-Site Scripting (XSS)',
      description: `Reflected XSS on /search?q= parameter. CSP absent — full script injection possible.`,
      phase: 'Vuln Scan', timestamp: ts(),
      tags: ['xss', 'injection', 'client-side'],
      remediation: 'HTML-encode all reflected user input. Implement strict Content-Security-Policy.',
    },
    {
      id: crypto.randomUUID(),
      severity: 'medium',
      title: 'Spring Boot Actuator endpoints exposed',
      description: '/actuator/env, /actuator/beans, and /actuator/mappings return sensitive configuration data without auth.',
      phase: 'Vuln Scan', timestamp: ts(),
      tags: ['spring', 'actuator', 'exposure', 'misconfiguration'],
      cve: 'CVE-2022-22965',
      remediation: 'Restrict actuator endpoints to localhost or add Spring Security auth. Disable unused actuators.',
    },
  ]
}

function genCorsFindings(target: string): Finding[] {
  return [
    {
      id: crypto.randomUUID(),
      severity: 'high',
      title: 'CORS: Reflected arbitrary origin + credentials',
      description: `api.${target} reflects any Origin and returns Access-Control-Allow-Credentials: true. Attacker can exfiltrate authenticated user data.`,
      phase: 'CORS', timestamp: ts(),
      tags: ['cors', 'misconfiguration', 'credentials'],
      remediation: 'Whitelist specific allowed origins. Never combine wildcard origins with allow-credentials: true.',
    },
    {
      id: crypto.randomUUID(),
      severity: 'medium',
      title: 'CORS: Null origin accepted',
      description: `Requests with Origin: null are accepted and reflected. Sandboxed iframes can exploit this.`,
      phase: 'CORS', timestamp: ts(),
      tags: ['cors', 'null-origin'],
      remediation: 'Reject "null" origin in CORS policy. Implement an explicit allowlist.',
    },
  ]
}

function genCloudFindings(target: string): Finding[] {
  return [
    {
      id: crypto.randomUUID(),
      severity: 'critical',
      title: `Open S3 Bucket: ${target.split('.')[0]}-assets`,
      description: `S3 bucket publicly listable. Contains ${randomInt(200, 2000)} objects including backups, PII exports, and private keys.`,
      phase: 'Cloud Hunt', timestamp: ts(),
      tags: ['s3', 'cloud', 'open-bucket', 'data-exposure'],
      remediation: 'Set bucket ACL to private. Enable S3 Block Public Access. Review IAM policies.',
    },
    {
      id: crypto.randomUUID(),
      severity: 'high',
      title: `Exposed GCP Storage bucket: ${target.split('.')[0]}-media`,
      description: 'Google Cloud Storage bucket allows unauthenticated read access. User-uploaded files and internal documents exposed.',
      phase: 'Cloud Hunt', timestamp: ts(),
      tags: ['gcp', 'cloud', 'storage', 'data-exposure'],
      remediation: 'Set bucket IAM to private. Enable Uniform Bucket-Level Access.',
    },
  ]
}

function genTakeoverFindings(target: string): Finding[] {
  return [
    {
      id: crypto.randomUUID(),
      severity: 'high',
      title: `Subdomain takeover: blog.${target}`,
      description: `CNAME points to mybrand.ghost.io which is unclaimed. Attacker can register the Ghost.io subdomain and serve malicious content.`,
      phase: 'Takeover', timestamp: ts(),
      tags: ['takeover', 'subdomain', 'dangling-cname'],
      remediation: 'Delete or update the dangling CNAME record. Claim the external service subdomain.',
    },
  ]
}

function genAuthFindings(target: string): Finding[] {
  return [
    {
      id: crypto.randomUUID(),
      severity: 'high',
      title: 'GraphQL introspection enabled in production',
      description: `GraphQL introspection open at ${target}/graphql. Full schema exposed including mutation types and internal field names.`,
      phase: 'Auth Surface', timestamp: ts(),
      tags: ['graphql', 'introspection', 'exposure'],
      remediation: 'Disable introspection in production. Use schema depth-limiting and field allowlists.',
    },
    {
      id: crypto.randomUUID(),
      severity: 'medium',
      title: 'JWT using weak HS256 algorithm',
      description: 'Extracted JWTs use HS256 with short-lived secret. Algorithm confusion attack (RS256→HS256 bypass) may be feasible.',
      phase: 'Auth Surface', timestamp: ts(),
      tags: ['jwt', 'auth', 'cryptography'],
      remediation: 'Switch to RS256 with proper key management. Validate "alg" header server-side.',
    },
    {
      id: crypto.randomUUID(),
      severity: 'info',
      title: `OIDC discovery endpoint found`,
      description: `.well-known/openid-configuration returns valid JSON with authorization, token, and JWKS endpoints.`,
      phase: 'Auth Surface', timestamp: ts(),
      tags: ['oidc', 'oauth', 'discovery'],
    },
  ]
}

// ── Build full session ───────────────────────────────────────────────────────

export function buildMockSession(config: ScanConfig): ScanSession {
  const target = config.target
  const allPhases = PHASE_DEFINITIONS.map(p => ({
    id: p.id,
    name: p.name,
    shortName: p.shortName,
    status: 'pending' as const,
    count: 0,
    findings: [] as Finding[],
    logs: [] as LogEntry[],
  }))

  return {
    id: crypto.randomUUID(),
    config,
    status: 'idle',
    startedAt: new Date().toISOString(),
    phases: allPhases,
    summary: buildEmptySummary(),
  }
}

export function buildEmptySummary(): ScanSummary {
  return {
    subdomainsPassive: 0, subdomainsResolved: 0, liveUrls: 0,
    uniqueEndpoints: 0, jsFiles: 0, crawlParams: 0, openBuckets: 0,
    danglingCnames: 0, nucleiTotal: 0, nucleiCritical: 0, nucleiHigh: 0,
    nucleiMedium: 0, corsIssues: 0, oidcEndpoints: 0, jwtsFound: 0,
    missingHeaders: 0, secretsFound: 0, graphqlOpen: 0, subdoTakeovers: 0,
  }
}

// Simulate phase completion data
export function simulatePhaseData(phaseId: number, target: string): Partial<PhaseResult> {
  switch (phaseId) {
    case 1:  return { count: randomInt(40, 120), findings: genPassiveFindings(target, 3), logs: genPassiveLogs(target) }
    case 2:  return { count: randomInt(15, 40),  findings: genDnsFindings(target),        logs: genDnsLogs(target) }
    case 3:  return { count: randomInt(10, 30),  findings: genHttpFindings(target),       logs: genHttpLogs() }
    case 4:  return { count: randomInt(800, 3000),findings: [],                           logs: genCrawlLogs() }
    case 5:  return { count: randomInt(20, 80),  findings: genJsFindings(target),         logs: genJsLogs() }
    case 6:  return { count: randomInt(50, 200), findings: [],                            logs: [{ ts: ts(), level: 'info', msg: `[arjun] Hidden parameter discovery complete` }, { ts: ts(), level: 'success', msg: `${randomInt(50, 200)} unique parameters found` }] }
    case 7:  return { count: randomInt(5, 30),   findings: [],                            logs: [{ ts: ts(), level: 'info', msg: `[ffuf] Directory fuzzing with raft-large-directories` }, { ts: ts(), level: 'warn', msg: `.env, .git/config found on 2 hosts` }] }
    case 8:  return { count: randomInt(1, 4),    findings: genCloudFindings(target),      logs: [{ ts: ts(), level: 'info', msg: `[cloudbrute] Permutation-based bucket name generation` }, { ts: ts(), level: 'warn', msg: `Open bucket discovered!` }] }
    case 9:  return { count: randomInt(0, 3),    findings: genTakeoverFindings(target),   logs: [{ ts: ts(), level: 'info', msg: `[nuclei] Takeover templates run` }, { ts: ts(), level: 'warn', msg: `Dangling CNAME detected — blog.${target}` }] }
    case 10: return { count: randomInt(2, 8),    findings: genAuthFindings(target),       logs: [{ ts: ts(), level: 'info', msg: `OIDC/OAuth endpoint probing` }, { ts: ts(), level: 'warn', msg: `GraphQL introspection open` }] }
    case 11: return { count: randomInt(3, 15),   findings: [],                            logs: [{ ts: ts(), level: 'info', msg: `[kr] Kiterunner API route scanning` }, { ts: ts(), level: 'success', msg: `${randomInt(10, 60)} API routes discovered` }] }
    case 12: return { count: randomInt(5, 20),   findings: genVulnFindings(target),       logs: genVulnLogs() }
    case 13: return { count: randomInt(1, 5),    findings: genCorsFindings(target),       logs: [{ ts: ts(), level: 'info', msg: `CORS misconfiguration testing with 5 malicious origins` }, { ts: ts(), level: 'warn', msg: `Reflected origin + credentials found` }] }
    case 14: return { count: 1, findings: [], logs: [{ ts: ts(), level: 'success', msg: `Markdown report generated successfully` }] }
    case 15: return { count: 1, findings: [], logs: [{ ts: ts(), level: 'success', msg: `Critical/High findings dispatched via notify` }] }
    default: return { count: 0, findings: [], logs: [] }
  }
}

export function computeSummary(phases: PhaseResult[]): ScanSummary {
  const all = phases.flatMap(p => p.findings)
  return {
    subdomainsPassive:  phases[0]?.count ?? 0,
    subdomainsResolved: phases[1]?.count ?? 0,
    liveUrls:           phases[2]?.count ?? 0,
    uniqueEndpoints:    phases[3]?.count ?? 0,
    jsFiles:            phases[4]?.count ?? 0,
    crawlParams:        phases[5]?.count ?? 0,
    openBuckets:        phases[7]?.findings.filter(f => f.tags.includes('open-bucket')).length ?? 0,
    danglingCnames:     phases[8]?.count ?? 0,
    nucleiTotal:        phases[11]?.count ?? 0,
    nucleiCritical:     all.filter(f => f.severity === 'critical').length,
    nucleiHigh:         all.filter(f => f.severity === 'high').length,
    nucleiMedium:       all.filter(f => f.severity === 'medium').length,
    corsIssues:         phases[12]?.count ?? 0,
    oidcEndpoints:      phases[9]?.count ?? 0,
    jwtsFound:          randomInt(1, 8),
    missingHeaders:     randomInt(10, 50),
    secretsFound:       phases[4]?.findings.filter(f => f.tags.includes('secret')).length ?? 0,
    graphqlOpen:        phases[9]?.findings.filter(f => f.tags.includes('graphql')).length ?? 0,
    subdoTakeovers:     phases[8]?.findings.length ?? 0,
  }
}
