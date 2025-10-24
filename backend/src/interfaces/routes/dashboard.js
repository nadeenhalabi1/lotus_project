const express = require('express');
const router = express.Router();

// Mock dashboard data
const mockDashboardData = {
  overview: {
    totalReports: 156,
    activeUsers: 23,
    completionRate: 0.87,
    lastUpdated: new Date().toISOString()
  },
  metrics: {
    courseAnalytics: {
      totalCourses: 45,
      completedCourses: 38,
      averageCompletionTime: '2.3 days',
      satisfactionScore: 4.2
    },
    userEngagement: {
      dailyActiveUsers: 23,
      weeklyActiveUsers: 156,
      monthlyActiveUsers: 423,
      engagementRate: 0.78
    },
    performanceTrends: {
      completionRate: [0.82, 0.85, 0.87, 0.89, 0.87],
      userGrowth: [156, 162, 168, 175, 180],
      satisfactionTrend: [4.1, 4.2, 4.3, 4.2, 4.2]
    }
  }
};

// GET /api/dashboards/admin - Administrator dashboard
router.get('/admin', (req, res) => {
  try {
    res.json({
      success: true,
      data: mockDashboardData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard data',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/dashboards/hr/:orgId - HR employee dashboard
router.get('/hr/:orgId', (req, res) => {
  try {
    const { orgId } = req.params;
    
    const hrDashboardData = {
      ...mockDashboardData,
      organizationId: orgId,
      organizationSpecific: {
        orgReports: 23,
        orgUsers: 8,
        orgCompletionRate: 0.91
      }
    };
    
    res.json({
      success: true,
      data: hrDashboardData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch HR dashboard data',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;

