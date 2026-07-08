# ReconForge - Troubleshooting & FAQ Guide

## Quick Navigation

- [FAQ - Frequently Asked Questions](#faq)
- [Troubleshooting by Issue](#troubleshooting-by-issue)
- [Common Problems & Solutions](#common-problems--solutions)
- [Performance Optimization](#performance-optimization)
- [Getting Help](#getting-help)

---

## FAQ

### General Questions

**Q: What is ReconForge?**
A: ReconForge is a comprehensive vulnerability assessment and penetration testing (VAPT) platform that performs both passive OSINT and active security scanning to identify vulnerabilities in web applications and infrastructure.

**Q: Is ReconForge free?**
A: Yes, ReconForge is open-source and free to use. You only pay for hosting infrastructure if deploying on cloud services.

**Q: What systems can I scan?**
A: You can scan any web application or website. Passive scans work on anything accessible from the internet. Active scans work on systems you control or have explicit authorization to test.

**Q: Do I need special permissions to use ReconForge?**
A: For active scanning, yes—always get written authorization from the system owner before testing. Passive OSINT may have fewer restrictions depending on your organization's policy.

**Q: What's the difference between modes?**
A: **Passive** = OSINT only (no active traffic, 5-15 min). **Active** = Active testing only (faster, probing traffic). **Full** = Both passive and active (most comprehensive, 30-120 min).

**Q: How long do scans take?**
A: Depends on target size and mode:
- Passive OSINT: 5-15 minutes
- Active only: 15-60 minutes
- Full scan: 30-120 minutes

**Q: What about false positives?**
A: ReconForge may report false positives. Always verify findings manually before taking action. Report false positives for pattern improvement.

**Q: Can I scan production systems?**
A: Yes, but use conservative settings:
- Rate limit: 1-3 RPS (very low)
- Crawl depth: 2-3 levels (limited scope)
- Schedule during low-traffic hours
- Monitor system performance during scan

**Q: What's included in the CVSS score?**
A: CVSS v3.1 base score (8 metrics): Attack Vector, Complexity, Privileges, User Interaction, Scope, Confidentiality, Integrity, Availability.

**Q: Do you support other scoring systems?**
A: Currently CVSS v3.1 is primary. OWASP Risk Rating methodology also available as alternative assessment.

**Q: Can I export results?**
A: Yes, three formats:
- **Markdown**: Professional reports, email
- **JSON**: Automation, tool integration
- **CSV**: Spreadsheets, dashboards

**Q: What file formats are supported?**
A: Export to Markdown (.md), JSON (.json), or CSV (.csv). All generated on-demand from scan data.

**Q: Are results stored on a server?**
A: No, ReconForge is client-side only. Results exist in your browser memory and exported files. Nothing uploaded to external servers.

**Q: Can I access results offline?**
A: No, the app requires internet. But exported files (.json, .md, .csv) can be viewed offline.

**Q: How do I secure my reports?**
A: Store exported files in secure locations. Encrypted storage recommended. Never commit to public repos. Consider access controls and data classifications.

**Q: Is there an API?**
A: Not currently. The platform is browser-based. API roadmap under development.

**Q: Can I automate scanning?**
A: Export to JSON and integrate with external tools/scripts for automation. Direct API automation coming in future versions.

**Q: Does ReconForge work on mobile?**
A: Not recommended. Desktop/laptop recommended for full functionality. Mobile browsers may have limitations.

**Q: What browsers are supported?**
A: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+. Tested on latest versions of all major browsers.

---

## Troubleshooting by Issue

### Installation & Setup

#### Problem: "npm install fails"

**Symptoms**: Error during package installation

**Solutions**:

1. **Clear cache**
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Use correct Node version**
   ```bash
   node --version  # Should be 18+
   nvm use 18      # Use Node Version Manager
   ```

3. **Check disk space**
   ```bash
   df -h           # Verify free space (need 2GB+)
   ```

4. **Use pnpm instead**
   ```bash
   npm install -g pnpm
   pnpm install    # More efficient than npm
   ```

**If problem persists**:
- Check GitHub issues: https://github.com/sandesh-2/VAPT-Project/issues
- Include error message and system info in bug report

---

#### Problem: "Port 3000 already in use"

**Symptom**: 
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solutions**:

1. **Kill existing process**
   ```bash
   # macOS/Linux
   lsof -ti:3000 | xargs kill -9
   
   # Windows (PowerShell)
   Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
   ```

2. **Use different port**
   ```bash
   PORT=3001 pnpm dev
   # Access at http://localhost:3001
   ```

3. **Find what's using port**
   ```bash
   netstat -tuln | grep 3000   # Linux
   lsof -i :3000               # macOS
   netstat -ano | findstr :3000 # Windows
   ```

---

#### Problem: "Environment variables not loading"

**Symptom**: App not using .env.local values

**Solutions**:

1. **Verify .env.local exists**
   ```bash
   ls -la .env.local    # Check if file exists
   cat .env.local       # View contents
   ```

2. **Correct format**
   ```bash
   # ✓ Correct
   NEXT_PUBLIC_API_URL=http://localhost:3000
   NODE_ENV=development
   
   # ✗ Wrong
   NEXT_PUBLIC_API_URL = http://localhost:3000  # Space before =
   NEXT_PUBLIC_API_URL='http://localhost:3000' # Quotes
   ```

3. **Restart dev server**
   ```bash
   # Stop: Ctrl+C
   pnpm dev  # Restart
   ```

4. **Clear Next.js cache**
   ```bash
   rm -rf .next
   pnpm dev  # Rebuild
   ```

---

### Scanning Issues

#### Problem: "Scan won't launch"

**Symptoms**: Click Launch Scan, nothing happens

**Solutions**:

1. **Check form inputs**
   - Target domain must not be empty
   - Scope URL must be valid
   - Example: `example.com` and `https://www.example.com`

2. **Check browser console**
   - Press F12 → Console tab
   - Look for errors
   - Screenshot errors for reporting

3. **Verify network connection**
   ```bash
   ping example.com  # Test connectivity
   ```

4. **Try different browser**
   - Rules out browser-specific issues
   - Test in Chrome, Firefox, Safari

5. **Clear cache**
   - Clear browser cache
   - Clear localStorage
   - Refresh page (Ctrl+F5)

**Debug Mode**:
```javascript
// Open browser console (F12)
// Check for errors related to scan launch
console.log(localStorage.getItem('reconforge-settings'))
```

---

#### Problem: "Scan stops mid-way"

**Symptoms**: Scan starts (progress 0-50%), then stops

**Causes & Solutions**:

1. **Rate limit too high**
   - Causes target to timeout
   - **Solution**: Reduce RPS in settings
   ```
   Try: 2-3 RPS for stability
   Current setting too high
   ```

2. **Target server crashed**
   - Check if target is responding
   - **Solution**: 
     - Verify target is online
     - Check with: `curl -I https://target.com`
     - Wait for target to recover
     - Restart scan

3. **Network interruption**
   - Internet connection dropped
   - **Solution**:
     - Verify connectivity: `ping google.com`
     - Restart router if needed
     - Try again with lower RPS

4. **Browser crashed**
   - Browser tab closed or crashed
   - **Solution**:
     - Cannot resume partial scans
     - Create new scan with same settings
     - Settings saved, config reused

5. **Memory exhaustion**
   - Too many findings loaded
   - **Solution**:
     - Close other browser tabs
     - Restart browser
     - Try smaller target scope

**Prevention**:
```
- Start with conservative settings (2 RPS)
- Increase gradually if stable
- Monitor target response times
- Keep browser memory clear
```

---

#### Problem: "Findings look incorrect"

**Symptoms**: CVSS scores wrong, findings descriptions don't match target

**Investigation Steps**:

1. **Verify target**
   ```
   Is this the right target?
   - Check domain spelling
   - Check scope URL matches
   - Confirm correct environment (prod vs staging)
   ```

2. **Review CVSS vector**
   ```
   Click finding → View details
   Check: CVSS:3.1/AV:N/AC:L/...
   Verify each metric makes sense
   Use calculator to independently verify
   ```

3. **Test manually**
   ```
   Try to reproduce vulnerability manually
   Use tools like curl, Postman, or browser
   Verify if actual vulnerability or false positive
   ```

4. **Check evidence**
   ```
   Review proof-of-concept
   HTTP request/response shown
   May clarify false positive
   ```

**If Genuinely Incorrect**:
1. Document finding ID
2. Note target and what was wrong
3. Create issue on GitHub
4. Include screenshot and evidence
5. Describe expected vs actual behavior

---

#### Problem: "No findings reported"

**Symptoms**: Scan completes but shows 0 findings

**Causes & Solutions**:

1. **Target very secure**
   - Well-hardened systems may have few findings
   - **Solution**: Verify scan completed all phases
   - Check dashboard for phase 14-15 (should be done)

2. **Scope too narrow**
   - Crawl depth only 1-2 levels
   - **Solution**: Increase crawl depth
   - Re-run scan with depth: 5

3. **Detection patterns need updating**
   - Patterns database outdated
   - **Solution**: Check latest patterns
   - Submit new pattern if needed

4. **Mode set to passive only**
   - Passive OSINT may find fewer vulns
   - **Solution**: Use 'full' mode
   - Includes active testing

5. **False negatives**
   - Scanner may not detect specific vulns
   - **Solution**: Test manually
   - Report if known vulnerability not detected

---

### Settings Issues

#### Problem: "Settings not saving"

**Symptoms**: Change setting, reload page, reverts to default

**Causes & Solutions**:

1. **Browser localStorage disabled**
   - **Solution**: Enable localStorage
   - Settings → Privacy → Storage
   - Allow site to store data

2. **Incognito/Private mode**
   - localStorage cleared on close
   - **Solution**: Use normal browsing mode
   - Incognito inherently temporary

3. **Browser restrictions**
   - Some browsers restrict storage
   - **Solution**:
     - Check browser permissions
     - Try different browser
     - Check cookie settings

4. **Corrupted localStorage**
   - Data corrupted or exceeds limit
   - **Solution**:
     ```bash
     # Chrome DevTools (F12) → Application → Storage
     # Delete localStorage entry
     # Refresh page and reconfigure
     ```

**Verification Test**:
```
1. Change Rate Limit to 10 RPS
2. Reload page (Ctrl+R)
3. Check Settings tab
4. Rate Limit should still be 10
✓ If yes: Working correctly
✗ If no: Browser storage issue
```

---

#### Problem: "Export button does nothing"

**Symptoms**: Click export button, no file downloads

**Causes & Solutions**:

1. **Pop-ups blocked**
   - Browser blocked file download
   - **Solution**:
     - Allow pop-ups for site
     - Browser → Settings → Permissions → Pop-ups
     - Reload and try again

2. **Downloads folder unavailable**
   - Default download location not writable
   - **Solution**:
     - Check folder permissions
     - Change download location
     - Ensure disk space available (100+ MB)

3. **Browser cache issue**
   - Corrupted cache
   - **Solution**:
     - Clear browser cache
     - Try different browser
     - Try incognito/private mode

4. **No findings to export**
   - Scan must have findings to export
   - **Solution**:
     - Complete full scan first
     - Or start new scan
     - Report tab won't export empty sessions

**Manual Alternative**:
```
1. Go to Reports tab
2. Select all text (Ctrl+A)
3. Copy (Ctrl+C)
4. Open text editor (Notepad, VSCode)
5. Paste (Ctrl+V)
6. Save as report.txt
7. Can convert to .md or import elsewhere
```

---

### Performance Issues

#### Problem: "Dashboard very slow"

**Symptoms**: Dashboard takes 5-10 seconds to load, sluggish interactions

**Solutions**:

1. **Too many findings**
   - Thousands of findings = slow rendering
   - **Solution**: Use severity filters
   ```
   Click: Show only CRITICAL + HIGH
   Reduces data by 80%+
   Dramatically improves speed
   ```

2. **Close unnecessary tabs**
   - Each tab uses memory
   - **Solution**:
     - Close other browser tabs
     - Free up RAM
     - Focus on ReconForge

3. **Browser memory leak**
   - Long session causes slowdown
   - **Solution**:
     - Refresh page (F5)
     - Or restart browser
     - Clears memory

4. **Hardware limitation**
   - Insufficient system resources
   - **Solution**: Check specs
   ```
   Minimum: 4GB RAM
   Recommended: 8GB RAM
   Optimal: 16GB+ RAM
   
   Current specs may be limiting
   Consider hardware upgrade
   ```

**System Optimization**:
```bash
# Check system resources
top          # Linux/macOS
tasklist     # Windows

# Monitor while using ReconForge
Check CPU usage
Check memory usage
Should stay <80%
```

---

#### Problem: "Scan completes but findings not showing"

**Symptoms**: Scan shows 100% complete but 0 findings in dashboard

**Solutions**:

1. **UI not updated yet**
   - Takes a moment to render many findings
   - **Solution**: Wait 5-10 seconds
   - Check again if still 0
   - Try tab navigation

2. **Refresh page**
   - Force data reload
   - **Solution**: Press F5 or Ctrl+R
   - Restart browser if needed

3. **Check different tabs**
   - Findings may be in Vulnerabilities tab
   - **Solution**:
     - Click Vulnerabilities tab
     - Check if findings there
     - May have filtering applied

4. **Filter applied**
   - May be hiding findings
   - **Solution**:
     - Check severity filter buttons
     - Ensure not filtering to 0
     - Click "ALL" if available

---

### Data Export Issues

#### Problem: "Exported file corrupted or empty"

**Symptoms**: File downloads but can't open or is empty

**Solutions**:

1. **Try different format**
   - Specific format might be broken
   - **Solution**:
     ```
     Try: JSON instead of CSV
     Try: CSV instead of Markdown
     Try: Markdown instead of JSON
     
     One format usually works
     ```

2. **Try different browser**
   - Browser-specific export issue
   - **Solution**:
     - Try Firefox if using Chrome
     - Try Safari if using Firefox
     - Browser might not support feature

3. **Use manual export**
   - As backup method
   - **Solution**:
     ```
     1. Select all report text (Ctrl+A)
     2. Copy (Ctrl+C)
     3. Paste in text editor
     4. Save as .txt
     5. Can rename to .md or .json
     ```

4. **Check file size**
   - Might be too large
   - **Solution**:
     ```bash
     ls -lh report.json  # Check size
     
     Very large files (100MB+) might fail
     Try reducing findings or filtering
     Export in smaller batches
     ```

---

## Common Problems & Solutions

### General Crashes

**Symptom**: App suddenly stops working

**Check List**:
- [ ] Refresh browser (F5)
- [ ] Check console for errors (F12)
- [ ] Close other browser tabs
- [ ] Restart browser
- [ ] Clear browser cache
- [ ] Try different browser
- [ ] Restart computer
- [ ] Check internet connection

---

### Network Issues

**Symptom**: Target not responding, scan fails

**Check List**:
- [ ] Verify target domain is correct
- [ ] Check target is online: `ping target.com`
- [ ] Try from command line: `curl https://target.com`
- [ ] Check internet connection: `ping 8.8.8.8`
- [ ] Try VPN if geographic blocking suspected
- [ ] Reduce rate limit if target times out

---

### Security Issues

**Symptom**: Warning or security error during scan

**Response**:
- [ ] Note the specific warning
- [ ] Check target's SSL certificate validity
- [ ] If production: verify scope carefully
- [ ] Follow your organization's policies
- [ ] Document authorization if active testing

---

## Performance Optimization

### Browser-Level Optimization

```
Chrome/Edge:
- Settings → Performance → Enable performance savings
- Close unused tabs
- Clear browsing data regularly

Firefox:
- about:config → performance.profile_enabled → true
- Disable auto-play media
- Limit cache size

Safari:
- Preferences → Privacy → Limit tracking
- Disable extensions during scanning
```

### Application-Level Optimization

```
Settings Optimization:
1. Set low rate limit for first scan (2-3 RPS)
2. Use passive mode initially
3. Gradually increase rate limit if stable

Scan Optimization:
1. Reduce crawl depth for initial scans
2. Limit crawl timeout (5-10 min)
3. Focus on critical areas first
```

---

## Getting Help

### Before Seeking Help

1. **Try troubleshooting above**
   - Check this guide for your issue
   - Often self-resolvable

2. **Check GitHub Issues**
   - https://github.com/sandesh-2/VAPT-Project/issues
   - May already be reported

3. **Search documentation**
   - USER_GUIDE.md (user features)
   - DEVELOPER_GUIDE.md (technical)
   - API_REFERENCE.md (function details)

### When Reporting Issues

**Include**:
- ReconForge version (check About)
- Browser and version (about:)
- Operating system (Windows, macOS, Linux)
- Exact error message or screenshot
- Steps to reproduce
- System specs (RAM, CPU, storage)
- What you've already tried

**Example Good Report**:
```
Title: Scan stops at Phase 5 with timeout

ReconForge: v4.0
Browser: Chrome 126.0
OS: macOS 14.5
System: 8GB RAM, M1 processor

Steps to reproduce:
1. Enter target: example.com
2. Scope: https://www.example.com
3. Mode: Full
4. Rate limit: 10 RPS
5. Click Launch Scan

Result: Scan runs, progress shows 35%, Phase 5 starts, 
then stops after ~5 minutes with no error message.

Already tried:
- Reduced rate limit to 5 RPS (same result)
- Cleared browser cache
- Tried in Firefox (same result)
```

### Getting Support

**Resources**:
- GitHub Issues: Bug reports and feature requests
- Documentation: In-depth guides
- Community: See Issues section for discussions

**Response Time**:
- Critical bugs: 24-48 hours
- Normal issues: 1-2 weeks
- Feature requests: Reviewed monthly

---

## Additional Resources

- [Official GitHub Repository](https://github.com/sandesh-2/VAPT-Project)
- [Next.js Troubleshooting](https://nextjs.org/docs/messages)
- [React Error Boundary](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [CVSS Calculator](https://www.first.org/cvss/calculator/3.1)
- [OWASP Documentation](https://owasp.org/)

---

**Version**: 1.0  
**Last Updated**: July 9, 2024  
**Next Update**: January 9, 2025
