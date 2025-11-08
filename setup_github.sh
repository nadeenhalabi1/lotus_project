#!/bin/bash
# GitHub Setup Script
# This script helps set up GitHub Secrets and Environments

echo "=========================================="
echo "GitHub CI/CD Setup Helper"
echo "=========================================="
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "⚠️  GitHub CLI (gh) is not installed."
    echo "   Install it from: https://cli.github.com/"
    echo ""
    echo "   Or complete setup manually:"
    echo "   1. Go to: https://github.com/nadeenhalabi1/lotus_project/settings/secrets/actions"
    echo "   2. Add secrets (see PRE_DEPLOYMENT_CHECKLIST.md)"
    echo "   3. Go to: https://github.com/nadeenhalabi1/lotus_project/settings/environments"
    echo "   4. Create environments (see PRE_DEPLOYMENT_CHECKLIST.md)"
    exit 1
fi

# Check if logged in
if ! gh auth status &> /dev/null; then
    echo "⚠️  Not logged in to GitHub CLI"
    echo "   Run: gh auth login"
    exit 1
fi

echo "✅ GitHub CLI is installed and authenticated"
echo ""

# Get repository info
REPO="nadeenhalabi1/lotus_project"
echo "Repository: $REPO"
echo ""

# Function to create PR
create_pr() {
    echo "Creating Pull Request..."
    gh pr create \
        --title "feat: Add CI/CD workflows for Vercel and Railway deployment" \
        --body "## 🚀 CI/CD Pipeline Setup

This PR adds automated CI/CD workflows for deploying to Vercel (frontend) and Railway (backend).

### Changes
- ✅ Add GitHub Actions CI workflow (\`.github/workflows/ci.yml\`)
- ✅ Add GitHub Actions deploy workflow (\`.github/workflows/deploy.yml\`) with manual approvals
- ✅ Update frontend API service to auto-add \`/api/v1\` to base URL
- ✅ Add \`html2canvas\` dependency to frontend
- ✅ Update \`vercel.json\` configuration
- ✅ Update \`railway.json\` with health check settings
- ✅ Add \`.vercel/\` to \`.gitignore\`
- ✅ Update \`DEPLOYMENT.md\` with CI/CD setup instructions
- ✅ Update \`README.md\` with deployment section
- ✅ Add \`PRE_DEPLOYMENT_CHECKLIST.md\` for manual setup steps

### Before Merging
⚠️ **IMPORTANT:** Complete manual setup steps in \`PRE_DEPLOYMENT_CHECKLIST.md\`:
- Set GitHub Secrets (VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID, RAILWAY_TOKEN, VITE_API_URL)
- Create GitHub Environments (\`production-frontend\`, \`production-backend\`)
- Verify Vercel/Railway project configurations

### After Merging
- CI workflow will run automatically
- Deploy workflow will require manual approval via GitHub Environments
- First deployment will need environment approvals" \
        --base main \
        --head chore/ci-cd-setup
}

# Try to create PR
echo "Attempting to create Pull Request..."
if create_pr; then
    echo ""
    echo "✅ Pull Request created successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Set GitHub Secrets (see PRE_DEPLOYMENT_CHECKLIST.md)"
    echo "2. Create GitHub Environments (see PRE_DEPLOYMENT_CHECKLIST.md)"
    echo "3. Review and merge the PR"
else
    echo ""
    echo "⚠️  Could not create PR automatically"
    echo "   Create it manually:"
    echo "   https://github.com/$REPO/compare/main...chore/ci-cd-setup"
fi

