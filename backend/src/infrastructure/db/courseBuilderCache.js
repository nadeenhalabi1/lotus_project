import { getPool, withRetry } from './pool.js';

/**
 * שמירה של snapshot ממיקרוסרביס Course Builder אל טבלת course_builder_cache.
 *
 * @param {Array<object>} courses - מערך קורסים כפי שחזרו מ-Course Builder
 *
 * לכל קורס מצופה שיהיו:
 * course_id, course_name, totalEnrollments, activeEnrollment,
 * completionRate, averageRating, createdAt, feedback
 */
export async function saveCourseBuilderSnapshots(courses) {
  if (!Array.isArray(courses)) {
    console.error("saveCourseBuilderSnapshots expected an array, got:", typeof courses);
    return;
  }

  const pool = getPool();
  const client = await pool.connect();

  const now = new Date();
  const snapshotDate = now.toISOString().slice(0, 10); // YYYY-MM-DD

  try {
    await client.query("BEGIN");

    for (const course of courses) {
      await withRetry(async () => {
        return await client.query(
          `
          INSERT INTO course_builder_cache (
            snapshot_date,
            course_id,
            course_name,
            "totalEnrollments",
            "activeEnrollment",
            "completionRate",
            "averageRating",
            "createdAt",
            feedback,
            ingested_at
          )
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
          ON CONFLICT (snapshot_date, course_id)
          DO UPDATE SET
            course_name = EXCLUDED.course_name,
            "totalEnrollments" = EXCLUDED."totalEnrollments",
            "activeEnrollment" = EXCLUDED."activeEnrollment",
            "completionRate" = EXCLUDED."completionRate",
            "averageRating" = EXCLUDED."averageRating",
            "createdAt" = EXCLUDED."createdAt",
            feedback = EXCLUDED.feedback,
            ingested_at = EXCLUDED.ingested_at
          `,
          [
            snapshotDate,
            course.course_id ?? "unknown",
            course.course_name ?? "Unknown Course",
            course.totalEnrollments ?? 0,
            course.activeEnrollment ?? 0,
            course.completionRate ?? 0,
            course.averageRating ?? 0,
            course.createdAt ? new Date(course.createdAt) : null,
            course.feedback ?? null,
            now
          ]
        );
      }, 3);
    }

    await client.query("COMMIT");
    console.log(`[Course Builder Cache] ✅ Saved ${courses.length} course snapshots for ${snapshotDate}`);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("[Course Builder Cache] ❌ Error saving course builder snapshots to DB:", err.message);
    throw err;
  } finally {
    client.release();
  }
}

