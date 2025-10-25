# API Configuration

## Environment Variables

The application uses the following environment variable:

- `VITE_API_URL`: The base URL for the backend API

### Local Development
For local development, create a `.env.local` file in the frontend directory:
```
VITE_API_URL=http://localhost:3001
```

### Production
In production (Vercel), set the environment variable:
```
VITE_API_URL=https://lotusproject-production.up.railway.app
```

## API Endpoints

All API calls are configured in `src/config/api.js` and use the `VITE_API_URL` environment variable.
