# Enhanced API Documentation - Filtering and Normalization

This document describes the enhanced API endpoints that provide advanced filtering and data normalization capabilities for all microservice data.

## Base URL
```
http://localhost:3001/api/enhanced
```

## Query Parameters

### Common Parameters
- `normalize=true` - Returns normalized data with consistent formatting
- `limit=N` - Limits the number of results returned
- `offset=N` - Skips the first N results (for pagination)

## DIRECTORY Microservice Endpoints

### Get All Users with Filtering
```http
GET /enhanced/directory/users
```

**Query Parameters:**
- `department` - Filter by department (e.g., "Engineering", "Marketing")
- `role` - Filter by role (partial match)
- `status` - Filter by status ("active", "inactive")
- `skills` - Comma-separated list of skills to filter by
- `location` - Filter by location (partial match)
- `normalize` - Set to "true" for normalized data

**Example:**
```http
GET /enhanced/directory/users?department=Engineering&skills=JavaScript,React&normalize=true
```

### Get Users by Department
```http
GET /enhanced/directory/users/department/{department}
```

**Example:**
```http
GET /enhanced/directory/users/department/Engineering?normalize=true
```

### Get Users by Skills
```http
GET /enhanced/directory/users/skills/{skills}
```

**Example:**
```http
GET /enhanced/directory/users/skills/JavaScript,Python,React
```

### Advanced User Search
```http
POST /enhanced/directory/users/search
```

**Request Body:**
```json
{
  "department": "Engineering",
  "role": "Developer",
  "skills": ["JavaScript", "React"],
  "status": "active",
  "location": "San Francisco"
}
```

## COURSEBUILDER Microservice Endpoints

### Get All Courses with Filtering
```http
GET /enhanced/coursebuilder/courses
```

**Query Parameters:**
- `category` - Filter by category ("Programming", "Data Science", "Marketing")
- `difficulty` - Filter by difficulty ("Beginner", "Intermediate", "Advanced")
- `instructor` - Filter by instructor name (partial match)
- `minRating` - Minimum average rating
- `minCompletionRate` - Minimum completion rate (0.0-1.0)
- `normalize` - Set to "true" for normalized data

**Example:**
```http
GET /enhanced/coursebuilder/courses?category=Programming&difficulty=Advanced&minRating=4.5&normalize=true
```

### Get Courses by Category
```http
GET /enhanced/coursebuilder/courses/category/{category}
```

**Example:**
```http
GET /enhanced/coursebuilder/courses/category/Programming?normalize=true
```

### Get Lessons by Type
```http
GET /enhanced/coursebuilder/lessons/type/{type}
```

**Query Parameters:**
- `minCompletionRate` - Minimum lesson completion rate
- `normalize` - Set to "true" for normalized data

**Example:**
```http
GET /enhanced/coursebuilder/lessons/type/video?minCompletionRate=0.8&normalize=true
```

## ASSESSMENT Microservice Endpoints

### Get All Tests with Filtering
```http
GET /enhanced/assessment/tests
```

**Query Parameters:**
- `courseId` - Filter by course ID
- `normalize` - Set to "true" for normalized data

**Example:**
```http
GET /enhanced/assessment/tests?courseId=course_001&normalize=true
```

### Get Attempts by User
```http
GET /enhanced/assessment/attempts/user/{userId}
```

**Query Parameters:**
- `minScore` - Minimum score
- `maxScore` - Maximum score
- `grade` - Filter by grade ("A", "B+", "C", etc.)
- `normalize` - Set to "true" for normalized data

**Example:**
```http
GET /enhanced/assessment/attempts/user/user_001?minScore=80&normalize=true
```

### Get Attempts by Score Range
```http
GET /enhanced/assessment/attempts/score/{minScore}/{maxScore}
```

**Example:**
```http
GET /enhanced/assessment/attempts/score/80/100?normalize=true
```

## LEARNERAI Microservice Endpoints

### Get Skills by User
```http
GET /enhanced/learnerai/skills/user/{userId}
```

**Query Parameters:**
- `minProficiency` - Minimum proficiency level (0.0-1.0)
- `minConfidence` - Minimum confidence level (0.0-1.0)
- `normalize` - Set to "true" for normalized data

**Example:**
```http
GET /enhanced/learnerai/skills/user/user_001?minProficiency=0.8&normalize=true
```

### Get Skills by Proficiency Level
```http
GET /enhanced/learnerai/skills/proficiency/{minProficiency}
```

**Example:**
```http
GET /enhanced/learnerai/skills/proficiency/0.8?normalize=true
```

## DEVLAB Microservice Endpoints

### Get Exercises by Difficulty
```http
GET /enhanced/devlab/exercises/difficulty/{difficulty}
```

**Query Parameters:**
- `normalize` - Set to "true" for normalized data

**Example:**
```http
GET /enhanced/devlab/exercises/difficulty/intermediate?normalize=true
```

### Get Participant Data by User
```http
GET /enhanced/devlab/participants/user/{userId}
```

**Query Parameters:**
- `normalize` - Set to "true" for normalized data

**Example:**
```http
GET /enhanced/devlab/participants/user/user_001?normalize=true
```

## LEARNING ANALYTICS Microservice Endpoints

### Get Performance Analytics
```http
GET /enhanced/learning-analytics/performance
```

**Query Parameters:**
- `department` - Filter by department
- `severity` - Filter insights by severity ("low", "medium", "high")
- `normalize` - Set to "true" for normalized data

**Example:**
```http
GET /enhanced/learning-analytics/performance?department=Engineering&normalize=true
```

### Get Insights by Type
```http
GET /enhanced/learning-analytics/insights/type/{type}
```

**Query Parameters:**
- `severity` - Filter by severity
- `minConfidence` - Minimum confidence level
- `normalize` - Set to "true" for normalized data

**Example:**
```http
GET /enhanced/learning-analytics/insights/type/anomaly?severity=high&normalize=true
```

### Get Skill Gaps by Department
```http
GET /enhanced/learning-analytics/skill-gaps/department/{department}
```

**Query Parameters:**
- `severity` - Filter by gap severity
- `normalize` - Set to "true" for normalized data

**Example:**
```http
GET /enhanced/learning-analytics/skill-gaps/department/Engineering?severity=high
```

## Cross-Microservice Analytics Endpoints

### Get Comprehensive User Analytics
```http
GET /enhanced/analytics/user/{userId}
```

**Query Parameters:**
- `normalize` - Set to "true" for normalized data

**Response includes:**
- User profile data
- Course enrollments count
- Test attempts count and average score
- Skills acquired count and average proficiency
- Exercise participations count

**Example:**
```http
GET /enhanced/analytics/user/user_001?normalize=true
```

### Get Course Effectiveness Analytics
```http
GET /enhanced/analytics/course/{courseId}
```

**Query Parameters:**
- `normalize` - Set to "true" for normalized data

**Response includes:**
- Course details
- Effectiveness metrics
- Test data and average scores
- Skills acquired from the course
- Average skill proficiency

**Example:**
```http
GET /enhanced/analytics/course/course_001?normalize=true
```

## Data Normalization

When `normalize=true` is specified, the API returns data with:

### User Normalization
- Full name concatenation
- Email lowercase conversion
- Skills and certifications lowercase
- ISO date formatting
- Calculated tenure in days

### Course Normalization
- Category and difficulty lowercase
- Completion rates rounded to 2 decimal places
- Ratings rounded to 1 decimal place
- ISO date formatting
- Calculated enrollment ratios

### Test Normalization
- Question types and difficulties lowercase
- Scores and rates rounded appropriately
- ISO date formatting
- Pass/fail status calculation

### Skill Normalization
- Skill names lowercase
- Proficiency and confidence rounded to 2 decimal places
- Proficiency and confidence level categorization
- ISO date formatting

### Exercise Normalization
- Difficulty and technologies lowercase
- Completion times rounded appropriately
- ISO date formatting
- Completion ratio calculations

### Performance Trend Normalization
- Values rounded to 2 decimal places
- Change percentage calculations
- Trend directions lowercase
- ISO date formatting

### Insight Normalization
- Types and severities lowercase
- Confidence rounded to 2 decimal places
- Confidence level categorization
- ISO date formatting

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message description"
}
```

## Success Responses

All successful responses include:

```json
{
  "success": true,
  "count": 123,
  "data": [...],
  "filters": {...}
}
```

## Examples

### Get Engineering Users with JavaScript Skills (Normalized)
```bash
curl "http://localhost:3001/api/enhanced/directory/users?department=Engineering&skills=JavaScript&normalize=true"
```

### Get Advanced Programming Courses with High Ratings
```bash
curl "http://localhost:3001/api/enhanced/coursebuilder/courses?category=Programming&difficulty=Advanced&minRating=4.5&normalize=true"
```

### Get High-Scoring Test Attempts for a User
```bash
curl "http://localhost:3001/api/enhanced/assessment/attempts/user/user_001?minScore=90&normalize=true"
```

### Get Comprehensive Analytics for a User
```bash
curl "http://localhost:3001/api/enhanced/analytics/user/user_001?normalize=true"
```

This enhanced API provides powerful filtering and normalization capabilities for all microservice data, making it easy to extract meaningful insights and perform complex queries across the entire system.

