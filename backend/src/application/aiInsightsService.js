// Application Layer - AI Insights Service

const { AIRecommendation } = require('../domain/entities');

/**
 * AI Insights Service
 * Handles AI-powered analysis and recommendations
 */
class AIInsightsService {
  constructor(openaiClient, recommendationRepository) {
    this.openaiClient = openaiClient;
    this.recommendationRepository = recommendationRepository;
  }

  /**
   * Analyze metrics and generate AI recommendations
   */
  async analyzeMetrics(metrics, parameters) {
    const recommendations = [];

    // Analyze different types of patterns
    const engagementAnalysis = await this.analyzeEngagementPatterns(metrics);
    const skillAnalysis = await this.analyzeSkillDevelopment(metrics);
    const complianceAnalysis = await this.analyzeComplianceRisks(metrics);
    const performanceAnalysis = await this.analyzePerformanceTrends(metrics);

    // Combine all analyses
    const analyses = [
      ...engagementAnalysis,
      ...skillAnalysis,
      ...complianceAnalysis,
      ...performanceAnalysis
    ];

    // Generate recommendations for each analysis
    for (const analysis of analyses) {
      if (analysis.shouldRecommend) {
        const recommendation = await this.generateRecommendation(analysis, parameters);
        if (recommendation) {
          recommendations.push(recommendation);
        }
      }
    }

    return recommendations;
  }

  /**
   * Analyze engagement patterns
   */
  async analyzeEngagementPatterns(metrics) {
    const engagementMetrics = metrics.filter(m => m.metricType === 'engagement');
    const analyses = [];

    if (engagementMetrics.length === 0) return analyses;

    // Calculate average engagement
    const averageEngagement = engagementMetrics.reduce((sum, m) => sum + m.value, 0) / engagementMetrics.length;

    // Check for declining trends
    const sortedMetrics = engagementMetrics.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    if (sortedMetrics.length >= 3) {
      const recent = sortedMetrics.slice(-3);
      const older = sortedMetrics.slice(0, 3);
      
      const recentAvg = recent.reduce((sum, m) => sum + m.value, 0) / recent.length;
      const olderAvg = older.reduce((sum, m) => sum + m.value, 0) / older.length;
      
      const decline = ((olderAvg - recentAvg) / olderAvg) * 100;
      
      if (decline > 15) { // 15% decline threshold
        analyses.push({
          type: 'engagement_decline',
          severity: decline > 30 ? 'high' : 'medium',
          dataPoint: `Engagement declined by ${Math.round(decline)}%`,
          reason: `Recent engagement (${Math.round(recentAvg)}%) is significantly lower than historical average (${Math.round(olderAvg)}%)`,
          shouldRecommend: true,
          metadata: {
            recentAverage: recentAvg,
            historicalAverage: olderAvg,
            declinePercentage: decline
          }
        });
      }
    }

    // Check for low engagement
    if (averageEngagement < 60) {
      analyses.push({
        type: 'low_engagement',
        severity: averageEngagement < 40 ? 'high' : 'medium',
        dataPoint: `Overall engagement is ${Math.round(averageEngagement)}%`,
        reason: `Engagement levels are below the recommended threshold of 60%`,
        shouldRecommend: true,
        metadata: {
          averageEngagement: averageEngagement,
          threshold: 60
        }
      });
    }

    return analyses;
  }

  /**
   * Analyze skill development patterns
   */
  async analyzeSkillDevelopment(metrics) {
    const skillMetrics = metrics.filter(m => m.metricType === 'skill_progress');
    const analyses = [];

    if (skillMetrics.length === 0) return analyses;

    // Group by skill type
    const skillGroups = {};
    skillMetrics.forEach(metric => {
      const skillType = metric.metadata.skillType || 'unknown';
      if (!skillGroups[skillType]) {
        skillGroups[skillType] = [];
      }
      skillGroups[skillType].push(metric.value);
    });

    // Identify skill gaps
    Object.keys(skillGroups).forEach(skillType => {
      const values = skillGroups[skillType];
      const average = values.reduce((sum, val) => sum + val, 0) / values.length;
      
      if (average < 50) { // 50% threshold for skill gaps
        analyses.push({
          type: 'skill_gap',
          severity: average < 30 ? 'high' : 'medium',
          dataPoint: `${skillType} skill development is at ${Math.round(average)}%`,
          reason: `Skill development in ${skillType} is below the expected level of 50%`,
          shouldRecommend: true,
          metadata: {
            skillType: skillType,
            averageProgress: average,
            threshold: 50
          }
        });
      }
    });

    return analyses;
  }

  /**
   * Analyze compliance risks
   */
  async analyzeComplianceRisks(metrics) {
    const complianceMetrics = metrics.filter(m => m.metricType === 'compliance');
    const analyses = [];

    if (complianceMetrics.length === 0) return analyses;

    // Calculate compliance rate
    const total = complianceMetrics.length;
    const completed = complianceMetrics.filter(m => m.value >= 80).length;
    const complianceRate = (completed / total) * 100;

    if (complianceRate < 80) {
      analyses.push({
        type: 'compliance_risk',
        severity: complianceRate < 60 ? 'high' : 'medium',
        dataPoint: `Compliance rate is ${Math.round(complianceRate)}%`,
        reason: `Compliance rate is below the required threshold of 80%`,
        shouldRecommend: true,
        metadata: {
          complianceRate: complianceRate,
          totalRequired: total,
          completed: completed,
          threshold: 80
        }
      });
    }

    return analyses;
  }

  /**
   * Analyze performance trends
   */
  async analyzePerformanceTrends(metrics) {
    const performanceMetrics = metrics.filter(m => m.metricType === 'performance');
    const analyses = [];

    if (performanceMetrics.length === 0) return analyses;

    // Calculate average performance
    const averagePerformance = performanceMetrics.reduce((sum, m) => sum + m.value, 0) / performanceMetrics.length;

    // Check for performance anomalies
    const sortedMetrics = performanceMetrics.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const recent = sortedMetrics.slice(-5); // Last 5 metrics
    const recentAvg = recent.reduce((sum, m) => sum + m.value, 0) / recent.length;

    const deviation = Math.abs(recentAvg - averagePerformance) / averagePerformance;

    if (deviation > 0.2) { // 20% deviation threshold
      analyses.push({
        type: 'performance_anomaly',
        severity: deviation > 0.4 ? 'high' : 'medium',
        dataPoint: `Recent performance (${Math.round(recentAvg)}%) deviates significantly from average (${Math.round(averagePerformance)}%)`,
        reason: `Performance shows ${deviation > 0 ? 'improvement' : 'decline'} of ${Math.round(deviation * 100)}% from historical average`,
        shouldRecommend: true,
        metadata: {
          recentAverage: recentAvg,
          historicalAverage: averagePerformance,
          deviation: deviation
        }
      });
    }

    return analyses;
  }

  /**
   * Generate AI recommendation using OpenAI
   */
  async generateRecommendation(analysis, parameters) {
    try {
      const prompt = this.buildRecommendationPrompt(analysis, parameters);
      
      const response = await this.openaiClient.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an AI assistant that provides actionable recommendations for HR and management reporting. Provide clear, specific, and actionable advice.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      });

      const recommendationText = response.choices[0].message.content;

      return new AIRecommendation(
        this.generateRecommendationId(),
        analysis.dataPoint,
        analysis.reason,
        recommendationText,
        'pending'
      );

    } catch (error) {
      console.error('Failed to generate AI recommendation:', error);
      return null;
    }
  }

  /**
   * Build recommendation prompt for AI
   */
  buildRecommendationPrompt(analysis, parameters) {
    const context = {
      analysisType: analysis.type,
      severity: analysis.severity,
      dataPoint: analysis.dataPoint,
      reason: analysis.reason,
      organizationId: parameters.organizationId,
      timeRange: `${parameters.timeRange.startDate.toISOString()} to ${parameters.timeRange.endDate.toISOString()}`,
      metadata: analysis.metadata
    };

    return `Based on the following analysis, provide a specific, actionable recommendation:

Analysis Type: ${context.analysisType}
Severity: ${context.severity}
Data Point: ${context.dataPoint}
Reason: ${context.reason}
Organization: ${context.organizationId}
Time Period: ${context.timeRange}
Additional Context: ${JSON.stringify(context.metadata)}

Please provide:
1. A specific action to take
2. Why this action is recommended
3. Expected outcome
4. Timeline for implementation

Keep the recommendation concise, actionable, and focused on improving the identified issue.`;
  }

  /**
   * Generate recommendation ID
   */
  generateRecommendationId() {
    return `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Approve a recommendation
   */
  async approveRecommendation(recommendationId, userId) {
    const recommendation = await this.recommendationRepository.findById(recommendationId);
    
    if (!recommendation) {
      throw new Error('Recommendation not found');
    }

    recommendation.approve(userId);
    await this.recommendationRepository.save(recommendation);

    return recommendation;
  }

  /**
   * Reject a recommendation
   */
  async rejectRecommendation(recommendationId) {
    const recommendation = await this.recommendationRepository.findById(recommendationId);
    
    if (!recommendation) {
      throw new Error('Recommendation not found');
    }

    recommendation.reject();
    await this.recommendationRepository.save(recommendation);

    return recommendation;
  }

  /**
   * Get recommendation statistics
   */
  async getRecommendationStats() {
    const allRecommendations = await this.recommendationRepository.findAll();
    
    const stats = {
      total: allRecommendations.length,
      pending: allRecommendations.filter(r => r.isPending()).length,
      approved: allRecommendations.filter(r => r.isApproved()).length,
      rejected: allRecommendations.filter(r => r.isRejected()).length,
      approvalRate: 0
    };

    if (stats.total > 0) {
      stats.approvalRate = Math.round((stats.approved / stats.total) * 100);
    }

    return stats;
  }
}

module.exports = {
  AIInsightsService
};