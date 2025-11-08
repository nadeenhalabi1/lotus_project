export class DataValidationService {
  validateRequiredFields(data, requiredFields) {
    const missing = requiredFields.filter(field => !data[field]);
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
    return true;
  }

  validateDataTypes(data, schema) {
    for (const [key, type] of Object.entries(schema)) {
      if (data[key] !== undefined) {
        const actualType = typeof data[key];
        if (actualType !== type) {
          throw new Error(`Invalid type for ${key}: expected ${type}, got ${actualType}`);
        }
      }
    }
    return true;
  }

  validate(data, schema) {
    // Validate required fields
    if (schema.required) {
      this.validateRequiredFields(data, schema.required);
    }

    // Validate data types
    if (schema.types) {
      this.validateDataTypes(data, schema.types);
    }

    return true;
  }
}

