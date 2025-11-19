import { fetchCourseBuilderDataFromService } from '../../infrastructure/clients/CourseBuilderClient.js';
import { fetchAssessmentDataFromService } from '../../infrastructure/clients/AssessmentClient.js';
import { fetchDirectoryDataFromService } from '../../infrastructure/clients/DirectoryClient.js';
import { fetchContentMetricsFromContentStudio } from '../../infrastructure/clients/ContentStudioClient.js';
import { fetchLearningAnalyticsFromService } from '../../infrastructure/clients/LearningAnalyticsClient.js';

import { saveCourseBuilderSnapshots } from '../../infrastructure/db/courseBuilderCache.js';
import { saveAssessmentSnapshot } from '../../infrastructure/db/assessmentCache.js';
import { saveDirectorySnapshot } from '../../infrastructure/db/directoryCache.js';
import { saveContentStudioSnapshot } from '../../infrastructure/db/contentStudioCache.js';
import { saveLearningAnalyticsSnapshot } from '../../infrastructure/db/learningAnalyticsCache.js';

export class CollectDataUseCase {
  constructor(cacheRepository, microserviceClient, retryService) {
    // Keep references for future use (and to avoid breaking existing callers)
    this.cacheRepository = cacheRepository;
    this.microserviceClient = microserviceClient;
    this.retryService = retryService;

    this.defaultServices = ['directory', 'courseBuilder', 'assessment', 'contentStudio', 'learningAnalytics'];

    this.serviceHandlers = {
      courseBuilder: {
        label: 'Course Builder',
        fetch: fetchCourseBuilderDataFromService,
        save: async (data) => {
          if (!Array.isArray(data)) {
            throw new Error('Course Builder response must be an array');
          }
          await saveCourseBuilderSnapshots(data);
        }
      },
      assessment: {
        label: 'Assessment',
        fetch: fetchAssessmentDataFromService,
        save: async (data) => {
          if (!Array.isArray(data)) {
            throw new Error('Assessment response must be an array');
          }
          await saveAssessmentSnapshot(data);
        }
      },
      directory: {
        label: 'Directory',
        fetch: fetchDirectoryDataFromService,
        save: async (data) => {
          if (!Array.isArray(data)) {
            throw new Error('Directory response must be an array');
          }
          await saveDirectorySnapshot(data);
        }
      },
      contentStudio: {
        label: 'Content Studio',
        fetch: fetchContentMetricsFromContentStudio,
        save: async (data) => {
          if (!data || typeof data !== 'object') {
            throw new Error('Content Studio response must be an object');
          }
          await saveContentStudioSnapshot(data);
        }
      },
      learningAnalytics: {
        label: 'Learning Analytics',
        fetch: fetchLearningAnalyticsFromService,
        save: async (data) => {
          if (!data || typeof data !== 'object') {
            throw new Error('Learning Analytics response must be an object');
          }
          await saveLearningAnalyticsSnapshot(data);
        }
      }
    };
  }

  /**
   * Full refresh pipeline:
   * 1. Fetch latest data from each microservice
   * 2. Persist it into the normalized DB tables
   * 3. Return summary so the UI can report success/failure per service
   */
  async execute(jwtToken, services = null) {
    const serviceList = services?.length ? services : this.defaultServices;
    const results = {
      successful: [],
      failed: [],
      partial: false
    };

    for (const service of serviceList) {
      const handler = this.serviceHandlers[service];

      if (!handler) {
        results.failed.push({
          service,
          reason: `Unsupported service "${service}"`,
          lastSuccessful: null
        });
        results.partial = true;
        continue;
      }

      try {
        console.log(`[CollectDataUseCase] Fetching ${handler.label} data...`);
        const fetchedData = await handler.fetch(jwtToken);
        console.log(`[CollectDataUseCase] Saving ${handler.label} snapshot to DB...`);
        await handler.save(fetchedData);

        results.successful.push({
          service,
          lastUpdated: new Date().toISOString()
        });
      } catch (error) {
        console.error(`[CollectDataUseCase] ${handler.label} sync failed:`, error.message);
        results.failed.push({
          service,
          reason: error.message,
          lastSuccessful: null
        });
        results.partial = true;
      }
    }

    if (results.failed.length && results.successful.length === 0) {
      results.allFailed = true;
    }

    return results;
  }
}
