// Singleton PostgreSQL Pool
import pkg from 'pg';
const { Pool } = pkg;

let pool = null;

/**
 * Get singleton database pool
 * Creates pool on first call, reuses on subsequent calls
 */
export function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL not available');
  }
  
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }, // Required for Railway/Supabase/Neon
      max: Number(process.env.PG_POOL_MAX || 10), // 5-10 is typical
      idleTimeoutMillis: Number(process.env.PG_IDLE_TIMEOUT || 30000), // 30s
      connectionTimeoutMillis: Number(process.env.PG_CONN_TIMEOUT || 10000), // 10s
      keepAlive: true,
    });
    
    pool.on('error', (err) => {
      console.error('[DB Pool] Unexpected idle error:', err);
    });
    
    console.log('[DB Pool] Singleton pool created');
  }
  
  return pool;
}

/**
 * Health check - test DB connection
 */
export async function healthCheck() {
  try {
    const pool = getPool();
    await pool.query('SELECT 1');
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Retry with exponential backoff for transient errors
 */
export async function withRetry(fn, attempts = 3) {
  let i = 0;
  let delay = 300;
  
  while (true) {
    try {
      return await fn();
    } catch (err) {
      i++;
      const msg = err?.message || '';
      const transient = /timeout|ECONNRESET|ETIMEDOUT|terminat|connection/i.test(msg);
      
      if (!transient || i >= attempts) {
        throw err;
      }
      
      console.warn(`[DB Retry] Attempt ${i}/${attempts} failed, retrying in ${delay}ms...`, msg);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }
}

