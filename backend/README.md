# HR Management Reporting Backend API
## educoreAI Internal Analytics Platform

### 🚀 Complete Backend Package

This package contains the complete Node.js/Express backend API for the HR & Management Reporting microservice.

## 📦 Package Contents

### Core Application Files
- **Domain Layer** - Business entities, policies, and rules
- **Application Layer** - Use case services and orchestration  
- **Interface Layer** - Express controllers and API endpoints
- **Infrastructure Layer** - Repositories, external services, and data access
- **AI Integration** - OpenAI-powered recommendation engine
- **Complete Test Suite** - Unit, integration, and E2E tests

### Key Features
✅ **Role-based Authentication** - JWT token validation  
✅ **Cross-organizational Dashboard** - Administrator analytics  
✅ **Organization-specific Reporting** - HR employee focused reports  
✅ **AI Recommendation Engine** - OpenAI GPT-4 integration  
✅ **Data Integration** - Six microservice data ingestion  
✅ **Real-time Processing** - Synchronous AI analysis  
✅ **Caching System** - Redis integration  
✅ **Database Operations** - Supabase PostgreSQL integration  

## 🛠️ Technology Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** Supabase (PostgreSQL)
- **Cache:** Redis
- **AI:** OpenAI GPT-4
- **Testing:** Jest + Supertest + Playwright
- **Authentication:** JWT
- **Validation:** Joi

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Redis server
- Supabase account
- OpenAI API key

### Installation
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Configure your environment variables

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

### Environment Variables
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration (Supabase)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Redis Configuration
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h

# External Microservices
DIRECTORY_SERVICE_URL=http://localhost:3001
COURSE_BUILDER_SERVICE_URL=http://localhost:3002
ASSESSMENT_SERVICE_URL=http://localhost:3003
LEARNER_AI_SERVICE_URL=http://localhost:3004
LEARNING_ANALYTICS_SERVICE_URL=http://localhost:3005
DEVLAB_SERVICE_URL=http://localhost:3006
AUTH_SERVICE_URL=http://localhost:3007

# AI Configuration
OPENAI_API_KEY=your_openai_api_key
AI_MODEL=gpt-4
```

## 📡 API Endpoints

### Dashboard Endpoints
- `GET /api/dashboards/admin` - Administrator dashboard
- `GET /api/dashboards/hr/:orgId` - HR employee dashboard

### Report Endpoints
- `POST /api/reports/generate` - Generate reports
- `GET /api/reports/:id` - Get report details
- `GET /api/reports` - Get report history

### AI Insights Endpoints
- `POST /api/insights/analyze` - AI analysis
- `POST /api/insights/:id/approve` - Approve recommendation
- `POST /api/insights/:id/reject` - Reject recommendation
- `GET /api/insights/stats` - Recommendation statistics

### Data Ingestion Endpoints
- `POST /api/data/ingest` - Ingest all data
- `POST /api/data/ingest/:serviceName` - Ingest specific service

### Health Check
- `GET /health` - Application health status

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Run with coverage
npm run test:coverage
```

### Test Structure
- **Unit Tests** - Domain entities and policies
- **Integration Tests** - API and service integration
- **E2E Tests** - Complete user workflows
- **Performance Tests** - Load testing with Artillery

## 🏗️ Architecture

### Onion Architecture
```
src/
├── domain/           # Business logic and rules
│   ├── entities.js   # Domain entities
│   └── policies.js   # Business policies
├── application/      # Use cases and orchestration
│   ├── services.js   # Application services
│   └── aiInsightsService.js  # AI recommendation engine
├── infrastructure/   # External services and data
│   └── repositories.js  # Data access and external APIs
├── interfaces/       # API controllers
│   └── controllers.js   # Express controllers
├── app.js           # Application setup
└── index.js         # Entry point
```

### Key Services
- **DashboardService** - Dashboard data retrieval
- **ReportGenerationService** - Report creation and management
- **DataIngestionService** - External data integration
- **AIInsightsService** - AI recommendation engine
- **AuthorizationService** - User authentication and authorization

## 🔐 Security Features

- **JWT Authentication** - Token-based authentication
- **Role-based Authorization** - Administrator vs HR employee access
- **PII Filtering** - Personal data protection
- **Input Validation** - Request validation and sanitization
- **Rate Limiting** - API rate limiting
- **CORS Configuration** - Cross-origin request handling
- **Helmet Security** - Security headers

## 📊 AI Integration

### AI Recommendation Engine
- **OpenAI GPT-4** - Advanced language model
- **Pattern Analysis** - Engagement, skill, compliance, performance
- **Interactive Learning** - User feedback improves recommendations
- **Context Preservation** - Recommendations linked to data points
- **Approval Workflow** - Approve/reject with audit trail

### AI Analysis Types
- **Engagement Patterns** - User engagement trends
- **Skill Development** - Learning progress analysis
- **Compliance Risks** - Compliance monitoring
- **Performance Trends** - Performance anomaly detection

## 🚀 Production Deployment

### Docker Support
```bash
# Build Docker image
docker build -t hr-reporting-backend .

# Run with Docker Compose
docker-compose up backend
```

### Health Monitoring
- **Health Checks** - Application health monitoring
- **Graceful Shutdown** - Proper application shutdown
- **Error Handling** - Comprehensive error management
- **Logging** - Structured logging with Winston

## 📈 Performance Features

- **Redis Caching** - 30-day cache with intelligent invalidation
- **Database Indexing** - Optimized queries with proper indexes
- **Connection Pooling** - Efficient database connections
- **Compression** - Response compression
- **Rate Limiting** - API protection

## 🔄 Data Processing Pipeline

1. **Data Ingestion** - Six microservice integration
2. **PII Filtering** - Personal data removal
3. **Data Normalization** - Standardized formats
4. **Aggregation** - Team, department, organization levels
5. **Caching** - Redis cache with TTL
6. **Storage** - PostgreSQL with 5-year retention
7. **AI Analysis** - Real-time recommendation generation

## 📋 Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server
npm test           # Run tests
npm run lint       # Run ESLint
npm run format     # Format code with Prettier
npm run db:migrate # Run database migrations
npm run db:seed    # Seed database with sample data
```

## 🎯 Success Metrics

- **Performance** - Dashboard load time <3 seconds
- **Reliability** - 99.9% uptime during business hours
- **Data Quality** - 100% PII filtering accuracy
- **Security** - Zero unauthorized access incidents
- **AI Effectiveness** - >80% approval rate of recommendations

---

**This backend package provides a complete, production-ready API for the HR & Management Reporting microservice!** 🚀
