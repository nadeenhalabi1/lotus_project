# System & Data Architecture
## HR & Management Reporting Microservice for educoreAI

### Architecture Overview

The HR & Management Reporting microservice adopts an **Onion Architecture** pattern with four concentric layers, ensuring clean separation of concerns, testability, and maintainability while supporting scalable data processing and AI-powered insights.

### System Layers & Components

#### 1. Domain Core Layer
**Purpose:** Defines business concepts, policies, and rules
**Components:**
- **Domain Entities:** Organization, Team, Skill, Metric, Report, AIRecommendation
- **Domain Policies:** Data filtering rules, normalization logic, aggregation policies
- **Business Rules:** Role-based access policies, data retention rules, compliance requirements
- **Value Objects:** MetricValue, TimeRange, UserRole, ReportParameters

#### 2. Application Layer
**Purpose:** Orchestrates use cases and enforces domain rules
**Components:**
- **Use Case Services:** DashboardService, ReportGenerationService, DataIngestionService
- **Application Policies:** Cross-organizational analysis, organization-specific reporting
- **Orchestration:** Report generation workflow, AI analysis coordination
- **Domain Event Handlers:** Data update notifications, user action logging

#### 3. Interface (Inbound) Adapters
**Purpose:** Expose capabilities to clients and translate requests/responses
**Components:**
- **HTTP Controllers:** DashboardController, ReportController, AdminController
- **Scheduled Entry Points:** DataIngestionScheduler, CleanupScheduler
- **API Gateway Integration:** Request routing, authentication, rate limiting
- **WebSocket Handlers:** Real-time dashboard updates (future enhancement)

#### 4. Infrastructure (Outbound) Adapters
**Purpose:** Handle persistence, caching, external microservice access, and AI connectivity
**Components:**
- **Data Access Layer:** Repository implementations, SQL queries, cache operations
- **External Service Clients:** Microservice API clients, AI service integration
- **Storage Services:** Cache management, SQL database operations
- **Observability:** Logging, metrics, tracing, health checks

### Data Architecture & Processing Pipeline

#### Data Flow Architecture
```
Six Microservices → Ingestion Ports → Filtering → Normalization → Aggregation → Cache + SQL → Reporting → AI Analysis → UI
```

#### Ingestion Subsystem
**Components:**
- **Ingestion Coordinator:** Manages scheduled and on-demand data pulls
- **Source Adapters:** Individual adapters for each microservice (DIRECTORY, COURSE BUILDER, ASSESSMENT, LEARNER AI, LEARNING ANALYTICS, DEVLAB)
- **Delta Reader:** Tracks last-pull timestamps and source IDs for efficient updates
- **Idempotent Upserter:** Ensures data consistency during concurrent updates

**Processing Pipeline:**
1. **Filtering Stage:** Remove PII, incomplete records, inactive users
2. **Normalization Stage:** Standardize dates, skill taxonomy, scoring scales
3. **Aggregation Stage:** Group by team, department, organization levels
4. **Storage Stage:** Write to cache (30 days) and SQL database (5 years)

#### Data Storage Architecture

##### Cache Layer (30-day retention)
**Purpose:** Fast access to recent, query-ready aggregates
**Technology:** Redis or similar in-memory store
**Data Types:**
- Pre-aggregated dashboard metrics
- Recent report materials
- User session data
- Frequently accessed lookups

**Cache Patterns:**
- **Read-through:** Pre-aggregated metrics loaded on ingestion
- **Cache-aside:** Parametrized reports and user-specific data
- **Cache priming:** Default admin/HR dashboards pre-loaded

##### SQL Database (5-year retention)
**Purpose:** Long-term storage for historical analysis and compliance
**Schema:** Star schema design for analytical queries

**Fact Tables:**
```sql
fact_metrics (
    org_id VARCHAR(50),
    team_id VARCHAR(50),
    metric_type VARCHAR(100),
    value DECIMAL(10,2),
    time_key DATE,
    created_at TIMESTAMP,
    source_system VARCHAR(50)
)
```

**Dimension Tables:**
```sql
dim_organization (
    org_id VARCHAR(50) PRIMARY KEY,
    org_name VARCHAR(200),
    status VARCHAR(20),
    created_at TIMESTAMP
)

dim_team (
    team_id VARCHAR(50) PRIMARY KEY,
    team_name VARCHAR(200),
    org_id VARCHAR(50),
    department VARCHAR(100)
)

dim_skill (
    skill_id VARCHAR(50) PRIMARY KEY,
    skill_name VARCHAR(200),
    category VARCHAR(100),
    taxonomy_version VARCHAR(20)
)

dim_time (
    time_key DATE PRIMARY KEY,
    year INT,
    quarter INT,
    month INT,
    week INT,
    day_of_week INT
)
```

**Operational Tables:**
```sql
reports (
    report_id UUID PRIMARY KEY,
    user_id VARCHAR(50),
    report_type VARCHAR(100),
    parameters JSON,
    generated_at TIMESTAMP,
    status VARCHAR(20)
)

report_artifacts (
    artifact_id UUID PRIMARY KEY,
    report_id UUID,
    format VARCHAR(20),
    file_path VARCHAR(500),
    created_at TIMESTAMP
)

ai_alerts (
    alert_id UUID PRIMARY KEY,
    report_id UUID,
    data_point VARCHAR(200),
    recommendation TEXT,
    status VARCHAR(20),
    created_at TIMESTAMP,
    approved_by VARCHAR(50)
)

data_pull_log (
    pull_id UUID PRIMARY KEY,
    source_system VARCHAR(50),
    records_processed INT,
    status VARCHAR(20),
    started_at TIMESTAMP,
    completed_at TIMESTAMP
)
```

**Indexing Strategy:**
- **Covering Index:** (org_id, time_key, metric_type) for fast metric queries
- **Partition Pruning:** Time-based partitioning for long-range queries
- **Composite Indexes:** (user_id, report_type) for user-specific reports

### AI Integration Architecture

#### AI Recommendation Engine
**Architecture:** Application service behind stable port interface
**Components:**
- **AIInsightsService:** Core AI analysis service
- **Request/Response Boundary:** Converts reporting payloads to AI format
- **Domain Integration:** Returns domain-level insights for report generation
- **Provider Abstraction:** Decouples from specific AI implementation

**Integration Pattern:**
- **Synchronous Analysis:** AI insights generated during report creation
- **User Feedback Loop:** Approval/rejection patterns improve future recommendations
- **Context Preservation:** AI recommendations linked to specific data points

### Scalability & Performance Architecture

#### Horizontal Scaling Strategy
**Stateless Services:** Interface and Application layers scale independently
**Separate Scaling:** Ingestion workers, report builders, and AI services scale based on demand
**Load Distribution:** API Gateway routes requests across service instances

#### Performance Optimization
**Query Optimization:**
- **Cache-First Strategy:** Recent data served from cache
- **SQL Fallback:** Historical data and drill-downs from database
- **Aggregate Pre-computation:** Common metrics pre-calculated during ingestion

**Concurrency Management:**
- **Idempotent Operations:** Safe concurrent data ingestion
- **Parallel Processing:** Per-source ingestion to avoid contention
- **Connection Pooling:** Efficient database and cache connections

### Security Architecture

#### Authentication & Authorization
**Integration:** Seamless integration with existing AUTH microservice
**Pattern:** JWT token validation through API Gateway
**Role-Based Access:** Administrator (full access) vs HR Employee (limited access)

#### Data Protection
**Confidentiality:** PII filtering during ingestion, aggregated data display only
**Integrity:** Data validation and consistency checks
**Privacy:** User-specific data isolation and access controls

#### Audit & Compliance
**Logging:** Comprehensive audit trails for all system actions
**Transparency:** Key operations logged with user context
**Flexibility:** Adaptable to evolving compliance requirements

### Integration Architecture

#### Contract-Driven Integration
**Approach:** Flexible, technology-agnostic interfaces
**Versioning:** Support for graceful evolution over time
**Resilience:** Error handling, retries, and timeouts consistent with platform standards

#### External Service Integration
**Microservice Clients:** Standardized clients for six data sources
**API Design:** Use-case oriented capabilities with clear contracts
**Error Handling:** Consistent retry mechanisms and failure modes

#### Observability
**Logging:** Structured logs for debugging and monitoring
**Metrics:** Performance and usage metrics
**Tracing:** Request flow tracking across services
**Health Checks:** Service health monitoring and alerting

### Deployment Architecture

#### Service Deployment
**Containerization:** Docker containers for consistent deployment
**Orchestration:** Kubernetes for service management and scaling
**Configuration:** Environment-specific configuration management

#### Data Deployment
**Database:** Managed SQL service with automated backups
**Cache:** Managed Redis cluster with high availability
**Storage:** Object storage for report artifacts and logs

### Monitoring & Observability

#### Health Monitoring
**Service Health:** Endpoint health checks and dependency monitoring
**Data Health:** Data quality metrics and processing status
**Performance:** Response times, throughput, and error rates

#### Alerting
**System Alerts:** Service failures, data processing issues
**Business Alerts:** AI-generated insights and recommendations
**Compliance Alerts:** Security violations, data access anomalies

---

**Document Status:** ✅ System Architecture Complete  
**Next Phase:** Delivery & Tooling  
**Created:** [Current Date]  
**Approved By:** System Architecture Team
