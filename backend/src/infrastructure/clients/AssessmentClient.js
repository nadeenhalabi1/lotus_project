import axios from "axios";
import qs from "qs";

const ASSESSMENT_API_URL = process.env.ASSESSMENT_API_URL;

if (!ASSESSMENT_API_URL) {
  console.error("Missing ASSESSMENT_API_URL env variable");
}

/**
 * קורא למיקרוסרביס Assessment, ושולח לו payload ריק שימולא.
 * מחזיר אובייקט JS עם השדות המלאים.
 */
export async function fetchAssessmentDataFromService() {
  // 1. אובייקט עם השדות שאנחנו רוצים שמיקרוסרביס Assessment ימלא
  const payloadObject = {
    user_id: null,
    course_id: null,
    exam_type: "",
    attempt_no: null,
    passing_grade: null,
    final_grade: null,
    passed: null
  };

  // 2. הופכים למחרוזת JSON
  const payloadString = JSON.stringify(payloadObject);

  // 3. בונים גוף בקשה עם שני פרמטרים (serviceName + payload)
  const body = qs.stringify({
    serviceName: "ManagementReporting",
    payload: payloadString
  });

  try {
    const response = await axios.post(ASSESSMENT_API_URL, body, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      timeout: 30000
    });

    const { payload } = response.data || {};

    if (!payload || typeof payload !== "string") {
      throw new Error("Invalid payload returned from Assessment service");
    }

    const filledPayload = JSON.parse(payload);
    return filledPayload;
  } catch (err) {
    console.error("Error calling Assessment service:", err.message);
    throw err;
  }
}

