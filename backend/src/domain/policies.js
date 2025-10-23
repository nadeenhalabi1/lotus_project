// Domain Core Layer - Business Policies and Rules

const { UserRole, MetricValue, TimeRange } = require('./entities');

/**
 * Data Normalization Policy
 * Handles standardization of data from different microservices
 */
class DataNormalizationPolicy {
  /**
   * Normalize date formats across different sources
   */
  static normalizeDate(dateInput) {
    if (!dateInput) return null;
    
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date format: ${dateInput}`);
    }
    
    // Return ISO string for consistency
    return date.toISOString();
  }

  /**
   * Normalize skill taxonomy across different sources
   */
  static normalizeSkillTaxonomy(skillData) {
    const skillMapping = {
      'programming': 'Programming',
      'coding': 'Programming',
      'dev': 'Programming',
      'soft-skills': 'Soft Skills',
      'communication': 'Soft Skills',
      'leadership': 'Leadership',
      'management': 'Leadership'
    };

    const normalizedSkill = skillMapping[skillData.toLowerCase()] || skillData;
    return {
      id: skillData.toLowerCase().replace(/\s+/g, '-'),
      name: normalizedSkill,
      category: this.getSkillCategory(normalizedSkill)
    };
  }

  /**
   * Get skill category based on skill name
   */
  static getSkillCategory(skillName) {
    if (skillName.includes('Programming') || skillName.includes('Coding')) {
      return 'Technical';
    } else if (skillName.includes('Soft Skills') || skillName.includes('Communication')) {
      return 'Interpersonal';
    } else if (skillName.includes('Leadership') || skillName.includes('Management')) {
      return 'Management';
    }
    return 'General';
  }

  /**
   * Normalize scoring scales to 0-100 range
   */
  static normalizeScore(score, maxScore, minScore = 0) {
    if (typeof score !== 'number' || typeof maxScore !== 'number') {
      throw new Error('Score and maxScore must be numbers');
    }

    if (score < minScore || score > maxScore) {
      throw new Error(`Score ${score} is outside valid range [${minScore}, ${maxScore}]`);
    }

    // Normalize to 0-100 scale
    return Math.round(((score - minScore) / (maxScore - minScore)) * 100);
  }
}

/**
 * Data Filtering Policy
 * Handles PII removal and data quality filtering
 */
class DataFilteringPolicy {
  /**
   * Check if data contains PII and should be filtered
   */
  static containsPII(data) {
    const piiPatterns = [
      /@[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/, // Email
      /\b\d{3}-\d{2}-\d{4}\b/, // SSN
      /\b\d{3}\s\d{2}\s\d{4}\b/, // SSN with spaces
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/ // Email pattern
    ];

    const dataString = JSON.stringify(data).toLowerCase();
    return piiPatterns.some(pattern => pattern.test(dataString));
  }

  /**
   * Filter out PII from data object
   */
  static filterPII(data) {
    if (this.containsPII(data)) {
      throw new Error('Data contains PII and cannot be processed');
    }
    return data;
  }

  /**
   * Check if record is complete
   */
  static isCompleteRecord(record) {
    const requiredFields = ['id', 'organizationId', 'timestamp'];
    return requiredFields.every(field => record[field] !== undefined && record[field] !== null);
  }

  /**
   * Check if user is active
   */
  static isActiveUser(user) {
    return user.status === 'active' && user.lastLoginAt && 
           new Date(user.lastLoginAt) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // 90 days
  }
}

/**
 * Authorization Policy
 * Handles role-based access control
 */
class AuthorizationPolicy {
  /**
   * Check if user can access cross-organizational data
   */
  static canAccessCrossOrganizationalData(userRole) {
    return userRole.isAdministrator();
  }

  /**
   * Check if user can access organization data
   */
  static canAccessOrganizationData(userRole, userId, organizationId) {
    if (userRole.isAdministrator()) {
      return true; // Administrators can access all organizations
    }
    
    if (userRole.isHREmployee()) {
      // HR employees can only access their assigned organization
      return this.isUserAssignedToOrganization(userId, organizationId);
    }
    
    return false;
  }

  /**
   * Check if user is assigned to organization
   */
  static isUserAssignedToOrganization(userId, organizationId) {
    // This would typically check against user assignments in the database
    // For now, we'll implement a simple check
    return organizationId && userId;
  }

  /**
   * Check if user can approve AI recommendations
   */
  static canApproveRecommendations(userRole) {
    return userRole.isAdministrator() || userRole.isHREmployee();
  }
}

/**
 * Aggregation Policy
 * Handles data aggregation at different levels
 */
class AggregationPolicy {
  /**
   * Aggregate metrics by organization
   */
  static aggregateByOrganization(metrics) {
    const aggregated = {};
    
    metrics.forEach(metric => {
      const orgId = metric.organizationId;
      if (!aggregated[orgId]) {
        aggregated[orgId] = {
          organizationId: orgId,
          metrics: {},
          count: 0
        };
      }
      
      const metricType = metric.metricType;
      if (!aggregated[orgId].metrics[metricType]) {
        aggregated[orgId].metrics[metricType] = {
          sum: 0,
          count: 0,
          average: 0
        };
      }
      
      aggregated[orgId].metrics[metricType].sum += metric.value;
      aggregated[orgId].metrics[metricType].count += 1;
      aggregated[orgId].count += 1;
    });

    // Calculate averages
    Object.keys(aggregated).forEach(orgId => {
      Object.keys(aggregated[orgId].metrics).forEach(metricType => {
        const metric = aggregated[orgId].metrics[metricType];
        metric.average = metric.sum / metric.count;
      });
    });

    return aggregated;
  }

  /**
   * Aggregate metrics by team
   */
  static aggregateByTeam(metrics) {
    const aggregated = {};
    
    metrics.forEach(metric => {
      const teamId = metric.teamId;
      if (!aggregated[teamId]) {
        aggregated[teamId] = {
          teamId: teamId,
          organizationId: metric.organizationId,
          metrics: {},
          count: 0
        };
      }
      
      const metricType = metric.metricType;
      if (!aggregated[teamId].metrics[metricType]) {
        aggregated[teamId].metrics[metricType] = {
          sum: 0,
          count: 0,
          average: 0
        };
      }
      
      aggregated[teamId].metrics[metricType].sum += metric.value;
      aggregated[teamId].metrics[metricType].count += 1;
      aggregated[teamId].count += 1;
    });

    // Calculate averages
    Object.keys(aggregated).forEach(teamId => {
      Object.keys(aggregated[teamId].metrics).forEach(metricType => {
        const metric = aggregated[teamId].metrics[metricType];
        metric.average = metric.sum / metric.count;
      });
    });

    return aggregated;
  }
}

/**
 * Data Retention Policy
 * Handles data lifecycle management
 */
class DataRetentionPolicy {
  /**
   * Check if data should be moved to long-term storage
   */
  static shouldMoveToLongTermStorage(createdAt, cacheRetentionDays = 30) {
    const retentionDate = new Date(createdAt);
    retentionDate.setDate(retentionDate.getDate() + cacheRetentionDays);
    return new Date() > retentionDate;
  }

  /**
   * Check if data should be deleted
   */
  static shouldDeleteData(createdAt, retentionYears = 5) {
    const retentionDate = new Date(createdAt);
    retentionDate.setFullYear(retentionDate.getFullYear() + retentionYears);
    return new Date() > retentionDate;
  }

  /**
   * Get data retention status
   */
  static getRetentionStatus(createdAt) {
    if (this.shouldDeleteData(createdAt)) {
      return 'expired';
    } else if (this.shouldMoveToLongTermStorage(createdAt)) {
      return 'long-term';
    } else {
      return 'cache';
    }
  }
}

module.exports = {
  DataNormalizationPolicy,
  DataFilteringPolicy,
  AuthorizationPolicy,
  AggregationPolicy,
  DataRetentionPolicy
};