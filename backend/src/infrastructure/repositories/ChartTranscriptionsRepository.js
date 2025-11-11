import { createClient } from '@supabase/supabase-js';

let supabaseClient = null;

function getSupabaseClient() {
  if (!supabaseClient) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn('⚠️  Supabase credentials not set. Chart transcription caching disabled.');
      return null;
    }
    
    supabaseClient = createClient(supabaseUrl, supabaseKey);
  }
  
  return supabaseClient;
}

/**
 * Get cached transcription for a chart
 * @param {string} chartId - Unique chart identifier
 * @param {string} signature - Chart data hash signature
 * @returns {Promise<string|null>} Cached transcription text or null
 */
export async function getCachedTranscription(chartId, signature) {
  const client = getSupabaseClient();
  if (!client) {
    return null;
  }

  try {
    const { data, error } = await client
      .from('ai_chart_transcriptions')
      .select('transcription_text')
      .eq('chart_id', chartId)
      .eq('chart_signature', signature)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (error) {
      console.error('Supabase read error:', error.message);
      return null;
    }

    return data?.transcription_text ?? null;
  } catch (err) {
    console.error('Error fetching cached transcription:', err.message);
    return null;
  }
}

/**
 * Save transcription to cache
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
      .insert({
        chart_id: chartId,
        chart_signature: signature,
        model: model || 'gpt-4o',
        transcription_text: text
      });

    if (error) {
      console.error('Supabase insert error:', error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error saving transcription:', err.message);
    return false;
  }
}

