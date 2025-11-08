# הוראות להוספת לוגו

## שלבים להוספת הלוגו:

### 1. הוסף את קבצי הלוגו
העתק את קבצי הלוגו שלך לתיקייה:
```
frontend/src/assets/images/
```

**שמות הקבצים:**
- `logo-light.png` - לוגו עבור Light Mode
- `logo-dark.png` - לוגו עבור Dark Mode

### 2. עדכן את הקוד
פתח את הקובץ:
```
frontend/src/components/Layout/Header.jsx
```

**הסר את השורות:**
```javascript
let logoLight = null;
let logoDark = null;
```

**הוסף במקומן:**
```javascript
import logoLight from '../../assets/images/logo-light.png';
import logoDark from '../../assets/images/logo-dark.png';
```

### 3. שמור ובדוק
לאחר הוספת הקבצים ועדכון הקוד:
- הלוגו יופיע אוטומטית במקום האייקון
- הלוגו יתחלף אוטומטית בין Light ו-Dark Mode
- אם הלוגו לא נטען, יופיע האייקון המקורי כגיבוי

## פורמטים נתמכים:
- ✅ PNG (מומלץ)
- ✅ SVG (מומלץ - איכות מעולה)
- ✅ JPG/JPEG

## גודל מומלץ:
- **גובה:** 32-40px
- **רוחב:** אוטומטי (שמירה על יחס גובה-רוחב)
- **פורמט:** PNG עם שקיפות (תוצאות טובות יותר)

## דוגמה לקוד מעודכן:

```javascript
import logoLight from '../../assets/images/logo-light.png';
import logoDark from '../../assets/images/logo-dark.png';

const Header = () => {
  const { theme } = useTheme();
  const logo = theme === 'dark' ? logoDark : logoLight;
  // ... rest of code
}
```

