export class ChartData {
  constructor({
    id,
    title,
    type,
    data,
    description,
    metadata
  }) {
    this.id = id;
    this.title = title;
    this.type = type; // 'bar', 'line', 'pie', 'area'
    this.data = data || [];
    this.description = description;
    this.metadata = metadata || {};
  }

  addDataPoint(point) {
    this.data.push(point);
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      type: this.type,
      data: this.data,
      description: this.description,
      metadata: this.metadata
    };
  }
}

