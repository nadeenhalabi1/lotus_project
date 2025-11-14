import { getPool, withRetry } from './pool.js';

/**
 * Save normalized Content Studio data to new schema:
 * - courses
 * - course_org_permissions
 * - topics
 * - course_topics
 * - topic_skills
 * - contents
 *
 * @param {object} data - { courses: [...], topics_stand_alone: [...] }
 */
export async function saveContentStudioSnapshot(data) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Process courses
    if (data.courses && Array.isArray(data.courses)) {
      for (const course of data.courses) {
        // 1. UPSERT course
        await withRetry(async () => {
          return await client.query(
            `
            INSERT INTO public.courses (
              course_id,
              course_name,
              course_language,
              trainer_id,
              trainer_name,
              permission_scope,
              total_usage_count,
              created_at,
              status
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (course_id)
            DO UPDATE SET
              course_name = EXCLUDED.course_name,
              course_language = EXCLUDED.course_language,
              trainer_id = EXCLUDED.trainer_id,
              trainer_name = EXCLUDED.trainer_name,
              permission_scope = EXCLUDED.permission_scope,
              total_usage_count = EXCLUDED.total_usage_count,
              created_at = EXCLUDED.created_at,
              status = EXCLUDED.status
            `,
            [
              course.course_id ?? null,
              course.course_name ?? null,
              course.course_language ?? null,
              course.trainer_id ?? null,
              course.trainer_name ?? null,
              course.permission === "all" ? "all" : (Array.isArray(course.permission) ? "orgs" : "all"),
              course.total_usage_count ?? 0,
              course.created_at ? new Date(course.created_at) : new Date(),
              course.status ?? "active"
            ]
          );
        }, 3);

        // 2. Insert course_org_permissions (if permission is array)
        if (Array.isArray(course.permission) && course.permission.length > 0) {
          for (const orgUuid of course.permission) {
            await withRetry(async () => {
              return await client.query(
                `
                INSERT INTO public.course_org_permissions (course_id, org_uuid)
                VALUES ($1, $2)
                ON CONFLICT (course_id, org_uuid) DO NOTHING
                `,
                [course.course_id, orgUuid]
              );
            }, 3);
          }
        }

        // 3. Process topics within course
        if (course.topics && Array.isArray(course.topics)) {
          for (const topic of course.topics) {
            // UPSERT topic
            await withRetry(async () => {
              return await client.query(
                `
                INSERT INTO public.topics (
                  topic_id,
                  topic_name,
                  topic_language,
                  total_usage_count,
                  created_at,
                  status
                )
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (topic_id)
                DO UPDATE SET
                  topic_name = EXCLUDED.topic_name,
                  topic_language = EXCLUDED.topic_language,
                  total_usage_count = EXCLUDED.total_usage_count,
                  created_at = EXCLUDED.created_at,
                  status = EXCLUDED.status
                `,
                [
                  topic.topic_id ?? null,
                  topic.topic_name ?? null,
                  topic.topic_language ?? null,
                  topic.total_usage_count ?? 0,
                  topic.created_at ? new Date(topic.created_at) : new Date(),
                  topic.status ?? "active"
                ]
              );
            }, 3);

            // Link topic to course
            await withRetry(async () => {
              return await client.query(
                `
                INSERT INTO public.course_topics (course_id, topic_id)
                VALUES ($1, $2)
                ON CONFLICT (course_id, topic_id) DO NOTHING
                `,
                [course.course_id, topic.topic_id]
              );
            }, 3);

            // Insert topic_skills
            if (topic.skills && Array.isArray(topic.skills)) {
              for (const skillCode of topic.skills) {
                await withRetry(async () => {
                  return await client.query(
                    `
                    INSERT INTO public.topic_skills (topic_id, skill_code)
                    VALUES ($1, $2)
                    ON CONFLICT (topic_id, skill_code) DO NOTHING
                    `,
                    [topic.topic_id, skillCode]
                  );
                }, 3);
              }
            }

            // UPSERT contents for topic
            if (topic.contents && Array.isArray(topic.contents)) {
              for (const content of topic.contents) {
                await withRetry(async () => {
                  return await client.query(
                    `
                    INSERT INTO public.contents (
                      content_id,
                      topic_id,
                      content_type,
                      content_data,
                      generation_method,
                      generation_method_id
                    )
                    VALUES ($1, $2, $3, $4, $5, $6)
                    ON CONFLICT (content_id)
                    DO UPDATE SET
                      topic_id = EXCLUDED.topic_id,
                      content_type = EXCLUDED.content_type,
                      content_data = EXCLUDED.content_data,
                      generation_method = EXCLUDED.generation_method,
                      generation_method_id = EXCLUDED.generation_method_id
                    `,
                    [
                      content.content_id ?? null,
                      topic.topic_id,
                      content.content_type ?? null,
                      content.content_data ?? {},
                      content.generation_methods ?? "manual",
                      content.generation_method_id ?? null
                    ]
                  );
                }, 3);
              }
            }
          }
        }
      }
    }

    // Process standalone topics
    if (data.topics_stand_alone && Array.isArray(data.topics_stand_alone)) {
      for (const topic of data.topics_stand_alone) {
        // UPSERT topic
        await withRetry(async () => {
          return await client.query(
            `
            INSERT INTO public.topics (
              topic_id,
              topic_name,
              topic_language,
              total_usage_count,
              created_at,
              status
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (topic_id)
            DO UPDATE SET
              topic_name = EXCLUDED.topic_name,
              topic_language = EXCLUDED.topic_language,
              total_usage_count = EXCLUDED.total_usage_count,
              created_at = EXCLUDED.created_at,
              status = EXCLUDED.status
            `,
            [
              topic.topic_id ?? null,
              topic.topic_name ?? null,
              topic.topic_language ?? null,
              topic.total_usage_count ?? 0,
              topic.created_at ? new Date(topic.created_at) : new Date(),
              topic.status ?? "active"
            ]
          );
        }, 3);

        // Insert topic_skills
        if (topic.skills && Array.isArray(topic.skills)) {
          for (const skillCode of topic.skills) {
            await withRetry(async () => {
              return await client.query(
                `
                INSERT INTO public.topic_skills (topic_id, skill_code)
                VALUES ($1, $2)
                ON CONFLICT (topic_id, skill_code) DO NOTHING
                `,
                [topic.topic_id, skillCode]
              );
            }, 3);
          }
        }

        // UPSERT contents for topic
        if (topic.contents && Array.isArray(topic.contents)) {
          for (const content of topic.contents) {
            await withRetry(async () => {
              return await client.query(
                `
                INSERT INTO public.contents (
                  content_id,
                  topic_id,
                  content_type,
                  content_data,
                  generation_method,
                  generation_method_id
                )
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (content_id)
                DO UPDATE SET
                  topic_id = EXCLUDED.topic_id,
                  content_type = EXCLUDED.content_type,
                  content_data = EXCLUDED.content_data,
                  generation_method = EXCLUDED.generation_method,
                  generation_method_id = EXCLUDED.generation_method_id
                `,
                [
                  content.content_id ?? null,
                  topic.topic_id,
                  content.content_type ?? null,
                  content.content_data ?? {},
                  content.generation_methods ?? "manual",
                  content.generation_method_id ?? null
                ]
              );
            }, 3);
          }
        }
      }
    }

    await client.query("COMMIT");
    console.log(`[Content Studio Sync] ✅ Saved normalized snapshot`);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("[Content Studio Sync] ❌ Error saving snapshot:", err.message);
    throw err;
  } finally {
    client.release();
  }
}
