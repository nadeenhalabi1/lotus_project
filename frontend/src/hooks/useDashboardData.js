import { useState, useEffect } from 'react';
import { dashboardAPI, chartTranscriptionAPI } from '../services/api';
import { browserCache } from '../services/cache';
import html2canvas from 'html2canvas';
import { apiQueue } from '../utils/apiQueue';

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
      let dashboardData;
      let updatedAt;
      
      if (persistentCached && persistentCached.data?.charts?.length > 0) {
        console.log('[Dashboard] ✅ Loading from persistent cache (last session data)');
        setData(persistentCached.data);
        setLastUpdated(persistentCached.lastUpdated);
        setLoading(false);
        
        // ⚠️ CRITICAL: Use cached data for startup-fill, but also fetch fresh data in background
        dashboardData = persistentCached.data;
        updatedAt = persistentCached.lastUpdated;
        
        // Fetch fresh data in background to update cache, but don't block UI
        // Add delay to prevent rate limiting on page load
        setTimeout(async () => {
          try {
            const response = await dashboardAPI.getDashboard();
            const freshData = response.data;
            const freshUpdatedAt = freshData.lastUpdated || new Date().toISOString();
            // Update persistent cache with fresh data
            browserCache.setPersistentData('dashboard', {
              data: freshData,
              lastUpdated: freshUpdatedAt,
            });
            // Update state with fresh data if user is still on page
            setData(freshData);
            setLastUpdated(freshUpdatedAt);
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
      } else {
        // Check temporary cache (sessionStorage) as fallback
        const cached = browserCache.getTempData('dashboard');
        if (cached && cached.data?.charts?.length > 0) {
          console.log('[Dashboard] Loading from temporary cache');
          setData(cached.data);
          setLastUpdated(cached.lastUpdated);
          setLoading(false);
          dashboardData = cached.data;
          updatedAt = cached.lastUpdated;
        } else {
          // No cache - fetch fresh data
          const response = await dashboardAPI.getDashboard();
          dashboardData = response.data;
          updatedAt = dashboardData.lastUpdated || new Date().toISOString();
          
          setData(dashboardData);
          setLastUpdated(updatedAt);
          setLoading(false);
        }
      }
      
      // ⚠️ CRITICAL: Always run startup-fill, even if we loaded from cache
      // This ensures transcriptions are created/updated on every page load
      if (dashboardData) {
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
          dashboardData = refreshedData;
          updatedAt = refreshedUpdatedAt;
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
        
        // ℹ️ NOTE: No OpenAI calls on initial load
        // Transcriptions are ONLY generated when "Refresh Data" button is clicked
        // On initial load, we simply display existing transcriptions from DB (if any)
        console.log(`[Dashboard] ✅ Dashboard loaded with ${dashboardData.charts?.length || 0} charts`);
        console.log(`[Dashboard] ℹ️ Transcriptions will be loaded from DB when charts render`);
        console.log(`[Dashboard] ℹ️ To generate new transcriptions, click "Refresh Data" button`);
      }
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
            
            // Capture all chart images
            const chartsForRefresh = [];
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
                    scale: 0.5, // Reduced scale to reduce image size and token count
                    logging: false,
                    useCORS: true
                  });
                  
                  const imageUrl = canvas.toDataURL('image/png');
                  const context = `${chart.title || chartId}`;
                  
                  chartsForRefresh.push({
                    chartId,
                    imageUrl,
                    context
                  });
                }
              } catch (err) {
                console.error(`[Dashboard Refresh] Failed to capture chart ${chartId}:`, err);
              }
            }
            
            // Call /refresh endpoint - processes charts sequentially, always overwrites
            if (chartsForRefresh.length > 0) {
              console.log(`[Dashboard Refresh] Sending ${chartsForRefresh.length} charts to /refresh endpoint...`);
              const { data } = await chartTranscriptionAPI.refresh(chartsForRefresh);
              console.log(`[Dashboard Refresh] ✅ Refresh completed:`, data);
              
              if (data.results) {
                const updated = data.results.filter(r => r.status === 'updated').length;
                const errors = data.results.filter(r => r.status === 'error').length;
                console.log(`[Dashboard Refresh] Results: ${updated} updated, ${errors} errors`);
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
                
                // Prepare charts array for /refresh endpoint (always overwrites)
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
                        
                        // Try to get chart data from the report data stored in state
                        // We need the actual chart data to compute the correct signature
                        // If we can't get it, use empty object (backend will still work with force=true)
                        let chartData = {};
                        
                        // Try to find chart data from report data (if Reports page has it stored)
                        // Look for report data in window or try to extract from chart element
                        try {
                          // Try to get data from recharts component if available
                          const rechartsWrapper = chartElement.querySelector('.recharts-wrapper');
                          if (rechartsWrapper) {
                            // Try to extract data from recharts (if accessible)
                            // This is a fallback - ideally we'd have access to report.charts
                            console.log(`[Dashboard Refresh] Chart ${chartId} - using empty chartData (will use force=true)`);
                          }
                        } catch (err) {
                          console.warn(`[Dashboard Refresh] Could not extract chart data for ${chartId}:`, err);
                        }
                        
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
                  
                  // Prepare charts array for /refresh endpoint
                  const chartsForAPI = chartsWithImages.map(({ chartId, topic, imageUrl }) => ({
                    chartId,
                    imageUrl,
                    context: topic || chartId
                  }));
                  
                  // Call /refresh endpoint - processes charts sequentially, always overwrites
                  const { data } = await chartTranscriptionAPI.refresh(chartsForAPI);
                  console.log(`[Dashboard Refresh] ✅ Report charts refresh completed:`, data);
                  
                  if (data.results) {
                    const updated = data.results.filter(r => r.status === 'updated').length;
                    const errors = data.results.filter(r => r.status === 'error').length;
                    console.log(`[Dashboard Refresh] Report charts results: ${updated} updated, ${errors} errors`);
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

