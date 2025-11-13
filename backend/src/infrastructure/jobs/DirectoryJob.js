import cron from "node-cron";
import { fetchDirectoryDataFromService } from "../clients/DirectoryClient.js";
import { saveDirectorySnapshot } from "../db/directoryCache.js";

/**
 * הפעלת ה-cron job של Directory sync
 * רץ כל יום ב-06:00 בבוקר, לפי אזור זמן Asia/Jerusalem
 */
export function startDirectoryScheduler() {
  // ריצה כל יום ב-06:00 בבוקר, לפי אזור זמן Asia/Jerusalem
  cron.schedule(
    "0 6 * * *",
    async () => {
      console.log("[CRON] Starting Directory sync at", new Date().toISOString());

      try {
        const data = await fetchDirectoryDataFromService();
        await saveDirectorySnapshot(data);
        console.log("[CRON] Directory sync finished successfully");
      } catch (err) {
        console.error("[CRON] Directory sync failed:", err.message);
      }
    },
    {
      timezone: "Asia/Jerusalem"
    }
  );
  
  console.log("[CRON] Directory scheduler initialized - will run daily at 06:00 (Asia/Jerusalem)");
}

