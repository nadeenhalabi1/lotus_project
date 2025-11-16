import cron from "node-cron";
import { fetchAssessmentDataFromService } from "../clients/AssessmentClient.js";
import { saveAssessmentSnapshot } from "../db/assessmentCache.js";

/**
 * Starts the cron job for Assessment sync.
 * Runs every day at 06:00 AM, timezone Asia/Jerusalem.
 */
export function startAssessmentScheduler() {
  // Run every day at 06:00 AM, timezone Asia/Jerusalem
  cron.schedule(
    "0 6 * * *",
    async () => {
      console.log("[CRON] Starting Assessment sync at", new Date().toISOString());

      try {
        // Now returns an ARRAY of records
        const dataArray = await fetchAssessmentDataFromService();

        if (!Array.isArray(dataArray) || dataArray.length === 0) {
          console.warn("[CRON] Assessment sync returned an empty or non-array response");
        } else {
          await saveAssessmentSnapshot(dataArray);
          console.log("[CRON] Assessment sync finished successfully");
        }
      } catch (err) {
        console.error("[CRON] Assessment sync failed:", err.message);
      }
    },
    {
      timezone: "Asia/Jerusalem"
    }
  );

  console.log(
    "[CRON] Assessment scheduler initialized - will run daily at 06:00 (Asia/Jerusalem)"
  );
}
