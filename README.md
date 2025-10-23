# HR & Management Reporting Microservice
## educoreAI Internal Analytics Platform

### Project Structure
```
hr-management-reporting/
├── backend/
│   ├── src/
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── interfaces/
│   ├── tests/
│   └── package.json
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
├── database/
│   ├── migrations/
│   └── schema.sql
├── docs/
├── docker-compose.yml
└── README.md
```

### Technology Stack
- **Backend:** Node.js + Express + Supabase + Redis
- **Frontend:** React + Vite + Tailwind CSS
- **Database:** PostgreSQL (Supabase)
- **Cache:** Redis
- **Testing:** Jest + Supertest + Playwright
- **AI:** OpenAI API integration

### Getting Started

1. **Clone and Setup:**
```bash
git clone <repository-url>
cd hr-management-reporting
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

### Features Implemented
- ✅ Role-based authentication and authorization
- ✅ Cross-organizational dashboard for administrators
- ✅ Organization-specific reporting for HR employees
- ✅ AI-powered insights and recommendations
- ✅ Report generation and export (PDF, CSV, Excel)
- ✅ Data integration from six microservices
- ✅ Real-time data processing and caching
- ✅ Comprehensive test coverage

### API Endpoints
- `GET /api/dashboards/admin` - Administrator dashboard
- `GET /api/dashboards/hr/:orgId` - HR employee dashboard
- `POST /api/reports/generate` - Generate reports
- `GET /api/reports/:id` - Get report details
- `POST /api/insights/analyze` - AI analysis
- `POST /api/insights/:id/approve` - Approve AI recommendation
- `POST /api/insights/:id/reject` - Reject AI recommendation

### Development Status
**Current Phase:** Development Implementation  
**Progress:** Core infrastructure and features being implemented  
**Next:** Security review and deployment preparation