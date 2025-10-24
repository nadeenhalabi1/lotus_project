/**
 * Report Entity
 * Represents a report in the Management Reporting system
 */
class Report {
  constructor({
    id,
    organizationId,
    reportType,
    periodStart,
    periodEnd,
    data,
    aiInsights,
    createdAt,
    expiresAt
  }) {
    this.id = id;
    this.organizationId = organizationId;
    this.reportType = reportType;
    this.periodStart = periodStart;
    this.periodEnd = periodEnd;
    this.data = data;
    this.aiInsights = aiInsights || [];
    this.createdAt = createdAt || new Date();
    this.expiresAt = expiresAt;
  }

  /**
   * Check if the report is expired
   * @returns {boolean} True if report is expired
   */
  isExpired() {
    return new Date() > this.expiresAt;
  }

  /**
   * Add AI insight to the report
   * @param {Object} insight - AI insight object
   */
  addInsight(insight) {
    if (!this.aiInsights) {
      this.aiInsights = [];
    }
    this.aiInsights.push(insight);
  }

  /**
   * Get approved insights only
   * @returns {Array} Array of approved insights
   */
  getApprovedInsights() {
    return this.aiInsights.filter(insight => insight.status === 'approved');
  }

  /**
   * Validate report data
   * @returns {boolean} True if report is valid
   */
  isValid() {
    return (
      this.id &&
      this.organizationId &&
      this.reportType &&
      this.periodStart &&
      this.periodEnd &&
      this.data &&
      this.expiresAt
    );
  }

  /**
   * Convert report to DTO
   * @returns {Object} Report DTO
   */
  toDTO() {
    return {
      id: this.id,
      organizationId: this.organizationId,
      reportType: this.reportType,
      periodStart: this.periodStart,
      periodEnd: this.periodEnd,
      data: this.data,
      aiInsights: this.aiInsights,
      createdAt: this.createdAt,
      expiresAt: this.expiresAt,
      isExpired: this.isExpired()
    };
  }
}

module.exports = Report;

