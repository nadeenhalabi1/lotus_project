import { createHash } from 'crypto';

/**
 * Compute a stable hash signature for chart data
 * @param {string} topic - Chart topic/context
 * @param {any} chartData - Chart data or configuration object
 * @returns {string} SHA256 hash hex string
 */
export function computeChartSignature(topic, chartData) {
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
    .digest('hex')
    .substring(0, 64); // Ensure 64 chars (SHA256 produces 64 hex chars)
}

