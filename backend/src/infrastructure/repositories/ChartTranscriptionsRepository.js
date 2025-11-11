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
 * Get transcription row from DB (DB-first flow)
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
      console.error('Supabase read error:', error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Error fetching transcription row:', err.message);
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

