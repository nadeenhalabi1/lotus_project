# איך לראות את ה-Mock Data

## 📍 מיקום הקוד

הקוד שיוצר את ה-mock data נמצא ב:
```
backend/src/application/useCases/CollectDataUseCase.js
```
הפונקציה `generateMockData(service)` (שורות 62-273) יוצרת את כל הנתונים.

## 🌐 API Endpoints

### 1. כל השירותים (All Services)
```
GET http://localhost:3000/api/v1/data/raw
```
מחזיר סקירה של כל השירותים עם נתונים לדוגמה.

**דוגמה לתשובה:**
```json
{
  "totalServices": 5,
  "services": ["directory", "courseBuilder", "assessment", "contentStudio", "learningAnalytics"],
  "data": [
    {
      "service": "directory",
      "timestamp": "2024-01-15T10:30:00.000Z",
      "metrics": { ... },
      "details": { "users": [...] },
      "sampleData": {
        "metricsCount": 6,
        "detailsKeys": ["users"],
        "sampleMetrics": { ... },
        "sampleDetails": { "usersCount": 150 }
      }
    },
    ...
  ]
}
```

### 2. שירות ספציפי (Specific Service)

#### Directory (משתמשים וארגונים)
```
GET http://localhost:3000/api/v1/data/raw?service=directory
```

**נתונים:**
- `users`: רשימת משתמשים עם `user_id`, `user_name`, `organization`, `role`, `department`
- `metrics`: `totalUsers`, `totalOrganizations`, `activeUsers`, `usersByRole`, `usersByDepartment`

#### Course Builder (קורסים)
```
GET http://localhost:3000/api/v1/data/raw?service=courseBuilder
```

**נתונים:**
- `courses`: רשימת קורסים עם `course_id`, `course_name`, `duration`, `totalEnrollments`, `activeEnrollments`, `completionRate`, `averageRating`
- `metrics`: `totalCourses`, `totalEnrollments`, `activeEnrollments`, `averageCompletionRate`, `averageRating`

#### Assessment (הערכות)
```
GET http://localhost:3000/api/v1/data/raw?service=assessment
```

**נתונים:**
- `assessments`: רשימת הערכות עם `assessment_id`, `course_id`, `questions`, `answers`, `grades`, `final_grade`, `status`
- `metrics`: `totalAssessments`, `averageScore`, `passRate`, `completedAssessments`, `passedAssessments`

#### Content Studio (תוכן)
```
GET http://localhost:3000/api/v1/data/raw?service=contentStudio
```

**נתונים:**
- `contentItems`: רשימת פריטי תוכן עם `content_id`, `course_id`, `trainer_id`, `content_type`, `views`, `likes`
- `metrics`: `totalContentItems`, `totalViews`, `totalLikes`, `averageViewsPerContent`, `contentByType`, `engagementScore`

#### Learning Analytics (אנליטיקה)
```
GET http://localhost:3000/api/v1/data/raw?service=learningAnalytics
```

**נתונים:**
- `trends`: מגמות עם `period`, `date_range`, `metrics`, `breakdowns`
- `metrics`: `totalLearningHours`, `platformUsageRate`, `userSatisfactionScore`, `activeLearningSessions`, `learningROI`

## 🔑 אימות (Authentication)

הכלי דורש JWT token. בדפדפן, פתחי את Developer Tools (F12) → Network, ובקשות ל-API יראו את ה-token.

או השתמשי ב-Postman/Insomnia עם:
```
Authorization: Bearer <your-token>
```

## 📊 מבנה הנתונים

כל שירות מחזיר מבנה דומה:
```json
{
  "service": "directory",
  "data": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "data": {
      "metrics": {
        // Metrics aggregated from detailed data
      },
      "details": {
        // Raw detailed data (users, courses, etc.)
      }
    },
    "metadata": {
      "source": "directory",
      "collected_at": "2024-01-15T10:30:00.000Z",
      "schema_version": "1.0"
    }
  }
}
```

## 🎯 איך הגרפים משתמשים בנתונים

1. **GetDashboardUseCase** - קורא את `metrics` ליצירת גרפים ראשיים
2. **GetCombinedAnalyticsUseCase** - קורא את `details` ליצירת גרפים משולבים
3. **Chart Components** - מציגים את הנתונים בפורמט ויזואלי

## 💡 טיפים

- השתמשי ב-`?service=<name>` כדי לראות נתונים של שירות ספציפי
- הנתונים מתעדכנים כל פעם שמפעילים `/api/v1/data/refresh`
- ב-development mode, הנתונים נטענים אוטומטית בעת הפעלת השרת

