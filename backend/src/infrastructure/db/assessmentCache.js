import { getPool, withRetry } from './pool.js';

/**
 * שמירה של snapshot ממיקרוסרביס Assessment אל טבלת assessments_cache.
 *
 * @param {object} data - האובייקט שחזר מ-Assessment (parsed JSON)
 *
 * מצופה שיהיו בו השדות:
 * user_id, course_id, exam_type, attempt_no, passing_grade, final_grade, passed
 */
export async function saveAssessmentSnapshot(data) {
  const pool = getPool();
  const client = await pool.connect();

  const now = new Date();
  const snapshotDate = now.toISOString().slice(0, 10); // YYYY-MM-DD

  try {
    await client.query("BEGIN");

    await withRetry(async () => {
      return await client.query(
        `
        INSERT INTO assessments_cache (
          snapshot_date,
          user_id,
          course_id,
          exam_type,
          attempt_no,
          passing_grade,
          final_grade,
          passed,
          ingested_at
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        ON CONFLICT (snapshot_date, user_id, course_id, exam_type, attempt_no)
        DO UPDATE SET
          passing_grade = EXCLUDED.passing_grade,
          final_grade = EXCLUDED.final_grade,
          passed = EXCLUDED.passed,
          ingested_at = EXCLUDED.ingested_at
        `,
        [
          snapshotDate,
          data.user_id ?? "unknown",
          data.course_id ?? "unknown",
          data.exam_type ?? "postcourse",
          data.attempt_no ?? 1,
          data.passing_grade ?? null,
          data.final_grade ?? null,
          data.passed ?? false,
          now
        ]
      );
    }, 3);

    await client.query("COMMIT");
    console.log(`[Assessment Cache] ✅ Saved snapshot for ${snapshotDate}`);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("[Assessment Cache] ❌ Error saving assessment snapshot to DB:", err.message);
    throw err;
  } finally {
    client.release();
  }
}

