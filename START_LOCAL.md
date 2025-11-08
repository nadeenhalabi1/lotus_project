# Start Application on Localhost - Manual Steps

## Quick Setup Instructions

### Step 1: Create Environment Files

**Backend (.env):**
Create `backend/.env` file with this content:
```
NODE_ENV=development
PORT=3000
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_TLS=false
JWT_SECRET=development-secret-key-minimum-32-characters-long-for-testing
JWT_EXPIRES_IN=2h
OPENAI_API_KEY=
DIRECTORY_API_URL=http://localhost:3001
COURSE_BUILDER_API_URL=http://localhost:3002
ASSESSMENT_API_URL=http://localhost:3003
CONTENT_STUDIO_API_URL=http://localhost:3004
LEARNING_ANALYTICS_API_URL=http://localhost:3005
AUTH_SERVICE_URL=http://localhost:3006
MICROSERVICE_JWT_TOKEN=test-token-for-local-development
CORS_ORIGIN=http://localhost:5173
```

**Frontend (.env):**
Create `frontend/.env` file with this content:
```
VITE_API_URL=http://localhost:3000/api/v1
VITE_APP_NAME=EducoreAI Management Reporting
```

### Step 2: Install Dependencies

**Open Terminal 1 - Backend:**
```powershell
cd backend
npm install
```

**Open Terminal 2 - Frontend:**
```powershell
cd frontend
npm install
```

### Step 3: Start Redis (Optional but Recommended)

**Option A: Docker**
```powershell
docker run -d -p 6379:6379 --name redis-management-reporting redis:latest
```

**Option B: Skip Redis**
- Backend will show connection errors but frontend will still work
- Charts will be empty (expected)

### Step 4: Start Backend Server

**In Terminal 1 (Backend):**
```powershell
cd backend
npm run dev
```

You should see:
```
Server running on port 3000
Environment: development
```

### Step 5: Start Frontend Server

**In Terminal 2 (Frontend):**
```powershell
cd frontend
npm run dev
```

You should see:
```
VITE v5.0.8  ready in XXX ms
➜  Local:   http://localhost:5173/
```

### Step 6: Open Application

Open your browser and go to: **http://localhost:5173**

### Step 7: Add Mock Data (Optional)

To see charts with data, run:
```powershell
cd backend
node scripts/addMockData.js
```

Then refresh your browser!

---

## Troubleshooting

**If npm install fails:**
- Try: `npm install --legacy-peer-deps`
- Or: `npm install --force`

**If backend won't start:**
- Check Redis is running: `redis-cli ping` (should return PONG)
- Or skip Redis - backend will show errors but still work

**If frontend won't connect:**
- Check backend is running on port 3000
- Check `VITE_API_URL` in frontend/.env

**If you see 401 errors:**
- Test token is automatically set in development
- Check browser console for token

---

## What You'll See

✅ Dashboard with charts (empty without mock data)  
✅ Theme toggle (light/dark mode)  
✅ BOX sidebar  
✅ Reports page  
✅ Navigation between pages  

---

**Ready!** Follow the steps above to get started. 🚀

