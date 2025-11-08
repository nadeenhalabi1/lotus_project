export class DataNormalizationService {
  normalizeDate(date) {
    if (!date) return null;
    try {
      return new Date(date).toISOString();
    } catch (error) {
      throw new Error(`Invalid date format: ${date}`);
    }
  }

  normalizeScaling(value, type) {
    if (type === 'percentage') {
      return Math.min(100, Math.max(0, parseFloat(value) || 0));
    }
    if (type === 'grade') {
      return Math.min(100, Math.max(0, (parseFloat(value) || 0) * 10));
    }
    return parseFloat(value) || 0;
  }

  normalize(data, service) {
    // The input data structure is: { timestamp, data: { metrics: {...}, details: {...} }, metadata: {...} }
    // We need to preserve the metrics structure exactly as it is
    const inputData = data.data || {};
    const inputMetrics = inputData.metrics || data.metrics || {};
    
    const normalized = {
      timestamp: this.normalizeDate(data.timestamp || new Date()),
      data: {
        metrics: {}
      },
      metadata: {
        ...data.metadata,
        source: service,
        schema_version: '1.0',
        collected_at: new Date().toISOString()
      }
    };

    // Normalize metrics if present - preserve all metrics
    if (inputMetrics && typeof inputMetrics === 'object' && Object.keys(inputMetrics).length > 0) {
      for (const [key, value] of Object.entries(inputMetrics)) {
        if (typeof value === 'number') {
          if (key.includes('rate') || key.includes('percentage') || key.includes('Rate') || key.includes('Percentage')) {
            normalized.data.metrics[key] = this.normalizeScaling(value, 'percentage');
          } else if (key.includes('grade') || key.includes('rating') || key.includes('Rating')) {
            normalized.data.metrics[key] = this.normalizeScaling(value, 'grade');
          } else {
            normalized.data.metrics[key] = value;
          }
        } else if (typeof value === 'object' && !Array.isArray(value)) {
          // Preserve nested objects (like usersByRole, contentByType)
          normalized.data.metrics[key] = value;
        } else {
          // Preserve other types as-is
          normalized.data.metrics[key] = value;
        }
      }
    }

    // Preserve details if present
    if (inputData.details) {
      normalized.data.details = inputData.details;
    }

    console.log(`DataNormalizationService - Normalized ${service}:`, {
      metricsCount: Object.keys(normalized.data.metrics).length,
      sampleKeys: Object.keys(normalized.data.metrics).slice(0, 5)
    });

    return normalized;
  }
}

