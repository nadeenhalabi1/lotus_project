const Report = require('../../src/domain/entities/Report');

describe('Report Entity', () => {
  let report;

  beforeEach(() => {
    report = new Report({
      id: 'report-123',
      organizationId: 'org-456',
      reportType: 'course-analytics',
      periodStart: new Date('2024-01-01'),
      periodEnd: new Date('2024-01-31'),
      data: { metrics: { completionRate: 0.85 } },
      expiresAt: new Date('2024-02-15')
    });
  });

  describe('Constructor', () => {
    test('should create a valid report instance', () => {
      expect(report.id).toBe('report-123');
      expect(report.organizationId).toBe('org-456');
      expect(report.reportType).toBe('course-analytics');
      expect(report.isValid()).toBe(true);
    });

    test('should set default values', () => {
      const reportWithDefaults = new Report({
        id: 'report-123',
        organizationId: 'org-456',
        reportType: 'course-analytics',
        periodStart: new Date('2024-01-01'),
        periodEnd: new Date('2024-01-31'),
        data: { metrics: {} },
        expiresAt: new Date('2024-02-15')
      });

      expect(reportWithDefaults.createdAt).toBeInstanceOf(Date);
      expect(reportWithDefaults.aiInsights).toEqual([]);
    });
  });

  describe('isExpired', () => {
    test('should return false for non-expired report', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      report.expiresAt = futureDate;

      expect(report.isExpired()).toBe(false);
    });

    test('should return true for expired report', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 30);
      report.expiresAt = pastDate;

      expect(report.isExpired()).toBe(true);
    });
  });

  describe('addInsight', () => {
    test('should add insight to report', () => {
      const insight = {
        id: 'insight-123',
        type: 'anomaly',
        confidence: 0.9,
        explanation: 'Test insight'
      };

      report.addInsight(insight);

      expect(report.aiInsights).toHaveLength(1);
      expect(report.aiInsights[0]).toEqual(insight);
    });

    test('should initialize aiInsights array if undefined', () => {
      const reportWithoutInsights = new Report({
        id: 'report-123',
        organizationId: 'org-456',
        reportType: 'course-analytics',
        periodStart: new Date('2024-01-01'),
        periodEnd: new Date('2024-01-31'),
        data: { metrics: {} },
        expiresAt: new Date('2024-02-15')
      });

      const insight = { id: 'insight-123', type: 'anomaly' };
      reportWithoutInsights.addInsight(insight);

      expect(reportWithoutInsights.aiInsights).toHaveLength(1);
    });
  });

  describe('getApprovedInsights', () => {
    test('should return only approved insights', () => {
      const approvedInsight = { id: 'insight-1', status: 'approved' };
      const rejectedInsight = { id: 'insight-2', status: 'rejected' };
      const pendingInsight = { id: 'insight-3', status: 'pending' };

      report.addInsight(approvedInsight);
      report.addInsight(rejectedInsight);
      report.addInsight(pendingInsight);

      const approvedInsights = report.getApprovedInsights();

      expect(approvedInsights).toHaveLength(1);
      expect(approvedInsights[0].id).toBe('insight-1');
    });

    test('should return empty array when no approved insights', () => {
      const rejectedInsight = { id: 'insight-1', status: 'rejected' };
      report.addInsight(rejectedInsight);

      const approvedInsights = report.getApprovedInsights();

      expect(approvedInsights).toHaveLength(0);
    });
  });

  describe('isValid', () => {
    test('should return true for valid report', () => {
      expect(report.isValid()).toBe(true);
    });

    test('should return false for report missing required fields', () => {
      const invalidReport = new Report({
        id: 'report-123',
        // Missing organizationId
        reportType: 'course-analytics',
        periodStart: new Date('2024-01-01'),
        periodEnd: new Date('2024-01-31'),
        data: { metrics: {} },
        expiresAt: new Date('2024-02-15')
      });

      expect(invalidReport.isValid()).toBe(false);
    });
  });

  describe('toDTO', () => {
    test('should convert report to DTO', () => {
      const dto = report.toDTO();

      expect(dto).toHaveProperty('id', 'report-123');
      expect(dto).toHaveProperty('organizationId', 'org-456');
      expect(dto).toHaveProperty('reportType', 'course-analytics');
      expect(dto).toHaveProperty('isExpired');
      expect(dto).toHaveProperty('data');
      expect(dto).toHaveProperty('aiInsights');
    });
  });
});

