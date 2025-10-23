// Infrastructure Layer - Repositories and External Services

const { createClient } = require('@supabase/supabase-js');
const Redis = require('redis');
const axios = require('axios');

/**
 * Supabase Repository
 * Handles database operations using Supabase
 */
class SupabaseRepository {
  constructor(supabaseUrl, supabaseKey) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Get metrics by parameters
   */
  async getMetricsByParameters(parameters) {
    const { data, error } = await this.supabase
      .from('fact_metrics')
      .select('*')
      .eq('org_id', parameters.organizationId)
      .gte('time_key', parameters.timeRange.startDate.toISOString().split('T')[0])
      .lte('time_key', parameters.timeRange.endDate.toISOString().split('T')[0])
      .in('metric_type', parameters.metricTypes);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  }

  /**
   * Get cross-organizational metrics
   */
  async getCrossOrganizationalMetrics(timeRange) {
    const { data, error } = await this.supabase
      .from('fact_metrics')
      .select('*')
      .gte('time_key', timeRange.startDate.toISOString().split('T')[0])
      .lte('time_key', timeRange.endDate.toISOString().split('T')[0]);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  }

  /**
   * Get organization-specific metrics
   */
  async getOrganizationMetrics(organizationId, timeRange) {
    const { data, error } = await this.supabase
      .from('fact_metrics')
      .select('*')
      .eq('org_id', organizationId)
      .gte('time_key', timeRange.startDate.toISOString().split('T')[0])
      .lte('time_key', timeRange.endDate.toISOString().split('T')[0]);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  }

  /**
   * Save metrics to database
   */
  async saveMetrics(metrics) {
    const { data, error } = await this.supabase
      .from('fact_metrics')
      .insert(metrics);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  }

  /**
   * Save report to database
   */
  async saveReport(report) {
    const reportData = {
      report_id: report.id,
      user_id: report.userId,
      report_type: report.parameters.metricTypes.join(','),
      parameters: JSON.stringify(report.parameters),
      generated_at: report.createdAt.toISOString(),
      status: report.status
    };

    const { data, error } = await this.supabase
      .from('reports')
      .insert(reportData);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  }

  /**
   * Get report by ID
   */
  async getReportById(reportId) {
    const { data, error } = await this.supabase
      .from('reports')
      .select('*')
      .eq('report_id', reportId)
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  }

  /**
   * Get reports by user ID
   */
  async getReportsByUserId(userId, limit = 50, offset = 0) {
    const { data, error } = await this.supabase
      .from('reports')
      .select('*')
      .eq('user_id', userId)
      .order('generated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  }
}

/**
 * Redis Cache Service
 * Handles caching operations using Redis
 */
class RedisCacheService {
  constructor(redisUrl) {
    this.redis = Redis.createClient({ url: redisUrl });
    this.redis.on('error', (err) => console.error('Redis Client Error', err));
  }

  /**
   * Connect to Redis
   */
  async connect() {
    await this.redis.connect();
  }

  /**
   * Get value from cache
   */
  async get(key) {
    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set(key, value, ttlSeconds = 3600) {
    try {
      await this.redis.setEx(key, ttlSeconds, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Redis SET error:', error);
      return false;
    }
  }

  /**
   * Delete value from cache
   */
  async del(key) {
    try {
      await this.redis.del(key);
      return true;
    } catch (error) {
      console.error('Redis DEL error:', error);
      return false;
    }
  }

  /**
   * Clear cache by pattern
   */
  async clearPattern(pattern) {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(keys);
      }
      return true;
    } catch (error) {
      console.error('Redis CLEAR error:', error);
      return false;
    }
  }
}

/**
 * External Service Client
 * Handles communication with external microservices
 */
class ExternalServiceClient {
  constructor(serviceUrls) {
    this.serviceUrls = serviceUrls;
    this.httpClient = axios.create({
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Get data from a specific service
   */
  async getData(serviceName) {
    const serviceUrl = this.serviceUrls[serviceName];
    
    if (!serviceUrl) {
      throw new Error(`Service URL not configured for ${serviceName}`);
    }

    try {
      const response = await this.httpClient.get(`${serviceUrl}/api/data`);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(`Service ${serviceName} returned error: ${error.response.status} ${error.response.statusText}`);
      } else if (error.request) {
        throw new Error(`Service ${serviceName} is unreachable`);
      } else {
        throw new Error(`Request to ${serviceName} failed: ${error.message}`);
      }
    }
  }

  /**
   * Get user data from DIRECTORY service
   */
  async getUserData(userId) {
    try {
      const response = await this.httpClient.get(`${this.serviceUrls.DIRECTORY}/api/users/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get user data: ${error.message}`);
    }
  }

  /**
   * Validate JWT token with AUTH service
   */
  async validateToken(token) {
    try {
      const response = await this.httpClient.post(`${this.serviceUrls.AUTH}/api/validate`, {
        token: token
      });
      return response.data;
    } catch (error) {
      throw new Error(`Token validation failed: ${error.message}`);
    }
  }

  /**
   * Get course data from COURSE_BUILDER service
   */
  async getCourseData(organizationId, timeRange) {
    try {
      const response = await this.httpClient.get(`${this.serviceUrls.COURSE_BUILDER}/api/courses`, {
        params: {
          organizationId: organizationId,
          startDate: timeRange.startDate.toISOString(),
          endDate: timeRange.endDate.toISOString()
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get course data: ${error.message}`);
    }
  }

  /**
   * Get assessment data from ASSESSMENT service
   */
  async getAssessmentData(organizationId, timeRange) {
    try {
      const response = await this.httpClient.get(`${this.serviceUrls.ASSESSMENT}/api/assessments`, {
        params: {
          organizationId: organizationId,
          startDate: timeRange.startDate.toISOString(),
          endDate: timeRange.endDate.toISOString()
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get assessment data: ${error.message}`);
    }
  }

  /**
   * Get skill data from LEARNER_AI service
   */
  async getSkillData(organizationId, timeRange) {
    try {
      const response = await this.httpClient.get(`${this.serviceUrls.LEARNER_AI}/api/skills`, {
        params: {
          organizationId: organizationId,
          startDate: timeRange.startDate.toISOString(),
          endDate: timeRange.endDate.toISOString()
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get skill data: ${error.message}`);
    }
  }

  /**
   * Get analytics data from LEARNING_ANALYTICS service
   */
  async getAnalyticsData(organizationId, timeRange) {
    try {
      const response = await this.httpClient.get(`${this.serviceUrls.LEARNING_ANALYTICS}/api/analytics`, {
        params: {
          organizationId: organizationId,
          startDate: timeRange.startDate.toISOString(),
          endDate: timeRange.endDate.toISOString()
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get analytics data: ${error.message}`);
    }
  }

  /**
   * Get devlab data from DEVLAB service
   */
  async getDevlabData(organizationId, timeRange) {
    try {
      const response = await this.httpClient.get(`${this.serviceUrls.DEVLAB}/api/exercises`, {
        params: {
          organizationId: organizationId,
          startDate: timeRange.startDate.toISOString(),
          endDate: timeRange.endDate.toISOString()
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get devlab data: ${error.message}`);
    }
  }
}

/**
 * Authorization Service
 * Handles user authentication and authorization
 */
class AuthorizationService {
  constructor(externalServiceClient, supabaseRepository) {
    this.externalServiceClient = externalServiceClient;
    this.supabaseRepository = supabaseRepository;
  }

  /**
   * Get user by ID
   */
  async getUser(userId) {
    try {
      const userData = await this.externalServiceClient.getUserData(userId);
      return {
        id: userData.id,
        role: new (require('../domain/entities').UserRole)(userData.role),
        organizationId: userData.organizationId,
        status: userData.status
      };
    } catch (error) {
      throw new Error(`Failed to get user: ${error.message}`);
    }
  }

  /**
   * Validate JWT token
   */
  async validateToken(token) {
    try {
      const tokenData = await this.externalServiceClient.validateToken(token);
      return {
        userId: tokenData.userId,
        role: tokenData.role,
        organizationId: tokenData.organizationId,
        expiresAt: tokenData.expiresAt
      };
    } catch (error) {
      throw new Error(`Token validation failed: ${error.message}`);
    }
  }
}

module.exports = {
  SupabaseRepository,
  RedisCacheService,
  ExternalServiceClient,
  AuthorizationService
};