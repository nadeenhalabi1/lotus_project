import { MIGRATION_SCHEMA } from '../infrastructure/schema/migrationSchema.js';

// Cache the schema in memory to avoid re-reading on every request
let cachedSchema = null;

/**
 * Loads the database schema from the embedded migration schema.
 * Returns the embedded MIGRATION_SCHEMA constant.
 * 
 * @returns {string} The full contents of migration.sql (embedded)
 */
export function loadDbSchemaFromMigration() {
  // Return cached schema if available
  if (cachedSchema) {
    return cachedSchema;
  }

  // Use the embedded schema constant
  cachedSchema = MIGRATION_SCHEMA;
  console.log('[dbSchemaLoader] ✅ Schema loaded from embedded constant, size:', cachedSchema.length, 'characters');
  
  return cachedSchema;
}

/**
 * Clears the cached schema (useful for testing or reloading)
 */
export function clearSchemaCache() {
  cachedSchema = null;
}

