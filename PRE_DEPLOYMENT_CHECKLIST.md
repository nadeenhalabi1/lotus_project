# 🚨 Pre-Deployment Manual Checklist

**IMPORTANT:** Complete these steps BEFORE pushing to GitHub!

## ⚠️ Current Situation
- ✅ New CI/CD workflows created locally
- ⚠️ Old code exists in GitHub repository
- ⚠️ Old deployments exist in Vercel and Railway (with different code but same folder structure)

---

## 📋 Manual Steps Required

### 1. **GitHub Repository - Secrets Setup** ⚠️ CRITICAL

Go to: `https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions`

**Add/Verify these secrets:**

- [ ] `VERCEL_TOKEN`
  - Get from: https://vercel.com/account/tokens
  - Generate new token if needed
  - **IMPORTANT:** Use token that has access to your existing Vercel project

- [ ] `VERCEL_ORG_ID`
  - Get from: Vercel Dashboard → Your Project → Settings → General
  - Or run: `vercel whoami` locally
  - **IMPORTANT:** Must match the ORG of your existing Vercel project

- [ ] `VERCEL_PROJECT_ID`
  - Get from: Vercel Dashboard → Your Project → Settings → General
  - **IMPORTANT:** Must match your EXISTING Vercel project (not create new one)

- [ ] `RAILWAY_TOKEN`
  - Get from: https://railway.app/account/tokens
  - Generate new token if needed
  - **IMPORTANT:** Use token that has access to your existing Railway project

- [ ] `VITE_API_URL`
  - Value: Your Railway backend URL (e.g., `https://your-backend.railway.app/api/v1`)
  - **IMPORTANT:** Must match your EXISTING Railway backend URL

---

### 2. **GitHub Repository - Environments Setup** ⚠️ CRITICAL

Go to: `https://github.com/YOUR_USERNAME/YOUR_REPO/settings/environments`

**Create/Verify these environments:**

- [ ] `production-frontend`
  - Click "New environment"
  - Name: `production-frontend`
  - Add required reviewers (yourself)
  - This will require manual approval before frontend deployment

- [ ] `production-backend`
  - Click "New environment"
  - Name: `production-backend`
  - Add required reviewers (yourself)
  - This will require manual approval before backend deployment

---

### 3. **Vercel Project - Verify Configuration** ⚠️ IMPORTANT

Go to: https://vercel.com/dashboard

**For your EXISTING Vercel project:**

- [ ] Verify Root Directory is set to `frontend` (or update if needed)
- [ ] Verify Framework is set to `Vite` (or update if needed)
- [ ] Verify Build Command: `npm run build`
- [ ] Verify Output Directory: `dist`
- [ ] Verify Environment Variable `VITE_API_URL` exists and points to your Railway backend
- [ ] **IMPORTANT:** Note your Project ID and Org ID (you'll need them for GitHub secrets)

**If project doesn't exist or you want to create new:**
- [ ] Create new project in Vercel
- [ ] Link to your GitHub repository
- [ ] Set Root Directory to `frontend`
- [ ] Get Project ID and Org ID for GitHub secrets

---

### 4. **Railway Project - Verify Configuration** ⚠️ IMPORTANT

Go to: https://railway.app/dashboard

**For your EXISTING Railway project:**

- [ ] Verify Root Directory is set to `backend` (or update if needed)
- [ ] Verify Start Command: `npm start`
- [ ] Verify Health Check Path: `/health`
- [ ] Verify all Environment Variables are set:
  - `NODE_ENV=production`
  - `PORT=3000` (or let Railway assign)
  - `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_TLS`
  - `JWT_SECRET`
  - `OPENAI_API_KEY` (optional)
  - All microservice URLs
  - `CORS_ORIGIN` (should be your Vercel frontend URL)
- [ ] **IMPORTANT:** Note your Railway project/service name

**If project doesn't exist or you want to create new:**
- [ ] Create new Railway project
- [ ] Add new service
- [ ] Set Root Directory to `backend`
- [ ] Configure all environment variables
- [ ] Get Railway token for GitHub secrets

---

### 5. **Local Git - Verify Current State** ⚠️ IMPORTANT

**Before pushing, verify:**

```bash
# Check current branch
git branch

# Check what files changed
git status

# Review changes
git diff
```

- [ ] You're on a feature branch (NOT `main`)
- [ ] All CI/CD files are staged
- [ ] No sensitive files (.env, secrets) are included
- [ ] `.vercel/` folder is in `.gitignore` (already done)

---

### 6. **Test Locally First** ⚠️ RECOMMENDED

**Test frontend build:**
```bash
cd frontend
npm ci
npm run build
```
- [ ] Build succeeds without errors
- [ ] `dist/` folder is created
- [ ] No missing dependencies

**Test backend:**
```bash
cd backend
npm ci
npm test
```
- [ ] Tests pass (or at least don't fail critically)
- [ ] No missing dependencies

---

### 7. **Decide: Update Existing or Create New?**

**Option A: Update Existing Deployments** (Recommended if projects exist)
- ✅ Use existing Vercel project ID and Org ID
- ✅ Use existing Railway project
- ✅ Workflows will update existing deployments
- ⚠️ Make sure secrets match existing projects

**Option B: Create New Deployments**
- ✅ Create new Vercel project
- ✅ Create new Railway project
- ✅ Get new IDs/tokens
- ✅ Update GitHub secrets with new values

---

## 🚀 Ready to Push?

**Only push when:**
- ✅ All secrets are set in GitHub
- ✅ Environments are created in GitHub
- ✅ Vercel project is configured correctly
- ✅ Railway project is configured correctly
- ✅ Local tests pass
- ✅ You're on a feature branch (NOT `main`)

---

## 📝 Push Steps (After Checklist Complete)

1. Create branch: `chore/ci-cd-setup`
2. Commit all CI/CD files
3. Push to GitHub
4. Create Pull Request
5. Review PR
6. Merge to `main` (this will trigger workflows)
7. Approve deployments in GitHub Environments

---

## ⚠️ Important Notes

- **DO NOT** push to `main` directly - always use PR
- **DO NOT** push if secrets are missing - workflows will fail
- **DO NOT** push if environments don't exist - workflows will fail
- **VERIFY** that Vercel/Railway project IDs match your existing projects (if updating) or create new ones (if starting fresh)

---

## 🆘 If Something Goes Wrong

- Check GitHub Actions logs
- Verify all secrets are set correctly
- Verify environment variables in Vercel/Railway dashboards
- Check that project IDs match
- Verify Root Directory settings in both platforms

