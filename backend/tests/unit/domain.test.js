// Unit Tests - Domain Entities and Policies

const { UserRole, Organization, Team, MetricValue, TimeRange, ReportParameters, AIRecommendation, Report } = require('../src/domain/entities');
const { DataNormalizationPolicy, DataFilteringPolicy, AuthorizationPolicy, AggregationPolicy, DataRetentionPolicy } = require('../src/domain/policies');

describe('Domain Entities', () => {
  describe('UserRole', () => {
    test('should create valid administrator role', () => {
      const role = new UserRole(UserRole.ADMINISTRATOR);
      expect(role.isAdministrator()).toBe(true);
      expect(role.isHREmployee()).toBe(false);
      expect(role.toString()).toBe('administrator');
    });

    test('should create valid HR employee role', () => {
      const role = new UserRole(UserRole.HR_EMPLOYEE);
      expect(role.isAdministrator()).toBe(false);
      expect(role.isHREmployee()).toBe(true);
      expect(role.toString()).toBe('hr_employee');
    });

    test('should throw error for invalid role', () => {
      expect(() => new UserRole('invalid_role')).toThrow('Invalid user role: invalid_role');
    });
  });

  describe('Organization', () => {
    test('should create active organization', () => {
      const org = new Organization('org-1', 'Test Organization');
      expect(org.id).toBe('org-1');
      expect(org.name).toBe('Test Organization');
      expect(org.status).toBe('active');
      expect(org.isActive()).toBe(true);
    });

    test('should deactivate organization', () => {
      const org = new Organization('org-1', 'Test Organization');
      org.deactivate();
      expect(org.status).toBe('inactive');
      expect(org.isActive()).toBe(false);
    });
  });

  describe('MetricValue', () => {
    test('should create valid metric value', () => {
      const metric = new MetricValue(85, 'engagement', new Date(), { source: 'test' });
      expect(metric.isValid()).toBe(true);
      expect(metric.value).toBe(85);
      expect(metric.metricType).toBe('engagement');
    });

    test('should reject invalid metric value', () => {
      const metric = new MetricValue(-10, 'engagement', new Date());
      expect(metric.isValid()).toBe(false);
    });
  });

  describe('TimeRange', () => {
    test('should create valid time range', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      const timeRange = new TimeRange(startDate, endDate);
      
      expect(timeRange.getDays()).toBe(30);
      expect(timeRange.contains(new Date('2024-01-15'))).toBe(true);
      expect(timeRange.contains(new Date('2024-02-01'))).toBe(false);
    });

    test('should throw error for invalid time range', () => {
      const startDate = new Date('2024-01-31');
      const endDate = new Date('2024-01-01');
      
      expect(() => new TimeRange(startDate, endDate)).toThrow('Start date must be before end date');
    });
  });

  describe('AIRecommendation', () => {
    test('should create pending recommendation', () => {
      const recommendation = new AIRecommendation(
        'rec-1',
        'Low engagement detected',
        'Engagement dropped below 60%',
        'Increase communication frequency'
      );
      
      expect(recommendation.isPending()).toBe(true);
      expect(recommendation.isApproved()).toBe(false);
      expect(recommendation.isRejected()).toBe(false);
    });

    test('should approve recommendation', () => {
      const recommendation = new AIRecommendation(
        'rec-1',
        'Low engagement detected',
        'Engagement dropped below 60%',
        'Increase communication frequency'
      );
      
      recommendation.approve('user-1');
      
      expect(recommendation.isApproved()).toBe(true);
      expect(recommendation.approvedBy).toBe('user-1');
      expect(recommendation.approvedAt).toBeInstanceOf(Date);
    });

    test('should reject recommendation', () => {
      const recommendation = new AIRecommendation(
        'rec-1',
        'Low engagement detected',
        'Engagement dropped below 60%',
        'Increase communication frequency'
      );
      
      recommendation.reject();
      
      expect(recommendation.isRejected()).toBe(true);
      expect(recommendation.isApproved()).toBe(false);
    });
  });
});

describe('Domain Policies', () => {
  describe('DataNormalizationPolicy', () => {
    test('should normalize date formats', () => {
      const normalizedDate = DataNormalizationPolicy.normalizeDate('2024-01-15T10:30:00Z');
      expect(normalizedDate).toBe('2024-01-15T10:30:00.000Z');
    });

    test('should normalize skill taxonomy', () => {
      const normalizedSkill = DataNormalizationPolicy.normalizeSkillTaxonomy('programming');
      expect(normalizedSkill.name).toBe('Programming');
      expect(normalizedSkill.category).toBe('Technical');
    });

    test('should normalize scores to 0-100 range', () => {
      const normalizedScore = DataNormalizationPolicy.normalizeScore(75, 100, 0);
      expect(normalizedScore).toBe(75);
      
      const normalizedScore2 = DataNormalizationPolicy.normalizeScore(15, 20, 0);
      expect(normalizedScore2).toBe(75);
    });

    test('should throw error for invalid score range', () => {
      expect(() => DataNormalizationPolicy.normalizeScore(150, 100, 0)).toThrow('Score 150 is outside valid range [0, 100]');
    });
  });

  describe('DataFilteringPolicy', () => {
    test('should detect PII in data', () => {
      const dataWithPII = { name: 'John Doe', email: 'john@example.com' };
      expect(DataFilteringPolicy.containsPII(dataWithPII)).toBe(true);
      
      const dataWithoutPII = { name: 'Organization A', score: 85 };
      expect(DataFilteringPolicy.containsPII(dataWithoutPII)).toBe(false);
    });

    test('should check if record is complete', () => {
      const completeRecord = { id: '1', organizationId: 'org-1', timestamp: new Date() };
      expect(DataFilteringPolicy.isCompleteRecord(completeRecord)).toBe(true);
      
      const incompleteRecord = { id: '1', organizationId: 'org-1' };
      expect(DataFilteringPolicy.isCompleteRecord(incompleteRecord)).toBe(false);
    });

    test('should check if user is active', () => {
      const activeUser = {
        status: 'active',
        lastLoginAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
      };
      expect(DataFilteringPolicy.isActiveUser(activeUser)).toBe(true);
      
      const inactiveUser = {
        status: 'inactive',
        lastLoginAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      };
      expect(DataFilteringPolicy.isActiveUser(inactiveUser)).toBe(false);
    });
  });

  describe('AuthorizationPolicy', () => {
    test('should allow administrators to access cross-organizational data', () => {
      const adminRole = new UserRole(UserRole.ADMINISTRATOR);
      expect(AuthorizationPolicy.canAccessCrossOrganizationalData(adminRole)).toBe(true);
    });

    test('should deny HR employees access to cross-organizational data', () => {
      const hrRole = new UserRole(UserRole.HR_EMPLOYEE);
      expect(AuthorizationPolicy.canAccessCrossOrganizationalData(hrRole)).toBe(false);
    });

    test('should allow administrators to access any organization', () => {
      const adminRole = new UserRole(UserRole.ADMINISTRATOR);
      expect(AuthorizationPolicy.canAccessOrganizationData(adminRole, 'user-1', 'org-1')).toBe(true);
    });

    test('should allow HR employees to approve recommendations', () => {
      const hrRole = new UserRole(UserRole.HR_EMPLOYEE);
      expect(AuthorizationPolicy.canApproveRecommendations(hrRole)).toBe(true);
    });
  });

  describe('AggregationPolicy', () => {
    test('should aggregate metrics by organization', () => {
      const metrics = [
        { organizationId: 'org-1', metricType: 'engagement', value: 80 },
        { organizationId: 'org-1', metricType: 'engagement', value: 90 },
        { organizationId: 'org-2', metricType: 'engagement', value: 70 }
      ];

      const aggregated = AggregationPolicy.aggregateByOrganization(metrics);
      
      expect(aggregated['org-1'].metrics.engagement.average).toBe(85);
      expect(aggregated['org-2'].metrics.engagement.average).toBe(70);
    });

    test('should aggregate metrics by team', () => {
      const metrics = [
        { teamId: 'team-1', organizationId: 'org-1', metricType: 'skill_progress', value: 60 },
        { teamId: 'team-1', organizationId: 'org-1', metricType: 'skill_progress', value: 80 },
        { teamId: 'team-2', organizationId: 'org-1', metricType: 'skill_progress', value: 70 }
      ];

      const aggregated = AggregationPolicy.aggregateByTeam(metrics);
      
      expect(aggregated['team-1'].metrics.skill_progress.average).toBe(70);
      expect(aggregated['team-2'].metrics.skill_progress.average).toBe(70);
    });
  });

  describe('DataRetentionPolicy', () => {
    test('should determine retention status', () => {
      const recentDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000); // 10 days ago
      const oldDate = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000); // 60 days ago
      const expiredDate = new Date(Date.now() - 6 * 365 * 24 * 60 * 60 * 1000); // 6 years ago

      expect(DataRetentionPolicy.getRetentionStatus(recentDate)).toBe('cache');
      expect(DataRetentionPolicy.getRetentionStatus(oldDate)).toBe('long-term');
      expect(DataRetentionPolicy.getRetentionStatus(expiredDate)).toBe('expired');
    });

    test('should check if data should be moved to long-term storage', () => {
      const recentDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000); // 10 days ago
      const oldDate = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000); // 60 days ago

      expect(DataRetentionPolicy.shouldMoveToLongTermStorage(recentDate)).toBe(false);
      expect(DataRetentionPolicy.shouldMoveToLongTermStorage(oldDate)).toBe(true);
    });

    test('should check if data should be deleted', () => {
      const recentDate = new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000); // 2 years ago
      const expiredDate = new Date(Date.now() - 6 * 365 * 24 * 60 * 60 * 1000); // 6 years ago

      expect(DataRetentionPolicy.shouldDeleteData(recentDate)).toBe(false);
      expect(DataRetentionPolicy.shouldDeleteData(expiredDate)).toBe(true);
    });
  });
});