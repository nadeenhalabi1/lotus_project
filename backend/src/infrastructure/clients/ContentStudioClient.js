import axios from "axios";
import qs from "qs";

const CONTENT_STUDIO_API_URL = process.env.CONTENT_STUDIO_API_URL;

if (!CONTENT_STUDIO_API_URL) {
  console.error("Missing CONTENT_STUDIO_API_URL env variable");
}

export async function fetchContentMetricsFromContentStudio() {
  // 1. אובייקט עם כל השדות שרוצים שיתמלאו ע"י Content Studio
  const payloadObject = {
    total_courses_published: null,
    AI_generated_content_count: null,
    trainer_generated_content_count: null,
    mixed_or_collaborative_content_count: null,
    most_used_creator_type: "",
    ai_lessons_count: null,
    trainer_lessons_count: null,
    collaborative_lessons_count: null,
    course_id: null,
    course_name: "",
    content_id: null,
    total_usage_count: null,
    content_name: "",
    content_generator: "",
    trainer_id: null,
    content_type: "",
    lesson_id: null,
    lesson_name: ""
  };

  const payloadString = JSON.stringify(payloadObject);

  const body = qs.stringify({
    serviceName: "ManagementReporting",
    payload: payloadString
  });

  try {
    const response = await axios.post(CONTENT_STUDIO_API_URL, body, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      timeout: 30000
    });

    const { payload } = response.data || {};

    if (!payload || typeof payload !== "string") {
      throw new Error("Invalid payload returned from Content Studio");
    }

    const filledPayload = JSON.parse(payload);
    return filledPayload;
  } catch (err) {
    console.error("Error calling Content Studio:", err.message);
    throw err;
  }
}

