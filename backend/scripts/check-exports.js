import * as Repo from '../src/infrastructure/repositories/ChartTranscriptionsRepository.js';

console.log('Repo exports:', Object.keys(Repo));

// Required exports (used by routes)
if (typeof Repo.getCachedTranscription !== 'function') {
  throw new Error('Missing getCachedTranscription');
}
if (typeof Repo.saveTranscription !== 'function') {
  throw new Error('Missing saveTranscription');
}

// Compat exports (newer APIs)
if (typeof Repo.getTranscriptionByChartId !== 'function') {
  throw new Error('Missing getTranscriptionByChartId');
}
if (typeof Repo.upsertTranscription !== 'function') {
  throw new Error('Missing upsertTranscription');
}

console.log('✅ OK: named exports present.');

