/**
 * Redis Configuration Example
 * Copy this file and configure with your Redis connection details
 */

export const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
};

export const cacheConfig = {
  keyPrefix: 'mr:',
  defaultTTL: 5184000, // 60 days in seconds
  cleanupSchedule: '0 2 * * *', // Daily at 02:00 AM
};

