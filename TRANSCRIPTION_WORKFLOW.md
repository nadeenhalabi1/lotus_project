# זרימת העבודה המלאה - מערכת התמלול של הגרפים

## 📋 סקירה כללית

המערכת מנהלת תמלולים של גרפים באמצעות OpenAI Vision API, ושומרת אותם ב-PostgreSQL. התמלולים מתעדכנים רק בשני מקרים:
1. **כניסה ראשונית לאתר** (Startup)
2. **לחיצה על כפתור "Refresh Data"** בדשבורד

---

## 🔄 זרימה 1: כניסה ראשונית לאתר (Startup Flow)

### שלב 1: טעינת הדשבורד
- המשתמש נכנס לאתר → `App.jsx` מנתב ל-`/dashboard`
- `DashboardContainer` נטען → קורא ל-`useDashboardData` hook
- `useDashboardData.fetchDashboard()` רץ:
  - בודק **persistent cache** (localStorage) - אם יש נתונים, טוען אותם מיד
  - אם אין cache, קורא ל-`GET /api/v1/dashboard` מהבקאנד
  - שומר את הנתונים ב-cache (גם temporary וגם persistent)

### שלב 2: המתנה לרינדור הגרפים
- אחרי שהנתונים נטענו, המערכת מחכה שהגרפים ירנדרו ב-DOM:
  - מחפש אלמנטים עם `[data-chart-id]` (כרטיסי הגרפים)
  - מחפש אלמנטים עם `.recharts-wrapper` (הגרפים עצמם)
  - מנסה עד 20 פעמים, כל 500ms (סה"כ עד 10 שניות)
  - אם לא נמצאו גרפים אחרי 10 שניות → מבטל את התהליך

### שלב 3: צילום תמונות הגרפים
- אחרי שהגרפים מוכנים, המערכת מצלמת כל גרף:
  - עוברת על כל גרף ב-`dashboardData.charts`
  - מוצאת את האלמנט ב-DOM לפי `chartId` (או לפי אינדקס)
  - משתמשת ב-`html2canvas` כדי לצלם את הגרף לתמונה PNG
  - ממירה את התמונה ל-base64 string (`data:image/png;base64,...`)
  - שומרת: `{ chartId, imageUrl (base64), context (כותרת הגרף) }`

**חשוב:** המערכת מצלמת גם:
- **גרפי הדשבורד** (priority charts) - אלה שמוצגים למשתמש
- **גרפי BOX** (non-priority charts) - אלה שמרונדרים מאחורי הקלעים במיכל חבוי

### שלב 4: שליחה לבקאנד
- אחרי שכל הגרפים צולמו, המערכת שולחת `POST /api/v1/ai/chart-transcription/startup`:
  - Body: `{ charts: [{ chartId, imageUrl, context }, ...] }`
  - כל הגרפים נשלחים יחד (עד 8 גרפים בדרך כלל)

### שלב 5: עיבוד בבקאנד - `/startup` endpoint
- הבקאנד מקבל את הבקשה ב-`chartTranscription.js`
- בודק שהבקשה תקינה (body קיים, `charts` הוא מערך)
- עובר על כל גרף **לפי סדר** (sequential processing):
  
  **לכל גרף:**
  1. בודק שהגרף תקין (`chartId` ו-`imageUrl` קיימים)
  2. שולח את התמונה ל-OpenAI דרך `transcribeChartImage()`:
     - משתמש ב-`openaiQueue` כדי למנוע rate limits
     - קורא ל-OpenAI Vision API עם מודל `gpt-4o-mini`
     - מקבל תמלול טקסט (כותרת + 3-6 נקודות תובנה)
  3. שומר את התמלול ב-DB דרך `upsertTranscriptionSimple()`:
     - מבצע UPSERT ל-`public.ai_chart_transcriptions`
     - אם הגרף כבר קיים → מעדכן את `transcription_text` ו-`updated_at`
     - אם הגרף לא קיים → יוצר שורה חדשה
     - **מאמת את הכתיבה** - קורא את השורה בחזרה מה-DB לוודא שהנתונים נשמרו
  4. ממתין 800ms לפני הגרף הבא (למניעת rate limits)

### שלב 6: תגובה לפרונטאנד
- הבקאנד מחזיר `{ status: 'ok', totalChartsReceived: 8, processedCharts: 8, results: [...] }`
- הפרונטאנד מקבל את התגובה ומדווח בקונסול על הצלחה/כשלונות

---

## 🔄 זרימה 2: לחיצה על "Refresh Data"

### שלב 1: רענון הנתונים
- המשתמש לוחץ על כפתור "Refresh Data" בדשבורד
- `useDashboardData.refreshData()` רץ:
  - קורא ל-`POST /api/v1/dashboard/refresh` מהבקאנד
  - הבקאנד אוסף נתונים חדשים מכל המיקרו-שירותים
  - מחזיר נתונים מעודכנים עם `lastUpdated` חדש
  - הפרונטאנד מעדכן את ה-state ואת ה-cache

### שלב 2: המתנה לרינדור הגרפים החדשים
- אחרי שהנתונים התעדכנו, המערכת מחכה שהגרפים ירנדרו מחדש:
  - אותו תהליך כמו ב-startup - מחכה עד 10 שניות
  - בודק שהגרפים מופיעים ב-DOM

### שלב 3: צילום תמונות הגרפים החדשים
- מצלמת את כל הגרפים (דשבורד + BOX) עם הנתונים החדשים
- אותו תהליך כמו ב-startup

### שלב 4: שליחה לבקאנד
- שולחת `POST /api/v1/ai/chart-transcription/refresh`:
  - Body: `{ charts: [{ chartId, imageUrl, context }, ...] }`

### שלב 5: עיבוד בבקאנד - `/refresh` endpoint
- **זהה לחלוטין** ל-`/startup` endpoint:
  - עובר על כל גרף לפי סדר
  - שולח ל-OpenAI
  - שומר ב-DB (UPSERT - תמיד מעדכן גם אם קיים)
  - מאמת את הכתיבה

### שלב 6: תגובה לפרונטאנד
- הבקאנד מחזיר תגובה עם סטטוס כל גרף
- הפרונטאנד מדווח על הצלחה

---

## 🔄 זרימה 3: הצגת תמלולים בדוחות (Reports)

### שלב 1: יצירת דוח
- המשתמש נכנס ל-`/reports`
- בוחר סוג דוח ולוחץ "Generate Report"
- הפרונטאנד קורא ל-`POST /api/v1/reports/generate?format=json`
- הבקאנד יוצר את הדוח עם הגרפים הרלוונטיים

### שלב 2: רינדור הגרפים בדוח
- `ReportsPage` מרנדרת את הגרפים דרך `ChartWithNarration` component
- כל גרף מקבל `chartId` יציב (מ-`chart.id` או `chart-${index}`)

### שלב 3: טעינת תמלול מה-DB
- `ChartWithNarration` רץ `useEffect` כשה-component נטען:
  - קורא ל-`GET /api/v1/ai/chart-transcription/:chartId`
  - הבקאנד קורא ל-`findByChartId(chartId)` ב-`ChartTranscriptionsRepository`
  - מחפש ב-`public.ai_chart_transcriptions` לפי `chart_id`
  - מחזיר `{ exists: true/false, transcription_text: string | null, chartId: string }`

### שלב 4: הצגת התמלול
- אם `exists === true` ו-`transcription_text` לא ריק:
  - מציג את התמלול מתחת לגרף תחת כותרת "Chart Summary (AI-Generated)"
- אם `exists === false` או `transcription_text` ריק:
  - לא מציג תמלול (או מציג הודעה "No transcription available")

**חשוב:** בדוחות, המערכת **לא** קוראת ל-OpenAI אוטומטית. היא רק קוראת מה-DB. אם אין תמלול ב-DB, הגרף יוצג בלי תמלול.

---

## 🔑 נקודות מפתח

### 1. DB הוא המקור האמת היחיד
- כל התמלולים נשמרים ב-`public.ai_chart_transcriptions` ב-PostgreSQL
- אין cache מקומי, אין Redis - הכל ב-DB
- כל קריאה לתמלול עוברת דרך DB

### 2. OpenAI נקרא רק בשני מקרים
- **Startup** - כשנכנסים לאתר
- **Refresh** - כשלוחצים על "Refresh Data"
- **לא** נקרא אוטומטית מדוחות או ממקומות אחרים

### 3. UPSERT תמיד מעדכן
- גם ב-startup וגם ב-refresh, המערכת **תמיד** קוראת ל-OpenAI
- גם אם תמלול כבר קיים ב-DB, הוא **מוחלף** בתמלול חדש
- `updated_at` מתעדכן אוטומטית

### 4. עיבוד סדרתי למניעת rate limits
- הגרפים מעובדים **אחד אחרי השני** (לא במקביל)
- יש המתנה של 800ms בין כל גרף
- יש retry logic עם exponential backoff אם OpenAI מחזיר 429

### 5. גרפי BOX נכללים
- גרפי BOX (non-priority) מרונדרים מאחורי הקלעים
- הם נצלמים ונשלחים ל-OpenAI יחד עם גרפי הדשבורד
- כך שכל הגרפים מקבלים תמלול מעודכן

### 6. ChartId יציב
- כל גרף צריך `chartId` יציב ועקבי
- אותו `chartId` משמש:
  - ב-DOM (`data-chart-id`)
  - בצילום התמונה
  - בשמירה ב-DB
  - בקריאה מה-DB
- אם `chartId` לא עקבי, התמלול לא יתאים לגרף

---

## 📊 דיאגרמת זרימה

```
┌─────────────────────────────────────────────────────────────┐
│                    כניסה ראשונית / Refresh Data              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Frontend: טעינת נתונים + המתנה לרינדור גרפים                │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Frontend: צילום כל הגרפים (דשבורד + BOX) עם html2canvas     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Frontend: POST /ai/chart-transcription/startup או /refresh  │
│            Body: { charts: [{ chartId, imageUrl, context }] }│
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Backend: עיבוד כל גרף לפי סדר (sequential)                   │
│           ├─ OpenAI API (gpt-4o-mini)                        │
│           ├─ קבלת תמלול                                      │
│           ├─ UPSERT ל-DB (ai_chart_transcriptions)           │
│           └─ אימות כתיבה                                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Backend: תגובה לפרונטאנד עם סטטוס כל גרף                     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    דוחות: קריאה מה-DB                        │
│  GET /ai/chart-transcription/:chartId → DB → הצגה למשתמש     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 קבצים מרכזיים

### Frontend:
- `frontend/src/hooks/useDashboardData.js` - ניהול נתוני דשבורד + startup/refresh flow
- `frontend/src/components/Dashboard/DashboardContainer.jsx` - רינדור דשבורד + BOX charts
- `frontend/src/components/Reports/ReportsPage.jsx` - רינדור דוחות + `ChartWithNarration`
- `frontend/src/services/api.js` - קריאות API

### Backend:
- `backend/src/presentation/routes/chartTranscription.js` - endpoints (`/startup`, `/refresh`, `/:chartId`)
- `backend/src/application/services/transcribeChartService.js` - קריאה ל-OpenAI
- `backend/src/infrastructure/repositories/ChartTranscriptionsRepository.js` - CRUD ל-DB
- `backend/src/utils/openaiQueue.js` - תור למניעת rate limits

---

## ✅ סיכום

המערכת מבטיחה שתמלולי הגרפים תמיד מעודכנים, תוך ניהול חכם של קריאות ל-OpenAI (רק כשצריך) ושמירה אמינה ב-DB. כל התמלולים נשמרים ב-PostgreSQL, והמערכת תמיד קוראת משם - לא מ-cache מקומי.

