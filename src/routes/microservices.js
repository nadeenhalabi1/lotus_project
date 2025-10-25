const express = require('express');
const router = express.Router();
const mockData = require('../data/mockData');

// DIRECTORY Microservice endpoints
router.get('/directory/users', (req, res) => {
  res.json({
    success: true,
    data: mockData.directory.users,
    total: mockData.directory.totalUsers,
    active: mockData.directory.activeUsers,
    newThisMonth: mockData.directory.newUsersThisMonth
  });
});

router.get('/directory/users/:id', (req, res) => {
  const user = mockData.directory.users.find(u => u.id === req.params.id);
  if (user) {
    res.json({ success: true, data: user });
  } else {
    res.status(404).json({ success: false, message: 'User not found' });
  }
});

router.get('/directory/departments', (req, res) => {
  res.json({
    success: true,
    data: mockData.directory.departments
  });
});

// COURSEBUILDER Microservice endpoints
router.get('/coursebuilder/courses', (req, res) => {
  res.json({
    success: true,
    data: mockData.coursebuilder.courses,
    total: mockData.coursebuilder.totalCourses,
    totalEnrollments: mockData.coursebuilder.totalEnrollments,
    activeEnrollments: mockData.coursebuilder.activeEnrollments,
    averageCompletionRate: mockData.coursebuilder.averageCompletionRate
  });
});

router.get('/coursebuilder/courses/:id', (req, res) => {
  const course = mockData.coursebuilder.courses.find(c => c.id === req.params.id);
  if (course) {
    res.json({ success: true, data: course });
  } else {
    res.status(404).json({ success: false, message: 'Course not found' });
  }
});

router.get('/coursebuilder/lessons/:courseId', (req, res) => {
  const course = mockData.coursebuilder.courses.find(c => c.id === req.params.courseId);
  if (course) {
    res.json({ success: true, data: course.lessons });
  } else {
    res.status(404).json({ success: false, message: 'Course not found' });
  }
});

// ASSESSMENT Microservice endpoints
router.get('/assessment/tests', (req, res) => {
  res.json({
    success: true,
    data: mockData.assessment.tests,
    total: mockData.assessment.totalTests,
    totalAttempts: mockData.assessment.totalAttempts,
    averageScore: mockData.assessment.averageScore,
    overallPassRate: mockData.assessment.overallPassRate
  });
});

router.get('/assessment/tests/:id', (req, res) => {
  const test = mockData.assessment.tests.find(t => t.id === req.params.id);
  if (test) {
    res.json({ success: true, data: test });
  } else {
    res.status(404).json({ success: false, message: 'Test not found' });
  }
});

router.get('/assessment/attempts/:testId', (req, res) => {
  const test = mockData.assessment.tests.find(t => t.id === req.params.testId);
  if (test) {
    res.json({ success: true, data: test.attempts });
  } else {
    res.status(404).json({ success: false, message: 'Test not found' });
  }
});

// LEARNERAI Microservice endpoints
router.get('/learnerai/skills', (req, res) => {
  res.json({
    success: true,
    data: mockData.learnerai.skillsAcquired,
    total: mockData.learnerai.totalSkillsAcquired,
    averageProficiency: mockData.learnerai.averageProficiency,
    skillsThisMonth: mockData.learnerai.skillsAcquiredThisMonth
  });
});

router.get('/learnerai/skills/:userId', (req, res) => {
  const userSkills = mockData.learnerai.skillsAcquired.filter(s => s.userId === req.params.userId);
  res.json({ success: true, data: userSkills });
});

router.get('/learnerai/categories', (req, res) => {
  res.json({
    success: true,
    data: mockData.learnerai.skillCategories
  });
});

// DEVLAB Microservice endpoints
router.get('/devlab/exercises', (req, res) => {
  res.json({
    success: true,
    data: mockData.devlab.exercises,
    total: mockData.devlab.totalExercises,
    totalParticipants: mockData.devlab.totalParticipants,
    averageParticipationRate: mockData.devlab.averageParticipationRate,
    difficultyDistribution: mockData.devlab.difficultyDistribution
  });
});

router.get('/devlab/exercises/:id', (req, res) => {
  const exercise = mockData.devlab.exercises.find(e => e.id === req.params.id);
  if (exercise) {
    res.json({ success: true, data: exercise });
  } else {
    res.status(404).json({ success: false, message: 'Exercise not found' });
  }
});

router.get('/devlab/participation/:userId', (req, res) => {
  const userParticipations = [];
  mockData.devlab.exercises.forEach(exercise => {
    const participation = exercise.participants.find(p => p.userId === req.params.userId);
    if (participation) {
      userParticipations.push({
        exerciseId: exercise.id,
        exerciseTitle: exercise.title,
        ...participation
      });
    }
  });
  res.json({ success: true, data: userParticipations });
});

// LEARNING ANALYTICS Microservice endpoints
router.get('/analytics/trends', (req, res) => {
  res.json({
    success: true,
    data: mockData.learningAnalytics.performanceTrends
  });
});

router.get('/analytics/skill-gaps', (req, res) => {
  res.json({
    success: true,
    data: mockData.learningAnalytics.skillGaps
  });
});

router.get('/analytics/course-effectiveness', (req, res) => {
  res.json({
    success: true,
    data: mockData.learningAnalytics.courseEffectiveness
  });
});

router.get('/analytics/forecasts', (req, res) => {
  res.json({
    success: true,
    data: mockData.learningAnalytics.strategicForecasts
  });
});

router.get('/analytics/insights', (req, res) => {
  res.json({
    success: true,
    data: mockData.learningAnalytics.insights
  });
});

// Dashboard aggregated data endpoint
router.get('/dashboard/overview', (req, res) => {
  res.json({
    success: true,
    data: {
      totalUsers: mockData.directory.totalUsers,
      activeUsers: mockData.directory.activeUsers,
      totalCourses: mockData.coursebuilder.totalCourses,
      totalEnrollments: mockData.coursebuilder.totalEnrollments,
      averageCompletionRate: mockData.coursebuilder.averageCompletionRate,
      totalSkillsAcquired: mockData.learnerai.totalSkillsAcquired,
      averageProficiency: mockData.learnerai.averageProficiency,
      totalExercises: mockData.devlab.totalExercises,
      averageParticipationRate: mockData.devlab.averageParticipationRate,
      insights: mockData.learningAnalytics.insights.slice(0, 3), // Latest 3 insights
      trends: mockData.learningAnalytics.performanceTrends,
      skillGaps: mockData.learningAnalytics.skillGaps
    }
  });
});

module.exports = router;

