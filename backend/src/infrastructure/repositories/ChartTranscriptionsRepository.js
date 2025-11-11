// ESM module (no CommonJS)
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn('[ChartTranscriptionsRepository] Missing SUPABASE_URL / SUPABASE_KEY envs');
}

export const supabase = SUPABASE_URL && SUPABASE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

/* ----------------- EXACT NAMES REQUIRED BY ROUTES ----------------- */

/**
 * Return transcription text cached by chartId+signature, or null
 * Compatibility: "cached" by chartId+signature (matches old import name)
 */
export async function getCachedTranscription(chartId, signature) {
  if (!supabase) {
    console.error('[getCachedTranscription] Supabase client not available');
    return null;
  }
  
  const { data, error } = await supabase
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
 * Upsert transcription by chartId (overwrite existing row)
 * Compatibility: "saveTranscription" upserts by chart_id (matches old import name)
 * Note: Accepts 4 separate parameters (chartId, signature, model, text) for compatibility
 */
export async function saveTranscription(chartId, signature, model, text) {
  if (!supabase) {
    throw new Error('Supabase client not available - check SUPABASE_URL and SUPABASE_KEY');
  }
  
  const { error } = await supabase
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

/* ----------------- COMPAT NAMES (newer APIs) ----------------- */

/**
 * Get by chart_id only (no signature)
 */
export async function getTranscriptionByChartId(chartId) {
  if (!supabase) {
    throw new Error('Supabase client not available - check SUPABASE_URL and SUPABASE_KEY');
  }
  
  const { data, error } = await supabase
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
 * Upsert explicit (newer API - accepts object)
 */
export async function upsertTranscription({ chartId, signature, model = 'gpt-4o', text }) {
  if (!supabase) {
    throw new Error('Supabase client not available - check SUPABASE_URL and SUPABASE_KEY');
  }
  
  const { error } = await supabase
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
 * Optional: delete by chart
 */
export async function deleteTranscriptionByChartId(chartId) {
  if (!supabase) {
    throw new Error('Supabase client not available - check SUPABASE_URL and SUPABASE_KEY');
  }
  
  const { error } = await supabase
    .from('ai_chart_transcriptions')
    .delete()
    .eq('chart_id', chartId);
    
  if (error) {
    throw new Error(error.message);
  }
}

