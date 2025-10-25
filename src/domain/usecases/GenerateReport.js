const Report = require('../entities/Report');

/**
 * Generate Report Use Case
 * Handles the generation of new reports
 */
class GenerateReport {
  constructor(reportRepository, dataTransformationService) {
    this.reportRepository = reportRepository;
    this.dataTransformationService = dataTransformationService;
  }

  /**
   * Execute report generation
   * @param {Object} params - Report generation parameters
   * @param {string} params.organizationId - Organization ID
   * @param {string} params.reportType - Type of report to generate
   * @param {Date} params.periodStart - Start date of the period
   * @param {Date} params.periodEnd - End date of the period
   * @param {Object} params.rawData - Raw data from microservices
   * @returns {Promise<Report>} Generated report
   */
  async execute({ organizationId, reportType, periodStart, periodEnd, rawData }) {
    // Validate input parameters
    this.validateInput({ organizationId, reportType, periodStart, periodEnd, rawData });

    // Transform raw data
    const transformedData = await this.dataTransformationService.transform(rawData);

    // Create report entity
    const report = new Report({
      id: this.generateReportId(),
      organizationId,
      reportType,
      periodStart,
      periodEnd,
      data: transformedData,
      expiresAt: this.calculateExpirationDate()
    });

    // Save report to repository
    await this.reportRepository.save(report);

    return report;
  }

  /**
   * Validate input parameters
   * @param {Object} params - Input parameters
   */
  validateInput({ organizationId, reportType, periodStart, periodEnd, rawData }) {
    if (!organizationId) {
      throw new Error('Organization ID is required');
    }
    if (!reportType) {
      throw new Error('Report type is required');
    }
    if (!periodStart || !(periodStart instanceof Date)) {
      throw new Error('Valid period start date is required');
    }
    if (!periodEnd || !(periodEnd instanceof Date)) {
      throw new Error('Valid period end date is required');
    }
    if (!rawData || typeof rawData !== 'object') {
      throw new Error('Raw data is required');
    }
    if (periodStart >= periodEnd) {
      throw new Error('Period start must be before period end');
    }
  }

  /**
   * Generate unique report ID
   * @returns {string} Unique report ID
   */
  generateReportId() {
    return `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Calculate report expiration date (30 days from now)
   * @returns {Date} Expiration date
   */
  calculateExpirationDate() {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30);
    return expirationDate;
  }
}

module.exports = GenerateReport;

