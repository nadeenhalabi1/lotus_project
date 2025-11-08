# System & Data Architecture Document
## EducoreAI Management Reporting Microservice

---

## Document Overview

**Version:** 1.0  
**Date Created:** Phase 4 - System & Data Architecture  
**Status:** Draft for Review  
**Architecture Style:** Microservice-based, fully independent, integrated with EducoreAI ecosystem

This document defines the complete system and data architecture for the Management Reporting microservice, organized by system features to provide maximum technical detail for each component, data flow, and dependency.

---

## Architecture Overview

### Architecture Style

**Pattern:** Microservice-based Architecture  
**Independence:** Fully autonomous microservice operating independently  
**Integration:** Connected to EducoreAI ecosystem through REST APIs  
**Communication:** Synchronous request-response for user interactions, asynchronous for background operations

### System Layers

The architecture is organized into three distinct layers:

1. **Frontend Layer** — React.js application (Vite build)
2. **Backend Layer** — Node.js/Express API and services
3. **Cache Layer** — Redis cloud-managed storage

Each layer has distinct responsibilities but works together as a cohesive unit.

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React.js + Vite | User interface and interactions |
| **Frontend Styling** | TailwindCSS | Design system and responsive layout |
| **Frontend Charts** | Chart.js / Recharts | Data visualization |
| **Backend** | Node.js + Express | API server and business logic |
| **Cache** | Redis (Cloud-managed) | High-speed data storage |
| **AI Integration** | OpenAI GPT-4-Turbo | Intelligent insights generation |
| **PDF Generation** | Puppeteer / PDFKit | Report PDF creation |
| **Authentication** | JWT (EducoreAI Auth) | User authentication and authorization |
| **Scheduling** | node-cron / Bull | Automated data collection |

---

## Feature-Based Architecture Breakdown

---

## Feature 1: Main Dashboard - Architecture

### Component Architecture

#### Frontend Components

```
src/
├── components/
│   ├── Dashboard/
│   │   ├── DashboardContainer.jsx       # Main dashboard container
│   │   ├── ChartGrid.jsx                # Grid layout for charts
│   │   ├── ChartCard.jsx                # Individual chart card wrapper
│   │   └── DashboardHeader.jsx          # Dashboard header with refresh
│   ├── Charts/
│   │   ├── BarChart.jsx                 # Bar chart component
│   │   ├── LineChart.jsx                # Line chart component
│   │   ├── PieChart.jsx                 # Pie chart component
│   │   ├── AreaChart.jsx                # Area chart component
│   │   └── DataTable.jsx                # Data table component
│   ├── ChartDetail/
│   │   ├── ChartDetailPage.jsx          # Full chart detail page
│   │   ├── ChartDetailView.jsx          # Chart visualization
│   │   └── ChartDataTable.jsx           # Detailed data table
│   └── Common/
│       ├── LoadingSpinner.jsx           # Loading indicators
│       ├── ErrorMessage.jsx              # Error display
│       └── EmptyState.jsx                # Empty data state
├── services/
│   ├── api.js                           # API client
│   ├── cache.js                         # Browser cache management
│   └── preferences.js                   # User preferences storage
└── hooks/
    ├── useDashboardData.js              # Dashboard data fetching
    ├── useChartData.js                   # Chart data fetching
    └── useTheme.js                       # Theme management
```

#### Backend Services

```
backend/
├── routes/
│   └── dashboard.js                     # Dashboard API routes
├── services/
│   ├── dashboardService.js              # Dashboard data aggregation
│   ├── chartService.js                  # Chart data formatting
│   └── cacheService.js                  # Cache operations
└── controllers/
    └── dashboardController.js           # Request handling
```

### Data Flow Architecture

#### Dashboard Load Flow

```
User Request
    ↓
Frontend: DashboardContainer mounts
    ↓
Frontend: useDashboardData hook triggers
    ↓
Frontend: API call to /api/v1/dashboard
    ↓
Backend: dashboardController.handleGetDashboard()
    ↓
Backend: dashboardService.aggregateDashboardData()
    ↓
Backend: cacheService.getMultipleKeys(pattern: "mr:*:*:latest")
    ↓
Redis: Batch read operations
    ↓
Backend: Data aggregation and formatting
    ↓
Backend: Response with formatted chart data
    ↓
Frontend: State update with chart data
    ↓
Frontend: Chart components render
    ↓
User: Dashboard displayed (≤2 seconds)
```

#### Chart Detail Flow

```
User clicks chart
    ↓
Frontend: ChartCard onClick handler
    ↓
Frontend: Navigation to /dashboard/chart/:chartId
    ↓
Frontend: ChartDetailPage component mounts
    ↓
Frontend: useChartData hook fetches detail data
    ↓
Frontend: API call to /api/v1/charts/:chartId
    ↓
Backend: chartController.handleGetChartDetail()
    ↓
Backend: chartService.getChartDetail(chartId)
    ↓
Backend: cacheService.getChartData(chartId)
    ↓
Redis: Key lookup and data retrieval
    ↓
Backend: Full dataset formatted
    ↓
Backend: Response with chart + table data
    ↓
Frontend: ChartDetailView and ChartDataTable render
    ↓
User: Detail page displayed (≤1 second)
```

### State Management Architecture

**Local State:** React useState/useReducer for component-level state  
**Global State:** React Context API for theme and user preferences  
**Server State:** Custom hooks with caching for API data  
**Browser Cache:** localStorage for user preferences, sessionStorage for temporary data

### Performance Optimization

1. **Data Preloading:** Dashboard data fetched on mount, cached in memory
2. **Lazy Loading:** Chart components loaded on demand
3. **Memoization:** React.memo for chart components, useMemo for calculations
4. **Batch Operations:** Multiple cache keys fetched in single batch
5. **Debouncing:** Search and filter inputs debounced

### API Endpoints

```
GET /api/v1/dashboard
  - Returns: Dashboard data with all chart configurations
  - Response Time: ≤2 seconds
  - Cache: Browser cache for 5 minutes

GET /api/v1/charts/:chartId
  - Returns: Full chart data + data table
  - Response Time: ≤1 second
  - Cache: Browser cache for 10 minutes

POST /api/v1/dashboard/refresh
  - Triggers: Manual data refresh
  - Returns: Updated dashboard data
  - Response Time: ≤5 seconds
```

---

## Feature 2: BOX (Additional Charts) - Architecture

### Component Architecture

#### Frontend Components

```
src/
├── components/
│   ├── BOX/
│   │   ├── BOXSidebar.jsx              # Collapsible sidebar
│   │   ├── BOXChartList.jsx             # Chart list with search
│   │   ├── BOXSearchBar.jsx             # Search input with filters
│   │   ├── BOXCategoryFilter.jsx        # Category filter buttons
│   │   └── BOXChartItem.jsx             # Individual chart list item
│   └── ChartDetail/                     # Shared with Feature 1
│       └── ChartDetailPage.jsx
```

#### Backend Services

```
backend/
├── routes/
│   └── box.js                           # BOX API routes
├── services/
│   ├── boxService.js                    # BOX chart metadata
│   └── chartMetadataService.js          # Chart metadata management
└── config/
    └── chartMetadata.js                 # Chart definitions and categories
```

### Data Flow Architecture

#### BOX Sidebar Open Flow

```
User clicks BOX toggle
    ↓
Frontend: BOXSidebar component mounts
    ↓
Frontend: API call to /api/v1/box/charts
    ↓
Backend: boxController.handleGetCharts()
    ↓
Backend: boxService.getAllCharts()
    ↓
Backend: chartMetadataService.getChartMetadata()
    ↓
Backend: Returns chart list with metadata
    ↓
Frontend: BOXChartList renders with categories
    ↓
User: Sidebar displays 10-15 charts organized by category
```

#### BOX Search Flow

```
User types in search bar
    ↓
Frontend: BOXSearchBar onChange handler (debounced 100ms)
    ↓
Frontend: Client-side filtering of chart list
    ↓
Frontend: Fuzzy matching on chart name, category, data source
    ↓
Frontend: BOXChartList updates with filtered results
    ↓
User: Search results appear instantly (<100ms)
```

### Chart Metadata Structure

```javascript
{
  id: "skill-gap-trends",
  name: "Skill Gap Trends",
  category: "Learning Analytics",
  dataSource: "learning-analytics",
  description: "Analysis of skill gaps across organizations",
  updateFrequency: "daily",
  lastUpdated: "2024-01-15T07:00:00Z",
  chartType: "line",
  endpoint: "/api/v1/charts/skill-gap-trends"
}
```

### API Endpoints

```
GET /api/v1/box/charts
  - Returns: List of all BOX charts with metadata
  - Response Time: <500ms
  - Cache: Static metadata, updated on deployment

GET /api/v1/box/charts/search?query=skill
  - Returns: Filtered chart list
  - Response Time: <100ms
  - Implementation: Client-side filtering preferred
```

---

## Feature 3: Reports System - Architecture

### Component Architecture

#### Frontend Components

```
src/
├── components/
│   ├── Reports/
│   │   ├── ReportsPage.jsx              # Reports selection page
│   │   ├── ReportTypeCard.jsx           # Individual report type card
│   │   ├── ReportGenerator.jsx          # Report generation component
│   │   ├── ReportProgress.jsx          # Progress indicator
│   │   └── ReportViewer.jsx             # PDF viewer component
│   └── Common/
│       └── PDFDownload.jsx             # PDF download button
```

#### Backend Services

```
backend/
├── routes/
│   └── reports.js                       # Reports API routes
├── services/
│   ├── reportService.js                 # Report generation logic
│   ├── pdfService.js                    # PDF creation service
│   ├── reportTemplateService.js         # Template management
│   └── dataAggregationService.js        # Report data aggregation
└── templates/
    ├── monthly-performance.html         # HTML templates
    ├── course-completion.html
    └── ... (8 report templates)
```

### Data Flow Architecture

#### Report Generation Flow

```
User selects report type
    ↓
Frontend: ReportGenerator component initiates
    ↓
Frontend: POST /api/v1/reports/generate
    ↓
Backend: reportController.handleGenerateReport()
    ↓
Backend: reportService.generateReport(reportType)
    ↓
Step 1: Data Retrieval
    ↓
Backend: dataAggregationService.aggregateReportData(reportType)
    ↓
Backend: cacheService.getReportData(dateRange, filters)
    ↓
Redis: Batch read operations for report data
    ↓
Step 2: Data Formatting
    ↓
Backend: reportService.formatReportData(data)
    ↓
Backend: reportTemplateService.prepareTemplate(reportType)
    ↓
Step 3: Chart Generation
    ↓
Backend: chartService.generateReportCharts(data)
    ↓
Backend: Charts rendered as images/base64
    ↓
Step 4: AI Analysis (Feature 4)
    ↓
Backend: aiService.analyzeReport(data) [async]
    ↓
Step 5: PDF Assembly
    ↓
Backend: pdfService.createPDF(template, data, charts, aiInsights)
    ↓
Backend: Puppeteer renders HTML to PDF
    ↓
Backend: PDF buffer created
    ↓
Backend: Response with PDF (base64 or stream)
    ↓
Frontend: ReportViewer displays PDF
    ↓
User: Report ready for download (≤5 seconds)
```

### PDF Generation Architecture

#### Template Structure

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    /* EducoreAI branding styles */
    /* A4 page format, 1.5cm margins */
  </style>
</head>
<body>
  <!-- Executive Summary Section -->
  <section id="executive-summary">
    {{executiveSummary}}
  </section>
  
  <!-- Key Visual Charts Section -->
  <section id="charts">
    {{chart1}}
    {{chart2}}
    {{chart3}}
  </section>
  
  <!-- Detailed Data Table Section -->
  <section id="data-table">
    {{dataTable}}
  </section>
  
  <!-- AI Insights Section -->
  <section id="ai-insights">
    {{aiInsights}}
  </section>
</body>
</html>
```

#### PDF Service Flow

```
Template + Data
    ↓
HTML rendering with Handlebars/Mustache
    ↓
Puppeteer browser instance
    ↓
Page load with HTML content
    ↓
Chart images embedded
    ↓
PDF generation (A4, 1.5cm margins)
    ↓
Header: EducoreAI logo
    ↓
Footer: Date and page number
    ↓
PDF buffer output
```

### API Endpoints

```
GET /api/v1/reports/types
  - Returns: List of available report types
  - Response Time: <100ms

POST /api/v1/reports/generate
  - Body: { reportType, dateRange, filters }
  - Returns: PDF file (base64 or stream)
  - Response Time: ≤5 seconds
  - Timeout: 30 seconds with retry

GET /api/v1/reports/:reportId
  - Returns: Previously generated report (if cached)
  - Response Time: <1 second
```

---

## Feature 4: AI Integration - Architecture

### Component Architecture

#### Backend Services

```
backend/
├── services/
│   ├── aiService.js                     # OpenAI integration
│   ├── promptService.js                 # Prompt generation
│   └── aiResponseProcessor.js           # AI response formatting
└── config/
    ├── openaiConfig.js                  # OpenAI API configuration
    └── promptTemplates.js               # Prompt templates per report type
```

### Data Flow Architecture

#### AI Analysis Flow

```
Report data ready
    ↓
Backend: aiService.analyzeReport(reportData, reportType)
    ↓
Backend: promptService.generatePrompt(reportType, reportData)
    ↓
Backend: Prompt template selected
    ↓
Backend: Report data formatted for AI consumption
    ↓
Backend: OpenAI API request
    ↓
POST https://api.openai.com/v1/chat/completions
  Headers: Authorization: Bearer {API_KEY}
  Body: {
    model: "gpt-4-turbo",
    messages: [
      {
        role: "system",
        content: "You are an expert learning analytics analyst..."
      },
      {
        role: "user",
        content: "Analyze the following EducoreAI management report..."
      }
    ],
    max_tokens: 1000,  // ~400 words
    temperature: 0.7
  }
    ↓
OpenAI: AI analysis and response generation
    ↓
Backend: Response received
    ↓
Backend: aiResponseProcessor.formatResponse(aiResponse)
    ↓
Backend: Structured insights extracted:
  - Observations
  - Trend Analysis
  - Anomalies
  - Recommendations
    ↓
Backend: AI insights embedded into report
    ↓
Report generation continues with AI insights
```

#### Error Handling Flow

```
AI API request fails
    ↓
Backend: Error caught in aiService
    ↓
Backend: Error logged with details
    ↓
Backend: aiService returns null/error indicator
    ↓
Backend: reportService continues without AI
    ↓
Backend: Report generated with message:
  "AI analysis unavailable – report generated without insights"
    ↓
Report PDF created successfully
```

### Prompt Template Structure

```javascript
const promptTemplates = {
  "monthly-performance": `
    Analyze the following EducoreAI Monthly Learning Performance Report.
    Identify key trends, anomalies, and actionable recommendations.
    Focus on:
    - Course completion rates
    - User engagement patterns
    - Performance improvements or declines
    Provide insights in structured format:
    1. Observations
    2. Trend Analysis
    3. Anomalies
    4. Recommendations
    Limit response to 400 words.
  `,
  // ... other report type templates
};
```

### Cost Management Architecture

```javascript
// Token usage tracking
const aiUsageTracker = {
  trackRequest: (tokens, cost) => {
    // Log to database/cache
    // Update monthly budget
    // Alert if approaching limit
  },
  getMonthlyUsage: () => {
    // Return current month's usage
  },
  checkBudget: () => {
    // Verify within budget limits
  }
};
```

### API Integration

```
Internal Service Call (not exposed as API endpoint)
  aiService.analyzeReport(data, reportType)
    ↓
Returns: {
  success: true,
  insights: {
    observations: "...",
    trends: "...",
    anomalies: "...",
    recommendations: "..."
  }
} OR {
  success: false,
  error: "AI analysis unavailable"
}
```

---

## Feature 5: Data Collection & Processing - Architecture

### Component Architecture

#### Backend Services

```
backend/
├── services/
│   ├── dataCollectionService.js         # Main collection orchestrator
│   ├── microserviceClient.js            # HTTP client for microservices
│   ├── dataNormalizationService.js      # Data transformation
│   ├── dataValidationService.js         # Data validation
│   └── retryService.js                  # Retry logic
├── jobs/
│   └── dailyCollectionJob.js           # Scheduled job (07:00 AM)
└── config/
    ├── microserviceConfig.js            # Microservice endpoints
    └── collectionConfig.js             # Collection parameters
```

### Data Flow Architecture

#### Daily Automated Collection Flow

```
Scheduler triggers at 07:00 AM
    ↓
Backend: dailyCollectionJob.execute()
    ↓
Backend: dataCollectionService.startCollection()
    ↓
For each microservice (5 total):
    ↓
Backend: microserviceClient.fetchData(service, last24Hours)
    ↓
HTTP Request:
  GET {baseUrl}/{endpoint}
  Headers: {
    Authorization: Bearer {JWT_TOKEN},
    Content-Type: application/json
  }
  Query: {
    startDate: "2024-01-14T07:00:00Z",
    endDate: "2024-01-15T07:00:00Z"
  }
    ↓
Microservice Response (JSON)
    ↓
Backend: dataValidationService.validate(response)
    ↓
Validation Checks:
  - Required fields present
  - Data types correct
  - JSON schema valid
  - Values non-empty
    ↓
If validation fails:
    ↓
Backend: Error logged, data rejected
    ↓
Continue to next microservice
    ↓
If validation succeeds:
    ↓
Backend: dataNormalizationService.normalize(data, service)
    ↓
Normalization Steps:
  1. Date format → YYYY-MM-DDTHH:mm:ssZ
  2. Scaling → 0-100 for grades/percentages
  3. Deduplication → source ID + timestamp
  4. Outlier detection → is_suspect flag
  5. Schema version → added to entry
    ↓
Backend: cacheService.storeData(normalizedData, service)
    ↓
Backend: Cache key generated:
  Pattern: mr:{service}:{identifier}:{yyyymmdd}
  Example: mr:cb:course123:20240115
    ↓
Redis: SET key with TTL (60 days)
    ↓
Redis: Data stored with metadata:
  {
    data: { ...normalizedData },
    metadata: {
      collected_at: "2024-01-15T07:00:00Z",
      source: "course-builder",
      schema_version: "1.0"
    }
  }
    ↓
Next microservice (repeat for all 5)
    ↓
Backend: Collection status logged
    ↓
Backend: Dashboard "Last updated" timestamp updated
    ↓
Collection complete
```

#### Retry Logic Flow

```
Microservice request fails
    ↓
Backend: retryService.retryWithBackoff(request, maxRetries=3)
    ↓
Attempt 1: Immediate retry
    ↓
If fails:
    ↓
Wait 10 minutes
    ↓
Attempt 2: Retry
    ↓
If fails:
    ↓
Wait 10 minutes
    ↓
Attempt 3: Final retry
    ↓
If all attempts fail:
    ↓
Backend: Alert sent
    ↓
Backend: Error logged
    ↓
Backend: Other microservices continue
    ↓
Backend: "Partial Data" warning prepared
```

#### Manual Refresh Flow

```
User clicks "DATA REFRESH" button
    ↓
Frontend: POST /api/v1/data/refresh
    ↓
Backend: dataCollectionController.handleManualRefresh()
    ↓
Backend: dataCollectionService.manualRefresh()
    ↓
Same collection flow as automated (above)
    ↓
BUT: Data stored temporarily (not persisted)
    ↓
Backend: Cache updated for immediate use
    ↓
Backend: Response with updated data
    ↓
Frontend: Dashboard charts refresh
    ↓
User: Latest data displayed (≤5 seconds)
```

### Microservice Integration Architecture

#### HTTP Client Configuration

```javascript
const microserviceClient = {
  baseUrls: {
    directory: process.env.DIRECTORY_API_URL,
    courseBuilder: process.env.COURSE_BUILDER_API_URL,
    assessment: process.env.ASSESSMENT_API_URL,
    contentStudio: process.env.CONTENT_STUDIO_API_URL,
    learningAnalytics: process.env.LEARNING_ANALYTICS_API_URL
  },
  
  fetchData: async (service, dateRange) => {
    const url = `${baseUrls[service]}/data`;
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json'
      },
      params: {
        startDate: dateRange.start,
        endDate: dateRange.end
      },
      timeout: 30000, // 30 seconds
      retry: {
        retries: 3,
        retryDelay: 600000 // 10 minutes
      }
    });
    return response.data;
  }
};
```

### Data Normalization Architecture

```javascript
const normalizationRules = {
  dateFormat: (date) => {
    // Convert to ISO 8601: YYYY-MM-DDTHH:mm:ssZ
    return moment(date).toISOString();
  },
  
  scaling: (value, type) => {
    // Standardize to 0-100 scale
    if (type === 'percentage') return Math.min(100, Math.max(0, value));
    if (type === 'grade') return Math.min(100, Math.max(0, value * 10));
    return value;
  },
  
  deduplication: (data, existingData) => {
    // Check source ID + timestamp
    const key = `${data.sourceId}_${data.timestamp}`;
    return !existingData.has(key);
  },
  
  outlierDetection: (value, mean, stdDev) => {
    // Flag if > 3 standard deviations from mean
    const zScore = Math.abs((value - mean) / stdDev);
    return zScore > 3;
  }
};
```

### API Endpoints

```
POST /api/v1/data/refresh
  - Triggers: Manual data collection
  - Returns: Collection status and updated data
  - Response Time: ≤5 seconds

GET /api/v1/data/status
  - Returns: Last collection time and status
  - Response Time: <100ms
```

---

## Feature 6: Cache Management - Architecture

### Cache Architecture

#### Redis Structure

```
Redis Instance (Cloud-managed)
├── Keys: mr:*:*:*
├── TTL: 60 days (5184000 seconds)
├── Data Structure: JSON strings
└── Operations: GET, SET, MGET, MSET, DEL, KEYS, SCAN
```

#### Key Naming Convention

```
Pattern: mr:{service}:{identifier}:{yyyymmdd}

Examples:
- mr:dir:org123:20240115
- mr:cb:course456:20240115
- mr:assess:skill789:20240115
- mr:cs:content101:20240115
- mr:la:monthly:20240115

User Preferences:
- mr:pref:user123:theme
- mr:pref:user123:dashboard
```

#### Data Structure in Cache

```json
{
  "mr:cb:course123:20240115": {
    "data": {
      "courseId": "course123",
      "courseName": "Introduction to React",
      "metrics": {
        "completionRate": 85.5,
        "averageRating": 4.2,
        "enrollments": 150,
        "activeEnrollments": 128
      },
      "feedback": [
        {
          "userId": "user456",
          "rating": 5,
          "comment": "Great course!"
        }
      ]
    },
    "metadata": {
      "collected_at": "2024-01-15T07:00:00Z",
      "source": "course-builder",
      "schema_version": "1.0",
      "is_suspect": false
    }
  }
}
```

### Cache Service Architecture

```javascript
const cacheService = {
  // Connection
  client: redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
    tls: process.env.REDIS_TLS === 'true'
  }),
  
  // Operations
  get: async (key) => {
    const data = await client.get(key);
    return JSON.parse(data);
  },
  
  set: async (key, value, ttl = 5184000) => {
    const data = JSON.stringify(value);
    await client.setex(key, ttl, data);
  },
  
  getMultiple: async (pattern) => {
    const keys = await client.keys(pattern);
    if (keys.length === 0) return [];
    const values = await client.mget(keys);
    return values.map(v => JSON.parse(v));
  },
  
  delete: async (key) => {
    await client.del(key);
  },
  
  // Batch operations
  batchSet: async (keyValuePairs, ttl) => {
    const pipeline = client.pipeline();
    keyValuePairs.forEach(({key, value}) => {
      pipeline.setex(key, ttl, JSON.stringify(value));
    });
    await pipeline.exec();
  }
};
```

### Cache Cleanup Architecture

```
Scheduled job runs daily at 02:00 AM
    ↓
Backend: cacheCleanupService.execute()
    ↓
Backend: Calculate cutoff date (60 days ago)
    ↓
Backend: Redis SCAN for keys matching pattern: mr:*:*:*
    ↓
For each key:
    ↓
Backend: Extract date from key (yyyymmdd)
    ↓
Backend: Compare with cutoff date
    ↓
If key date < cutoff date:
    ↓
Backend: Delete key from Redis
    ↓
Backend: Log deletion
    ↓
After cleanup:
    ↓
Backend: Cache size checked
    ↓
Backend: Metrics recorded
    ↓
Backend: Alerts sent if size issues
```

### Cache Performance Optimization

1. **Connection Pooling:** Redis connection pool for concurrent operations
2. **Pipeline Operations:** Batch GET/SET operations for multiple keys
3. **Key Pattern Matching:** Efficient SCAN with MATCH pattern
4. **TTL Management:** Automatic expiration reduces manual cleanup
5. **Memory Optimization:** Compressed JSON storage

### API Integration

```
Internal Service Calls (not exposed as API endpoints)
  cacheService.get(key)
  cacheService.set(key, value, ttl)
  cacheService.getMultiple(pattern)
  cacheService.delete(key)
```

---

## Feature 7: User Interface & Navigation - Architecture

### Component Architecture

#### Frontend Structure

```
src/
├── components/
│   ├── Layout/
│   │   ├── Header.jsx                   # Fixed header navigation
│   │   ├── Navigation.jsx               # Main navigation menu
│   │   ├── Breadcrumbs.jsx              # Breadcrumb navigation
│   │   └── ThemeToggle.jsx               # Light/Dark theme switch
│   ├── Common/
│   │   ├── Button.jsx                   # Reusable button component
│   │   ├── Card.jsx                     # Card container
│   │   ├── Modal.jsx                    # Modal dialog
│   │   └── Toast.jsx                     # Toast notifications
│   └── [Feature Components]
├── styles/
│   ├── tailwind.config.js               # Tailwind configuration
│   ├── theme.js                         # Theme configuration
│   └── globals.css                      # Global styles
└── utils/
    ├── theme.js                         # Theme utilities
    └── navigation.js                   # Navigation helpers
```

### Design System Architecture

#### TailwindCSS Configuration

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        emerald: {
          // Emerald color palette
          50: '#ecfdf5',
          // ... full palette
          900: '#064e3b'
        },
        gold: {
          // Gold accents
          400: '#fbbf24',
          500: '#f59e0b'
        },
        amber: {
          // Amber accents
          400: '#fbbf24',
          500: '#f59e0b'
        }
      }
    }
  },
  darkMode: 'class', // Class-based dark mode
  plugins: []
};
```

#### Theme Management

```javascript
// Theme context and utilities
const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') || 'light'
  );
  
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

### Navigation Architecture

#### Routing Structure

```
Routes:
  / → Dashboard (redirect)
  /dashboard → Main Dashboard
  /dashboard/chart/:chartId → Chart Detail Page
  /reports → Reports Page
  /reports/generate/:reportType → Report Generation
  /settings → Settings Page (future)
```

#### Navigation Flow

```
User clicks navigation item
    ↓
Frontend: React Router navigation
    ↓
Frontend: Route component mounts
    ↓
Frontend: Protected route check (if needed)
    ↓
Frontend: Component fetches data
    ↓
Frontend: Component renders
    ↓
User: New page displayed
```

### Responsive Design Architecture

#### Breakpoints

```javascript
const breakpoints = {
  mobile: '640px',   // sm
  tablet: '768px',  // md
  desktop: '1024px' // lg
};

// Tailwind responsive classes
<div className="
  grid 
  grid-cols-1 
  md:grid-cols-2 
  lg:grid-cols-3
">
  {/* Responsive grid */}
</div>
```

#### Mobile Adaptations

```
Desktop: BOX sidebar (right-hand)
    ↓
Tablet: BOX sidebar (right-hand, narrower)
    ↓
Mobile: BOX becomes bottom sheet
```

### Accessibility Architecture

#### ARIA Labels and Roles

```jsx
<nav aria-label="Main navigation">
  <button 
    aria-label="Toggle dashboard"
    aria-current={isDashboard ? 'page' : undefined}
  >
    Dashboard
  </button>
</nav>

<div role="region" aria-label="Chart data">
  <ChartComponent aria-label="Course completion rate chart" />
</div>
```

#### Keyboard Navigation

```javascript
// Keyboard shortcuts
useEffect(() => {
  const handleKeyPress = (e) => {
    if (e.ctrlKey || e.metaKey) {
      switch(e.key) {
        case 'd': // Dashboard
          navigate('/dashboard');
          break;
        case 'r': // Reports
          navigate('/reports');
          break;
        case 's': // Settings
          navigate('/settings');
          break;
      }
    }
  };
  
  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, []);
```

---

## Feature 8: Security & Access Control - Architecture

### Security Architecture Layers

```
Layer 1: Network Security
  - TLS 1.3 encryption
  - HTTPS only
  - CORS configuration

Layer 2: Authentication
  - JWT token validation
  - Token expiration (2 hours)
  - Refresh token flow

Layer 3: Authorization
  - Role-based access control
  - System Administrator only
  - Route protection

Layer 4: Data Security
  - AES-256 encryption at rest
  - PII filtering
  - Data minimization

Layer 5: Audit & Monitoring
  - Action logging
  - Security event tracking
  - Compliance reporting
```

### Authentication Architecture

#### JWT Validation Flow

```
Request arrives
    ↓
Backend: Authentication middleware
    ↓
Backend: Extract JWT from Authorization header
    ↓
Backend: Verify JWT signature (using EducoreAI public key)
    ↓
Backend: Check token expiration
    ↓
If expired:
    ↓
Backend: Return 401 Unauthorized
    ↓
Frontend: Redirect to login
    ↓
If valid:
    ↓
Backend: Extract user claims (userId, role)
    ↓
Backend: Attach user info to request object
    ↓
Request proceeds to route handler
```

#### Authorization Middleware

```javascript
const authorizeAdmin = (req, res, next) => {
  const userRole = req.user.role;
  
  if (userRole !== 'System Administrator') {
    return res.status(403).json({
      error: 'Access denied',
      message: 'System Administrator role required'
    });
  }
  
  next();
};

// Usage
router.get('/dashboard', authenticate, authorizeAdmin, getDashboard);
```

### Data Encryption Architecture

#### Encryption at Rest

```javascript
// Sensitive data encryption before cache storage
const encryptionService = {
  encrypt: (data) => {
    const cipher = crypto.createCipheriv(
      'aes-256-gcm',
      process.env.ENCRYPTION_KEY,
      iv
    );
    const encrypted = cipher.update(data, 'utf8', 'hex');
    return encrypted + cipher.final('hex');
  },
  
  decrypt: (encryptedData) => {
    // Decryption logic
  }
};
```

#### Encryption in Transit

```
All API calls:
  - HTTPS/TLS 1.3
  - Certificate validation
  - No HTTP allowed
```

### Audit Logging Architecture

```javascript
const auditLogger = {
  log: (action, userId, resource, status) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      userId: userId,
      action: action, // 'login', 'report_generated', 'data_refresh'
      resource: resource,
      status: status, // 'success', 'failure'
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    };
    
    // Store in audit log (separate from application logs)
    auditLogService.store(logEntry);
  }
};

// Usage
auditLogger.log('report_generated', userId, 'monthly-performance', 'success');
```

### PII Filtering Architecture

```javascript
const piiFilter = {
  filter: (data) => {
    // Remove unnecessary PII
    const filtered = { ...data };
    
    // Remove email addresses (if not needed)
    if (filtered.email) delete filtered.email;
    
    // Remove phone numbers (if not needed)
    if (filtered.phone) delete filtered.phone;
    
    // Hash user IDs if needed for analytics
    if (filtered.userId) {
      filtered.userIdHash = hash(filtered.userId);
      delete filtered.userId;
    }
    
    return filtered;
  }
};
```

---

## System-Wide Architecture

### API Architecture

#### REST API Structure

```
Base URL: https://api.educoreai.com/management-reporting

Versioning: /api/v1/

Endpoints:
  GET    /api/v1/dashboard
  GET    /api/v1/charts/:chartId
  POST   /api/v1/dashboard/refresh
  GET    /api/v1/box/charts
  GET    /api/v1/reports/types
  POST   /api/v1/reports/generate
  POST   /api/v1/data/refresh
  GET    /api/v1/data/status
  GET    /api/v1/health
```

#### API Middleware Stack

```
Request
    ↓
CORS Middleware
    ↓
Rate Limiting Middleware
    ↓
Authentication Middleware (JWT validation)
    ↓
Authorization Middleware (Role check)
    ↓
Request Logging Middleware
    ↓
Error Handling Middleware
    ↓
Route Handler
    ↓
Response
```

### Backend Service Architecture

#### Onion Architecture Pattern

The backend follows the **Onion Architecture** pattern, which organizes code into concentric layers with dependencies pointing inward. This ensures that business logic remains independent of external frameworks and infrastructure concerns.

**Architecture Layers (from outer to inner):**

```
┌─────────────────────────────────────────────────┐
│  Presentation Layer (Outermost)                 │
│  - Controllers/Routes                            │
│  - Request/Response handling                     │
│  - Input validation                              │
│  - Error formatting                              │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  Infrastructure Layer                           │
│  - External API clients (microservices)         │
│  - Cache operations (Redis)                     │
│  - File system operations                       │
│  - HTTP clients                                  │
│  - Scheduled jobs                                │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  Application Layer                              │
│  - Use cases / Application services            │
│  - Business orchestration                        │
│  - Data aggregation logic                        │
│  - Report generation logic                      │
│  - AI integration orchestration                  │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  Domain Layer (Innermost)                       │
│  - Domain entities                              │
│  - Value objects                                 │
│  - Domain services                               │
│  - Business rules                                │
│  - Domain interfaces (ports)                    │
└─────────────────────────────────────────────────┘
```

**Layer Responsibilities:**

1. **Domain Layer (Core)**
   - Contains business entities and core business logic
   - No dependencies on other layers
   - Defines interfaces (ports) for external dependencies
   - Examples: `Report`, `ChartData`, `DataCollection`, `AIAnalysis`

2. **Application Layer**
   - Implements use cases and application services
   - Orchestrates domain objects
   - Depends only on Domain layer
   - Examples: `GenerateReportUseCase`, `CollectDataUseCase`, `AnalyzeReportUseCase`

3. **Infrastructure Layer**
   - Implements external concerns
   - Implements interfaces defined in Domain layer
   - Handles technical details (HTTP, Redis, file system)
   - Examples: `RedisCacheRepository`, `MicroserviceHttpClient`, `OpenAIClient`

4. **Presentation Layer**
   - Handles HTTP requests and responses
   - Maps between HTTP and application layer
   - Input validation and error handling
   - Examples: `DashboardController`, `ReportsController`, `DataCollectionController`

**Dependency Rule:**
- Dependencies point **inward** only
- Outer layers depend on inner layers
- Inner layers never depend on outer layers
- Domain layer has **zero dependencies**

#### Onion Architecture Directory Structure

```
backend/
├── domain/                          # Domain Layer (Core)
│   ├── entities/
│   │   ├── Report.js                # Report domain entity
│   │   ├── ChartData.js             # Chart data entity
│   │   ├── DataCollection.js        # Data collection entity
│   │   └── AIAnalysis.js            # AI analysis entity
│   ├── valueObjects/
│   │   ├── DateRange.js             # Date range value object
│   │   ├── Metrics.js               # Metrics value object
│   │   └── ReportType.js            # Report type value object
│   ├── services/
│   │   ├── DataNormalizationService.js
│   │   └── DataValidationService.js
│   └── ports/                       # Interfaces (ports)
│       ├── ICacheRepository.js      # Cache interface
│       ├── IMicroserviceClient.js  # Microservice client interface
│       ├── IPDFGenerator.js         # PDF generator interface
│       └── IAIService.js            # AI service interface
│
├── application/                     # Application Layer
│   ├── useCases/
│   │   ├── GetDashboardUseCase.js
│   │   ├── GenerateReportUseCase.js
│   │   ├── CollectDataUseCase.js
│   │   └── AnalyzeReportUseCase.js
│   └── services/
│       ├── DashboardService.js      # Application service
│       ├── ReportService.js
│       └── DataCollectionService.js
│
├── infrastructure/                  # Infrastructure Layer
│   ├── repositories/
│   │   └── RedisCacheRepository.js  # Implements ICacheRepository
│   ├── clients/
│   │   ├── MicroserviceHttpClient.js # Implements IMicroserviceClient
│   │   └── OpenAIClient.js          # Implements IAIService
│   ├── generators/
│   │   └── PuppeteerPDFGenerator.js # Implements IPDFGenerator
│   └── jobs/
│       └── DailyCollectionJob.js
│
└── presentation/                    # Presentation Layer
    ├── controllers/
    │   ├── DashboardController.js
    │   ├── ReportsController.js
    │   └── DataCollectionController.js
    ├── routes/
    │   ├── dashboard.js
    │   ├── reports.js
    │   └── data.js
    ├── middleware/
    │   ├── authentication.js
    │   ├── authorization.js
    │   └── errorHandler.js
    └── validators/
        ├── dashboardValidator.js
        └── reportValidator.js
```

#### Dependency Flow Example

```
Presentation Layer (Controller)
    ↓ depends on
Application Layer (Use Case)
    ↓ depends on
Domain Layer (Entity + Port Interface)
    ↑ implements
Infrastructure Layer (Repository Implementation)
```

**Example: Generate Report Flow**

```
1. Presentation: ReportsController.handleGenerateReport()
   ↓ calls
2. Application: GenerateReportUseCase.execute(reportType, filters)
   ↓ uses
3. Domain: Report entity + ICacheRepository port
   ↓ implemented by
4. Infrastructure: RedisCacheRepository.getData()
   ↓ returns data to
3. Domain: Report entity populated
   ↓ returns to
2. Application: ReportService formats report
   ↓ uses
3. Domain: IPDFGenerator port
   ↓ implemented by
4. Infrastructure: PuppeteerPDFGenerator.generate()
   ↓ returns PDF to
2. Application: Use case returns result
   ↓ returns to
1. Presentation: Controller sends HTTP response
```

**Benefits of Onion Architecture:**

1. **Independence:** Business logic independent of frameworks
2. **Testability:** Easy to test each layer in isolation
3. **Flexibility:** Can swap infrastructure without changing business logic
4. **Maintainability:** Clear separation of concerns
5. **Scalability:** Layers can be scaled independently

#### Service Dependencies (Onion Architecture)

Following the Onion Architecture pattern, dependencies flow inward:

**Application Layer Dependencies:**
```
GetDashboardUseCase (Application)
  ├── uses: ChartData (Domain Entity)
  ├── uses: ICacheRepository (Domain Port)
  └── implemented by: RedisCacheRepository (Infrastructure)

GenerateReportUseCase (Application)
  ├── uses: Report (Domain Entity)
  ├── uses: ICacheRepository (Domain Port)
  ├── uses: IPDFGenerator (Domain Port)
  └── uses: IAIService (Domain Port)
  └── implemented by:
      ├── RedisCacheRepository (Infrastructure)
      ├── PuppeteerPDFGenerator (Infrastructure)
      └── OpenAIClient (Infrastructure)

CollectDataUseCase (Application)
  ├── uses: DataCollection (Domain Entity)
  ├── uses: IMicroserviceClient (Domain Port)
  ├── uses: DataValidationService (Domain Service)
  ├── uses: DataNormalizationService (Domain Service)
  └── uses: ICacheRepository (Domain Port)
  └── implemented by:
      ├── MicroserviceHttpClient (Infrastructure)
      └── RedisCacheRepository (Infrastructure)

AnalyzeReportUseCase (Application)
  ├── uses: AIAnalysis (Domain Entity)
  └── uses: IAIService (Domain Port)
  └── implemented by: OpenAIClient (Infrastructure)
```

**Dependency Injection Pattern:**
- Application layer receives infrastructure implementations via dependency injection
- Domain ports (interfaces) are injected, not concrete implementations
- Enables easy testing with mock implementations
- Follows Dependency Inversion Principle

### Infrastructure Architecture

#### Deployment Architecture

```
Frontend (Vercel)
  ├── Build: Vite
  ├── Environment: Production/Staging
  └── CDN: Global distribution

Backend (Railway)
  ├── Runtime: Node.js
  ├── Instances: Horizontally scalable
  ├── Load Balancer: Automatic
  └── Environment Variables: Secure secrets

Cache (Redis Cloud)
  ├── Instance: Managed Redis
  ├── Backup: Daily automated
  ├── High Availability: Multi-region
  └── Monitoring: Built-in metrics
```

#### Environment Configuration

```javascript
// Environment variables structure
{
  // Frontend
  VITE_API_URL: 'https://api.educoreai.com/management-reporting',
  VITE_SUPABASE_URL: '', // Not used (Redis only)
  VITE_SUPABASE_KEY: '', // Not used
  
  // Backend
  NODE_ENV: 'production',
  PORT: 3000,
  REDIS_HOST: 'redis-cloud-host',
  REDIS_PORT: 6379,
  REDIS_PASSWORD: '***',
  JWT_SECRET: '***',
  OPENAI_API_KEY: '***',
  
  // Microservices
  DIRECTORY_API_URL: 'https://directory.educoreai.com',
  COURSE_BUILDER_API_URL: 'https://course-builder.educoreai.com',
  ASSESSMENT_API_URL: 'https://assessment.educoreai.com',
  CONTENT_STUDIO_API_URL: 'https://content-studio.educoreai.com',
  LEARNING_ANALYTICS_API_URL: 'https://analytics.educoreai.com'
}
```

### Scalability Architecture

#### Horizontal Scaling

```
Stateless Backend
  ├── Multiple instances
  ├── Shared Redis cache
  ├── Load balancer distributes requests
  └── Auto-scaling based on load

Scaling Triggers:
  - CPU usage > 70%
  - Memory usage > 80%
  - Request queue > 100
  - Response time > 2 seconds
```

#### Performance Optimization

```
1. Caching Strategy
   - Browser cache for static assets
   - API response caching (5-10 minutes)
   - Redis cache for data (60 days)

2. Data Preloading
   - Dashboard data preloaded on mount
   - Chart data cached in memory
   - Report templates cached

3. Batch Operations
   - Multiple cache keys in single request
   - Parallel microservice calls
   - Bulk PDF generation (future)

4. Lazy Loading
   - Chart components loaded on demand
   - Report templates loaded when needed
   - BOX charts loaded on sidebar open
```

### Monitoring and Observability

#### Health Checks

```
GET /api/v1/health
  Returns: {
    status: 'healthy',
    timestamp: '2024-01-15T10:00:00Z',
    services: {
      cache: 'connected',
      microservices: {
        directory: 'available',
        courseBuilder: 'available',
        // ...
      }
    }
  }
```

#### Metrics Collection

```
Metrics Tracked:
  - Response times (p50, p95, p99)
  - Request rates
  - Error rates
  - Cache hit/miss ratios
  - AI API usage and costs
  - Data collection success rates
```

#### Logging Architecture

```
Log Levels:
  - ERROR: Critical failures
  - WARN: Warnings and retries
  - INFO: Important events
  - DEBUG: Detailed debugging

Log Storage:
  - Application logs: 30 days
  - Audit logs: 90 days
  - Error logs: 90 days
```

---

## Data Architecture

### Data Flow Diagram

```
Microservices (5)
    ↓ (HTTP + JWT)
Data Collection Service
    ↓ (Validation + Normalization)
Redis Cache
    ↓ (Read Operations)
Backend Services
    ↓ (Aggregation + Formatting)
API Endpoints
    ↓ (REST API)
Frontend Application
    ↓ (User Interface)
System Administrators
```

### Data Schema

#### Cache Data Schema

```json
{
  "key": "mr:cb:course123:20240115",
  "value": {
    "data": {
      "courseId": "string",
      "courseName": "string",
      "metrics": {
        "completionRate": "number (0-100)",
        "averageRating": "number (0-5)",
        "enrollments": "number",
        "activeEnrollments": "number"
      },
      "feedback": [
        {
          "userId": "string",
          "rating": "number (1-5)",
          "comment": "string"
        }
      ]
    },
    "metadata": {
      "collected_at": "ISO 8601 timestamp",
      "source": "string (microservice name)",
      "schema_version": "string (semver)",
      "is_suspect": "boolean"
    }
  },
  "ttl": 5184000
}
```

### Data Governance

#### Data Retention Policy

- **Cache Data:** 60 days rolling window
- **Audit Logs:** 90 days
- **Application Logs:** 30 days
- **User Preferences:** Indefinite (until user deletion)

#### Data Minimization

- Only collect necessary data from microservices
- PII filtered before caching
- No unnecessary data retention
- GDPR compliance maintained

#### Data Quality

- Validation before storage
- Normalization for consistency
- Outlier detection and flagging
- Schema versioning for compatibility

---

## Security Architecture

### Security Controls

```
1. Authentication
   - JWT token validation
   - Token expiration (2 hours)
   - Refresh token mechanism

2. Authorization
   - Role-based access (System Administrator only)
   - Route-level protection
   - Resource-level checks

3. Encryption
   - TLS 1.3 in transit
   - AES-256 at rest (sensitive data)
   - Encrypted Redis connections

4. Data Protection
   - PII filtering
   - Data minimization
   - Secure key management

5. Audit & Compliance
   - Action logging
   - GDPR compliance
   - ISO-27001 standards
```

### Compliance Architecture

#### GDPR Compliance

```
- Data Minimization: Only necessary data collected
- Retention Limits: 60-day cache retention
- User Rights: Access and deletion support
- Privacy by Design: PII filtering built-in
- Secure Processing: Encryption and access controls
```

#### ISO-27001 Compliance

```
- Information Security Management
- Risk Assessment and Treatment
- Access Control Policies
- Incident Management Procedures
- Security Monitoring
```

---

## Document Approval

This System & Data Architecture Document is structured by system features and provides the highest possible level of technical detail for each feature's components, data flow, and dependencies.

**Please review this document and provide feedback. All feedback will be logged in `customFile.md`, and the document will be revised until you confirm it is perfect and fully aligned with your expectations.**

Only after your explicit approval will the process continue to Phase 5: Test Strategy.

---

**End of System & Data Architecture Document**

