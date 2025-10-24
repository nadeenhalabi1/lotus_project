# System & Data Architecture Document
## educoreAI Management Reporting Microservice

### Architecture Overview

The Management Reporting microservice follows an **Onion Architecture** pattern with clean separation of concerns, ensuring maintainability, testability, and scalability. The system is designed to handle 50+ concurrent users with high availability and performance requirements.

### System Layers & Responsibilities

#### 1. Domain Core Layer
**Purpose:** Contains business entities, use cases, and domain logic
**Components:**
- **Entities:** Report, Dashboard, AIInsight, User, Organization
- **Use Cases:** GenerateReport, RefreshData, AnalyzeWithAI, ApproveInsight
- **Domain Services:** ReportAggregationService, DataTransformationService
- **Ports:** External microservice interfaces, data storage interfaces

#### 2. Application Layer
**Purpose:** Orchestrates business logic and coordinates between layers
**Components:**
- **Application Services:** ReportService, DashboardService, AIService
- **DTOs:** ReportDTO, DashboardDTO, InsightDTO
- **Command/Query Handlers:** CQRS pattern for read/write operations
- **Event Handlers:** Domain event processing

#### 3. Infrastructure Layer
**Purpose:** External integrations and data persistence
**Components:**
- **Adapters:** Microservice adapters (Directory, CourseBuilder, Assessment, etc.)
- **Repositories:** Data access implementations
- **External Services:** Gemini AI API client, Supabase client
- **Cache Adapters:** Redis client implementations

#### 4. Interface Layer
**Purpose:** API controllers and external interfaces
**Components:**
- **REST Controllers:** DashboardController, ReportController, InsightController
- **Middleware:** Authentication, logging, error handling
- **API Gateway:** Request routing and validation

### Data Flow Architecture

#### Daily Automatic Pull (08:00 AM)
```
Scheduler → API Gateway → Microservice Adapters → Data Transformation → Cache Storage
```

**Flow Details:**
1. **Scheduler Trigger:** Automated daily pull at 08:00 AM
2. **Data Collection:** Parallel requests to 6 microservices (DIRECTORY, COURSEBUILDER, ASSESSMENT, LEARNERAI, DEVLAB, LEARNING ANALYTICS)
3. **Data Processing:** PII filtering, normalization, taxonomy mapping, aggregation
4. **Cache Storage:** Overview data stored in Redis with 30-day TTL
5. **Fallback:** Historical data from SQL Database if cache is empty

#### On-Demand Refresh (Per-Report)
```
User Request → API Gateway → Targeted Microservice Calls → Data Processing → Report Generation → AI Analysis → Cache Update
```

**Flow Details:**
1. **User Action:** Refresh Data button click on specific report
2. **Targeted Requests:** API calls only to relevant microservices for that report
3. **Data Processing:** Context-specific filtering and aggregation
4. **Report Generation:** Chart, data table, and PDF creation
5. **AI Analysis:** Automatic Gemini API call for insights
6. **Cache Update:** New report stored with unique key

#### Data Transformation Pipeline
```
Raw Data → PII Filtering → Format Normalization → Taxonomy Mapping → Score Unification → Deduplication → Aggregation → Metadata Tagging
```

**Transformation Steps:**
- **PII Filtering:** Remove personally identifiable information
- **Format Normalization:** UTC timestamps, consistent numeric precision
- **Taxonomy Mapping:** Unified skills, course names, difficulty levels
- **Score Unification:** Standardized assessment scales
- **Deduplication:** Merge duplicate records using business keys
- **Aggregation:** Organization/team/period level grouping
- **Metadata:** Timestamp, schema version, data source tracking

### Database Architecture

#### Cache Layer (Redis)
**Purpose:** High-performance data access and temporary storage
**Structure:**
```
Cache Keys:
- Overview_YYYY-MM-DD: Daily overview data
- Report_{ReportType}_{OrgId}_{Period}: Specific report data
- User_{UserId}_Session: User session data
- AI_Insight_{ReportId}: AI analysis results
```

**TTL Strategy:**
- Overview data: 30 days
- Report data: 30 days
- User sessions: 24 hours
- AI insights: 30 days

#### Database Layer (PostgreSQL/Supabase)
**Purpose:** Long-term data storage and historical analysis
**Tables:**
```sql
-- Organizations table
organizations (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Reports table
reports (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  report_type VARCHAR(100) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  data JSONB NOT NULL,
  ai_insights JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL
);

-- AI Insights table
ai_insights (
  id UUID PRIMARY KEY,
  report_id UUID REFERENCES reports(id),
  insight_type VARCHAR(50) NOT NULL,
  confidence_score DECIMAL(3,2) NOT NULL,
  explanation TEXT NOT NULL,
  recommendation TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
  created_at TIMESTAMP DEFAULT NOW()
);

-- Audit Logs table
audit_logs (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  action_type VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100),
  resource_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Data Retention Policy:**
- Cache: 30 days automatic expiration
- Database: 5 years retention
- Automatic deletion after retention period

### Microservice Integration Architecture

#### API Gateway Configuration
**Authentication:** JWT validation through AUTH microservice
**Authorization:** Administrator role-only access
**Rate Limiting:** 100 requests/minute per user
**Circuit Breaker:** 5 failures trigger circuit open
**Retry Policy:** Exponential backoff (1s, 2s, 4s, 8s)

#### External Microservice Adapters
```typescript
// Port definition in Domain layer
interface MicroservicePort {
  getUserData(orgId: string): Promise<UserData[]>;
  getCourseData(orgId: string): Promise<CourseData[]>;
  getAssessmentData(orgId: string): Promise<AssessmentData[]>;
  getSkillData(orgId: string): Promise<SkillData[]>;
  getExerciseData(orgId: string): Promise<ExerciseData[]>;
  getAnalyticsData(orgId: string): Promise<AnalyticsData[]>;
}

// Adapter implementation in Infrastructure layer
class DirectoryAdapter implements MicroservicePort {
  async getUserData(orgId: string): Promise<UserData[]> {
    // Implementation with error handling, retry logic
  }
}
```

#### Error Handling Strategy
**Timeout Configuration:** 30 seconds per microservice call
**Retry Logic:** 3 attempts with exponential backoff
**Fallback Behavior:** Display last cached data with "data not updated" indicator
**Circuit Breaker:** Prevent cascading failures

### AI Integration Architecture

#### Gemini AI Service Integration
**Trigger:** Automatic after each report generation
**Processing:** Synchronous with target latency < 5 seconds
**Data:** Aggregated data only (no PII)
**Fallback:** Report displayed without insights if AI fails

**AI Service Flow:**
```
Report Generated → Data Aggregation → Gemini API Call → Insight Processing → Confidence Filtering → Display Integration
```

**Insight Processing:**
- Confidence threshold: 85%
- Insight types: Anomaly detection, trend analysis, strategic recommendations
- Storage: Insights stored with report data
- Approval workflow: Manual approval/rejection required

### Security Architecture

#### Authentication & Authorization
**JWT Validation:** Through API Gateway and AUTH microservice
**Role-Based Access:** Administrator role only
**Token Expiry:** 8-hour session duration
**Refresh Strategy:** Automatic token refresh

#### Data Security
**Encryption in Transit:** HTTPS with TLS 1.3
**Encryption at Rest:** Database and cache encryption
**PII Protection:** Automatic filtering before storage
**Audit Logging:** All critical actions logged

#### Security Controls
```typescript
// Security middleware
const securityMiddleware = {
  authenticate: (req, res, next) => {
    // JWT validation
  },
  authorize: (req, res, next) => {
    // Role-based access control
  },
  audit: (req, res, next) => {
    // Audit logging
  }
};
```

### Scalability & Performance Strategy

#### Horizontal Scaling
**Load Balancer:** Distributes traffic across multiple instances
**Stateless Design:** No session state stored in application
**Database Scaling:** Read replicas for report queries
**Cache Scaling:** Redis cluster for high availability

#### Performance Optimization
**Caching Strategy:** Cache-aside pattern with 30-day TTL
**Data Compression:** Large payloads compressed in cache
**Query Optimization:** Indexed database queries
**Connection Pooling:** Persistent database connections

#### Monitoring & Observability
**Metrics:** Response times, error rates, cache hit ratio
**Logging:** Structured logs with correlation IDs
**Alerting:** Automated alerts for performance degradation
**Health Checks:** Service health monitoring

### Deployment Architecture

#### Environment Configuration
**Development:** Local development with Docker Compose
**Staging:** Cloud-based staging environment
**Production:** High-availability production deployment

#### Infrastructure Components
**Application Server:** Node.js with Express
**Database:** PostgreSQL (Supabase)
**Cache:** Redis cluster
**Load Balancer:** Nginx or cloud load balancer
**Monitoring:** Application performance monitoring

#### CI/CD Pipeline
**Source Control:** Git with feature branching
**Build Process:** Automated testing and building
**Deployment:** Blue-green deployment strategy
**Rollback:** Automated rollback capability

### Data Flow Diagrams

#### System Overview
```
[User] → [API Gateway] → [Application Layer] → [Domain Layer] → [Infrastructure Layer]
                                                                    ↓
[External Microservices] ← [Adapters] ← [Ports] ← [Use Cases] ← [Entities]
                                                                    ↓
[Cache (Redis)] ← [Repositories] ← [Data Access] ← [Services] ← [Controllers]
                                                                    ↓
[Database (PostgreSQL)] ← [Persistence] ← [Storage] ← [Domain Events]
```

#### Report Generation Flow
```
[User Request] → [Authentication] → [Authorization] → [Data Collection] → [Transformation] → [Report Generation] → [AI Analysis] → [Cache Storage] → [Response]
```

#### Data Synchronization Flow
```
[Scheduler] → [Parallel Data Collection] → [PII Filtering] → [Normalization] → [Aggregation] → [Cache Update] → [Archive to Database]
```

### Compliance & Governance

#### Data Governance
**Data Classification:** Sensitive business data
**Retention Policy:** 30-day cache, 5-year database
**Access Control:** Executive management only
**Audit Trail:** Complete action logging

#### Compliance Requirements
**Data Privacy:** PII filtering and aggregation
**Security Standards:** TLS 1.3, encrypted storage
**Audit Requirements:** 12-month log retention
**Backup Strategy:** Automated daily backups

---
*This System & Data Architecture document provides the technical foundation for implementing the Management Reporting microservice with scalability, security, and compliance requirements.*

