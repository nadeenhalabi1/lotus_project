import axios from "axios";
import qs from "qs";

const COURSE_BUILDER_API_URL = process.env.COURSE_BUILDER_API_URL;

if (!COURSE_BUILDER_API_URL) {
  console.error("Missing COURSE_BUILDER_API_URL env variable");
}

/**
 * קורא למיקרוסרביס Course Builder, ושולח לו payload ריק שימולא.
 * מצופה לחזור JSON במבנה:
 * {
 *   courses: [
 *     {
 *       course_id,
 *       course_name,
 *       totalEnrollments,
 *       activeEnrollment,
 *       completionRate,
 *       averageRating,
 *       createdAt,
 *       feedback
 *     },
 *     ...
 *   ]
 * }
 */
export async function fetchCourseBuilderDataFromService() {
  const payloadObject = {
    courses: [
      {
        course_id: null,
        course_name: "",
        totalEnrollments: null,
        activeEnrollment: null,
        completionRate: null,
        averageRating: null,
        createdAt: "",
        feedback: ""
      }
    ]
  };

  const payloadString = JSON.stringify(payloadObject);

  const body = qs.stringify({
    serviceName: "ManagementReporting",
    payload: payloadString
  });

  try {
    const response = await axios.post(COURSE_BUILDER_API_URL, body, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      timeout: 30000
    });

    const { payload } = response.data || {};

    if (!payload || typeof payload !== "string") {
      throw new Error("Invalid payload returned from Course Builder service");
    }

    const filledPayload = JSON.parse(payload);

    // מצפים למבנה { courses: [...] }
    if (!filledPayload.courses || !Array.isArray(filledPayload.courses)) {
      throw new Error("Course Builder payload does not contain 'courses' array");
    }

    return filledPayload.courses;
  } catch (err) {
    console.error("Error calling Course Builder service:", err.message);
    throw err;
  }
}

