# 🎨 מיקומי הגדרות הצבעים

## קבצים שמגדירים צבעים ל-Header ו-Body

### 1. **Header (הדר)**
📁 `frontend/src/components/Layout/Header.jsx`
- **שורה 22-27:** Inline style עם `backgroundColor`
  - Light mode: `#ffffff` (לבן)
  - Dark mode: `#374151` (gray-700 - בהיר יותר)

### 2. **Body/Layout (גוף הדף)**
📁 `frontend/src/components/Layout/Layout.jsx`
- **שורה 8-13:** Inline style עם `backgroundColor`
  - Light mode: `#f9fafb` (gray-50)
  - Dark mode: `#000000` (black - כהה יותר)

### 3. **Body CSS (גלובלי)**
📁 `frontend/src/styles/index.css`
- **שורה 6-18:** CSS rules עם `!important`
  - Light mode: `#f9fafb` (gray-50)
  - Dark mode: `#000000` (black) - עם `!important`

## סיכום הצבעים ב-Dark Mode:

- **Header:** `#374151` (gray-700) - בהיר יותר
- **Body:** `#000000` (black) - כהה יותר

## הערות:
- Header משתמש רק ב-inline style (ללא Tailwind classes)
- Layout/Body משתמש ב-inline style + CSS עם `!important`
- כל ה-Tailwind `bg-*` classes הוסרו כדי למנוע התנגשויות

