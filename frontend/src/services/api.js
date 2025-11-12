import axios from 'axios';

// Get base URL from environment, default to localhost
let baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Log API URL for debugging (only in development)
if (import.meta.env.DEV) {
  console.log('🔗 API Base URL:', baseURL);
}

// Ensure base URL doesn't end with slash
baseURL = baseURL.replace(/\/$/, '');

// Add /api/v1 if not already present
if (!baseURL.endsWith('/api/v1')) {
  baseURL = `${baseURL}/api/v1`;
}

const API_URL = baseURL;

// Log final API URL
console.log('🔗 Final API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for JWT token
// For MVP: Token is optional - backend accepts requests without token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    // Only add token if it exists (optional for MVP)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Continue even without token (for MVP)
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    
    // Handle 429 errors gracefully - reduce console spam
    if (error.response?.status === 429) {
      console.warn(`[API] Rate limit (429) for ${error.config?.url} - request will be retried or cached data will be used`);
      // Don't log full error details for 429 to reduce console noise
    } else {
      // Log errors for debugging (except 429)
      console.error('API Error:', {
        url: error.config?.url,
        status: error.response?.status,
        message: error.message,
        baseURL: API_URL
      });
    }
    return Promise.reject(error);
  }
);

// Dashboard API
export const dashboardAPI = {
  getDashboard: () => api.get('/dashboard'),
  refreshData: (services) => api.post('/dashboard/refresh', services?.length ? { services } : {}),
};

// Charts API
export const chartsAPI = {
  getChart: (chartId) => api.get(`/dashboard/chart/${chartId}`),
  getChartData: (chartId, filters) => api.post(`/dashboard/chart/${chartId}/data`, filters),
  refreshChart: (chartId) => api.post(`/dashboard/chart/${chartId}/refresh`),
  getFilteredChart: (chartId, courseIds) => api.post(`/dashboard/chart/${chartId}/filter`, { courseIds }),
  downloadChartPDF: (chartId, chartImage) => {
    if (chartImage) {
      // Send POST with image data
      return api.post(`/dashboard/chart/${chartId}/pdf`, { chartImage }, { responseType: 'blob' });
    } else {
      // Fallback to GET if no image
      return api.get(`/dashboard/chart/${chartId}/pdf`, { responseType: 'blob' });
    }
  },
  getCourses: () => api.get('/dashboard/courses'),
};

// BOX API
export const boxAPI = {
  getCharts: () => api.get('/dashboard/box/charts'),
  searchCharts: (query) => api.get(`/dashboard/box/charts/search?query=${query}`),
};

// Reports API
export const reportsAPI = {
  getReportTypes: () => api.get('/reports/types'),
  generateReport: (reportType, options = {}) => {
    if (options.format === 'pdf') {
      return api.post('/reports/generate', { reportType, ...options }, { responseType: 'blob' });
    }
    return api.post('/reports/generate', { reportType, ...options });
  },
  downloadReport: (reportId) => api.get(`/reports/${reportId}/download`, { responseType: 'blob' }),
};

// Data API
export const dataAPI = {
  refresh: () => api.post('/data/refresh'),
  getStatus: () => api.get('/data/status'),
};

// OpenAI API
export const openaiAPI = {
  describeChart: (image, context, fast = false) => {
    // Legacy endpoint - uses old endpoint without caching
    const isUrl = image.startsWith('http://') || image.startsWith('https://');
    const payload = isUrl 
      ? { imageUrl: image, context, fast }
      : { dataUrl: image, context, fast };
    
    return api.post('/openai/describe-chart', payload);
  },
  generateReportConclusions: (topic, images) => {
    return api.post('/openai/report-conclusions', { topic, images });
  },
};

// Chart Transcription API (DB-first flow - API Contract)
export const chartTranscriptionAPI = {
  /**
   * GET: Read transcription from DB only
   * Returns: { chartId: string, exists: boolean, transcription_text: string | null }
   * Always returns 200 (never 404)
   */
  getTranscription: (chartId) => {
    return api.get(`/ai/chart-transcription/${chartId}`);
  },
  
  /**
   * POST: Create or update transcription
   * Always performs: OpenAI → DB (UPSERT) → Returns saved row
   * Body: { topic?: string, chartData?: any, imageUrl: string, model?: string, forceRecompute?: boolean }
   * Returns: { chartId, chart_signature, model, transcription_text, updated_at }
   */
  createOrUpdateTranscription: (chartId, topic, chartData, imageUrl, model = 'gpt-4o-mini', forceRecompute = false) => {
    return api.post(`/ai/chart-transcription/${chartId}`, {
      topic,
      chartData,
      imageUrl,
      model,
      forceRecompute
    });
  },
  
  // Legacy methods (for backward compatibility)
  getOrCreateTranscription: (chartId, topic, chartData, imageUrl, model = 'gpt-4o-mini') => {
    return chartTranscriptionAPI.createOrUpdateTranscription(chartId, topic, chartData, imageUrl, model, false);
  },
  
  /**
   * POST /startup: Sequentially transcribe charts on first load
   * Only saves if transcription doesn't exist
   * Body: { charts: [{ chartId, imageUrl, context? }] }
   */
  startup: (charts) => {
    return api.post('/ai/chart-transcription/startup', { charts });
  },
  
  /**
   * POST /refresh: Always overwrite transcriptions when data changes
   * Body: { charts: [{ chartId, imageUrl, context? }] }
   */
  refresh: (charts) => {
    return api.post('/ai/chart-transcription/refresh', { charts });
  },
  
  // Legacy methods (kept for backward compatibility)
  startupFill: (charts, force = false) => {
    return api.post('/ai/chart-transcription/startup-fill', { charts, force });
  },
  
  refreshTranscription: (chartId, imageUrl, topic, chartData, force = false, model = 'gpt-4o-mini') => {
    const payload = {
      chartId,
      topic: topic || '',
      chartData: chartData || {},
      imageUrl,
      force,
      model
    };
    return api.post('/ai/chart-transcription/refresh-legacy', payload);
  },
};

export default api;

