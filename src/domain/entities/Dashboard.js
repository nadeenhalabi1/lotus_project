/**
 * Dashboard Entity
 * Represents a dashboard in the Management Reporting system
 */
class Dashboard {
  constructor({
    id,
    userId,
    dashboardType,
    metrics,
    lastUpdated,
    cacheKey
  }) {
    this.id = id;
    this.userId = userId;
    this.dashboardType = dashboardType;
    this.metrics = metrics || {};
    this.lastUpdated = lastUpdated || new Date();
    this.cacheKey = cacheKey;
  }

  /**
   * Update dashboard metrics
   * @param {Object} newMetrics - New metrics data
   */
  updateMetrics(newMetrics) {
    this.metrics = { ...this.metrics, ...newMetrics };
    this.lastUpdated = new Date();
  }

  /**
   * Check if dashboard data is stale
   * @param {number} maxAgeMinutes - Maximum age in minutes
   * @returns {boolean} True if data is stale
   */
  isStale(maxAgeMinutes = 60) {
    const now = new Date();
    const ageMinutes = (now - this.lastUpdated) / (1000 * 60);
    return ageMinutes > maxAgeMinutes;
  }

  /**
   * Get dashboard summary
   * @returns {Object} Dashboard summary
   */
  getSummary() {
    return {
      totalReports: this.metrics.totalReports || 0,
      activeUsers: this.metrics.activeUsers || 0,
      completionRate: this.metrics.completionRate || 0,
      lastUpdated: this.lastUpdated
    };
  }

  /**
   * Validate dashboard data
   * @returns {boolean} True if dashboard is valid
   */
  isValid() {
    return (
      this.id &&
      this.userId &&
      this.dashboardType &&
      this.metrics &&
      this.lastUpdated
    );
  }

  /**
   * Convert dashboard to DTO
   * @returns {Object} Dashboard DTO
   */
  toDTO() {
    return {
      id: this.id,
      userId: this.userId,
      dashboardType: this.dashboardType,
      metrics: this.metrics,
      lastUpdated: this.lastUpdated,
      cacheKey: this.cacheKey,
      summary: this.getSummary(),
      isStale: this.isStale()
    };
  }
}

module.exports = Dashboard;

