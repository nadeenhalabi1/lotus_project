# הוראות הרצה - EducoreAI Management Reporting

## שלב 1: התקנת תלויות (אם עדיין לא הותקנו)

**פתח PowerShell והרץ:**

```powershell
# Backend
cd C:\Users\nadin\Desktop\lotus_project\lotus_project\backend
npm install --legacy-peer-deps

# Frontend (חלון חדש)
cd C:\Users\nadin\Desktop\lotus_project\lotus_project\frontend
npm install --legacy-peer-deps
```

## שלב 2: הרצת השרתים

**פתח 2 חלונות PowerShell:**

### חלון 1 - Backend:
```powershell
cd C:\Users\nadin\Desktop\lotus_project\lotus_project\backend
npm run dev
```

**תראה:**
```
Server running on port 3000
Environment: development
```

### חלון 2 - Frontend:
```powershell
cd C:\Users\nadin\Desktop\lotus_project\lotus_project\frontend
npm run dev
```

**תראה:**
```
VITE v5.0.8  ready in XXX ms
➜  Local:   http://localhost:5173/
```

## שלב 3: פתח בדפדפן

**פתח את הקישור:**
```
http://localhost:5173
```

## אם יש שגיאות:

1. **Backend לא רץ?**
   - בדוק ש-Redis רץ (אופציונלי - לא חובה)
   - בדוק ש-port 3000 פנוי

2. **Frontend לא רץ?**
   - בדוק ש-port 5173 פנוי
   - נסה: `npm install --legacy-peer-deps` שוב

3. **ERR_CONNECTION_REFUSED?**
   - ודא שהשרתים רצים בחלונות PowerShell
   - חכה כמה שניות שהשרתים יתחילו

## הערות:

- ✅ כל התקשורת עם מיקרוסרביסים מוחלפת ב-MOCK DATA
- ✅ OpenAI API לא נדרש - משתמש ב-MOCK insights
- ✅ Redis אופציונלי - אם לא רץ, הנתונים לא יישמרו אבל האפליקציה תעבוד

---

**אחרי שהשרתים רצים, פתח: http://localhost:5173**

