# Backend Deployment Guide

## Railway Deployment

### Prerequisites
- Node.js 18+
- npm 8+
- Railway account
- GitHub repository connected to Railway

### Deployment Steps

1. **Connect Repository**
   - Go to Railway dashboard
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

2. **Configure Build Settings**
   - Railway will auto-detect Node.js
   - Ensure `package.json` is in the root or specify build path

3. **Environment Variables**
   Set the following environment variables in Railway:
   ```
   NODE_ENV=production
   PORT=3001
   FRONTEND_URL=https://your-frontend-domain.com
   JWT_SECRET=your-super-secret-jwt-key
   GEMINI_API_KEY=your-gemini-api-key
   SUPABASE_URL=your-supabase-url
   SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Deploy**
   - Railway will automatically build and deploy
   - Monitor the build logs for any issues

### Health Check
The application includes a health check endpoint at `/health` that returns:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "uptime": 123.456
}
```

### Troubleshooting

#### Common Issues:
1. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are listed in `package.json`
   - Check for syntax errors in code

2. **Runtime Errors**
   - Check environment variables are set correctly
   - Verify external service connections
   - Check application logs in Railway dashboard

3. **Port Issues**
   - Railway automatically assigns PORT environment variable
   - Ensure your app uses `process.env.PORT`

### Monitoring
- Use Railway dashboard to monitor application health
- Check logs for errors and performance issues
- Monitor resource usage (CPU, Memory)

### Scaling
- Railway automatically scales based on traffic
- Configure scaling settings in Railway dashboard
- Monitor performance metrics
