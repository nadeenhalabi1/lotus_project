import { GenerateReportUseCase } from '../../application/useCases/GenerateReportUseCase.js';
import { getCacheRepository } from '../../infrastructure/repositories/CacheRepositorySingleton.js';
import { PDFKitGenerator } from '../../infrastructure/generators/PDFKitGenerator.js';
import { OpenAIClient } from '../../infrastructure/clients/OpenAIClient.js';
import { auditLogger } from '../../infrastructure/services/AuditLogger.js';

export class ReportsController {
  constructor() {
    this.cacheRepository = getCacheRepository();
    this.pdfGenerator = new PDFKitGenerator();
    this.aiService = new OpenAIClient();
    this.generateReportUseCase = new GenerateReportUseCase(
      this.cacheRepository,
      this.pdfGenerator,
      this.aiService
    );
  }

  async getReportTypes(req, res, next) {
    try {
      const types = [
        { id: 'monthly-performance', name: 'Monthly Learning Performance Report', description: 'Comprehensive monthly analysis of learning outcomes' },
        { id: 'course-completion', name: 'Course Completion Analysis', description: 'Detailed breakdown of course participation and completion' },
        { id: 'user-engagement', name: 'User Engagement Summary', description: 'Analysis of user engagement patterns' },
        { id: 'organizational-benchmark', name: 'Organizational Benchmark Report', description: 'Cross-organization performance comparison' },
        { id: 'learning-roi', name: 'Learning ROI Report', description: 'Training investment return analysis' },
        { id: 'skill-gap', name: 'Skill Gap Analysis Report', description: 'Identification of skill gaps across teams' },
        { id: 'compliance', name: 'Compliance & Certification Tracking', description: 'Monitoring of learning compliance and certifications' },
        { id: 'performance-trend', name: 'Performance Trend Analysis', description: 'Long-term analysis of learning efficiency trends' },
        { id: 'course-performance-deep-dive', name: 'Course Performance Deep Dive Report', description: 'Detailed analysis of individual course performance, completion rates, and engagement metrics' },
        { id: 'content-effectiveness', name: 'Content Effectiveness Report', description: 'Analysis of content performance, engagement, and effectiveness by type and creator' },
        { id: 'department-performance', name: 'Department Performance Report', description: 'Performance metrics and learning outcomes comparison across departments' },
        { id: 'drop-off-analysis', name: 'Drop-off Analysis Report', description: 'Identification and analysis of course drop-off patterns and trends' },
      ];
      res.json(types);
    } catch (error) {
      next(error);
    }
  }

  async generateReport(req, res, next) {
    try {
      const { reportType, format = 'json', chartImages = {}, chartNarrations = {}, reportConclusions = null, ...options } = req.body;
      const userId = req.user?.userId || req.user?.sub || 'mvp-user';

      if (!reportType) {
        return res.status(400).json({ error: 'reportType is required' });
      }

      // Log report generation start
      auditLogger.logReportGeneration(userId, reportType, 'initiated');

      const startTime = Date.now();
      // Pass chartImages, chartNarrations, and reportConclusions to use case
      const result = await this.generateReportUseCase.execute(reportType, { ...options, chartImages, chartNarrations, reportConclusions });
      const duration = Date.now() - startTime;

      // Log successful report generation
      auditLogger.logReportGeneration(userId, reportType, 'success', {
        duration: `${duration}ms`,
        pdfSize: result.pdf?.length || 0
      });

      // If format is 'pdf', return PDF, otherwise return JSON
      if (format === 'pdf') {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${reportType}-report.pdf"`);
        res.send(result.pdf);
      } else {
        // Return JSON with report data
        res.json({
          report: result.report,
          pdfAvailable: true
        });
      }
    } catch (error) {
      const userId = req.user?.userId || req.user?.sub || 'mvp-user';
      auditLogger.logReportGeneration(userId, req.body?.reportType || 'unknown', 'failure', {
        error: error.message
      });
      next(error);
    }
  }
}
