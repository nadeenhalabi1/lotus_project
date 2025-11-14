import axios from "axios";
import qs from "qs";

const CONTENT_STUDIO_API_URL = process.env.CONTENT_STUDIO_API_URL;

if (!CONTENT_STUDIO_API_URL) {
  console.error("Missing CONTENT_STUDIO_API_URL env variable");
}

export async function fetchContentMetricsFromContentStudio() {
  // 1. Inner payload structure
  const innerPayload = {
    courses: [],
    topics_stand_alone: []
  };

  // 2. First wrapper level
  const wrapper = {
    serviceName: "ManagementReporting",
    payload: JSON.stringify(innerPayload)
  };

  // 3. Second wrapper level (for qs.stringify)
  const payloadString = JSON.stringify(wrapper);

  const body = qs.stringify({
    payload: payloadString
  });

  try {
    const response = await axios.post(CONTENT_STUDIO_API_URL, body, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      timeout: 30000
    });

    // 4. Parse response in two levels
    const { payload } = response.data || {};

    if (!payload || typeof payload !== "string") {
      throw new Error("Invalid payload returned from Content Studio");
    }

    // First level: { serviceName: "...", payload: "<stringified inner JSON>" }
    const level1 = JSON.parse(payload);

    if (!level1.payload || typeof level1.payload !== "string") {
      throw new Error("Invalid inner payload structure from Content Studio");
    }

    // Second level: { courses: [...], topics_stand_alone: [...] }
    const data = JSON.parse(level1.payload);

    if (!data.courses || !Array.isArray(data.courses)) {
      throw new Error("Content Studio payload does not contain 'courses' array");
    }

    if (!data.topics_stand_alone || !Array.isArray(data.topics_stand_alone)) {
      throw new Error("Content Studio payload does not contain 'topics_stand_alone' array");
    }

    return data;
  } catch (err) {
    console.error("Error calling Content Studio:", err.message);
    throw err;
  }
}

