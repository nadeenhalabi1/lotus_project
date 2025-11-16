import cron from "node-cron";
import { fetchDirectoryDataFromService } from "../clients/DirectoryClient.js";
import { saveDirectorySnapshot } from "../db/directoryCache.js";

/**
 * Starts the cron job for Directory sync.
 * Runs every day at 06:00 (Asia/Jerusalem).
 */
export function startDirectoryScheduler() {
  // Run every day at 06:00 AM, timezone Asia/Jerusalem
  cron.schedule(
    "0 6 * * *",
    async () => {
      console.log("[CRON] Starting Directory sync at", new Date().toISOString());

      try {
        const companies = await fetchDirectoryDataFromService();

        if (!Array.isArray(companies) || companies.length === 0) {
          console.warn("[CRON] Directory sync returned an empty or non-array response");
        } else {
          await saveDirectorySnapshot(companies);
          console.log("[CRON] Directory sync finished successfully");
        }
      } catch (err) {
        console.error("[CRON] Directory sync failed:", err.message);
      }
    },
    {
      timezone: "Asia/Jerusalem"
    }
  );

  console.log(
    "[CRON] Directory scheduler initialized - will run daily at 06:00 (Asia/Jerusalem)"
  );
}
