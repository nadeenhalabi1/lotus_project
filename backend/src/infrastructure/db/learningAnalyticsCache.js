import { getPool, withRetry } from './pool.js';

/**
 * שמירה של snapshot ממיקרוסרביס Learning Analytics אל טבלאות מנורמלות.
 *
 * @param {object} data - האובייקט שחזר מ-Learning Analytics (parsed JSON)
 *
 * מצופה שיהיו בו:
 * version, aggregated_statistics (עם period, date_range, metrics, category_breakdowns, calculated_at)
 */
export async function saveLearningAnalyticsSnapshot(data) {
  const pool = getPool();
  const client = await pool.connect();

  const now = new Date();
  const snapshotDate = now.toISOString().slice(0, 10); // YYYY-MM-DD

  try {
    await client.query("BEGIN");

    // Extract data from the new structure
    // Support both new structure (aggregated_statistics) and legacy structure (flat)
    const stats = data.aggregated_statistics || data || {};
    const metrics = stats.metrics || {};
    const categoryBreakdowns = stats.category_breakdowns || {};
    const period = stats.period || data.period || "daily";
    const dateRange = stats.date_range || {};
    const startDate = dateRange.start_date ? new Date(dateRange.start_date) : (data.start_date ? new Date(data.start_date) : new Date());
    const endDate = dateRange.end_date ? new Date(dateRange.end_date) : (data.end_date ? new Date(data.end_date) : new Date());
    const calculatedAt = stats.calculated_at ? new Date(stats.calculated_at) : (data.calculated_at ? new Date(data.calculated_at) : new Date());

    // 1. Insert snapshot and get snapshot_id
    const snapshotResult = await withRetry(async () => {
      return await client.query(
        `
          INSERT INTO public.learning_analytics_snapshot (
            snapshot_date,
            period,
            start_date,
            end_date,
            calculated_at,
            version,
            raw_payload
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING id
        `,
        [
          snapshotDate,
          period,
          startDate,
          endDate,
          calculatedAt,
          data.version ?? "1.0",
          data // full JSON as raw_payload (jsonb)
        ]
      );
    }, 3);

    const snapshotId = snapshotResult.rows[0].id;

    // 2. Insert/Upsert into one-to-one metric tables
    // 2.1 Learners
    const learners = metrics.learners || {};
    await withRetry(async () => {
      return await client.query(
        `
          INSERT INTO public.learning_analytics_learners (
            snapshot_id,
            total_learners,
            active_learners,
            total_organizations
          )
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (snapshot_id) DO UPDATE SET
            total_learners = EXCLUDED.total_learners,
            active_learners = EXCLUDED.active_learners,
            total_organizations = EXCLUDED.total_organizations
        `,
        [
          snapshotId,
          learners.total_learners ?? 0,
          learners.active_learners ?? 0,
          learners.total_organizations ?? 0
        ]
      );
    }, 3);

    // 2.2 Courses
    const courses = metrics.courses || {};
    await withRetry(async () => {
      return await client.query(
        `
          INSERT INTO public.learning_analytics_courses (
            snapshot_id,
            total_courses,
            courses_completed,
            average_completion_rate,
            total_enrollments,
            active_enrollments,
            average_course_duration_hours,
            average_lessons_per_course
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (snapshot_id) DO UPDATE SET
            total_courses = EXCLUDED.total_courses,
            courses_completed = EXCLUDED.courses_completed,
            average_completion_rate = EXCLUDED.average_completion_rate,
            total_enrollments = EXCLUDED.total_enrollments,
            active_enrollments = EXCLUDED.active_enrollments,
            average_course_duration_hours = EXCLUDED.average_course_duration_hours,
            average_lessons_per_course = EXCLUDED.average_lessons_per_course
        `,
        [
          snapshotId,
          courses.total_courses ?? 0,
          courses.courses_completed ?? 0,
          courses.average_completion_rate ?? 0,
          courses.total_enrollments ?? 0,
          courses.active_enrollments ?? 0,
          courses.average_course_duration_hours ?? 0,
          courses.average_lessons_per_course ?? 0
        ]
      );
    }, 3);

    // 2.3 Content
    const content = metrics.content || {};
    await withRetry(async () => {
      return await client.query(
        `
          INSERT INTO public.learning_analytics_content (
            snapshot_id,
            total_topics,
            average_topics_per_content
          )
          VALUES ($1, $2, $3)
          ON CONFLICT (snapshot_id) DO UPDATE SET
            total_topics = EXCLUDED.total_topics,
            average_topics_per_content = EXCLUDED.average_topics_per_content
        `,
        [
          snapshotId,
          content.total_topics ?? 0,
          content.average_topics_per_content ?? 0
        ]
      );
    }, 3);

    // 2.4 Skills / Learning Paths
    const skillsCompetencies = metrics.skills_competencies || {};
    await withRetry(async () => {
      return await client.query(
        `
          INSERT INTO public.learning_analytics_skills (
            snapshot_id,
            total_skills_acquired,
            average_skills_per_competency,
            total_unique_learning_paths,
            average_skills_per_learning_path
          )
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (snapshot_id) DO UPDATE SET
            total_skills_acquired = EXCLUDED.total_skills_acquired,
            average_skills_per_competency = EXCLUDED.average_skills_per_competency,
            total_unique_learning_paths = EXCLUDED.total_unique_learning_paths,
            average_skills_per_learning_path = EXCLUDED.average_skills_per_learning_path
        `,
        [
          snapshotId,
          skillsCompetencies.total_skills_acquired ?? 0,
          skillsCompetencies.average_skills_per_competency ?? 0,
          skillsCompetencies.total_unique_learning_paths ?? 0,
          skillsCompetencies.average_skills_per_learning_path ?? 0
        ]
      );
    }, 3);

    // 2.5 Assessments
    const assessments = metrics.assessments || {};
    await withRetry(async () => {
      return await client.query(
        `
          INSERT INTO public.learning_analytics_assessments (
            snapshot_id,
            total_assessments,
            total_distinct_assessments,
            average_attempts_per_assessment,
            pass_rate,
            average_final_grade,
            average_passing_grade
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (snapshot_id) DO UPDATE SET
            total_assessments = EXCLUDED.total_assessments,
            total_distinct_assessments = EXCLUDED.total_distinct_assessments,
            average_attempts_per_assessment = EXCLUDED.average_attempts_per_assessment,
            pass_rate = EXCLUDED.pass_rate,
            average_final_grade = EXCLUDED.average_final_grade,
            average_passing_grade = EXCLUDED.average_passing_grade
        `,
        [
          snapshotId,
          assessments.total_assessments ?? 0,
          assessments.total_distinct_assessments ?? 0,
          assessments.average_attempts_per_assessment ?? 0,
          assessments.pass_rate ?? 0,
          assessments.average_final_grade ?? 0,
          assessments.average_passing_grade ?? 0
        ]
      );
    }, 3);

    // 2.6 Engagement
    const engagement = metrics.engagement || {};
    await withRetry(async () => {
      return await client.query(
        `
          INSERT INTO public.learning_analytics_engagement (
            snapshot_id,
            average_feedback_rating,
            total_feedback_submissions,
            total_competitions,
            average_competition_score
          )
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (snapshot_id) DO UPDATE SET
            average_feedback_rating = EXCLUDED.average_feedback_rating,
            total_feedback_submissions = EXCLUDED.total_feedback_submissions,
            total_competitions = EXCLUDED.total_competitions,
            average_competition_score = EXCLUDED.average_competition_score
        `,
        [
          snapshotId,
          engagement.average_feedback_rating ?? 0,
          engagement.total_feedback_submissions ?? 0,
          engagement.total_competitions ?? 0,
          engagement.average_competition_score ?? 0
        ]
      );
    }, 3);

    // 3. Category breakdowns: delete+insert by snapshot
    // 3.1 Competency level breakdown
    const competencyLevels = categoryBreakdowns.by_competency_level || {};
    await withRetry(async () => {
      await client.query(
        'DELETE FROM public.learning_analytics_competency_level_breakdown WHERE snapshot_id = $1',
        [snapshotId]
      );

      for (const [level, learnerCount] of Object.entries(competencyLevels)) {
        if (learnerCount == null) continue;

        await client.query(
          `
            INSERT INTO public.learning_analytics_competency_level_breakdown (
              snapshot_id,
              level,
              learner_count
            )
            VALUES ($1, $2, $3)
          `,
          [snapshotId, level, learnerCount]
        );
      }
    }, 3);

    // 3.2 Feedback rating breakdown
    const feedbackRatings = categoryBreakdowns.by_feedback_rating || {};
    await withRetry(async () => {
      await client.query(
        'DELETE FROM public.learning_analytics_feedback_rating_breakdown WHERE snapshot_id = $1',
        [snapshotId]
      );

      for (const [ratingStr, count] of Object.entries(feedbackRatings)) {
        if (count == null) continue;

        const rating = parseInt(ratingStr, 10);
        if (isNaN(rating)) continue;

        await client.query(
          `
            INSERT INTO public.learning_analytics_feedback_rating_breakdown (
              snapshot_id,
              rating,
              count
            )
            VALUES ($1, $2, $3)
          `,
          [snapshotId, rating, count]
        );
      }
    }, 3);

    // 3.3 Course status breakdown
    const courseStatuses = categoryBreakdowns.by_course_status || {};
    await withRetry(async () => {
      await client.query(
        'DELETE FROM public.learning_analytics_course_status_breakdown WHERE snapshot_id = $1',
        [snapshotId]
      );

      for (const [status, count] of Object.entries(courseStatuses)) {
        if (count == null) continue;

        await client.query(
          `
            INSERT INTO public.learning_analytics_course_status_breakdown (
              snapshot_id,
              status,
              count
            )
            VALUES ($1, $2, $3)
          `,
          [snapshotId, status, count]
        );
      }
    }, 3);

    // 4. Most demanded skills
    const skillDemand = skillsCompetencies.platform_skill_demand || {};
    const mostDemanded = Array.isArray(skillDemand.most_demanded_skills)
      ? skillDemand.most_demanded_skills
      : [];

    await withRetry(async () => {
      await client.query(
        'DELETE FROM public.learning_analytics_skill_demand WHERE snapshot_id = $1',
        [snapshotId]
      );

      for (let i = 0; i < mostDemanded.length; i++) {
        const s = mostDemanded[i];
        await client.query(
          `
            INSERT INTO public.learning_analytics_skill_demand (
              snapshot_id,
              skill_id,
              skill_name,
              demand_count,
              rank_position
            )
            VALUES ($1, $2, $3, $4, $5)
          `,
          [
            snapshotId,
            s.skill_id ?? null,
            s.skill_name ?? "",
            s.demand_count ?? 0,
            i + 1
          ]
        );
      }
    }, 3);

    await client.query("COMMIT");
    console.log(`[Learning Analytics Cache] ✅ Saved normalized snapshot for ${snapshotDate} (id=${snapshotId})`);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("[Learning Analytics Cache] ❌ Error saving learning analytics snapshot to DB:", err.message);
    throw err;
  } finally {
    client.release();
  }
}
