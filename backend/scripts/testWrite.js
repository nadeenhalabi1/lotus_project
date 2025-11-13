import pkg from "pg";
const { Client } = pkg;

async function testWrite() {
  const conn = process.env.DATABASE_URL;
  if (!conn) {
    console.error("❌ DATABASE_URL not set");
    process.exit(1);
  }

  const client = new Client({
    connectionString: conn,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("✅ Connected to database");
    
    // Get current user
    const userResult = await client.query("SELECT current_user");
    console.log(`📊 Current user: ${userResult.rows[0].current_user}`);
    
    // Test INSERT
    const testChartId = `test-write-${Date.now()}`;
    const testText = `WRITE TEST - ${new Date().toISOString()}`;
    
    console.log("\n========================================");
    console.log("🧪 Testing INSERT...");
    console.log("========================================");
    console.log(`Test chart_id: ${testChartId}`);
    console.log(`Test text: ${testText}`);
    
    try {
      const insertResult = await client.query(`
        INSERT INTO public.ai_chart_transcriptions
        (chart_id, chart_signature, model, transcription_text)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (chart_id) DO UPDATE 
        SET transcription_text = $4, updated_at = NOW()
        RETURNING chart_id, transcription_text, updated_at
      `, [testChartId, 'test-sig', 'debug', testText]);
      
      if (insertResult.rows.length > 0) {
        console.log("✅ INSERT succeeded!");
        console.log("   Row returned:", insertResult.rows[0]);
      } else {
        console.error("❌ INSERT returned no rows");
        process.exit(1);
      }
    } catch (insertErr) {
      console.error("❌ INSERT failed!");
      console.error("   Error:", insertErr.message);
      console.error("   Code:", insertErr.code);
      process.exit(1);
    }
    
    // Test SELECT (read back)
    console.log("\n========================================");
    console.log("🧪 Testing SELECT (read back)...");
    console.log("========================================");
    
    try {
      const selectResult = await client.query(`
        SELECT chart_id, transcription_text, updated_at
        FROM public.ai_chart_transcriptions
        WHERE chart_id = $1
      `, [testChartId]);
      
      if (selectResult.rows.length > 0) {
        const row = selectResult.rows[0];
        console.log("✅ SELECT succeeded!");
        console.log("   chart_id:", row.chart_id);
        console.log("   transcription_text:", row.transcription_text.substring(0, 50) + "...");
        console.log("   updated_at:", row.updated_at);
        
        if (row.transcription_text === testText) {
          console.log("✅ Text matches what we wrote!");
        } else {
          console.error("❌ Text mismatch!");
          console.error("   Expected:", testText);
          console.error("   Got:", row.transcription_text);
          process.exit(1);
        }
      } else {
        console.error("❌ SELECT returned no rows (write didn't persist?)");
        process.exit(1);
      }
    } catch (selectErr) {
      console.error("❌ SELECT failed!");
      console.error("   Error:", selectErr.message);
      process.exit(1);
    }
    
    // Test UPDATE
    console.log("\n========================================");
    console.log("🧪 Testing UPDATE...");
    console.log("========================================");
    
    const updatedText = `UPDATED - ${new Date().toISOString()}`;
    
    try {
      const updateResult = await client.query(`
        UPDATE public.ai_chart_transcriptions
        SET transcription_text = $1, updated_at = NOW()
        WHERE chart_id = $2
        RETURNING chart_id, transcription_text, updated_at
      `, [updatedText, testChartId]);
      
      if (updateResult.rows.length > 0) {
        console.log("✅ UPDATE succeeded!");
        console.log("   Updated text:", updateResult.rows[0].transcription_text.substring(0, 50) + "...");
        
        if (updateResult.rows[0].transcription_text === updatedText) {
          console.log("✅ Updated text matches!");
        } else {
          console.error("❌ Updated text mismatch!");
          process.exit(1);
        }
      } else {
        console.error("❌ UPDATE returned no rows");
        process.exit(1);
      }
    } catch (updateErr) {
      console.error("❌ UPDATE failed!");
      console.error("   Error:", updateErr.message);
      process.exit(1);
    }
    
    // Clean up
    console.log("\n========================================");
    console.log("🧹 Cleaning up test row...");
    console.log("========================================");
    
    await client.query("DELETE FROM public.ai_chart_transcriptions WHERE chart_id = $1", [testChartId]);
    console.log("✅ Test row deleted");
    
    console.log("\n========================================");
    console.log("✅✅✅ ALL TESTS PASSED! ✅✅✅");
    console.log("========================================");
    console.log("The table ai_chart_transcriptions is fully writable!");
    console.log("You can now use the backend to write transcriptions.");
    
  } catch (err) {
    console.error("❌ Test failed:", err.message);
    console.error("Stack:", err.stack);
    process.exit(1);
  } finally {
    await client.end();
  }
}

testWrite().catch((e) => {
  console.error(e);
  process.exit(1);
});

