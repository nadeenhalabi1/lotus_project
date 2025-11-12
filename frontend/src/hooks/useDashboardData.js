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
      
      // ALWAYS check persistent cache first (survives browser close)
      // This ensures we show the last displayed data when reopening the site
      const persistentCached = browserCache.getPersistentData('dashboard');
      if (persistentCached && persistentCached.data?.charts?.length > 0) {
        console.log('[Dashboard] ✅ Loading from persistent cache (last session data)');
        setData(persistentCached.data);
        setLastUpdated(persistentCached.lastUpdated);
        setLoading(false);
        // Fetch fresh data in background to update cache, but don't block UI
        // Add delay to prevent rate limiting on page load
        setTimeout(async () => {
          try {
            const response = await dashboardAPI.getDashboard();
            const dashboardData = response.data;
            const updatedAt = dashboardData.lastUpdated || new Date().toISOString();
            // Update persistent cache with fresh data
            browserCache.setPersistentData('dashboard', {
              data: dashboardData,
              lastUpdated: updatedAt,
            });
          } catch (err) {
            // Handle 429 errors gracefully - don't spam console
            if (err.response?.status === 429) {
              console.warn('[Dashboard] Background refresh rate limited (429), will retry later');
              // Don't retry immediately - wait longer
            } else {
              console.warn('[Dashboard] Background refresh failed, keeping cached data:', err);
            }
          }
        }, 5000); // Wait 5 seconds before background refresh to avoid rate limiting
        return; // Exit early - we have cached data to show
      }
      
      // Check temporary cache (sessionStorage) as fallback
      const cached = browserCache.getTempData('dashboard');
      if (cached && cached.data?.charts?.length > 0) {
        console.log('[Dashboard] Loading from temporary cache');
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
            
            console.log(`[Dashboard Refresh] All dashboard chart transcriptions refreshed successfully`);
            
            // Also refresh transcriptions for report charts (if Reports page is active)
            // This ensures that when data is refreshed, report chart transcriptions are updated with new data
            // Wait a bit longer to ensure report charts have updated with new data
            setTimeout(async () => {
              try {
                console.log('[Dashboard Refresh] Checking for report charts to refresh...');
                
                // Find all report chart elements (they have data-chart-only="true" attribute)
                const reportChartElements = document.querySelectorAll('[data-chart-id][data-chart-only="true"]');
                
                if (reportChartElements.length > 0) {
                  console.log(`[Dashboard Refresh] Found ${reportChartElements.length} report charts to refresh`);
                
                // Prepare charts array for startup-fill (which handles signature check and OpenAI call)
                // Capture all chart images first (these represent the NEW charts with NEW data)
                const chartsForFill = [];
                
                for (const chartElement of reportChartElements) {
                  const chartCard = chartElement.closest('[data-chart-id]');
                  if (chartCard) {
                    const chartId = chartCard.getAttribute('data-chart-id');
                    if (chartId) {
                      try {
                        // Capture chart image (this represents the NEW chart with NEW data)
                        const canvas = await html2canvas(chartElement, {
                          backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
                          scale: 1,
                          logging: false,
                          useCORS: true
                        });
                        
                        const imageUrl = canvas.toDataURL('image/png');
                        
                        // Get chart title and report title for context
                        const chartTitle = chartCard.querySelector('h4')?.textContent || chartId;
                        const reportTitle = document.querySelector('h2')?.textContent || 'Report';
                        const topic = `${reportTitle} - ${chartTitle}`;
                        
                        // Chart data will be computed by backend from the image
                        // The signature will be computed from topic + chartData
                        // If signature changed (new data), OpenAI will be called automatically
                        const chartData = {}; // Empty - backend will compute from image
                        
                        chartsForFill.push({
                          chartId,
                          topic,
                          chartData,
                          imageUrl
                        });
                        
                        console.log(`[Dashboard Refresh] Captured chart ${chartId} image (${imageUrl.length} bytes)`);
                      } catch (err) {
                        console.error(`[Dashboard Refresh] Failed to capture chart ${chartId}:`, err);
                        // Continue with other charts even if one fails
                      }
                    }
                  }
                }
                
                // Filter out charts without imageUrl (shouldn't happen, but just in case)
                const chartsWithImages = chartsForFill.filter(c => c.imageUrl);
                
                if (chartsWithImages.length > 0) {
                  console.log(`[Dashboard Refresh] Refreshing ${chartsWithImages.length} report chart transcriptions with new data...`);
                  
                  // Refresh each chart transcription via OpenAI (always overwrites old one in DB)
                  // This ensures that when data is refreshed, transcriptions are updated with new chart data
                  // Use queue to prevent rate limiting
                  for (const { chartId, topic, chartData, imageUrl } of chartsWithImages) {
                    try {
                      // Use refreshTranscription with force=true to always call OpenAI and overwrite DB
                      // This is what we want - new data = new transcription
                      await apiQueue.enqueue(
                        `refresh-report-transcription-${chartId}`,
                        () => chartTranscriptionAPI.refreshTranscription(chartId, imageUrl, topic, chartData, true) // force=true
                      );
                      console.log(`[Dashboard Refresh] Report chart ${chartId} transcription refreshed with new data`);
                      
                      // Wait between charts to prevent rate limiting
                      await new Promise(resolve => setTimeout(resolve, 2000));
                    } catch (err) {
                      console.error(`[Dashboard Refresh] Failed to refresh transcription for report chart ${chartId}:`, err);
                      // Continue with other charts even if one fails
                    }
                  }
                  
                  console.log(`[Dashboard Refresh] All report chart transcriptions refreshed successfully`);
                  
                  // Dispatch custom event to notify Reports page to reload transcriptions
                  window.dispatchEvent(new CustomEvent('reportTranscriptionsRefreshed'));
                } else {
                  console.warn('[Dashboard Refresh] No report charts with images captured');
                }
              } else {
                console.log('[Dashboard Refresh] No report charts found to refresh');
              }
              } catch (err) {
                console.error('[Dashboard Refresh] Failed to refresh report chart transcriptions:', err);
                // Don't fail the whole refresh if report transcription refresh fails
              }
            }, 5000); // Wait 5 seconds to ensure report charts have updated with new data
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

