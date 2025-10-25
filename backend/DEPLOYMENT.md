# Backend Deployment to Railway

## Prerequisites
- Node.js 18+
- Railway account
- GitHub repository connected

## Deployment Steps

### 1. Prepare the Backend
- Ensure all dependencies are in `package.json`
- Verify `server.js` is the entry point
- Check that `PORT` environment variable is used

### 2. Railway Configuration
- Create new project on Railway
- Connect GitHub repository
- Select `backend` folder as root directory
- Railway will auto-detect Node.js project

### 3. Environment Variables
Set these in Railway dashboard:
- `PORT` (Railway sets this automatically)
- `NODE_ENV=production`
- `CORS_ORIGIN=https://your-frontend-domain.vercel.app`

### 4. Build Settings
- Build Command: `npm install`
- Start Command: `npm start`
- Node Version: 18

### 5. Health Check
- Endpoint: `/api/health`
- Timeout: 100ms
- Railway will monitor this endpoint

## API Endpoints
- `GET /api/health` - Health check
- `GET /api/dashboard` - Dashboard data
- `GET /api/reports` - Reports data
- `GET /api/insights` - AI insights
- `GET /api/logo` - Logo images

## Troubleshooting
- Check Railway logs for errors
- Verify all dependencies are installed
- Ensure PORT environment variable is set
- Check CORS configuration for frontend domain
