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
    // Log errors for debugging
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      baseURL: API_URL
    });
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
    // Determine if it's a URL or data URL
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

export default api;

