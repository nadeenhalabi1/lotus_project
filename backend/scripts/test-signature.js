import { computeChartSignature } from '../src/utils/hash.js';

const sig = computeChartSignature('Test Report', { metric: 'activeUsers', range: '2025-10' });
console.log('✅ Signature function works!');
console.log('SIG=', sig);
console.log('Length:', sig.length, '(should be 64 for SHA256)');

