/**
 * Cache Repository Interface (Port)
 * Defines the contract for cache operations
 */
export class ICacheRepository {
  async get(key) {
    throw new Error('get() must be implemented');
  }

  async set(key, value, ttl) {
    throw new Error('set() must be implemented');
  }

  async getMultiple(pattern) {
    throw new Error('getMultiple() must be implemented');
  }

  async delete(key) {
    throw new Error('delete() must be implemented');
  }

  async exists(key) {
    throw new Error('exists() must be implemented');
  }
}

