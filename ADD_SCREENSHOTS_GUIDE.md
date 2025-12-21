# Guide: Adding UX/UI Screenshots to Repositories

This guide will help you add screenshots to all 5 security product repositories.

## 📸 Screenshot Requirements

### Required Screenshots for Each Product

#### 1. SurfaceAI
- `dashboard.png` - Main dashboard with repositories and findings
- `repositories.png` - Repository management interface
- `findings.png` - Security findings list with AI explanations
- `remediation.png` - Auto-generated remediation PR view
- `add-repo.png` - Add repository modal/form

#### 2. LogCopilot
- `dashboard.png` - Log sources and anomalies overview
- `sources.png` - Log source configuration
- `anomalies.png` - Detected anomalies with explanations
- `query.png` - Natural language query interface

#### 3. VPC Guardian
- `dashboard.png` - Cloud accounts and network overview
- `accounts.png` - Cloud account management
- `findings.png` - Network security findings
- `traffic.png` - Network traffic visualization

#### 4. PentestGPT
- `dashboard.png` - Testing sessions overview
- `sessions.png` - Session management
- `findings.png` - Vulnerability findings
- `copilot.png` - AI copilot interface

#### 5. SMB Security Suite
- `dashboard.png` - Unified dashboard showing all products
- `integration.png` - Product integration view
- `compliance.png` - Compliance reporting

## 🎨 Screenshot Specifications

### Technical Requirements
- **Format:** PNG (preferred) or JPG
- **Resolution:** Minimum 1920x1080 (Full HD)
- **Aspect Ratio:** 16:9
- **File Size:** Keep under 500KB (optimize if needed)
- **Naming:** Use lowercase with hyphens (e.g., `dashboard.png`)

### Quality Guidelines
- ✅ Clean, professional appearance
- ✅ No sensitive data visible
- ✅ Consistent styling across screenshots
- ✅ Good contrast and readability
- ✅ Browser UI can be included (or cropped)

## 📝 Step-by-Step Process

### Option 1: Using Browser Screenshots

1. **Start the Application**
   ```bash
   cd surfaceai  # or any product directory
   docker-compose up -d
   # Wait for services to start
   # Access at http://localhost:3000
   ```

2. **Set Browser Viewport**
   - Open browser DevTools (F12)
   - Toggle device toolbar (Cmd+Shift+M / Ctrl+Shift+M)
   - Set custom dimensions: 1920x1080
   - Refresh page

3. **Take Screenshots**
   - Navigate to each page
   - Use browser screenshot tools:
     - **Chrome/Edge:** Full page screenshot (Cmd+Shift+P → "Capture full size screenshot")
     - **Firefox:** Full page screenshot (Cmd+Shift+S)
     - **Safari:** Use built-in screenshot tool

4. **Save Screenshots**
   - Save directly to `screenshots/` directory
   - Name files according to the list above
   - Optimize if needed (use TinyPNG.com or similar)

### Option 2: Using Screenshot Tools

**Recommended Tools:**
- **CleanShot X** (Mac) - Professional screenshots
- **ShareX** (Windows) - Free and powerful
- **Flameshot** (Linux) - Open source
- **Lightshot** - Cross-platform

**Steps:**
1. Set capture area to 1920x1080
2. Capture each page/component
3. Save to `screenshots/` directory
4. Name files appropriately

### Option 3: Using Command Line (Mac)

```bash
# Take screenshot of specific area
screencapture -R x,y,width,height screenshot.png

# Or use screencapture with delay
screencapture -T 3 screenshot.png
```

## 🚀 Quick Script to Add Screenshots

I'll create a helper script to make this easier:

```bash
# The script will be created below
```

## 📁 File Structure

After adding screenshots, your structure should look like:

```
surfaceai/
├── screenshots/
│   ├── README.md
│   ├── dashboard.png
│   ├── repositories.png
│   ├── findings.png
│   ├── remediation.png
│   └── add-repo.png
```

## ✅ Checklist for Each Repository

- [ ] Start the application locally
- [ ] Navigate to each page/feature
- [ ] Take screenshots at 1920x1080 resolution
- [ ] Save to `screenshots/` directory
- [ ] Optimize file sizes (< 500KB)
- [ ] Commit screenshots to git
- [ ] Push to GitHub
- [ ] Update README.md to reference screenshots

## 🔧 Optimizing Screenshots

### Using ImageMagick (Command Line)

```bash
# Install ImageMagick
brew install imagemagick  # Mac
# or
apt-get install imagemagick  # Linux

# Optimize PNG
convert screenshot.png -quality 85 -strip screenshot-optimized.png

# Resize if needed
convert screenshot.png -resize 1920x1080 screenshot-resized.png
```

### Using Online Tools

- **TinyPNG:** https://tinypng.com/
- **Squoosh:** https://squoosh.app/
- **Compressor.io:** https://compressor.io/

## 📤 Adding Screenshots to GitHub

### For Each Repository:

```bash
cd surfaceai  # or product name
git add screenshots/*.png
git commit -m "Add UX/UI screenshots"
git push origin master
```

### Or Use the Helper Script:

```bash
./add-screenshots.sh surfaceai
```

## 🎯 Tips for Great Screenshots

1. **Use Test Data**
   - Create sample repositories, findings, etc.
   - Use realistic but fake data
   - No real credentials or secrets

2. **Consistent Styling**
   - Use same browser/theme
   - Same viewport size
   - Similar data density

3. **Show Key Features**
   - Highlight main functionality
   - Show AI explanations
   - Display color-coded severity

4. **Clean Interface**
   - Close unnecessary browser tabs
   - Hide browser extensions if possible
   - Use clean, professional data

5. **Multiple Views**
   - Show empty states
   - Show populated states
   - Show different severity levels

## 📋 Screenshot Checklist Template

For each screenshot:

- [ ] Resolution: 1920x1080 ✓
- [ ] File size: < 500KB ✓
- [ ] Format: PNG ✓
- [ ] No sensitive data ✓
- [ ] Good contrast/readability ✓
- [ ] Named correctly ✓
- [ ] Saved in correct directory ✓

## 🆘 Troubleshooting

### Screenshots Too Large?
```bash
# Use ImageMagick to compress
convert screenshot.png -quality 85 -strip screenshot.png
```

### Wrong Resolution?
- Use browser DevTools to set viewport
- Or resize with ImageMagick:
```bash
convert screenshot.png -resize 1920x1080 screenshot.png
```

### Can't See Full Page?
- Use browser's full-page screenshot feature
- Or scroll and stitch multiple screenshots

## 📚 Next Steps

1. **Take Screenshots** - Follow the process above
2. **Optimize** - Compress to < 500KB
3. **Commit** - Add to git and commit
4. **Push** - Push to GitHub
5. **Update READMEs** - Ensure screenshot links work

---

**Ready to add screenshots?** Start with one product (SurfaceAI) and replicate the process for others!

