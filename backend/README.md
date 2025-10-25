# Backend API Services
## educoreAI Management Reporting Microservice

### Project Structure
```
backend/
├── src/
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── Report.js
│   │   │   ├── Dashboard.js
│   │   │   ├── AIInsight.js
│   │   │   └── User.js
│   │   ├── usecases/
│   │   │   ├── GenerateReport.js
│   │   │   ├── RefreshData.js
│   │   │   ├── AnalyzeWithAI.js
│   │   │   └── ApproveInsight.js
│   │   └── ports/
│   │       ├── MicroservicePort.js
│   │       ├── DataStoragePort.js
│   │       └── AIServicePort.js
│   ├── application/
│   │   ├── services/
│   │   │   ├── ReportService.js
│   │   │   ├── DashboardService.js
│   │   │   └── AIService.js
│   │   ├── dto/
│   │   │   ├── ReportDTO.js
│   │   │   ├── DashboardDTO.js
│   │   │   └── InsightDTO.js
│   │   └── handlers/
│   │       ├── ReportHandler.js
│   │       ├── DashboardHandler.js
│   │       └── InsightHandler.js
│   ├── infrastructure/
│   │   ├── adapters/
│   │   │   ├── DirectoryAdapter.js
│   │   │   ├── CourseBuilderAdapter.js
│   │   │   ├── AssessmentAdapter.js
│   │   │   ├── LearnerAIAdapter.js
│   │   │   ├── DevLabAdapter.js
│   │   │   └── LearningAnalyticsAdapter.js
│   │   ├── repositories/
│   │   │   ├── ReportRepository.js
│   │   │   ├── DashboardRepository.js
│   │   │   └── InsightRepository.js
│   │   ├── external/
│   │   │   ├── GeminiAIClient.js
│   │   │   └── SupabaseClient.js
│   │   └── cache/
│   │       └── RedisClient.js
│   └── interfaces/
│       ├── controllers/
│       │   ├── DashboardController.js
│       │   ├── ReportController.js
│       │   └── InsightController.js
│       ├── middleware/
│       │   ├── auth.js
│       │   ├── logging.js
│       │   └── errorHandler.js
│       └── routes/
│           ├── dashboard.js
│           ├── reports.js
│           └── insights.js
├── tests/
│   ├── unit/
│   │   ├── domain/
│   │   ├── application/
│   │   └── infrastructure/
│   ├── integration/
│   │   ├── api/
│   │   ├── database/
│   │   └── external/
│   └── fixtures/
│       ├── mockData.js
│       └── testData.js
├── config/
│   ├── database.js
│   ├── redis.js
│   └── external.js
├── utils/
│   ├── logger.js
│   ├── validator.js
│   └── transformer.js
├── app.js
├── server.js
└── package.json
```

### Technology Stack
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** PostgreSQL (Supabase)
- **Cache:** Redis
- **AI Integration:** Gemini AI API
- **Testing:** Jest + Supertest
- **Authentication:** JWT
- **Logging:** Winston

### Getting Started

1. **Install Dependencies:**
```bash
cd backend
npm install
```

2. **Environment Setup:**
```bash
cp .env.example .env
# Configure your environment variables
```

3. **Database Setup:**
```bash
npm run db:migrate
npm run db:seed
```

4. **Development:**
```bash
npm run dev
```

### API Endpoints

#### Dashboard Endpoints
- `GET /api/dashboards/admin` - Administrator dashboard overview
- `GET /api/dashboards/hr/:orgId` - HR employee dashboard

#### Report Endpoints
- `POST /api/reports/generate` - Generate new reports
- `GET /api/reports/:id` - Get report details
- `POST /api/reports/:id/refresh` - Refresh report data
- `GET /api/reports/:id/download` - Download report as PDF

#### AI Insight Endpoints
- `POST /api/insights/analyze` - AI analysis of report data
- `POST /api/insights/:id/approve` - Approve AI recommendation
- `POST /api/insights/:id/reject` - Reject AI recommendation

### Testing

#### Unit Tests
```bash
npm run test:unit
```

#### Integration Tests
```bash
npm run test:integration
```

#### Coverage Report
```bash
npm run test:coverage
```

### Development Status
**Current Phase:** Development Implementation  
**Progress:** Backend API services implemented with TDD approach  
**Next:** Frontend dashboard components and AI integration