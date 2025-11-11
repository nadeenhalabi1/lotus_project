// ESM module — no CommonJS exports
import { createClient } from '@supabase/supabase-js';

// Read env only (do NOT hardcode)
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn('[ChartTranscriptionsRepository] Missing SUPABASE_URL / SUPABASE_KEY');
}

// Create Supabase client
const supabase = SUPABASE_URL && SUPABASE_KEY 
  ? createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

function getSupabaseClient() {
  if (!supabase) {
    throw new Error('Supabase client not available - check SUPABASE_URL and SUPABASE_KEY');
  }
  return supabase;
}

/**
 * Get transcription by chart ID (DB-first flow)
 * @param {string} chartId - Unique chart identifier
 * @returns {Promise<Object|null>} Transcription row or null
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
  
  return data; // or null
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

