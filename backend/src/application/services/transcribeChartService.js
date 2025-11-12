import OpenAI from 'openai';

if (!process.env.OPENAI_KEY) {
  console.warn('[transcribeChartService] Missing OPENAI_KEY');
}

const openai = process.env.OPENAI_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_KEY })
  : null;

// ⚠️ CRITICAL: Keep prompt minimal to reduce token usage
const SYSTEM_PROMPT = `Analyze chart image. Return brief description (title + 3-4 bullet points).`.trim();

/**
 * Transcribe chart image using OpenAI Vision API
 * @param {Object} params - Transcription parameters
 * @param {string} params.imageUrl - Chart image URL or data URL
 * @param {string} params.context - Optional context about the chart
 * @returns {Promise<string>} Transcription text
 */
/**
 * Retry with exponential backoff for 429 errors
 */
async function withRetry(fn, attempts = 3) {
  let delay = 2000; // Start with 2 seconds
  
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      const isRateLimit = err?.status === 429 || err?.message?.includes('rate_limit') || err?.message?.includes('429');
      
      if (isRateLimit && i < attempts - 1) {
        console.warn(`[transcribeChartImage] 429 Rate limit detected, retrying in ${delay}ms (attempt ${i + 1}/${attempts})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff: 2s, 4s, 8s
      } else {
        throw err;
      }
    }
  }
}

export async function transcribeChartImage({ imageUrl, context }) {
  if (!openai) {
    // Mock fallback for development
    return `Chart Analysis\n• This chart displays data trends\n• Key metrics are visible\n• Patterns indicate ${context || 'general performance'}\n• Further analysis recommended`;
  }

  // ⚠️ CRITICAL: Use gpt-4o-mini instead of gpt-4o to reduce token usage and cost
  // gpt-4o-mini has higher TPM limits and lower cost
  const model = 'gpt-4o-mini';
  
  // ⚠️ CRITICAL: Keep context minimal to reduce tokens
  const minimalContext = context ? context.substring(0, 50) : 'Chart analysis';

  try {
    // Wrap OpenAI call with retry logic
    const response = await withRetry(async () => {
      return await openai.chat.completions.create({
        model: model,
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Chart: ${minimalContext}`
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        max_tokens: 300 // Reduced from 400 to save tokens
      });
    }, 3);

    const text = response.choices[0]?.message?.content?.trim() || '';
    
    if (!text) {
      throw new Error('Empty transcription from OpenAI');
    }
    
    return text;
  } catch (error) {
    console.error('[transcribeChartImage] OpenAI error:', {
      message: error.message,
      status: error.status,
      code: error.code
    });
    // Fallback to mock
    return `Chart Analysis\n• This chart displays data trends\n• Key metrics are visible\n• Patterns indicate ${context || 'general performance'}\n• Further analysis recommended`;
  }
}

