# Frontend Deployment Guide

## Vercel Deployment

This frontend is configured for deployment on Vercel as a standalone application.

### Project Structure
```
frontend/
├── vercel.json          # Deployment configuration
├── .vercelignore        # Files to exclude
├── package.json         # Frontend dependencies
├── vite.config.js       # Vite configuration
└── dist/                # Build output
```

### Configuration Files

1. **vercel.json** - Contains deployment configuration
2. **package.json** - Contains build scripts
3. **vite.config.js** - Configured with `base: './'` for relative paths
4. **.vercelignore** - Excludes unnecessary files from deployment

### Build Process

The project uses standard Vite build process:
- Build Command: `npm run build`
- Output directory: `dist`
- Base path: `./` (relative paths)
- Source maps enabled

### Deployment Steps

1. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - **Important**: Select the **frontend folder** as the root directory

2. **Build Settings:**
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Environment Variables (if needed):**
   - Add any required environment variables in Vercel dashboard

### Troubleshooting

If you encounter deployment errors:

1. **Check build locally:**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. **Verify file paths:**
   - Ensure all asset paths are relative (starting with `./`)
   - Check that public files are copied to dist folder

3. **Check Vercel logs:**
   - Go to your project dashboard in Vercel
   - Check the Functions tab for any runtime errors
   - Review build logs for compilation issues

### Common Issues Fixed

- ✅ Standalone frontend deployment
- ✅ Correct package.json path resolution
- ✅ Relative asset paths (`base: './'` in vite.config.js)
- ✅ Proper rewrites for SPA routing
- ✅ Cache headers for static assets
- ✅ Excluded unnecessary files from deployment

### Important Notes

- **Root Directory**: Select the **frontend folder** in Vercel, not the root directory
- **Build Command**: Uses `npm run build` directly
- **Output Directory**: Points to `dist` where the built files are located

The application should now deploy successfully on Vercel!
