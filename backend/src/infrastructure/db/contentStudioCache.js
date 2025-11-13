import { getPool, withRetry } from './pool.js';

/**
 * שמירת snapshot יחיד בטבלאות:
 * - overview: מדדי סיכום
 * - contents: פרטי תוכן ולקחים
 *
 * @param {object} data - האובייקט שחזר מ-Content Studio (parsed JSON)
 */
export async function saveContentStudioSnapshot(data) {
  const pool = getPool();
  const client = await pool.connect();

  const now = new Date();
  // snapshot_date יהיה התאריך (ללא שעה)
  const snapshotDate = now.toISOString().slice(0, 10); // YYYY-MM-DD

  try {
    await client.query("BEGIN");

    // 1. שמירה לטבלת overview
    await withRetry(async () => {
      return await client.query(
        `
        INSERT INTO content_studio_overview_cache (
          snapshot_date,
          total_courses_published,
          "AI_generated_content_count",
          trainer_generated_content_count,
          mixed_or_collaborative_content_count,
          most_used_creator_type,
          ai_lessons_count,
          trainer_lessons_count,
          collaborative_lessons_count,
          ingested_at
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        ON CONFLICT (snapshot_date)
        DO UPDATE SET
          total_courses_published = EXCLUDED.total_courses_published,
          "AI_generated_content_count" = EXCLUDED."AI_generated_content_count",
          trainer_generated_content_count = EXCLUDED.trainer_generated_content_count,
          mixed_or_collaborative_content_count = EXCLUDED.mixed_or_collaborative_content_count,
          most_used_creator_type = EXCLUDED.most_used_creator_type,
          ai_lessons_count = EXCLUDED.ai_lessons_count,
          trainer_lessons_count = EXCLUDED.trainer_lessons_count,
          collaborative_lessons_count = EXCLUDED.collaborative_lessons_count,
          ingested_at = EXCLUDED.ingested_at
        `,
        [
          snapshotDate,
          data.total_courses_published ?? 0,
          data.AI_generated_content_count ?? 0,
          data.trainer_generated_content_count ?? 0,
          data.mixed_or_collaborative_content_count ?? 0,
          data.most_used_creator_type ?? null,
          data.ai_lessons_count ?? 0,
          data.trainer_lessons_count ?? 0,
          data.collaborative_lessons_count ?? 0,
          now
        ]
      );
    }, 3);

    // 2. שמירה לטבלת contents
    // כאן מניחים שמדובר בשורה אחת של תוכן (אם בעתיד זה יהיה מערך, צריך לולאה)
    await withRetry(async () => {
      return await client.query(
        `
        INSERT INTO content_studio_contents_cache (
          snapshot_date,
          content_id,
          course_id,
          course_name,
          content_name,
          content_generator,
          total_usage_count,
          trainer_id,
          content_type,
          lesson_id,
          lesson_name,
          ingested_at
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
        ON CONFLICT (snapshot_date, content_id)
        DO UPDATE SET
          course_id = EXCLUDED.course_id,
          course_name = EXCLUDED.course_name,
          content_name = EXCLUDED.content_name,
          content_generator = EXCLUDED.content_generator,
          total_usage_count = EXCLUDED.total_usage_count,
          trainer_id = EXCLUDED.trainer_id,
          content_type = EXCLUDED.content_type,
          lesson_id = EXCLUDED.lesson_id,
          lesson_name = EXCLUDED.lesson_name,
          ingested_at = EXCLUDED.ingested_at
        `,
        [
          snapshotDate,
          data.content_id ?? "unknown",
          data.course_id ?? null,
          data.course_name ?? null,
          data.content_name ?? null,
          data.content_generator ?? null,
          data.total_usage_count ?? 0,
          data.trainer_id ?? null,
          data.content_type ?? null,
          data.lesson_id ?? null,
          data.lesson_name ?? null,
          now
        ]
      );
    }, 3);

    await client.query("COMMIT");
    console.log(`[Content Studio Cache] ✅ Saved snapshot for ${snapshotDate}`);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("[Content Studio Cache] ❌ Error saving snapshot to DB:", err.message);
    throw err;
  } finally {
    client.release();
  }
}

