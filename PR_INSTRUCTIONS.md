# 🚀 Pull Request Instructions

## Branch Information
- **Branch:** `chore/ci-cd-setup`
- **Base:** `main`
- **Status:** ✅ Pushed to GitHub

## 📋 Create Pull Request

### Option 1: Via GitHub Web Interface (Recommended)

1. **Go to your repository:**
   ```
   https://github.com/nadeenhalabi1/lotus_project
   ```

2. **You should see a banner saying:**
   ```
   "chore/ci-cd-setup had recent pushes"
   [Compare & pull request]
   ```
   Click on **"Compare & pull request"**

3. **Or manually:**
   - Click on **"Pull requests"** tab
   - Click **"New pull request"**
   - Select:
     - **base:** `main`
     - **compare:** `chore/ci-cd-setup`
   - Click **"Create pull request"**

4. **Fill in PR details:**
   - **Title:** `feat: Add CI/CD workflows for Vercel and Railway deployment`
   - **Description:**
     ```markdown
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
     ```

5. **Click "Create pull request"**

### Option 2: Direct Link
```
https://github.com/nadeenhalabi1/lotus_project/compare/main...chore/ci-cd-setup
```

---

## ✅ Pre-Merge Checklist

**Before merging this PR, ensure:**

- [ ] GitHub Secrets are set:
  - [ ] `VERCEL_TOKEN`
  - [ ] `VERCEL_ORG_ID`
  - [ ] `VERCEL_PROJECT_ID`
  - [ ] `RAILWAY_TOKEN`
  - [ ] `VITE_API_URL` = `https://lotusproject-production.up.railway.app`

- [ ] GitHub Environments are created:
  - [ ] `production-frontend` (with required reviewers)
  - [ ] `production-backend` (with required reviewers)

- [ ] Vercel project is configured:
  - [ ] Root Directory = `frontend`
  - [ ] `VITE_API_URL` environment variable is set

- [ ] Railway project is configured:
  - [ ] Root Directory = `backend`
  - [ ] All environment variables are set

---

## 📝 After PR is Merged

1. **CI workflow will run automatically** on `main` branch
2. **Deploy workflow will start** (requires manual approval)
3. **Approve deployments** in GitHub Environments:
   - Go to Actions → Deploy workflow
   - Click on "Review deployments"
   - Approve `production-frontend`
   - Approve `production-backend`
4. **Verify deployments:**
   - Check Vercel dashboard for frontend
   - Check Railway dashboard for backend
   - Test health endpoint: `https://lotusproject-production.up.railway.app/health`

---

## 🆘 Troubleshooting

If workflows fail:
- Check Actions logs in GitHub
- Verify all secrets are set correctly
- Verify environment variables in Vercel/Railway
- Check that project IDs match existing projects

