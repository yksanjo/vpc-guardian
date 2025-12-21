# Setting Up GitHub Repository

Follow these steps to push SurfaceAI to your GitHub account.

## 1. Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `surfaceai` (or your preferred name)
3. Description: "AI-Powered Attack Surface Monitor for GitHub Repositories"
4. Choose Public or Private
5. **Do NOT** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

## 2. Initialize Git and Push

```bash
# Navigate to the project directory
cd /Users/yoshikondo/ddsp-piano/surfaceai

# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: SurfaceAI - Attack Surface Monitor"

# Add your GitHub repository as remote
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/surfaceai.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## 3. Verify

1. Go to your GitHub repository page
2. Verify all files are present
3. Check that README.md displays correctly
4. Verify screenshots directory exists

## 4. Optional: Add GitHub Topics

On your repository page, click the gear icon next to "About" and add topics:
- `security`
- `github`
- `attack-surface`
- `ai`
- `typescript`
- `nextjs`
- `express`

## 5. Optional: Enable GitHub Pages

If you want to host documentation:

1. Go to Settings > Pages
2. Source: Deploy from a branch
3. Branch: `main` / `docs` folder
4. Save

## Troubleshooting

### Authentication Issues

If you get authentication errors:

```bash
# Use GitHub CLI
gh auth login

# Or use SSH
git remote set-url origin git@github.com:YOUR_USERNAME/surfaceai.git
```

### Large Files

If you have large files, consider using Git LFS:

```bash
git lfs install
git lfs track "*.png"
git add .gitattributes
```

