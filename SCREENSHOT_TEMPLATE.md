# Screenshot Template - What to Capture

Use this as a checklist when taking screenshots for each product.

## 🎯 General Guidelines

- **Viewport:** 1920x1080 pixels
- **Browser:** Use Chrome, Firefox, or Safari
- **Theme:** Light mode (unless product has dark mode)
- **Data:** Use realistic test data (no real secrets)

## 📸 SurfaceAI Screenshots

### 1. dashboard.png
**What to show:**
- Main dashboard with stat cards (Total Findings, Critical, High, Open)
- List of repositories on the left
- Recent critical findings on the right
- Clean, organized layout

**How to capture:**
1. Login and navigate to dashboard
2. Ensure you have at least 2-3 repositories added
3. Have some findings (mix of severities)
4. Set viewport to 1920x1080
5. Capture full page

### 2. repositories.png
**What to show:**
- Repository list with cards
- Each repo showing: name, URL, last scan time
- "Scan Now" buttons visible
- "Add Repository" button at top

**How to capture:**
1. Navigate to Attack Surface page
2. Have 3-5 repositories added
3. Show both active and inactive repos
4. Capture the repository section

### 3. findings.png
**What to show:**
- List of security findings
- Color-coded severity badges (red=critical, orange=high)
- AI explanations visible
- Status dropdowns
- Search and filter options

**How to capture:**
1. Navigate to findings section
2. Have findings with different severities
3. Show at least 3-4 findings
4. Ensure AI explanations are visible

### 4. remediation.png
**What to show:**
- Finding detail view
- "View Remediation PR" link
- Or modal showing remediation steps
- GitHub PR preview if possible

**How to capture:**
1. Click on a finding
2. Show remediation options
3. If PR exists, show the link/button

### 5. add-repo.png
**What to show:**
- "Add Repository" modal/form
- Form fields: repo name, URL, GitHub token
- Submit and cancel buttons
- Clean, modern modal design

**How to capture:**
1. Click "Add Repository" button
2. Modal should be open
3. Capture the modal centered on screen

## 📸 LogCopilot Screenshots

### 1. dashboard.png
**What to show:**
- Log sources overview
- Anomalies summary
- Recent activity
- Stats cards

### 2. sources.png
**What to show:**
- List of configured log sources
- Source types (API, S3, OpenTelemetry)
- Active/inactive status
- "Add Log Source" button

### 3. anomalies.png
**What to show:**
- List of detected anomalies
- Severity indicators
- AI explanations
- Playbook suggestions
- Status filters

### 4. query.png
**What to show:**
- Natural language query interface
- Example queries
- Results display
- AI-powered responses

## 📸 VPC Guardian Screenshots

### 1. dashboard.png
**What to show:**
- Cloud accounts overview
- Network findings summary
- Threat indicators
- Stats cards

### 2. accounts.png
**What to show:**
- List of cloud accounts (AWS, GCP, Azure)
- Account details
- Sync status
- "Add Cloud Account" button

### 3. findings.png
**What to show:**
- Network security findings
- Source/destination IPs
- Protocol information
- AI explanations
- Severity badges

### 4. traffic.png
**What to show:**
- Network traffic visualization
- Flow diagrams
- Connection graphs
- Traffic patterns

## 📸 PentestGPT Screenshots

### 1. dashboard.png
**What to show:**
- Active testing sessions
- Recent findings
- Session statistics
- Quick actions

### 2. sessions.png
**What to show:**
- List of pentest sessions
- Target URLs
- Session status
- "New Session" button

### 3. findings.png
**What to show:**
- Vulnerability findings list
- Severity indicators
- Executive summaries
- Technical details
- Remediation steps

### 4. copilot.png
**What to show:**
- AI copilot interface
- Testing suggestions
- Vulnerability chaining
- Interactive chat

## 📸 SMB Security Suite Screenshots

### 1. dashboard.png
**What to show:**
- Unified dashboard
- All 4 products visible
- Cross-product statistics
- Recent critical findings from all products
- Navigation sidebar

### 2. integration.png
**What to show:**
- How products work together
- Cross-product correlation
- Unified alerts
- Integration settings

### 3. compliance.png
**What to show:**
- Compliance reporting
- SOC 2, ISO 27001 views
- Compliance scores
- Report generation

## 🎨 Design Tips

1. **Consistent Data:**
   - Use same test data across screenshots
   - Consistent naming (e.g., "test-repo-1", "test-repo-2")
   - Realistic but fake data

2. **Color Coding:**
   - Ensure severity colors are visible
   - Critical = Red
   - High = Orange
   - Medium = Yellow
   - Low = Blue

3. **Empty States:**
   - Consider showing one "empty state" screenshot
   - Shows what users see when starting fresh

4. **Loading States:**
   - Can show loading indicators
   - Demonstrates smooth UX

5. **Mobile View (Optional):**
   - Consider mobile screenshots
   - Shows responsive design

## 📐 Browser Settings

### Recommended Settings:
- **Zoom:** 100% (no zoom)
- **DevTools:** Closed (unless showing responsive view)
- **Extensions:** Disable or hide
- **Theme:** Light mode
- **Font Size:** Default

### Viewport Setup:
1. Open DevTools (F12)
2. Toggle device toolbar (Cmd+Shift+M)
3. Set custom dimensions: 1920x1080
4. Refresh page
5. Take screenshot

## ✅ Quality Checklist

Before saving each screenshot:

- [ ] Resolution is 1920x1080
- [ ] No sensitive data visible
- [ ] Good contrast and readability
- [ ] Consistent with other screenshots
- [ ] File size reasonable (< 500KB)
- [ ] Named correctly
- [ ] Saved in correct directory

---

**Ready to start?** Use the `add-screenshots.sh` script to get started!

