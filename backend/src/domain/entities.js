// Domain Core Layer - Business Entities and Value Objects

/**
 * User Role Value Object
 * Defines the different user roles in the system
 */
class UserRole {
  static ADMINISTRATOR = 'administrator';
  static HR_EMPLOYEE = 'hr_employee';

  constructor(role) {
    if (![UserRole.ADMINISTRATOR, UserRole.HR_EMPLOYEE].includes(role)) {
      throw new Error(`Invalid user role: ${role}`);
    }
    this.role = role;
  }

  isAdministrator() {
    return this.role === UserRole.ADMINISTRATOR;
  }

  isHREmployee() {
    return this.role === UserRole.HR_EMPLOYEE;
  }

  toString() {
    return this.role;
  }
}

/**
 * Organization Entity
 * Represents a client organization in the system
 */
class Organization {
  constructor(id, name, status = 'active') {
    this.id = id;
    this.name = name;
    this.status = status;
    this.createdAt = new Date();
  }

  isActive() {
    return this.status === 'active';
  }

  deactivate() {
    this.status = 'inactive';
  }
}

/**
 * Team Entity
 * Represents a team within an organization
 */
class Team {
  constructor(id, name, organizationId, department = null) {
    this.id = id;
    this.name = name;
    this.organizationId = organizationId;
    this.department = department;
  }
}

/**
 * Metric Value Object
 * Represents a data point with value and metadata
 */
class MetricValue {
  constructor(value, metricType, timestamp, metadata = {}) {
    this.value = value;
    this.metricType = metricType;
    this.timestamp = timestamp;
    this.metadata = metadata;
  }

  isValid() {
    return typeof this.value === 'number' && 
           this.value >= 0 && 
           this.metricType && 
           this.timestamp instanceof Date;
  }
}

/**
 * Time Range Value Object
 * Represents a time period for data queries
 */
class TimeRange {
  constructor(startDate, endDate) {
    this.startDate = startDate;
    this.endDate = endDate;
    
    if (startDate >= endDate) {
      throw new Error('Start date must be before end date');
    }
  }

  getDays() {
    return Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24));
  }

  contains(date) {
    return date >= this.startDate && date <= this.endDate;
  }
}

/**
 * Report Parameters Value Object
 * Defines parameters for report generation
 */
class ReportParameters {
  constructor(organizationId, timeRange, metricTypes = [], filters = {}) {
    this.organizationId = organizationId;
    this.timeRange = timeRange;
    this.metricTypes = metricTypes;
    this.filters = filters;
  }

  isValid() {
    return this.organizationId && 
           this.timeRange instanceof TimeRange &&
           Array.isArray(this.metricTypes);
  }
}

/**
 * AI Recommendation Entity
 * Represents an AI-generated insight or recommendation
 */
class AIRecommendation {
  constructor(id, dataPoint, reason, recommendation, status = 'pending') {
    this.id = id;
    this.dataPoint = dataPoint;
    this.reason = reason;
    this.recommendation = recommendation;
    this.status = status;
    this.createdAt = new Date();
    this.approvedBy = null;
    this.approvedAt = null;
  }

  approve(userId) {
    this.status = 'approved';
    this.approvedBy = userId;
    this.approvedAt = new Date();
  }

  reject() {
    this.status = 'rejected';
  }

  isPending() {
    return this.status === 'pending';
  }

  isApproved() {
    return this.status === 'approved';
  }

  isRejected() {
    return this.status === 'rejected';
  }
}

/**
 * Report Entity
 * Represents a generated report with data and AI insights
 */
class Report {
  constructor(id, userId, parameters, data, aiRecommendations = []) {
    this.id = id;
    this.userId = userId;
    this.parameters = parameters;
    this.data = data;
    this.aiRecommendations = aiRecommendations;
    this.createdAt = new Date();
    this.status = 'generated';
  }

  addAIRecommendation(recommendation) {
    this.aiRecommendations.push(recommendation);
  }

  getPendingRecommendations() {
    return this.aiRecommendations.filter(rec => rec.isPending());
  }

  getApprovedRecommendations() {
    return this.aiRecommendations.filter(rec => rec.isApproved());
  }
}

module.exports = {
  UserRole,
  Organization,
  Team,
  MetricValue,
  TimeRange,
  ReportParameters,
  AIRecommendation,
  Report
};