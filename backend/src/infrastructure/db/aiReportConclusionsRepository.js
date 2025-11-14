import { getPool } from './pool.js';

/**
 * Fetch AI report conclusions from the last 24 hours
 * @returns {Promise<Array>} Array of entries with report_name, generated_at, and conclusions
 */
export async function fetchAiReportConclusionsForLast24Hours() {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const now = new Date();
    const end = now;
    const start = new Date(end.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago

    const result = await client.query(
      `
      SELECT report_name, generated_at, conclusions
      FROM ai_report_conclusions
      WHERE generated_at >= $1
        AND generated_at < $2
      ORDER BY generated_at ASC
      `,
      [start, end]
    );

    // Map to the format expected by RAG
    return result.rows.map(row => ({
      report_name: row.report_name,
      generated_at: row.generated_at.toISOString(),
      conclusions: row.conclusions // jsonb -> JS object/array
    }));
  } finally {
    client.release();
  }
}

