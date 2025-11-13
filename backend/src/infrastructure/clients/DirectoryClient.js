import axios from "axios";
import qs from "qs";

const DIRECTORY_API_URL = process.env.DIRECTORY_API_URL;

if (!DIRECTORY_API_URL) {
  console.error("Missing DIRECTORY_API_URL env variable");
}

/**
 * קורא למיקרוסרביס Directory, ושולח לו payload ריק שימולא.
 * מצופה לחזור JSON במבנה עם כל שדות החברה.
 */
export async function fetchDirectoryDataFromService() {
  const payloadObject = {
    company_id: null,
    company_name: "",
    industry: "",
    company_size: "",
    date_registered: "",
    primary_hr_contact: "",
    approval_policy: "",
    decision_maker: "",
    kpis: null,
    max_test_attempts: null,
    website_url: "",
    verification_status: "",
    hierarchy: null
  };

  const payloadString = JSON.stringify(payloadObject);

  const body = qs.stringify({
    serviceName: "ManagementReporting",
    payload: payloadString
  });

  try {
    const response = await axios.post(DIRECTORY_API_URL, body, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      timeout: 30000
    });

    const { payload } = response.data || {};

    if (!payload || typeof payload !== "string") {
      throw new Error("Invalid payload returned from Directory service");
    }

    const filledPayload = JSON.parse(payload);
    return filledPayload;
  } catch (err) {
    console.error("Error calling Directory service:", err.message);
    throw err;
  }
}

