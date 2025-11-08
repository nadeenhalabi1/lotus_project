import { RedisCacheRepository } from './RedisCacheRepository.js';

// Singleton instance to ensure all parts of the app use the same cache
let cacheRepositoryInstance = null;

export const getCacheRepository = () => {
  if (!cacheRepositoryInstance) {
    cacheRepositoryInstance = new RedisCacheRepository();
    console.log('✓ Created singleton CacheRepository instance');
  }
  return cacheRepositoryInstance;
};

export const resetCacheRepository = () => {
  cacheRepositoryInstance = null;
};

