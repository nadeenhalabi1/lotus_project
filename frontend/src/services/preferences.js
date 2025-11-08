import { browserCache } from './cache';

export const preferences = {
  // Theme preference
  setTheme: (theme) => {
    browserCache.setPreference('theme', theme);
  },

  getTheme: () => {
    return browserCache.getPreference('theme', 'light');
  },

  // Dashboard preferences
  setDashboardView: (viewName, config) => {
    const views = browserCache.getPreference('dashboardViews', {});
    views[viewName] = config;
    browserCache.setPreference('dashboardViews', views);
  },

  getDashboardView: (viewName) => {
    const views = browserCache.getPreference('dashboardViews', {});
    return views[viewName] || null;
  },

  // Date range preference
  setDateRange: (range) => {
    browserCache.setPreference('dateRange', range);
  },

  getDateRange: () => {
    return browserCache.getPreference('dateRange', {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date().toISOString(),
    });
  },

  // Organization filter
  setOrganizationFilter: (orgId) => {
    browserCache.setPreference('organizationFilter', orgId);
  },

  getOrganizationFilter: () => {
    return browserCache.getPreference('organizationFilter', null);
  },
};

