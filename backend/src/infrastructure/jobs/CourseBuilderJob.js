import cron from "node-cron";
import { fetchCourseBuilderDataFromService } from "../clients/CourseBuilderClient.js";
import { saveCourseBuilderSnapshots } from "../db/courseBuilderCache.js";

/**
 * הפעלת ה-cron job של Course Builder sync
 * רץ כל יום ב-06:00 בבוקר, לפי אזור זמן Asia/Jerusalem
 */
export function startCourseBuilderScheduler() {
  // ריצה כל יום ב-06:00 בבוקר, לפי אזור זמן Asia/Jerusalem
  cron.schedule(
    "0 6 * * *",
    async () => {
      console.log("[CRON] Starting Course Builder sync at", new Date().toISOString());

      try {
        const courses = await fetchCourseBuilderDataFromService();
        await saveCourseBuilderSnapshots(courses);
        console.log("[CRON] Course Builder sync finished successfully");
      } catch (err) {
        console.error("[CRON] Course Builder sync failed:", err.message);
      }
    },
    {
      timezone: "Asia/Jerusalem"
    }
  );
  
  console.log("[CRON] Course Builder scheduler initialized - will run daily at 06:00 (Asia/Jerusalem)");
}

