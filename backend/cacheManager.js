// Cache Management System for HR Management Reporting
// Handles data storage, retrieval, and cache tables

class CacheManager {
  constructor() {
    this.cacheTables = new Map();
    this.cacheMetadata = new Map();
    this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    this.MAX_CACHE_SIZE = 1000; // Maximum number of cache entries
  }

  // ========================================
  // CACHE TABLE MANAGEMENT
  // ========================================

  // Create a cache table for specific data type
  createCacheTable(tableName, dataType, description = '') {
    const table = {
      name: tableName,
      dataType: dataType,
      description: description,
      data: new Map(),
      metadata: {
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        accessCount: 0,
        hitRate: 0,
        totalHits: 0,
        totalMisses: 0
      }
    };

    this.cacheTables.set(tableName, table);
    this.cacheMetadata.set(tableName, {
      created: Date.now(),
      lastAccess: Date.now(),
      size: 0
    });

    console.log(`✅ Cache table '${tableName}' created for ${dataType}`);
    return table;
  }

  // Get cache table
  getCacheTable(tableName) {
    const table = this.cacheTables.get(tableName);
    if (table) {
      table.metadata.accessCount++;
      table.metadata.lastUpdated = new Date().toISOString();
      this.cacheMetadata.get(tableName).lastAccess = Date.now();
    }
    return table;
  }

  // Store processed data in cache table
  storeInCacheTable(tableName, key, data, filters = {}, sortBy = '', order = '') {
    const table = this.getCacheTable(tableName);
    if (!table) {
      console.error(`❌ Cache table '${tableName}' not found`);
      return false;
    }

    const cacheEntry = {
      key: key,
      data: data,
      filters: filters,
      sortBy: sortBy,
      order: order,
      timestamp: Date.now(),
      expiry: Date.now() + this.CACHE_DURATION,
      accessCount: 0,
      lastAccessed: Date.now()
    };

    table.data.set(key, cacheEntry);
    table.metadata.lastUpdated = new Date().toISOString();
    this.cacheMetadata.get(tableName).size = table.data.size;

    // Clean up if cache is too large
    if (table.data.size > this.MAX_CACHE_SIZE) {
      this.cleanupCacheTable(tableName);
    }

    return true;
  }

  // Retrieve data from cache table
  getFromCacheTable(tableName, key) {
    const table = this.getCacheTable(tableName);
    if (!table) {
      return null;
    }

    const entry = table.data.get(key);
    if (!entry) {
      table.metadata.totalMisses++;
      this.updateHitRate(tableName);
      return null;
    }

    // Check if entry is expired
    if (Date.now() > entry.expiry) {
      table.data.delete(key);
      table.metadata.totalMisses++;
      this.updateHitRate(tableName);
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    table.metadata.totalHits++;
    this.updateHitRate(tableName);

    return entry.data;
  }

  // ========================================
  // CACHE OPERATIONS
  // ========================================

  // Generate cache key
  generateCacheKey(operation, filters = {}, sortBy = '', order = '') {
    const filterStr = JSON.stringify(filters);
    return `${operation}_${Buffer.from(filterStr).toString('base64')}_${sortBy}_${order}`;
  }

  // Store data in cache
  storeData(tableName, operation, data, filters = {}, sortBy = '', order = '') {
    const key = this.generateCacheKey(operation, filters, sortBy, order);
    return this.storeInCacheTable(tableName, key, data, filters, sortBy, order);
  }

  // Retrieve data from cache
  getData(tableName, operation, filters = {}, sortBy = '', order = '') {
    const key = this.generateCacheKey(operation, filters, sortBy, order);
    return this.getFromCacheTable(tableName, key);
  }

  // ========================================
  // CACHE MAINTENANCE
  // ========================================

  // Clean up expired entries in a cache table
  cleanupCacheTable(tableName) {
    const table = this.cacheTables.get(tableName);
    if (!table) return;

    const now = Date.now();
    let removedCount = 0;

    for (const [key, entry] of table.data.entries()) {
      if (now > entry.expiry) {
        table.data.delete(key);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      console.log(`🧹 Cleaned up ${removedCount} expired entries from cache table '${tableName}'`);
      this.cacheMetadata.get(tableName).size = table.data.size;
    }
  }

  // Clean up all expired entries
  cleanupAllCacheTables() {
    let totalRemoved = 0;
    for (const tableName of this.cacheTables.keys()) {
      const beforeSize = this.cacheTables.get(tableName).data.size;
      this.cleanupCacheTable(tableName);
      const afterSize = this.cacheTables.get(tableName).data.size;
      totalRemoved += (beforeSize - afterSize);
    }
    
    if (totalRemoved > 0) {
      console.log(`🧹 Total expired entries removed: ${totalRemoved}`);
    }
  }

  // Remove least recently used entries
  removeLRUEntries(tableName, count = 10) {
    const table = this.cacheTables.get(tableName);
    if (!table) return;

    const entries = Array.from(table.data.entries());
    entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);

    for (let i = 0; i < Math.min(count, entries.length); i++) {
      table.data.delete(entries[i][0]);
    }

    console.log(`🗑️ Removed ${Math.min(count, entries.length)} LRU entries from '${tableName}'`);
    this.cacheMetadata.get(tableName).size = table.data.size;
  }

  // ========================================
  // CACHE STATISTICS
  // ========================================

  // Update hit rate for a cache table
  updateHitRate(tableName) {
    const table = this.cacheTables.get(tableName);
    if (!table) return;

    const total = table.metadata.totalHits + table.metadata.totalMisses;
    table.metadata.hitRate = total > 0 ? (table.metadata.totalHits / total) * 100 : 0;
  }

  // Get cache statistics
  getCacheStats() {
    const stats = {
      totalTables: this.cacheTables.size,
      totalEntries: 0,
      tables: {}
    };

    for (const [tableName, table] of this.cacheTables.entries()) {
      const metadata = this.cacheMetadata.get(tableName);
      stats.totalEntries += table.data.size;
      
      stats.tables[tableName] = {
        dataType: table.dataType,
        description: table.description,
        entries: table.data.size,
        hitRate: table.metadata.hitRate.toFixed(2) + '%',
        totalHits: table.metadata.totalHits,
        totalMisses: table.metadata.totalMisses,
        accessCount: table.metadata.accessCount,
        createdAt: table.metadata.createdAt,
        lastUpdated: table.metadata.lastUpdated,
        memoryUsage: this.estimateMemoryUsage(table.data)
      };
    }

    return stats;
  }

  // Estimate memory usage of cache data
  estimateMemoryUsage(dataMap) {
    let size = 0;
    for (const [key, value] of dataMap.entries()) {
      size += JSON.stringify(key).length;
      size += JSON.stringify(value).length;
    }
    return `${Math.round(size / 1024)} KB`;
  }

  // ========================================
  // CACHE TABLE INITIALIZATION
  // ========================================

  // Initialize all cache tables
  initializeCacheTables() {
    console.log('🚀 Initializing cache tables...');

    // DIRECTORY cache tables
    this.createCacheTable('users_cache', 'users', 'Filtered and sorted user data');
    this.createCacheTable('organizations_cache', 'organizations', 'Organization data with metrics');
    this.createCacheTable('teams_cache', 'teams', 'Team data with member counts');

    // COURSE BUILDER cache tables
    this.createCacheTable('courses_cache', 'courses', 'Course data with completion rates');
    this.createCacheTable('enrollments_cache', 'enrollments', 'User enrollment data');
    this.createCacheTable('lessons_cache', 'lessons', 'Lesson completion data');

    // ASSESSMENT cache tables
    this.createCacheTable('tests_cache', 'tests', 'Test data with scores and attempts');
    this.createCacheTable('attempts_cache', 'attempts', 'User test attempts');
    this.createCacheTable('feedback_cache', 'feedback', 'Assessment feedback data');

    // LEARNER AI cache tables
    this.createCacheTable('skills_cache', 'skills', 'Acquired skills data');
    this.createCacheTable('skill_progress_cache', 'skill_progress', 'Skill progression tracking');

    // DEVLAB cache tables
    this.createCacheTable('exercises_cache', 'exercises', 'Exercise participation data');
    this.createCacheTable('participations_cache', 'participations', 'User exercise participations');

    // LEARNING ANALYTICS cache tables
    this.createCacheTable('performance_trends_cache', 'performance_trends', 'Performance trend data');
    this.createCacheTable('skill_gaps_cache', 'skill_gaps', 'Identified skill gaps');
    this.createCacheTable('course_effectiveness_cache', 'course_effectiveness', 'Course effectiveness metrics');
    this.createCacheTable('forecasts_cache', 'forecasts', 'Strategic forecasts and predictions');

    // AGGREGATED cache tables
    this.createCacheTable('admin_dashboard_cache', 'admin_dashboard', 'Cross-organizational dashboard data');
    this.createCacheTable('hr_dashboard_cache', 'hr_dashboard', 'Organization-specific HR dashboard data');

    console.log(`✅ Initialized ${this.cacheTables.size} cache tables`);
  }

  // ========================================
  // CACHE TABLE OPERATIONS
  // ========================================

  // Clear specific cache table
  clearCacheTable(tableName) {
    const table = this.cacheTables.get(tableName);
    if (table) {
      table.data.clear();
      table.metadata.lastUpdated = new Date().toISOString();
      this.cacheMetadata.get(tableName).size = 0;
      console.log(`🗑️ Cleared cache table '${tableName}'`);
    }
  }

  // Clear all cache tables
  clearAllCacheTables() {
    for (const tableName of this.cacheTables.keys()) {
      this.clearCacheTable(tableName);
    }
    console.log('🗑️ Cleared all cache tables');
  }

  // Get cache table names
  getCacheTableNames() {
    return Array.from(this.cacheTables.keys());
  }

  // Check if cache table exists
  hasCacheTable(tableName) {
    return this.cacheTables.has(tableName);
  }

  // ========================================
  // CACHE WARMING
  // ========================================

  // Warm up cache with common queries
  warmUpCache(dataProcessor, mockData) {
    console.log('🔥 Warming up cache with common queries...');

    // Common user queries
    this.storeData('users_cache', 'active_users', 
      dataProcessor.processData('users', mockData.directory.users, { status: 'active' }));
    
    this.storeData('users_cache', 'users_by_org', 
      dataProcessor.processData('users', mockData.directory.users, {}, 'lastName', 'asc'));

    // Common course queries
    this.storeData('courses_cache', 'active_courses', 
      dataProcessor.processData('courses', mockData.courseBuilder.courses, { status: 'active' }));
    
    this.storeData('courses_cache', 'courses_by_completion', 
      dataProcessor.processData('courses', mockData.courseBuilder.courses, {}, 'completionRate', 'desc'));

    // Common skill queries
    this.storeData('skills_cache', 'recent_skills', 
      dataProcessor.processData('skills', mockData.learnerAI.skillsAcquired, {}, 'acquiredAt', 'desc'));

    // Common exercise queries
    this.storeData('exercises_cache', 'popular_exercises', 
      dataProcessor.processData('exercises', mockData.devLab.exercises, {}, 'participationCount', 'desc'));

    // Common analytics queries
    this.storeData('performance_trends_cache', 'increasing_trends', 
      dataProcessor.processData('performanceTrends', mockData.learningAnalytics.performanceTrends, { trend: 'increasing' }));

    console.log('✅ Cache warming completed');
  }

  // ========================================
  // CACHE MONITORING
  // ========================================

  // Start cache monitoring
  startCacheMonitoring(intervalMs = 60000) {
    setInterval(() => {
      this.cleanupAllCacheTables();
      this.logCacheStats();
    }, intervalMs);
    
    console.log(`📊 Cache monitoring started (interval: ${intervalMs}ms)`);
  }

  // Log cache statistics
  logCacheStats() {
    const stats = this.getCacheStats();
    console.log(`📊 Cache Stats: ${stats.totalTables} tables, ${stats.totalEntries} entries`);
    
    for (const [tableName, tableStats] of Object.entries(stats.tables)) {
      if (tableStats.entries > 0) {
        console.log(`   ${tableName}: ${tableStats.entries} entries, ${tableStats.hitRate} hit rate`);
      }
    }
  }
}

// Export the CacheManager class
module.exports = CacheManager;
