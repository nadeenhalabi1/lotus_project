# Project Overview Document
## EducoreAI Management Reporting Microservice

---

## Project Summary

**Project Name:** EducoreAI Management Reporting Microservice  
**Version:** MVP (Minimum Viable Product)  
**Date Created:** Initial Discovery Phase  
**Status:** Planning & Design Phase

### Executive Summary

The EducoreAI Management Reporting Microservice is a centralized, high-performance reporting and analytics platform designed to unify fragmented data across multiple EducoreAI microservices. Built on a Redis-based cache architecture, it provides system administrators with real-time insights, interactive dashboards, and AI-enhanced analytical reports—all accessible within seconds.

The system eliminates manual data collection and cross-referencing by automatically aggregating data from five core microservices (DIRECTORY, COURSE BUILDER, ASSESSMENT, CONTENT STUDIO, and LEARNING ANALYTICS), normalizing it into a consistent format, and storing it in a high-speed cache for instant retrieval and analysis.

---

## Problem Statement

### Current Challenges

EducoreAI's learning ecosystem consists of multiple independent microservices, each managing its own data domain:

- **DIRECTORY** — User and organization management
- **COURSE BUILDER** — Course creation, enrollment, and completion tracking
- **ASSESSMENT** — Skill evaluations, test results, and grading
- **CONTENT STUDIO** — Content creation metrics and lesson analytics
- **LEARNING ANALYTICS** — Aggregated learning performance statistics

**The Core Problem:** Data fragmentation and inconsistency across these services make it extremely difficult to:
- Generate reliable, comparable reports
- Access real-time, unified data views
- Make data-driven decisions quickly
- Identify trends and patterns across the entire learning ecosystem
- Reduce manual data collection and analysis workload

### Impact of the Problem

- Administrators spend significant time manually collecting and cross-referencing data
- Reports are delayed, outdated, or inconsistent
- Strategic decision-making is hindered by lack of unified insights
- No automated analytical commentary or intelligent recommendations
- Difficulty tracking long-term trends and performance patterns

---

## Target Users and Expected Impact

### Primary Users

**System Administrators** — The exclusive user group with full access permissions to the Management Reporting microservice.

**User Profile:**
- Responsible for monitoring overall learning performance across all organizations on the EducoreAI platform
- Need to understand engagement levels, course effectiveness, and learning trends in real time
- Require reliable, unified data to support strategic improvements in training processes
- Currently face disconnected data sources requiring manual cleaning and cross-referencing

### Expected Impact

**For Administrators:**
- **Time Savings:** 80% reduction in manual reporting workload
- **Speed:** Report generation in under 3 seconds
- **Accuracy:** Unified, consistent data eliminates discrepancies
- **Insights:** AI-generated analytical commentary provides intelligent recommendations
- **Real-Time Access:** Instant access to the most up-to-date data without delays

**For EducoreAI Platform:**
- **Centralized Management Tool:** Single source of truth for all organizational learning data
- **Strategic Decision Support:** Data-driven insights enable proactive improvements
- **Scalability:** Cache-based architecture supports rapid growth
- **Innovation:** AI-driven analytics positions EducoreAI as a leader in intelligent learning management

---

## Success Criteria and Measurable Outcomes

### Key Performance Indicators (KPIs)

1. **Report Generation Time:** Average under 3 seconds
2. **System Uptime:** 99.5% or higher availability
3. **AI Insight Accuracy:** At least 90% relevance and usefulness
4. **Manual Workload Reduction:** 80% decrease in manual data collection and analysis
5. **User Satisfaction:** High adoption rate as EducoreAI's core management tool

### Success Validation

Success will be achieved when:
- Administrators can log into the system and generate reports within seconds
- Reports display the most up-to-date data automatically
- AI-generated insights are embedded seamlessly into every report
- The system becomes the primary tool for learning data management
- Manual reporting processes are largely eliminated

---

## Feature-Based System Breakdown

The Management Reporting Microservice is organized into eight core features, each designed to deliver specific functionality and value to system administrators.

---

## Feature 1: Main Dashboard

### Purpose
The Main Dashboard serves as the primary landing page and central command center for the Management Reporting microservice. It provides administrators with an immediate, comprehensive view of key learning performance metrics through interactive visualizations.

### Functionality

**Visual Display:**
- Displays 6-8 primary charts on the main screen, including:
  - **Course Completion Rate** — Percentage of enrolled users who completed courses
  - **Engagement Index** — Overall user engagement metrics across the platform
  - **Average Rating** — Average course and content ratings from learners
  - **Active vs. Total Enrollments** — Comparison of active learners versus total enrollments
  - **Platform Skill Demand** — Analysis of which skills are most in demand
  - **Drop-off or Performance Decline Trend** — Identification of declining performance patterns

**Chart Types:**
- Bar charts for categorical comparisons
- Line charts for trend analysis over time
- Pie charts for proportional breakdowns
- Area charts for cumulative metrics
- Data tables for detailed numerical views

**Interactivity:**
- Each chart is clickable and leads to a dedicated detail page
- Detail pages display a full-size version of the visualization
- Each detail page includes a corresponding data table showing the same information in tabular format
- Users can navigate back to the dashboard easily

**Data Source:**
- All dashboard data is retrieved from the Redis cache
- Data reflects the most recent daily collection (last updated at 07:00 AM)
- Cache contains up to 60 days of historical data for trend visualization

**Real-Time Updates:**
- Dashboard automatically refreshes when new data is available
- Manual refresh option available via DATA REFRESH button (performs near-real-time pull from microservices)

### Technical Components

**Frontend Components:**
- Dashboard container component
- Chart components (Bar, Line, Pie, Area, Table)
- Navigation components
- Data refresh button component

**Backend Services:**
- Cache retrieval service
- Data aggregation service
- Chart data formatting service

**Data Flow:**
1. User accesses dashboard → Frontend requests data from backend
2. Backend queries Redis cache using appropriate key patterns
3. Data is aggregated and formatted for each chart type
4. Formatted data is sent to frontend
5. Frontend renders interactive charts using visualization library

### User Experience

**Initial Load:**
- Dashboard loads immediately upon entering the microservice
- Charts render progressively as data becomes available
- Loading indicators shown during data retrieval

**Navigation:**
- Clicking any chart opens its dedicated detail page
- Detail page includes "Back to Dashboard" button
- Fixed header navigation allows quick access to other sections

**Customization:**
- Selected charts support user customization (date ranges, course selection, organization filters)
- Customization settings stored in cache per user
- Preferences persist across sessions

---

## Feature 2: BOX (Additional Charts)

### Purpose
The BOX feature provides access to an expanded library of analytical charts beyond those displayed on the main dashboard. It serves as a comprehensive repository of additional visualizations, enabling administrators to explore deeper insights and specialized metrics.

### Functionality

**Content:**
- Contains 10-15 additional charts beyond the main dashboard's 6-8 charts
- Charts cover specialized metrics and detailed analyses not shown on the main view
- Examples may include: Course-by-course breakdowns, Organization-specific metrics, Time-to-completion analyses, Content usage patterns, Assessment performance details

**Display Method:**
- Implemented as a right-hand collapsible sidebar
- Sidebar can be opened/closed via toggle button
- When open, displays a searchable, categorized list of available charts

**Search and Categorization:**
- Search functionality allows quick filtering of chart names
- Charts organized by categories (e.g., "Course Metrics", "User Analytics", "Performance Trends")
- Category filters enable focused browsing

**Chart Access:**
- Clicking a chart name in the BOX opens its dedicated detail page
- Detail page follows the same structure as main dashboard chart pages:
  - Full-size interactive visualization
  - Corresponding data table below
  - "Back to Dashboard" button for navigation

**Data Consistency:**
- All BOX charts use the same Redis cache data source as the main dashboard
- Data refresh button available on each chart detail page
- Manual refresh performs near-real-time data pull (not saved to cache)

### Technical Components

**Frontend Components:**
- BOX sidebar component (collapsible)
- Chart list component with search/category filters
- Chart detail page component (shared with main dashboard)

**Backend Services:**
- Chart metadata service (provides list of available charts)
- Chart data retrieval service (same as dashboard)

**Data Flow:**
1. User opens BOX sidebar → Frontend requests chart list metadata
2. Backend returns available charts with categories
3. User searches/filters → Frontend filters list client-side
4. User selects chart → Frontend requests chart data
5. Backend queries cache and returns formatted data
6. Frontend displays chart detail page

### User Experience

**Sidebar Interaction:**
- Smooth slide-in animation when opening
- Persistent state (remembers if open/closed during session)
- Responsive design adapts to screen size

**Chart Discovery:**
- Clear categorization makes finding relevant charts easy
- Search provides instant filtering
- Chart descriptions or tooltips help users understand what each chart shows

**Navigation:**
- Seamless transition from BOX to chart detail page
- Easy return to dashboard or BOX
- Breadcrumb navigation for context

---

## Feature 3: Reports System

### Purpose
The Reports System enables administrators to generate comprehensive, professional management reports in PDF format. These reports serve as the primary deliverable for strategic decision-making, combining quantitative data with AI-generated qualitative insights.

### Functionality

**Report Types:**
The system includes a wide variety of managerial and analytical reports:

1. **Monthly Learning Performance Report** — Comprehensive monthly analysis of learning outcomes, completion rates, and engagement metrics
2. **Course Completion Analysis** — Detailed breakdown of course participation, completion rates, and learner progress
3. **User Engagement Summary** — Analysis of user engagement patterns by course, organization, and time period
4. **Organizational Benchmark Report** — Cross-organization performance comparison and benchmarking
5. **Learning ROI Report** — Training investment return analysis and cost-effectiveness metrics
6. **Skill Gap Analysis Report** — Identification of skill gaps across teams, departments, and organizations
7. **Compliance & Certification Tracking Report** — Monitoring of learning compliance, certification status, and regulatory requirements
8. **Performance Trend Analysis** — Long-term analysis of learning efficiency trends and patterns

**Report Structure:**
Each report follows a standardized format:

1. **Executive Summary** — High-level overview of key findings and metrics
2. **Key Visual Charts** — Primary visualizations highlighting important data points
3. **Detailed Data Table** — Comprehensive tabular data supporting the charts
4. **AI Insights & Recommendations** — AI-generated analytical commentary, observations, and actionable recommendations

**Report Generation Process:**
1. Administrator selects report type from Reports page
2. System retrieves relevant data from Redis cache
3. Data is formatted and structured according to report template
4. Visual charts are generated and embedded
5. Report data is sent to OpenAI API for AI analysis (see Feature 4)
6. AI insights are embedded into the report
7. Complete report is generated as PDF
8. PDF is displayed to administrator and available for download

**PDF Export:**
- Format: PDF only (MVP)
- Branding: EducoreAI logo, unified font, color scheme
- Content: Includes all charts, tables, and AI insights
- Length: Typically 2-5 pages depending on report type
- Quality: High-resolution charts and professional formatting

**Report Storage:**
- Reports are generated on-demand (not pre-stored)
- Each report generation uses the most current cache data
- Generated PDFs can be downloaded and saved locally by administrators
- Report generation history may be logged for audit purposes

### Technical Components

**Frontend Components:**
- Reports page (list of available reports)
- Report selection interface
- Report preview/display component
- PDF download component

**Backend Services:**
- Report generation service
- PDF creation service (using library like PDFKit or Puppeteer)
- Report template service
- Data aggregation service for reports

**Data Flow:**
1. User selects report type → Frontend sends request to backend
2. Backend queries Redis cache for relevant data
3. Data is aggregated and formatted for report
4. Charts are generated (using same visualization library as dashboard)
5. Report data sent to AI service (Feature 4)
6. AI insights received and embedded
7. PDF generated with all content
8. PDF returned to frontend for display/download

### User Experience

**Report Selection:**
- Clear list of available reports with descriptions
- Easy-to-understand report names and purposes
- Quick access to frequently used reports

**Generation Process:**
- Progress indicator during report generation
- Estimated time display (target: under 3 seconds)
- Clear success/error messaging

**Report Viewing:**
- In-browser PDF preview
- Download button for saving locally
- Print-friendly formatting

**Future Enhancements:**
- Additional export formats (Excel, CSV) in future versions
- Scheduled report generation and email delivery
- Report templates customization

---

## Feature 4: AI Integration (Post-Report Analysis)

### Purpose
The AI Integration feature enhances every generated report with intelligent analytical commentary, observations, and recommendations. By analyzing report data after generation, the AI provides qualitative insights that complement quantitative metrics, transforming raw data into actionable intelligence.

### Functionality

**AI Model:**
- **Model:** GPT-4-Turbo (selected for high accuracy and cost-effectiveness)
- **Provider:** OpenAI API
- **Usage:** Called automatically after each report is generated

**Integration Process:**
1. Report data is collected and formatted
2. Report is generated with quantitative content (charts, tables)
3. Report data is sent to OpenAI API along with a customized prompt
4. AI analyzes the data and generates insights
5. AI insights are embedded into the report on the backend
6. Final report (with AI insights) is displayed to the administrator

**AI Prompt Structure:**
Example prompt sent to OpenAI:
```
"Analyze the following EducoreAI management report. Identify trends, anomalies, and recommendations based on course completion, engagement, and performance metrics. Write a short summary under 'AI Insights & Recommendations' section. Focus on actionable insights and strategic recommendations for improving learning outcomes."
```

**AI Output Format:**
- **Observations:** Key findings and patterns identified in the data
- **Trend Analysis:** Notable increases, decreases, or stability in metrics
- **Anomalies:** Unusual patterns or outliers that require attention
- **Recommendations:** Actionable suggestions for improvement

**Example AI Insights:**
- "Engagement dropped by 12% compared to the previous period. Consider reviewing course content relevance."
- "Leadership courses achieved the highest satisfaction scores. This format may be applicable to other course categories."
- "Technical course completions increased by 18% this month. The recent content updates appear effective."

**Placement in Report:**
- AI insights appear in a dedicated section: "AI Insights & Recommendations"
- Positioned at the end of the report, before the summary section
- Clearly labeled and formatted for easy identification

**Error Handling:**
- If OpenAI API is unavailable or returns an error:
  - Report is still generated normally with quantitative data
  - Message displayed: "AI analysis unavailable at this time"
  - System continues to function without blocking report generation
  - Error is logged for monitoring and troubleshooting

**Cost Management:**
- API calls are optimized to send only necessary data
- Prompt engineering focuses on concise, effective analysis requests
- Rate limiting and retry logic prevent excessive API usage

### Technical Components

**Backend Services:**
- AI integration service (handles OpenAI API communication)
- Prompt generation service (creates customized prompts per report type)
- AI response processing service (formats and validates AI output)
- Error handling service (manages API failures gracefully)

**Configuration:**
- OpenAI API key stored securely in environment variables
- Model selection and parameters configurable
- Prompt templates customizable per report type

**Data Flow:**
1. Report generation completes with quantitative data
2. Report data is extracted and formatted for AI analysis
3. Custom prompt is generated based on report type
4. Request sent to OpenAI API with report data and prompt
5. AI response received and validated
6. AI insights formatted and embedded into report
7. Final report (with AI) returned to user

### User Experience

**Transparency:**
- Users understand that AI insights are automatically generated
- AI section is clearly labeled and distinguished from quantitative data
- Users can identify which parts of the report are AI-generated

**Quality:**
- AI insights are relevant, accurate, and actionable (target: 90% accuracy)
- Insights complement rather than duplicate quantitative data
- Language is clear and professional, suitable for management reports

**Reliability:**
- System gracefully handles AI unavailability
- Reports remain useful even without AI insights
- No user-facing errors or blocking issues

---

## Feature 5: Data Collection & Processing

### Purpose
The Data Collection & Processing feature is responsible for automatically gathering data from all EducoreAI microservices, normalizing it into a consistent format, and storing it in the Redis cache. This feature ensures that the Management Reporting microservice always has access to the most current, unified data.

### Functionality

**Daily Automated Collection:**
- **Schedule:** Executes automatically every day at 07:00 AM
- **Scope:** Retrieves data from the last 24 hours from all microservices
- **Process:** Appends new data to existing cache (maintains 60-day rolling history)
- **Microservices Integrated:**
  1. **DIRECTORY** (Base: /directory) — User and organization details
  2. **COURSE BUILDER** (Base: /course-builder) — Course data and metrics
  3. **ASSESSMENT** (Base: /assessment) — Skill-level data, test results, grades
  4. **CONTENT STUDIO** (Base: /content-studio) — Content creation metrics, lesson analytics
  5. **LEARNING ANALYTICS** (Base: /learning-analytics) — Aggregated statistics and breakdowns

**Data Collection Process:**
1. Scheduled job triggers at 07:00 AM
2. For each microservice:
   - API request sent with JWT authentication token
   - Request specifies last 24 hours of data
   - Response received in JSON format
3. Data is validated and normalized
4. Normalized data is stored in Redis cache with appropriate keys
5. Metadata is added (collected_at, source, schema_version)
6. Process repeats for all microservices

**Retry Logic:**
- If a microservice is unavailable:
  - Up to 3 retry attempts
  - Retries occur every 10 minutes
  - If all retries fail, warning is logged and alert is sent
  - Other microservices continue processing normally
  - Existing cache data is preserved

**Manual Data Refresh:**
- Administrators can trigger manual data collection on demand
- Manual refresh performs near-real-time data pull from microservices
- Updated data refreshes charts immediately
- Manual refresh data is NOT saved to cache (next automatic update will occur at 07:00 AM)

**Data Normalization:**
- **Date Format:** Unified to YYYY-MM-DDTHH:mm:ssZ (ISO 8601)
- **Scaling:** Standardized scaling for grades and percentages (0-100 scale)
- **Deduplication:** Based on source ID + timestamp combination
- **Validation:** Outlier detection and anomaly tagging (is_suspect=true flag)
- **Schema Versioning:** Each data entry includes schema_version for future compatibility

**Data Structure in Cache:**
- Key hierarchy follows pattern: `mr:<service>:<identifier>:<yyyymmdd>`
- Examples:
  - `mr:dir:<orgId|userId>:<yyyymmdd>`
  - `mr:cb:<courseId>:<yyyymmdd>`
  - `mr:assess:<courseId|skillId>:<yyyymmdd>`
  - `mr:cs:<contentId|courseId>:<yyyymmdd>`
  - `mr:la:<period>:<yyyymmdd>`
- Each value includes:
  - Actual data (nested JSON objects)
  - Metadata: collected_at, source, schema_version

**Partial Failure Handling:**
- If some microservices succeed and others fail:
  - Existing cache data is preserved
  - Successful collections are stored
  - "Partial Data" warning is displayed on dashboard
  - Failed services are logged for retry

**Rate Limiting:**
- Client-side enforcement of ~100 requests/minute per service
- Prevents overwhelming microservice APIs
- Respects internal rate limits

### Technical Components

**Backend Services:**
- Scheduled job service (cron-like scheduler for 07:00 AM execution)
- Microservice API client service (handles HTTP requests with JWT)
- Data normalization service (transforms data to unified format)
- Cache storage service (Redis operations)
- Retry logic service (manages retry attempts and backoff)
- Alert service (sends notifications on failures)

**Configuration:**
- Microservice base URLs stored in environment variables
- JWT token management (refresh as needed)
- Retry parameters (attempts, intervals) configurable
- Rate limiting parameters configurable

**Data Flow:**
1. Scheduler triggers at 07:00 AM
2. For each microservice:
   - API request with JWT token
   - Response received
   - Data validated
   - Data normalized
   - Cache key generated
   - Data stored in Redis
3. Metadata added to each entry
4. Success/failure logged
5. Alerts sent if critical failures occur

### User Experience

**Transparency:**
- Dashboard indicates last data collection time
- "Partial Data" warning displayed if collection incomplete
- Manual refresh button provides immediate update option

**Reliability:**
- Automatic retries ensure data collection succeeds when possible
- Partial failures don't block system functionality
- Clear error messaging when issues occur

**Performance:**
- Collection process runs in background (non-blocking)
- Users can continue using system during collection
- Cache updates are atomic and don't affect ongoing queries

---

## Feature 6: Cache Management

### Purpose
The Cache Management feature handles all Redis cache operations, including data storage, retrieval, expiration, and cleanup. It ensures optimal performance, data consistency, and efficient use of cache resources while maintaining the 60-day rolling data window.

### Functionality

**Cache Technology:**
- **Solution:** Redis (fast, reliable, cloud-managed)
- **Hosting:** Dedicated cloud service (Redis Cloud or AWS ElastiCache)
- **Structure:** Key-value store with nested JSON objects

**Data Storage:**
- All charts, reports, and analytical data stored exclusively in cache
- No SQL database dependency
- High-speed access enables sub-3-second report generation

**Key Structure:**
- Hierarchical key patterns for organized data access:
  - `mr:dir:<orgId|userId>:<yyyymmdd>` — Directory data
  - `mr:cb:<courseId>:<yyyymmdd>` — Course Builder data
  - `mr:assess:<courseId|skillId>:<yyyymmdd>` — Assessment data
  - `mr:cs:<contentId|courseId>:<yyyymmdd>` — Content Studio data
  - `mr:la:<period>:<yyyymmdd>` — Learning Analytics data
- Each key includes service identifier, entity identifier, and date

**Data Retention:**
- **Retention Period:** Up to 60 days
- **Rolling Window:** New data appended daily, oldest data automatically deleted
- **Cleanup Process:** Automatic deletion of data older than 60 days
- **Initial Deployment:** Cache starts empty, with option for one-time historical backfill if legacy data available

**Cache Operations:**
- **Write Operations:**
  - Daily collection appends new data
  - Each entry includes metadata (collected_at, source, schema_version)
  - Atomic operations ensure data consistency
- **Read Operations:**
  - Fast retrieval for dashboard and reports
  - Batch queries for aggregations
  - Efficient key pattern matching
- **Update Operations:**
  - Manual refresh updates cache temporarily (not persisted)
  - User preferences stored in cache (separate keys)

**Expiration Management:**
- Automatic expiration of keys older than 60 days
- Redis TTL (Time To Live) set on each key
- Cleanup job runs daily to remove expired entries
- Ensures cache doesn't exceed storage limits

**Cache Initialization:**
- On first deployment, cache is empty
- First daily collection populates initial data
- Optional historical backfill if legacy data exists:
  - One-time import process
  - Validates and normalizes historical data
  - Stores with appropriate keys and dates

**Performance Optimization:**
- Efficient key patterns enable fast queries
- Batch operations for multiple key retrievals
- Caching of aggregated data for common queries
- Connection pooling for Redis operations

**Monitoring and Maintenance:**
- Cache size monitoring
- Key count tracking
- Performance metrics (hit rate, response time)
- Alert on cache failures or capacity issues

### Technical Components

**Backend Services:**
- Redis client service (handles all Redis operations)
- Cache storage service (write operations)
- Cache retrieval service (read operations)
- Cache cleanup service (expiration and deletion)
- Cache monitoring service (metrics and health checks)

**Configuration:**
- Redis connection details (host, port, password) in environment variables
- Retention period configurable (default: 60 days)
- Key prefix configurable (default: "mr:")
- TTL settings configurable

**Data Flow:**
1. Data collection stores new entries with keys and TTL
2. Dashboard/reports query cache using key patterns
3. Data retrieved and formatted for display
4. Daily cleanup job removes expired keys
5. Monitoring tracks cache health and performance

### User Experience

**Performance:**
- Sub-3-second report generation enabled by cache speed
- Instant dashboard loading
- Smooth, responsive user experience

**Reliability:**
- Cache failures handled gracefully
- Fallback mechanisms if cache unavailable
- Clear error messaging

**Transparency:**
- Cache status visible in system health indicators
- Last update time displayed on dashboard

---

## Feature 7: User Interface & Navigation

### Purpose
The User Interface & Navigation feature provides a modern, accessible, and intuitive interface for administrators to interact with the Management Reporting microservice. It ensures a seamless user experience across all features while maintaining consistency with EducoreAI's design standards.

### Functionality

**Design System:**
- **Theme:** Dual-theme design (Light/Dark mode)
- **Color Palette:** Emerald color palette with gold and amber accents
- **Framework:** TailwindCSS for all styling
- **Principles:** Clarity, modern aesthetics, accessibility

**Accessibility Features:**
- Visible focus indicators for keyboard navigation
- High contrast ratios for readability
- Support for reduced motion preferences
- Screen reader compatibility
- Keyboard navigation support

**Responsive Design:**
- **Desktop:** Full-featured experience with all charts and features
- **Tablet:** Optimized layout with adaptive chart sizing
- **Mobile:** Streamlined interface with essential features accessible

**Navigation Structure:**
- **Fixed Header:** Always visible at top of page
- **Menu Items:**
  - **Dashboard** — Link to main dashboard
  - **Reports** — Link to reports page
  - **Settings** — Link to settings page (future: user preferences, theme toggle)
- **Breadcrumbs:** Context-aware navigation on detail pages
- **Back Buttons:** Clear "Back to Dashboard" actions on chart detail pages

**Main Dashboard Interface:**
- Grid layout displaying 6-8 primary charts
- Each chart in a card container
- Hover effects and interactive elements
- Loading states during data retrieval
- Empty states if no data available

**BOX Sidebar:**
- Right-hand collapsible sidebar
- Smooth slide-in/out animation
- Search bar for filtering charts
- Category filters for organization
- Chart list with clear labels
- Click to open chart detail page

**Chart Detail Pages:**
- Full-width chart visualization
- Data table below chart
- "Back to Dashboard" button
- DATA REFRESH button for manual update
- Responsive chart sizing

**Reports Page:**
- List of available report types
- Report descriptions and purposes
- "Generate Report" button for each type
- Report preview/display area
- PDF download button
- Generation progress indicator

**Theme Toggle:**
- One-click Light/Dark mode switch
- Preference stored in user settings
- Smooth theme transition
- Persistent across sessions

**Typography:**
- Consistent sans-serif font family
- Clear hierarchy (headings, body, captions)
- Readable font sizes
- Proper line spacing

**Visual Elements:**
- Shadows and transitions following Emerald palette
- Consistent spacing and padding
- Professional, clean aesthetic
- Loading spinners and progress indicators

**Browser Support:**
- Chrome (latest)
- Edge (latest)
- Firefox (latest)
- Safari (latest)
- Graceful degradation for older browsers

### Technical Components

**Frontend Framework:**
- React (JavaScript) with Vite build tool
- TailwindCSS for styling
- Chart library (e.g., Chart.js, Recharts, or D3.js)
- PDF generation library (client or server-side)

**Components:**
- Header/Navigation component
- Dashboard container component
- Chart components (Bar, Line, Pie, Area, Table)
- BOX sidebar component
- Reports page component
- Theme toggle component
- Loading/error state components

**State Management:**
- Theme state (Light/Dark)
- User preferences
- Chart data state
- Navigation state

**Responsive Utilities:**
- TailwindCSS responsive breakpoints
- Mobile-first approach
- Adaptive layouts

### User Experience

**First Impression:**
- Clean, professional interface
- Clear visual hierarchy
- Intuitive navigation

**Interaction:**
- Smooth animations and transitions
- Immediate feedback on user actions
- Clear loading and error states

**Consistency:**
- Unified design language across all pages
- Predictable navigation patterns
- Consistent chart styling

**Accessibility:**
- Keyboard navigation works throughout
- Screen readers can access all content
- High contrast ensures readability
- No motion for users who prefer reduced motion

---

## Feature 8: Security & Access Control

### Purpose
The Security & Access Control feature ensures that only authorized system administrators can access the Management Reporting microservice, and that all data and communications are protected according to industry standards. It provides authentication, authorization, audit logging, and compliance with data protection regulations.

### Functionality

**Authentication:**
- **Method:** JWT (JSON Web Tokens) from EducoreAI's central AUTH service
- **Process:**
  1. User attempts to access Management Reporting microservice
  2. System validates JWT token
  3. Token must be valid and not expired
  4. User identity extracted from token claims
- **Token Management:**
  - Tokens refreshed automatically when needed
  - Invalid tokens result in access denial
  - Session management handled by central AUTH service

**Authorization:**
- **Access Level:** System Administrator role only
- **Role Validation:**
  - User's role checked from JWT token claims
  - Only users with "System Administrator" role granted access
  - All other roles denied access with appropriate message
- **Future Extensibility:** Architecture supports additional role-based permissions if needed

**API Security:**
- **Communication:** All API calls use HTTPS (encrypted)
- **Microservice Integration:**
  - JWT tokens included in all API requests to other microservices
  - Tokens validated by each microservice
  - Secure communication channels maintained

**Data Protection:**
- **PII Filtering:** Unnecessary Personally Identifiable Information filtered out
- **Data Encryption:**
  - Sensitive data encrypted at rest (in Redis cache)
  - Sensitive data encrypted in transit (HTTPS)
  - Encryption keys managed securely
- **Data Retention:**
  - Cache data limited to 60 days (automatic deletion)
  - Aligns with data minimization principles
  - Reduces privacy risk exposure

**Audit Logging:**
- **Logged Actions:**
  - User logins and authentication attempts
  - Report creation and generation
  - PDF downloads
  - Data refresh operations (manual)
  - Cache access patterns (anonymized)
- **Log Format:**
  - Timestamp
  - User ID (from JWT)
  - Action type
  - Resource accessed
  - Success/failure status
- **Log Storage:**
  - Logs stored securely
  - Retention period defined by compliance requirements
  - Logs accessible for audit purposes

**Compliance:**
- **GDPR Compliance:**
  - Data minimization (60-day retention)
  - User rights respected (access, deletion)
  - Privacy by design principles
  - Secure data handling
- **ISO-27001 Standards:**
  - Information security management
  - Risk assessment and treatment
  - Access control policies
  - Incident management procedures

**Security Monitoring:**
- **Threat Detection:**
  - Unusual access patterns flagged
  - Failed authentication attempts monitored
  - API abuse detection
- **Alerting:**
  - Security incidents trigger alerts
  - Unauthorized access attempts logged and reported
  - System anomalies detected and investigated

**Error Handling:**
- **Security Errors:**
  - Invalid tokens result in clear error messages (no sensitive info leaked)
  - Unauthorized access attempts logged
  - System errors don't expose internal details
- **Graceful Degradation:**
  - Security failures don't compromise system integrity
  - Fallback mechanisms for critical security functions

### Technical Components

**Backend Services:**
- Authentication service (JWT validation)
- Authorization service (role checking)
- Audit logging service
- Encryption service
- Security monitoring service

**Middleware:**
- JWT validation middleware (runs on all requests)
- Role checking middleware
- Audit logging middleware
- Rate limiting middleware (prevents abuse)

**Configuration:**
- JWT secret keys in environment variables
- Role definitions configurable
- Audit log retention policies
- Encryption key management

**Data Flow:**
1. User request arrives → JWT validation middleware
2. Token validated → Authorization middleware checks role
3. Access granted → Request proceeds
4. Action performed → Audit log entry created
5. Response returned → Secure communication maintained

### User Experience

**Access Control:**
- Clear error messages for unauthorized access
- Smooth authentication flow (handled by central AUTH)
- No user-facing security complexity

**Transparency:**
- Users understand their access level
- Audit logs provide accountability
- Privacy respected through data minimization

**Reliability:**
- Security doesn't impede functionality
- Graceful handling of security issues
- System remains available and secure

---

## Technical Architecture Summary

### Technology Stack

**Frontend:**
- React (JavaScript) with Vite
- TailwindCSS for styling
- Chart visualization library
- PDF generation capabilities

**Backend:**
- Node.js with Express
- Redis client for cache operations
- OpenAI API integration
- JWT authentication

**Infrastructure:**
- Redis Cloud or AWS ElastiCache
- Cloud hosting for application
- HTTPS encryption
- Central AUTH service integration

### Data Flow Overview

1. **Data Collection:** Microservices → API Requests → Normalization → Redis Cache
2. **Data Retrieval:** User Request → Backend → Redis Cache → Aggregation → Frontend
3. **Report Generation:** User Request → Data Retrieval → Formatting → AI Analysis → PDF Generation → User
4. **AI Integration:** Report Data → OpenAI API → AI Insights → Report Embedding

### Performance Characteristics

- **Report Generation:** Under 3 seconds
- **Dashboard Load:** Near-instant (cache-based)
- **Concurrent Users:** 10-20 administrators supported
- **Data Volume:** Hundreds of organizations, thousands of courses, tens of thousands of interactions/month
- **Uptime Target:** 99.5% availability

---

## Next Steps

Upon approval of this Project Overview Document, the development workflow will proceed to:

1. **Phase 2:** User Experience & Interaction (User-Integration-Template.md)
2. **Phase 3:** Requirements and Flow Documentation (Project-Requirements-Template.md)
3. **Phase 4:** System & Data Architecture (System-Data-Architecture-Template.md)
4. **Phase 5:** Test Strategy (Test-Strategy-Template.md)
5. **Phase 6:** Development (Development-Template.md)
6. **Phase 7:** Security & Compliance (Project-Security-Template.md)
7. **Phase 8:** Code Review & Integration Validation (Quality-Assurance-Template.md)
8. **Phase 9:** Deployment (Deployment-Template.md)

---

## Document Approval

This Project Overview Document is structured by system features and provides the highest possible level of detail for each feature's components, functionalities, and capabilities.

**Please review this document and provide feedback. All feedback will be logged in `customFile.md`, and the document will be revised until you confirm it is perfect and fully aligned with your expectations.**

Only after your explicit approval will the process continue to Phase 2: User Experience & Interaction.

