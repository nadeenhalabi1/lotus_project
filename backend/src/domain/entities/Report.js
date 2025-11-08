export class Report {
  constructor({
    id,
    type,
    executiveSummary,
    charts,
    dataTable,
    aiInsights,
    generatedAt,
    metadata
  }) {
    this.id = id;
    this.type = type;
    this.executiveSummary = executiveSummary;
    this.charts = charts || [];
    this.dataTable = dataTable;
    this.aiInsights = aiInsights;
    this.generatedAt = generatedAt || new Date().toISOString();
    this.metadata = metadata || {};
  }

  addChart(chart) {
    this.charts.push(chart);
  }

  setAIInsights(insights) {
    this.aiInsights = insights;
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      executiveSummary: this.executiveSummary,
      charts: this.charts,
      dataTable: this.dataTable,
      aiInsights: this.aiInsights,
      generatedAt: this.generatedAt,
      metadata: this.metadata
    };
  }
}

