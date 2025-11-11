import OpenAI from 'openai';

if (!process.env.OPENAI_KEY && !process.env.OPENAI_API_KEY) {
  console.warn('[transcribeChartService] Missing OPENAI_KEY or OPENAI_API_KEY');
}

const openai = (process.env.OPENAI_KEY || process.env.OPENAI_API_KEY)
  ? new OpenAI({ apiKey: process.env.OPENAI_KEY || process.env.OPENAI_API_KEY })
  : null;

const SYSTEM_PROMPT = `
You describe charts from images. Return a short, readable English description
(1 title + 3-6 bullet points). No code, no JSON, no invented numbers.
If values are unclear, use cautious terms (approximately/appears to).
`.trim();

/**
 * Transcribe chart image using OpenAI Vision API
 * @param {Object} params - Transcription parameters
 * @param {string} params.imageUrl - Chart image URL or data URL
 * @param {string} params.context - Optional context about the chart
 * @returns {Promise<string>} Transcription text
 */
export async function transcribeChartImage({ imageUrl, context }) {
  if (!openai) {
    // Mock fallback for development
    return `Chart Analysis\n• This chart displays data trends\n• Key metrics are visible\n• Patterns indicate ${context || 'general performance'}\n• Further analysis recommended`;
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
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
              text: `Analyze the chart image.\nContext: ${context || '—'}`
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
      max_tokens: 400
    });

    const text = response.choices[0]?.message?.content?.trim() || '';
    
    if (!text) {
      throw new Error('Empty transcription from OpenAI');
    }
    
    return text;
  } catch (error) {
    console.error('[transcribeChartImage] OpenAI error:', error.message);
    // Fallback to mock
    return `Chart Analysis\n• This chart displays data trends\n• Key metrics are visible\n• Patterns indicate ${context || 'general performance'}\n• Further analysis recommended`;
  }
}

