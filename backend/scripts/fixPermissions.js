import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import pkg from "pg";
const { Client } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function fixPermissions() {
  const conn = process.env.DATABASE_URL;
  if (!conn) {
    console.error("❌ DATABASE_URL not set, cannot fix permissions");
    process.exit(1);
  }

  try {
    // Try to read permissions migration file
    let migrationPath = resolve(__dirname, "../DB/fix_ai_chart_transcriptions_permissions.sql");
    let sql;
    try {
      sql = readFileSync(migrationPath, "utf8");
      console.log("✅ Found permissions migration file");
    } catch (e) {
      // Try parent directory (local development)
      migrationPath = resolve(__dirname, "../../DB/fix_ai_chart_transcriptions_permissions.sql");
      try {
        sql = readFileSync(migrationPath, "utf8");
        console.log("✅ Found permissions migration file (parent dir)");
      } catch {
        console.error("❌ Could not find fix_ai_chart_transcriptions_permissions.sql");
        console.error("   Tried:", resolve(__dirname, "../DB/fix_ai_chart_transcriptions_permissions.sql"));
        console.error("   Tried:", resolve(__dirname, "../../DB/fix_ai_chart_transcriptions_permissions.sql"));
        process.exit(1);
      }
    }

    console.log("========================================");
    console.log("🔧 Fixing ai_chart_transcriptions permissions...");
    console.log("========================================");

    const client = new Client({
      connectionString: conn,
      ssl: { rejectUnauthorized: false } // required for Supabase
    });

    await client.connect();
    
    try {
      // Get current user
      const userResult = await client.query("SELECT current_user, current_database()");
      console.log(`📊 Current user: ${userResult.rows[0].current_user}`);
      console.log(`📊 Current database: ${userResult.rows[0].current_database}`);
      
      await client.query("BEGIN");
      
      // Execute the permissions migration
      console.log("📝 Executing permissions migration...");
      await client.query(sql);
      
      await client.query("COMMIT");
      
      console.log("========================================");
      console.log("✅✅✅ PERMISSIONS FIXED SUCCESSFULLY! ✅✅✅");
      console.log("========================================");
      console.log("");
      console.log("The table ai_chart_transcriptions is now writable.");
      console.log("You can now test by running:");
      console.log("  node backend/scripts/testWrite.js");
      
    } catch (e) {
      await client.query("ROLLBACK");
      console.error("========================================");
      console.error("❌❌❌ PERMISSIONS FIX FAILED! ❌❌❌");
      console.error("========================================");
      console.error("Error:", e.message);
      console.error("Stack:", e.stack);
      process.exit(1);
    } finally {
      await client.end();
    }
  } catch (e) {
    console.error("❌ Error fixing permissions:", e.message);
    console.error("Stack:", e.stack);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  fixPermissions().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

export default fixPermissions;

