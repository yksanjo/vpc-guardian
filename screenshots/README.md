# Screenshots

This directory contains screenshots of SurfaceAI's user interface.

## Screenshot Guidelines

### Required Screenshots

1. **dashboard.png** - Main dashboard showing repositories and findings overview
2. **repositories.png** - Repository management interface
3. **findings.png** - Security findings list with AI explanations
4. **remediation.png** - Auto-generated remediation PR view
5. **settings.png** - Configuration and settings page

### Screenshot Specifications

- **Format:** PNG
- **Resolution:** Minimum 1920x1080 (Full HD)
- **Aspect Ratio:** 16:9
- **File Size:** Keep under 500KB (optimize if needed)

### Taking Screenshots

1. Start the application in development mode
2. Use browser developer tools to set viewport to 1920x1080
3. Navigate to the page you want to capture
4. Use browser screenshot tools or a tool like [CleanShot](https://cleanshot.com/)
5. Save as PNG in this directory

### Screenshot Checklist

- [ ] Dashboard shows real data (not empty states)
- [ ] UI is clean and professional
- [ ] No sensitive data visible (use test data)
- [ ] Consistent styling across screenshots
- [ ] Screenshots are optimized for web

### Placeholder Screenshots

Until real screenshots are available, you can use placeholder images:

```bash
# Generate placeholder using ImageMagick or similar
convert -size 1920x1080 xc:#f3f4f6 -pointsize 48 -fill "#6b7280" \
  -gravity center -annotate +0+0 "SurfaceAI Dashboard" \
  screenshots/dashboard.png
```

Or use online tools like:
- [Placeholder.com](https://placeholder.com/)
- [DummyImage](https://dummyimage.com/)

### Updating Screenshots

When updating screenshots:

1. Take new screenshots with the same naming convention
2. Optimize images (use tools like [TinyPNG](https://tinypng.com/))
3. Update this README if adding new screenshots
4. Commit with message: "Update screenshots"

## Current Screenshots

- `dashboard.png` - Main dashboard (1920x1080)
- `repositories.png` - Repository list (1920x1080)
- `findings.png` - Security findings (1920x1080)
- `remediation.png` - Remediation PR (1920x1080)
- `settings.png` - Settings page (1920x1080)

