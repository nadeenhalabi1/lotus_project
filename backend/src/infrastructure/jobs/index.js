import { initializeDailyCollection, triggerManualCollection } from './DailyCollectionJob.js';

// Note: JWT token should be obtained from environment or auth service
// For now, using a placeholder - in production, this should be managed properly
const JWT_TOKEN = process.env.MICROSERVICE_JWT_TOKEN || 'test-token-for-local-development';

export const initializeJobs = async () => {
  console.log('Initializing scheduled jobs...');
  
  // Initialize daily collection job
  initializeDailyCollection(JWT_TOKEN);
  
  // ALWAYS load initial mock data (for MVP - both development and production)
  try {
    console.log('Loading initial mock data (MVP mode)...');
    // Wait a bit for cache repository singleton to initialize
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Triggering manual collection...');
    const results = await triggerManualCollection(JWT_TOKEN);
    
    if (results && results.successful && results.successful.length > 0) {
      console.log('✓ Initial mock data loaded successfully:', {
        successful: results.successful.length,
        failed: results.failed?.length || 0,
        services: results.successful.map(s => s.service).join(', ')
      });
      
      // Verify data was stored
      const { getCacheRepository } = await import('../repositories/CacheRepositorySingleton.js');
      const cacheRepo = getCacheRepository();
      const entries = await cacheRepo.getLatestEntries();
      console.log(`✓ Verified: ${entries.length} services have data in cache`);
    } else {
      console.warn('⚠ No data was loaded. Results:', JSON.stringify(results, null, 2));
    }
  } catch (error) {
    console.error('❌ Failed to load initial mock data:', error.message);
    console.error('Error stack:', error.stack);
  }
  
  console.log('All scheduled jobs initialized');
};
