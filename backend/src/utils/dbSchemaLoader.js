import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cache the schema in memory to avoid re-reading on every request
let cachedSchema = null;
let schemaLoadError = null;

/**
 * Loads the database schema from migration.sql file.
 * Caches the result in memory after first load.
 * 
 * @returns {string} The full contents of migration.sql
 * @throws {Error} If the file cannot be read
 */
export function loadDbSchemaFromMigration() {
  // Return cached schema if available
  if (cachedSchema) {
    return cachedSchema;
  }

  // If we previously failed to load, throw the cached error
  if (schemaLoadError) {
    throw schemaLoadError;
  }

  try {
    // Try multiple possible paths for migration.sql
    // 1. From project root: DB/migration.sql
    // 2. From backend directory: backend/DB/migration.sql (Railway deployment)
    // 3. From current directory: DB/migration.sql
    
    const possiblePaths = [
      resolve(__dirname, '../../../DB/migration.sql'), // From backend/src/utils/ to DB/
      resolve(__dirname, '../../DB/migration.sql'),    // From backend/src/utils/ to backend/DB/
      resolve(process.cwd(), 'DB/migration.sql'),      // Current working dir
      resolve(process.cwd(), 'backend/DB/migration.sql') // backend/DB from root
    ];

    let migrationPath = null;
    for (const path of possiblePaths) {
      if (existsSync(path)) {
        migrationPath = path;
        console.log('[dbSchemaLoader] ✅ Found migration.sql at:', path);
        break;
      }
    }

    if (!migrationPath) {
      const error = new Error(`migration.sql file not found. Checked: ${possiblePaths.join(', ')}`);
      schemaLoadError = error;
      console.error('[dbSchemaLoader] ❌', error.message);
      throw error;
    }

    // Read the file
    const schema = readFileSync(migrationPath, 'utf-8');
    
    if (!schema || schema.trim().length === 0) {
      const error = new Error('migration.sql file is empty');
      schemaLoadError = error;
      throw error;
    }

    // Cache the schema
    cachedSchema = schema;
    console.log('[dbSchemaLoader] ✅ Schema loaded and cached, size:', schema.length, 'characters');
    
    return cachedSchema;
  } catch (error) {
    schemaLoadError = error;
    console.error('[dbSchemaLoader] ❌ Failed to load migration.sql:', error.message);
    throw error;
  }
}

/**
 * Clears the cached schema (useful for testing or reloading)
 */
export function clearSchemaCache() {
  cachedSchema = null;
  schemaLoadError = null;
}

