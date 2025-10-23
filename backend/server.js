const express = require('express');
const cors = require('cors');
const path = require('path');
const DataProcessor = require('./dataProcessor');
const CacheManager = require('./cacheManager');
const DataInsightsService = require('./dataInsightsService');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize data processing and caching systems
const dataProcessor = new DataProcessor();
const cacheManager = new CacheManager();
const insightsService = new DataInsightsService(dataProcessor, cacheManager);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Mock Data from All Microservices
const mockData = {
  // DIRECTORY Microservice Data
  directory: {
    users: [
      {
        id: 'user-1',
        email: 'john.doe@acme.com',
        firstName: 'John',
        lastName: 'Doe',
        organizationId: 'org-1',
        teamId: 'team-1',
        role: 'developer',
        department: 'Engineering',
        status: 'active',
        lastLogin: '2024-01-15T10:30:00Z',
        profile: {
          skills: ['JavaScript', 'React', 'Node.js'],
          experience: '5 years',
          certifications: ['AWS Certified Developer']
        }
      },
      {
        id: 'user-2',
        email: 'jane.smith@techstart.com',
        firstName: 'Jane',
        lastName: 'Smith',
        organizationId: 'org-2',
        teamId: 'team-3',
        role: 'manager',
        department: 'Development',
        status: 'active',
        lastLogin: '2024-01-15T09:15:00Z',
        profile: {
          skills: ['Python', 'Django', 'Leadership'],
          experience: '8 years',
          certifications: ['PMP Certified']
        }
      },
      {
        id: 'user-3',
        email: 'mike.wilson@global.com',
        firstName: 'Mike',
        lastName: 'Wilson',
        organizationId: 'org-3',
        teamId: 'team-5',
        role: 'analyst',
        department: 'Operations',
        status: 'active',
        lastLogin: '2024-01-14T16:45:00Z',
        profile: {
          skills: ['Data Analysis', 'SQL', 'Excel'],
          experience: '3 years',
          certifications: ['Google Analytics Certified']
        }
      }
    ],
    organizations: [
      { id: 'org-1', name: 'Acme Corporation', status: 'active', userCount: 45 },
      { id: 'org-2', name: 'TechStart Inc', status: 'active', userCount: 32 },
      { id: 'org-3', name: 'Global Solutions Ltd', status: 'active', userCount: 28 }
    ],
    teams: [
      { id: 'team-1', name: 'Engineering', organizationId: 'org-1', memberCount: 15 },
      { id: 'team-2', name: 'Marketing', organizationId: 'org-1', memberCount: 8 },
      { id: 'team-3', name: 'Development', organizationId: 'org-2', memberCount: 12 },
      { id: 'team-4', name: 'Sales', organizationId: 'org-2', memberCount: 10 },
      { id: 'team-5', name: 'Operations', organizationId: 'org-3', memberCount: 18 }
    ]
  },

  // COURSE BUILDER Microservice Data
  courseBuilder: {
    courses: [
      {
        id: 'course-1',
        title: 'JavaScript Fundamentals',
        organizationId: 'org-1',
        instructorId: 'instructor-1',
        status: 'active',
        enrollmentCount: 25,
        activeUsers: 18,
        completionRate: 72,
        lessons: [
          {
            id: 'lesson-1',
            title: 'Variables and Data Types',
            duration: 45,
            completionCount: 22,
            averageTime: 38
          },
          {
            id: 'lesson-2',
            title: 'Functions and Scope',
            duration: 60,
            completionCount: 19,
            averageTime: 52
          },
          {
            id: 'lesson-3',
            title: 'DOM Manipulation',
            duration: 75,
            completionCount: 16,
            averageTime: 68
          }
        ]
      },
      {
        id: 'course-2',
        title: 'Python for Data Science',
        organizationId: 'org-2',
        instructorId: 'instructor-2',
        status: 'active',
        enrollmentCount: 18,
        activeUsers: 15,
        completionRate: 83,
        lessons: [
          {
            id: 'lesson-4',
            title: 'Pandas Basics',
            duration: 90,
            completionCount: 15,
            averageTime: 85
          },
          {
            id: 'lesson-5',
            title: 'Data Visualization',
            duration: 120,
            completionCount: 12,
            averageTime: 110
          }
        ]
      }
    ],
    enrollments: [
      { userId: 'user-1', courseId: 'course-1', enrolledAt: '2024-01-01', status: 'active' },
      { userId: 'user-2', courseId: 'course-2', enrolledAt: '2024-01-05', status: 'completed' },
      { userId: 'user-3', courseId: 'course-1', enrolledAt: '2024-01-10', status: 'active' }
    ]
  },

  // ASSESSMENT Microservice Data
  assessment: {
    tests: [
      {
        id: 'test-1',
        courseId: 'course-1',
        title: 'JavaScript Fundamentals Quiz',
        questions: [
          {
            id: 'q1',
            question: 'What is the correct way to declare a variable in JavaScript?',
            options: ['var x = 5', 'let x = 5', 'const x = 5', 'All of the above'],
            correctAnswer: 3,
            difficulty: 'easy'
          },
          {
            id: 'q2',
            question: 'What does DOM stand for?',
            options: ['Document Object Model', 'Data Object Management', 'Dynamic Object Method', 'None of the above'],
            correctAnswer: 0,
            difficulty: 'medium'
          }
        ],
        totalAttempts: 45,
        averageScore: 78,
        passRate: 85
      }
    ],
    attempts: [
      {
        id: 'attempt-1',
        userId: 'user-1',
        testId: 'test-1',
        score: 85,
        maxScore: 100,
        passed: true,
        attemptNumber: 1,
        completedAt: '2024-01-15T14:30:00Z',
        timeSpent: 25,
        answers: [
          { questionId: 'q1', selectedAnswer: 3, correct: true },
          { questionId: 'q2', selectedAnswer: 0, correct: true }
        ]
      },
      {
        id: 'attempt-2',
        userId: 'user-2',
        testId: 'test-1',
        score: 92,
        maxScore: 100,
        passed: true,
        attemptNumber: 1,
        completedAt: '2024-01-14T16:45:00Z',
        timeSpent: 18,
        answers: [
          { questionId: 'q1', selectedAnswer: 3, correct: true },
          { questionId: 'q2', selectedAnswer: 0, correct: true }
        ]
      }
    ],
    feedback: [
      {
        id: 'feedback-1',
        attemptId: 'attempt-1',
        userId: 'user-1',
        overallFeedback: 'Great job! You demonstrated solid understanding of JavaScript fundamentals.',
        questionFeedback: [
          { questionId: 'q1', feedback: 'Excellent understanding of variable declaration' },
          { questionId: 'q2', feedback: 'Perfect! You know what DOM stands for' }
        ],
        suggestions: ['Consider exploring more advanced JavaScript concepts', 'Practice with real-world projects']
      }
    ]
  },

  // LEARNER AI Microservice Data
  learnerAI: {
    skillsAcquired: [
      {
        id: 'skill-1',
        userId: 'user-1',
        skillName: 'JavaScript Programming',
        skillLevel: 'intermediate',
        acquiredAt: '2024-01-15T14:30:00Z',
        courseId: 'course-1',
        confidenceScore: 0.85,
        evidence: ['Completed JavaScript Fundamentals course', 'Passed assessment with 85% score']
      },
      {
        id: 'skill-2',
        userId: 'user-2',
        skillName: 'Python Data Analysis',
        skillLevel: 'advanced',
        acquiredAt: '2024-01-14T16:45:00Z',
        courseId: 'course-2',
        confidenceScore: 0.92,
        evidence: ['Completed Python for Data Science course', 'Passed assessment with 92% score']
      }
    ],
    skillProgress: [
      {
        userId: 'user-1',
        skillName: 'JavaScript Programming',
        progressPercentage: 75,
        lastUpdated: '2024-01-15T14:30:00Z',
        milestones: [
          { milestone: 'Basic Syntax', completed: true, completedAt: '2024-01-10' },
          { milestone: 'Functions', completed: true, completedAt: '2024-01-12' },
          { milestone: 'DOM Manipulation', completed: false, targetDate: '2024-01-20' }
        ]
      }
    ]
  },

  // DEVLAB Microservice Data
  devLab: {
    exercises: [
      {
        id: 'exercise-1',
        title: 'Build a Calculator',
        difficulty: 'beginner',
        language: 'JavaScript',
        organizationId: 'org-1',
        participationCount: 15,
        completionCount: 12,
        averageTime: 45
      },
      {
        id: 'exercise-2',
        title: 'Data Analysis with Pandas',
        difficulty: 'intermediate',
        language: 'Python',
        organizationId: 'org-2',
        participationCount: 8,
        completionCount: 6,
        averageTime: 90
      }
    ],
    participations: [
      {
        id: 'participation-1',
        userId: 'user-1',
        exerciseId: 'exercise-1',
        participatedAt: '2024-01-15T10:00:00Z',
        completed: true,
        completionTime: 42,
        difficulty: 'beginner',
        score: 88
      },
      {
        id: 'participation-2',
        userId: 'user-2',
        exerciseId: 'exercise-2',
        participatedAt: '2024-01-14T15:30:00Z',
        completed: true,
        completionTime: 95,
        difficulty: 'intermediate',
        score: 92
      }
    ]
  },

  // LEARNING ANALYTICS Microservice Data
  learningAnalytics: {
    performanceTrends: [
      {
        organizationId: 'org-1',
        metric: 'course_completion_rate',
        value: 78,
        trend: 'increasing',
        period: 'last_30_days',
        previousValue: 72,
        changePercentage: 8.3
      },
      {
        organizationId: 'org-2',
        metric: 'skill_progression',
        value: 85,
        trend: 'stable',
        period: 'last_30_days',
        previousValue: 84,
        changePercentage: 1.2
      }
    ],
    skillGaps: [
      {
        organizationId: 'org-1',
        skillName: 'Advanced JavaScript',
        gapPercentage: 35,
        affectedUsers: 12,
        recommendedCourses: ['Advanced JavaScript Patterns', 'ES6+ Features'],
        priority: 'high'
      },
      {
        organizationId: 'org-3',
        skillName: 'Data Visualization',
        gapPercentage: 42,
        affectedUsers: 8,
        recommendedCourses: ['Tableau Fundamentals', 'Power BI Basics'],
        priority: 'medium'
      }
    ],
    courseEffectiveness: [
      {
        courseId: 'course-1',
        title: 'JavaScript Fundamentals',
        effectivenessScore: 8.5,
        completionRate: 72,
        skillImprovement: 15,
        userSatisfaction: 4.2,
        recommendations: ['Add more practical exercises', 'Include real-world examples']
      },
      {
        courseId: 'course-2',
        title: 'Python for Data Science',
        effectivenessScore: 9.1,
        completionRate: 83,
        skillImprovement: 22,
        userSatisfaction: 4.6,
        recommendations: ['Excellent course structure', 'Consider adding advanced topics']
      }
    ],
    strategicForecasts: [
      {
        organizationId: 'org-1',
        forecast: 'skill_demand',
        skillName: 'React Development',
        predictedDemand: 'high',
        timeframe: 'next_6_months',
        confidence: 0.87,
        recommendations: ['Increase React training capacity', 'Hire additional React instructors']
      },
      {
        organizationId: 'org-2',
        forecast: 'learning_trends',
        trend: 'microlearning',
        predictedAdoption: 'increasing',
        timeframe: 'next_3_months',
        confidence: 0.92,
        recommendations: ['Develop microlearning modules', 'Implement bite-sized content strategy']
      }
    ]
  }
};

// API Endpoints
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'HR Management Reporting Backend',
    version: '1.0.0',
    microservices: ['DIRECTORY', 'COURSE_BUILDER', 'ASSESSMENT', 'LEARNER_AI', 'DEVLAB', 'LEARNING_ANALYTICS']
  });
});

// DIRECTORY Microservice Endpoints
app.get('/api/directory/users', (req, res) => {
  res.json(mockData.directory.users);
});

app.get('/api/directory/organizations', (req, res) => {
  res.json(mockData.directory.organizations);
});

app.get('/api/directory/teams', (req, res) => {
  res.json(mockData.directory.teams);
});

// COURSE BUILDER Microservice Endpoints
app.get('/api/coursebuilder/courses', (req, res) => {
  res.json(mockData.courseBuilder.courses);
});

app.get('/api/coursebuilder/enrollments', (req, res) => {
  res.json(mockData.courseBuilder.enrollments);
});

// ASSESSMENT Microservice Endpoints
app.get('/api/assessment/tests', (req, res) => {
  res.json(mockData.assessment.tests);
});

app.get('/api/assessment/attempts', (req, res) => {
  res.json(mockData.assessment.attempts);
});

app.get('/api/assessment/feedback', (req, res) => {
  res.json(mockData.assessment.feedback);
});

// LEARNER AI Microservice Endpoints
app.get('/api/learnerai/skills', (req, res) => {
  res.json(mockData.learnerAI.skillsAcquired);
});

app.get('/api/learnerai/progress', (req, res) => {
  res.json(mockData.learnerAI.skillProgress);
});

// DEVLAB Microservice Endpoints
app.get('/api/devlab/exercises', (req, res) => {
  res.json(mockData.devLab.exercises);
});

app.get('/api/devlab/participations', (req, res) => {
  res.json(mockData.devLab.participations);
});

// LEARNING ANALYTICS Microservice Endpoints
app.get('/api/analytics/trends', (req, res) => {
  res.json(mockData.learningAnalytics.performanceTrends);
});

app.get('/api/analytics/skillgaps', (req, res) => {
  res.json(mockData.learningAnalytics.skillGaps);
});

app.get('/api/analytics/effectiveness', (req, res) => {
  res.json(mockData.learningAnalytics.courseEffectiveness);
});

app.get('/api/analytics/forecasts', (req, res) => {
  res.json(mockData.learningAnalytics.strategicForecasts);
});

// Aggregated Dashboard Endpoints
app.get('/api/dashboards/admin', (req, res) => {
  const aggregatedData = {
    totalOrganizations: mockData.directory.organizations.length,
    totalUsers: mockData.directory.users.length,
    totalCourses: mockData.courseBuilder.courses.length,
    totalExercises: mockData.devLab.exercises.length,
    averageCompletionRate: Math.round(
      mockData.courseBuilder.courses.reduce((sum, course) => sum + course.completionRate, 0) / 
      mockData.courseBuilder.courses.length
    ),
    averageSkillProgress: Math.round(
      mockData.learnerAI.skillProgress.reduce((sum, progress) => sum + progress.progressPercentage, 0) / 
      mockData.learnerAI.skillProgress.length
    ),
    organizations: mockData.directory.organizations.map(org => ({
      ...org,
      courses: mockData.courseBuilder.courses.filter(course => course.organizationId === org.id),
      users: mockData.directory.users.filter(user => user.organizationId === org.id),
      skillGaps: mockData.learningAnalytics.skillGaps.filter(gap => gap.organizationId === org.id)
    }))
  };
  
  res.json(aggregatedData);
});

app.get('/api/dashboards/hr/:orgId', (req, res) => {
  const orgId = req.params.orgId;
  const org = mockData.directory.organizations.find(o => o.id === orgId);
  
  if (!org) {
    return res.status(404).json({ error: 'Organization not found' });
  }
  
  const orgData = {
    organization: org,
    users: mockData.directory.users.filter(user => user.organizationId === orgId),
    courses: mockData.courseBuilder.courses.filter(course => course.organizationId === orgId),
    skillsAcquired: mockData.learnerAI.skillsAcquired.filter(skill => 
      mockData.directory.users.find(user => user.id === skill.userId)?.organizationId === orgId
    ),
    performanceTrends: mockData.learningAnalytics.performanceTrends.filter(trend => trend.organizationId === orgId),
    skillGaps: mockData.learningAnalytics.skillGaps.filter(gap => gap.organizationId === orgId)
  };
  
  res.json(orgData);
});

// ========================================
// DATA PROCESSING API ENDPOINTS
// ========================================

// Process users with filtering and sorting
app.get('/api/process/users', (req, res) => {
  try {
    const { filters = '{}', sortBy = 'lastName', order = 'asc' } = req.query;
    const parsedFilters = JSON.parse(filters);
    
    const processedData = dataProcessor.processData(
      'users', 
      mockData.directory.users, 
      parsedFilters, 
      sortBy, 
      order
    );
    
    res.json({
      success: true,
      data: processedData,
      stats: dataProcessor.getDataStats('users', processedData),
      filters: parsedFilters,
      sortBy,
      order,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Process courses with filtering and sorting
app.get('/api/process/courses', (req, res) => {
  try {
    const { filters = '{}', sortBy = 'title', order = 'asc' } = req.query;
    const parsedFilters = JSON.parse(filters);
    
    const processedData = dataProcessor.processData(
      'courses', 
      mockData.courseBuilder.courses, 
      parsedFilters, 
      sortBy, 
      order
    );
    
    res.json({
      success: true,
      data: processedData,
      stats: dataProcessor.getDataStats('courses', processedData),
      filters: parsedFilters,
      sortBy,
      order,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Process skills with filtering and sorting
app.get('/api/process/skills', (req, res) => {
  try {
    const { filters = '{}', sortBy = 'skillName', order = 'asc' } = req.query;
    const parsedFilters = JSON.parse(filters);
    
    const processedData = dataProcessor.processData(
      'skills', 
      mockData.learnerAI.skillsAcquired, 
      parsedFilters, 
      sortBy, 
      order
    );
    
    res.json({
      success: true,
      data: processedData,
      stats: dataProcessor.getDataStats('skills', processedData),
      filters: parsedFilters,
      sortBy,
      order,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Process exercises with filtering and sorting
app.get('/api/process/exercises', (req, res) => {
  try {
    const { filters = '{}', sortBy = 'title', order = 'asc' } = req.query;
    const parsedFilters = JSON.parse(filters);
    
    const processedData = dataProcessor.processData(
      'exercises', 
      mockData.devLab.exercises, 
      parsedFilters, 
      sortBy, 
      order
    );
    
    res.json({
      success: true,
      data: processedData,
      stats: dataProcessor.getDataStats('exercises', processedData),
      filters: parsedFilters,
      sortBy,
      order,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Process performance trends with filtering and sorting
app.get('/api/process/trends', (req, res) => {
  try {
    const { filters = '{}', sortBy = 'value', order = 'desc' } = req.query;
    const parsedFilters = JSON.parse(filters);
    
    const processedData = dataProcessor.processData(
      'performanceTrends', 
      mockData.learningAnalytics.performanceTrends, 
      parsedFilters, 
      sortBy, 
      order
    );
    
    res.json({
      success: true,
      data: processedData,
      stats: dataProcessor.getDataStats('performanceTrends', processedData),
      filters: parsedFilters,
      sortBy,
      order,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========================================
// CACHE MANAGEMENT API ENDPOINTS
// ========================================

// Get cache statistics
app.get('/api/cache/stats', (req, res) => {
  try {
    const stats = cacheManager.getCacheStats();
    res.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Clear specific cache table
app.delete('/api/cache/:tableName', (req, res) => {
  try {
    const { tableName } = req.params;
    cacheManager.clearCacheTable(tableName);
    res.json({
      success: true,
      message: `Cache table '${tableName}' cleared`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Clear all cache tables
app.delete('/api/cache', (req, res) => {
  try {
    cacheManager.clearAllCacheTables();
    res.json({
      success: true,
      message: 'All cache tables cleared',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get cache table names
app.get('/api/cache/tables', (req, res) => {
  try {
    const tableNames = cacheManager.getCacheTableNames();
    res.json({
      success: true,
      tables: tableNames,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========================================
// ENHANCED DASHBOARD ENDPOINTS WITH CACHING
// ========================================

// Enhanced admin dashboard with caching
app.get('/api/dashboards/admin/enhanced', (req, res) => {
  try {
    const { useCache = 'true' } = req.query;
    
    if (useCache === 'true') {
      const cachedData = cacheManager.getData('admin_dashboard_cache', 'admin_dashboard');
      if (cachedData) {
        return res.json({
          success: true,
          data: cachedData,
          cached: true,
          timestamp: new Date().toISOString()
        });
      }
    }

    // Process and aggregate data
    const users = dataProcessor.processData('users', mockData.directory.users, { status: 'active' });
    const courses = dataProcessor.processData('courses', mockData.courseBuilder.courses, { status: 'active' });
    const skills = dataProcessor.processData('skills', mockData.learnerAI.skillsAcquired, {}, 'acquiredAt', 'desc');
    const trends = dataProcessor.processData('performanceTrends', mockData.learningAnalytics.performanceTrends, {}, 'value', 'desc');

    const aggregatedData = {
      totalOrganizations: mockData.directory.organizations.length,
      totalUsers: users.length,
      totalCourses: courses.length,
      totalSkills: skills.length,
      averageCompletionRate: Math.round(
        courses.reduce((sum, course) => sum + course.completionRate, 0) / courses.length
      ),
      averageSkillProgress: Math.round(
        skills.reduce((sum, skill) => sum + skill.confidenceScore, 0) / skills.length * 100
      ),
      topTrends: trends.slice(0, 5),
      organizations: mockData.directory.organizations.map(org => ({
        ...org,
        courses: courses.filter(course => course.organizationId === org.id),
        users: users.filter(user => user.organizationId === org.id),
        skillGaps: mockData.learningAnalytics.skillGaps.filter(gap => gap.organizationId === org.id)
      }))
    };

    // Cache the result
    cacheManager.storeData('admin_dashboard_cache', 'admin_dashboard', aggregatedData);

    res.json({
      success: true,
      data: aggregatedData,
      cached: false,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========================================
// DATA INSIGHTS API ENDPOINTS
// ========================================

// Get course analytics insights
app.get('/api/insights/courses', (req, res) => {
  try {
    const courses = mockData.courseBuilder.courses;
    
    const activeVsRegistered = insightsService.generateActiveVsRegisteredInsights(courses);
    const completionTrends = insightsService.generateCompletionTrends(courses);
    
    res.json({
      success: true,
      insights: {
        activeVsRegistered,
        completionTrends,
        summary: {
          totalCourses: courses.length,
          averageCompletionRate: Math.round(
            courses.reduce((sum, course) => sum + course.completionRate, 0) / courses.length
          ),
          totalEnrollments: courses.reduce((sum, course) => sum + course.enrollmentCount, 0),
          totalActiveUsers: courses.reduce((sum, course) => sum + course.activeUsers, 0)
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get skill development insights
app.get('/api/insights/skills', (req, res) => {
  try {
    const skills = mockData.learnerAI.skillsAcquired;
    const skillGaps = mockData.learningAnalytics.skillGaps;
    
    const acquisitionInsights = insightsService.generateSkillAcquisitionInsights(skills);
    const gapInsights = insightsService.generateSkillGapInsights(skillGaps, mockData.directory.users);
    
    res.json({
      success: true,
      insights: {
        acquisitionInsights,
        gapInsights,
        summary: {
          totalSkills: skills.length,
          skillLevels: {
            beginner: skills.filter(s => s.skillLevel === 'beginner').length,
            intermediate: skills.filter(s => s.skillLevel === 'intermediate').length,
            advanced: skills.filter(s => s.skillLevel === 'advanced').length
          },
          averageConfidence: Math.round(
            skills.reduce((sum, skill) => sum + skill.confidenceScore, 0) / skills.length * 100
          ) / 100,
          totalGaps: skillGaps.length
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user engagement insights
app.get('/api/insights/users', (req, res) => {
  try {
    const users = mockData.directory.users;
    const courses = mockData.courseBuilder.courses;
    const exercises = mockData.devLab.exercises;
    
    const activityInsights = insightsService.generateUserActivityInsights(users, courses, exercises);
    
    res.json({
      success: true,
      insights: {
        activityInsights,
        summary: {
          totalUsers: users.length,
          activeUsers: users.filter(user => {
            const daysSince = Math.floor((new Date() - new Date(user.lastLogin)) / (1000 * 60 * 60 * 24));
            return daysSince <= 7;
          }).length,
          averageEngagementScore: Math.round(
            activityInsights.reduce((sum, user) => sum + user.engagementScore, 0) / activityInsights.length
          ),
          averageSkillCount: Math.round(
            users.reduce((sum, user) => sum + (user.profile?.skills?.length || 0), 0) / users.length
          )
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get exercise performance insights
app.get('/api/insights/exercises', (req, res) => {
  try {
    const exercises = mockData.devLab.exercises;
    const participations = mockData.devLab.participations;
    
    const exerciseInsights = insightsService.generateExerciseInsights(exercises, participations);
    
    res.json({
      success: true,
      insights: {
        exerciseInsights,
        summary: {
          totalExercises: exercises.length,
          difficultyDistribution: {
            beginner: exercises.filter(e => e.difficulty === 'beginner').length,
            intermediate: exercises.filter(e => e.difficulty === 'intermediate').length,
            advanced: exercises.filter(e => e.difficulty === 'advanced').length
          },
          averageCompletionRate: Math.round(
            exercises.reduce((sum, exercise) => {
              const rate = exercise.participationCount > 0 ? 
                (exercise.completionCount / exercise.participationCount) * 100 : 0;
              return sum + rate;
            }, 0) / exercises.length
          ),
          totalParticipations: exercises.reduce((sum, exercise) => sum + exercise.participationCount, 0)
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get organizational performance insights
app.get('/api/insights/organizations', (req, res) => {
  try {
    const organizations = mockData.directory.organizations;
    const courses = mockData.courseBuilder.courses;
    const users = mockData.directory.users;
    const trends = mockData.learningAnalytics.performanceTrends;
    
    const crossOrgInsights = insightsService.generateCrossOrgInsights(organizations, courses, users, trends);
    
    res.json({
      success: true,
      insights: {
        crossOrgInsights,
        summary: {
          totalOrganizations: organizations.length,
          averagePerformanceScore: Math.round(
            crossOrgInsights.reduce((sum, org) => sum + org.performanceScore, 0) / crossOrgInsights.length
          ),
          totalUsers: users.length,
          totalCourses: courses.length,
          growthTrends: {
            growing: crossOrgInsights.filter(org => org.growthTrend === 'Growing').length,
            stable: crossOrgInsights.filter(org => org.growthTrend === 'Stable').length,
            declining: crossOrgInsights.filter(org => org.growthTrend === 'Declining').length
          }
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get predictive insights
app.get('/api/insights/predictions', (req, res) => {
  try {
    const courses = mockData.courseBuilder.courses;
    const skills = mockData.learnerAI.skillsAcquired;
    const trends = mockData.learningAnalytics.performanceTrends;
    
    const predictiveInsights = insightsService.generatePredictiveInsights(courses, skills, trends);
    
    res.json({
      success: true,
      insights: {
        predictiveInsights,
        summary: {
          totalPredictions: predictiveInsights.courseSuccessPredictions.length,
          highConfidencePredictions: predictiveInsights.courseSuccessPredictions.filter(
            p => p.confidenceLevel === 'High'
          ).length,
          skillDemandForecast: predictiveInsights.skillDemandForecast.length,
          organizationalProjections: predictiveInsights.organizationalGrowthProjections.length
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get comprehensive insights dashboard
app.get('/api/insights/dashboard', (req, res) => {
  try {
    const courses = mockData.courseBuilder.courses;
    const users = mockData.directory.users;
    const skills = mockData.learnerAI.skillsAcquired;
    const exercises = mockData.devLab.exercises;
    const trends = mockData.learningAnalytics.performanceTrends;
    const organizations = mockData.directory.organizations;
    
    const dashboardInsights = {
      courses: insightsService.generateActiveVsRegisteredInsights(courses),
      skills: insightsService.generateSkillAcquisitionInsights(skills),
      users: insightsService.generateUserActivityInsights(users, courses, exercises),
      exercises: insightsService.generateExerciseInsights(exercises, mockData.devLab.participations),
      organizations: insightsService.generateCrossOrgInsights(organizations, courses, users, trends),
      predictions: insightsService.generatePredictiveInsights(courses, skills, trends)
    };
    
    res.json({
      success: true,
      insights: dashboardInsights,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Serve the main frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve the insights dashboard
app.get('/insights', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'insights.html'));
});

// Initialize cache tables and start server
app.listen(PORT, () => {
  console.log(`🚀 HR Management Reporting Backend running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`👨‍💼 Admin dashboard: http://localhost:${PORT}/api/dashboards/admin`);
  console.log(`🌐 Frontend: http://localhost:${PORT}`);
  
  // Initialize cache system
  cacheManager.initializeCacheTables();
  cacheManager.warmUpCache(dataProcessor, mockData);
  cacheManager.startCacheMonitoring();
  
  console.log(`\n📡 Available Microservice Endpoints:`);
  console.log(`   DIRECTORY: /api/directory/*`);
  console.log(`   COURSE_BUILDER: /api/coursebuilder/*`);
  console.log(`   ASSESSMENT: /api/assessment/*`);
  console.log(`   LEARNER_AI: /api/learnerai/*`);
  console.log(`   DEVLAB: /api/devlab/*`);
  console.log(`   LEARNING_ANALYTICS: /api/analytics/*`);
  
  console.log(`\n🔧 Data Processing Endpoints:`);
  console.log(`   PROCESS USERS: /api/process/users`);
  console.log(`   PROCESS COURSES: /api/process/courses`);
  console.log(`   PROCESS SKILLS: /api/process/skills`);
  console.log(`   PROCESS EXERCISES: /api/process/exercises`);
  console.log(`   PROCESS TRENDS: /api/process/trends`);
  
  console.log(`\n💾 Cache Management Endpoints:`);
  console.log(`   CACHE STATS: /api/cache/stats`);
  console.log(`   CACHE TABLES: /api/cache/tables`);
  console.log(`   CLEAR CACHE: DELETE /api/cache`);
  console.log(`   ENHANCED DASHBOARD: /api/dashboards/admin/enhanced`);
  
  console.log(`\n📈 Data Insights Endpoints:`);
  console.log(`   COURSE INSIGHTS: /api/insights/courses`);
  console.log(`   SKILL INSIGHTS: /api/insights/skills`);
  console.log(`   USER INSIGHTS: /api/insights/users`);
  console.log(`   EXERCISE INSIGHTS: /api/insights/exercises`);
  console.log(`   ORG INSIGHTS: /api/insights/organizations`);
  console.log(`   PREDICTIONS: /api/insights/predictions`);
  console.log(`   DASHBOARD INSIGHTS: /api/insights/dashboard`);
  console.log(`   INSIGHTS UI: http://localhost:${PORT}/insights`);
});