# Deployment Guide
## EducoreAI Management Reporting Microservice

This guide covers deployment to Vercel (Frontend) and Railway (Backend) using GitHub Actions CI/CD.

---

## 🚀 CI/CD Pipeline Overview

This project uses GitHub Actions for automated CI/CD:

- **CI Pipeline** (`.github/workflows/ci.yml`): Runs on every PR and push
  - Lints, builds, and tests both frontend and backend
  - Must pass before deployment

- **Deploy Pipeline** (`.github/workflows/deploy.yml`): Runs on push to `main` or manual trigger
  - Requires CI to pass first
  - Requires manual approval via GitHub Environments
  - Deploys frontend to Vercel and backend to Railway

---

## 📋 Manual Setup Checklist

Before the CI/CD pipeline can work, you need to complete these steps:

### Vercel Setup

- [ ] Create a Vercel account at [vercel.com](https://vercel.com)
- [ ] Create a new Vercel project (or reuse existing) for the `frontend/` app
- [ ] Get your Vercel credentials:
  - [ ] `VERCEL_TOKEN` - Generate at [Vercel Settings → Tokens](https://vercel.com/account/tokens)
  - [ ] `VERCEL_ORG_ID` - Found in project settings or via `vercel whoami`
  - [ ] `VERCEL_PROJECT_ID` - Found in project settings
- [ ] Configure project to use `frontend/` as the root directory (if needed)
- [ ] Set Environment Variables in Vercel dashboard:
  - [ ] `VITE_API_URL` - Your Railway backend URL (e.g., `https://your-app.railway.app/api/v1`)

### Railway Setup

- [ ] Create a Railway account at [railway.app](https://railway.app)
- [ ] Create a new Railway project/service for `backend/`
- [ ] Get your Railway token:
  - [ ] `RAILWAY_TOKEN` - Generate at [Railway Settings → Tokens](https://railway.app/account/tokens)
- [ ] Set Environment Variables in Railway dashboard:
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=3000` (or let Railway assign)
  - [ ] `REDIS_HOST` - Your Redis host
  - [ ] `REDIS_PORT=6379`
  - [ ] `REDIS_PASSWORD` - Your Redis password (if required)
  - [ ] `REDIS_TLS=true` (if using TLS)
  - [ ] `JWT_SECRET` - Your JWT secret key
  - [ ] `OPENAI_API_KEY` - Your OpenAI API key (optional, for AI insights)
  - [ ] `DIRECTORY_API_URL` - Directory microservice URL
  - [ ] `COURSE_BUILDER_API_URL` - Course Builder microservice URL
  - [ ] `ASSESSMENT_API_URL` - Assessment microservice URL
  - [ ] `CONTENT_STUDIO_API_URL` - Content Studio microservice URL
  - [ ] `LEARNING_ANALYTICS_API_URL` - Learning Analytics microservice URL
  - [ ] `AUTH_SERVICE_URL` - Auth service URL
  - [ ] `MICROSERVICE_JWT_TOKEN` - Service-to-service JWT token
  - [ ] `CORS_ORIGIN` - Your Vercel frontend URL (e.g., `https://your-project.vercel.app`)
- [ ] If using `railway.json`, ensure it's linked to the correct service

### GitHub Setup

- [ ] Go to GitHub repository → Settings → Secrets and variables → Actions
- [ ] Add the following secrets:
  - [ ] `VERCEL_TOKEN` - Your Vercel token
  - [ ] `VERCEL_ORG_ID` - Your Vercel organization ID
  - [ ] `VERCEL_PROJECT_ID` - Your Vercel project ID
  - [ ] `RAILWAY_TOKEN` - Your Railway token
  - [ ] `VITE_API_URL` - Your Railway backend URL (for frontend builds, e.g., `https://your-app.railway.app/api/v1`)
  - [ ] Any other app-specific environment variables needed
- [ ] Go to Settings → Environments
- [ ] Create environment: `production-frontend`
  - [ ] Add required reviewers (yourself or team members)
  - [ ] This will require manual approval before frontend deployment
- [ ] Create environment: `production-backend`
  - [ ] Add required reviewers (yourself or team members)
  - [ ] This will require manual approval before backend deployment

### First Deployment

- [ ] Push code to `main` branch (or create PR and merge)
- [ ] CI workflow will run automatically - wait for it to pass
- [ ] Deploy workflow will start - you'll receive a notification
- [ ] Approve the `production-frontend` environment deployment
- [ ] Approve the `production-backend` environment deployment
- [ ] Verify frontend is live on Vercel and connects to backend
- [ ] Verify backend is live on Railway (`/health` endpoint)
- [ ] Verify CORS allows the Vercel domain
- [ ] If needed, update environment variables and re-run via `workflow_dispatch`

### Troubleshooting

- [ ] If Vercel deploy fails:
  - [ ] Run locally: `cd frontend && npm ci && npm run build`
  - [ ] Check Vercel dashboard logs
  - [ ] Verify all secrets are set correctly
- [ ] If Railway deploy fails:
  - [ ] Check Railway dashboard logs
  - [ ] Verify `PORT` and environment variables
  - [ ] Test health endpoint: `curl https://your-app.railway.app/health`
- [ ] If GitHub Actions fails:
  - [ ] Check Actions logs (secrets are automatically masked)
  - [ ] Verify all required secrets are set
  - [ ] Ensure CI workflow passes before deploy runs

---

## Frontend Deployment - Vercel

### Prerequisites
- Vercel account
- GitHub repository (optional, but recommended)

### Steps

1. **Install Vercel CLI** (optional)
   ```bash
   npm i -g vercel
   ```

2. **Deploy via Vercel Dashboard**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository or upload the `frontend` folder
   - Configure:
     - **Root Directory:** `frontend`
     - **Framework Preset:** Vite
     - **Build Command:** `npm run build`
     - **Output Directory:** `dist`
     - **Install Command:** `npm install`

3. **Environment Variables**
   Add in Vercel dashboard:
   - `VITE_API_URL` - Your Railway backend URL (e.g., `https://your-app.railway.app/api/v1`)

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy automatically
   - Your frontend will be live at `https://your-project.vercel.app`

### Automatic Deployments
- Every push to `main` branch triggers production deployment
- Pull requests create preview deployments

---

## Backend Deployment - Railway

### Prerequisites
- Railway account
- GitHub repository (optional)

### Steps

1. **Install Railway CLI** (optional)
   ```bash
   npm i -g @railway/cli
   ```

2. **Deploy via Railway Dashboard**
   - Go to [Railway Dashboard](https://railway.app/dashboard)
   - Click "New Project"
   - Select "Deploy from GitHub repo" or "Empty Project"
   - If using GitHub:
     - Select your repository
     - Set **Root Directory** to `backend`
   - If using CLI:
     ```bash
     cd backend
     railway init
     railway up
     ```

3. **Environment Variables**
   Add in Railway dashboard:
   ```
   NODE_ENV=production
   PORT=3000
   REDIS_HOST=your-redis-host
   REDIS_PORT=6379
   REDIS_PASSWORD=your-redis-password
   REDIS_TLS=true
   JWT_SECRET=your-jwt-secret
   OPENAI_API_KEY=your-openai-key
   DIRECTORY_API_URL=https://directory.educoreai.com
   COURSE_BUILDER_API_URL=https://course-builder.educoreai.com
   ASSESSMENT_API_URL=https://assessment.educoreai.com
   CONTENT_STUDIO_API_URL=https://content-studio.educoreai.com
   LEARNING_ANALYTICS_API_URL=https://analytics.educoreai.com
   AUTH_SERVICE_URL=https://auth.educoreai.com
   MICROSERVICE_JWT_TOKEN=your-service-token
   ```

4. **Configure Build Settings**
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - Railway auto-detects Node.js projects

5. **Deploy**
   - Railway will automatically build and deploy
   - Your backend will be live at `https://your-app.railway.app`

### Custom Domain (Optional)
- In Railway dashboard, go to Settings → Domains
- Add your custom domain
- Configure DNS records as instructed

---

## Redis Setup

### Option 1: Railway Redis Plugin
1. In Railway project, click "New"
2. Select "Redis"
3. Railway will provision Redis automatically
4. Use provided connection details in environment variables

### Option 2: Redis Cloud
1. Sign up at [Redis Cloud](https://redis.com/try-free/)
2. Create a database
3. Use connection details in Railway environment variables

---

## Post-Deployment Checklist

### Frontend (Vercel)
- ✅ Environment variables configured
- ✅ API URL points to Railway backend
- ✅ Build succeeds without errors
- ✅ Site is accessible
- ✅ All routes work correctly

### Backend (Railway)
- ✅ Environment variables configured
- ✅ Redis connection working
- ✅ Health check endpoint responds (`/health`)
- ✅ API endpoints accessible
- ✅ Scheduled jobs running

### Integration
- ✅ Frontend can communicate with backend
- ✅ CORS configured correctly
- ✅ Authentication working
- ✅ Data collection jobs running

---

## Monitoring

### Vercel
- View deployments in Vercel dashboard
- Check build logs
- Monitor performance metrics

### Railway
- View logs in Railway dashboard
- Monitor resource usage
- Check deployment status

---

## Rollback

### Vercel
- Go to Deployments
- Click on previous deployment
- Click "Promote to Production"

### Railway
- Go to Deployments
- Click "Redeploy" on previous deployment

---

## Troubleshooting

### Frontend Build Fails
- Check build logs in Vercel
- Verify all dependencies in `package.json`
- Ensure environment variables are set

### Backend Won't Start
- Check Railway logs
- Verify environment variables
- Test Redis connection
- Check port configuration

### API Connection Issues
- Verify `VITE_API_URL` in Vercel
- Check CORS settings in backend
- Verify backend is running
- Check network connectivity

---

For more details, refer to:
- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)

