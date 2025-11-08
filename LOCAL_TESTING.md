# Local Testing Guide
## EducoreAI Management Reporting Microservice

This guide will help you set up and test the application locally before deployment.

---

## Prerequisites

Before starting, ensure you have:

- **Node.js** 18+ installed ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **Redis** instance (local or cloud)
- **Git** (optional)

---

## Step 1: Install Dependencies

### Backend Dependencies

```bash
cd backend
npm install
```

### Frontend Dependencies

```bash
cd frontend
npm install
```

---

## Step 2: Set Up Redis

### Option 1: Local Redis with Docker (Recommended)

```bash
docker run -d -p 6379:6379 --name redis-management-reporting redis:latest
```

### Option 2: Local Redis Installation

If you have Redis installed locally, ensure it's running:

```bash
# Windows (if installed)
redis-server

# macOS (with Homebrew)
brew services start redis

# Linux
sudo systemctl start redis
```

### Option 3: Redis Cloud (Free Tier)

1. Sign up at [Redis Cloud](https://redis.com/try-free/)
2. Create a free database
3. Copy connection details to `.env` file

---

## Step 3: Configure Environment Variables

### Backend Configuration

1. Copy the example environment file:
   ```bash
   cd backend
   copy .env.example .env
   ```
   (On Linux/Mac: `cp .env.example .env`)

2. Edit `backend/.env` and update:
   - `JWT_SECRET` - Use a strong secret (minimum 32 characters)
   - `REDIS_HOST` - Your Redis host (localhost if local)
   - `REDIS_PORT` - Your Redis port (6379 default)
   - `REDIS_PASSWORD` - If your Redis requires a password
   - `OPENAI_API_KEY` - Your OpenAI API key (optional for testing)
   - `MICROSERVICE_JWT_TOKEN` - JWT token for microservice communication

### Frontend Configuration

1. Copy the example environment file:
   ```bash
   cd frontend
   copy .env.example .env
   ```
   (On Linux/Mac: `cp .env.example .env`)

2. Edit `frontend/.env` and ensure:
   - `VITE_API_URL` points to your backend (default: `http://localhost:3000/api/v1`)

---

## Step 4: Start the Application

### Terminal 1: Start Backend

```bash
cd backend
npm run dev
```

You should see:
```
Server running on port 3000
Environment: development
Initializing scheduled jobs...
All scheduled jobs initialized
```

**Test the backend:**
- Open browser: `http://localhost:3000/health`
- Should return: `{"status":"healthy","timestamp":"...","service":"management-reporting"}`

### Terminal 2: Start Frontend

```bash
cd frontend
npm run dev
```

You should see:
```
VITE v5.0.8  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

**Open the application:**
- Browser: `http://localhost:5173`

---

## Step 5: Set Up Test Authentication

For local testing, you have two options:

### Option 1: Use Test Token (Easiest)

The frontend automatically sets a test token in development mode. The backend will accept it in development.

**No action needed** - it works automatically!

### Option 2: Generate Real Test JWT Token

If you want to test with a real JWT token:

1. **Generate test token:**
   ```bash
   cd backend
   node scripts/generateTestToken.js
   ```

2. **Copy the token** from the output

3. **Set token in browser:**
   - Open browser console (F12)
   - Run: `localStorage.setItem('authToken', 'YOUR_TOKEN_HERE')`
   - Refresh the page

---

## Step 6: Add Mock Data (Optional)

To see charts with data:

1. **Run the mock data script:**
   ```bash
   cd backend
   node scripts/addMockData.js
   ```

2. **Refresh your dashboard** - you should now see charts with data!

---

## Step 7: Testing the Application

### 1. Health Check

- **Backend:** `http://localhost:3000/health`
- Should return healthy status

### 2. Dashboard

- Navigate to: `http://localhost:5173/dashboard`
- You should see the dashboard with charts
- If no data, charts will show empty states (expected without microservice data)

### 3. Data Refresh

- Click "Refresh Data" button
- Check browser console for API calls
- Check backend logs for data collection attempts

### 4. BOX Sidebar

- Click "BOX" button in dashboard
- Sidebar should open with chart list
- Search and filter should work

### 5. Reports

- Navigate to: `http://localhost:5173/reports`
- Select a report type
- Click "Generate Report"
- PDF should download (if OpenAI key configured)

### 6. Theme Toggle

- Click theme toggle in header
- Should switch between light/dark modes
- Preference should persist

---

## Testing Partial Refresh Feature

To test the partial refresh functionality:

1. **Simulate Service Failure:**
   - Stop one of the microservices (if running)
   - Or modify `backend/src/infrastructure/clients/MicroserviceHttpClient.js` to throw errors for specific services

2. **Trigger Refresh:**
   - Click "Refresh Data" in dashboard
   - You should see:
     - Warning banner if partial failure
     - "Stale Data" tags on affected charts
     - Modal with failure details

3. **Test Retry:**
   - Click "View details" in banner
   - Click "Retry Failed Sources"
   - Should retry only failed services

---

## Common Issues & Solutions

### Backend Won't Start

**Issue:** Port 3000 already in use
```bash
# Solution: Change PORT in backend/.env
PORT=3001
```

**Issue:** Redis connection failed
```bash
# Solution: Check Redis is running
redis-cli ping
# Should return: PONG
```

**Issue:** Module not found errors
```bash
# Solution: Reinstall dependencies
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Frontend Won't Start

**Issue:** Port 5173 already in use
```bash
# Solution: Vite will automatically use next available port
# Or specify: npm run dev -- --port 5174
```

**Issue:** Cannot connect to backend
```bash
# Solution: Check VITE_API_URL in frontend/.env
# Ensure backend is running on correct port
```

### No Data Showing

**Expected Behavior:** Without microservice data, charts will be empty
- This is normal for local testing
- Charts structure and UI should still be visible
- Test with mock data if needed

### Authentication Errors

**Issue:** 401 Unauthorized errors
```bash
# Solution: 
# 1. Ensure NODE_ENV=development in backend/.env
# 2. Frontend automatically sets test token in development
# 3. If still failing, check browser console for token
# 4. Manually set: localStorage.setItem('authToken', 'test-token-for-local-development')
```

---

## Testing Checklist

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Health check endpoint works
- [ ] Dashboard loads (even with empty data)
- [ ] Theme toggle works
- [ ] BOX sidebar opens/closes
- [ ] Reports page loads
- [ ] Navigation works between pages
- [ ] Refresh button shows loading state
- [ ] Error messages display correctly
- [ ] Responsive design works (resize browser)

---

## Mock Data for Testing

If you want to test with sample data, you can:

1. **Add Mock Data to Redis:**
   ```javascript
   // Create a script: backend/scripts/addMockData.js
   import { createClient } from 'redis';
   
   const client = createClient();
   await client.connect();
   
   const mockData = {
     data: {
       metrics: {
         enrollments: 150,
         completionRate: 85,
         averageRating: 4.5
       }
     },
     metadata: {
       collected_at: new Date().toISOString(),
       source: 'course-builder',
       schema_version: '1.0'
     }
   };
   
   await client.setEx('mr:cb:default:20240115', 5184000, JSON.stringify(mockData));
   console.log('Mock data added');
   await client.quit();
   ```

2. **Run the script:**
   ```bash
   cd backend
   node scripts/addMockData.js
   ```

---

## Next Steps

Once local testing is complete and you're satisfied:

1. ✅ Test all features
2. ✅ Verify UI/UX
3. ✅ Check error handling
4. ✅ Test partial refresh flow
5. ✅ Approve for Phase 9: Deployment

---

## Support

If you encounter issues:

1. Check backend console logs
2. Check browser console (F12)
3. Verify environment variables
4. Ensure Redis is running
5. Check network tab for API calls

---

**Ready to test!** Start with Step 1 and work through each step. Let me know if you encounter any issues!

