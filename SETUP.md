# Setup Guide
## EducoreAI Management Reporting Microservice

This guide will help you set up and run the application locally.

---

## Prerequisites

- **Node.js** 18+ installed
- **npm** or **yarn** package manager
- **Redis** instance (local or cloud)
- **Git** (optional, for version control)

---

## Step 1: Install Dependencies

### Frontend
```bash
cd frontend
npm install
```

### Backend
```bash
cd backend
npm install
```

---

## Step 2: Environment Configuration

### Frontend Environment Variables

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_APP_NAME=EducoreAI Management Reporting
```

### Backend Environment Variables

Create `backend/.env`:
```env
# Server
NODE_ENV=development
PORT=3000

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_TLS=false

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=2h

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Microservices (update with actual URLs)
DIRECTORY_API_URL=http://localhost:3001
COURSE_BUILDER_API_URL=http://localhost:3002
ASSESSMENT_API_URL=http://localhost:3003
CONTENT_STUDIO_API_URL=http://localhost:3004
LEARNING_ANALYTICS_API_URL=http://localhost:3005

# EducoreAI Auth
AUTH_SERVICE_URL=http://localhost:3006
MICROSERVICE_JWT_TOKEN=your-jwt-token-for-microservices
```

---

## Step 3: Set Up Redis

### Option 1: Local Redis with Docker
```bash
docker run -d -p 6379:6379 --name redis redis:latest
```

### Option 2: Redis Cloud
1. Sign up at [Redis Cloud](https://redis.com/try-free/)
2. Create a database
3. Update `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` in backend `.env`

---

## Step 4: Run the Application

### Terminal 1: Backend
```bash
cd backend
npm run dev
```
Backend will run on `http://localhost:3000`

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:5173`

---

## Step 5: Access the Application

1. Open browser to `http://localhost:5173`
2. The application should load (you may need to configure authentication)

---

## Troubleshooting

### Backend won't start
- Check if port 3000 is available
- Verify Redis connection
- Check environment variables

### Frontend won't connect to backend
- Verify `VITE_API_URL` in frontend `.env`
- Check CORS settings in backend
- Ensure backend is running

### Redis connection errors
- Verify Redis is running
- Check connection credentials
- Test connection: `redis-cli ping`

---

## Next Steps

1. **Configure Authentication:** Set up JWT token handling
2. **Connect Microservices:** Update microservice URLs
3. **Add Test Data:** Populate Redis with sample data for testing
4. **Run Tests:** Execute test suites
5. **Deploy:** Follow deployment guide for Vercel and Railway

---

## Development Commands

### Frontend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run test     # Run tests
```

### Backend
```bash
npm run dev      # Start development server
npm start        # Start production server
npm run test     # Run tests
```

---

## Project Structure

```
lotus_project/
├── frontend/          # React.js frontend
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── ...
│   └── package.json
├── backend/           # Node.js backend
│   ├── src/
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── presentation/
│   └── package.json
└── DB/                # Redis configuration
    └── README.md
```

---

For more information, see the main README.md file.

