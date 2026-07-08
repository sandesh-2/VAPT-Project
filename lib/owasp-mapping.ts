/**
 * OWASP Top 10 2021 & 2017 Mapping
 * CWE Priority Ranking
 */

export interface OWASPCategory {
  id: string;
  title: string;
  description: string;
  prevalence: 'Common' | 'Widespread' | 'Uncommon';
  detectability: 'Easy' | 'Average' | 'Difficult' | 'Very Difficult';
  exploitability: 'Easy' | 'Average' | 'Difficult' | 'Very Difficult';
  impact: 'Severe' | 'Moderate' | 'Minor';
  cweIds: string[];
  commonFinding: string[];
}

export const OWASP_2021: Record<string, OWASPCategory> = {
  'A01:2021': {
    id: 'A01:2021',
    title: 'Broken Access Control',
    description:
      'Users can act outside their intended permissions or access controls are improperly configured.',
    prevalence: 'Widespread',
    detectability: 'Easy',
    exploitability: 'Easy',
    impact: 'Severe',
    cweIds: ['CWE-639', 'CWE-284', 'CWE-287', 'CWE-434'],
    commonFinding: [
      'Insecure Direct Object References (IDOR)',
      'Missing access control on sensitive operations',
      'Horizontal privilege escalation',
      'Vertical privilege escalation',
    ],
  },
  'A02:2021': {
    id: 'A02:2021',
    title: 'Cryptographic Failures',
    description:
      'Failures related to cryptography which often lead to exposure of sensitive data.',
    prevalence: 'Common',
    detectability: 'Average',
    exploitability: 'Easy',
    impact: 'Severe',
    cweIds: ['CWE-200', 'CWE-310', 'CWE-327', 'CWE-328'],
    commonFinding: [
      'Unencrypted sensitive data transmission',
      'Weak cryptographic algorithms',
      'Missing encryption',
      'Hard-coded cryptographic keys',
    ],
  },
  'A03:2021': {
    id: 'A03:2021',
    title: 'Injection',
    description:
      'Application fails to properly validate or sanitize user-supplied input before using it.',
    prevalence: 'Widespread',
    detectability: 'Easy',
    exploitability: 'Easy',
    impact: 'Severe',
    cweIds: ['CWE-89', 'CWE-79', 'CWE-88', 'CWE-94'],
    commonFinding: [
      'SQL Injection',
      'Cross-Site Scripting (XSS)',
      'OS Command Injection',
      'LDAP Injection',
      'Expression Language Injection',
    ],
  },
  'A04:2021': {
    id: 'A04:2021',
    title: 'Insecure Design',
    description:
      'Missing or ineffective control design and threat modeling before development.',
    prevalence: 'Widespread',
    detectability: 'Very Difficult',
    exploitability: 'Average',
    impact: 'Severe',
    cweIds: ['CWE-209', 'CWE-522', 'CWE-656'],
    commonFinding: [
      'Missing security requirements',
      'No threat modeling performed',
      'Lack of secure design patterns',
      'Insufficient security validations',
    ],
  },
  'A05:2021': {
    id: 'A05:2021',
    title: 'Security Misconfiguration',
    description:
      'Insecure default configurations, incomplete setup, or improperly configured security controls.',
    prevalence: 'Common',
    detectability: 'Easy',
    exploitability: 'Easy',
    impact: 'Moderate',
    cweIds: ['CWE-16', 'CWE-2', 'CWE-693'],
    commonFinding: [
      'Default credentials still enabled',
      'Unnecessary features enabled',
      'Debug mode left on in production',
      'Unpatched systems',
      'Weak SSL/TLS configurations',
    ],
  },
  'A06:2021': {
    id: 'A06:2021',
    title: 'Vulnerable and Outdated Components',
    description:
      'Using components with known vulnerabilities or using unsupported versions.',
    prevalence: 'Widespread',
    detectability: 'Average',
    exploitability: 'Easy',
    impact: 'Severe',
    cweIds: ['CWE-1035', 'CWE-937'],
    commonFinding: [
      'Known CVE in dependencies',
      'Outdated libraries',
      'Unmaintained components',
      'Missing security patches',
    ],
  },
  'A07:2021': {
    id: 'A07:2021',
    title: 'Authentication and Session Management Failures',
    description:
      'Compromised user accounts, session tokens, or credentials.',
    prevalence: 'Common',
    detectability: 'Average',
    exploitability: 'Average',
    impact: 'Severe',
    cweIds: ['CWE-287', 'CWE-384', 'CWE-613'],
    commonFinding: [
      'Weak password policies',
      'Credential enumeration',
      'Session fixation',
      'Weak session tokens',
      'Missing MFA',
    ],
  },
  'A08:2021': {
    id: 'A08:2021',
    title: 'Software and Data Integrity Failures',
    description:
      'Failures related to software updates, CI/CD pipelines, and secure supply chain.',
    prevalence: 'Uncommon',
    detectability: 'Difficult',
    exploitability: 'Average',
    impact: 'Severe',
    cweIds: ['CWE-494', 'CWE-95', 'CWE-502'],
    commonFinding: [
      'Insecure CI/CD',
      'Unsigned or unencrypted artifact updates',
      'Insecure deserialization',
    ],
  },
  'A09:2021': {
    id: 'A09:2021',
    title: 'Logging and Monitoring Failures',
    description:
      'Insufficient logging, detection, monitoring, and active response to security incidents.',
    prevalence: 'Common',
    detectability: 'Difficult',
    exploitability: 'Average',
    impact: 'Moderate',
    cweIds: ['CWE-223', 'CWE-778'],
    commonFinding: [
      'Insufficient logging',
      'Missing security event logs',
      'No alerting mechanism',
      'No incident response plan',
    ],
  },
  'A10:2021': {
    id: 'A10:2021',
    title: 'Server-Side Request Forgery (SSRF)',
    description:
      'Web application fetches remote resources without properly validating user-supplied URLs.',
    prevalence: 'Common',
    detectability: 'Average',
    exploitability: 'Average',
    impact: 'Moderate',
    cweIds: ['CWE-918'],
    commonFinding: [
      'Unvalidated URLs in requests',
      'Access to internal services',
      'AWS metadata endpoint exposure',
    ],
  },
};

export const OWASP_2017: Record<string, OWASPCategory> = {
  'A1:2017': {
    id: 'A1:2017',
    title: 'Injection',
    description: 'Application fails to properly validate or sanitize input.',
    prevalence: 'Widespread',
    detectability: 'Easy',
    exploitability: 'Easy',
    impact: 'Severe',
    cweIds: ['CWE-89', 'CWE-79'],
    commonFinding: ['SQL Injection', 'XSS', 'Command Injection'],
  },
  'A2:2017': {
    id: 'A2:2017',
    title: 'Broken Authentication',
    description: 'Compromised accounts or authentication mechanisms.',
    prevalence: 'Common',
    detectability: 'Average',
    exploitability: 'Average',
    impact: 'Severe',
    cweIds: ['CWE-287', 'CWE-384'],
    commonFinding: ['Weak passwords', 'Session fixation', 'Missing MFA'],
  },
  'A3:2017': {
    id: 'A3:2017',
    title: 'Sensitive Data Exposure',
    description: 'Exposure of sensitive data.',
    prevalence: 'Common',
    detectability: 'Average',
    exploitability: 'Easy',
    impact: 'Severe',
    cweIds: ['CWE-200', 'CWE-310'],
    commonFinding: [
      'Unencrypted data transmission',
      'Weak encryption',
      'Hardcoded secrets',
    ],
  },
  'A4:2017': {
    id: 'A4:2017',
    title: 'XML External Entities (XXE)',
    description: 'Exploitation of XML processors.',
    prevalence: 'Uncommon',
    detectability: 'Average',
    exploitability: 'Easy',
    impact: 'Severe',
    cweIds: ['CWE-611'],
    commonFinding: ['XXE entity expansion', 'Local file access'],
  },
  'A5:2017': {
    id: 'A5:2017',
    title: 'Broken Access Control',
    description: 'Users acting outside intended permissions.',
    prevalence: 'Common',
    detectability: 'Easy',
    exploitability: 'Easy',
    impact: 'Severe',
    cweIds: ['CWE-639', 'CWE-284'],
    commonFinding: ['IDOR', 'Privilege escalation'],
  },
  'A6:2017': {
    id: 'A6:2017',
    title: 'Security Misconfiguration',
    description: 'Insecure default configurations.',
    prevalence: 'Common',
    detectability: 'Easy',
    exploitability: 'Easy',
    impact: 'Moderate',
    cweIds: ['CWE-16', 'CWE-2'],
    commonFinding: [
      'Default credentials',
      'Debug mode on',
      'Unpatched systems',
    ],
  },
  'A7:2017': {
    id: 'A7:2017',
    title: 'Cross-Site Scripting (XSS)',
    description: 'Injection of malicious scripts.',
    prevalence: 'Widespread',
    detectability: 'Easy',
    exploitability: 'Easy',
    impact: 'Moderate',
    cweIds: ['CWE-79'],
    commonFinding: ['Reflected XSS', 'Stored XSS', 'DOM-based XSS'],
  },
  'A8:2017': {
    id: 'A8:2017',
    title: 'Insecure Deserialization',
    description: 'Deserialization of untrusted data.',
    prevalence: 'Uncommon',
    detectability: 'Difficult',
    exploitability: 'Difficult',
    impact: 'Severe',
    cweIds: ['CWE-502'],
    commonFinding: [
      'Arbitrary code execution',
      'Object injection',
    ],
  },
  'A9:2017': {
    id: 'A9:2017',
    title: 'Using Components with Known Vulnerabilities',
    description: 'Using vulnerable dependencies.',
    prevalence: 'Widespread',
    detectability: 'Average',
    exploitability: 'Easy',
    impact: 'Severe',
    cweIds: ['CWE-1035'],
    commonFinding: ['Known CVEs', 'Outdated libraries'],
  },
  'A10:2017': {
    id: 'A10:2017',
    title: 'Insufficient Logging & Monitoring',
    description: 'Insufficient logging and monitoring.',
    prevalence: 'Common',
    detectability: 'Difficult',
    exploitability: 'Average',
    impact: 'Moderate',
    cweIds: ['CWE-223'],
    commonFinding: [
      'Missing logs',
      'No alerting',
    ],
  },
};

/**
 * Map CWE to OWASP categories
 */
export function mapCWEToOWASP(
  cweId: string,
  year: 2021 | 2017 = 2021,
): string[] {
  const owaspList = year === 2021 ? OWASP_2021 : OWASP_2017;
  return Object.entries(owaspList)
    .filter(([_, category]) => category.cweIds.includes(cweId))
    .map(([id, _]) => id);
}

/**
 * Get OWASP category by ID
 */
export function getOWASPCategory(id: string): OWASPCategory | undefined {
  return OWASP_2021[id] || OWASP_2017[id];
}

/**
 * Get all OWASP categories for a year
 */
export function getOWASPByYear(
  year: 2021 | 2017,
): OWASPCategory[] {
  const list = year === 2021 ? OWASP_2021 : OWASP_2017;
  return Object.values(list);
}

/**
 * Map finding title to OWASP category
 */
export function matchFindingToOWASP(
  findingTitle: string,
): string[] {
  const lowerTitle = findingTitle.toLowerCase();

  const matches: Record<string, string[]> = {
    'sql injection': ['A03:2021', 'A1:2017'],
    'cross-site scripting': ['A03:2021', 'A7:2017'],
    'broken access': ['A01:2021', 'A5:2017'],
    'authentication': ['A07:2021', 'A2:2017'],
    'sensitive data': ['A02:2021', 'A3:2017'],
    'security misconfiguration': ['A05:2021', 'A6:2017'],
    'vulnerable components': ['A06:2021', 'A9:2017'],
    'xxe': ['A03:2021', 'A4:2017'],
    'ssrf': ['A10:2021'],
    'insecure deserialization': ['A08:2021', 'A8:2017'],
    'idor': ['A01:2021', 'A5:2017'],
    'cors': ['A05:2021'],
    'jwt': ['A07:2021', 'A2:2017'],
    'subdomain takeover': ['A06:2021', 'A9:2017'],
  };

  for (const [keyword, categories] of Object.entries(matches)) {
    if (lowerTitle.includes(keyword)) {
      return categories;
    }
  }

  return [];
}
