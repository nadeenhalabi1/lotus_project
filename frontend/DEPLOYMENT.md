# Frontend Deployment Guide

## Vercel Deployment

This frontend is configured for deployment on Vercel as part of a monorepo structure.

### Project Structure
```
lotus_project/
├── vercel.json          # Main deployment config
├── .vercelignore        # Files to exclude
├── package.json         # Root package with vercel-build script
└── frontend/            # Frontend application
    ├── package.json     # Frontend dependencies
    ├── vite.config.js   # Vite configuration
    └── dist/            # Build output
```

### Configuration Files

1. **vercel.json** (root) - Contains deployment configuration
2. **package.json** (root) - Contains `vercel-build` script
3. **frontend/vite.config.js** - Configured with `base: './'` for relative paths
4. **.vercelignore** (root) - Excludes unnecessary files from deployment

### Build Process

The project uses a custom build process:
- Root `package.json` contains `vercel-build` script
- Script navigates to frontend folder and runs build
- Output directory: `frontend/dist`
- Base path: `./` (relative paths)

### Deployment Steps

1. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - **Important**: Select the **root directory** (not frontend folder)

2. **Build Settings:**
   - Framework: Vite
   - Build Command: `npm run vercel-build`
   - Output Directory: `frontend/dist`
   - Install Command: `npm install`

3. **Environment Variables (if needed):**
   - Add any required environment variables in Vercel dashboard

### Troubleshooting

If you encounter deployment errors:

1. **Check build locally:**
   ```bash
   npm run vercel-build
   ```

2. **Verify file paths:**
   - Ensure all asset paths are relative (starting with `./`)
   - Check that public files are copied to dist folder

3. **Check Vercel logs:**
   - Go to your project dashboard in Vercel
   - Check the Functions tab for any runtime errors
   - Review build logs for compilation issues

### Common Issues Fixed

- ✅ Monorepo structure support
- ✅ Correct package.json path resolution
- ✅ Relative asset paths (`base: './'` in vite.config.js)
- ✅ Proper rewrites for SPA routing
- ✅ Cache headers for static assets
- ✅ Excluded unnecessary files from deployment

### Important Notes

- **Root Directory**: Always select the root directory in Vercel, not the frontend folder
- **Build Command**: Uses `npm run vercel-build` which handles the frontend build
- **Output Directory**: Points to `frontend/dist` where the built files are located

The application should now deploy successfully on Vercel!
