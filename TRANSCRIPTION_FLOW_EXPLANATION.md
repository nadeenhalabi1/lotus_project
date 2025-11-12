# 📋 שלב 1: איך מתבצעות קריאות API ל-OpenAI ואיך נשמרים התמלולים ב-DB

## 🔄 התהליך המלא - צעד אחר צעד

### **שלב 1: קריאה ל-OpenAI Vision API**

**מיקום:** `backend/src/application/services/transcribeChartService.js`

**פונקציה:** `transcribeChartImage({ imageUrl, context })`

**מה קורה:**
1. בודק אם יש `OPENAI_KEY` או `OPENAI_API_KEY` ב-environment variables
2. יוצר client של OpenAI עם ה-API key
3. קורא ל-OpenAI Vision API עם:
   - **Model:** `gpt-4o`
   - **System Prompt:** הוראות לתמלול הגרף (תיאור קצר באנגלית, 1 כותרת + 3-6 נקודות)
   - **User Message:** 
     - טקסט: `"Analyze the chart image.\nContext: {context}"`
     - תמונה: `imageUrl` (data URL או URL רגיל)
   - **Max Tokens:** 400
4. מחזיר את הטקסט מ-`response.choices[0].message.content`
5. אם יש שגיאה, מחזיר mock text (לפיתוח)

**קוד:**
```javascript
const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [
    { role: 'system', content: SYSTEM_PROMPT },
    {
      role: 'user',
      content: [
        { type: 'text', text: `Analyze the chart image.\nContext: ${context || '—'}` },
        { type: 'image_url', image_url: { url: imageUrl } }
      ]
    }
  ],
  max_tokens: 400
});

const text = response.choices[0]?.message?.content?.trim() || '';
return text;
```

---

### **שלב 2: שמירה ב-DB (PostgreSQL)**

**מיקום:** `backend/src/infrastructure/repositories/ChartTranscriptionsRepository.js`

**פונקציה:** `upsertTranscription({ chartId, signature, model, text })`

**מה קורה:**
1. **בדיקות תקינות:**
   - בודק אם `DATABASE_URL` קיים
   - בודק אם `chartId` קיים
   - בודק אם `text` לא ריק (מזהיר אבל לא זורק שגיאה)

2. **חיבור ל-DB:**
   - מקבל connection pool מ-`getPool()`
   - בודק חיבור עם `SELECT NOW()`
   - בודק אם הטבלה `ai_chart_transcriptions` קיימת

3. **ביצוע UPSERT:**
   - משתמש ב-`INSERT ... ON CONFLICT (chart_id) DO UPDATE`
   - אם `chart_id` כבר קיים → מעדכן את השורה
   - אם `chart_id` לא קיים → יוצר שורה חדשה
   - מעדכן: `chart_signature`, `model`, `transcription_text`, `updated_at`

4. **אימות:**
   - מחזיר את הטקסט שנשמר מה-DB
   - בודק שהטקסט שנשמר תואם לטקסט שנשלח

**קוד SQL:**
```sql
INSERT INTO ai_chart_transcriptions 
  (chart_id, chart_signature, model, transcription_text, updated_at)
VALUES ($1, $2, $3, $4, NOW())
ON CONFLICT (chart_id) 
DO UPDATE SET 
  chart_signature = EXCLUDED.chart_signature,
  model = EXCLUDED.model,
  transcription_text = EXCLUDED.transcription_text,
  updated_at = NOW()
RETURNING chart_id, updated_at, transcription_text
```

**פרמטרים:**
- `$1` = `chartId` (string)
- `$2` = `signature` (string - hash של topic + chartData)
- `$3` = `model` (string - default: 'gpt-4o')
- `$4` = `text` (string - התמלול מ-OpenAI)

---

### **שלב 3: Endpoints שמשתמשים בזה**

**מיקום:** `backend/src/presentation/routes/chartTranscription.js`

#### **Endpoint 1: POST `/api/v1/ai/chart-transcription/:chartId`**
**מטרה:** Get-or-create transcription (אם קיים - מחזיר, אם לא - יוצר)

**תהליך:**
1. מקבל: `chartId`, `topic`, `chartData`, `imageUrl`, `model`
2. מחשב `signature` מ-`topic` + `chartData`
3. בודק אם יש תמלול קיים ב-DB עם אותו `chartId`
4. אם קיים ו-signature תואם → מחזיר את הקיים (לא קורא ל-OpenAI)
5. אם לא קיים או signature שונה → קורא ל-OpenAI → שומר ב-DB → מחזיר

#### **Endpoint 2: POST `/api/v1/ai/chart-transcription/startup-fill`**
**מטרה:** Batch processing - מעבד מספר גרפים בבת אחת

**תהליך:**
1. מקבל: `charts[]` (array של גרפים), `force` (boolean)
2. עבור כל גרף:
   - מחשב `signature`
   - בודק אם יש תמלול קיים
   - אם `force=true` → תמיד קורא ל-OpenAI (גם אם קיים)
   - אם `force=false` ו-signature תואם → מדלג (לא קורא ל-OpenAI)
   - אחרת → קורא ל-OpenAI → שומר ב-DB
3. מחזיר array של תוצאות

#### **Endpoint 3: POST `/api/v1/ai/chart-transcription/refresh`**
**מטרה:** Refresh transcription (תמיד קורא ל-OpenAI אם `force=true`)

**תהליך:**
1. מקבל: `chartId`, `topic`, `chartData`, `imageUrl`, `force`, `model`
2. אם `force=true` → תמיד קורא ל-OpenAI → שומר ב-DB
3. אם `force=false` → בודק signature → קורא ל-OpenAI רק אם השתנה
4. מחזיר את התמלול החדש

---

## 🔍 נקודות קריטיות לבדיקה

### **1. קריאה ל-OpenAI:**
- ✅ האם `OPENAI_KEY` או `OPENAI_API_KEY` מוגדר?
- ✅ האם ה-`imageUrl` תקין (data URL או URL רגיל)?
- ✅ האם התגובה מ-OpenAI לא ריקה?

### **2. שמירה ב-DB:**
- ✅ האם `DATABASE_URL` מוגדר ופועל?
- ✅ האם הטבלה `ai_chart_transcriptions` קיימת?
- ✅ האם ה-`chartId` לא null/undefined?
- ✅ האם ה-`text` לא null/undefined?
- ✅ האם ה-query רץ בהצלחה (לא זורק שגיאה)?
- ✅ האם ה-`RETURNING` מחזיר שורה?

### **3. אימות:**
- ✅ האם הטקסט שנשמר ב-DB תואם לטקסט שנשלח?
- ✅ האם ה-`updated_at` מתעדכן?

---

## 🐛 בעיות אפשריות

### **בעיה 1: התמלול לא נשמר ב-DB**
**סיבות אפשריות:**
- `DATABASE_URL` לא מוגדר
- הטבלה לא קיימת (לא רץ migration)
- ה-query נכשל (שגיאת SQL)
- ה-`text` הוא null/undefined
- ה-`chartId` הוא null/undefined

### **בעיה 2: התמלול לא מעודכן**
**סיבות אפשריות:**
- ה-`signature` לא משתנה (הנתונים לא משתנים)
- `force=false` ולא קורא ל-OpenAI
- ה-query לא מעדכן (ON CONFLICT לא עובד)
- ה-`updated_at` לא מתעדכן

### **בעיה 3: קריאה ל-OpenAI לא מתבצעת**
**סיבות אפשריות:**
- `force=false` ו-signature תואם (מדלג על קריאה)
- `OPENAI_KEY` לא מוגדר
- שגיאה ב-OpenAI API
- ה-`imageUrl` לא תקין

---

## 📝 מה לבדוק עכשיו

1. **בדוק את הלוגים:**
   - האם אתה רואה `[transcribeChartImage]` עם קריאה ל-OpenAI?
   - האם אתה רואה `[upsertTranscription]` עם שמירה ל-DB?
   - האם אתה רואה `✅ Successfully upserted transcription`?

2. **בדוק את ה-DB ישירות:**
   ```sql
   SELECT chart_id, 
          LENGTH(transcription_text) as text_length,
          updated_at,
          LEFT(transcription_text, 100) as preview
   FROM ai_chart_transcriptions
   WHERE chart_id = 'YOUR_CHART_ID'
   ORDER BY updated_at DESC;
   ```

3. **בדוק את ה-environment variables:**
   - `DATABASE_URL` - האם מוגדר?
   - `OPENAI_KEY` או `OPENAI_API_KEY` - האם מוגדר?

4. **בדוק את ה-signature:**
   - האם ה-signature משתנה כשהנתונים משתנים?
   - האם ה-signature תואם בין קריאות?

