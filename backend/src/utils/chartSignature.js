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
 * NOTE: Signature is computed ONLY from chartData, NOT from topic.
 * This ensures that the same chart with the same data has the same signature
 * regardless of which report it appears in (topic may vary between reports).
 * 
 * @param {string|undefined} topic - Chart topic/context (used for OpenAI context, NOT for signature)
 * @param {any} chartData - Chart data (can be array, object, or any structure)
 * @returns {string} SHA256 hash hex string
 */
export function computeChartSignature(topic, chartData) {
  // Only use chartData for signature - topic is just for OpenAI context
  // This ensures same chart with same data has same signature across different reports
  
  // Handle different chartData types:
  // - Array: sort and stringify
  // - Object: sort keys recursively
  // - Other: convert to string
  let payload;
  if (Array.isArray(chartData)) {
    // For arrays, sort by a stable key (e.g., 'name' if exists) and stringify
    const sorted = [...chartData].sort((a, b) => {
      if (a.name && b.name) return a.name.localeCompare(b.name);
      return JSON.stringify(a).localeCompare(JSON.stringify(b));
    });
    payload = sorted;
  } else if (chartData && typeof chartData === 'object') {
    payload = sortKeys(chartData);
  } else {
    payload = chartData;
  }
  
  const json = JSON.stringify(payload);
  return createHash('sha256').update(json).digest('hex');
}

/**
 * Back-compat alias (if some code calls buildChartSignature)
 */
export const buildChartSignature = computeChartSignature;

