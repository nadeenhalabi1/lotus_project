import { createHash } from 'crypto';

/**
 * Recursively sort object keys for stable hashing
 */
function sortKeys(obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return obj;
  }
  return Object.keys(obj).sort().reduce((acc, k) => {
    acc[k] = sortKeys(obj[k]);
    return acc;
  }, {});
}

/**
 * Compute stable hash signature for chart data
 * @param {string|undefined} topic - Chart topic/context
 * @param {any} chartData - Chart data or configuration object
 * @returns {string} SHA256 hash hex string
 */
export function computeChartSignature(topic, chartData) {
  const payload = { 
    topic: topic || '', 
    chartData: sortKeys(chartData || {}) 
  };
  const json = JSON.stringify(payload);
  return createHash('sha256').update(json).digest('hex');
}

/**
 * Back-compat alias (if some code calls buildChartSignature)
 */
export const buildChartSignature = computeChartSignature;

