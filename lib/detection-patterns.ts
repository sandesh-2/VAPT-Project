/**
 * Real-world detection patterns and signatures
 * Based on OWASP, CWE, and industry-standard security testing methodologies
 */

export interface DetectionPattern {
  id: string;
  name: string;
  description: string;
  cwe: string[];
  owasp: string[];
  detectionMethod: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  commonTools: string[];
  indicators: string[];
  remediationSteps: string[];
  references: string[];
}

export const DETECTION_PATTERNS: Record<string, DetectionPattern> = {
  SQL_INJECTION: {
    id: 'cwe-89',
    name: 'SQL Injection',
    description:
      'Attacker submits database commands to retrieve, modify, or delete data',
    cwe: ['CWE-89'],
    owasp: ['A03:2021 - Injection', 'A1:2017 - Injection'],
    detectionMethod:
      'Payload injection testing with time-based blind SQLi, union-based SQLi, and error-based detection',
    severity: 'CRITICAL',
    commonTools: ['sqlmap', 'burp-suite', 'nuclei'],
    indicators: [
      'SQL syntax errors in response',
      'Time delays from database queries',
      "Boolean-based blind SQLi true/false responses',",
      'Union-based query results',
    ],
    remediationSteps: [
      'Use parameterized queries/prepared statements',
      'Implement input validation and sanitization',
      'Apply principle of least privilege to database accounts',
      'Enable database activity monitoring',
      'Use Web Application Firewall (WAF) rules',
    ],
    references: [
      'https://owasp.org/www-community/attacks/SQL_Injection',
      'https://cwe.mitre.org/data/definitions/89.html',
    ],
  },
  CROSS_SITE_SCRIPTING: {
    id: 'cwe-79',
    name: 'Cross-Site Scripting (XSS)',
    description:
      'Injection of malicious scripts into web pages viewed by other users',
    cwe: ['CWE-79'],
    owasp: ['A03:2021 - Injection', 'A7:2017 - XSS'],
    detectionMethod:
      'Testing for reflected/stored XSS via payload injection and DOM-based analysis',
    severity: 'HIGH',
    commonTools: ['burp-suite', 'nuclei', 'xsstrike'],
    indicators: [
      'User input reflected without encoding',
      'JavaScript execution in context of application',
      'DOM properties manipulated unsafely',
      'Event handlers triggered unintentionally',
    ],
    remediationSteps: [
      'Implement Content Security Policy (CSP)',
      'Output encode all user-controlled data',
      'Use security-focused templating engines',
      'Validate and sanitize all inputs',
      'Keep frameworks and libraries updated',
    ],
    references: [
      'https://owasp.org/www-community/attacks/xss/',
      'https://cwe.mitre.org/data/definitions/79.html',
    ],
  },
  BROKEN_AUTHENTICATION: {
    id: 'cwe-287',
    name: 'Broken Authentication',
    description: 'Flaws in credential management or session handling',
    cwe: ['CWE-287', 'CWE-384'],
    owasp: ['A07:2021 - Authentication', 'A2:2017 - Broken Authentication'],
    detectionMethod:
      'Testing weak password policies, session fixation, credential stuffing, JWT validation',
    severity: 'HIGH',
    commonTools: ['burp-suite', 'hydra', 'jwt.io'],
    indicators: [
      'Weak password requirements',
      'Unencrypted credentials in transit',
      'Session tokens predictable or reusable',
      'No account lockout mechanism',
      'Invalid JWT tokens accepted',
    ],
    remediationSteps: [
      'Enforce strong password policies (NIST guidelines)',
      'Implement multi-factor authentication (MFA)',
      'Use secure session management (secure, httpOnly cookies)',
      'Implement account lockout after failed attempts',
      'Validate and sign all authentication tokens (JWT)',
      'Use HTTPS exclusively',
    ],
    references: [
      'https://owasp.org/www-project-authentication-cheat-sheet/',
      'https://cwe.mitre.org/data/definitions/287.html',
    ],
  },
  BROKEN_ACCESS_CONTROL: {
    id: 'cwe-284',
    name: 'Broken Access Control',
    description:
      'Users can act outside their intended permissions or access unauthorized resources',
    cwe: ['CWE-284', 'CWE-639'],
    owasp: ['A01:2021 - Broken Access Control', 'A5:2017 - Broken Access Control'],
    detectionMethod:
      'Horizontal/vertical privilege escalation testing, IDOR detection, direct object reference analysis',
    severity: 'CRITICAL',
    commonTools: ['burp-suite', 'nuclei', 'autorize'],
    indicators: [
      'Direct object references predictable',
      'Inconsistent permission enforcement',
      'Missing access checks on sensitive operations',
      'Privilege escalation via ID manipulation',
    ],
    remediationSteps: [
      'Implement proper role-based access control (RBAC)',
      'Use indirect references for resources',
      'Log and monitor access attempts',
      'Enforce principle of least privilege',
      'Use access control lists (ACLs) appropriately',
    ],
    references: [
      'https://owasp.org/www-community/attacks/Insecure_Direct_Object_References',
      'https://cwe.mitre.org/data/definitions/284.html',
    ],
  },
  SECURITY_MISCONFIGURATION: {
    id: 'cwe-16',
    name: 'Security Misconfiguration',
    description: 'Missing security hardening or improperly configured security controls',
    cwe: ['CWE-16'],
    owasp: ['A05:2021 - Security Misconfiguration', 'A6:2017 - Security Misconfiguration'],
    detectionMethod:
      'Detection of default credentials, unpatched systems, exposed endpoints, debug modes enabled',
    severity: 'HIGH',
    commonTools: ['nessus', 'openvas', 'nuclei'],
    indicators: [
      'Default credentials still in use',
      'Debug mode enabled in production',
      'Verbose error messages revealing internal info',
      'Unpatched software versions',
      'Unnecessary services running',
    ],
    remediationSteps: [
      'Change all default credentials',
      'Disable unnecessary services and features',
      'Implement proper error handling without information disclosure',
      'Keep all software components updated',
      'Harden configurations per security baselines',
      'Implement web server hardening',
    ],
    references: [
      'https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/05-Configuration_and_Deployment_Management_Testing/README',
      'https://cwe.mitre.org/data/definitions/16.html',
    ],
  },
  SENSITIVE_DATA_EXPOSURE: {
    id: 'cwe-200',
    name: 'Sensitive Data Exposure',
    description: 'Unauthorized access to sensitive data',
    cwe: ['CWE-200'],
    owasp: ['A02:2021 - Cryptographic Failures', 'A3:2017 - Sensitive Data Exposure'],
    detectionMethod:
      'Detection of unencrypted transmission, weak encryption, exposed API keys, hardcoded credentials',
    severity: 'HIGH',
    commonTools: ['burp-suite', 'nuclei', 'trufflehog'],
    indicators: [
      'Data transmitted over unencrypted HTTP',
      'Weak encryption algorithms in use',
      'Hardcoded secrets in source code',
      'Sensitive data in URL parameters',
      'API keys exposed in responses',
    ],
    remediationSteps: [
      'Use strong encryption (AES-256) for data at rest',
      'Enforce HTTPS/TLS for data in transit',
      'Never hardcode credentials',
      'Use secrets management systems',
      'Classify and handle sensitive data properly',
      'Implement data masking for sensitive information',
    ],
    references: [
      'https://owasp.org/www-community/attacks/Sensitive_Data_Exposure',
      'https://cwe.mitre.org/data/definitions/200.html',
    ],
  },
  XXE_INJECTION: {
    id: 'cwe-611',
    name: 'XML External Entity (XXE) Injection',
    description: 'Exploitation of XML processors to access unauthorized data',
    cwe: ['CWE-611'],
    owasp: ['A03:2021 - Injection', 'A4:2017 - XXE'],
    detectionMethod:
      'XML payload injection testing, DTD entity definition analysis, external entity resolution testing',
    severity: 'HIGH',
    commonTools: ['burp-suite', 'nuclei'],
    indicators: [
      'XML input accepted without validation',
      'External entity references in XML',
      'Billion laughs attack susceptibility',
      'Local file access via XXE',
    ],
    remediationSteps: [
      'Disable external entity resolution in XML parsers',
      'Use XML validation schemas (XSD)',
      'Upgrade to patched XML libraries',
      'Implement input validation',
      'Use allowlists for acceptable XML entities',
    ],
    references: [
      'https://owasp.org/www-community/attacks/XML_External_Entity_(XXE)_Prevention_Cheat_Sheet',
      'https://cwe.mitre.org/data/definitions/611.html',
    ],
  },
  BROKEN_OBJECT_LEVEL_AUTH: {
    id: 'cwe-639',
    name: 'Broken Object Level Authorization (BOLA/IDOR)',
    description: 'Users can access objects belonging to other users',
    cwe: ['CWE-639'],
    owasp: ['A01:2021 - Broken Access Control'],
    detectionMethod:
      'Direct object reference testing by manipulating IDs and parameters',
    severity: 'CRITICAL',
    commonTools: ['burp-suite', 'nuclei', 'autorize'],
    indicators: [
      'Sequential or predictable object IDs',
      'User can modify ID to access other users data',
      'No authorization checks on object access',
      'API endpoints exposing user objects',
    ],
    remediationSteps: [
      'Use non-sequential, non-predictable object IDs (UUIDs)',
      'Implement access checks for every object reference',
      'Use indirect references when possible',
      'Implement proper logging and monitoring',
      'Document and test access control policies',
    ],
    references: [
      'https://owasp.org/www-community/attacks/Insecure_Direct_Object_References',
      'https://cwe.mitre.org/data/definitions/639.html',
    ],
  },
  SUBDOMAIN_TAKEOVER: {
    id: 'cwe-404',
    name: 'Subdomain Takeover',
    description:
      'Attacker can claim unmanaged DNS records pointing to defunct services',
    cwe: ['CWE-404'],
    owasp: ['A06:2021 - Vulnerable and Outdated Components'],
    detectionMethod:
      'DNS resolution of subdomains, CNAME analysis, service fingerprinting for unclaimed resources',
    severity: 'HIGH',
    commonTools: ['nuclei', 'subover', 'altdns'],
    indicators: [
      'DNS CNAME pointing to unclaimed service',
      'Service responds with "not found" or takeover message',
      'Certificate mismatch on subdomain',
    ],
    remediationSteps: [
      'Maintain inventory of all subdomains',
      'Remove DNS records for decommissioned services',
      'Monitor for DNS changes',
      'Document subdomains in use',
    ],
    references: [
      'https://owasp.org/www-community/attacks/Subdomain_takeover',
    ],
  },
  CORS_MISCONFIGURATION: {
    id: 'cwe-942',
    name: 'CORS Misconfiguration',
    description:
      'Improper Cross-Origin Resource Sharing configuration allowing unauthorized access',
    cwe: ['CWE-942'],
    owasp: ['A05:2021 - Security Misconfiguration'],
    detectionMethod:
      'Analyzing CORS headers, testing wildcard origins, checking credential handling',
    severity: 'MEDIUM',
    commonTools: ['burp-suite', 'nuclei'],
    indicators: [
      'Access-Control-Allow-Origin: *',
      'Wildcard origins with credentials enabled',
      'Overly permissive CORS policies',
    ],
    remediationSteps: [
      'Use specific, allowlisted origins instead of wildcards',
      'Never use wildcard with Access-Control-Allow-Credentials',
      'Implement proper CORS middleware',
      'Validate origin headers server-side',
    ],
    references: [
      'https://owasp.org/www-community/attacks/CORS_Misconfiguration',
      'https://cwe.mitre.org/data/definitions/942.html',
    ],
  },
  JWT_VULNERABILITIES: {
    id: 'cwe-295',
    name: 'JWT Implementation Vulnerabilities',
    description: 'Weak or missing JWT validation allowing token bypass',
    cwe: ['CWE-295'],
    owasp: ['A07:2021 - Identification and Authentication'],
    detectionMethod:
      'JWT validation testing, algorithm confusion, signature verification, expiration checking',
    severity: 'HIGH',
    commonTools: ['jwt.io', 'jq', 'burp-suite'],
    indicators: [
      'JWT accepted with algorithm: none',
      'Weak signature algorithms (HS256 instead of RS256)',
      'Missing expiration validation',
      'Predictable signing keys',
    ],
    remediationSteps: [
      'Use strong algorithms (RS256 or ES256)',
      'Validate signature on every request',
      'Check token expiration',
      'Use short expiration times',
      'Implement token rotation',
      'Store sensitive data outside JWT claims',
    ],
    references: [
      'https://owasp.org/www-community/attacks/Authentication_Cheat_Sheet',
      'https://cwe.mitre.org/data/definitions/295.html',
    ],
  },
};

/**
 * Get all patterns for a specific CWE
 */
export function getPatternsForCWE(cweId: string): DetectionPattern[] {
  return Object.values(DETECTION_PATTERNS).filter((p) => p.cwe.includes(cweId));
}

/**
 * Get all patterns for a specific OWASP category
 */
export function getPatternsForOWASP(owaspId: string): DetectionPattern[] {
  return Object.values(DETECTION_PATTERNS).filter((p) =>
    p.owasp.includes(owaspId),
  );
}

/**
 * Get patterns by severity
 */
export function getPatternsBySeverity(
  severity: string,
): DetectionPattern[] {
  return Object.values(DETECTION_PATTERNS).filter((p) => p.severity === severity);
}

/**
 * Get pattern by ID
 */
export function getPattern(id: string): DetectionPattern | undefined {
  return DETECTION_PATTERNS[id];
}

/**
 * Get patterns detectable by a specific tool
 */
export function getPatternsByTool(tool: string): DetectionPattern[] {
  return Object.values(DETECTION_PATTERNS).filter((p) =>
    p.commonTools.some((t) => t.toLowerCase().includes(tool.toLowerCase())),
  );
}
