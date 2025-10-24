# Frontend Dashboard
## educoreAI Management Reporting Microservice

### Project Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── Dashboard/
│   │   │   ├── DashboardOverview.jsx
│   │   │   ├── DashboardTabs.jsx
│   │   │   └── DashboardMetrics.jsx
│   │   ├── Reports/
│   │   │   ├── ReportView.jsx
│   │   │   ├── ReportChart.jsx
│   │   │   ├── ReportTable.jsx
│   │   │   └── ReportExport.jsx
│   │   ├── AIInsights/
│   │   │   ├── InsightPanel.jsx
│   │   │   ├── InsightCard.jsx
│   │   │   └── InsightActions.jsx
│   │   ├── Common/
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── ErrorBoundary.jsx
│   │   │   └── Modal.jsx
│   │   └── Layout/
│   │       ├── Header.jsx
│   │       ├── Sidebar.jsx
│   │       └── Footer.jsx
│   ├── pages/
│   │   ├── DashboardPage.jsx
│   │   ├── ReportsPage.jsx
│   │   └── LoginPage.jsx
│   ├── services/
│   │   ├── api.js
│   │   ├── auth.js
│   │   └── reports.js
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useReports.js
│   │   └── useAIInsights.js
│   ├── utils/
│   │   ├── constants.js
│   │   ├── helpers.js
│   │   └── validators.js
│   ├── styles/
│   │   ├── globals.css
│   │   ├── components.css
│   │   └── utilities.css
│   ├── App.jsx
│   └── main.jsx
├── public/
│   ├── index.html
│   └── favicon.ico
├── tests/
│   ├── unit/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   ├── integration/
│   │   └── user-flows.test.js
│   └── e2e/
│       ├── dashboard.spec.js
│       └── reports.spec.js
├── vite.config.js
└── package.json
```

### Technology Stack
- **Framework:** React 18+
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Charts:** Chart.js + react-chartjs-2
- **HTTP Client:** Axios
- **Testing:** Jest + React Testing Library + Playwright
- **State Management:** React Hooks + Context API
- **Authentication:** JWT tokens

### Getting Started

1. **Install Dependencies:**
```bash
cd frontend
npm install
```

2. **Environment Setup:**
```bash
cp .env.example .env
# Configure your environment variables
```

3. **Development:**
```bash
npm run dev
```

4. **Build:**
```bash
npm run build
```

### Features Implemented

#### Dashboard Overview
- Real-time metrics display
- Interactive charts and visualizations
- System status indicators
- Quick navigation between report types

#### Report Management
- Report generation and viewing
- Interactive charts with Chart.js
- Data tables with sorting and filtering
- PDF export functionality
- Real-time data refresh

#### AI Insights Integration
- AI-generated insights display
- Confidence scoring visualization
- Approval/rejection workflow
- Insight explanation and recommendations

#### User Experience
- Responsive design for desktop and mobile
- Loading states and error handling
- Accessibility compliance (WCAG 2.1)
- Modern UI with Tailwind CSS

### Testing

#### Unit Tests
```bash
npm run test:unit
```

#### Integration Tests
```bash
npm run test:integration
```

#### End-to-End Tests
```bash
npm run test:e2e
```

#### Coverage Report
```bash
npm run test:coverage
```

### Development Status
**Current Phase:** Development Implementation  
**Progress:** Frontend dashboard components implemented with React + Vite  
**Next:** AI integration and deployment preparation

