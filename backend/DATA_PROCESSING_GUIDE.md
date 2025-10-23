# Data Processing & Caching System Documentation
## HR Management Reporting Microservice

### 🎯 **Overview**

This system provides comprehensive filtering, sorting, and caching capabilities for all microservice data, ensuring organized, consistent, and ready-to-use data for analytics and reporting.

---

## 🔧 **Data Processing System**

### **DataProcessor Class**

The `DataProcessor` class handles filtering and sorting for each microservice data type with specific functions tailored to the data structure.

#### **Available Data Types:**
- `users` - User profiles and data
- `courses` - Course and lesson information
- `tests` - Assessment tests and attempts
- `skills` - Acquired skills and progress
- `exercises` - Exercise participation data
- `performanceTrends` - Performance analytics

---

## 📊 **Filtering Functions**

### **1. Users Filtering**
```javascript
// Available filters:
{
  organizationId: 'org-1',           // Filter by organization
  teamId: 'team-1',                  // Filter by team
  role: 'developer',                 // Filter by role
  department: 'Engineering',          // Filter by department
  status: 'active',                   // Filter by status
  skills: ['JavaScript', 'React'],   // Filter by skills
  minExperience: 3,                   // Minimum experience years
  lastLoginAfter: '2024-01-01',       // Last login date
  search: 'john'                     // Search in name/email
}
```

### **2. Courses Filtering**
```javascript
// Available filters:
{
  organizationId: 'org-1',           // Filter by organization
  instructorId: 'instructor-1',      // Filter by instructor
  status: 'active',                   // Filter by status
  minEnrollment: 10,                  // Minimum enrollment count
  maxEnrollment: 50,                 // Maximum enrollment count
  minCompletionRate: 70,             // Minimum completion rate
  maxCompletionRate: 95,             // Maximum completion rate
  minActiveUsers: 5,                 // Minimum active users
  search: 'javascript',              // Search in title
  createdAfter: '2024-01-01'         // Created after date
}
```

### **3. Skills Filtering**
```javascript
// Available filters:
{
  userId: 'user-1',                  // Filter by user
  courseId: 'course-1',             // Filter by course
  skillLevel: 'intermediate',        // Filter by skill level
  minConfidenceScore: 0.8,           // Minimum confidence score
  acquiredAfter: '2024-01-01',       // Acquired after date
  search: 'javascript'               // Search in skill name
}
```

### **4. Exercises Filtering**
```javascript
// Available filters:
{
  organizationId: 'org-1',           // Filter by organization
  difficulty: 'beginner',            // Filter by difficulty
  language: 'JavaScript',            // Filter by language
  minParticipation: 5,               // Minimum participation count
  minCompletion: 3,                 // Minimum completion count
  maxAverageTime: 60,                // Maximum average time
  search: 'calculator'               // Search in title
}
```

### **5. Performance Trends Filtering**
```javascript
// Available filters:
{
  organizationId: 'org-1',           // Filter by organization
  metric: 'course_completion_rate',  // Filter by metric type
  trend: 'increasing',               // Filter by trend direction
  period: 'last_30_days',            // Filter by period
  minValue: 50,                      // Minimum value
  maxValue: 100,                     // Maximum value
  minChangePercentage: 5              // Minimum change percentage
}
```

---

## 🔄 **Sorting Functions**

### **Available Sort Fields:**

#### **Users Sorting:**
- `firstName`, `lastName`, `email`, `role`, `department`
- `lastLogin`, `experience`, `skillCount`

#### **Courses Sorting:**
- `title`, `enrollmentCount`, `activeUsers`, `completionRate`
- `lessonCount`, `totalDuration`

#### **Skills Sorting:**
- `skillName`, `skillLevel`, `confidenceScore`, `acquiredAt`

#### **Exercises Sorting:**
- `title`, `difficulty`, `participationCount`, `completionCount`
- `averageTime`, `completionRate`

#### **Performance Trends Sorting:**
- `value`, `changePercentage`, `metric`, `trend`

### **Sort Order:**
- `asc` - Ascending order
- `desc` - Descending order

---

## 💾 **Caching System**

### **CacheManager Class**

The `CacheManager` provides intelligent caching with automatic expiration, hit rate tracking, and memory management.

#### **Cache Tables Created:**
- `users_cache` - Filtered and sorted user data
- `courses_cache` - Course data with completion rates
- `skills_cache` - Acquired skills data
- `exercises_cache` - Exercise participation data
- `performance_trends_cache` - Performance trend data
- `admin_dashboard_cache` - Cross-organizational dashboard data
- `hr_dashboard_cache` - Organization-specific HR dashboard data

#### **Cache Features:**
- **Automatic Expiration** - 5-minute cache duration
- **Hit Rate Tracking** - Monitor cache effectiveness
- **Memory Management** - Automatic cleanup of expired entries
- **LRU Eviction** - Remove least recently used entries when full
- **Cache Warming** - Pre-populate with common queries

---

## 🚀 **API Endpoints**

### **Data Processing Endpoints:**

#### **Process Users**
```
GET /api/process/users?filters={}&sortBy=lastName&order=asc
```

#### **Process Courses**
```
GET /api/process/courses?filters={}&sortBy=title&order=asc
```

#### **Process Skills**
```
GET /api/process/skills?filters={}&sortBy=skillName&order=asc
```

#### **Process Exercises**
```
GET /api/process/exercises?filters={}&sortBy=title&order=asc
```

#### **Process Trends**
```
GET /api/process/trends?filters={}&sortBy=value&order=desc
```

### **Cache Management Endpoints:**

#### **Get Cache Statistics**
```
GET /api/cache/stats
```

#### **Get Cache Tables**
```
GET /api/cache/tables
```

#### **Clear Specific Cache**
```
DELETE /api/cache/:tableName
```

#### **Clear All Cache**
```
DELETE /api/cache
```

#### **Enhanced Dashboard with Caching**
```
GET /api/dashboards/admin/enhanced?useCache=true
```

---

## 📈 **Usage Examples**

### **Example 1: Filter Active Users by Organization**
```javascript
// API Call
GET /api/process/users?filters={"organizationId":"org-1","status":"active"}&sortBy=lastName&order=asc

// Response
{
  "success": true,
  "data": [...], // Filtered and sorted users
  "stats": {
    "total": 15,
    "byRole": {"developer": 8, "manager": 4, "analyst": 3},
    "byDepartment": {"Engineering": 10, "Management": 5}
  },
  "filters": {"organizationId":"org-1","status":"active"},
  "sortBy": "lastName",
  "order": "asc"
}
```

### **Example 2: Get High-Performing Courses**
```javascript
// API Call
GET /api/process/courses?filters={"minCompletionRate":80}&sortBy=completionRate&order=desc

// Response includes courses with 80%+ completion rate, sorted by performance
```

### **Example 3: Cache Statistics**
```javascript
// API Call
GET /api/cache/stats

// Response
{
  "success": true,
  "stats": {
    "totalTables": 12,
    "totalEntries": 45,
    "tables": {
      "users_cache": {
        "entries": 8,
        "hitRate": "85.5%",
        "totalHits": 23,
        "totalMisses": 4,
        "memoryUsage": "2 KB"
      }
    }
  }
}
```

---

## 🔍 **Analytics Functions**

### **Data Statistics**
Each processed dataset includes comprehensive statistics:

#### **Users Stats:**
- Total count
- Grouping by role, department, status
- Experience distribution

#### **Courses Stats:**
- Total count
- Average completion rate
- Average enrollment
- Status distribution

#### **Skills Stats:**
- Total count
- Grouping by skill level
- Average confidence score

#### **Exercises Stats:**
- Total count
- Grouping by difficulty and language
- Average completion rate

---

## ⚡ **Performance Features**

### **Caching Benefits:**
- **Faster Response Times** - Cached data served instantly
- **Reduced Processing** - Avoid repeated filtering/sorting
- **Memory Efficient** - Automatic cleanup and LRU eviction
- **Hit Rate Monitoring** - Track cache effectiveness

### **Processing Benefits:**
- **Consistent Data** - Standardized filtering and sorting
- **Flexible Queries** - Multiple filter combinations
- **Real-time Analytics** - Instant statistics and insights
- **Scalable Architecture** - Handles large datasets efficiently

---

## 🛠️ **Integration**

### **Server Integration:**
The system automatically initializes when the server starts:
- Creates all cache tables
- Warms up cache with common queries
- Starts cache monitoring
- Provides comprehensive API endpoints

### **Frontend Integration:**
Use the processing endpoints to get organized data:
```javascript
// Example: Get filtered users for a dashboard
const response = await fetch('/api/process/users?filters={"status":"active"}&sortBy=lastName');
const { data, stats } = await response.json();
```

---

## 📋 **Best Practices**

### **Filtering:**
- Use specific filters to reduce data volume
- Combine multiple filters for precise results
- Use search filters for text-based queries

### **Sorting:**
- Sort by relevant fields for your use case
- Use descending order for performance metrics
- Consider user experience when choosing sort fields

### **Caching:**
- Monitor cache hit rates for optimization
- Clear cache when data updates significantly
- Use cache warming for frequently accessed data

### **Performance:**
- Use the enhanced dashboard endpoint for better performance
- Monitor cache statistics regularly
- Implement proper error handling for API calls

---

**🎉 Your data processing and caching system is now ready for production use!**
