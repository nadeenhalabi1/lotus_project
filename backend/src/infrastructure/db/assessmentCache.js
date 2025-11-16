import { getPool, withRetry } from "./pool.js";

/**
 * Saves a snapshot from the Assessment microservice into the assessments_cache table.
 *
 * @param {Array<object>} dataArray - Array of objects returned from Assessment (parsed JSON).
 *
 * Each object in the array should contain:
 * user_id, course_id, exam_type, attempt_no, passing_grade, final_grade, passed
 */
export async function saveAssessmentSnapshot(dataArray) {
  if (!Array.isArray(dataArray)) {
    throw new Error("saveAssessmentSnapshot expected dataArray to be an array");
  }

  const pool = getPool();
  const client = await pool.connect();

  const now = new Date();
  const snapshotDate = now.toISOString().slice(0, 10); // YYYY-MM-DD

  try {
    await client.query("BEGIN");

    await withRetry(async () => {
      for (const row of dataArray) {
        await client.query(
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
            row.user_id ?? "unknown",
            row.course_id ?? "unknown",
            row.exam_type ?? "postcourse",
            row.attempt_no ?? 1,
            row.passing_grade ?? null,
            row.final_grade ?? null,
            row.passed ?? false,
            now
          ]
        );
      }
    }, 3);

    await client.query("COMMIT");
    console.log(
      `[Assessment Cache] ✅ Saved snapshot for ${snapshotDate} with ${dataArray.length} rows`
    );
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("[Assessment Cache] ❌ Error saving assessment snapshot to DB:", err.message);
    throw err;
  } finally {
    client.release();
  }
}
