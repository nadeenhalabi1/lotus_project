import { getPool, withRetry } from './pool.js';

/**
 * שמירה של snapshot ממיקרוסרביס Learning Analytics אל טבלת learning_analytics_cache.
 *
 * @param {object} data - האובייקט שחזר מ-Learning Analytics (parsed JSON)
 *
 * מצופה שיהיו בו:
 * version, period, start_date, end_date, calculated_at,
 * metrics (עם כל השדות), category_breakdowns (עם כל השדות)
 */
export async function saveLearningAnalyticsSnapshot(data) {
  const pool = getPool();
  const client = await pool.connect();

  const now = new Date();
  const snapshotDate = now.toISOString().slice(0, 10); // YYYY-MM-DD

  try {
    await client.query("BEGIN");

    await withRetry(async () => {
      return await client.query(
        `
        INSERT INTO learning_analytics_cache (
          snapshot_date,
          version,
          period,
          start_date,
          end_date,
          total_learners,
          active_learners,
          total_courses,
          courses_completed,
          average_completion_rate,
          total_skills_acquired,
          average_competency_level_progression,
          engagement_score_average,
          drop_off_rate,
          total_topics,
          average_topics_per_content,
          average_lessons_per_course,
          average_attempts_per_assessment,
          total_assessments,
          pass_rate,
          total_unique_learning_paths,
          average_skills_per_learning_path,
          average_skills_per_competency,
          platform_skill_demand,
          beginner_count,
          intermediate_count,
          advanced_count,
          expert_count,
          video_usage_count,
          text_usage_count,
          code_usage_count,
          presentation_usage_count,
          mindmap_usage_count,
          high_engagement_count,
          medium_engagement_count,
          low_engagement_count,
          calculated_at,
          ingested_at
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37)
        ON CONFLICT (snapshot_date, period, start_date, end_date)
        DO UPDATE SET
          version = EXCLUDED.version,
          total_learners = EXCLUDED.total_learners,
          active_learners = EXCLUDED.active_learners,
          total_courses = EXCLUDED.total_courses,
          courses_completed = EXCLUDED.courses_completed,
          average_completion_rate = EXCLUDED.average_completion_rate,
          total_skills_acquired = EXCLUDED.total_skills_acquired,
          average_competency_level_progression = EXCLUDED.average_competency_level_progression,
          engagement_score_average = EXCLUDED.engagement_score_average,
          drop_off_rate = EXCLUDED.drop_off_rate,
          total_topics = EXCLUDED.total_topics,
          average_topics_per_content = EXCLUDED.average_topics_per_content,
          average_lessons_per_course = EXCLUDED.average_lessons_per_course,
          average_attempts_per_assessment = EXCLUDED.average_attempts_per_assessment,
          total_assessments = EXCLUDED.total_assessments,
          pass_rate = EXCLUDED.pass_rate,
          total_unique_learning_paths = EXCLUDED.total_unique_learning_paths,
          average_skills_per_learning_path = EXCLUDED.average_skills_per_learning_path,
          average_skills_per_competency = EXCLUDED.average_skills_per_competency,
          platform_skill_demand = EXCLUDED.platform_skill_demand,
          beginner_count = EXCLUDED.beginner_count,
          intermediate_count = EXCLUDED.intermediate_count,
          advanced_count = EXCLUDED.advanced_count,
          expert_count = EXCLUDED.expert_count,
          video_usage_count = EXCLUDED.video_usage_count,
          text_usage_count = EXCLUDED.text_usage_count,
          code_usage_count = EXCLUDED.code_usage_count,
          presentation_usage_count = EXCLUDED.presentation_usage_count,
          mindmap_usage_count = EXCLUDED.mindmap_usage_count,
          high_engagement_count = EXCLUDED.high_engagement_count,
          medium_engagement_count = EXCLUDED.medium_engagement_count,
          low_engagement_count = EXCLUDED.low_engagement_count,
          calculated_at = EXCLUDED.calculated_at,
          ingested_at = EXCLUDED.ingested_at
        `,
        [
          snapshotDate,
          data.version ?? "1.0",
          data.period ?? "daily",
          data.start_date ? new Date(data.start_date) : new Date(),  // NOT NULL - use current date as fallback
          data.end_date ? new Date(data.end_date) : new Date(),  // NOT NULL - use current date as fallback
          data.metrics?.total_learners ?? null,
          data.metrics?.active_learners ?? null,
          data.metrics?.total_courses ?? null,
          data.metrics?.courses_completed ?? null,
          data.metrics?.average_completion_rate ?? null,
          data.metrics?.total_skills_acquired ?? null,
          data.metrics?.average_competency_level_progression ?? null,
          data.metrics?.engagement_score_average ?? null,
          data.metrics?.drop_off_rate ?? null,
          data.metrics?.total_topics ?? null,
          data.metrics?.average_topics_per_content ?? null,
          data.metrics?.average_lessons_per_course ?? null,
          data.metrics?.average_attempts_per_assessment ?? null,
          data.metrics?.total_assessments ?? null,
          data.metrics?.pass_rate ?? null,
          data.metrics?.total_unique_learning_paths ?? null,
          data.metrics?.average_skills_per_learning_path ?? null,
          data.metrics?.average_skills_per_competency ?? null,
          data.metrics?.platform_skill_demand ?? null,  // jsonb
          data.category_breakdowns?.by_competency_level?.beginner ?? null,
          data.category_breakdowns?.by_competency_level?.intermediate ?? null,
          data.category_breakdowns?.by_competency_level?.advanced ?? null,
          data.category_breakdowns?.by_competency_level?.expert ?? null,
          data.category_breakdowns?.by_content_format_usage?.video ?? null,
          data.category_breakdowns?.by_content_format_usage?.text ?? null,
          data.category_breakdowns?.by_content_format_usage?.code ?? null,
          data.category_breakdowns?.by_content_format_usage?.presentation ?? null,
          data.category_breakdowns?.by_content_format_usage?.mindmap ?? null,
          data.category_breakdowns?.by_engagement_level?.high ?? null,
          data.category_breakdowns?.by_engagement_level?.medium ?? null,
          data.category_breakdowns?.by_engagement_level?.low ?? null,
          data.calculated_at ? new Date(data.calculated_at) : now,  // NOT NULL - use current timestamp as fallback
          now
        ]
      );
    }, 3);

    await client.query("COMMIT");
    console.log(`[Learning Analytics Cache] ✅ Saved snapshot for ${snapshotDate}`);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("[Learning Analytics Cache] ❌ Error saving learning analytics snapshot to DB:", err.message);
    throw err;
  } finally {
    client.release();
  }
}

