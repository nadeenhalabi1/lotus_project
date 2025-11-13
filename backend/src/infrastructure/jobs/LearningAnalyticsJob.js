import cron from "node-cron";
import { fetchLearningAnalyticsFromService } from "../clients/LearningAnalyticsClient.js";
import { saveLearningAnalyticsSnapshot } from "../db/learningAnalyticsCache.js";

/**
 * הפעלת ה-cron job של Learning Analytics sync
 * רץ כל יום ב-06:00 בבוקר, לפי אזור זמן Asia/Jerusalem
 */
export function startLearningAnalyticsScheduler() {
  // ריצה כל יום ב-06:00 בבוקר, לפי אזור זמן Asia/Jerusalem
  cron.schedule(
    "0 6 * * *",
    async () => {
      console.log("[CRON] Starting Learning Analytics sync at", new Date().toISOString());

      try {
        const data = await fetchLearningAnalyticsFromService();
        await saveLearningAnalyticsSnapshot(data);
        console.log("[CRON] Learning Analytics sync finished successfully");
      } catch (err) {
        console.error("[CRON] Learning Analytics sync failed:", err.message);
      }
    },
    {
      timezone: "Asia/Jerusalem"
    }
  );
  
  console.log("[CRON] Learning Analytics scheduler initialized - will run daily at 06:00 (Asia/Jerusalem)");
}

