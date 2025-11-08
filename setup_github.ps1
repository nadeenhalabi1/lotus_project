# GitHub Setup Script for PowerShell
# This script helps set up GitHub Secrets and Environments

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "GitHub CI/CD Setup Helper" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if gh CLI is installed
try {
    $ghVersion = gh --version 2>&1
    Write-Host "✅ GitHub CLI is installed" -ForegroundColor Green
} catch {
    Write-Host "⚠️  GitHub CLI (gh) is not installed." -ForegroundColor Yellow
    Write-Host "   Install it from: https://cli.github.com/" -ForegroundColor White
    Write-Host ""
    Write-Host "   Or complete setup manually:" -ForegroundColor White
    Write-Host "   1. Go to: https://github.com/nadeenhalabi1/lotus_project/settings/secrets/actions" -ForegroundColor Gray
    Write-Host "   2. Add secrets (see PRE_DEPLOYMENT_CHECKLIST.md)" -ForegroundColor Gray
    Write-Host "   3. Go to: https://github.com/nadeenhalabi1/lotus_project/settings/environments" -ForegroundColor Gray
    Write-Host "   4. Create environments (see PRE_DEPLOYMENT_CHECKLIST.md)" -ForegroundColor Gray
    exit 1
}

# Check if logged in
try {
    gh auth status 2>&1 | Out-Null
    Write-Host "✅ Authenticated with GitHub CLI" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Not logged in to GitHub CLI" -ForegroundColor Yellow
    Write-Host "   Run: gh auth login" -ForegroundColor White
    exit 1
}

Write-Host ""
$REPO = "nadeenhalabi1/lotus_project"
Write-Host "Repository: $REPO" -ForegroundColor Cyan
Write-Host ""

# Create PR
Write-Host "Creating Pull Request..." -ForegroundColor Yellow
$prBody = @"
## 🚀 CI/CD Pipeline Setup

This PR adds automated CI/CD workflows for deploying to Vercel (frontend) and Railway (backend).

### Changes
- ✅ Add GitHub Actions CI workflow (`.github/workflows/ci.yml`)
- ✅ Add GitHub Actions deploy workflow (`.github/workflows/deploy.yml`) with manual approvals
- ✅ Update frontend API service to auto-add `/api/v1` to base URL
- ✅ Add `html2canvas` dependency to frontend
- ✅ Update `vercel.json` configuration
- ✅ Update `railway.json` with health check settings
- ✅ Add `.vercel/` to `.gitignore`
- ✅ Update `DEPLOYMENT.md` with CI/CD setup instructions
- ✅ Update `README.md` with deployment section
- ✅ Add `PRE_DEPLOYMENT_CHECKLIST.md` for manual setup steps

### Before Merging
⚠️ **IMPORTANT:** Complete manual setup steps in `PRE_DEPLOYMENT_CHECKLIST.md`:
- Set GitHub Secrets (VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID, RAILWAY_TOKEN, VITE_API_URL)
- Create GitHub Environments (`production-frontend`, `production-backend`)
- Verify Vercel/Railway project configurations

### After Merging
- CI workflow will run automatically
- Deploy workflow will require manual approval via GitHub Environments
- First deployment will need environment approvals
"@

try {
    $prUrl = gh pr create `
        --title "feat: Add CI/CD workflows for Vercel and Railway deployment" `
        --body $prBody `
        --base main `
        --head chore/ci-cd-setup
    
    Write-Host ""
    Write-Host "✅ Pull Request created successfully!" -ForegroundColor Green
    Write-Host "   $prUrl" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Set GitHub Secrets (see PRE_DEPLOYMENT_CHECKLIST.md)" -ForegroundColor White
    Write-Host "2. Create GitHub Environments (see PRE_DEPLOYMENT_CHECKLIST.md)" -ForegroundColor White
    Write-Host "3. Review and merge the PR" -ForegroundColor White
} catch {
    Write-Host ""
    Write-Host "⚠️  Could not create PR automatically" -ForegroundColor Yellow
    Write-Host "   Create it manually:" -ForegroundColor White
    Write-Host "   https://github.com/$REPO/compare/main...chore/ci-cd-setup" -ForegroundColor Cyan
}

