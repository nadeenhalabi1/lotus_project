// Simple Backend Server
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'HR Management Reporting Backend'
  });
});

// Admin dashboard endpoint
app.get('/api/dashboards/admin', (req, res) => {
  res.json({
    message: 'Admin dashboard data',
    metrics: {
      totalOrganizations: 3,
      totalUsers: 150,
      courseCompletions: 89,
      skillProgress: 75
    }
  });
});

// HR dashboard endpoint
app.get('/api/dashboards/hr/:orgId', (req, res) => {
  res.json({
    message: `HR dashboard for organization ${req.params.orgId}`,
    metrics: {
      organizationId: req.params.orgId,
      teamCount: 5,
      completionRate: 85,
      skillGaps: 3
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`👨‍💼 Admin dashboard: http://localhost:${PORT}/api/dashboards/admin`);
});