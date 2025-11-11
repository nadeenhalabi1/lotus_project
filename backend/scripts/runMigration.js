import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import pkg from "pg";
const { Client } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
  const conn = process.env.DATABASE_URL;
  if (!conn) {
    console.log("⚠️  DATABASE_URL not set, skipping migration");
    return;
  }

  try {
    // Read migration file from DB folder (inside backend after copy)
    // Try both locations: inside backend/DB (after GitHub Actions copy) or ../DB (local development)
    let migrationPath = resolve(__dirname, "../DB/migration.sql");
    let sql;
    try {
      sql = readFileSync(migrationPath, "utf8");
    } catch (e) {
      // If not found, try parent directory (local development)
      migrationPath = resolve(__dirname, "../../DB/migration.sql");
      sql = readFileSync(migrationPath, "utf8");
    }

    const client = new Client({
      connectionString: conn,
      ssl: { rejectUnauthorized: false } // required for Supabase
    });

    await client.connect();
    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("COMMIT");
      console.log("✅ Migration applied successfully to Supabase");
    } catch (e) {
      await client.query("ROLLBACK");
      console.error("❌ Migration failed:", e.message);
      // Don't throw - allow server to start even if migration fails
    } finally {
      await client.end();
    }
  } catch (e) {
    console.error("❌ Error running migration:", e.message);
    // Don't throw - allow server to start even if migration fails
  }
}

export default runMigration;

