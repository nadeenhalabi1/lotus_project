# 🚀 Complete Setup Guide
## HR & Management Reporting Microservice

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Supabase account and project
- Git (for cloning the repository)

---

## 📦 Step 1: Backend Setup

### Navigate to Backend Directory
```bash
cd backend
```

### Install Dependencies
```bash
npm install
```

### Environment Configuration
```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file with your configuration
# Required variables:
# - SUPABASE_URL=your_supabase_url
# - SUPABASE_ANON_KEY=your_supabase_anon_key
# - REDIS_URL=your_redis_url
# - OPENAI_API_KEY=your_openai_api_key
# - JWT_SECRET=your_jwt_secret
```

### Start Backend Server
```bash
npm run dev
```

**Backend will be available at:** `http://localhost:3000`

---

## 📦 Step 2: Frontend Setup

### Navigate to Frontend Directory
```bash
cd frontend
```

### Install Dependencies
```bash
npm install
```

### Environment Configuration
```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file with your configuration
# Required variables:
# - VITE_API_URL=http://localhost:3000
# - VITE_SUPABASE_URL=your_supabase_url
# - VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Start Frontend Development Server
```bash
npm run dev
```

**Frontend will be available at:** `http://localhost:5173`

---

## 📦 Step 3: Database Setup

### Supabase Configuration
1. **Create a new Supabase project** at [supabase.com](https://supabase.com)
2. **Get your project credentials:**
   - Project URL
   - Anon key
   - Service role key (for backend)

### Run Database Schema
```bash
# Connect to your Supabase database
psql -h your-supabase-host -U postgres -d postgres

# Run the complete schema
\i database/schema.sql

# Verify tables were created
\dt
```

### Alternative: Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `database/schema.sql`
4. Click **Run** to execute the schema

---

## 🐳 Alternative: Docker Setup

### Using Docker Compose
```bash
# From the root directory
docker-compose up -d

# This will start:
# - Backend API (port 3000)
# - Frontend (port 5173)
# - Redis (port 6379)
# - PostgreSQL (port 5432)
```

### Individual Docker Containers
```bash
# Backend
cd backend
docker build -t hr-backend .
docker run -p 3000:3000 hr-backend

# Frontend
cd frontend
docker build -t hr-frontend .
docker run -p 5173:5173 hr-frontend
```

---

## 🔧 Configuration Details

### Backend Environment Variables
```env
# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key

# Redis
REDIS_URL=redis://localhost:6379

# AI Integration
OPENAI_API_KEY=sk-your_openai_key

# Authentication
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h

# Server
PORT=3000
NODE_ENV=development
```

### Frontend Environment Variables
```env
# API Configuration
VITE_API_URL=http://localhost:3000
VITE_API_TIMEOUT=10000

# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# App Configuration
VITE_APP_NAME=HR Management Reporting
VITE_APP_VERSION=1.0.0
```

---

## 🧪 Testing the Setup

### Backend Health Check
```bash
curl http://localhost:3000/health
# Expected response: {"status": "ok", "timestamp": "..."}
```

### Frontend Access
1. Open browser to `http://localhost:5173`
2. You should see the login page
3. Use test credentials (if configured) or create new user

### Database Verification
```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check sample data
SELECT COUNT(*) FROM dim_organization;
SELECT COUNT(*) FROM fact_metrics;
```

---

## 🚨 Troubleshooting

### Common Issues

**Backend won't start:**
- Check if port 3000 is available
- Verify all environment variables are set
- Ensure Node.js 18+ is installed

**Frontend won't start:**
- Check if port 5173 is available
- Verify Vite configuration
- Ensure all dependencies are installed

**Database connection failed:**
- Verify Supabase credentials
- Check network connectivity
- Ensure database schema was applied

**AI recommendations not working:**
- Verify OpenAI API key is valid
- Check API rate limits
- Ensure sufficient credits

### Logs and Debugging
```bash
# Backend logs
cd backend
npm run dev -- --verbose

# Frontend logs
cd frontend
npm run dev -- --debug

# Docker logs
docker-compose logs -f
```

---

## 📊 Access Points

### Application URLs
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000
- **Health Check:** http://localhost:3000/health
- **API Documentation:** http://localhost:3000/api-docs

### Database Access
- **Supabase Dashboard:** https://supabase.com/dashboard
- **Direct Connection:** Use your Supabase connection string

---

## 🎯 Next Steps

1. **Configure Authentication** - Set up user roles and permissions
2. **Add Sample Data** - Import test data for development
3. **Customize Dashboards** - Modify reports for your needs
4. **Deploy to Production** - Use Docker or cloud platforms
5. **Monitor Performance** - Set up logging and metrics

---

## 📚 Additional Resources

- **Backend Documentation:** `backend/README.md`
- **Frontend Documentation:** `frontend/README.md`
- **Database Documentation:** `database/README.md`
- **API Documentation:** Available at `/api-docs` endpoint
- **Project Overview:** `Project_Overview.md`

---

**🎉 Your HR & Management Reporting microservice is now ready to run!**
