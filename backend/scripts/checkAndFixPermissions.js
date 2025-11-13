import pkg from "pg";
const { Client } = pkg;
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Check if ai_chart_transcriptions table has write permissions
 * Returns true if writable, false if read-only
 */
async function checkPermissions() {
  const conn = process.env.DATABASE_URL;
  if (!conn) {
    console.log("[Permissions Check] ⚠️ DATABASE_URL not set, skipping check");
    return { writable: false, reason: "DATABASE_URL not set" };
  }

  const client = new Client({
    connectionString: conn,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    // Get current user
    const userResult = await client.query("SELECT current_user");
    const currentUser = userResult.rows[0].current_user;
    console.log(`[Permissions Check] Current user: ${currentUser}`);
    
    // Check if table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'ai_chart_transcriptions'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log("[Permissions Check] ❌ Table does not exist");
      return { writable: false, reason: "Table does not exist" };
    }
    
    // Check RLS status
    const rlsCheck = await client.query(`
      SELECT relrowsecurity as rls_enabled
      FROM pg_class
      WHERE relname = 'ai_chart_transcriptions'
      AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
    `);
    
    const rlsEnabled = rlsCheck.rows[0]?.rls_enabled === true;
    console.log(`[Permissions Check] RLS enabled: ${rlsEnabled}`);
    
    // Check permissions for current user
    const permCheck = await client.query(`
      SELECT privilege_type
      FROM information_schema.role_table_grants
      WHERE table_schema = 'public'
      AND table_name = 'ai_chart_transcriptions'
      AND grantee = $1;
    `, [currentUser]);
    
    const hasInsert = permCheck.rows.some(r => r.privilege_type === 'INSERT');
    const hasUpdate = permCheck.rows.some(r => r.privilege_type === 'UPDATE');
    
    console.log(`[Permissions Check] INSERT permission: ${hasInsert}`);
    console.log(`[Permissions Check] UPDATE permission: ${hasUpdate}`);
    
    // Test actual write
    const testChartId = `permission-check-${Date.now()}`;
    let writeTestPassed = false;
    
    try {
      await client.query("BEGIN");
      await client.query(`
        INSERT INTO public.ai_chart_transcriptions
        (chart_id, chart_signature, model, transcription_text)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (chart_id) DO UPDATE 
        SET transcription_text = $4
      `, [testChartId, 'test', 'debug', 'WRITE TEST']);
      await client.query("COMMIT");
      
      // Verify write
      const verify = await client.query(`
        SELECT transcription_text FROM public.ai_chart_transcriptions
        WHERE chart_id = $1
      `, [testChartId]);
      
      if (verify.rows.length > 0 && verify.rows[0].transcription_text === 'WRITE TEST') {
        writeTestPassed = true;
        // Clean up
        await client.query("DELETE FROM public.ai_chart_transcriptions WHERE chart_id = $1", [testChartId]);
      }
    } catch (writeErr) {
      await client.query("ROLLBACK");
      console.log(`[Permissions Check] Write test failed: ${writeErr.message}`);
    }
    
    await client.end();
    
    if (writeTestPassed) {
      console.log("[Permissions Check] ✅✅✅ Table is WRITABLE!");
      return { writable: true };
    } else {
      console.log("[Permissions Check] ❌❌❌ Table is READ-ONLY!");
      return { 
        writable: false, 
        reason: rlsEnabled ? "RLS enabled" : (!hasInsert || !hasUpdate ? "Missing permissions" : "Write test failed")
      };
    }
    
  } catch (err) {
    console.error("[Permissions Check] Error:", err.message);
    await client.end().catch(() => {});
    return { writable: false, reason: err.message };
  }
}

/**
 * Fix permissions by running the migration
 */
async function fixPermissions() {
  const conn = process.env.DATABASE_URL;
  if (!conn) {
    console.error("[Permissions Fix] ❌ DATABASE_URL not set");
    return false;
  }

  try {
    // Try to read permissions migration file
    let migrationPath = resolve(__dirname, "../DB/fix_ai_chart_transcriptions_permissions.sql");
    let sql;
    try {
      sql = readFileSync(migrationPath, "utf8");
    } catch (e) {
      migrationPath = resolve(__dirname, "../../DB/fix_ai_chart_transcriptions_permissions.sql");
      try {
        sql = readFileSync(migrationPath, "utf8");
      } catch {
        console.error("[Permissions Fix] ❌ Could not find fix_ai_chart_transcriptions_permissions.sql");
        return false;
      }
    }

    const client = new Client({
      connectionString: conn,
      ssl: { rejectUnauthorized: false }
    });

    await client.connect();
    
    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("COMMIT");
      console.log("[Permissions Fix] ✅ Permissions migration applied successfully");
      await client.end();
      return true;
    } catch (e) {
      await client.query("ROLLBACK");
      console.error("[Permissions Fix] ❌ Migration failed:", e.message);
      await client.end();
      return false;
    }
  } catch (err) {
    console.error("[Permissions Fix] Error:", err.message);
    return false;
  }
}

/**
 * Main function: Check and fix if needed
 */
export async function checkAndFixPermissions() {
  console.log("[Permissions] ========================================");
  console.log("[Permissions] Checking ai_chart_transcriptions permissions...");
  console.log("[Permissions] ========================================");
  
  const check = await checkPermissions();
  
  if (check.writable) {
    console.log("[Permissions] ✅ No action needed - table is writable");
    return true;
  }
  
  console.log(`[Permissions] ⚠️ Table is read-only: ${check.reason}`);
  console.log("[Permissions] Attempting to fix permissions...");
  
  const fixed = await fixPermissions();
  
  if (fixed) {
    // Verify fix worked
    const verify = await checkPermissions();
    if (verify.writable) {
      console.log("[Permissions] ✅✅✅ Permissions fixed successfully!");
      return true;
    } else {
      console.error("[Permissions] ❌ Fix applied but table still read-only");
      return false;
    }
  } else {
    console.error("[Permissions] ❌ Failed to fix permissions");
    return false;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  checkAndFixPermissions().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

