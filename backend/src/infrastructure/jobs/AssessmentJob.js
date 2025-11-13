import cron from "node-cron";
import { fetchAssessmentDataFromService } from "../clients/AssessmentClient.js";
import { saveAssessmentSnapshot } from "../db/assessmentCache.js";

/**
 * הפעלת ה-cron job של Assessment sync
 * רץ כל יום ב-06:00 בבוקר, לפי אזור זמן Asia/Jerusalem
 */
export function startAssessmentScheduler() {
  // ריצה כל יום ב-06:00 בבוקר, לפי אזור זמן Asia/Jerusalem
  cron.schedule(
    "0 6 * * *",
    async () => {
      console.log("[CRON] Starting Assessment sync at", new Date().toISOString());

      try {
        const data = await fetchAssessmentDataFromService();
        await saveAssessmentSnapshot(data);
        console.log("[CRON] Assessment sync finished successfully");
      } catch (err) {
        console.error("[CRON] Assessment sync failed:", err.message);
      }
    },
    {
      timezone: "Asia/Jerusalem"
    }
  );
  
  console.log("[CRON] Assessment scheduler initialized - will run daily at 06:00 (Asia/Jerusalem)");
}

