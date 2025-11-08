# Quick Start Guide
## Get Running in 5 Minutes

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (new terminal)
cd frontend
npm install
```

### 2. Set Up Redis

**Option A: Docker (Easiest)**
```bash
docker run -d -p 6379:6379 --name redis-management-reporting redis:latest
```

**Option B: Skip Redis for UI Testing**
- Backend will show errors but frontend will still work
- Charts will be empty (expected)

### 3. Configure Environment

**Backend:**
```bash
cd backend
copy .env.example .env
# Edit .env and set JWT_SECRET (any 32+ character string)
```

**Frontend:**
```bash
cd frontend
copy .env.example .env
# No changes needed - defaults work
```

### 4. Start Services

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 5. Open Application

- **Frontend:** http://localhost:5173
- **Backend Health:** http://localhost:3000/health

### 6. Add Mock Data (Optional)

```bash
cd backend
node scripts/addMockData.js
```

Then refresh the dashboard to see charts with data!

---

## What to Test

✅ Dashboard loads  
✅ Theme toggle works  
✅ BOX sidebar opens  
✅ Reports page loads  
✅ Navigation works  
✅ Refresh button works  

---

## Troubleshooting

**Backend won't start?**
- Check Redis is running: `redis-cli ping`
- Check port 3000 is free

**Frontend won't connect?**
- Check backend is running
- Check `VITE_API_URL` in frontend/.env

**No data showing?**
- This is normal without microservices
- Run `node scripts/addMockData.js` to add sample data

---

**That's it!** You're ready to test locally. 🚀

