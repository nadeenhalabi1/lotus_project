import axios from "axios";
import qs from "qs";

const LEARNING_ANALYTICS_API_URL = process.env.LEARNING_ANALYTICS_API_URL;

if (!LEARNING_ANALYTICS_API_URL) {
  console.error("Missing LEARNING_ANALYTICS_API_URL env variable");
}

/**
 * קורא למיקרוסרביס Learning Analytics, ושולח לו payload ריק שימולא.
 * מצופה לחזור JSON במבנה עם כל שדות ה-learning analytics.
 */
export async function fetchLearningAnalyticsFromService() {
  const payloadObject = {
    version: "",
    aggregated_statistics: null,
    period: "",
    date_range: "",
    start_date: "",
    end_date: "",
    calculated_at: "",

    metrics: {
      total_learners: null,
      active_learners: null,
      total_courses: null,
      courses_completed: null,
      average_completion_rate: null,
      total_skills_acquired: null,
      average_competency_level_progression: null,
      engagement_score_average: null,
      drop_off_rate: null,
      total_topics: null,
      average_topics_per_content: null,
      average_lessons_per_course: null,
      average_attempts_per_assessment: null,
      total_assessments: null,
      pass_rate: null,
      total_unique_learning_paths: null,
      average_skills_per_learning_path: null,
      average_skills_per_competency: null,

      platform_skill_demand: null,
      most_demanded_skills: null,
      skill_id: null,
      skill_name: "",
      demand_count: null,
      trend: ""
    },

    category_breakdowns: {
      by_competency_level: {
        beginner: null,
        intermediate: null,
        advanced: null,
        expert: null
      },

      by_content_format_usage: {
        video: null,
        text: null,
        code: null,
        presentation: null,
        mindmap: null
      },

      by_engagement_level: {
        high: null,
        medium: null,
        low: null
      }
    }
  };

  const payloadString = JSON.stringify(payloadObject);

  const body = qs.stringify({
    serviceName: "ManagementReporting",
    payload: payloadString
  });

  try {
    const response = await axios.post(LEARNING_ANALYTICS_API_URL, body, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      timeout: 30000
    });

    const { payload } = response.data || {};

    if (!payload || typeof payload !== "string") {
      throw new Error("Invalid payload returned from Learning Analytics service");
    }

    const filledPayload = JSON.parse(payload);
    return filledPayload;
  } catch (err) {
    console.error("Error calling Learning Analytics service:", err.message);
    throw err;
  }
}

