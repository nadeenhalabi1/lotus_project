// Main Express Application Setup

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { DashboardController, ReportController, AIInsightsController, DataIngestionController } = require('./interfaces/controllers');
const { SupabaseRepository, RedisCacheService, ExternalServiceClient, AuthorizationService } = require('./infrastructure/repositories');
const { DashboardService, ReportGenerationService, DataIngestionService } = require('./application/services');
const { AIInsightsService } = require('./application/aiInsightsService');
const OpenAI = require('openai');

/**
 * Application Factory
 * Creates and configures the Express application
 */
class ApplicationFactory {
  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupServices();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  /**
   * Setup middleware
   */
  setupMiddleware() {
    // Security middleware
    this.app.use(helmet());
    
    // CORS configuration
    this.app.use(cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true
    }));

    // Compression
    this.app.use(compression());

    // Rate limiting
    const limiter = rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
      message: 'Too many requests from this IP, please try again later.'
    });
    this.app.use('/api/', limiter);

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    // Request logging
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  /**
   * Setup services and dependencies
   */
  async setupServices() {
    try {
      // Initialize external services
      this.supabaseRepository = new SupabaseRepository(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );

      this.redisCacheService = new RedisCacheService(process.env.REDIS_URL);
      await this.redisCacheService.connect();

      this.externalServiceClient = new ExternalServiceClient({
        DIRECTORY: process.env.DIRECTORY_SERVICE_URL,
        COURSE_BUILDER: process.env.COURSE_BUILDER_SERVICE_URL,
        ASSESSMENT: process.env.ASSESSMENT_SERVICE_URL,
        LEARNER_AI: process.env.LEARNER_AI_SERVICE_URL,
        LEARNING_ANALYTICS: process.env.LEARNING_ANALYTICS_SERVICE_URL,
        DEVLAB: process.env.DEVLAB_SERVICE_URL,
        AUTH: process.env.AUTH_SERVICE_URL
      });

      this.authorizationService = new AuthorizationService(
        this.externalServiceClient,
        this.supabaseRepository
      );

      // Initialize OpenAI client
      this.openaiClient = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });

      // Initialize application services
      this.dashboardService = new DashboardService(
        this.supabaseRepository,
        this.redisCacheService,
        this.authorizationService
      );

      this.reportGenerationService = new ReportGenerationService(
        this.supabaseRepository,
        this.supabaseRepository, // Using same repository for reports
        new AIInsightsService(this.openaiClient, this.supabaseRepository),
        this.redisCacheService
      );

      this.dataIngestionService = new DataIngestionService(
        this.externalServiceClient,
        this.supabaseRepository,
        this.redisCacheService
      );

      console.log('Services initialized successfully');
    } catch (error) {
      console.error('Failed to initialize services:', error);
      process.exit(1);
    }
  }

  /**
   * Setup routes
   */
  setupRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0'
      });
    });

    // API routes
    this.app.use('/api/dashboards', new DashboardController(
      this.dashboardService,
      this.authorizationService
    ).router);

    this.app.use('/api/reports', new ReportController(
      this.reportGenerationService,
      this.authorizationService
    ).router);

    this.app.use('/api/insights', new AIInsightsController(
      new AIInsightsService(this.openaiClient, this.supabaseRepository),
      this.authorizationService
    ).router);

    this.app.use('/api/data', new DataIngestionController(
      this.dataIngestionService,
      this.authorizationService
    ).router);

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Endpoint not found',
        path: req.originalUrl
      });
    });
  }

  /**
   * Setup error handling
   */
  setupErrorHandling() {
    // Global error handler
    this.app.use((error, req, res, next) => {
      console.error('Unhandled error:', error);
      
      res.status(error.status || 500).json({
        error: error.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
      });
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      this.shutdown();
    });

    process.on('SIGINT', () => {
      console.log('SIGINT received, shutting down gracefully');
      this.shutdown();
    });
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    try {
      if (this.redisCacheService) {
        await this.redisCacheService.redis.quit();
      }
      console.log('Application shutdown complete');
      process.exit(0);
    } catch (error) {
      console.error('Error during shutdown:', error);
      process.exit(1);
    }
  }

  /**
   * Get Express app
   */
  getApp() {
    return this.app;
  }
}

/**
 * Server Factory
 * Creates and starts the HTTP server
 */
class ServerFactory {
  constructor() {
    this.appFactory = new ApplicationFactory();
    this.app = this.appFactory.getApp();
  }

  /**
   * Start the server
   */
  async start() {
    const port = process.env.PORT || 3000;
    
    this.server = this.app.listen(port, () => {
      console.log(`HR Management Reporting Service running on port ${port}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Health check: http://localhost:${port}/health`);
    });

    this.server.on('error', (error) => {
      if (error.syscall !== 'listen') {
        throw error;
      }

      const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

      switch (error.code) {
        case 'EACCES':
          console.error(bind + ' requires elevated privileges');
          process.exit(1);
          break;
        case 'EADDRINUSE':
          console.error(bind + ' is already in use');
          process.exit(1);
          break;
        default:
          throw error;
      }
    });
  }

  /**
   * Stop the server
   */
  async stop() {
    if (this.server) {
      return new Promise((resolve) => {
        this.server.close(() => {
          console.log('Server stopped');
          resolve();
        });
      });
    }
  }
}

// Export for use in index.js
module.exports = {
  ApplicationFactory,
  ServerFactory
};

// If this file is run directly, start the server
if (require.main === module) {
  const serverFactory = new ServerFactory();
  serverFactory.start().catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}