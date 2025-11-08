/**
 * AI Service Interface (Port)
 * Defines the contract for AI analysis
 */
export class IAIService {
  async analyze(data, reportType) {
    throw new Error('analyze() must be implemented');
  }
}

