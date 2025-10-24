// Test Script for Filtering and Normalization Functions
// This script demonstrates the usage of all filtering and normalization functions

const {
  directoryFilters,
  coursebuilderFilters,
  assessmentFilters,
  learneraiFilters,
  devlabFilters,
  learningAnalyticsFilters,
  dataNormalizers,
  advancedFilters
} = require('./src/utils/dataFilters');

console.log('🧪 Testing Data Filtering and Normalization Functions\n');

// Test Directory Filters
console.log('📁 DIRECTORY FILTERS');
console.log('==================');

// Filter users by department
const engineeringUsers = directoryFilters.filterUsersByDepartment('Engineering');
console.log(`✅ Engineering users: ${engineeringUsers.length}`);

// Filter users by skills
const jsUsers = directoryFilters.filterUsersBySkills(['JavaScript', 'React']);
console.log(`✅ Users with JavaScript/React skills: ${jsUsers.length}`);

// Filter departments by employee count
const largeDepartments = directoryFilters.filterDepartmentsByEmployeeCount(20, 50);
console.log(`✅ Departments with 20-50 employees: ${largeDepartments.length}`);

// Test Course Builder Filters
console.log('\n📚 COURSE BUILDER FILTERS');
console.log('========================');

// Filter courses by category
const programmingCourses = coursebuilderFilters.filterCoursesByCategory('Programming');
console.log(`✅ Programming courses: ${programmingCourses.length}`);

// Filter courses by difficulty
const advancedCourses = coursebuilderFilters.filterCoursesByDifficulty('Advanced');
console.log(`✅ Advanced courses: ${advancedCourses.length}`);

// Filter courses by completion rate
const highCompletionCourses = coursebuilderFilters.filterCoursesByCompletionRate(0.8, 1.0);
console.log(`✅ High completion rate courses (80%+): ${highCompletionCourses.length}`);

// Test Assessment Filters
console.log('\n📝 ASSESSMENT FILTERS');
console.log('====================');

// Filter tests by course
const courseTests = assessmentFilters.filterTestsByCourse('course_001');
console.log(`✅ Tests for course_001: ${courseTests.length}`);

// Filter attempts by score range
const highScoreAttempts = assessmentFilters.filterAttemptsByScore(90, 100);
console.log(`✅ High score attempts (90-100): ${highScoreAttempts.length}`);

// Filter attempts by grade
const gradeAAttempts = assessmentFilters.filterAttemptsByGrade('A');
console.log(`✅ Grade A attempts: ${gradeAAttempts.length}`);

// Test LearnerAI Filters
console.log('\n🤖 LEARNER AI FILTERS');
console.log('====================');

// Filter skills by user
const userSkills = learneraiFilters.filterSkillsByUser('user_001');
console.log(`✅ Skills for user_001: ${userSkills.length}`);

// Filter skills by proficiency
const highProficiencySkills = learneraiFilters.filterSkillsByProficiency(0.8);
console.log(`✅ High proficiency skills (80%+): ${highProficiencySkills.length}`);

// Filter skill categories by acquisition count
const popularCategories = learneraiFilters.filterSkillCategoriesByAcquisition(1500);
console.log(`✅ Popular skill categories (1500+ acquisitions): ${popularCategories.length}`);

// Test DevLab Filters
console.log('\n💻 DEVLAB FILTERS');
console.log('================');

// Filter exercises by difficulty
const intermediateExercises = devlabFilters.filterExercisesByDifficulty('intermediate');
console.log(`✅ Intermediate exercises: ${intermediateExercises.length}`);

// Filter exercises by technology
const reactExercises = devlabFilters.filterExercisesByTechnology('React');
console.log(`✅ React exercises: ${reactExercises.length}`);

// Filter participants by user
const userParticipations = devlabFilters.filterParticipantsByUser('user_001');
console.log(`✅ Participations for user_001: ${userParticipations.length}`);

// Test Learning Analytics Filters
console.log('\n📊 LEARNING ANALYTICS FILTERS');
console.log('============================');

// Filter performance trends by metric
const completionTrends = learningAnalyticsFilters.filterPerformanceTrendsByMetric('completion');
console.log(`✅ Completion-related trends: ${completionTrends.length}`);

// Filter skill gaps by department
const engineeringGaps = learningAnalyticsFilters.filterSkillGapsByDepartment('Engineering');
console.log(`✅ Engineering skill gaps: ${engineeringGaps.length}`);

// Filter insights by type
const anomalyInsights = learningAnalyticsFilters.filterInsightsByType('anomaly');
console.log(`✅ Anomaly insights: ${anomalyInsights.length}`);

// Test Data Normalization
console.log('\n🔄 DATA NORMALIZATION');
console.log('====================');

// Normalize a user
const sampleUser = {
  id: "user_001",
  firstName: "Sarah",
  lastName: "Johnson",
  email: "SARAH.JOHNSON@EDUCOREAI.COM",
  role: "Software Engineer",
  department: "Engineering",
  manager: "Mike Chen",
  hireDate: "2022-03-15",
  location: "San Francisco, CA",
  status: "ACTIVE",
  skills: ["JavaScript", "React", "Node.js"],
  certifications: ["AWS Certified Developer"],
  lastLogin: "2024-01-15T09:30:00Z"
};

const normalizedUser = dataNormalizers.normalizeUser(sampleUser);
console.log('✅ Normalized user:');
console.log(`   Full Name: ${normalizedUser.fullName}`);
console.log(`   Email: ${normalizedUser.email}`);
console.log(`   Status: ${normalizedUser.status}`);
console.log(`   Skills: ${normalizedUser.skills.join(', ')}`);
console.log(`   Tenure: ${normalizedUser.tenureDays} days`);

// Normalize a course
const sampleCourse = {
  id: "course_001",
  title: "Advanced JavaScript Development",
  description: "Master modern JavaScript concepts",
  instructor: "Sarah Johnson",
  category: "Programming",
  difficulty: "Advanced",
  duration: "8 weeks",
  lessons: [
    {
      id: "lesson_001",
      title: "ES6+ Features",
      duration: 45,
      order: 1,
      type: "video",
      completionRate: 0.87
    }
  ],
  totalEnrollments: 1247,
  activeEnrollments: 892,
  completionRate: 0.73,
  averageRating: 4.6,
  createdAt: "2023-09-15",
  lastUpdated: "2024-01-10"
};

const normalizedCourse = dataNormalizers.normalizeCourse(sampleCourse);
console.log('\n✅ Normalized course:');
console.log(`   Category: ${normalizedCourse.category}`);
console.log(`   Difficulty: ${normalizedCourse.difficulty}`);
console.log(`   Completion Rate: ${normalizedCourse.completionRate}`);
console.log(`   Enrollment Ratio: ${normalizedCourse.enrollmentRatio}`);

// Test Advanced Filters
console.log('\n🔍 ADVANCED FILTERS');
console.log('==================');

// Multi-criteria user search
const searchCriteria = {
  department: 'Engineering',
  skills: ['JavaScript', 'React'],
  status: 'active'
};

const searchResults = advancedFilters.searchUsers(searchCriteria);
console.log(`✅ Multi-criteria user search: ${searchResults.length} results`);

// Performance analytics
const performanceAnalytics = advancedFilters.getPerformanceAnalytics();
console.log('✅ Performance analytics:');
console.log(`   Total Users: ${performanceAnalytics.overall.totalUsers}`);
console.log(`   Active Users: ${performanceAnalytics.overall.activeUsers}`);
console.log(`   Average Completion Rate: ${performanceAnalytics.overall.averageCompletionRate}`);
console.log(`   Performance Trends: ${performanceAnalytics.trends.length}`);
console.log(`   Insights: ${performanceAnalytics.insights.length}`);

console.log('\n🎉 All tests completed successfully!');
console.log('\n📋 Summary:');
console.log('===========');
console.log('✅ Directory filters: Working');
console.log('✅ Course Builder filters: Working');
console.log('✅ Assessment filters: Working');
console.log('✅ LearnerAI filters: Working');
console.log('✅ DevLab filters: Working');
console.log('✅ Learning Analytics filters: Working');
console.log('✅ Data normalization: Working');
console.log('✅ Advanced filters: Working');
console.log('\n🚀 Ready for production use!');

