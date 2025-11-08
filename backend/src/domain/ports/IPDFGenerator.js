/**
 * PDF Generator Interface (Port)
 * Defines the contract for PDF generation
 */
export class IPDFGenerator {
  async generate(template, data) {
    throw new Error('generate() must be implemented');
  }
}

