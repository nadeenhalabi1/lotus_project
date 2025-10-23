// Interface Layer - Express Controllers

const express = require('express');
const jwt = require('jsonwebtoken');
const { UserRole, TimeRange, ReportParameters } = require('../domain/entities');
const { AuthorizationPolicy } = require('../domain/policies');

/**
 * Base Controller
 * Provides common functionality for all controllers
 */
class BaseController {
  constructor() {
    this.router = express.Router();
  }

  /**
   * Authenticate JWT token
   */
  async authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
  }

  /**
   * Authorize user role
   */
  authorizeRole(allowedRoles) {
    return (req, res, next) => {
      const userRole = new UserRole(req.user.role);
      
      if (!allowedRoles.some(role => userRole.toString() === role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      
      next();
    };
  }

  /**
   * Handle errors
   */
  handleError(res, error, statusCode = 500) {
    console.error('Controller error:', error);
    return res.status(statusCode).json({ 
      error: error.message || 'Internal server error' 
    });
  }

  /**
   * Validate request body
   */
  validateBody(schema) {
    return (req, res, next) => {
      const { error } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ 
          error: 'Validation error', 
          details: error.details 
        });
      }
      next();
    };
  }
}

/**
 * Dashboard Controller
 * Handles dashboard-related endpoints
 */
class DashboardController extends BaseController {
  constructor(dashboardService, authorizationService) {
    super();
    this.dashboardService = dashboardService;
    this.authorizationService = authorizationService;
    this.setupRoutes();
  }

  setupRoutes() {
    // Administrator dashboard
    this.router.get('/admin', 
      this.authenticateToken.bind(this),
      this.authorizeRole(['administrator']),
      this.getAdministratorDashboard.bind(this)
    );

    // HR employee dashboard
    this.router.get('/hr/:organizationId',
      this.authenticateToken.bind(this),
      this.authorizeRole(['hr_employee', 'administrator']),
      this.getHREmployeeDashboard.bind(this)
    );
  }

  /**
   * Get administrator dashboard
   */
  async getAdministratorDashboard(req, res) {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Start date and end date are required' });
      }

      const timeRange = new TimeRange(new Date(startDate), new Date(endDate));
      const dashboardData = await this.dashboardService.getAdministratorDashboard(
        req.user.userId, 
        timeRange
      );

      res.json({
        success: true,
        data: dashboardData
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * Get HR employee dashboard
   */
  async getHREmployeeDashboard(req, res) {
    try {
      const { organizationId } = req.params;
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Start date and end date are required' });
      }

      const timeRange = new TimeRange(new Date(startDate), new Date(endDate));
      const dashboardData = await this.dashboardService.getHREmployeeDashboard(
        req.user.userId,
        organizationId,
        timeRange
      );

      res.json({
        success: true,
        data: dashboardData
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }
}

/**
 * Report Controller
 * Handles report generation and management
 */
class ReportController extends BaseController {
  constructor(reportGenerationService, authorizationService) {
    super();
    this.reportGenerationService = reportGenerationService;
    this.authorizationService = authorizationService;
    this.setupRoutes();
  }

  setupRoutes() {
    // Generate report
    this.router.post('/generate',
      this.authenticateToken.bind(this),
      this.authorizeRole(['administrator', 'hr_employee']),
      this.generateReport.bind(this)
    );

    // Get report by ID
    this.router.get('/:reportId',
      this.authenticateToken.bind(this),
      this.authorizeRole(['administrator', 'hr_employee']),
      this.getReport.bind(this)
    );

    // Get report history
    this.router.get('/',
      this.authenticateToken.bind(this),
      this.authorizeRole(['administrator', 'hr_employee']),
      this.getReportHistory.bind(this)
    );
  }

  /**
   * Generate a new report
   */
  async generateReport(req, res) {
    try {
      const { organizationId, startDate, endDate, metricTypes, filters } = req.body;
      
      if (!organizationId || !startDate || !endDate) {
        return res.status(400).json({ 
          error: 'Organization ID, start date, and end date are required' 
        });
      }

      const timeRange = new TimeRange(new Date(startDate), new Date(endDate));
      const parameters = new ReportParameters(
        organizationId,
        timeRange,
        metricTypes || [],
        filters || {}
      );

      const report = await this.reportGenerationService.generateReport(
        req.user.userId,
        parameters
      );

      res.status(201).json({
        success: true,
        data: report
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * Get report by ID
   */
  async getReport(req, res) {
    try {
      const { reportId } = req.params;
      const report = await this.reportGenerationService.getReport(reportId, req.user.userId);

      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * Get report history
   */
  async getReportHistory(req, res) {
    try {
      const { limit = 50, offset = 0 } = req.query;
      const reports = await this.reportGenerationService.getReportHistory(
        req.user.userId,
        parseInt(limit),
        parseInt(offset)
      );

      res.json({
        success: true,
        data: reports
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }
}

/**
 * AI Insights Controller
 * Handles AI recommendation management
 */
class AIInsightsController extends BaseController {
  constructor(aiInsightsService, authorizationService) {
    super();
    this.aiInsightsService = aiInsightsService;
    this.authorizationService = authorizationService;
    this.setupRoutes();
  }

  setupRoutes() {
    // Analyze metrics
    this.router.post('/analyze',
      this.authenticateToken.bind(this),
      this.authorizeRole(['administrator', 'hr_employee']),
      this.analyzeMetrics.bind(this)
    );

    // Approve recommendation
    this.router.post('/:recommendationId/approve',
      this.authenticateToken.bind(this),
      this.authorizeRole(['administrator', 'hr_employee']),
      this.approveRecommendation.bind(this)
    );

    // Reject recommendation
    this.router.post('/:recommendationId/reject',
      this.authenticateToken.bind(this),
      this.authorizeRole(['administrator', 'hr_employee']),
      this.rejectRecommendation.bind(this)
    );

    // Get recommendation statistics
    this.router.get('/stats',
      this.authenticateToken.bind(this),
      this.authorizeRole(['administrator']),
      this.getRecommendationStats.bind(this)
    );
  }

  /**
   * Analyze metrics and generate recommendations
   */
  async analyzeMetrics(req, res) {
    try {
      const { metrics, parameters } = req.body;
      
      if (!metrics || !parameters) {
        return res.status(400).json({ 
          error: 'Metrics and parameters are required' 
        });
      }

      const recommendations = await this.aiInsightsService.analyzeMetrics(
        metrics,
        parameters
      );

      res.json({
        success: true,
        data: recommendations
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * Approve a recommendation
   */
  async approveRecommendation(req, res) {
    try {
      const { recommendationId } = req.params;
      const recommendation = await this.aiInsightsService.approveRecommendation(
        recommendationId,
        req.user.userId
      );

      res.json({
        success: true,
        data: recommendation
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * Reject a recommendation
   */
  async rejectRecommendation(req, res) {
    try {
      const { recommendationId } = req.params;
      const recommendation = await this.aiInsightsService.rejectRecommendation(
        recommendationId
      );

      res.json({
        success: true,
        data: recommendation
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * Get recommendation statistics
   */
  async getRecommendationStats(req, res) {
    try {
      const stats = await this.aiInsightsService.getRecommendationStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }
}

/**
 * Data Ingestion Controller
 * Handles data ingestion from external services
 */
class DataIngestionController extends BaseController {
  constructor(dataIngestionService, authorizationService) {
    super();
    this.dataIngestionService = dataIngestionService;
    this.authorizationService = authorizationService;
    this.setupRoutes();
  }

  setupRoutes() {
    // Trigger data ingestion
    this.router.post('/ingest',
      this.authenticateToken.bind(this),
      this.authorizeRole(['administrator']),
      this.ingestAllData.bind(this)
    );

    // Trigger service-specific ingestion
    this.router.post('/ingest/:serviceName',
      this.authenticateToken.bind(this),
      this.authorizeRole(['administrator']),
      this.ingestServiceData.bind(this)
    );
  }

  /**
   * Ingest data from all services
   */
  async ingestAllData(req, res) {
    try {
      const results = await this.dataIngestionService.ingestAllData();

      res.json({
        success: true,
        data: results
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * Ingest data from specific service
   */
  async ingestServiceData(req, res) {
    try {
      const { serviceName } = req.params;
      const result = await this.dataIngestionService.ingestServiceData(serviceName);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }
}

module.exports = {
  BaseController,
  DashboardController,
  ReportController,
  AIInsightsController,
  DataIngestionController
};