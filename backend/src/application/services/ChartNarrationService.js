import OpenAI from 'openai';

if (!process.env.OPENAI_KEY) {
  console.warn('Warning: OPENAI_KEY not set. Chart narration will use mock mode.');
}

const MODEL_PRIMARY = 'gpt-4o';      // best quality
const MODEL_FAST = 'gpt-4o-mini';    // cheaper & faster

const SYSTEM_PROMPT = `You are an assistant that analyzes charts from images.
Return a short, readable description in English of what is seen in the chart.
Writing rules:
- Start with a short title (1 line).
- Then list 3–6 concise bullet points.
- Describe trends, peaks, lows, anomalies, and overall direction.
- Mention axis titles or labels if visible.
- If multiple series exist, compare them briefly.
- Do not invent numeric values—if values aren't readable, use approximate language (e.g., "around", "roughly").
- Output plain English text only — no JSON, no code.`;

export class ChartNarrationService {
  constructor() {
    const apiKey = process.env.OPENAI_KEY;
    this.useMock = !apiKey;
    
    if (!this.useMock) {
      this.client = new OpenAI({
        apiKey: apiKey
      });
    }
  }

  /**
   * Describe a chart image
   * @param {string} image - Either public URL ("https://...") or dataURL ("data:image/png;base64,...")
   * @param {Object} options - Options for narration
   * @param {string} options.context - Optional context about the chart
   * @param {string} options.model - Model to use (default: MODEL_PRIMARY)
   * @param {number} options.maxTokens - Maximum tokens (default: 400)
   * @returns {Promise<string>} Narration text
   */
  async describeChartImage(image, options = {}) {
    // Mock mode fallback
    if (this.useMock) {
      return this.generateMockNarration(options.context);
    }

    const model = options?.model || MODEL_PRIMARY;
    const maxTokens = options?.maxTokens || 400;
    const context = options?.context || '—';

    try {
      const response = await this.client.chat.completions.create({
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
                text: `Analyze the attached chart image and write a narration in English according to the above rules.
Context (optional): ${context}`
              },
              {
                type: 'image_url',
                image_url: {
                  url: image
                }
              }
            ]
          }
        ],
        max_tokens: maxTokens
      });

      const text = response.choices[0]?.message?.content || '';
      if (!text) {
        throw new Error('Empty response from OpenAI');
      }
      return text.trim();
    } catch (error) {
      console.error('OpenAI chart narration error:', error);
      // Fallback to mock on error
      return this.generateMockNarration(options.context);
    }
  }

  /**
   * Generate mock narration for development/testing
   */
  generateMockNarration(context) {
    const mockNarrations = [
      `Chart Analysis Overview\n• The chart displays a clear upward trend over the observed period\n• Peak values are observed around the mid-point of the timeline\n• The data shows consistent growth with minor fluctuations\n• Overall direction indicates positive progression\n• Multiple data series demonstrate similar patterns\n• The chart effectively visualizes the key metrics and trends`,
      `Performance Metrics Summary\n• Significant improvement visible in the latter half of the period\n• Initial values show steady baseline performance\n• Notable spike detected in the middle section\n• Overall trend suggests positive momentum\n• Data points are well-distributed across the range\n• The visualization clearly communicates the performance indicators`,
      `Trend Analysis Report\n• Gradual increase observed throughout the measurement period\n• Some volatility present in the early stages\n• Peak performance reached near the end of the timeline\n• Lower values at the beginning indicate starting point\n• Consistent upward trajectory with occasional dips\n• The chart provides clear insight into the data patterns`
    ];

    const baseNarration = mockNarrations[Math.floor(Math.random() * mockNarrations.length)];
    
    if (context && context !== '—') {
      return `${baseNarration}\n\nContext: ${context}`;
    }
    
    return baseNarration;
  }
}

export default new ChartNarrationService();

