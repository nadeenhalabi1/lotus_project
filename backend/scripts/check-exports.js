import * as repo from '../src/infrastructure/repositories/ChartTranscriptionsRepository.js';

console.log('Repo exports:', Object.keys(repo));

// Sanity checks - compatibility exports
if (typeof repo.getCachedTranscription !== 'function') {
  throw new Error('Missing getCachedTranscription');
}
if (typeof repo.saveTranscription !== 'function') {
  throw new Error('Missing saveTranscription');
}

// Newer explicit APIs
if (typeof repo.getTranscriptionByChartId !== 'function') {
  throw new Error('Missing getTranscriptionByChartId');
}
if (typeof repo.upsertTranscription !== 'function') {
  throw new Error('Missing upsertTranscription');
}

console.log('✅ OK: named exports present.');

