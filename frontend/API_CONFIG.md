# API Configuration

## Environment Variables

The application uses the following environment variable:

- `VITE_API_URL`: The base URL for the backend API

### Local Development
For local development, the application will automatically use:
- `.env.local` file (if exists): `VITE_API_URL=http://localhost:3001`
- `.env` file (if exists): `VITE_API_URL=http://localhost:3001`
- Default fallback: `http://localhost:3001`

### Production
In production (Vercel), set the environment variable:
```
VITE_API_URL=https://lotusproject-production.up.railway.app
```

## Environment Files

The following environment files are configured:

1. **`.env`** - Default development settings
2. **`.env.local`** - Local development overrides (gitignored)
3. **`.env.production`** - Production settings

## API Endpoints

All API calls are configured in `src/config/api.js` and use the `VITE_API_URL` environment variable.

### Debugging
In development mode, the API base URL is logged to the console for debugging purposes.

## Setup Instructions

### For Local Development:
1. Make sure your backend is running on `http://localhost:3001`
2. The frontend will automatically connect to the local backend
3. Check the browser console for the API Base URL confirmation

### For Production:
1. Set `VITE_API_URL` in Vercel environment variables
2. Point to your Railway backend URL
3. Deploy and verify the connection
