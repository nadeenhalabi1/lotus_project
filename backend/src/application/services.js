// Application Layer - Use Case Services

const { UserRole, Organization, Team, MetricValue, TimeRange, ReportParameters, AIRecommendation, Report } = require('../domain/entities');
const { DataNormalizationPolicy, DataFilteringPolicy, AuthorizationPolicy, AggregationPolicy, DataRetentionPolicy } = require('../domain/policies');

/**
 * Dashboard Service
 * Handles dashboard data retrieval and presentation
 */
class DashboardService {
  constructor(metricRepository, cacheService, authorizationService) {
    this.metricRepository = metricRepository;
    this.cacheService = cacheService;
    this.authorizationService = authorizationService;
  }

  /**
   * Get administrator dashboard data
   */
  async getAdministratorDashboard(userId, timeRange) {
    // Verify user is administrator
    const user = await this.authorizationService.getUser(userId);
    if (!user.role.isAdministrator()) {
      throw new Error('Unauthorized: Administrator access required');
    }

    // Check cache first
    const cacheKey = `admin_dashboard_${timeRange.startDate.toISOString()}_${timeRange.endDate.toISOString()}`;
    let dashboardData = await this.cacheService.get(cacheKey);

    if (!dashboardData) {
      // Get cross-organizational metrics
      const metrics = await this.metricRepository.getCrossOrganizationalMetrics(timeRange);
      
      // Aggregate by organization
      const aggregatedData = AggregationPolicy.aggregateByOrganization(metrics);
      
      // Calculate trends and benchmarks
      dashboardData = {
        organizations: Object.keys(aggregatedData).length,
        totalMetrics: metrics.length,
        aggregatedData: aggregatedData,
        trends: await this.calculateTrends(metrics, timeRange),
        benchmarks: await this.calculateBenchmarks(aggregatedData),
        lastUpdated: new Date()
      };

      // Cache for 1 hour
      await this.cacheService.set(cacheKey, dashboardData, 3600);
    }

    return dashboardData;
  }

  /**
   * Get HR employee dashboard data
   */
  async getHREmployeeDashboard(userId, organizationId, timeRange) {
    // Verify user is HR employee and has access to organization
    const user = await this.authorizationService.getUser(userId);
    if (!user.role.isHREmployee()) {
      throw new Error('Unauthorized: HR employee access required');
    }

    if (!AuthorizationPolicy.canAccessOrganizationData(user.role, userId, organizationId)) {
      throw new Error('Unauthorized: Access to organization denied');
    }

    // Check cache first
    const cacheKey = `hr_dashboard_${organizationId}_${timeRange.startDate.toISOString()}_${timeRange.endDate.toISOString()}`;
    let dashboardData = await this.cacheService.get(cacheKey);

    if (!dashboardData) {
      // Get organization-specific metrics
      const metrics = await this.metricRepository.getOrganizationMetrics(organizationId, timeRange);
      
      // Aggregate by team
      const aggregatedData = AggregationPolicy.aggregateByTeam(metrics);
      
      dashboardData = {
        organizationId: organizationId,
        totalMetrics: metrics.length,
        aggregatedData: aggregatedData,
        compliance: await this.calculateCompliance(metrics),
        skillGaps: await this.identifySkillGaps(metrics),
        lastUpdated: new Date()
      };

      // Cache for 1 hour
      await this.cacheService.set(cacheKey, dashboardData, 3600);
    }

    return dashboardData;
  }

  /**
   * Calculate trends from metrics
   */
  async calculateTrends(metrics, timeRange) {
    const trends = {};
    const metricTypes = [...new Set(metrics.map(m => m.metricType))];

    for (const metricType of metricTypes) {
      const typeMetrics = metrics.filter(m => m.metricType === metricType);
      const sortedMetrics = typeMetrics.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      
      if (sortedMetrics.length >= 2) {
        const firstValue = sortedMetrics[0].value;
        const lastValue = sortedMetrics[sortedMetrics.length - 1].value;
        const change = ((lastValue - firstValue) / firstValue) * 100;
        
        trends[metricType] = {
          change: Math.round(change * 100) / 100,
          direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
          firstValue: firstValue,
          lastValue: lastValue
        };
      }
    }

    return trends;
  }

  /**
   * Calculate benchmarks across organizations
   */
  async calculateBenchmarks(aggregatedData) {
    const benchmarks = {};
    const organizations = Object.values(aggregatedData);

    if (organizations.length === 0) return benchmarks;

    // Calculate averages across all organizations
    const metricTypes = new Set();
    organizations.forEach(org => {
      Object.keys(org.metrics).forEach(metricType => metricTypes.add(metricType));
    });

    for (const metricType of metricTypes) {
      const values = organizations
        .map(org => org.metrics[metricType]?.average)
        .filter(val => val !== undefined);

      if (values.length > 0) {
        const average = values.reduce((sum, val) => sum + val, 0) / values.length;
        const max = Math.max(...values);
        const min = Math.min(...values);

        benchmarks[metricType] = {
          average: Math.round(average * 100) / 100,
          max: max,
          min: min,
          range: max - min
        };
      }
    }

    return benchmarks;
  }

  /**
   * Calculate compliance metrics
   */
  async calculateCompliance(metrics) {
    const complianceMetrics = metrics.filter(m => m.metricType === 'compliance');
    const total = complianceMetrics.length;
    const completed = complianceMetrics.filter(m => m.value >= 80).length; // 80% threshold

    return {
      total: total,
      completed: completed,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      status: completed / total >= 0.8 ? 'compliant' : 'at-risk'
    };
  }

  /**
   * Identify skill gaps
   */
  async identifySkillGaps(metrics) {
    const skillMetrics = metrics.filter(m => m.metricType === 'skill_progress');
    const skillGaps = [];

    // Group by skill type
    const skillGroups = {};
    skillMetrics.forEach(metric => {
      const skillType = metric.metadata.skillType || 'unknown';
      if (!skillGroups[skillType]) {
        skillGroups[skillType] = [];
      }
      skillGroups[skillType].push(metric.value);
    });

    // Identify gaps (skills with average progress < 60%)
    Object.keys(skillGroups).forEach(skillType => {
      const values = skillGroups[skillType];
      const average = values.reduce((sum, val) => sum + val, 0) / values.length;
      
      if (average < 60) {
        skillGaps.push({
          skillType: skillType,
          averageProgress: Math.round(average * 100) / 100,
          gap: 60 - average,
          priority: average < 30 ? 'high' : average < 45 ? 'medium' : 'low'
        });
      }
    });

    return skillGaps.sort((a, b) => b.gap - a.gap);
  }
}

/**
 * Report Generation Service
 * Handles report creation and management
 */
class ReportGenerationService {
  constructor(metricRepository, reportRepository, aiInsightsService, cacheService) {
    this.metricRepository = metricRepository;
    this.reportRepository = reportRepository;
    this.aiInsightsService = aiInsightsService;
    this.cacheService = cacheService;
  }

  /**
   * Generate a new report
   */
  async generateReport(userId, parameters) {
    if (!parameters.isValid()) {
      throw new Error('Invalid report parameters');
    }

    // Get metrics based on parameters
    const metrics = await this.metricRepository.getMetricsByParameters(parameters);
    
    // Generate AI insights
    const aiRecommendations = await this.aiInsightsService.analyzeMetrics(metrics, parameters);
    
    // Create report
    const report = new Report(
      this.generateReportId(),
      userId,
      parameters,
      metrics,
      aiRecommendations
    );

    // Save report
    await this.reportRepository.save(report);

    return report;
  }

  /**
   * Get report by ID
   */
  async getReport(reportId, userId) {
    const report = await this.reportRepository.findById(reportId);
    
    if (!report) {
      throw new Error('Report not found');
    }

    // Check if user has access to this report
    if (report.userId !== userId) {
      throw new Error('Unauthorized: Access to report denied');
    }

    return report;
  }

  /**
   * Get user's report history
   */
  async getReportHistory(userId, limit = 50, offset = 0) {
    return await this.reportRepository.findByUserId(userId, limit, offset);
  }

  /**
   * Generate report ID
   */
  generateReportId() {
    return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Data Ingestion Service
 * Handles data collection from external microservices
 */
class DataIngestionService {
  constructor(externalServiceClient, metricRepository, cacheService) {
    this.externalServiceClient = externalServiceClient;
    this.metricRepository = metricRepository;
    this.cacheService = cacheService;
  }

  /**
   * Ingest data from all microservices
   */
  async ingestAllData() {
    const services = [
      'DIRECTORY',
      'COURSE_BUILDER',
      'ASSESSMENT',
      'LEARNER_AI',
      'LEARNING_ANALYTICS',
      'DEVLAB'
    ];

    const results = {};

    for (const service of services) {
      try {
        results[service] = await this.ingestServiceData(service);
      } catch (error) {
        console.error(`Failed to ingest data from ${service}:`, error);
        results[service] = { error: error.message };
      }
    }

    return results;
  }

  /**
   * Ingest data from a specific service
   */
  async ingestServiceData(serviceName) {
    const rawData = await this.externalServiceClient.getData(serviceName);
    
    // Filter and normalize data
    const filteredData = this.filterData(rawData);
    const normalizedData = this.normalizeData(filteredData, serviceName);
    
    // Save to repository
    const savedMetrics = await this.metricRepository.saveMetrics(normalizedData);
    
    // Update cache
    await this.updateCache(normalizedData);
    
    return {
      service: serviceName,
      recordsProcessed: normalizedData.length,
      recordsSaved: savedMetrics.length,
      timestamp: new Date()
    };
  }

  /**
   * Filter data according to business rules
   */
  filterData(rawData) {
    return rawData.filter(record => {
      // Remove PII
      if (DataFilteringPolicy.containsPII(record)) {
        return false;
      }
      
      // Check if record is complete
      if (!DataFilteringPolicy.isCompleteRecord(record)) {
        return false;
      }
      
      // Check if user is active
      if (record.user && !DataFilteringPolicy.isActiveUser(record.user)) {
        return false;
      }
      
      return true;
    });
  }

  /**
   * Normalize data according to business rules
   */
  normalizeData(filteredData, serviceName) {
    return filteredData.map(record => {
      const normalizedRecord = { ...record };
      
      // Normalize dates
      if (record.timestamp) {
        normalizedRecord.timestamp = DataNormalizationPolicy.normalizeDate(record.timestamp);
      }
      
      // Normalize skill taxonomy
      if (record.skillData) {
        normalizedRecord.skillData = DataNormalizationPolicy.normalizeSkillTaxonomy(record.skillData);
      }
      
      // Normalize scores
      if (record.score && record.maxScore) {
        normalizedRecord.normalizedScore = DataNormalizationPolicy.normalizeScore(
          record.score, 
          record.maxScore, 
          record.minScore || 0
        );
      }
      
      // Add service metadata
      normalizedRecord.sourceService = serviceName;
      normalizedRecord.ingestedAt = new Date().toISOString();
      
      return normalizedRecord;
    });
  }

  /**
   * Update cache with new data
   */
  async updateCache(normalizedData) {
    // Group data by organization for cache efficiency
    const dataByOrg = {};
    normalizedData.forEach(record => {
      const orgId = record.organizationId;
      if (!dataByOrg[orgId]) {
        dataByOrg[orgId] = [];
      }
      dataByOrg[orgId].push(record);
    });

    // Update cache for each organization
    for (const [orgId, data] of Object.entries(dataByOrg)) {
      const cacheKey = `org_metrics_${orgId}`;
      await this.cacheService.set(cacheKey, data, 86400); // 24 hours
    }
  }
}

module.exports = {
  DashboardService,
  ReportGenerationService,
  DataIngestionService
};