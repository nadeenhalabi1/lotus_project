import cron from "node-cron";
import { fetchContentMetricsFromContentStudio } from "../clients/ContentStudioClient.js";
import { saveContentStudioSnapshot } from "../db/contentStudioCache.js";

/**
 * הפעלת ה-cron job של Content Studio sync
 * רץ כל יום ב-06:00 בבוקר, לפי אזור זמן Asia/Jerusalem
 */
export function startContentStudioScheduler() {
  // ריצה כל יום ב-06:00 בבוקר, לפי אזור זמן Asia/Jerusalem
  cron.schedule(
    "0 6 * * *",
    async () => {
      console.log("[CRON] Starting Content Studio sync at", new Date().toISOString());

      try {
        const data = await fetchContentMetricsFromContentStudio();
        await saveContentStudioSnapshot(data);
        console.log("[CRON] Content Studio sync finished successfully");
      } catch (err) {
        console.error("[CRON] Content Studio sync failed:", err.message);
      }
    },
    {
      timezone: "Asia/Jerusalem"
    }
  );
  
  console.log("[CRON] Content Studio scheduler initialized - will run daily at 06:00 (Asia/Jerusalem)");
}

