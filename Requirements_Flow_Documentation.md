# Requirements Flow Documentation
## EducoreAI Management Reporting Microservice

---

## Document Overview

**Version:** 1.0  
**Date Created:** Phase 3 - Requirements and Flow Documentation  
**Status:** Draft for Review

This document maps the logical flows between requirements, describing how user actions and system responses connect to produce outputs. Each flow traces from input → process → output, ensuring complete traceability between user needs, technical solutions, and validation tests.

---

## Flow Documentation Structure

Each flow includes:
- **Flow Name:** Descriptive name of the flow
- **Trigger:** What initiates the flow
- **Input:** Data or actions entering the flow
- **Process Steps:** Detailed sequence of operations
- **Output:** Resulting data or system state
- **Related Requirements:** Traceability to functional requirements
- **Error Handling:** How errors are handled in the flow
- **Validation Points:** Where flow can be validated/tested

---

## Flow 1: User Login to Dashboard View

### Flow Overview
**Name:** User Login to Dashboard View  
**Type:** Primary User Flow  
**Priority:** MVP Critical

### Flow Description
Complete flow from user authentication through dashboard display, ensuring secure access and fast data presentation.

### Trigger
User accesses Management Reporting through EducoreAI unified menu.

### Input
- User credentials (handled by EducoreAI AUTH)
- JWT token from central AUTH service
- User role information

### Process Steps

1. **Authentication (FR-8.1)**
   - User clicks "Management Reporting" in EducoreAI menu
   - System receives JWT token from central AUTH service
   - JWT validation middleware validates token
   - Token expiration checked (2-hour validity)
   - User identity extracted from token claims

2. **Authorization (FR-8.2)**
   - User role checked from JWT claims
   - System Administrator role verified
   - If not System Administrator → Access denied with clear message
   - If authorized → Access granted

3. **Dashboard Data Retrieval (FR-1.1, FR-6.1)**
   - Frontend requests dashboard data from backend
   - Backend queries Redis cache using key patterns
   - Cache retrieval service fetches data for all 6-8 charts
   - Data aggregated and formatted for each chart type

4. **Data Formatting (FR-1.1)**
   - Data normalized to chart format
   - Chart.js data structures created
   - Metadata added (last updated timestamp, data source)

5. **Dashboard Rendering (FR-1.1, FR-7.1)**
   - Frontend receives formatted data
   - React components render charts
   - TailwindCSS styling applied
   - Theme (Light/Dark) applied based on user preference
   - Loading states transition to content display

### Output
- Dashboard displayed with 6-8 primary charts
- All charts showing current data
- Last updated timestamp visible
- Navigation header visible
- User authenticated and authorized

### Performance Requirements
- **Target:** Dashboard loads in ≤2 seconds (NFR-1.1, NFR-PERF-1)
- **Measurement:** Time from page load to all charts displayed

### Related Requirements
- FR-1.1: Dashboard Display
- FR-6.1: Cache Technology
- FR-7.1: Design System
- FR-8.1: Authentication
- FR-8.2: Authorization
- NFR-1.1: Performance (≤2 seconds)
- NFR-PERF-1: Response Times

### Error Handling
- **Invalid Token:** Access denied, redirect to login
- **Expired Token:** Token refresh attempted, or re-authentication required
- **Unauthorized Role:** Clear error message, access denied
- **Cache Unavailable:** Fallback to backup source or error message
- **Data Unavailable:** "No data available" message displayed

### Validation Points
1. ✅ JWT token validation works correctly
2. ✅ Role checking functions properly
3. ✅ Cache retrieval completes successfully
4. ✅ Dashboard renders within 2 seconds
5. ✅ All charts display correctly
6. ✅ Error handling works for all failure scenarios

---

## Flow 2: Daily Automated Data Collection

### Flow Overview
**Name:** Daily Automated Data Collection  
**Type:** Background Process Flow  
**Priority:** MVP Critical

### Flow Description
Automated daily collection of data from all 5 microservices, normalization, and storage in Redis cache.

### Trigger
Scheduled job executes at 07:00 AM daily (FR-5.1).

### Input
- Scheduled trigger (cron-like scheduler)
- Current date/time
- JWT token for microservice authentication
- Microservice API endpoints

### Process Steps

1. **Scheduler Trigger (FR-5.1)**
   - Scheduled job service triggers at 07:00 AM
   - Collection process initiated
   - Metadata logged (collection start time)

2. **Microservice Data Collection (FR-5.2)**
   For each of 5 microservices:
   - **DIRECTORY** (`/directory/data`)
   - **COURSE BUILDER** (`/course-builder/data`)
   - **ASSESSMENT** (`/assessment/summary`)
   - **CONTENT STUDIO** (`/content-studio/data`)
   - **LEARNING ANALYTICS** (`/learning-analytics/summary`)
   
   Process for each:
   - API request sent with JWT token
   - Request specifies last 24 hours of data
   - Response received in JSON format
   - Response validated (status code, content type)

3. **Data Validation (FR-5.4)**
   - Required fields checked (course_id, metrics, feedback, skill_data, etc.)
   - Values validated (non-empty, correct types)
   - JSON schema validation
   - Data type and range validation

4. **Data Normalization (FR-5.5)**
   - Date format unified to YYYY-MM-DDTHH:mm:ssZ (ISO 8601)
   - Scaling standardized (0-100 scale for grades/percentages)
   - Deduplication based on source ID + timestamp
   - Outlier detection and tagging (is_suspect=true)
   - Schema version added to each entry

5. **Cache Storage (FR-6.2, FR-6.4)**
   - Cache keys generated using naming convention:
     - `mr:dir:<orgId|userId>:<yyyymmdd>`
     - `mr:cb:<courseId>:<yyyymmdd>`
     - `mr:assess:<courseId|skillId>:<yyyymmdd>`
     - `mr:cs:<contentId|courseId>:<yyyymmdd>`
     - `mr:la:<period>:<yyyymmdd>`
   - Data stored with metadata (collected_at, source, schema_version)
   - TTL set to 60 days (FR-6.3)
   - Atomic write operations ensure consistency

6. **Retry Logic (FR-5.6)**
   If microservice unavailable:
   - Up to 3 retry attempts
   - 10-minute interval between retries
   - If all retries fail → Alert sent
   - Other microservices continue processing
   - Existing cache data preserved

7. **Partial Failure Handling (FR-5.8)**
   If some microservices succeed and others fail:
   - Successful collections stored
   - Failed services logged
   - "Partial Data" warning prepared for dashboard
   - Collection status recorded

8. **Collection Completion (FR-5.1)**
   - Collection metadata logged (end time, success/failure status)
   - Dashboard "Last updated" timestamp updated
   - Alerts sent if critical failures occurred

### Output
- Cache populated with latest 24 hours of data
- All successful microservice collections stored
- Failed collections logged for retry
- Collection status available for dashboard display
- Cache TTL set to 60 days

### Performance Requirements
- **Target:** Complete all 5 microservices within 15 minutes (NFR-5.1)
- **Measurement:** Time from trigger to completion

### Related Requirements
- FR-5.1: Daily Automated Collection
- FR-5.2: Microservice Integration
- FR-5.4: Data Validation
- FR-5.5: Data Normalization
- FR-5.6: Retry Logic
- FR-5.8: Partial Failure Handling
- FR-6.2: Key Naming Convention
- FR-6.3: Data Retention
- FR-6.4: Cache Operations
- NFR-5.1: Collection Performance

### Error Handling
- **Microservice Unavailable:** Retry up to 3 times, then alert
- **Invalid Data:** Validation errors logged, data rejected
- **Cache Write Failure:** Retry cache operation, alert if persistent
- **Network Failure:** Retry with backoff, preserve existing data
- **Partial Failure:** Continue with available data, warn user

### Validation Points
1. ✅ Scheduled job triggers at 07:00 AM
2. ✅ All 5 microservices called correctly
3. ✅ Data validation works for all fields
4. ✅ Normalization produces consistent format
5. ✅ Cache keys follow naming convention
6. ✅ Data stored with correct TTL
7. ✅ Retry logic works for failures
8. ✅ Partial failures handled gracefully

---

## Flow 3: Report Generation with AI Analysis

### Flow Overview
**Name:** Report Generation with AI Analysis  
**Type:** Primary User Flow  
**Priority:** MVP Critical

### Flow Description
Complete flow from user selecting report type through PDF generation with embedded AI insights.

### Trigger
User selects report type and clicks "Generate Report" button (FR-3.1).

### Input
- Report type selection (1 of 8 report types)
- User preferences (date range, filters)
- Current cache data

### Process Steps

1. **Report Selection (FR-3.1)**
   - User selects report type from Reports page
   - Report type validated
   - User preferences retrieved (if saved)

2. **Data Retrieval (FR-3.4, FR-6.1)**
   - Backend queries Redis cache for relevant data
   - Data retrieved using appropriate key patterns
   - Data aggregated according to report type requirements
   - Date range and filters applied

3. **Report Data Formatting (FR-3.2)**
   - Data formatted according to report template
   - Executive Summary data prepared
   - Chart data formatted for 2-3 main charts
   - Detailed data table prepared

4. **Chart Generation (FR-3.2)**
   - Charts generated using same visualization library as dashboard
   - Charts embedded in report structure
   - High-resolution charts prepared for PDF

5. **Report Structure Assembly (FR-3.2)**
   - Executive Summary section created
   - Key Visual Charts section created
   - Detailed Data Table section created
   - Report structure validated

6. **AI Analysis (FR-4.1, FR-4.4)**
   - Report data extracted and formatted for AI
   - Custom prompt generated based on report type (FR-4.2)
   - Request sent to OpenAI API (GPT-4-Turbo)
   - AI analyzes data and generates insights
   - AI response validated (400-word limit, FR-4.3)
   - AI insights formatted (Observations, Trends, Anomalies, Recommendations)

7. **AI Integration (FR-4.4)**
   - AI insights embedded into report
   - "AI Insights & Recommendations" section added
   - Report structure: Executive Summary → Charts → Data Table → AI Insights

8. **PDF Generation (FR-3.3)**
   - PDF created using reportlab/Puppeteer
   - A4 format with 1.5cm margins
   - EducoreAI logo added to header
   - Date and page number added to footer
   - All sections included (Summary, Charts, Table, AI Insights)
   - High-resolution charts embedded
   - Professional formatting applied

9. **Error Handling - AI Unavailable (FR-4.5)**
   If OpenAI API fails:
   - Report generated normally without AI
   - Message added: "AI analysis unavailable – report generated without insights"
   - Process continues without blocking

10. **Report Delivery (FR-3.4)**
    - PDF returned to frontend
    - Progress indicator shows completion
    - PDF displayed in browser
    - Download button enabled

### Output
- Complete PDF report with all sections
- AI insights included (if API available)
- Report ready for download
- Report generation logged for audit

### Performance Requirements
- **Target:** Report generation in ≤5 seconds average (NFR-3.1)
- **Stretch Goal:** Sub-3-second generation
- **Timeout:** 30 seconds maximum (FR-3.5)

### Related Requirements
- FR-3.1: Report Types
- FR-3.2: Report Structure
- FR-3.3: PDF Export
- FR-3.4: Report Generation Process
- FR-3.5: Report Generation Timeout
- FR-4.1: AI Model Selection
- FR-4.2: AI Prompt Structure
- FR-4.3: AI Output Format
- FR-4.4: AI Integration Process
- FR-4.5: AI Error Handling
- FR-6.1: Cache Technology
- NFR-3.1: Performance (≤5 seconds)
- NFR-3.2: PDF Quality

### Error Handling
- **Timeout Exceeded:** Automatic retry once, then error message (FR-3.5)
- **AI API Failure:** Report generated without AI, message displayed (FR-4.5)
- **Cache Unavailable:** Error message, retry option
- **PDF Generation Failure:** Error message, retry option
- **Invalid Report Type:** Validation error, user notified

### Validation Points
1. ✅ Report type selection works correctly
2. ✅ Data retrieval from cache successful
3. ✅ Report structure assembled correctly
4. ✅ Charts generated and embedded
5. ✅ AI analysis completes (when available)
6. ✅ AI insights formatted correctly
7. ✅ PDF generated with correct format
8. ✅ Report completes within 5 seconds
9. ✅ Error handling works for all scenarios

---

## Flow 4: Manual Data Refresh

### Flow Overview
**Name:** Manual Data Refresh  
**Type:** User-Initiated Flow  
**Priority:** MVP High

### Flow Description
User-triggered near-real-time data pull from microservices to update dashboard immediately.

### Trigger
User clicks "DATA REFRESH" button on dashboard or chart detail page (FR-5.7).

### Input
- User action (button click)
- Current JWT token
- Microservice API endpoints

### Process Steps

1. **User Initiation (FR-5.7)**
   - User clicks "DATA REFRESH" button
   - Frontend sends refresh request to backend
   - Progress indicator displayed

2. **Microservice Data Pull (FR-5.2, FR-5.7)**
   For each of 5 microservices:
   - API request sent with JWT token
   - Request specifies last 24 hours of data
   - Response received in JSON format
   - Rate limiting enforced (~100 requests/min, FR-5.9)

3. **Data Validation (FR-5.4)**
   - Required fields validated
   - JSON schema validated
   - Data type validation

4. **Data Normalization (FR-5.5)**
   - Date format unified
   - Scaling standardized
   - Deduplication applied
   - Outlier detection

5. **Temporary Cache Update (FR-5.7, FR-6.4)**
   - Data stored temporarily (not persisted to permanent cache)
   - Cache updated for immediate use
   - Next automatic collection (07:00 AM) will overwrite

6. **Dashboard Update (FR-1.3)**
   - Frontend notified of data update
   - Charts refresh with new data
   - Progress indicator shows completion
   - Success message displayed

### Output
- Dashboard updated with latest data
- Charts reflect most current information
- Manual refresh data available (until next automatic collection)
- User feedback (success/error message)

### Performance Requirements
- **Target:** Manual refresh completes in ≤5 seconds (NFR-PERF-1)
- **Measurement:** Time from button click to charts updated

### Related Requirements
- FR-1.3: Data Refresh
- FR-5.2: Microservice Integration
- FR-5.4: Data Validation
- FR-5.5: Data Normalization
- FR-5.7: Manual Data Refresh
- FR-5.9: Rate Limiting
- FR-6.4: Cache Operations
- NFR-PERF-1: Response Times (≤5 seconds)

### Error Handling
- **Microservice Unavailable:** Error message, existing data preserved
- **Network Failure:** Retry option, error message
- **Validation Failure:** Error message, partial update if possible
- **Rate Limit Exceeded:** Wait and retry, or error message

### Validation Points
1. ✅ Manual refresh button works correctly
2. ✅ Data pulled from all microservices
3. ✅ Data validated and normalized
4. ✅ Dashboard updates within 5 seconds
5. ✅ Charts reflect new data
6. ✅ Error handling works correctly

---

## Flow 5: Chart Detail Page Access

### Flow Overview
**Name:** Chart Detail Page Access  
**Type:** User Navigation Flow  
**Priority:** MVP High

### Flow Description
User clicks chart on dashboard or BOX to view detailed chart and data table.

### Trigger
User clicks on any chart (main dashboard or BOX sidebar) (FR-1.4, FR-2.1).

### Input
- Chart identifier
- Chart type
- Data source information

### Process Steps

1. **Chart Selection (FR-1.4, FR-2.1)**
   - User clicks chart on dashboard or BOX
   - Chart identifier captured
   - Navigation initiated

2. **Data Retrieval (FR-1.4, FR-6.1)**
   - Backend queries cache for chart-specific data
   - Data retrieved using chart identifier
   - Full dataset retrieved (not just summary)

3. **Chart Data Formatting (FR-1.4)**
   - Data formatted for full-size chart
   - Chart.js configuration prepared
   - Interactive features enabled (zoom, filter)

4. **Data Table Preparation (FR-1.4)**
   - Underlying data formatted as table
   - All data points included
   - Table structure optimized for display

5. **Detail Page Rendering (FR-1.4, FR-7.2)**
   - Full-size chart rendered
   - Data table displayed below chart
   - "Back to Dashboard" button rendered
   - Manual refresh button rendered
   - Export options rendered (PDF, future: Excel)
   - Breadcrumbs updated

6. **User Interaction (FR-1.2)**
   - Chart interactive features available
   - Hover tooltips work
   - Filtering enabled
   - Zoom functionality available

### Output
- Detail page displayed with full-size chart
- Complete data table visible
- Navigation options available
- Export options available

### Performance Requirements
- **Target:** Detail page loads in ≤1 second (NFR-PERF-1)
- **Measurement:** Time from click to page displayed

### Related Requirements
- FR-1.2: Chart Interactivity
- FR-1.4: Chart Detail Pages
- FR-2.1: BOX Sidebar Display
- FR-6.1: Cache Technology
- FR-7.2: Navigation Structure
- NFR-PERF-1: Response Times (≤1 second)

### Error Handling
- **Chart Not Found:** Error message, redirect to dashboard
- **Data Unavailable:** "No data available" message
- **Cache Failure:** Error message, retry option

### Validation Points
1. ✅ Chart click opens detail page
2. ✅ Full-size chart displays correctly
3. ✅ Data table shows all underlying data
4. ✅ Navigation buttons work correctly
5. ✅ Export options functional
6. ✅ Page loads within 1 second

---

## Flow 6: BOX Sidebar Chart Discovery

### Flow Overview
**Name:** BOX Sidebar Chart Discovery  
**Type:** User Exploration Flow  
**Priority:** MVP High

### Flow Description
User opens BOX sidebar, searches/filters charts, and accesses additional metrics.

### Trigger
User clicks BOX toggle button to open sidebar (FR-2.1).

### Input
- User action (sidebar toggle)
- Chart metadata (from cache or configuration)

### Process Steps

1. **Sidebar Opening (FR-2.1, FR-2.5)**
   - User clicks BOX toggle button
   - Sidebar slides in from right (desktop) or up from bottom (mobile)
   - Chart list metadata retrieved

2. **Chart List Display (FR-2.1, FR-2.2)**
   - 10-15 additional charts listed
   - Charts organized by categories:
     - Learning Analytics
     - Course Data
     - Content Studio
     - Assessments
   - Chart metadata displayed (FR-2.4):
     - Data source
     - Description
     - Update frequency
     - Last collected timestamp

3. **Search Functionality (FR-2.3)**
   - User types in search bar
   - Instant fuzzy matching (real-time)
   - Results filtered by:
     - Chart name
     - Category
     - Data source
   - Results update as user types (<100ms response)

4. **Chart Selection (FR-2.1)**
   - User clicks chart from list
   - Chart identifier captured
   - Navigation to detail page (same as Flow 5)

5. **Detail Page Display (FR-1.4)**
   - Same detail page structure as main dashboard charts
   - Full-size chart and data table
   - Navigation back to dashboard or BOX

### Output
- BOX sidebar displayed with chart list
- Search results filtered in real-time
- Chart detail page accessible
- User can discover and access additional metrics

### Performance Requirements
- **Target:** Sidebar opens/closes in <500ms (NFR-2.1)
- **Target:** Search results appear in <100ms (NFR-2.2)

### Related Requirements
- FR-2.1: BOX Sidebar Display
- FR-2.2: Chart Categorization
- FR-2.3: Search Functionality
- FR-2.4: Chart Metadata
- FR-2.5: BOX Navigation
- FR-1.4: Chart Detail Pages
- NFR-2.1: Performance (<500ms)
- NFR-2.2: Search Performance (<100ms)

### Error Handling
- **Metadata Unavailable:** Default metadata displayed
- **Search No Results:** "No results found" message
- **Chart Unavailable:** Error message, option to retry

### Validation Points
1. ✅ BOX sidebar opens/closes smoothly
2. ✅ Chart list displays correctly
3. ✅ Categories organize charts properly
4. ✅ Search provides instant results
5. ✅ Chart selection opens detail page
6. ✅ Responsive design works (sidebar/bottom sheet)

---

## Flow 7: Cache Cleanup and Expiration

### Flow Overview
**Name:** Cache Cleanup and Expiration  
**Type:** Background Maintenance Flow  
**Priority:** MVP High

### Flow Description
Automatic cleanup of expired cache entries to maintain 60-day rolling window.

### Trigger
Scheduled cleanup job runs every 24 hours (FR-6.5).

### Input
- Scheduled trigger (daily cleanup job)
- Current date/time
- Cache key patterns

### Process Steps

1. **Cleanup Trigger (FR-6.5)**
   - Scheduled job triggers daily
   - Cleanup process initiated
   - Current date calculated

2. **Expiration Calculation (FR-6.3)**
   - 60-day cutoff date calculated
   - Keys older than 60 days identified
   - Key patterns matched for expiration

3. **Key Identification (FR-6.2)**
   - Redis key scan for all `mr:*` keys
   - Date extracted from key (yyyymmdd format)
   - Keys older than cutoff identified

4. **Expiration Processing (FR-6.3, FR-6.5)**
   - Expired keys deleted from Redis
   - TTL expiration also handled automatically
   - Deletion logged for monitoring

5. **Cache Size Management (FR-6.7)**
   - Cache size checked
   - Metrics recorded
   - Alerts sent if size approaches limits

6. **Cleanup Completion (FR-6.5)**
   - Cleanup metadata logged
   - Statistics recorded (keys deleted, size reduction)
   - Process completes

### Output
- Expired cache entries removed
- Cache size within limits
- 60-day rolling window maintained
- Cleanup statistics logged

### Performance Requirements
- **Target:** Cleanup completes without impacting user operations
- **Measurement:** Cleanup duration and cache size reduction

### Related Requirements
- FR-6.2: Key Naming Convention
- FR-6.3: Data Retention (60-day window)
- FR-6.5: Cache Cleanup
- FR-6.7: Cache Size Management

### Error Handling
- **Cleanup Failure:** Error logged, retry scheduled
- **Cache Lock:** Wait and retry
- **Size Limit Exceeded:** Alert sent, manual intervention may be required

### Validation Points
1. ✅ Cleanup job runs daily
2. ✅ 60-day cutoff calculated correctly
3. ✅ Expired keys identified and deleted
4. ✅ Cache size managed within limits
5. ✅ Cleanup doesn't impact user operations

---

## Flow 8: Error Recovery and Fallback

### Flow Overview
**Name:** Error Recovery and Fallback  
**Type:** System Resilience Flow  
**Priority:** MVP Critical

### Flow Description
System handles various error scenarios gracefully, ensuring continued operation.

### Error Scenarios

#### Scenario 1: Microservice Unavailable (FR-5.6)
**Flow:**
1. API request to microservice fails
2. Retry logic activated (up to 3 attempts, 10-minute intervals)
3. If all retries fail:
   - Alert sent
   - Existing cache data preserved
   - Other microservices continue
   - "Partial Data" warning prepared

#### Scenario 2: Cache Failure (FR-6.1)
**Flow:**
1. Cache operation fails
2. Fallback to backup cache (if available)
3. If backup unavailable:
   - Error message displayed
   - System attempts to continue with degraded functionality
   - Alert sent for immediate attention

#### Scenario 3: AI API Failure (FR-4.5)
**Flow:**
1. OpenAI API request fails
2. Report generation continues without AI
3. Message added: "AI analysis unavailable – report generated without insights"
4. Report still generated with quantitative data
5. Error logged for monitoring

#### Scenario 4: Data Validation Failure (FR-5.4)
**Flow:**
1. Data validation fails
2. Invalid data rejected
3. Error logged with details
4. Collection continues with valid data
5. Partial data warning if significant failures

#### Scenario 5: Report Generation Timeout (FR-3.5)
**Flow:**
1. Report generation exceeds 30 seconds
2. Automatic retry initiated (once)
3. If retry also times out:
   - Error message displayed
   - User can manually retry
   - Issue logged for investigation

### Related Requirements
- FR-4.5: AI Error Handling
- FR-5.6: Retry Logic
- FR-5.8: Partial Failure Handling
- FR-3.5: Report Generation Timeout
- FR-6.1: Cache Technology

### Validation Points
1. ✅ All error scenarios handled gracefully
2. ✅ Retry logic works correctly
3. ✅ Fallback mechanisms function
4. ✅ Error messages are clear and actionable
5. ✅ System continues operating despite errors

---

## Flow Traceability Matrix

| Flow | Related Features | Functional Requirements | User Stories |
|------|-----------------|------------------------|--------------|
| Flow 1: Login to Dashboard | Feature 1, 6, 7, 8 | FR-1.1, FR-6.1, FR-7.1, FR-8.1, FR-8.2 | US-1.1, US-8.1 |
| Flow 2: Daily Collection | Feature 5, 6 | FR-5.1-5.8, FR-6.2-6.4 | US-5.1 |
| Flow 3: Report Generation | Feature 3, 4, 6 | FR-3.1-3.5, FR-4.1-4.5, FR-6.1 | US-3.1, US-4.1, US-4.3 |
| Flow 4: Manual Refresh | Feature 1, 5, 6 | FR-1.3, FR-5.2-5.7, FR-6.4 | US-1.4, US-5.2 |
| Flow 5: Chart Details | Feature 1, 2, 6, 7 | FR-1.2, FR-1.4, FR-2.1, FR-6.1, FR-7.2 | US-1.3, US-2.1 |
| Flow 6: BOX Discovery | Feature 2, 6, 7 | FR-2.1-2.5, FR-6.1, FR-7.2 | US-2.1, US-2.2, US-2.3 |
| Flow 7: Cache Cleanup | Feature 6 | FR-6.2, FR-6.3, FR-6.5, FR-6.7 | - |
| Flow 8: Error Recovery | All Features | FR-4.5, FR-5.6, FR-5.8, FR-3.5 | US-4.3, US-5.3 |

---

## Document Approval

This Requirements Flow Documentation maps all logical flows between requirements, ensuring complete traceability from user actions through system processes to outputs.

**Please review this document and provide feedback. All feedback will be logged in `customFile.md`, and the document will be revised until you confirm it is perfect and fully aligned with your expectations.**

Only after your explicit approval will the process continue to Phase 4: System & Data Architecture.

---

**End of Requirements Flow Documentation**

