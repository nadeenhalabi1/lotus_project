# 🚀 Quick Debug Commands Reference

## Environment Setup

```bash
# Set your backend URL
export BACKEND_URL="http://localhost:3001"
# Or for production:
# export BACKEND_URL="https://your-backend.railway.app"
```

---

## 1️⃣ Test Manual DB Write

```bash
curl -X POST "$BACKEND_URL/api/v1/ai/debug/ai/chart-transcription/test" \
  -H "Content-Type: application/json" \
  -d '{
    "chartId": "TEST_MANUAL_123",
    "text": "DEBUG_TRANSCRIPTION_12345_XXX"
  }'
```

**Expected Output:**
```json
{
  "ok": true,
  "chartId": "TEST_MANUAL_123",
  "row": {
    "chartId": "TEST_MANUAL_123",
    "transcriptionText": "DEBUG_TRANSCRIPTION_12345_XXX",
    ...
  }
}
```

---

## 2️⃣ Test Manual DB Read

```bash
curl "$BACKEND_URL/api/v1/ai/debug/ai/chart-transcription/TEST_MANUAL_123"
```

**Expected Output:**
```json
{
  "ok": true,
  "chartId": "TEST_MANUAL_123",
  "row": {
    "chart_id": "TEST_MANUAL_123",
    "transcription_text": "DEBUG_TRANSCRIPTION_12345_XXX",
    ...
  }
}
```

---

## 3️⃣ Test Real Chart (Before Refresh)

Replace `chart-courseBuilder` with your actual chart ID.

```bash
curl -X POST "$BACKEND_URL/api/v1/ai/debug/ai/chart-transcription/test" \
  -H "Content-Type: application/json" \
  -d '{
    "chartId": "chart-courseBuilder",
    "text": "BEFORE_REFRESH_TEST_99999"
  }'
```

---

## 4️⃣ Verify Real Chart in DB

```bash
curl "$BACKEND_URL/api/v1/ai/debug/ai/chart-transcription/chart-courseBuilder"
```

---

## 5️⃣ After Refresh: Check if Changed

After clicking "Refresh Data" on Dashboard:

```bash
curl "$BACKEND_URL/api/v1/ai/debug/ai/chart-transcription/chart-courseBuilder"
```

**Expected:**
- `transcription_text` should be DIFFERENT (new OpenAI text)
- NOT `BEFORE_REFRESH_TEST_99999`

---

## 6️⃣ Direct PostgreSQL Query

```bash
psql "$DATABASE_URL" -c "
  SELECT 
    chart_id, 
    LEFT(transcription_text, 100) as text_preview,
    LENGTH(transcription_text) as text_length,
    updated_at
  FROM public.ai_chart_transcriptions
  WHERE chart_id = 'chart-courseBuilder';
"
```

---

## 7️⃣ List All Transcriptions in DB

```bash
psql "$DATABASE_URL" -c "
  SELECT 
    chart_id,
    LEFT(transcription_text, 50) as text_preview,
    LENGTH(transcription_text) as text_length,
    updated_at
  FROM public.ai_chart_transcriptions
  ORDER BY updated_at DESC
  LIMIT 10;
"
```

---

## 8️⃣ Delete Test Data

```bash
psql "$DATABASE_URL" -c "
  DELETE FROM public.ai_chart_transcriptions
  WHERE chart_id LIKE 'TEST_%';
"
```

---

## 🔍 Real-Time Log Monitoring

### Backend Logs (if using Railway):

```bash
railway logs --follow
```

### Frontend Console:

Open browser console (F12) and filter by:
- `[Dashboard Refresh]` - Dashboard refresh flow
- `[Reports]` - Reports generation flow
- `[DEBUG]` - Debug endpoint calls
- `[DB]` - Database operations

---

## 📊 What to Look For

### ✅ Success Pattern:

1. **Write Test:**
   ```
   [DEBUG TEST] WRITE TEST CALLED
   [DB] ✅✅✅ SUCCESS! Transcription VERIFIED in DB
   ```

2. **Read Test:**
   ```
   [DEBUG READ] READ TEST CALLED
   [DEBUG READ] ✅ SUCCESS!
   [DEBUG READ] Found row: { chart_id: "...", transcription_text: "...", ... }
   ```

3. **Dashboard Refresh:**
   ```
   [Dashboard Refresh] chartId: "chart-courseBuilder"
   [refresh] Chart chart-courseBuilder: ✅✅✅ DB WRITE VERIFIED!
   [DB] ✅✅✅ SUCCESS! Transcription VERIFIED in DB
   ```

4. **Reports Load:**
   ```
   [Reports Chart chart-courseBuilder] 🎨 Rendering transcription_text
   ```

---

### ❌ Failure Patterns:

1. **chartId Mismatch:**
   ```
   [Dashboard Refresh] chartId: "chart-courseBuilder"
   [refresh] Chart chart-0: ...  ⚠️ DIFFERENT ID!
   ```

2. **DB Write Failed:**
   ```
   [DB] ❌❌❌ VERIFICATION FAILED! Row not found in DB after UPSERT!
   ```

3. **No Chart ID:**
   ```
   [GetDashboardUseCase] ❌ ERROR: Chart 1 has no ID!
   ```

4. **Generic IDs:**
   ```
   [Dashboard Refresh] ⚠️ Chart 1 has generic/missing chartId: "chart-0"
   ```

---

## 🛠️ One-Liner Full Test

```bash
# Write
curl -X POST "$BACKEND_URL/api/v1/ai/debug/ai/chart-transcription/test" \
  -H "Content-Type: application/json" \
  -d '{"chartId":"TEST_123","text":"DEBUG_999"}' && \
# Read
curl "$BACKEND_URL/api/v1/ai/debug/ai/chart-transcription/TEST_123" && \
# PostgreSQL
psql "$DATABASE_URL" -c "SELECT * FROM ai_chart_transcriptions WHERE chart_id='TEST_123';"
```

All three should show the same data. If not, you found the bug!

---

## 📝 Notes

- Replace `$BACKEND_URL` with your actual backend URL
- Replace `chart-courseBuilder` with actual chart IDs from your logs
- All commands return JSON (except PostgreSQL)
- Check backend logs for detailed operation flow
- Check frontend console for UI-side tracking

---

## 🆘 Quick Troubleshooting

| Symptom | Command to Run | What to Check |
|---------|----------------|---------------|
| Can't write to DB | `curl -X POST .../test` | Check `DATABASE_URL`, table exists |
| Can't read from DB | `curl .../TEST_123` | Check row exists in PostgreSQL |
| chartId mismatch | Check browser console | Look for `[GetDashboardUseCase]` logs |
| Old data in Reports | `curl .../chart-courseBuilder` | Compare with Reports UI |
| Refresh doesn't work | Check backend logs | Look for `[refresh]` and `[DB]` logs |

---

## 🎯 Fastest Debug Path

1. **Test write:** `curl -X POST .../test` with `TEST_123`
2. **Test read:** `curl .../TEST_123`
3. **Check PostgreSQL:** `psql ...`
4. If all 3 match → **DB is fine, problem is in flow**
5. If they don't match → **DB connection issue**

