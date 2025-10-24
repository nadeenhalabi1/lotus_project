# Mock Data API Documentation

## Overview
This document describes the mock data API endpoints for the educoreAI Management Reporting Microservice. All endpoints return realistic mock data from various microservices.

## Base URL
```
http://localhost:3001/api/microservices
```

## DIRECTORY Microservice

### Get All Users
```http
GET /directory/users
```
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "user_001",
      "firstName": "Sarah",
      "lastName": "Johnson",
      "email": "sarah.johnson@educoreai.com",
      "role": "Software Engineer",
      "department": "Engineering",
      "manager": "Mike Chen",
      "hireDate": "2022-03-15",
      "location": "San Francisco, CA",
      "status": "active",
      "skills": ["JavaScript", "React", "Node.js", "Python"],
      "certifications": ["AWS Certified Developer", "Google Cloud Professional"],
      "lastLogin": "2024-01-15T09:30:00Z"
    }
  ],
  "total": 12345,
  "active": 11890,
  "newThisMonth": 156
}
```

### Get User by ID
```http
GET /directory/users/:id
```

### Get All Departments
```http
GET /directory/departments
```

## COURSEBUILDER Microservice

### Get All Courses
```http
GET /coursebuilder/courses
```
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "course_001",
      "title": "Advanced JavaScript Development",
      "description": "Master modern JavaScript concepts and frameworks",
      "instructor": "Sarah Johnson",
      "category": "Programming",
      "difficulty": "Advanced",
      "duration": "8 weeks",
      "lessons": [
        {
          "id": "lesson_001",
          "title": "ES6+ Features and Syntax",
          "duration": 45,
          "order": 1,
          "type": "video",
          "completionRate": 0.87
        }
      ],
      "totalEnrollments": 1247,
      "activeEnrollments": 892,
      "completionRate": 0.73,
      "averageRating": 4.6
    }
  ],
  "total": 156,
  "totalEnrollments": 8765,
  "activeEnrollments": 6890,
  "averageCompletionRate": 0.74
}
```

### Get Course by ID
```http
GET /coursebuilder/courses/:id
```

### Get Course Lessons
```http
GET /coursebuilder/lessons/:courseId
```

## ASSESSMENT Microservice

### Get All Tests
```http
GET /assessment/tests
```
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "test_001",
      "title": "JavaScript Fundamentals Assessment",
      "courseId": "course_001",
      "questions": [
        {
          "id": "q_001",
          "question": "What is the difference between let and var in JavaScript?",
          "type": "multiple-choice",
          "options": ["No difference", "let has block scope", "var is faster", "let is deprecated"],
          "correctAnswer": 1,
          "difficulty": "medium"
        }
      ],
      "totalQuestions": 25,
      "timeLimit": 60,
      "passingScore": 70,
      "attempts": [
        {
          "userId": "user_001",
          "attemptNumber": 1,
          "score": 85,
          "grade": "B+",
          "completedAt": "2024-01-10T14:30:00Z",
          "timeSpent": 45,
          "feedback": "Excellent understanding of JavaScript fundamentals."
        }
      ],
      "averageScore": 85.2,
      "passRate": 0.87,
      "totalAttempts": 1247
    }
  ],
  "total": 89,
  "totalAttempts": 8765,
  "averageScore": 82.3,
  "overallPassRate": 0.84
}
```

### Get Test by ID
```http
GET /assessment/tests/:id
```

### Get Test Attempts
```http
GET /assessment/attempts/:testId
```

## LEARNERAI Microservice

### Get All Skills Acquired
```http
GET /learnerai/skills
```
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "userId": "user_001",
      "courseId": "course_001",
      "skills": [
        {
          "skill": "Advanced JavaScript",
          "proficiency": 0.85,
          "acquiredAt": "2024-01-10T14:30:00Z",
          "confidence": 0.88
        }
      ]
    }
  ],
  "total": 5798,
  "averageProficiency": 0.82,
  "skillsThisMonth": 456
}
```

### Get User Skills
```http
GET /learnerai/skills/:userId
```

### Get Skill Categories
```http
GET /learnerai/categories
```

## DEVLAB Microservice

### Get All Exercises
```http
GET /devlab/exercises
```
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "exercise_001",
      "title": "Build a Todo App with React",
      "courseId": "course_001",
      "difficulty": "intermediate",
      "estimatedTime": 120,
      "technologies": ["React", "JavaScript", "CSS"],
      "participants": [
        {
          "userId": "user_001",
          "participationDate": "2024-01-08T10:00:00Z",
          "completionTime": 95,
          "difficultyRating": 3,
          "feedback": "Great exercise! Helped solidify React concepts."
        }
      ],
      "totalParticipants": 1247,
      "averageCompletionTime": 98,
      "averageDifficultyRating": 2.8
    }
  ],
  "total": 67,
  "totalParticipants": 4567,
  "averageParticipationRate": 0.73,
  "difficultyDistribution": {
    "beginner": 0.35,
    "intermediate": 0.45,
    "advanced": 0.20
  }
}
```

### Get Exercise by ID
```http
GET /devlab/exercises/:id
```

### Get User Participation
```http
GET /devlab/participation/:userId
```

## LEARNING ANALYTICS Microservice

### Get Performance Trends
```http
GET /analytics/trends
```
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "metric": "Course Completion Rate",
      "currentValue": 0.74,
      "previousValue": 0.68,
      "change": 0.06,
      "trend": "increasing",
      "period": "monthly",
      "dataPoints": [
        { "date": "2023-10-01", "value": 0.68 },
        { "date": "2023-11-01", "value": 0.71 },
        { "date": "2023-12-01", "value": 0.72 },
        { "date": "2024-01-01", "value": 0.74 }
      ]
    }
  ]
}
```

### Get Skill Gaps
```http
GET /analytics/skill-gaps
```

### Get Course Effectiveness
```http
GET /analytics/course-effectiveness
```

### Get Strategic Forecasts
```http
GET /analytics/forecasts
```

### Get AI Insights
```http
GET /analytics/insights
```

## Dashboard Overview

### Get Aggregated Dashboard Data
```http
GET /dashboard/overview
```
**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 12345,
    "activeUsers": 11890,
    "totalCourses": 156,
    "totalEnrollments": 8765,
    "averageCompletionRate": 0.74,
    "totalSkillsAcquired": 5798,
    "averageProficiency": 0.82,
    "totalExercises": 67,
    "averageParticipationRate": 0.73,
    "insights": [
      {
        "id": "insight_001",
        "type": "anomaly",
        "title": "Unusual Drop in JavaScript Course Completion",
        "description": "JavaScript course completion rate dropped 15% this week.",
        "severity": "medium",
        "confidence": 0.78,
        "recommendation": "Investigate recent course updates and gather user feedback"
      }
    ],
    "trends": [...],
    "skillGaps": [...]
  }
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

## Status Codes

- `200` - Success
- `404` - Resource not found
- `500` - Internal server error

## Usage Examples

### Fetch all users
```javascript
fetch('http://localhost:3001/api/microservices/directory/users')
  .then(response => response.json())
  .then(data => console.log(data));
```

### Fetch course details
```javascript
fetch('http://localhost:3001/api/microservices/coursebuilder/courses/course_001')
  .then(response => response.json())
  .then(data => console.log(data));
```

### Fetch dashboard overview
```javascript
fetch('http://localhost:3001/api/microservices/dashboard/overview')
  .then(response => response.json())
  .then(data => console.log(data));
```

