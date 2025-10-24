const GenerateReport = require('../../src/domain/usecases/GenerateReport');
const Report = require('../../src/domain/entities/Report');

describe('GenerateReport Use Case', () => {
  let generateReport;
  let mockReportRepository;
  let mockDataTransformationService;

  beforeEach(() => {
    mockReportRepository = {
      save: jest.fn()
    };

    mockDataTransformationService = {
      transform: jest.fn()
    };

    generateReport = new GenerateReport(mockReportRepository, mockDataTransformationService);
  });

  describe('execute', () => {
    const validParams = {
      organizationId: 'org-123',
      reportType: 'course-analytics',
      periodStart: new Date('2024-01-01'),
      periodEnd: new Date('2024-01-31'),
      rawData: { metrics: { completionRate: 0.85 } }
    };

    test('should generate report successfully', async () => {
      const transformedData = { chart: {}, table: {} };
      mockDataTransformationService.transform.mockResolvedValue(transformedData);
      mockReportRepository.save.mockResolvedValue();

      const result = await generateReport.execute(validParams);

      expect(result).toBeInstanceOf(Report);
      expect(result.organizationId).toBe('org-123');
      expect(result.reportType).toBe('course-analytics');
      expect(mockDataTransformationService.transform).toHaveBeenCalledWith(validParams.rawData);
      expect(mockReportRepository.save).toHaveBeenCalledWith(result);
    });

    test('should throw error when organizationId is missing', async () => {
      const invalidParams = { ...validParams, organizationId: null };

      await expect(generateReport.execute(invalidParams)).rejects.toThrow('Organization ID is required');
    });

    test('should throw error when reportType is missing', async () => {
      const invalidParams = { ...validParams, reportType: null };

      await expect(generateReport.execute(invalidParams)).rejects.toThrow('Report type is required');
    });

    test('should throw error when periodStart is invalid', async () => {
      const invalidParams = { ...validParams, periodStart: 'invalid-date' };

      await expect(generateReport.execute(invalidParams)).rejects.toThrow('Valid period start date is required');
    });

    test('should throw error when periodEnd is invalid', async () => {
      const invalidParams = { ...validParams, periodEnd: 'invalid-date' };

      await expect(generateReport.execute(invalidParams)).rejects.toThrow('Valid period end date is required');
    });

    test('should throw error when rawData is missing', async () => {
      const invalidParams = { ...validParams, rawData: null };

      await expect(generateReport.execute(invalidParams)).rejects.toThrow('Raw data is required');
    });

    test('should throw error when periodStart is after periodEnd', async () => {
      const invalidParams = {
        ...validParams,
        periodStart: new Date('2024-01-31'),
        periodEnd: new Date('2024-01-01')
      };

      await expect(generateReport.execute(invalidParams)).rejects.toThrow('Period start must be before period end');
    });

    test('should generate unique report ID', async () => {
      const transformedData = { chart: {}, table: {} };
      mockDataTransformationService.transform.mockResolvedValue(transformedData);
      mockReportRepository.save.mockResolvedValue();

      const result1 = await generateReport.execute(validParams);
      const result2 = await generateReport.execute(validParams);

      expect(result1.id).not.toBe(result2.id);
      expect(result1.id).toMatch(/^report-\d+-[a-z0-9]+$/);
    });

    test('should set expiration date to 30 days from now', async () => {
      const transformedData = { chart: {}, table: {} };
      mockDataTransformationService.transform.mockResolvedValue(transformedData);
      mockReportRepository.save.mockResolvedValue();

      const beforeExecution = new Date();
      const result = await generateReport.execute(validParams);
      const afterExecution = new Date();

      const expectedMinExpiration = new Date(beforeExecution.getTime() + 29 * 24 * 60 * 60 * 1000);
      const expectedMaxExpiration = new Date(afterExecution.getTime() + 30 * 24 * 60 * 60 * 1000);

      expect(result.expiresAt.getTime()).toBeGreaterThanOrEqual(expectedMinExpiration.getTime());
      expect(result.expiresAt.getTime()).toBeLessThanOrEqual(expectedMaxExpiration.getTime());
    });
  });

  describe('validateInput', () => {
    test('should not throw error for valid input', () => {
      const validParams = {
        organizationId: 'org-123',
        reportType: 'course-analytics',
        periodStart: new Date('2024-01-01'),
        periodEnd: new Date('2024-01-31'),
        rawData: { metrics: {} }
      };

      expect(() => generateReport.validateInput(validParams)).not.toThrow();
    });
  });

  describe('generateReportId', () => {
    test('should generate unique IDs', () => {
      const id1 = generateReport.generateReportId();
      const id2 = generateReport.generateReportId();

      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^report-\d+-[a-z0-9]+$/);
    });
  });

  describe('calculateExpirationDate', () => {
    test('should return date 30 days from now', () => {
      const beforeCall = new Date();
      const expirationDate = generateReport.calculateExpirationDate();
      const afterCall = new Date();

      const expectedMin = new Date(beforeCall.getTime() + 29 * 24 * 60 * 60 * 1000);
      const expectedMax = new Date(afterCall.getTime() + 30 * 24 * 60 * 60 * 1000);

      expect(expirationDate.getTime()).toBeGreaterThanOrEqual(expectedMin.getTime());
      expect(expirationDate.getTime()).toBeLessThanOrEqual(expectedMax.getTime());
    });
  });
});

