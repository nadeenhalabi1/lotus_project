import cron from "node-cron";
import { fetchCourseBuilderDataFromService } from "../clients/CourseBuilderClient.js";
import { saveCourseBuilderSnapshots } from "../db/courseBuilderCache.js";

/**
 * Starts the cron job for Course Builder sync
 * Runs daily at 06:00 (Asia/Jerusalem)
 */
export function startCourseBuilderScheduler() {
  cron.schedule(
    "0 6 * * *",
    async () => {
      console.log("[CRON] Starting Course Builder sync at", new Date().toISOString());

      try {
        const courses = await fetchCourseBuilderDataFromService();

        if (!Array.isArray(courses)) {
          console.error("[CRON] Expected an array of courses");
        } else {
          await saveCourseBuilderSnapshots(courses);
          console.log("[CRON] Course Builder sync finished successfully");
        }
      } catch (err) {
        console.error("[CRON] Course Builder sync failed:", err.message);
      }
    },
    {
      timezone: "Asia/Jerusalem"
    }
  );

  console.log("[CRON] Course Builder scheduler initialized - runs daily at 06:00 (Asia/Jerusalem)");
}
