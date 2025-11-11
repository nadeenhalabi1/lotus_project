import { createHash } from 'crypto';

/**
 * Build a stable hash signature for chart data (DB-first flow)
 * @param {string} topic - Chart topic/context
 * @param {any} chartData - Chart data or configuration object
 * @returns {string} SHA256 hash hex string
 */
export function buildChartSignature(topic, chartData) {
  // Normalize the data by sorting keys for consistent hashing
  const normalized = JSON.stringify(
    { 
      topic: topic || '', 
      chartData: chartData || {} 
    },
    Object.keys(chartData || {}).sort()
  );
  
  return createHash('sha256')
    .update(normalized)
    .digest('hex');
}

