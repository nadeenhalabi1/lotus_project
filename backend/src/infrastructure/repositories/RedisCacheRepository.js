import { createClient } from 'redis';
import { ICacheRepository } from '../../domain/ports/ICacheRepository.js';
import { auditLogger } from '../services/AuditLogger.js';

export class RedisCacheRepository extends ICacheRepository {
  constructor() {
    super();
    // Check for mock mode - if REDIS_HOST is 'mock' or USE_MOCK_REDIS is 'true', use mock
    const redisHost = process.env.REDIS_HOST || '';
    const useMockRedis = process.env.USE_MOCK_REDIS || '';
    this.useMock = useMockRedis === 'true' || redisHost === 'mock' || redisHost === '';
    this.inMemoryCache = new Map(); // In-memory cache for mock mode
    this.connected = false;
    this.client = null;

    if (this.useMock) {
      // Mock mode - don't create Redis client at all
      console.log('✓ Using in-memory cache (mock mode) - Redis disabled');
      return;
    }

    // Real Redis connection setup (only if not in mock mode)
    try {
      this.client = createClient({
        url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
        password: process.env.REDIS_PASSWORD || undefined,
        ...(process.env.REDIS_TLS === 'true' && { socket: { tls: true } })
      });

      this.client.on('error', (err) => {
        console.error('Redis Client Error:', err);
        // Fallback to mock mode on error
        console.warn('Falling back to in-memory cache (mock mode)');
        this.useMock = true;
        this.client = null;
      });

      // Try to connect, but don't fail if Redis is not available
      this.client.connect().catch((err) => {
        console.warn('Redis connection failed, using in-memory cache (mock mode):', err.message);
        this.useMock = true;
        this.client = null;
      }).then(() => {
        if (this.client && this.client.isOpen) {
          this.connected = true;
          console.log('✓ Redis connected successfully');
        }
      });
    } catch (error) {
      console.warn('Failed to create Redis client, using in-memory cache (mock mode):', error.message);
      this.useMock = true;
      this.client = null;
    }
  }

  async get(key) {
    try {
      if (this.useMock || !this.connected) {
        // Mock mode - use in-memory cache
        const entry = this.inMemoryCache.get(key);
        if (!entry) {
          auditLogger.logCacheOperation('get', 'miss', { key, mode: 'mock' });
          return null;
        }
        
        // Check if entry has expired
        if (entry.expiresAt && Date.now() >= entry.expiresAt) {
          this.inMemoryCache.delete(key);
          auditLogger.logCacheOperation('get', 'miss', { key, mode: 'mock', reason: 'expired' });
          return null;
        }
        
        // Return the actual value (not the cache entry)
        return entry.value || entry; // Support both new format (entry.value) and old format (direct value)
      }

      const data = await this.client.get(key);
      const result = data ? JSON.parse(data) : null;
      
      if (!result) {
        auditLogger.logCacheOperation('get', 'miss', { key });
      }
      
      return result;
    } catch (error) {
      console.error(`Error getting key ${key}:`, error);
      // Fallback to mock cache
      if (!this.useMock) {
        this.useMock = true;
        return this.inMemoryCache.get(key) || null;
      }
      auditLogger.logCacheOperation('get', 'failure', { key, error: error.message });
      throw error;
    }
  }

  async set(key, value, ttl = 5184000) { // 60 days default
    try {
      if (this.useMock || !this.connected) {
        // Mock mode - use in-memory cache
        // Store value with timestamp for TTL tracking
        const cacheEntry = {
          value,
          expiresAt: ttl > 0 ? Date.now() + (Math.min(ttl, 86400) * 1000) : null // Max 24 hours for setTimeout
        };
        this.inMemoryCache.set(key, cacheEntry);
        console.log(`RedisCacheRepository.set - Stored key: ${key}`);
        console.log(`RedisCacheRepository.set - Value has data.metrics: ${!!value?.data?.metrics}`);
        console.log(`RedisCacheRepository.set - Metrics count: ${Object.keys(value?.data?.metrics || {}).length}`);
        
        // Only set timeout if TTL is reasonable (max 24 hours = 86400 seconds)
        if (ttl > 0 && ttl <= 86400) {
          setTimeout(() => {
            const entry = this.inMemoryCache.get(key);
            if (entry && entry.expiresAt && Date.now() >= entry.expiresAt) {
              this.inMemoryCache.delete(key);
              console.log(`RedisCacheRepository - TTL expired for key: ${key}`);
            }
          }, Math.min(ttl, 86400) * 1000);
        }
        auditLogger.logCacheOperation('set', 'success', { key, ttl, mode: 'mock' });
        return true;
      }

      const data = JSON.stringify(value);
      await this.client.setEx(key, ttl, data);
      auditLogger.logCacheOperation('set', 'success', { key, ttl });
      return true;
    } catch (error) {
      console.error(`Error setting key ${key}:`, error);
      // Fallback to mock cache
      if (!this.useMock) {
        this.useMock = true;
        this.inMemoryCache.set(key, value);
        auditLogger.logCacheOperation('set', 'success', { key, ttl, mode: 'mock-fallback' });
        return true;
      }
      auditLogger.logCacheOperation('set', 'failure', { key, error: error.message });
      throw error;
    }
  }

  async getMultiple(pattern) {
    try {
      if (this.useMock || !this.connected) {
        // Mock mode - filter in-memory cache by pattern
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        const results = [];
        const now = Date.now();
        for (const [key, entry] of this.inMemoryCache.entries()) {
          if (regex.test(key)) {
            // Check if entry has expired
            if (entry.expiresAt && now >= entry.expiresAt) {
              this.inMemoryCache.delete(key);
              continue;
            }
            // Return the actual value (not the cache entry)
            const value = entry.value || entry; // Support both formats
            results.push(value);
          }
        }
        return results;
      }

      const keys = await this.client.keys(pattern);
      if (keys.length === 0) return [];
      
      const values = await this.client.mGet(keys);
      return values
        .filter(v => v !== null)
        .map(v => JSON.parse(v));
    } catch (error) {
      console.error(`Error getting multiple keys ${pattern}:`, error);
      // Fallback to mock cache
      if (!this.useMock) {
        this.useMock = true;
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        const results = [];
        for (const [key, value] of this.inMemoryCache.entries()) {
          if (regex.test(key)) {
            results.push(value);
          }
        }
        return results;
      }
      throw error;
    }
  }

  async delete(key) {
    try {
      if (this.useMock || !this.connected) {
        this.inMemoryCache.delete(key);
        return true;
      }

      await this.client.del(key);
      return true;
    } catch (error) {
      console.error(`Error deleting key ${key}:`, error);
      if (!this.useMock) {
        this.useMock = true;
        this.inMemoryCache.delete(key);
        return true;
      }
      throw error;
    }
  }

  async exists(key) {
    try {
      if (this.useMock || !this.connected) {
        const entry = this.inMemoryCache.get(key);
        if (!entry) return false;
        // Check if expired
        if (entry.expiresAt && Date.now() >= entry.expiresAt) {
          this.inMemoryCache.delete(key);
          return false;
        }
        return true;
      }

      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Error checking existence of key ${key}:`, error);
      if (!this.useMock) {
        this.useMock = true;
        return this.inMemoryCache.has(key);
      }
      throw error;
    }
  }

  getServicePrefix(service) {
    const prefixes = {
      directory: 'dir',
      courseBuilder: 'cb',
      assessment: 'assess',
      contentStudio: 'cs',
      learningAnalytics: 'la'
    };
    return prefixes[service] || service;
  }

  async getLatestByService(service) {
    try {
      const prefix = this.getServicePrefix(service);
      const pattern = `mr:${prefix}:*:*`;

      if (this.useMock || !this.connected) {
        // Mock mode - search in-memory cache
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        const matches = [];
        const now = Date.now();
        console.log(`RedisCacheRepository.getLatestByService - Searching for pattern: ${pattern}`);
        console.log(`RedisCacheRepository.getLatestByService - Cache size: ${this.inMemoryCache.size}`);
        for (const [key, entry] of this.inMemoryCache.entries()) {
          if (regex.test(key)) {
            // Check if entry has expired
            if (entry.expiresAt && now >= entry.expiresAt) {
              this.inMemoryCache.delete(key);
              continue;
            }
            
            // Get the actual value (not the cache entry wrapper)
            const value = entry.value || entry; // Support both formats
            console.log(`RedisCacheRepository.getLatestByService - Found match: ${key}`);
            matches.push(value);
          }
        }
        if (!matches.length) {
          console.log(`RedisCacheRepository.getLatestByService - No matches found for ${service}`);
          return null;
        }

        matches.sort((a, b) => {
          const aDate = new Date(a?.metadata?.collected_at || 0).getTime();
          const bDate = new Date(b?.metadata?.collected_at || 0).getTime();
          return bDate - aDate;
        });

        const latest = matches[0];
        console.log(`RedisCacheRepository.getLatestByService - Returning latest for ${service}, has data.metrics: ${!!latest?.data?.metrics}`);
        return latest;
      }

      const keys = await this.client.keys(pattern);
      if (!keys.length) {
        return null;
      }

      const values = await this.client.mGet(keys);
      const parsed = values
        .filter(Boolean)
        .map((value) => {
          try {
            return JSON.parse(value);
          } catch (error) {
            return null;
          }
        })
        .filter(Boolean);

      if (!parsed.length) {
        return null;
      }

      parsed.sort((a, b) => {
        const aDate = new Date(a?.metadata?.collected_at || 0).getTime();
        const bDate = new Date(b?.metadata?.collected_at || 0).getTime();
        return bDate - aDate;
      });

      return parsed[0];
    } catch (error) {
      console.error(`Error getting latest entry for service ${service}:`, error);
      // Fallback to mock cache
      if (!this.useMock) {
        this.useMock = true;
        return this.getLatestByService(service);
      }
      throw error;
    }
  }

  async getLatestEntries() {
    const entries = [];
    const services = ['directory', 'courseBuilder', 'assessment', 'contentStudio', 'learningAnalytics'];
    for (const service of services) {
      const latest = await this.getLatestByService(service);
      if (latest) {
        // Ensure we're returning the actual data value, not the cache entry wrapper
        const data = latest.value || latest;
        entries.push({ service, data });
      }
    }
    return entries;
  }
}

