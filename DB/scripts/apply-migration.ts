import { readFileSync } from "fs";
import { resolve } from "path";
import { Client } from "pg";

async function main() {
  const conn = process.env.DATABASE_URL;
  if (!conn)
    throw new Error("❌ Missing DATABASE_URL (Railway env variable). No .env file is used.");

  const sql = readFileSync(resolve(__dirname, "../migration.sql"), "utf8");

  const client = new Client({
    connectionString: conn,
    ssl: { rejectUnauthorized: false } // required for Supabase
  });

  await client.connect();
  try {
    await client.query("begin");
    await client.query(sql);
    await client.query("commit");
    console.log("✅ migration.sql applied successfully to Supabase");
  } catch (e) {
    await client.query("rollback");
    console.error("❌ Migration failed:", e);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

