/**
 * Transcription Service
 * Ensures transcriptions are created/updated and then fetched from DB
 * DB is the single source of truth - always read from DB after write
 */

import { chartTranscriptionAPI } from './api.js';

/**
 * Ensure transcription exists (create/update if needed, then fetch from DB)
 * @param {Object} chart - Chart object with { chartId, topic, chartData, imageUrl }
 * @returns {Promise<string>} Transcription text from DB
 */
export async function ensureTranscription(chart) {
  const { chartId, topic, chartData, imageUrl } = chart;
  
  if (!chartId || !imageUrl) {
    console.warn('[ensureTranscription] Missing chartId or imageUrl');
    return '';
  }
  
  try {
    // Create/update transcription (POST always performs OpenAI → DB → returns saved row)
    await chartTranscriptionAPI.createOrUpdateTranscription(
      chartId,
      topic,
      chartData,
      imageUrl,
      'gpt-4o-mini',
      false // forceRecompute=false: only create if missing or signature changed
    );
    
    // Fetch from DB (DB is the single source of truth)
    const { data } = await chartTranscriptionAPI.getTranscription(chartId);
    return data.transcription_text || '';
  } catch (err) {
    console.error(`[ensureTranscription] Error for ${chartId}:`, err);
    return '';
  }
}

/**
 * Refresh transcription (force new transcription, then fetch from DB)
 * @param {Object} chart - Chart object with { chartId, topic, chartData, imageUrl }
 * @returns {Promise<string>} Transcription text from DB
 */
export async function refreshTranscription(chart) {
  const { chartId, topic, chartData, imageUrl } = chart;
  
  if (!chartId || !imageUrl) {
    console.warn('[refreshTranscription] Missing chartId or imageUrl');
    return '';
  }
  
  try {
    // Force new transcription (POST with forceRecompute=true)
    await chartTranscriptionAPI.createOrUpdateTranscription(
      chartId,
      topic,
      chartData,
      imageUrl,
      'gpt-4o-mini',
      true // forceRecompute=true: always generate new transcription
    );
    
    // Fetch from DB (DB is the single source of truth)
    const { data } = await chartTranscriptionAPI.getTranscription(chartId);
    return data.transcription_text || '';
  } catch (err) {
    console.error(`[refreshTranscription] Error for ${chartId}:`, err);
    return '';
  }
}

