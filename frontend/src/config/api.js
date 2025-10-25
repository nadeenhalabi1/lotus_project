// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Log the API URL for debugging (only in development)
if (import.meta.env.DEV) {
  console.log('API Base URL:', API_BASE_URL);
}

export const API_ENDPOINTS = {
  // Microservices endpoints
  MICROSERVICES: {
    DASHBOARD_OVERVIEW: `${API_BASE_URL}/api/microservices/dashboard/overview`,
    COURSEBUILDER_COURSES: `${API_BASE_URL}/api/microservices/coursebuilder/courses`,
    ANALYTICS_TRENDS: `${API_BASE_URL}/api/microservices/analytics/trends`,
    ANALYTICS_SKILL_GAPS: `${API_BASE_URL}/api/microservices/analytics/skill-gaps`,
    ANALYTICS_INSIGHTS: `${API_BASE_URL}/api/microservices/analytics/insights`,
  },
  
  // Enhanced endpoints
  ENHANCED: {
    COURSEBUILDER_COURSES: `${API_BASE_URL}/api/enhanced/coursebuilder/courses?normalize=true`,
    ASSESSMENT_TESTS: `${API_BASE_URL}/api/enhanced/assessment/tests?normalize=true`,
    LEARNERAI_SKILLS: `${API_BASE_URL}/api/enhanced/learnerai/skills/proficiency/0.7?normalize=true`,
  },
  
  // Health check
  HEALTH: `${API_BASE_URL}/health`,
};

export default API_BASE_URL;
