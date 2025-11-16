import axios from "axios";

const COURSE_BUILDER_API_URL = process.env.COURSE_BUILDER_API_URL;

if (!COURSE_BUILDER_API_URL) {
  console.error("Missing COURSE_BUILDER_API_URL env variable");
}

/**
 * Calls the Course Builder microservice.
 *
 * NEW REQUEST FORMAT:
 * {
 *   requester_name: "ManagementReporting",
 *   payload: {},
 *   response: {
 *     courses: [
 *       {
 *         course_id: null,
 *         course_name: "",
 *         totalEnrollments: null,
 *         activeEnrollment: null,
 *         completionRate: null,
 *         averageRating: null,
 *         createdAt: "",
 *         feedback: ""
 *       }
 *     ]
 *   }
 * }
 *
 * The Course Builder service will fill "response.courses"
 * and return ONLY the response object as a JSON string.
 *
 * This function returns an array of course objects.
 */
export async function fetchCourseBuilderDataFromService() {
  const requestObject = {
    requester_name: "ManagementReporting",
    payload: {},
    response: {
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
    }
  };

  try {
    const response = await axios.post(COURSE_BUILDER_API_URL, requestObject, {
      headers: {
        "Content-Type": "application/json"
      },
      timeout: 30000
    });

    if (!response || !response.data) {
      throw new Error("Empty response from Course Builder service");
    }

    const parsed =
      typeof response.data === "string" ? JSON.parse(response.data) : response.data;

    if (!parsed.courses || !Array.isArray(parsed.courses)) {
      throw new Error("Expected Course Builder response to contain { courses: [...] }");
    }

    console.log(
      `[Course Builder Client] Received ${parsed.courses.length} courses from Course Builder service`
    );

    return parsed.courses;
  } catch (err) {
    console.error("Error calling Course Builder service:", err.message);
    throw err;
  }
}
