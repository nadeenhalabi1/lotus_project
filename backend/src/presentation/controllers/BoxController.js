import { getCacheRepository } from '../../infrastructure/repositories/CacheRepositorySingleton.js';
import { GetDashboardUseCase } from '../../application/useCases/GetDashboardUseCase.js';
import { GetCombinedAnalyticsUseCase } from '../../application/useCases/GetCombinedAnalyticsUseCase.js';

export class BoxController {
  constructor() {
    this.cacheRepository = getCacheRepository();
    this.getDashboardUseCase = new GetDashboardUseCase(this.cacheRepository);
    this.getCombinedAnalyticsUseCase = new GetCombinedAnalyticsUseCase(this.cacheRepository);
  }

  async getCharts(req, res, next) {
    try {
      // Get all charts (both priority and non-priority)
      const dashboardData = await this.getDashboardUseCase.execute();
      const combinedAnalytics = await this.getCombinedAnalyticsUseCase.execute();
      
      const allCharts = [
        ...dashboardData.charts,
        ...combinedAnalytics.charts
      ];

      // Filter only NON-priority charts for BOX
      const boxCharts = allCharts.filter(chart => {
        // Include charts that are explicitly marked as non-priority
        if (chart.metadata?.isPriority === false) {
          return true;
        }
        
        // Include Content Studio main chart (not in priority services)
        if (chart.metadata?.service === 'contentStudio' && !chart.metadata?.chartType) {
          return true;
        }
        
        // Include all detailed charts (have chartType)
        if (chart.metadata?.chartType) {
          return true;
        }
        
        return false;
      });

      // Format charts for BOX display
      const formattedCharts = boxCharts.map(chart => {
        // Determine category based on service or chart type
        let category = 'General';
        if (chart.metadata?.service) {
          const serviceCategories = {
            directory: 'Directory',
            courseBuilder: 'Course Data',
            assessment: 'Assessments',
            contentStudio: 'Content Studio',
            learningAnalytics: 'Learning Analytics'
          };
          category = serviceCategories[chart.metadata.service] || 'General';
        }
        
        // Determine data source
        const dataSource = chart.metadata?.service || 'general';
        
        return {
          id: chart.id,
          name: chart.title,
          category,
          dataSource: dataSource.replace(/([A-Z])/g, '-$1').toLowerCase(),
          description: chart.description || chart.subtitle || '',
          type: chart.type,
          data: chart.data,
          lastUpdated: chart.metadata?.lastUpdated || new Date().toISOString(),
          updateFrequency: 'daily',
          metadata: chart.metadata
        };
      });

      res.json(formattedCharts);
    } catch (error) {
      console.error('BoxController error:', error);
      next(error);
    }
  }

  async searchCharts(req, res, next) {
    try {
      const { query } = req.query;
      
      // Get all BOX charts
      const response = await this.getCharts(req, res, (err) => {
        if (err) return next(err);
      });
      
      // This is a bit of a hack - we need to get the charts differently
      const dashboardData = await this.getDashboardUseCase.execute();
      const combinedAnalytics = await this.getCombinedAnalyticsUseCase.execute();
      
      const allCharts = [
        ...dashboardData.charts,
        ...combinedAnalytics.charts
      ];

      const boxCharts = allCharts.filter(chart => {
        if (chart.metadata?.isPriority === false) return true;
        if (chart.metadata?.service === 'contentStudio' && !chart.metadata?.chartType) return true;
        if (chart.metadata?.chartType) return true;
        return false;
      });

      let filteredCharts = boxCharts;

      if (query) {
        const lowerQuery = query.toLowerCase();
        filteredCharts = boxCharts.filter(chart =>
          chart.title?.toLowerCase().includes(lowerQuery) ||
          chart.description?.toLowerCase().includes(lowerQuery) ||
          chart.metadata?.service?.toLowerCase().includes(lowerQuery)
        );
      }

      // Format for response
      const formattedCharts = filteredCharts.map(chart => {
        let category = 'General';
        if (chart.metadata?.service) {
          const serviceCategories = {
            directory: 'Directory',
            courseBuilder: 'Course Data',
            assessment: 'Assessments',
            contentStudio: 'Content Studio',
            learningAnalytics: 'Learning Analytics'
          };
          category = serviceCategories[chart.metadata.service] || 'General';
        }
        
        return {
          id: chart.id,
          name: chart.title,
          category,
          dataSource: chart.metadata?.service || 'general',
          description: chart.description || '',
          type: chart.type,
          data: chart.data,
          lastUpdated: chart.metadata?.lastUpdated || new Date().toISOString()
        };
      });

      res.json(formattedCharts);
    } catch (error) {
      next(error);
    }
  }
}
