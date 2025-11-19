export class CollectDataUseCase {
  constructor(cacheRepository, microserviceClient, retryService) {
    this.cacheRepository = cacheRepository;
    this.microserviceClient = microserviceClient;
    this.retryService = retryService;
    this.defaultServices = ['directory', 'courseBuilder', 'assessment', 'contentStudio', 'learningAnalytics'];
  }

  /**
   * DB-backed mode: verify each service has data inside the analytics tables.
   * When "Data Refresh" runs we simply re-fetch the latest rows so the
   * frontend reflects whatever currently lives in PostgreSQL.
   */
  async execute(jwtToken, services = null) {
    const serviceList = services?.length ? services : this.defaultServices;
    const results = {
      successful: [],
      failed: [],
      partial: false
    };

    for (const service of serviceList) {
      try {
        const latest = await this.cacheRepository.getLatestByService(service);
        if (!latest) {
          throw new Error('No data available in database');
        }

        results.successful.push({
          service,
          lastUpdated: latest.metadata?.collected_at || latest.timestamp || new Date().toISOString()
        });
      } catch (error) {
        console.error(`CollectDataUseCase - ${service} failed:`, error.message);
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
