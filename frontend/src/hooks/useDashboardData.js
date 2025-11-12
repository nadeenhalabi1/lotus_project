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
        
        // 🧠 CRITICAL: On initial site load, send all charts to OpenAI and save to DB
        // This ensures every chart has a transcription in the DB
        // Wait for charts to render first
        if (dashboardData.charts && dashboardData.charts.length > 0) {
          console.log(`[Dashboard Startup] 📊 Dashboard loaded with ${dashboardData.charts.length} charts. Will wait 3 seconds for charts to render...`);
        setTimeout(async () => {
          try {
            console.log(`[Dashboard Startup] 🚀 Initial load - sending ${dashboardData.charts.length} charts to OpenAI for transcription...`);
            console.log(`[Dashboard Startup] 🔍 Checking for chart elements in DOM...`);
            
            // 🔍 DEBUG: Check if chart elements exist in DOM
            const allChartCards = document.querySelectorAll('[data-chart-id]');
            const allRechartsWrappers = document.querySelectorAll('.recharts-wrapper');
            console.log(`[Dashboard Startup] Found ${allChartCards.length} chart cards with [data-chart-id] attribute`);
            console.log(`[Dashboard Startup] Found ${allRechartsWrappers.length} .recharts-wrapper elements`);
            
            const chartsForStartupFill = [];
            
            // Collect all charts with their images
            for (let i = 0; i < dashboardData.charts.length; i++) {
              const chart = dashboardData.charts[i];
              const chartId = chart.id || `chart-${i}`;
              
              try {
                // 🔍 DEBUG: Check if transcription already exists in DB
                // NOTE: On first load, we should ALWAYS create transcriptions, even if they exist
                // This ensures fresh transcriptions with latest data
                const existingTranscription = await apiQueue.enqueue(
                  `check-transcription-${chartId}`,
                  () => chartTranscriptionAPI.getTranscription(chartId)
                );
                
                // 🔍 DEBUG: Log what we found
                console.log(`[Dashboard Startup] Chart ${chartId} transcription check:`, {
                  exists: existingTranscription?.data?.exists,
                  hasText: !!(existingTranscription?.data?.transcription_text),
                  textLength: existingTranscription?.data?.transcription_text?.length || 0
                });
                
                // ⚠️ CHANGED: On first load, we ALWAYS create transcriptions (even if they exist)
                // This ensures we have fresh transcriptions with the latest chart data
                // The backend will handle signature checking and skip if data hasn't changed
                console.log(`[Dashboard Startup] Chart ${chartId} will be sent to OpenAI for transcription (first load always creates)`);
                
                // Find the chart element - try multiple strategies
                console.log(`[Dashboard Startup] 🔍 Looking for chart element for ${chartId}...`);
                
                let chartElement = null;
                
                // Strategy 1: Direct selector
                chartElement = document.querySelector(`[data-chart-id="${chartId}"] .recharts-wrapper`);
                if (chartElement) {
                  console.log(`[Dashboard Startup] ✅ Found chart element for ${chartId} using direct selector`);
                } else {
                  // Strategy 2: Find by chart card
                  const chartCard = document.querySelector(`[data-chart-id="${chartId}"]`);
                  if (chartCard) {
                    chartElement = chartCard.querySelector('.recharts-wrapper');
                    if (chartElement) {
                      console.log(`[Dashboard Startup] ✅ Found chart element for ${chartId} using chart card`);
                    }
                  }
                }
                
                // Strategy 3: Find by index (fallback)
                if (!chartElement) {
                  const allChartCards = document.querySelectorAll('[data-chart-id]');
                  console.log(`[Dashboard Startup] 🔍 Trying fallback - found ${allChartCards.length} chart cards total`);
                  if (allChartCards[i]) {
                    const cardId = allChartCards[i].getAttribute('data-chart-id');
                    console.log(`[Dashboard Startup] 🔍 Chart card at index ${i} has id: ${cardId}`);
                    chartElement = allChartCards[i].querySelector('.recharts-wrapper');
                    if (chartElement) {
                      console.log(`[Dashboard Startup] ✅ Found chart element for ${chartId} using index fallback`);
                    }
                  }
                }
                
                // Strategy 4: Try to find ANY recharts-wrapper if chartId matches
                if (!chartElement) {
                  const allWrappers = document.querySelectorAll('.recharts-wrapper');
                  console.log(`[Dashboard Startup] 🔍 Trying last resort - found ${allWrappers.length} recharts-wrapper elements`);
                  if (allWrappers[i]) {
                    chartElement = allWrappers[i];
                    console.log(`[Dashboard Startup] ✅ Found chart element for ${chartId} using wrapper index fallback`);
                  }
                }
                
                if (chartElement) {
                  // Capture chart image
                  // ⚠️ CRITICAL: Use scale: 0.5 to reduce image size and avoid rate limits
                  // This reduces the token count per image significantly (from ~115K to ~30K)
                  const canvas = await html2canvas(chartElement, {
                    backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
                    scale: 0.5, // Reduced from 1 to 0.5 to reduce image size and token count
                    logging: false,
                    useCORS: true
                  });
                  
                  const imageUrl = canvas.toDataURL('image/png');
                  console.log(`[Dashboard Startup] Chart ${chartId} image captured, size: ${imageUrl.length} chars`);
                  const topic = `${chart.title || chartId}`;
                  const chartData = chart.data || {};
                  
                  // 🔍 DEBUG: Log what we're sending
                  console.log(`[Dashboard Startup] Chart ${chartId} data structure:`, {
                    hasData: !!chart.data,
                    dataType: Array.isArray(chart.data) ? 'array' : typeof chart.data,
                    dataLength: Array.isArray(chart.data) ? chart.data.length : Object.keys(chart.data || {}).length,
                    dataPreview: Array.isArray(chart.data) 
                      ? chart.data.slice(0, 3) 
                      : Object.keys(chart.data || {}).slice(0, 5),
                    topic
                  });
                  
                  chartsForStartupFill.push({
                    chartId,
                    topic,
                    chartData,
                    imageUrl,
                    model: 'gpt-4o-mini' // Default model for OpenAI transcription
                  });
                  
                  console.log(`[Dashboard Startup] Prepared chart ${chartId} for OpenAI transcription`);
                } else {
                  console.warn(`[Dashboard Startup] Chart element not found for ${chartId}, skipping`);
                }
              } catch (err) {
                console.error(`[Dashboard Startup] Failed to prepare chart ${chartId}:`, err);
                // Continue with other charts even if one fails
              }
            }
            
            // Send all charts to OpenAI via startup-fill
            // ⚠️ CRITICAL: On first load, we ALWAYS call OpenAI (force=true) to ensure fresh transcriptions
            console.log(`[Dashboard Startup] 📊 Summary: Prepared ${chartsForStartupFill.length} charts out of ${dashboardData.charts.length} total charts`);
            
            if (chartsForStartupFill.length > 0) {
              console.log(`[Dashboard Startup] 📤 Sending ${chartsForStartupFill.length} charts to OpenAI via startup-fill (force=true for first load)...`);
              console.log(`[Dashboard Startup] Chart IDs being sent:`, chartsForStartupFill.map(c => c.chartId));
              
              try {
                // ⚠️ CRITICAL: Process each chart individually to ensure DB writes
                // Use new API contract: POST → DB → GET from DB
                console.log(`[Dashboard Startup] 🔄 Processing ${chartsForStartupFill.length} charts individually...`);
                
                for (let i = 0; i < chartsForStartupFill.length; i++) {
                  const chart = chartsForStartupFill[i];
                  try {
                    // POST: OpenAI → DB (UPSERT) → Returns saved row
                    await chartTranscriptionAPI.createOrUpdateTranscription(
                      chart.chartId,
                      chart.topic,
                      chart.chartData,
                      chart.imageUrl,
                      chart.model || 'gpt-4o-mini',
                      true // forceRecompute=true: always generate new transcription on first load
                    );
                    
                    // GET: Fetch from DB (DB is the single source of truth)
                    const { data } = await chartTranscriptionAPI.getTranscription(chart.chartId);
                    console.log(`[Dashboard Startup] ✅ Chart ${chart.chartId} saved and fetched from DB (${data.transcription_text?.length || 0} chars)`);
                    
                    // ⚠️ CRITICAL: Add delay between charts to prevent rate limits
                    // The backend also adds delays, so total delay is ~2-3 seconds between charts
                    if (i < chartsForStartupFill.length - 1) {
                      const delayMs = 800; // 0.8 seconds between charts (backend adds another 0.8s, total ~1.6s)
                      console.log(`[Dashboard Startup] ⏳ Waiting ${delayMs}ms before processing next chart (${i + 2}/${chartsForStartupFill.length})...`);
                      await new Promise(resolve => setTimeout(resolve, delayMs));
                    }
                  } catch (err) {
                    console.error(`[Dashboard Startup] ❌ Failed for chart ${chart.chartId}:`, err);
                    // Continue with other charts
                  }
                }
                
                console.log(`[Dashboard Startup] ✅ All charts processed and saved to DB`);
              } catch (err) {
                console.error(`[Dashboard Startup] ❌ CRITICAL: Failed to send charts to OpenAI:`, {
                  message: err.message,
                  response: err.response?.data,
                  status: err.response?.status,
                  stack: err.stack
                });
                // Don't fail the whole dashboard load if transcription creation fails
              }
            } else {
              console.error(`[Dashboard Startup] ❌ CRITICAL: No charts prepared for transcription!`);
              console.error(`[Dashboard Startup] This means chart elements were not found in DOM.`);
              console.error(`[Dashboard Startup] Total charts in data: ${dashboardData.charts.length}`);
              console.error(`[Dashboard Startup] Chart IDs in data:`, dashboardData.charts.map(c => c.id || 'no-id'));
              console.error(`[Dashboard Startup] ⚠️ This is why no POST requests are being made to startup-fill!`);
            }
          } catch (err) {
            console.error('[Dashboard Startup] Failed to process chart transcriptions:', err);
            // Don't fail the whole dashboard load if transcription creation fails
          }
        }, 3000); // Wait 3 seconds for charts to render
        }
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
                  // ⚠️ CRITICAL: After POST refresh, we MUST fetch from DB (GET) - never display POST response directly
                  // This ensures we always show what's in the DB, not the OpenAI response
                  await chartTranscriptionAPI.refreshTranscription(chartId, imageUrl, topic, chart.data || {}, true);
                  
                  // Wait a moment for DB to be updated
                  await new Promise(resolve => setTimeout(resolve, 500));
                  
                  // 🔄 CRITICAL: Always fetch from DB after POST refresh - never display POST response directly
                  // This ensures we always show what's in the DB (single source of truth)
                  // Note: The transcription will be displayed when Reports page loads it from DB
                  console.log(`[Dashboard Refresh] Chart ${chartId} transcription refreshed and saved to DB`);
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

