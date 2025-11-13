# 🐛 Chart Transcription Flow Debugging Guide

## Critical Bug: AI Chart Transcriptions Not Updating

**Problem**: After clicking "Refresh Data", old AI chart summaries persist in Reports, even though logs claim "DB WRITE VERIFIED".

**Goal**: Find exactly where the flow breaks between Dashboard → OpenAI → DB → Reports.

---

## ✅ Step 1: Hard DB Sanity Check (No OpenAI, No HTML)

### 1.1 Test Manual Write

Test the database write operation directly, bypassing all other flow.

**Request:**
```bash
POST http://your-backend-url/api/v1/ai/debug/ai/chart-transcription/test
Content-Type: application/json

{
  "chartId": "TEST_MANUAL_123",
  "text": "DEBUG_TRANSCRIPTION_12345_XXX"
}
```

**Expected Response:**
```json
{
  "ok": true,
  "chartId": "TEST_MANUAL_123",
  "row": {
    "chartId": "TEST_MANUAL_123",
    "transcriptionText": "DEBUG_TRANSCRIPTION_12345_XXX",
    "textLength": 29,
    "updatedAt": "2024-..."
  }
}
```

**Check Backend Logs:**
- Should see `[DEBUG TEST] WRITE TEST CALLED`
- Should see `[DEBUG TEST] ✅ SUCCESS!`
- Should see `[DB] ✅✅✅ SUCCESS! Transcription VERIFIED in DB`

---

### 1.2 Test Manual Read

Verify the written data can be read back from the DB.

**Request:**
```bash
GET http://your-backend-url/api/v1/ai/debug/ai/chart-transcription/TEST_MANUAL_123
```

**Expected Response:**
```json
{
  "ok": true,
  "chartId": "TEST_MANUAL_123",
  "row": {
    "chart_id": "TEST_MANUAL_123",
    "transcription_text": "DEBUG_TRANSCRIPTION_12345_XXX",
    "updated_at": "2024-..."
  }
}
```

**Check Backend Logs:**
- Should see `[DEBUG READ] READ TEST CALLED`
- Should see `[DEBUG READ] ✅ SUCCESS!`
- Should see transcription_text matching what you wrote

---

### 1.3 Direct PostgreSQL Verification

Connect to your PostgreSQL database and run:

```sql
SELECT chart_id, transcription_text, updated_at, created_at
FROM public.ai_chart_transcriptions
WHERE chart_id = 'TEST_MANUAL_123';
```

**Expected Result:**
- 1 row returned
- `transcription_text` = `"DEBUG_TRANSCRIPTION_12345_XXX"`
- `updated_at` should be recent

**❌ If this step fails:**
- Check `DATABASE_URL` environment variable in backend
- Verify PostgreSQL connection is working
- Check if `ai_chart_transcriptions` table exists
- Run `DB/migration.sql` if table is missing

---

## ✅ Step 2: Test Real Chart Flow with One Chart

### 2.1 Identify One Chart ID

Start the frontend and backend, open browser console.

1. Go to Dashboard
2. Check logs: `[GetDashboardUseCase] 🔍 CHART ID VERIFICATION:`
3. Pick one stable chart ID (e.g., `chart-courseBuilder`)

**Example log:**
```
[GetDashboardUseCase] Chart 1: id="chart-courseBuilder", title="Course Completion Metrics"
```

**✅ If all charts have proper IDs:**
- You should see IDs like `chart-courseBuilder`, `chart-directory`, etc.
- NOT generic IDs like `chart-0`, `chart-1`

**❌ If you see `chart-0`, `chart-1`:**
- Charts don't have stable IDs from backend
- This will cause mismatches between Dashboard and Reports
- Fix: Ensure `GetDashboardUseCase` assigns proper IDs

---

### 2.2 Manually Set Known Text for That Chart

Use the debug endpoint to set a very obvious value:

```bash
POST http://your-backend-url/api/v1/ai/debug/ai/chart-transcription/test
Content-Type: application/json

{
  "chartId": "chart-courseBuilder",
  "text": "MANUAL_DEBUG_TEXT_BEFORE_REFRESH_99999"
}
```

**Verify it was written:**
```bash
GET http://your-backend-url/api/v1/ai/debug/ai/chart-transcription/chart-courseBuilder
```

Should return:
```json
{
  "ok": true,
  "chartId": "chart-courseBuilder",
  "row": {
    "chart_id": "chart-courseBuilder",
    "transcription_text": "MANUAL_DEBUG_TEXT_BEFORE_REFRESH_99999",
    "updated_at": "..."
  }
}
```

---

### 2.3 View in Reports (Before Refresh)

1. Go to `/reports`
2. Click any report that includes `courseBuilder` charts (e.g., "Monthly Learning Performance Report")
3. Click "Generate Report"
4. Find the `chart-courseBuilder` chart
5. Check the "Chart Summary (AI-Generated)" section

**Expected:**
- Should show: `MANUAL_DEBUG_TEXT_BEFORE_REFRESH_99999`

**Check Frontend Console:**
```
[Reports Chart chart-courseBuilder] 🎨 Rendering transcription_text (43 chars): MANUAL_DEBUG_TEXT_BEFORE_REFRESH_99999
```

**❌ If you see old text or "Narration will appear here...":**
- The GET endpoint is not returning the correct data
- OR chartId mismatch between what you wrote and what Reports is requesting
- Check logs for: `[GET /chart-transcription/chart-courseBuilder]`

---

### 2.4 Click "Refresh Data" on Dashboard

1. Go back to `/dashboard`
2. Click the "Refresh Data" button
3. Wait for the refresh to complete

**Check Frontend Console:**
```
[Dashboard Refresh] 🔍 VERIFYING CAPTURED CHART IDs:
[Dashboard Refresh] Captured chart 1: chartId="chart-courseBuilder", context="Course Completion Metrics"
[Dashboard Refresh] 📤 SENDING TO BACKEND: 1 charts
...
[Dashboard Refresh] 📥 BACKEND RESPONSE RECEIVED
[Dashboard Refresh] Chart chart-courseBuilder: updated
```

**Check Backend Logs:**
```
[refresh] Chart chart-courseBuilder: 📞 Calling OpenAI Vision API...
[refresh] Chart chart-courseBuilder: ✅ OpenAI returned text
[refresh] Chart chart-courseBuilder: Text length: XXX chars
[refresh] Chart chart-courseBuilder: 💾 Saving to DB with verification...
[refresh] Chart chart-courseBuilder: ✅✅✅ DB WRITE VERIFIED!
[DB] ✅✅✅ SUCCESS! Transcription VERIFIED in DB
```

**❌ If you see "chart-0" instead of "chart-courseBuilder":**
- chartId mismatch!
- Dashboard is using a different ID than what you set in Step 2.2
- Fix: Use the actual chartId you see in Dashboard logs

---

### 2.5 Verify in DB Immediately After Refresh

```bash
GET http://your-backend-url/api/v1/ai/debug/ai/chart-transcription/chart-courseBuilder
```

**Expected:**
- `transcription_text` should be DIFFERENT from `MANUAL_DEBUG_TEXT_BEFORE_REFRESH_99999`
- It should be the new OpenAI-generated text
- `updated_at` should be very recent (within last few seconds)

**❌ If transcription_text is still the old value:**
- DB write is NOT actually succeeding, despite logs
- Possible causes:
  - Transaction not committed
  - Writing to wrong table/schema
  - PostgreSQL connection issue
  - Multiple database instances (e.g., local vs. production)

---

### 2.6 View in Reports (After Refresh)

1. Go back to `/reports`
2. Generate the same report again
3. Find the `chart-courseBuilder` chart
4. Check "Chart Summary (AI-Generated)"

**Expected:**
- Should show the NEW OpenAI-generated text
- NOT `MANUAL_DEBUG_TEXT_BEFORE_REFRESH_99999`

**❌ If you still see the old text:**
- The GET endpoint is reading from wrong source
- OR caching issue in frontend/backend
- OR chartId mismatch (Reports reading different chartId)

**Check Frontend Console:**
```
[Reports Chart chart-courseBuilder] 🎨 Rendering transcription_text (XXX chars): <new text>
```

**Check Backend Logs:**
```
[GET /chart-transcription/chart-courseBuilder] Transcription found in DB, text length: XXX
```

---

## ✅ Step 3: ChartId Consistency Verification

### 3.1 Track One ChartId Through Entire Flow

Pick one chart (e.g., `chart-courseBuilder`) and track its chartId through all logs:

1. **Dashboard Load:**
   ```
   [GetDashboardUseCase] Chart 1: id="chart-courseBuilder"
   ```

2. **Dashboard Refresh Capture:**
   ```
   [Dashboard Refresh] Captured chart 1: chartId="chart-courseBuilder"
   ```

3. **Backend Refresh:**
   ```
   [refresh] Chart chart-courseBuilder: ✅✅✅ DB WRITE VERIFIED!
   ```

4. **DB Verification:**
   ```
   [DB] ✅ Saved transcription for chart_id = "chart-courseBuilder"
   ```

5. **Reports Load:**
   ```
   [GenerateReportUseCase] Chart 1: id="chart-courseBuilder"
   ```

6. **Reports Render:**
   ```
   [Reports Chart Render] Using chart.id="chart-courseBuilder"
   ```

7. **Reports Fetch Transcription:**
   ```
   [GET /chart-transcription/chart-courseBuilder] Transcription found in DB
   ```

**✅ All logs should show the EXACT SAME chartId**

**❌ If you see different IDs (e.g., "chart-courseBuilder" vs "chart-0"):**
- This is the root cause!
- Charts are being saved with one ID and fetched with another
- Fix: Ensure all charts have stable IDs from backend

---

## ✅ Step 4: Database Connection Verification

### 4.1 Check DATABASE_URL

In backend, verify environment variable:

```bash
echo $DATABASE_URL
```

Or check in logs:
```
[BOOT] DATABASE_URL available: true
```

**❌ If DATABASE_URL is missing:**
- Backend cannot connect to PostgreSQL
- All operations will fail silently or use fallback

---

### 4.2 Check Multiple Database Instances

**Common issue:** Backend connects to one database (e.g., local), but you're checking another (e.g., Railway production).

**Verify:**
1. Check `DATABASE_URL` in backend environment
2. Check what database you're querying with SQL client
3. Ensure they're the SAME database

---

## ✅ Step 5: Final Acceptance Test

Once all above steps pass, do the full flow:

### 5.1 Set Known Value
```bash
POST /api/v1/ai/debug/ai/chart-transcription/test
{
  "chartId": "chart-courseBuilder",
  "text": "ACCEPTANCE_TEST_BEFORE"
}
```

### 5.2 Verify in Reports
- Go to Reports → Generate any report
- Verify you see: `ACCEPTANCE_TEST_BEFORE`

### 5.3 Refresh Dashboard
- Go to Dashboard → Click "Refresh Data"
- Wait for completion

### 5.4 Verify DB Changed
```bash
GET /api/v1/ai/debug/ai/chart-transcription/chart-courseBuilder
```
- `transcription_text` should be NEW (OpenAI-generated)
- NOT `ACCEPTANCE_TEST_BEFORE`

### 5.5 Verify in Reports
- Go to Reports → Generate report again
- Verify you see the NEW transcription
- NOT `ACCEPTANCE_TEST_BEFORE`

**✅ Success Criteria:**
- Transcription changes from BEFORE to AFTER in both DB and UI
- Same chartId used throughout entire flow
- Logs show verification at each step

---

## 🔧 Common Issues and Fixes

### Issue 1: chartId Mismatch

**Symptom:** Dashboard saves `chart-courseBuilder`, but Reports reads `chart-0`

**Fix:**
1. Ensure `GetDashboardUseCase` assigns stable IDs to all charts
2. Remove fallback `chart-${i}` logic in frontend
3. Always use `chart.id` directly, never fall back to index

---

### Issue 2: DB Write Not Persisting

**Symptom:** Logs show "VERIFIED", but SELECT shows old data

**Possible Causes:**
1. **Transaction not committed:** Check for open transactions
2. **Wrong table:** Verify table name is `public.ai_chart_transcriptions`
3. **Multiple databases:** Verify `DATABASE_URL` points to correct instance
4. **Permission issue:** Check PostgreSQL user has INSERT/UPDATE permissions

**Fix:**
- Add explicit `COMMIT` after write (if using transactions)
- Verify PostgreSQL connection and permissions
- Check PostgreSQL logs for errors

---

### Issue 3: Caching Issue

**Symptom:** DB has new data, but Reports show old data

**Possible Causes:**
1. Frontend caching the response
2. Backend caching the DB query
3. Browser caching the API response

**Fix:**
- Clear browser cache and localStorage
- Add `Cache-Control: no-cache` headers to GET endpoint
- Disable any Redis/in-memory caching for transcriptions

---

### Issue 4: Race Condition

**Symptom:** Sometimes works, sometimes doesn't

**Possible Causes:**
1. Reports fetch before Dashboard refresh completes
2. Multiple refreshes happening simultaneously
3. DB replication lag

**Fix:**
- Add delay before Reports fetch (already implemented: 2000ms)
- Use `await` properly in all async operations
- Add locking mechanism for refresh operation

---

## 📊 Success Checklist

- [ ] Step 1.1: Manual write succeeds
- [ ] Step 1.2: Manual read returns correct data
- [ ] Step 1.3: PostgreSQL SELECT shows correct data
- [ ] Step 2.1: All charts have stable IDs (not `chart-0`)
- [ ] Step 2.2: Manual write for real chart succeeds
- [ ] Step 2.3: Reports show manual text BEFORE refresh
- [ ] Step 2.4: Dashboard refresh completes without errors
- [ ] Step 2.5: DB read shows NEW text after refresh
- [ ] Step 2.6: Reports show NEW text after refresh
- [ ] Step 3.1: Same chartId throughout entire flow
- [ ] Step 4.1: DATABASE_URL is set correctly
- [ ] Step 4.2: Backend and SQL client use same database
- [ ] Step 5.1-5.5: Full acceptance test passes

---

## 🚨 If All Steps Pass But Issue Persists

Contact me with:
1. Full backend logs from one refresh cycle
2. Full frontend console logs from Dashboard → Refresh → Reports
3. PostgreSQL query results showing the row
4. Screenshots of Reports showing old vs new text
5. Your `DATABASE_URL` (masked credentials)

---

## 📝 Notes

- All debug endpoints are at `/api/v1/ai/debug/ai/chart-transcription/*`
- Normal endpoints are at `/api/v1/ai/chart-transcription/*`
- Debug endpoints bypass OpenAI and test DB operations directly
- Always use the SAME chartId in all tests (e.g., `chart-courseBuilder`)
- Check backend logs AND frontend console AND database directly

