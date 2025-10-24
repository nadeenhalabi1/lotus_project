// Enhanced API Routes with Filtering and Normalization
// This file provides API endpoints with advanced filtering and data normalization

const express = require('express');
const router = express.Router();
const {
  directoryFilters,
  coursebuilderFilters,
  assessmentFilters,
  learneraiFilters,
  devlabFilters,
  learningAnalyticsFilters,
  dataNormalizers,
  advancedFilters
} = require('../utils/dataFilters');

/**
 * DIRECTORY Microservice Enhanced Endpoints
 */

// Get all users with optional filtering
router.get('/directory/users', (req, res) => {
  try {
    const { department, role, status, skills, location, normalize } = req.query;
    let users = require('../data/mockData').directory.users;

    // Apply filters
    if (department) {
      users = directoryFilters.filterUsersByDepartment(department);
    }
    if (role) {
      users = users.filter(user => 
        user.role.toLowerCase().includes(role.toLowerCase())
      );
    }
    if (status) {
      users = directoryFilters.filterUsersByStatus(status);
    }
    if (skills) {
      const skillArray = skills.split(',');
      users = directoryFilters.filterUsersBySkills(skillArray);
    }
    if (location) {
      users = directoryFilters.filterUsersByLocation(location);
    }

    // Normalize data if requested
    if (normalize === 'true') {
      users = users.map(user => dataNormalizers.normalizeUser(user));
    }

    res.json({
      success: true,
      count: users.length,
      data: users,
      filters: { department, role, status, skills, location, normalize }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get users by department
router.get('/directory/users/department/:department', (req, res) => {
  try {
    const { department } = req.params;
    const { normalize } = req.query;
    let users = directoryFilters.filterUsersByDepartment(department);

    if (normalize === 'true') {
      users = users.map(user => dataNormalizers.normalizeUser(user));
    }

    res.json({
      success: true,
      department,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get users by skills
router.get('/directory/users/skills/:skills', (req, res) => {
  try {
    const { skills } = req.params;
    const { normalize } = req.query;
    const skillArray = skills.split(',');
    let users = directoryFilters.filterUsersBySkills(skillArray);

    if (normalize === 'true') {
      users = users.map(user => dataNormalizers.normalizeUser(user));
    }

    res.json({
      success: true,
      skills: skillArray,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Advanced user search
router.post('/directory/users/search', (req, res) => {
  try {
    const criteria = req.body;
    const { normalize } = req.query;
    let users = advancedFilters.searchUsers(criteria);

    if (normalize === 'true') {
      users = users.map(user => dataNormalizers.normalizeUser(user));
    }

    res.json({
      success: true,
      criteria,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * COURSEBUILDER Microservice Enhanced Endpoints
 */

// Get all courses with optional filtering
router.get('/coursebuilder/courses', (req, res) => {
  try {
    const { category, difficulty, instructor, minRating, minCompletionRate, normalize } = req.query;
    let courses = require('../data/mockData').coursebuilder.courses;

    // Apply filters
    if (category) {
      courses = coursebuilderFilters.filterCoursesByCategory(category);
    }
    if (difficulty) {
      courses = coursebuilderFilters.filterCoursesByDifficulty(difficulty);
    }
    if (instructor) {
      courses = coursebuilderFilters.filterCoursesByInstructor(instructor);
    }
    if (minRating) {
      courses = coursebuilderFilters.filterCoursesByRating(parseFloat(minRating));
    }
    if (minCompletionRate) {
      courses = coursebuilderFilters.filterCoursesByCompletionRate(
        parseFloat(minCompletionRate), 1.0
      );
    }

    // Normalize data if requested
    if (normalize === 'true') {
      courses = courses.map(course => dataNormalizers.normalizeCourse(course));
    }

    res.json({
      success: true,
      count: courses.length,
      data: courses,
      filters: { category, difficulty, instructor, minRating, minCompletionRate, normalize }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get courses by category
router.get('/coursebuilder/courses/category/:category', (req, res) => {
  try {
    const { category } = req.params;
    const { normalize } = req.query;
    let courses = coursebuilderFilters.filterCoursesByCategory(category);

    if (normalize === 'true') {
      courses = courses.map(course => dataNormalizers.normalizeCourse(course));
    }

    res.json({
      success: true,
      category,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get lessons by type
router.get('/coursebuilder/lessons/type/:type', (req, res) => {
  try {
    const { type } = req.params;
    const { minCompletionRate, normalize } = req.query;
    let lessons = coursebuilderFilters.filterLessonsByType(type);

    if (minCompletionRate) {
      lessons = lessons.filter(lesson => 
        lesson.completionRate >= parseFloat(minCompletionRate)
      );
    }

    if (normalize === 'true') {
      lessons = lessons.map(lesson => ({
        id: lesson.id,
        title: lesson.title,
        duration: lesson.duration,
        order: lesson.order,
        type: lesson.type.toLowerCase(),
        completionRate: Math.round(lesson.completionRate * 100) / 100,
        courseId: lesson.courseId,
        courseTitle: lesson.courseTitle
      }));
    }

    res.json({
      success: true,
      type,
      count: lessons.length,
      data: lessons
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * ASSESSMENT Microservice Enhanced Endpoints
 */

// Get all tests with optional filtering
router.get('/assessment/tests', (req, res) => {
  try {
    const { courseId, normalize } = req.query;
    let tests = require('../data/mockData').assessment.tests;

    if (courseId) {
      tests = assessmentFilters.filterTestsByCourse(courseId);
    }

    if (normalize === 'true') {
      tests = tests.map(test => dataNormalizers.normalizeTest(test));
    }

    res.json({
      success: true,
      count: tests.length,
      data: tests,
      filters: { courseId, normalize }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get attempts by user
router.get('/assessment/attempts/user/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { minScore, maxScore, grade, normalize } = req.query;
    let attempts = assessmentFilters.filterAttemptsByUser(userId);

    if (minScore) {
      attempts = attempts.filter(attempt => attempt.score >= parseFloat(minScore));
    }
    if (maxScore) {
      attempts = attempts.filter(attempt => attempt.score <= parseFloat(maxScore));
    }
    if (grade) {
      attempts = attempts.filter(attempt => attempt.grade === grade);
    }

    if (normalize === 'true') {
      attempts = attempts.map(attempt => ({
        userId: attempt.userId,
        attemptNumber: attempt.attemptNumber,
        score: attempt.score,
        grade: attempt.grade,
        completedAt: new Date(attempt.completedAt).toISOString(),
        timeSpent: attempt.timeSpent,
        feedback: attempt.feedback,
        testId: attempt.testId,
        testTitle: attempt.testTitle,
        passed: attempt.score >= 70 // Assuming 70% passing score
      }));
    }

    res.json({
      success: true,
      userId,
      count: attempts.length,
      data: attempts
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get attempts by score range
router.get('/assessment/attempts/score/:minScore/:maxScore', (req, res) => {
  try {
    const { minScore, maxScore } = req.params;
    const { normalize } = req.query;
    let attempts = assessmentFilters.filterAttemptsByScore(
      parseFloat(minScore), parseFloat(maxScore)
    );

    if (normalize === 'true') {
      attempts = attempts.map(attempt => ({
        userId: attempt.userId,
        attemptNumber: attempt.attemptNumber,
        score: attempt.score,
        grade: attempt.grade,
        completedAt: new Date(attempt.completedAt).toISOString(),
        timeSpent: attempt.timeSpent,
        feedback: attempt.feedback,
        testId: attempt.testId,
        testTitle: attempt.testTitle,
        passed: attempt.score >= 70
      }));
    }

    res.json({
      success: true,
      scoreRange: { min: parseFloat(minScore), max: parseFloat(maxScore) },
      count: attempts.length,
      data: attempts
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * LEARNERAI Microservice Enhanced Endpoints
 */

// Get skills by user
router.get('/learnerai/skills/user/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { minProficiency, minConfidence, normalize } = req.query;
    let skills = learneraiFilters.filterSkillsByUser(userId);

    if (minProficiency) {
      skills = skills.filter(skill => skill.proficiency >= parseFloat(minProficiency));
    }
    if (minConfidence) {
      skills = skills.filter(skill => skill.confidence >= parseFloat(minConfidence));
    }

    if (normalize === 'true') {
      skills = skills.map(skill => dataNormalizers.normalizeSkill(skill));
    }

    res.json({
      success: true,
      userId,
      count: skills.length,
      data: skills
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get skills by proficiency level
router.get('/learnerai/skills/proficiency/:minProficiency', (req, res) => {
  try {
    const { minProficiency } = req.params;
    const { normalize } = req.query;
    let skills = learneraiFilters.filterSkillsByProficiency(parseFloat(minProficiency));

    if (normalize === 'true') {
      skills = skills.map(skill => dataNormalizers.normalizeSkill(skill));
    }

    res.json({
      success: true,
      minProficiency: parseFloat(minProficiency),
      count: skills.length,
      data: skills
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DEVLAB Microservice Enhanced Endpoints
 */

// Get exercises by difficulty
router.get('/devlab/exercises/difficulty/:difficulty', (req, res) => {
  try {
    const { difficulty } = req.params;
    const { normalize } = req.query;
    let exercises = devlabFilters.filterExercisesByDifficulty(difficulty);

    if (normalize === 'true') {
      exercises = exercises.map(exercise => dataNormalizers.normalizeExercise(exercise));
    }

    res.json({
      success: true,
      difficulty,
      count: exercises.length,
      data: exercises
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get participant data by user
router.get('/devlab/participants/user/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { normalize } = req.query;
    let participations = devlabFilters.filterParticipantsByUser(userId);

    if (normalize === 'true') {
      participations = participations.map(participation => ({
        userId: participation.userId,
        participationDate: new Date(participation.participationDate).toISOString(),
        completionTime: participation.completionTime,
        difficultyRating: participation.difficultyRating,
        feedback: participation.feedback,
        exerciseId: participation.exerciseId,
        exerciseTitle: participation.exerciseTitle,
        difficulty: participation.difficulty.toLowerCase()
      }));
    }

    res.json({
      success: true,
      userId,
      count: participations.length,
      data: participations
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * LEARNING ANALYTICS Microservice Enhanced Endpoints
 */

// Get performance analytics
router.get('/learning-analytics/performance', (req, res) => {
  try {
    const { department, severity, normalize } = req.query;
    const filters = { department, severity };
    let analytics = advancedFilters.getPerformanceAnalytics(filters);

    if (normalize === 'true') {
      analytics.trends = analytics.trends.map(trend => 
        dataNormalizers.normalizePerformanceTrend(trend)
      );
      analytics.insights = analytics.insights.map(insight => 
        dataNormalizers.normalizeInsight(insight)
      );
    }

    res.json({
      success: true,
      filters,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get insights by type
router.get('/learning-analytics/insights/type/:type', (req, res) => {
  try {
    const { type } = req.params;
    const { severity, minConfidence, normalize } = req.query;
    let insights = learningAnalyticsFilters.filterInsightsByType(type);

    if (severity) {
      insights = insights.filter(insight => 
        insight.severity.toLowerCase() === severity.toLowerCase()
      );
    }
    if (minConfidence) {
      insights = insights.filter(insight => 
        insight.confidence >= parseFloat(minConfidence)
      );
    }

    if (normalize === 'true') {
      insights = insights.map(insight => dataNormalizers.normalizeInsight(insight));
    }

    res.json({
      success: true,
      type,
      count: insights.length,
      data: insights
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get skill gaps by department
router.get('/learning-analytics/skill-gaps/department/:department', (req, res) => {
  try {
    const { department } = req.params;
    const { severity, normalize } = req.query;
    let skillGaps = learningAnalyticsFilters.filterSkillGapsByDepartment(department);

    if (severity) {
      skillGaps = skillGaps.map(deptGap => ({
        ...deptGap,
        criticalGaps: deptGap.criticalGaps.filter(gap => 
          gap.gapSeverity.toLowerCase() === severity.toLowerCase()
        )
      }));
    }

    res.json({
      success: true,
      department,
      count: skillGaps.length,
      data: skillGaps
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Cross-Microservice Analytics Endpoints
 */

// Get comprehensive user analytics
router.get('/analytics/user/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { normalize } = req.query;
    
    // Get user data
    const user = require('../data/mockData').directory.users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Get user's course enrollments
    const enrollments = require('../data/mockData').coursebuilder.courses.filter(course =>
      course.attempts && course.attempts.some(attempt => attempt.userId === userId)
    );

    // Get user's test attempts
    const testAttempts = assessmentFilters.filterAttemptsByUser(userId);

    // Get user's skills
    const skills = learneraiFilters.filterSkillsByUser(userId);

    // Get user's exercise participations
    const participations = devlabFilters.filterParticipantsByUser(userId);

    const analytics = {
      user: normalize === 'true' ? dataNormalizers.normalizeUser(user) : user,
      enrollments: enrollments.length,
      testAttempts: testAttempts.length,
      skills: skills.length,
      participations: participations.length,
      averageScore: testAttempts.length > 0 ? 
        Math.round(testAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / testAttempts.length * 10) / 10 : 0,
      averageProficiency: skills.length > 0 ? 
        Math.round(skills.reduce((sum, skill) => sum + skill.proficiency, 0) / skills.length * 100) / 100 : 0
    };

    res.json({
      success: true,
      userId,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get course effectiveness analytics
router.get('/analytics/course/:courseId', (req, res) => {
  try {
    const { courseId } = req.params;
    const { normalize } = req.query;
    
    // Get course data
    const course = require('../data/mockData').coursebuilder.courses.find(c => c.id === courseId);
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    // Get course effectiveness data
    const effectiveness = require('../data/mockData').learningAnalytics.courseEffectiveness.find(
      ce => ce.courseId === courseId
    );

    // Get test data for this course
    const tests = assessmentFilters.filterTestsByCourse(courseId);

    // Get skills acquired from this course
    const skillsAcquired = learneraiFilters.filterSkillsByCourse(courseId);

    const analytics = {
      course: normalize === 'true' ? dataNormalizers.normalizeCourse(course) : course,
      effectiveness: effectiveness || null,
      tests: tests.length,
      skillsAcquired: skillsAcquired.length,
      averageTestScore: tests.length > 0 ? 
        Math.round(tests.reduce((sum, test) => sum + test.averageScore, 0) / tests.length * 10) / 10 : 0,
      averageSkillProficiency: skillsAcquired.length > 0 ? 
        Math.round(skillsAcquired.reduce((sum, skill) => sum + skill.proficiency, 0) / skillsAcquired.length * 100) / 100 : 0
    };

    res.json({
      success: true,
      courseId,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

