import axios from 'axios';
import { IMicroserviceClient } from '../../domain/ports/IMicroserviceClient.js';

const SERVICE_URLS = {
  directory: process.env.DIRECTORY_API_URL,
  courseBuilder: process.env.COURSE_BUILDER_API_URL,
  assessment: process.env.ASSESSMENT_API_URL,
  contentStudio: process.env.CONTENT_STUDIO_API_URL,
  learningAnalytics: process.env.LEARNING_ANALYTICS_API_URL,
};

export class MicroserviceHttpClient extends IMicroserviceClient {
  constructor(jwtToken) {
    super();
    this.jwtToken = jwtToken;
  }

  async fetchData(service, dateRange) {
    const baseUrl = SERVICE_URLS[service];
    if (!baseUrl) {
      throw new Error(`Unknown service: ${service}`);
    }

    try {
      const response = await axios.get(`${baseUrl}/data`, {
        headers: {
          'Authorization': `Bearer ${this.jwtToken}`,
          'Content-Type': 'application/json'
        },
        params: {
          startDate: dateRange.start,
          endDate: dateRange.end
        },
        timeout: 30000
      });

      return response.data;
    } catch (error) {
      console.error(`Error fetching data from ${service}:`, error.message);
      throw error;
    }
  }
}

