/**
 * AI Insight Entity
 * Represents an AI-generated insight in the Management Reporting system
 */
class AIInsight {
  constructor({
    id,
    reportId,
    insightType,
    confidenceScore,
    explanation,
    recommendation,
    status,
    createdAt
  }) {
    this.id = id;
    this.reportId = reportId;
    this.insightType = insightType;
    this.confidenceScore = confidenceScore;
    this.explanation = explanation;
    this.recommendation = recommendation;
    this.status = status || 'pending';
    this.createdAt = createdAt || new Date();
  }

  /**
   * Check if insight meets confidence threshold
   * @param {number} threshold - Confidence threshold (default 0.85)
   * @returns {boolean} True if meets threshold
   */
  meetsConfidenceThreshold(threshold = 0.85) {
    return this.confidenceScore >= threshold;
  }

  /**
   * Approve the insight
   */
  approve() {
    this.status = 'approved';
  }

  /**
   * Reject the insight
   */
  reject() {
    this.status = 'rejected';
  }

  /**
   * Check if insight is approved
   * @returns {boolean} True if approved
   */
  isApproved() {
    return this.status === 'approved';
  }

  /**
   * Check if insight is rejected
   * @returns {boolean} True if rejected
   */
  isRejected() {
    return this.status === 'rejected';
  }

  /**
   * Check if insight is pending
   * @returns {boolean} True if pending
   */
  isPending() {
    return this.status === 'pending';
  }

  /**
   * Validate insight data
   * @returns {boolean} True if insight is valid
   */
  isValid() {
    return (
      this.id &&
      this.reportId &&
      this.insightType &&
      this.confidenceScore >= 0 &&
      this.confidenceScore <= 1 &&
      this.explanation &&
      this.createdAt
    );
  }

  /**
   * Convert insight to DTO
   * @returns {Object} Insight DTO
   */
  toDTO() {
    return {
      id: this.id,
      reportId: this.reportId,
      insightType: this.insightType,
      confidenceScore: this.confidenceScore,
      explanation: this.explanation,
      recommendation: this.recommendation,
      status: this.status,
      createdAt: this.createdAt,
      isApproved: this.isApproved(),
      isRejected: this.isRejected(),
      isPending: this.isPending()
    };
  }
}

module.exports = AIInsight;

