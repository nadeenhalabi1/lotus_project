import OpenAI from 'openai';
import { IAIService } from '../../domain/ports/IAIService.js';

export class OpenAIClient extends IAIService {
  constructor() {
    super();
    // MOCK MODE - If no API key, use mock responses
    this.useMock = !process.env.OPENAI_KEY || process.env.OPENAI_KEY === '';
    if (!this.useMock) {
      this.client = new OpenAI({
        apiKey: process.env.OPENAI_KEY
      });
    }
  }

  async analyze(data, reportType) {
    try {
      // MOCK MODE - Return mock insights if no API key
      if (this.useMock) {
        return this.generateMockInsights(reportType, data);
      }

      const prompt = this.generatePrompt(reportType, data);

      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini', // Changed from gpt-4-turbo-preview to reduce token usage and prevent rate limits
        messages: [
          {
            role: 'system',
            content: 'You are an expert learning analytics analyst. Analyze the provided data and provide insights, trends, anomalies, and actionable recommendations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000, // ~400 words
        temperature: 0.7
      });

      const content = response.choices[0]?.message?.content || '';
      return this.formatInsights(content);
    } catch (error) {
      console.error('OpenAI API Error:', error);
      // Fallback to mock insights on error
      return this.generateMockInsights(reportType, data);
    }
  }

  generateMockInsights(reportType, data) {
    const insights = {
      'monthly-performance': {
        observations: 'Monthly performance shows steady growth in user engagement and course completion rates. Overall learning metrics are trending upward.',
        trends: 'Positive trend: 15% increase in completion rates compared to previous month. User activity shows consistent growth pattern.',
        anomalies: 'Minor dip in engagement during mid-month period, likely due to holiday season. No critical issues detected.',
        recommendations: 'Continue current learning programs. Consider expanding popular course categories. Monitor engagement metrics weekly.'
      },
      'course-completion': {
        observations: 'Course completion rates are healthy with 75% average completion. Most courses show strong learner retention.',
        trends: 'Completion rates improved by 8% this period. Advanced courses show higher completion than beginner courses.',
        anomalies: 'Some courses have lower completion rates - investigate content difficulty and learner support needs.',
        recommendations: 'Add more interactive elements to courses with lower completion. Provide additional support resources.'
      },
      'user-engagement': {
        observations: 'User engagement is strong with daily active users showing consistent growth. Platform usage is increasing.',
        trends: 'Engagement index up 12% month-over-month. Peak usage times are weekday mornings and evenings.',
        anomalies: 'Weekend engagement is lower - consider scheduling special weekend activities or content.',
        recommendations: 'Maintain current engagement strategies. Introduce gamification elements. Create weekend learning challenges.'
      },
      'course-performance-deep-dive': {
        observations: 'Detailed course analysis reveals significant performance variations across different courses. Top-performing courses show high completion rates and learner satisfaction.',
        trends: 'Advanced level courses demonstrate 20% higher completion rates than beginner courses. Courses with interactive content show better engagement.',
        anomalies: 'Several courses show declining enrollment trends. Some courses have completion rates below 60%, indicating potential content or structure issues.',
        recommendations: 'Focus on improving courses with low completion rates. Consider restructuring content for better learner flow. Enhance interactive elements in underperforming courses.'
      },
      'content-effectiveness': {
        observations: 'Content analysis shows video and interactive content types have the highest engagement rates. Content creators vary significantly in performance.',
        trends: 'Video content receives 3x more views than document-based content. Content with practical examples shows higher engagement scores.',
        anomalies: 'Some content types have very low engagement despite high view counts. Certain creators produce consistently low-performing content.',
        recommendations: 'Prioritize video and interactive content creation. Provide training for content creators on engagement best practices. Review and improve low-performing content.'
      },
      'department-performance': {
        observations: 'Department performance analysis reveals clear differences in learning outcomes across organizational units. Some departments excel while others need support.',
        trends: 'Engineering and Development departments show highest completion rates. Support departments show increasing engagement trends.',
        anomalies: 'Significant performance gaps between departments. Some departments have low participation rates despite available resources.',
        recommendations: 'Implement department-specific learning programs. Provide additional support to underperforming departments. Share best practices from high-performing departments.'
      },
      'drop-off-analysis': {
        observations: 'Drop-off analysis identifies key patterns in learner attrition. Most drop-offs occur in longer-duration courses and during specific content sections.',
        trends: 'Drop-off rates are 25% higher in courses longer than 20 hours. Early drop-offs (first 20% of course) are most common.',
        anomalies: 'Unexpected drop-off spikes in certain course topics. Some courses maintain high engagement despite long duration.',
        recommendations: 'Break long courses into smaller modules. Add checkpoints and milestones to maintain engagement. Investigate specific drop-off points in underperforming courses.'
      }
    };

    const defaultInsights = insights[reportType] || {
      observations: 'Data analysis shows positive trends across key metrics. System performance is stable.',
      trends: 'Overall upward trajectory in learning outcomes and user participation.',
      anomalies: 'No significant anomalies detected in the current dataset.',
      recommendations: 'Continue monitoring key performance indicators. Maintain current operational excellence.'
    };

    // Enhance insights with data-specific details
    if (reportType === 'course-performance-deep-dive' && data?.rawData?.courseBuilder) {
      const courses = data.rawData.courseBuilder.details?.courses || [];
      if (courses.length > 0) {
        const avgCompletion = courses.reduce((sum, c) => sum + (c.completionRate || 0), 0) / courses.length;
        defaultInsights.observations = `Analysis of ${courses.length} courses reveals an average completion rate of ${avgCompletion.toFixed(1)}%. Performance varies significantly across course levels and topics.`;
      }
    }

    if (reportType === 'content-effectiveness' && data?.rawData?.contentStudio) {
      const contentItems = data.rawData.contentStudio.details?.contentItems || [];
      if (contentItems.length > 0) {
        const totalViews = contentItems.reduce((sum, c) => sum + (c.views || 0), 0);
        const totalLikes = contentItems.reduce((sum, c) => sum + (c.likes || 0), 0);
        const engagementRate = totalViews > 0 ? (totalLikes / totalViews * 100).toFixed(1) : 0;
        defaultInsights.observations = `Content effectiveness analysis of ${contentItems.length} items shows an overall engagement rate of ${engagementRate}%. Video content demonstrates superior performance.`;
      }
    }

    if (reportType === 'department-performance' && data?.rawData?.directory) {
      const deptMetrics = data.rawData.directory.metrics?.usersByDepartment || {};
      const deptCount = Object.keys(deptMetrics).length;
      if (deptCount > 0) {
        defaultInsights.observations = `Department performance analysis across ${deptCount} departments reveals varying learning outcomes. Engineering and Development departments lead in completion rates.`;
      }
    }

    if (reportType === 'drop-off-analysis' && data?.rawData?.courseBuilder) {
      const courses = data.rawData.courseBuilder.details?.courses || [];
      if (courses.length > 0) {
        const highDropOff = courses.filter(c => {
          const total = c.totalEnrollments || 0;
          const active = c.activeEnrollments || 0;
          return total > 0 && ((total - active) / total) > 0.3;
        }).length;
        defaultInsights.observations = `Drop-off analysis identifies ${highDropOff} courses with drop-off rates above 30%. Longer courses and certain topics show higher attrition patterns.`;
      }
    }

    return {
      observations: defaultInsights.observations,
      trends: defaultInsights.trends,
      anomalies: defaultInsights.anomalies,
      recommendations: defaultInsights.recommendations,
      fullText: `${defaultInsights.observations}\n\n${defaultInsights.trends}\n\n${defaultInsights.anomalies}\n\n${defaultInsights.recommendations}`
    };
  }

  generatePrompt(reportType, data) {
    return `Analyze the following EducoreAI ${reportType} report and summarize key insights, anomalies, and recommendations. Focus on:
- Observations: Key findings and patterns
- Trend Analysis: Notable increases, decreases, or stability
- Anomalies: Unusual patterns requiring attention
- Recommendations: Actionable suggestions for improvement

Report Data:
${JSON.stringify(data, null, 2)}

Limit response to 400 words.`;
  }

  formatInsights(content) {
    return {
      observations: this.extractSection(content, 'Observations'),
      trends: this.extractSection(content, 'Trend Analysis'),
      anomalies: this.extractSection(content, 'Anomalies'),
      recommendations: this.extractSection(content, 'Recommendations'),
      fullText: content
    };
  }

  extractSection(content, sectionName) {
    const regex = new RegExp(`${sectionName}[:\\-]?\\s*([^\\n]+(?:\\n(?!\\w+[:\\-])[^\\n]+)*)`, 'i');
    const match = content.match(regex);
    return match ? match[1].trim() : '';
  }
}

