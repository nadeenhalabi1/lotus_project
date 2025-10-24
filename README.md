# HR & Management Reporting Microservice
## educoreAI Internal Analytics Platform

### Project Overview
The Management Reporting microservice is an AI-powered internal analytics platform designed exclusively for educoreAI's executive management team. This system serves as the central reporting and insight hub, providing consolidated, intelligent reporting across all educoreAI microservices to enable data-driven decision-making and strategic planning.

### Key Features
- ✅ **Cross-Organizational Dashboard** - Real-time metrics and system overview
- ✅ **AI-Powered Insights** - Automated analysis and recommendations using Gemini AI
- ✅ **Report Generation** - Interactive charts, data tables, and PDF export
- ✅ **Data Integration** - Consolidated data from 6 educoreAI microservices
- ✅ **Real-Time Updates** - Live data refresh and caching optimization
- ✅ **Executive-Only Access** - Secure, role-based authentication
- ✅ **Performance Optimized** - Handles 50+ concurrent users

### Project Structure
```
hr-management-reporting/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── domain/         # Business logic and entities
│   │   ├── application/    # Use cases and services
│   │   ├── infrastructure/ # External integrations
│   │   └── interfaces/     # API controllers and routes
│   ├── tests/             # Comprehensive test suite
│   └── package.json
├── frontend/              # React + Vite dashboard
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── services/      # API integration
│   │   └── hooks/         # Custom React hooks
│   ├── tests/             # Frontend test suite
│   └── package.json
├── database/              # Supabase schema and migrations
│   ├── migrations/
│   └── schema.sql
├── docs/                  # Project documentation
│   ├── Project_Overview.md
│   ├── Requirements_Specification.md
│   ├── System_Data_Architecture.md
│   ├── Test_Strategy.md
│   └── Development_Summary.md
└── ROADMAP.md             # Project progress tracking
```

### Technology Stack
- **Backend:** Node.js + Express + JavaScript
- **Frontend:** React + JavaScript + Vite + Tailwind CSS
- **Database:** PostgreSQL (Supabase Cloud)
- **Cache:** Redis (Supabase Cloud)
- **AI Integration:** Gemini AI API
- **Testing:** Jest + Supertest + Playwright
- **Deployment:** Vercel (Frontend) + Railway (Backend) + Supabase (Database)

### Architecture
The system follows **Onion Architecture** with clean separation of concerns:
- **Domain Layer:** Business entities and use cases
- **Application Layer:** Business logic orchestration
- **Infrastructure Layer:** External integrations and data persistence
- **Interface Layer:** API controllers and user interface

### Getting Started

#### Prerequisites
- Node.js 18+ and npm 8+
- Supabase account
- Gemini AI API key
- Access to educoreAI microservices

#### Installation

1. **Clone Repository:**
```bash
git clone <repository-url>
cd hr-management-reporting
```

2. **Install Dependencies:**
```bash
npm install
```

3. **Environment Setup:**
```bash
# Backend environment
cp backend/.env.example backend/.env
# Configure your backend environment variables

# Frontend environment  
cp frontend/.env.example frontend/.env
# Configure your frontend environment variables
```

4. **Database Setup:**
```bash
cd backend
npm run db:migrate
npm run db:seed
```

5. **Development:**
```bash
# Start both frontend and backend
npm run dev

# Or start individually
npm run dev:frontend  # Frontend on http://localhost:3000
npm run dev:backend   # Backend on http://localhost:3001
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

#### Backend Tests
```bash
cd backend
npm run test              # All tests
npm run test:unit         # Unit tests only
npm run test:integration  # Integration tests only
npm run test:coverage     # Coverage report
```

#### Frontend Tests
```bash
cd frontend
npm run test              # All tests
npm run test:unit         # Unit tests only
npm run test:e2e          # End-to-end tests
npm run test:coverage     # Coverage report
```

#### Test Coverage
- **Unit Tests:** 85%+ coverage
- **Integration Tests:** 100% API endpoint coverage
- **E2E Tests:** Critical user workflows
- **Performance Tests:** Load testing with Artillery.js

### Development Workflow

#### Test-Driven Development (TDD)
1. **Write Test** - Create failing test for new feature
2. **Implement Feature** - Write minimal code to pass test
3. **Refactor** - Improve code quality while maintaining coverage
4. **Review** - Code review and approval process
5. **Merge** - Merge to main branch after approval

#### Quality Gates
- All tests must pass before merge
- Minimum 80% code coverage required
- ESLint and Prettier validation
- Security vulnerability scanning

### Deployment

#### Frontend (Vercel)
- Automatic deployment from GitHub main branch
- Environment variables configured in Vercel dashboard
- Custom domain and SSL certificates

#### Backend (Railway)
- Automatic deployment from GitHub main branch
- Environment variables configured in Railway dashboard
- Health checks and monitoring

#### Database (Supabase)
- Cloud-hosted PostgreSQL database
- Automatic backups and point-in-time recovery
- Real-time subscriptions and API

### Security & Compliance

#### Authentication & Authorization
- JWT-based authentication through AUTH microservice
- Administrator role-only access
- API Gateway validation for all requests

#### Data Protection
- Automatic PII filtering before storage
- Aggregated data display only
- HTTPS with TLS 1.3 encryption
- 12-month audit log retention

#### Security Measures
- Helmet.js security headers
- Rate limiting and CORS protection
- Input validation and sanitization
- Regular security audits

### Performance & Monitoring

#### Performance Metrics
- Dashboard loading: < 3 seconds
- Report generation: < 10 seconds
- API response: < 500ms average
- AI processing: < 5 seconds
- Concurrent users: 50+ supported

#### Monitoring
- Application performance monitoring
- Error tracking and alerting
- Health checks and uptime monitoring
- Performance regression detection

### Development Status
**Current Phase:** Development Implementation ✅ COMPLETED
**Progress:** Core infrastructure and features implemented with TDD approach
**Next:** Security review and production deployment

### Contributing
1. Fork the repository
2. Create a feature branch
3. Write tests for new functionality
4. Implement the feature following TDD
5. Submit a pull request with comprehensive tests

### Documentation
- [Project Overview](docs/Project_Overview.md)
- [Requirements Specification](docs/Requirements_Specification.md)
- [System Architecture](docs/System_Data_Architecture.md)
- [Test Strategy](docs/Test_Strategy.md)
- [Development Summary](docs/Development_Summary.md)
- [Project Roadmap](ROADMAP.md)

### License
MIT License - see LICENSE file for details

### Support
For technical support or questions, please contact the educoreAI development team.