# ReconForge - Comprehensive User Guide

## Table of Contents

1. [System Overview](#system-overview)
2. [Getting Started](#getting-started)
3. [Installation & Setup](#installation--setup)
4. [Core Features](#core-features)
5. [Feature Guide](#feature-guide)
6. [Configuration](#configuration)
7. [Workflows](#workflows)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## System Overview

### What is ReconForge?

ReconForge is an advanced vulnerability assessment and penetration testing (VAPT) platform designed to help security researchers, ethical hackers, and cybersecurity teams discover, analyze, and remediate security vulnerabilities in web applications and infrastructure.

### Key Capabilities

- **Comprehensive Scanning**: Performs both passive reconnaissance (OSINT) and active security scanning
- **Vulnerability Analysis**: Identifies and scores vulnerabilities using CVSS v3.1 scoring
- **Risk Assessment**: Calculates business impact using OWASP Risk Rating methodology
- **Real-Time Monitoring**: Live progress tracking and instant finding updates
- **Advanced Reporting**: Multi-format export (JSON, CSV, Markdown) with detailed remediation
- **Security Calculators**: Built-in CVSS v3.1 and OWASP Impact Matrix calculators
- **Configurable Scanning**: Extensive settings for scan behavior and detection tuning

### Who Should Use ReconForge?

- **Security Teams**: Perform comprehensive security assessments
- **Penetration Testers**: Conduct authorized security testing engagements
- **DevSecOps Engineers**: Integrate security into CI/CD pipelines
- **Security Researchers**: Analyze vulnerabilities and test detection methods
- **Compliance Officers**: Generate reports for audit and compliance requirements

---

## Getting Started

### Quick Start (5 Minutes)

1. **Open the Application**
   - Navigate to `http://localhost:3000` (development) or your deployed URL
   - You'll see the ReconForge dashboard with 8 navigation tabs

2. **Configure Your First Scan**
   - Click the **Scan Engine** tab
   - Enter target domain: `example.com`
   - Enter scope URL: `https://www.example.com`
   - Click **Launch Scan**

3. **Monitor Progress**
   - Watch the dashboard for real-time progress (0-100%)
   - Phase pipeline shows which scanning modules are active
   - Findings appear automatically as discovered

4. **Review Results**
   - Click **Vulnerabilities** tab to see findings
   - Click **Reports** tab to export results
   - Use **Calculators** to assess specific vulnerabilities

---

## Installation & Setup

### Prerequisites

- Node.js 18+ with npm/pnpm
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection for OSINT data gathering
- (Optional) Docker for containerized deployment

### Installation Methods

#### Method 1: Local Development

```bash
# Clone the repository
git clone https://github.com/sandesh-2/VAPT-Project.git
cd VAPT-Project

# Install dependencies
pnpm install
# or: npm install

# Configure environment (if needed)
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server
pnpm dev
# or: npm run dev

# Open browser to http://localhost:3000
```

#### Method 2: Production Build

```bash
# Build for production
pnpm build
# or: npm run build

# Start production server
pnpm start
# or: npm start
```

#### Method 3: Docker

```bash
# Build Docker image
docker build -t reconforge:latest .

# Run container
docker run -p 3000:3000 reconforge:latest

# Access at http://localhost:3000
```

### Environment Configuration

Create `.env.local` in project root:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000

# Optional: Analytics
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id

# Optional: Rate limiting
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX_REQUESTS=100
```

---

## Core Features

### 1. Dashboard

**Purpose**: Central hub for monitoring scan progress and viewing aggregated results

**Components**:
- Session overview (target, status, progress)
- Phase pipeline (visual representation of 15 scanning phases)
- Statistics cards (vulnerability counts by severity)
- Severity distribution chart
- Live terminal with real-time logs
- Findings summary table

**When to Use**:
- Monitor active scans in real-time
- Get quick overview of vulnerability distribution
- Track phase progression
- Check scan completion status

### 2. Scan Engine

**Purpose**: Configure and control scanning parameters

**Configuration Options**:
- **Target Domain**: Website to scan (e.g., example.com)
- **Scope URL**: Full URL within scope (e.g., https://www.example.com)
- **Scan Mode**: Passive (no active traffic) or Full (includes active probes)
- **Rate Limiting**: Requests per second (default: 5 RPS)
- **Advanced Options**:
  - Max crawl depth (default: 5 levels)
  - Crawl timeout (default: 300 seconds)
  - SSL/TLS verification toggle
  - Follow redirects toggle

**When to Use**:
- Before starting any vulnerability assessment
- To adjust scan parameters for specific targets
- When compliance or security policies require specific settings

**Example Configurations**:

```
Passive Scan (OSINT Only):
- Mode: Passive
- Target: example.com
- Scope: https://www.example.com
- Duration: 5-10 minutes
- Use When: Initial reconnaissance, avoiding active traffic

Comprehensive Active Scan:
- Mode: Full
- Target: example.com
- Scope: https://www.example.com
- Rate Limit: 3 RPS (for production systems)
- Crawl Depth: 3 levels
- Use When: Full security assessment, authorized testing
```

### 3. Passive Reconnaissance

**Purpose**: OSINT and passive information gathering without generating active traffic

**Phase Coverage** (Phases 1-2):
- DNS enumeration and record analysis
- Historical data lookup
- Public repository scanning
- SSL certificate analysis
- Subdomain discovery
- Technology stack fingerprinting

**Why It Exists**:
- Stealthy intelligence gathering
- Compliance with scanning policies
- Initial reconnaissance without alerting IDS/WAF
- Quick baseline assessment

**Data Displayed**:
- OSINT sources used
- Domains and subdomains discovered
- Technology stack identified
- Security configuration findings

### 4. Active Scanning

**Purpose**: Active security testing with controlled probes and vulnerability attempts

**Phase Coverage** (Phases 3-13):
- HTTP method detection
- Web crawling and spidering
- JavaScript analysis
- Form discovery and fuzzing
- SQL injection testing
- XSS vulnerability testing
- Directory enumeration
- Authentication bypass attempts
- Configuration testing
- API endpoint discovery
- Vulnerability verification

**Why It Exists**:
- Discover vulnerabilities that require active testing
- Verify configuration issues
- Test security controls
- Identify authentication/authorization flaws

**When to Use**:
- Authorized penetration testing engagements
- Full security assessments
- Systems outside production if policies restrict active testing
- After passive reconnaissance baseline

**Rate Limiting Best Practices**:
```
Production Systems:      1-3 RPS (minimize impact)
Staging/Dev Systems:     5-10 RPS
Lab Environments:        10-50 RPS (adjust to capacity)
```

### 5. Vulnerabilities Tab

**Purpose**: View, filter, and analyze all discovered findings

**Features**:
- **Severity Filtering**: By-button filtering (CRITICAL, HIGH, MEDIUM, LOW, INFO)
- **Vulnerability Details**: 
  - Title and description
  - CVSS v3.1 base score
  - CWE classification
  - OWASP category
  - Evidence and proof-of-concept
  - Recommended remediation

- **Risk Assessment**:
  - Severity rating (CRITICAL → INFO)
  - CVSS metric breakdown
  - Business impact assessment

**Workflow**:
1. Scan completes and findings populate
2. Filter by severity as needed
3. Click finding for detailed analysis
4. Review remediation recommendations
5. Add to reports or export

**Example Findings**:
```
CRITICAL:    SQL Injection in login form (CVSS 9.8)
HIGH:        Cross-Site Scripting in user profile (CVSS 7.2)
MEDIUM:      Weak password policy (CVSS 5.3)
LOW:         Missing security headers (CVSS 3.7)
INFO:        Technology fingerprinting (CVSS 0.0)
```

### 6. Calculators

#### 6a. CVSS v3.1 Calculator

**Purpose**: Calculate vulnerability severity scores using industry standard

**Base Metrics** (8 inputs):
- **Attack Vector** (AV): Network, Adjacent Network, Local, Physical
- **Attack Complexity** (AC): Low or High
- **Privileges Required** (PR): None, Low, or High
- **User Interaction** (UI): None or Required
- **Scope** (S): Unchanged or Changed
- **Confidentiality** (C): None, Low, or High
- **Integrity** (I): None, Low, or High
- **Availability** (A): None, Low, or High

**Output**:
- Base Score (0.0-10.0)
- Severity Rating (NONE → CRITICAL)
- Vector String (for documentation)
- Visual score gauge

**When to Use**:
- Manually score non-standard vulnerabilities
- Verify automated scoring
- Document security findings
- Communicate severity to stakeholders

**Example Calculation**:
```
SQL Injection vulnerability:
- Attack Vector: Network (any network)
- Complexity: Low (no special conditions)
- Privileges: None (unauthenticated attack)
- User Interaction: None (automatic exploit)
- Scope: Unchanged (only target affected)
- Confidentiality: High (all data readable)
- Integrity: High (all data modifiable)
- Availability: High (system shutdown possible)

Result: CVSS 9.8 CRITICAL
Vector: CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H
```

#### 6b. OWASP Impact Matrix

**Purpose**: Business impact assessment using OWASP methodology

**Threat Agent Factors** (4×4 grid):
- **Skill Level**: Low, Medium, High, Very High
- **Motive**: Low, Medium, High, Very High
- **Opportunity**: Low, Medium, High, Very High
- **Size**: Large, Medium, Small, Very Small

**Vulnerability Factors**:
- Ease of discovery (Easy → Very Hard)
- Ease of exploit (Easy → Very Hard)
- Awareness (High → Very Low)
- Intrusion detection capability (Easy → Very Hard)

**Output**:
- Likelihood rating (CRITICAL → NOTE)
- Technical impact score (1-3)
- Business impact score (1-3)
- Overall risk classification

**When to Use**:
- Prioritize vulnerabilities by business impact
- Present risk to non-technical stakeholders
- Justify remediation budget allocation
- Compliance risk assessment

---

## Feature Guide

### Working with the Dashboard

**Monitoring a Scan**:
1. Scan launches → Dashboard automatically shown
2. Progress bar shows percentage (0-100%)
3. Phase pipeline visualizes current active phases
4. Findings counter increments as vulnerabilities discovered
5. Risk score updates as new vulnerabilities found

**Understanding the Phase Pipeline**:
```
Passive Phases (1-2):      Blue      OSINT and passive discovery
Active Phases (3-13):      Orange    Active testing and probing
Post-scan (14-15):         Green     Analysis and reporting

Example Status:
[✓ Done] → [✓ Done] → [⟳ Running] → [ ] → [ ] → [ ] ... [⟳ Running]
Phase 1     Phase 2      Phase 3      P4   P5   P6 ...    Phase 15
```

**Understanding Statistics**:
- **Total Findings**: Sum of all discovered vulnerabilities
- **By Severity**: Breakdown (CRITICAL, HIGH, MEDIUM, LOW, INFO)
- **Risk Score**: Weighted average (100 = maximum risk)
- **Coverage**: % of target scanned

### Exporting Results

**When to Use Each Format**:

| Format | Use Case | Features |
|--------|----------|----------|
| **Markdown** | Email reports, documentation | Professional formatting, executive summary, technical details |
| **JSON** | API integration, tool automation | Complete metadata, structured data, easy parsing |
| **CSV** | Spreadsheet analysis, dashboards | Excel/Sheets compatible, findings list, severity tracking |

**Export Workflow**:
1. Complete scan → Go to Reports tab
2. Review findings summary
3. Click desired export format button
4. File downloads automatically
5. Use in external tools or share with team

**Export Contents**:
```markdown
# Scan Report
## Executive Summary
- Target: example.com
- Scan Date: 2024-07-09
- Vulnerabilities Found: 12
  - Critical: 2
  - High: 3
  - Medium: 5
  - Low: 2

## Findings
1. SQL Injection [CRITICAL, CVSS 9.8]
   CWE-89: SQL Injection
   ...remediation...
```

### Customizing Settings

**Available Settings** (9 total):

1. **Default Researcher Name**
   - Purpose: Add your name to reports
   - Example: "John Doe, Security Team"

2. **Rate Limit (requests/second)**
   - Range: 1-50 RPS
   - Recommendation: 5 RPS default, lower for production
   - Impact: Higher = faster but more load

3. **Max Crawl Depth**
   - Range: 1-10 levels
   - Default: 5
   - Impact: Deeper = more thorough but longer scan

4. **Crawl Timeout (seconds)**
   - Range: 30-3600 seconds
   - Default: 300 (5 minutes)
   - Impact: Longer = more complete crawling

5. **SSL/TLS Verification**
   - Toggle: ON/OFF
   - Default: ON
   - Use: OFF for self-signed certs in testing

6. **Follow Redirects**
   - Toggle: ON/OFF
   - Default: ON
   - Use: ON for typical websites

7. **DNS over HTTPS**
   - Toggle: ON/OFF
   - Default: OFF
   - Use: ON for privacy

8. **Scan Complete Notifications**
   - Toggle: ON/OFF
   - Default: ON
   - Notifies when scan finishes

9. **Critical Findings Alerts**
   - Toggle: ON/OFF
   - Default: ON
   - Alerts on CRITICAL discoveries

**Settings Persistence**:
- All settings auto-save to browser localStorage
- Settings persist across sessions
- Settings sync to next scan configurations
- Can import/export settings for team sharing

---

## Configuration

### Scan Modes

#### Passive Mode (OSINT Only)
```
Purpose:   Initial reconnaissance without active traffic
Duration:  5-15 minutes
Phases:    1-2 (DNS, Tech Stack, Historical Data)
Risk:      Minimal (no active attacks)
Detection: Unlikely to trigger security alerts

Configuration:
- Target Domain: example.com
- Scope URL: https://www.example.com
- Mode: Passive
- SSL Verification: ON
- Follow Redirects: ON
```

#### Full Mode (Passive + Active)
```
Purpose:   Comprehensive vulnerability assessment
Duration:  30-120 minutes depending on target
Phases:    1-15 (All phases including active testing)
Risk:      Moderate to High (active exploit attempts)
Detection: May trigger WAF/IDS alerts

Configuration:
- Target Domain: example.com
- Scope URL: https://www.example.com
- Mode: Full
- Rate Limit: 3-5 RPS (adjust for target stability)
- Crawl Depth: 3-5 levels
- Crawl Timeout: 5-10 minutes
```

### Rate Limiting Guidelines

```
Target Type          | Recommended RPS | Duration | Notes
--------------------|-----------------|----------|-------------------
Production Web App   | 1-2 RPS         | 1-2 hrs  | Minimal impact
Staging Environment  | 5-10 RPS        | 30-60 min| Higher tolerance
Lab/Testing System   | 10-50 RPS       | 10-30 min| No constraints
API Endpoint         | 2-5 RPS         | Varies   | Check rate limits
Database Server      | 1-3 RPS         | 1-2 hrs  | Monitor CPU
```

### Advanced Configuration

**For High-Security Environments**:
```
- Disable DNS over HTTPS (DNS logs required for compliance)
- Enable SSL Verification (validate certificates)
- Lower Rate Limit (1-2 RPS)
- Extend Crawl Timeout (10+ minutes)
- Set Max Crawl Depth: 2-3 (limit exposure)
```

**For Speed Optimization**:
```
- Enable DNS over HTTPS (faster DNS resolution)
- Increase Rate Limit (10-20 RPS if target allows)
- Reduce Max Crawl Depth (2-3 levels)
- Shorten Crawl Timeout (3-5 minutes)
- Disable Follow Redirects (if applicable)
```

---

## Workflows

### Workflow 1: Initial Security Assessment

**Goal**: Get baseline security posture of new target

**Steps**:
1. Start Passive scan (OSINT only)
   - Takes 5-15 minutes
   - No active traffic or alerts
   - Identifies technology stack

2. Review Passive findings
   - Check for exposed data
   - Note technology stack
   - Identify subdomains

3. Proceed to Active scan if appropriate
   - If passive found issues
   - If authorized by client/owner
   - After hours if production system

4. Export findings
   - CSV for team collaboration
   - Markdown for client report
   - JSON for tool integration

**Timeline**: 1-2 hours
**Complexity**: Low
**When to Use**: New target assessment

### Workflow 2: Compliance Audit

**Goal**: Generate audit report for compliance (SOC 2, ISO 27001, etc.)

**Steps**:
1. Configure scan with compliance settings
   - Enable SSL Verification (strict)
   - Set low rate limit (production safe)
   - Enable all notifications

2. Run Full scan
   - Complete all 15 phases
   - Comprehensive coverage
   - Duration: 2-4 hours

3. Collect findings
   - Export as JSON (for archive)
   - Export as Markdown (for presentation)

4. Generate compliance report
   - Include CVSS scores
   - OWASP mapping
   - Remediation timelines
   - Evidence collection

5. Document and archive
   - Store JSON export (7-year retention)
   - Share Markdown with stakeholders
   - Track remediation progress

**Timeline**: 4-6 hours
**Complexity**: Medium
**When to Use**: Annual audits, compliance deadlines

### Workflow 3: Remediation Verification

**Goal**: Verify fixes for previously found vulnerabilities

**Steps**:
1. Review previous scan report
   - Note all vulnerabilities
   - Identify critical issues
   - List affected components

2. Run targeted scan
   - Same configuration as before
   - Same target parameters
   - Full mode for verification

3. Compare findings
   - Decrease in overall count
   - Specific vulnerabilities resolved
   - No new critical issues

4. Validate fix quality
   - No bypasses detected
   - Remediation complete
   - Code review completed

5. Document verification
   - Export new report
   - Compare before/after
   - Sign off for release

**Timeline**: 2-3 hours
**Complexity**: Medium
**When to Use**: After development fixes

### Workflow 4: Continuous Monitoring

**Goal**: Regular security scans as part of DevSecOps

**Steps**:
1. Schedule regular scans
   - Weekly or monthly basis
   - Off-peak hours (staging)
   - Pre-deployment scans (production)

2. Automate export workflow
   - Export to shared location
   - Integrate with SIEM/dashboards
   - Auto-alert on CRITICAL

3. Track trends over time
   - Vulnerability count trends
   - Time-to-remediation metrics
   - Risk score trends

4. Generate trend reports
   - Monthly summaries
   - Stakeholder briefings
   - Team performance metrics

**Timeline**: 30 min setup, ongoing automation
**Complexity**: Medium
**When to Use**: Security-focused teams, DevOps integration

---

## Best Practices

### Before Scanning

1. **Get Authorization**
   - Written permission from system owner
   - Defined scope and time window
   - Emergency contact information

2. **Prepare Target**
   - Notify operations/support teams
   - Schedule off-peak hours
   - Backup critical data
   - Have rollback plan ready

3. **Configure Appropriately**
   - Match rate limit to target capacity
   - Set realistic crawl depth
   - Consider compliance requirements

### During Scanning

1. **Monitor Progress**
   - Watch dashboard for issues
   - Check for WAF/IDS triggers
   - Verify crawler not misbehaving

2. **Adjust if Needed**
   - Can pause/resume scans
   - Stop if target degradation occurs
   - Note any system impacts

3. **Document Unusual Behavior**
   - Crashes or errors
   - Unexpected findings
   - System alerts triggered

### After Scanning

1. **Verify Results**
   - Spot-check findings accuracy
   - Verify no false positives
   - Test exploit PoCs manually

2. **Prioritize Findings**
   - Focus on CRITICAL first
   - Group by affected systems
   - Consider business impact

3. **Plan Remediation**
   - Assign ownership
   - Set timelines by severity
   - Track progress
   - Verify fixes

### Security Best Practices

1. **Target Scope**
   - Only scan authorized systems
   - Respect scope boundaries
   - Document all targets
   - Get re-authorization if expanding scope

2. **Data Protection**
   - Secure scan reports
   - Limit report distribution
   - Archive findings securely
   - Comply with retention policies

3. **Tool Security**
   - Keep ReconForge updated
   - Review security advisories
   - Run in isolated environments if testing
   - Monitor for unauthorized access

---

## Troubleshooting

### Common Issues

#### "Scan Won't Launch"

**Symptom**: Click Launch Scan, nothing happens

**Solutions**:
1. Verify form inputs
   - Target domain must be filled
   - Scope URL must be valid
   - Both required for launch

2. Check browser console
   - Look for JavaScript errors
   - Report errors for debugging

3. Try again
   - Refresh page
   - Clear browser cache
   - Try different browser

**Example**:
```
ERROR: Fill in both Target Domain and Scope URL
✓ FIX: Enter "example.com" and "https://www.example.com"
```

#### "Scan Stops Mid-Way"

**Symptom**: Scan running, then stops before completion

**Causes & Solutions**:
1. Rate limit too high
   - Solution: Reduce RPS setting
   - Try: 2-3 RPS for stability

2. Target server issues
   - Solution: Check if target is responding
   - Wait and retry if server recovering

3. Network connectivity
   - Solution: Verify internet connection
   - Check firewall rules

4. Browser crash
   - Solution: Reopen app
   - Scan progress saved, can't resume partially

**Prevention**:
```
- Start with conservative settings (2-3 RPS)
- Increase gradually if stable
- Monitor target response times
- Have fallback network connection
```

#### "Findings Look Incorrect"

**Symptom**: Finding descriptions or CVSS scores seem wrong

**Investigation Steps**:
1. Verify target is as described
   - May have changed since scan
   - Staging vs production mix-up

2. Check CVSS vector
   - Review individual metrics
   - Use calculator to verify

3. Review evidence
   - Look at actual HTTP requests/responses
   - May be false positive or legitimate finding

4. Test manually
   - Reproduce vulnerability manually
   - Verify exploit works

**If Genuinely Incorrect**:
- Document the issue
- Report with screenshot
- Include target, finding, and evidence

#### "Settings Not Saving"

**Symptom**: Change setting, reload page, reverted to default

**Causes & Solutions**:
1. Browser localStorage disabled
   - Solution: Enable in browser settings
   - Check privacy/cookie settings

2. Private/Incognito mode
   - Solution: Use normal browsing mode
   - Incognito doesn't persist storage

3. Browser cache issues
   - Solution: Clear cache, cookies
   - Try different browser

**Verification**:
```
1. Change a setting (e.g., Rate Limit to 10)
2. Reload page (Ctrl+R or Cmd+R)
3. Check if Rate Limit = 10
✓ If yes: Settings working
✗ If no: Browser storage issue
```

#### "Export File Corrupted"

**Symptom**: Export button clicked, nothing downloads or file corrupted

**Solutions**:
1. Try different format
   - JSON might work if CSV fails
   - Markdown usually most reliable

2. Check browser settings
   - Download location writable
   - Enough disk space available
   - Pop-ups not blocked

3. Try different browser
   - Helps isolate browser issue
   - Firefox/Chrome/Safari/Edge

**Manual Alternative**:
```
1. Go to Reports tab
2. Select all report text (Ctrl+A)
3. Copy (Ctrl+C)
4. Paste in text editor
5. Save as .txt or .md
```

### Performance Issues

#### "Dashboard Loading Slowly"

**Solutions**:
1. Reduce visible findings
   - Use severity filter
   - Hide low priority items

2. Close unnecessary tabs
   - Reduce browser memory usage
   - Free up CPU for rendering

3. Refresh page
   - Clear memory leaks
   - Fresh state

**System Requirements**:
```
Minimum:    4GB RAM, 2 core CPU, Chrome/Firefox
Recommended: 8GB RAM, 4 core CPU, Latest browser
Optimal:    16GB RAM, 8 core CPU, SSD storage
```

#### "Scan Completes but Findings Not Showing"

**Solutions**:
1. Refresh page
   - Data cached, refresh reloads

2. Wait a moment
   - UI updates can take time
   - Especially with many findings

3. Check different tabs
   - Findings might be in Vulnerabilities tab
   - Not all in Dashboard

### Getting Help

**Information to Provide**:
- ReconForge version
- Browser and version
- Target domain (if shareable)
- Exact error message or screenshot
- Steps to reproduce
- System specifications (RAM, CPU, OS)

**Debug Mode**:
- Open browser Developer Tools (F12)
- Check Console tab for errors
- Take screenshot of error
- Include in bug report

---

## FAQ

**Q: Is ReconForge free?**
A: ReconForge is an open-source project. Deployment is free, though hosting costs may apply.

**Q: Can I scan production systems?**
A: Yes, with proper authorization and rate limiting. Use conservative settings (1-3 RPS) to minimize impact.

**Q: What's included in the CVSS score?**
A: Base metrics for attack conditions (8 metrics total). Temporal and environmental metrics available in calculator but not auto-calculated.

**Q: How long do scans take?**
A: Passive: 5-15 min. Full: 30-120 min depending on target size and rate limit.

**Q: Can I pause and resume scans?**
A: Scans are continuous. Can stop and restart with fresh scan. Progress not saved between sessions.

**Q: What if I find a vulnerability that's already patched?**
A: Likely false positive. Verify manually. Report to dev team for false positive tracking.

**Q: How many targets can I scan simultaneously?**
A: One at a time in single instance. Deploy multiple instances for parallel scanning.

---

## Additional Resources

- [CVSS v3.1 Calculator Guide](https://www.first.org/cvss/v3.1/)
- [OWASP Risk Rating Methodology](https://owasp.org/www-community/Risk_Rating_Methodology)
- [CWE Database](https://cwe.mitre.org/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [ReconForge GitHub](https://github.com/sandesh-2/VAPT-Project)

---

**Version**: 1.0  
**Last Updated**: July 9, 2024  
**Next Review**: January 9, 2025
