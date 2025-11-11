import * as repo from '../src/infrastructure/repositories/ChartTranscriptionsRepository.js';
import * as util from '../src/utils/hash.js';

console.log('Repo exports:', Object.keys(repo));
console.log('Util exports:', Object.keys(util));

// Sanity checks
if (typeof repo.getCachedTranscription !== 'function') {
  throw new Error('Missing getCachedTranscription');
}
if (typeof repo.saveTranscription !== 'function') {
  throw new Error('Missing saveTranscription');
}
if (typeof repo.getTranscriptionRow !== 'function') {
  throw new Error('Missing getTranscriptionRow');
}
if (typeof repo.upsertTranscription !== 'function') {
  throw new Error('Missing upsertTranscription');
}
if (typeof util.computeChartSignature !== 'function') {
  throw new Error('Missing computeChartSignature');
}

console.log('✅ OK: named exports are present.');

