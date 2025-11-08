/**
 * Microservice Client Interface (Port)
 * Defines the contract for external microservice communication
 */
export class IMicroserviceClient {
  async fetchData(service, dateRange) {
    throw new Error('fetchData() must be implemented');
  }
}

