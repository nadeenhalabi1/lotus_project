import { useState, useEffect } from 'react';
import { dashboardAPI, chartTranscriptionAPI } from '../services/api';
import { browserCache } from '../services/cache';
import html2canvas from 'html2canvas';

export const useDashboardData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshStatus, setRefreshStatus] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async (autoRefreshIfEmpty = false) => {
    try {
      setLoading(true);
      setError(null);
      setRefreshStatus(null);
      
      // Check persistent cache first (survives browser close)
      const persistentCached = browserCache.getPersistentData('dashboard');
      if (persistentCached && persistentCached.data?.charts?.length > 0) {
        console.log('[Dashboard] Loading from persistent cache (last session)');
        setData(persistentCached.data);
        setLastUpdated(persistentCached.lastUpdated);
        setLoading(false);
        // Still fetch fresh data in background, but show cached data immediately
      }
      
      // Check temporary cache (sessionStorage)
      const cached = browserCache.getTempData('dashboard');
      if (cached && cached.data?.charts?.length > 0 && !persistentCached) {
        setData(cached.data);
        setLastUpdated(cached.lastUpdated);
        setLoading(false);
      }

      const response = await dashboardAPI.getDashboard();
      const dashboardData = response.data;
      const updatedAt = dashboardData.lastUpdated || new Date().toISOString();
      
      // If no data and autoRefreshIfEmpty is true, trigger refresh (but only once)
      if ((!dashboardData.charts || dashboardData.charts.length === 0) && autoRefreshIfEmpty) {
        console.log('No data found, auto-refreshing...');
        try {
          // Add delay to prevent rate limit issues
          await new Promise(resolve => setTimeout(resolve, 500));
          const refreshResponse = await dashboardAPI.refreshData();
          const refreshedData = refreshResponse.data;
          const refreshedUpdatedAt = refreshedData.lastUpdated || new Date().toISOString();
          
          setData(refreshedData);
          setLastUpdated(refreshedUpdatedAt);
          setRefreshStatus(refreshedData.refreshStatus || null);
          
          browserCache.setTempData('dashboard', {
            data: refreshedData,
            lastUpdated: refreshedUpdatedAt,
          }, 300000);
          
          // Also save to persistent cache
          browserCache.setPersistentData('dashboard', {
            data: refreshedData,
            lastUpdated: refreshedUpdatedAt,
          });
          return;
        } catch (refreshErr) {
          console.error('Auto-refresh error:', refreshErr);
          // Continue with original data even if empty
        }
      }
      
      setData(dashboardData);
      setLastUpdated(updatedAt);
      
      // Cache for 5 minutes (temporary)
      browserCache.setTempData('dashboard', {
        data: dashboardData,
        lastUpdated: updatedAt,
      }, 300000);
      
      // Also save to persistent cache (survives browser close)
      browserCache.setPersistentData('dashboard', {
        data: dashboardData,
        lastUpdated: updatedAt,
      });
    } catch (err) {
      // Handle 429 errors with retry logic
      if (err.response?.status === 429) {
        console.warn('Rate limit hit, waiting before retry...');
        // Wait and retry once
        await new Promise(resolve => setTimeout(resolve, 2000));
        try {
          const retryResponse = await dashboardAPI.getDashboard();
          const dashboardData = retryResponse.data;
          const updatedAt = dashboardData.lastUpdated || new Date().toISOString();
          setData(dashboardData);
          setLastUpdated(updatedAt);
          browserCache.setTempData('dashboard', {
            data: dashboardData,
            lastUpdated: updatedAt,
          }, 300000);
          
          // Also save to persistent cache
          browserCache.setPersistentData('dashboard', {
            data: dashboardData,
            lastUpdated: updatedAt,
          });
          return;
        } catch (retryErr) {
          setError('Too many requests. Please wait a moment and refresh.');
          console.error('Retry failed:', retryErr);
        }
      } else {
        const errorMessage = err.response?.data?.error || err.message || 'Failed to load dashboard';
        setError(errorMessage);
        console.error('Dashboard fetch error:', {
          error: err,
          message: errorMessage,
          response: err.response,
          config: err.config
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async (services) => {
    try {
      setRefreshing(true);
      setError(null);
      const response = await dashboardAPI.refreshData(services);
      const dashboardData = response.data;
      const updatedAt = dashboardData.lastUpdated || new Date().toISOString();

      setData(dashboardData);
      setLastUpdated(updatedAt);
      setRefreshStatus(dashboardData.refreshStatus || null);

      browserCache.setTempData('dashboard', {
        data: dashboardData,
        lastUpdated: updatedAt,
      }, 300000);
      
      // Also save to persistent cache (survives browser close)
      browserCache.setPersistentData('dashboard', {
        data: dashboardData,
        lastUpdated: updatedAt,
      });

      // After data refresh, refresh all chart transcriptions with OpenAI
      // Wait for charts to render first
      setTimeout(async () => {
        if (dashboardData.charts && dashboardData.charts.length > 0) {
          try {
            console.log(`[Dashboard Refresh] Refreshing transcriptions for ${dashboardData.charts.length} charts...`);
            
            // Refresh transcriptions for all charts
            for (let i = 0; i < dashboardData.charts.length; i++) {
              const chart = dashboardData.charts[i];
              const chartId = chart.id || `chart-${i}`;
              
              try {
                // Find the chart element - try multiple selectors
                let chartElement = document.querySelector(`[data-chart-id="${chartId}"] .recharts-wrapper`);
                
                // Fallback: try to find by chart card
                if (!chartElement) {
                  const chartCard = document.querySelector(`[data-chart-id="${chartId}"]`);
                  if (chartCard) {
                    chartElement = chartCard.querySelector('.recharts-wrapper');
                  }
                }
                
                // Fallback: try to find by index
                if (!chartElement) {
                  const allChartCards = document.querySelectorAll('[data-chart-id]');
                  if (allChartCards[i]) {
                    chartElement = allChartCards[i].querySelector('.recharts-wrapper');
                  }
                }
                
                if (chartElement) {
                  // Capture chart image
                  const canvas = await html2canvas(chartElement, {
                    backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
                    scale: 1,
                    logging: false,
                    useCORS: true
                  });
                  
                  const imageUrl = canvas.toDataURL('image/png');
                  const topic = `${chart.title || chartId}`;
                  
                  // Refresh transcription via OpenAI (overwrites old one in DB)
                  await chartTranscriptionAPI.refreshTranscription(chartId, imageUrl, topic, chart.data || {});
                  console.log(`[Dashboard Refresh] Chart ${chartId} transcription refreshed`);
                } else {
                  console.warn(`[Dashboard Refresh] Chart element not found for ${chartId}, skipping transcription refresh`);
                }
              } catch (err) {
                console.error(`[Dashboard Refresh] Failed to refresh transcription for ${chartId}:`, err);
                // Continue with other charts even if one fails
              }
            }
            
            console.log(`[Dashboard Refresh] All chart transcriptions refreshed successfully`);
          } catch (err) {
            console.error('[Dashboard Refresh] Failed to refresh chart transcriptions:', err);
            // Don't fail the whole refresh if transcription refresh fails
          }
        }
      }, 2000); // Wait 2 seconds for charts to render
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to refresh data');
      setRefreshStatus({
        status: 'failed',
        error: err.response?.data?.error || err.message
      });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // On first load, auto-refresh if no data is available
    fetchDashboard(true);
  }, []);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refreshing,
    refreshStatus,
    refresh: refreshData,
    refetch: fetchDashboard,
    retryFailed: (services) => refreshData(services),
    setRefreshStatus,
  };
};

