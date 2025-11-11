// ESM module — no CommonJS exports
import { createClient } from '@supabase/supabase-js';

// Read env only (do NOT hardcode)
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn('[ChartTranscriptionsRepository] Missing SUPABASE_URL / SUPABASE_KEY');
}

// Create Supabase client (exported for direct access if needed)
export const supabase = SUPABASE_URL && SUPABASE_KEY 
  ? createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

function getSupabaseClient() {
  if (!supabase) {
    console.warn('[ChartTranscriptionsRepository] Supabase client not available');
    return null;
  }
  return supabase;
}

/**
 * Return transcription text if exists and not expired (for openai.js route)
 * @param {string} chartId - Unique chart identifier
 * @param {string} signature - Chart data hash signature
 * @returns {Promise<string|null>} Transcription text or null
 */
export async function getCachedTranscription(chartId, signature) {
  const client = getSupabaseClient();
  if (!client) {
    return null;
  }

  try {
    const { data, error } = await client
      .from('ai_chart_transcriptions')
      .select('transcription_text, expires_at, chart_signature')
      .eq('chart_id', chartId)
      .eq('chart_signature', signature)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (error) {
      console.error('[getCachedTranscription] Supabase error:', error.message);
      return null;
    }
    return data?.transcription_text ?? null;
  } catch (err) {
    console.error('[getCachedTranscription] Error:', err.message);
    return null;
  }
}

/**
 * Upsert transcription (overwrite by chart_id) - for openai.js route
 * @param {string} chartId - Unique chart identifier
 * @param {string} signature - Chart data hash signature
 * @param {string} model - OpenAI model used
 * @param {string} text - Transcription text
 * @returns {Promise<boolean>} Success status
 */
export async function saveTranscription(chartId, signature, model, text) {
  const client = getSupabaseClient();
  if (!client) {
    return false;
  }

  try {
    const { error } = await client
      .from('ai_chart_transcriptions')
      .upsert({
        chart_id: chartId,
        chart_signature: signature,
        model: model || 'gpt-4o',
        transcription_text: text,
        expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60).toISOString() // +60 days
      }, { 
        onConflict: 'chart_id' 
      });

    if (error) {
      console.error('[saveTranscription] Supabase error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[saveTranscription] Error:', err.message);
    return false;
  }
}

/**
 * Get transcription row from DB (DB-first flow) - for chartTranscription.js route
 * @param {string} chartId - Unique chart identifier
 * @returns {Promise<Object|null>} Transcription row or null
 */
export async function getTranscriptionRow(chartId) {
  const client = getSupabaseClient();
  if (!client) {
    return null;
  }

  try {
    const { data, error } = await client
      .from('ai_chart_transcriptions')
      .select('chart_id, chart_signature, transcription_text, updated_at, expires_at')
      .eq('chart_id', chartId)
      .maybeSingle();

    if (error) {
      console.error('[getTranscriptionRow] Supabase error:', error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.error('[getTranscriptionRow] Error:', err.message);
    return null;
  }
}

/**
 * Upsert transcription (DB-first flow - overwrites existing row)
 * @param {Object} params - Transcription parameters
 * @param {string} params.chartId - Unique chart identifier
 * @param {string} params.signature - Chart data hash signature
 * @param {string} params.model - OpenAI model used
 * @param {string} params.text - Transcription text
 * @returns {Promise<boolean>} Success status
 */
export async function upsertTranscription(params) {
  const client = getSupabaseClient();
  if (!client) {
    return false;
  }

  try {
    // Calculate expires_at (60 days from now)
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 60).toISOString();

    const { error } = await client
      .from('ai_chart_transcriptions')
      .upsert({
        chart_id: params.chartId,
        chart_signature: params.signature,
        model: params.model || 'gpt-4o',
        transcription_text: params.text,
        expires_at: expiresAt
      }, { 
        onConflict: 'chart_id' 
      });

    if (error) {
      console.error('Supabase upsert error:', error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error upserting transcription:', err.message);
    return false;
  }
}

