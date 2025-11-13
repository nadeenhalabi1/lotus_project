import { useState, useEffect, useRef } from 'react';
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
  // Track if startup transcription has already run in this session
  // Use sessionStorage to persist across page navigations (but reset on browser close)
  const getStartupTranscriptionDone = () => {
    try {
      return sessionStorage.getItem('startupTranscriptionDone') === 'true';
    } catch {
      return false;
    }
  };
  
  const setStartupTranscriptionDone = (value) => {
    try {
      sessionStorage.setItem('startupTranscriptionDone', value ? 'true' : 'false');
    } catch {
      // Ignore if sessionStorage is not available
    }
  };
  
  const startupTranscriptionDoneRef = useRef(getStartupTranscriptionDone());

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
        
        // ⚠️ CRITICAL: On startup, send ALL charts (not just priority) to OpenAI for transcription
        // BUT: Only run startup transcription ONCE per session (not every time we navigate to dashboard)
        // This prevents unnecessary OpenAI calls when switching between Dashboard and Reports
        const isStartupDone = getStartupTranscriptionDone();
        if (!isStartupDone) {
          console.log(`[Dashboard] ✅ Dashboard loaded with ${dashboardData.charts?.length || 0} priority charts`);
          console.log(`[Dashboard] 🚀 Starting startup transcription flow for ALL charts (first time only)...`);
          
          // Mark as done immediately to prevent duplicate runs (persist in sessionStorage)
          setStartupTranscriptionDone(true);
          startupTranscriptionDoneRef.current = true;
          
          // Fetch ALL charts (priority + BOX + combined analytics) for transcription
          let allChartsForTranscription = [];
          try {
            const allChartsResponse = await dashboardAPI.getAllCharts();
            allChartsForTranscription = allChartsResponse.data?.charts || [];
            console.log(`[Dashboard Startup] 📊 Fetched ${allChartsForTranscription.length} total charts for transcription`);
            console.log(`[Dashboard Startup] Chart IDs:`, allChartsForTranscription.map(c => c.id));
          } catch (err) {
            console.error(`[Dashboard Startup] ❌ Failed to fetch all charts, falling back to dashboard charts:`, err);
            allChartsForTranscription = dashboardData.charts || [];
          }
          
          // Wait for charts to render, then capture and send to OpenAI
          const waitForChartsStartup = async (maxAttempts = 20, delayMs = 500) => {
            for (let attempt = 0; attempt < maxAttempts; attempt++) {
              const chartElements = document.querySelectorAll('[data-chart-id]');
              const rechartsElements = document.querySelectorAll('.recharts-wrapper');
              
              if (chartElements.length > 0 && rechartsElements.length > 0) {
                console.log(`[Dashboard Startup] ✅ Charts rendered after ${attempt * delayMs}ms`);
                console.log(`[Dashboard Startup] Found ${chartElements.length} chart cards and ${rechartsElements.length} recharts wrappers`);
                return true;
              }
              
              if (attempt < maxAttempts - 1) {
                console.log(`[Dashboard Startup] ⏳ Waiting for charts to render... (attempt ${attempt + 1}/${maxAttempts})`);
                await new Promise(resolve => setTimeout(resolve, delayMs));
              }
            }
            return false;
          };
          
          // Wait for charts to render, then proceed
          const chartsReady = await waitForChartsStartup(20, 500); // Wait up to 10 seconds
          
          if (!chartsReady) {
            console.error(`[Dashboard Startup] ❌ Charts did not render after 10 seconds, aborting startup transcription`);
            return;
          }
          
          // Additional delay to ensure Recharts is fully rendered
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Capture all chart images and send to startup endpoint
          if (allChartsForTranscription && allChartsForTranscription.length > 0) {
            (async () => {
              try {
                console.log(`[Dashboard Startup] ========================================`);
                console.log(`[Dashboard Startup] 🚀 STARTING STARTUP TRANSCRIPTION FLOW`);
                console.log(`[Dashboard Startup] Total charts to process: ${allChartsForTranscription.length}`);
                console.log(`[Dashboard Startup] Chart IDs:`, allChartsForTranscription.map(c => c.id));
                
                // Capture all chart images
                const chartsForStartup = [];
                for (let i = 0; i < allChartsForTranscription.length; i++) {
                  const chart = allChartsForTranscription[i];
                  const chartId = chart.id || `chart-${i}`;
                  
                  try {
                    // Find the chart element
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
                      console.log(`[Dashboard Startup] ✅ Found chart element for ${chartId}`);
                      // Capture chart image
                      const canvas = await html2canvas(chartElement, {
                        backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
                        scale: 0.5,
                        logging: false,
                        useCORS: true
                      });
                      
                      const imageUrl = canvas.toDataURL('image/png');
                      const context = `${chart.title || chartId}`;
                      
                      console.log(`[Dashboard Startup] ✅ Captured image for ${chartId}: ${imageUrl.length} chars, context: "${context}"`);
                      
                      chartsForStartup.push({
                        chartId,
                        imageUrl,
                        context
                      });
                    } else {
                      console.error(`[Dashboard Startup] ❌ Chart element NOT FOUND for ${chartId}`);
                    }
                  } catch (err) {
                    console.error(`[Dashboard Startup] ❌ Failed to capture chart ${chartId}:`, err);
                  }
                }
                
                console.log(`[Dashboard Startup] ========================================`);
                console.log(`[Dashboard Startup] 📊 CAPTURE SUMMARY:`);
                console.log(`[Dashboard Startup] Total charts to process: ${allChartsForTranscription.length}`);
                console.log(`[Dashboard Startup] Successfully captured: ${chartsForStartup.length}`);
                console.log(`[Dashboard Startup] Chart IDs captured:`, chartsForStartup.map(c => c.chartId));
                
                if (chartsForStartup.length > 0) {
                  console.log(`[Dashboard Startup] 📤 SENDING TO BACKEND: ${chartsForStartup.length} charts`);
                  console.log(`[Dashboard Startup] Calling /chart-transcription/startup endpoint...`);
                  
                  try {
                    const { data } = await chartTranscriptionAPI.startup(chartsForStartup);
                    
                    console.log(`[Dashboard Startup] ========================================`);
                    console.log(`[Dashboard Startup] 📥 BACKEND RESPONSE RECEIVED`);
                    console.log(`[Dashboard Startup] Full response:`, data);
                    
                    if (data.results) {
                      const created = data.results.filter(r => r.status === 'created').length;
                      const errors = data.results.filter(r => r.status === 'error').length;
                      const skipped = data.results.filter(r => r.status === 'skip-invalid').length;
                      console.log(`[Dashboard Startup] Results: ${created} created, ${errors} errors, ${skipped} skipped`);
                      
                      // Log each result
                      data.results.forEach(result => {
                        console.log(`[Dashboard Startup] Chart ${result.chartId}: ${result.status}${result.error ? ` (${result.error})` : ''}`);
                      });
                    }
                    
                    console.log(`[Dashboard Startup] ✅✅✅ STARTUP TRANSCRIPTION COMPLETED!`);
                    console.log(`[Dashboard Startup] ========================================`);
                  } catch (err) {
                    console.error(`[Dashboard Startup] ❌ Backend startup failed:`, err);
                  }
                } else {
                  console.error(`[Dashboard Startup] ❌❌❌ CRITICAL: NO CHARTS WERE CAPTURED!`);
                }
              } catch (err) {
                console.error(`[Dashboard Startup] ❌ Error in startup transcription flow:`, err);
              }
            })();
          }
        } else {
          const isDone = getStartupTranscriptionDone();
          console.log(`[Dashboard] ⏭️ Skipping startup transcription - already completed in this session (sessionStorage: ${isDone})`);
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

      // After data refresh, refresh ALL chart transcriptions (not just priority) with OpenAI
      // Fetch all charts from backend to ensure we capture everything
      console.log(`[Dashboard Refresh] 📊 Refreshing transcriptions for ALL charts...`);
      
      // Fetch ALL charts (priority + BOX + combined analytics) for transcription
      let allChartsForTranscription = [];
      try {
        const allChartsResponse = await dashboardAPI.getAllCharts();
        allChartsForTranscription = allChartsResponse.data?.charts || [];
        console.log(`[Dashboard Refresh] 📊 Fetched ${allChartsForTranscription.length} total charts for transcription`);
        console.log(`[Dashboard Refresh] Chart IDs:`, allChartsForTranscription.map(c => c.id));
      } catch (err) {
        console.error(`[Dashboard Refresh] ❌ Failed to fetch all charts, falling back to dashboard charts:`, err);
        allChartsForTranscription = dashboardData.charts || [];
      }
      
      // Wait for charts to render first - CRITICAL: Recharts needs time to render
      // Use longer delay and wait for actual chart elements to appear
      const waitForCharts = async (maxAttempts = 20, delayMs = 500) => {
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          const chartElements = document.querySelectorAll('[data-chart-id]');
          const rechartsElements = document.querySelectorAll('.recharts-wrapper');
          
          if (chartElements.length > 0 && rechartsElements.length > 0) {
            console.log(`[Dashboard Refresh] ✅ Charts rendered after ${attempt * delayMs}ms`);
            console.log(`[Dashboard Refresh] Found ${chartElements.length} chart cards and ${rechartsElements.length} recharts wrappers`);
            return true;
          }
          
          if (attempt < maxAttempts - 1) {
            console.log(`[Dashboard Refresh] ⏳ Waiting for charts to render... (attempt ${attempt + 1}/${maxAttempts})`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
          }
        }
        return false;
      };
      
      // Wait for charts to render, then proceed
      const chartsReady = await waitForCharts(20, 500); // Wait up to 10 seconds
      
      if (!chartsReady) {
        console.error(`[Dashboard Refresh] ❌ Charts did not render after 10 seconds, aborting capture`);
        return;
      }
      
      // Additional delay to ensure Recharts is fully rendered
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTimeout(async () => {
        if (allChartsForTranscription && allChartsForTranscription.length > 0) {
          try {
            console.log(`[Dashboard Refresh] ========================================`);
            console.log(`[Dashboard Refresh] 🚀 STARTING REFRESH FLOW`);
            console.log(`[Dashboard Refresh] Total charts to process: ${allChartsForTranscription.length}`);
            console.log(`[Dashboard Refresh] Chart IDs:`, allChartsForTranscription.map(c => c.id));
            console.log(`[Dashboard Refresh] DOM elements with [data-chart-id]:`, document.querySelectorAll('[data-chart-id]').length);
            console.log(`[Dashboard Refresh] DOM elements with .recharts-wrapper:`, document.querySelectorAll('.recharts-wrapper').length);
            
            // Capture all chart images
            const chartsForRefresh = [];
            for (let i = 0; i < allChartsForTranscription.length; i++) {
              const chart = allChartsForTranscription[i];
              const chartId = chart.id || `chart-${i}`;
              
              // ✅ STEP 4: LOG CHART ID CONSISTENCY
              if (!chart.id) {
                console.warn(`[Dashboard Refresh] ⚠️ Chart ${i} has no chart.id, falling back to "chart-${i}"`);
              }
              console.log(`[Dashboard Refresh] ========================================`);
              console.log(`[Dashboard Refresh] Processing chart ${i + 1}/${dashboardData.charts.length}`);
              console.log(`[Dashboard Refresh] chartId: "${chartId}"`);
              console.log(`[Dashboard Refresh] chart.id: "${chart.id}"`);
              console.log(`[Dashboard Refresh] chart.title: "${chart.title}"`);
              
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
                  console.log(`[Dashboard Refresh] ✅ Found chart element for ${chartId}`);
                  // Capture chart image
                  const canvas = await html2canvas(chartElement, {
                    backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
                    scale: 0.5, // Reduced scale to reduce image size and token count
                    logging: false,
                    useCORS: true
                  });
                  
                  const imageUrl = canvas.toDataURL('image/png');
                  const context = `${chart.title || chartId}`;
                  
                  console.log(`[Dashboard Refresh] ✅ Captured image for ${chartId}: ${imageUrl.length} chars, context: "${context}"`);
                  
                  chartsForRefresh.push({
                    chartId,
                    imageUrl,
                    context
                  });
                } else {
                  console.error(`[Dashboard Refresh] ❌ Chart element NOT FOUND for ${chartId}`);
                }
              } catch (err) {
                console.error(`[Dashboard Refresh] ❌ Failed to capture chart ${chartId}:`, err);
              }
            }
            
            console.log(`[Dashboard Refresh] ========================================`);
            console.log(`[Dashboard Refresh] 📊 CAPTURE SUMMARY:`);
            console.log(`[Dashboard Refresh] Total charts to process: ${allChartsForTranscription.length}`);
            console.log(`[Dashboard Refresh] Successfully captured: ${chartsForRefresh.length}`);
            console.log(`[Dashboard Refresh] Chart IDs captured:`, chartsForRefresh.map(c => c.chartId));
            
            // ✅ STEP 4: VERIFY ALL CAPTURED CHARTS HAVE STABLE IDs
            console.log(`[Dashboard Refresh] 🔍 VERIFYING CAPTURED CHART IDs:`);
            chartsForRefresh.forEach((chart, idx) => {
              console.log(`[Dashboard Refresh] Captured chart ${idx + 1}: chartId="${chart.chartId}", context="${chart.context}"`);
              if (!chart.chartId || chart.chartId.startsWith('chart-')) {
                console.warn(`[Dashboard Refresh] ⚠️ Chart ${idx + 1} has generic/missing chartId: "${chart.chartId}"`);
              }
            });
            
            // Call /refresh endpoint - processes charts sequentially, always overwrites
            if (chartsForRefresh.length > 0) {
              console.log(`[Dashboard Refresh] ========================================`);
              console.log(`[Dashboard Refresh] 📤 SENDING TO BACKEND: ${chartsForRefresh.length} charts`);
              console.log(`[Dashboard Refresh] Request body structure:`, {
                charts: chartsForRefresh.map(c => ({
                  chartId: c.chartId,
                  imageUrl: `${c.imageUrl.substring(0, 50)}... (${c.imageUrl.length} chars)`,
                  context: c.context
                }))
              });
              
              const { data } = await chartTranscriptionAPI.refresh(chartsForRefresh);
              
              console.log(`[Dashboard Refresh] ========================================`);
              console.log(`[Dashboard Refresh] 📥 BACKEND RESPONSE RECEIVED`);
              console.log(`[Dashboard Refresh] Full response:`, data);
              
              if (data.results) {
                const updated = data.results.filter(r => r.status === 'updated').length;
                const errors = data.results.filter(r => r.status === 'error').length;
                const skipped = data.results.filter(r => r.status === 'skip-invalid').length;
                console.log(`[Dashboard Refresh] Results: ${updated} updated, ${errors} errors, ${skipped} skipped`);
                
                // Log each result
                data.results.forEach(result => {
                  console.log(`[Dashboard Refresh] Chart ${result.chartId}: ${result.status}${result.error ? ` (${result.error})` : ''}`);
                });
              }
            } else {
              console.error(`[Dashboard Refresh] ❌❌❌ CRITICAL: NO CHARTS WERE CAPTURED!`);
              console.error(`[Dashboard Refresh] This means the refresh will NOT call the backend.`);
              console.error(`[Dashboard Refresh] Possible reasons:`);
              console.error(`[Dashboard Refresh] 1. Charts not rendered yet (increase setTimeout delay)`);
              console.error(`[Dashboard Refresh] 2. Chart elements don't have [data-chart-id] attribute`);
              console.error(`[Dashboard Refresh] 3. Charts don't have .recharts-wrapper class`);
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

