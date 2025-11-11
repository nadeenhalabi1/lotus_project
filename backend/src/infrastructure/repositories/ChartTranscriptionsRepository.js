// ESM, no CommonJS
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn('[ChartTranscriptionsRepository] Missing SUPABASE_URL / SUPABASE_KEY envs');
}

export const supabase = SUPABASE_URL && SUPABASE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

function getSupabaseClient() {
  if (!supabase) {
    throw new Error('Supabase client not available - check SUPABASE_URL and SUPABASE_KEY');
  }
  return supabase;
}

/**
 * Compatibility: "cached" by chartId+signature (matches old import name)
 * Returns transcription text or null
 */
export async function getCachedTranscription(chartId, signature) {
  const client = getSupabaseClient();
  
  const { data, error } = await client
    .from('ai_chart_transcriptions')
    .select('transcription_text, chart_signature')
    .eq('chart_id', chartId)
    .eq('chart_signature', signature)
    .maybeSingle();

  if (error) {
    console.error('[getCachedTranscription] Supabase error:', error.message);
    return null;
  }
  return data?.transcription_text ?? null;
}

/**
 * Compatibility: "saveTranscription" upserts by chart_id (matches old import name)
 */
export async function saveTranscription(chartId, signature, model, text) {
  const client = getSupabaseClient();
  
  const { error } = await client
    .from('ai_chart_transcriptions')
    .upsert({
      chart_id: chartId,
      chart_signature: signature,
      model: model || 'gpt-4o',
      transcription_text: text
    }, { 
      onConflict: 'chart_id' 
    });

  if (error) {
    console.error('[saveTranscription] Supabase upsert error:', error.message);
    throw new Error(error.message);
  }
}

/* ---- Newer explicit APIs (also exported) ---- */

/**
 * Get by chart_id only (no signature)
 */
export async function getTranscriptionByChartId(chartId) {
  const client = getSupabaseClient();
  
  const { data, error } = await client
    .from('ai_chart_transcriptions')
    .select('chart_id, chart_signature, transcription_text, updated_at')
    .eq('chart_id', chartId)
    .maybeSingle();
    
  if (error) {
    throw new Error(error.message);
  }
  
  return data || null;
}

/**
 * Upsert transcription (overwrite by chart_id)
 * @param {Object} params - Transcription parameters
 * @param {string} params.chartId - Unique chart identifier
 * @param {string} params.signature - Chart data hash signature
 * @param {string} params.model - OpenAI model used (default: 'gpt-4o')
 * @param {string} params.text - Transcription text
 */
export async function upsertTranscription({ chartId, signature, model = 'gpt-4o', text }) {
  const client = getSupabaseClient();
  
  const { error } = await client
    .from('ai_chart_transcriptions')
    .upsert({
      chart_id: chartId,
      chart_signature: signature,
      model,
      transcription_text: text
    }, { 
      onConflict: 'chart_id' 
    });
    
  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Delete transcription by chart ID
 * @param {string} chartId - Unique chart identifier
 */
export async function deleteTranscriptionByChartId(chartId) {
  const client = getSupabaseClient();
  
  const { error } = await client
    .from('ai_chart_transcriptions')
    .delete()
    .eq('chart_id', chartId);
    
  if (error) {
    throw new Error(error.message);
  }
}

