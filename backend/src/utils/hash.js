import { createHash } from 'crypto';

/**
 * Canonical JSON stringify (sorted keys) for stable hashing
 */
function canonical(obj) {
  if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
    const sorted = Object.keys(obj).sort()
      .reduce((acc, k) => {
        acc[k] = obj[k];
        return acc;
      }, {});
    return JSON.stringify(sorted);
  }
  return JSON.stringify(obj);
}

/**
 * Preferred API used across the app:
 * computeChartSignature(topic, chartData)
 * 
 * @param {string|undefined} topic - Chart topic/context
 * @param {any} chartData - Chart data or configuration object (stable JSON - NOT the image)
 * @returns {string} SHA256 hash hex string
 */
export function computeChartSignature(topic, chartData) {
  const base = { 
    topic: topic || '', 
    chartData: chartData || {} 
  };
  return createHash('sha256')
    .update(canonical(base))
    .digest('hex');
}

/**
 * Back-compat alias (if some code calls buildChartSignature)
 */
export const buildChartSignature = computeChartSignature;

