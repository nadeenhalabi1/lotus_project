// Data Processing System for HR Management Reporting
// Filtering, Sorting, and Caching Functions for All Microservices

class DataProcessor {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = new Map();
    this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  }

  // ========================================
  // DIRECTORY MICROSERVICE DATA PROCESSING
  // ========================================

  // Filter users by various criteria
  filterUsers(users, filters = {}) {
    return users.filter(user => {
      // Organization filter
      if (filters.organizationId && user.organizationId !== filters.organizationId) {
        return false;
      }

      // Team filter
      if (filters.teamId && user.teamId !== filters.teamId) {
        return false;
      }

      // Role filter
      if (filters.role && user.role !== filters.role) {
        return false;
      }

      // Department filter
      if (filters.department && user.department !== filters.department) {
        return false;
      }

      // Status filter
      if (filters.status && user.status !== filters.status) {
        return false;
      }

      // Skills filter
      if (filters.skills && filters.skills.length > 0) {
        const userSkills = user.profile?.skills || [];
        if (!filters.skills.some(skill => userSkills.includes(skill))) {
          return false;
        }
      }

      // Experience filter
      if (filters.minExperience) {
        const userExp = parseInt(user.profile?.experience || '0');
        if (userExp < filters.minExperience) {
          return false;
        }
      }

      // Last login filter
      if (filters.lastLoginAfter) {
        const lastLogin = new Date(user.lastLogin);
        const filterDate = new Date(filters.lastLoginAfter);
        if (lastLogin < filterDate) {
          return false;
        }
      }

      // Search filter (name or email)
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
        const email = user.email.toLowerCase();
        if (!fullName.includes(searchTerm) && !email.includes(searchTerm)) {
          return false;
        }
      }

      return true;
    });
  }

  // Sort users by various criteria
  sortUsers(users, sortBy = 'lastName', order = 'asc') {
    return users.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'firstName':
          aValue = a.firstName;
          bValue = b.firstName;
          break;
        case 'lastName':
          aValue = a.lastName;
          bValue = b.lastName;
          break;
        case 'email':
          aValue = a.email;
          bValue = b.email;
          break;
        case 'role':
          aValue = a.role;
          bValue = b.role;
          break;
        case 'department':
          aValue = a.department;
          bValue = b.department;
          break;
        case 'lastLogin':
          aValue = new Date(a.lastLogin);
          bValue = new Date(b.lastLogin);
          break;
        case 'experience':
          aValue = parseInt(a.profile?.experience || '0');
          bValue = parseInt(b.profile?.experience || '0');
          break;
        case 'skillCount':
          aValue = a.profile?.skills?.length || 0;
          bValue = b.profile?.skills?.length || 0;
          break;
        default:
          aValue = a[sortBy];
          bValue = b[sortBy];
      }

      if (order === 'desc') {
        return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
      } else {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      }
    });
  }

  // ========================================
  // COURSE BUILDER MICROSERVICE DATA PROCESSING
  // ========================================

  // Filter courses by various criteria
  filterCourses(courses, filters = {}) {
    return courses.filter(course => {
      // Organization filter
      if (filters.organizationId && course.organizationId !== filters.organizationId) {
        return false;
      }

      // Instructor filter
      if (filters.instructorId && course.instructorId !== filters.instructorId) {
        return false;
      }

      // Status filter
      if (filters.status && course.status !== filters.status) {
        return false;
      }

      // Enrollment count filter
      if (filters.minEnrollment && course.enrollmentCount < filters.minEnrollment) {
        return false;
      }

      if (filters.maxEnrollment && course.enrollmentCount > filters.maxEnrollment) {
        return false;
      }

      // Completion rate filter
      if (filters.minCompletionRate && course.completionRate < filters.minCompletionRate) {
        return false;
      }

      if (filters.maxCompletionRate && course.completionRate > filters.maxCompletionRate) {
        return false;
      }

      // Active users filter
      if (filters.minActiveUsers && course.activeUsers < filters.minActiveUsers) {
        return false;
      }

      // Search filter (title)
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        if (!course.title.toLowerCase().includes(searchTerm)) {
          return false;
        }
      }

      // Date range filter
      if (filters.createdAfter) {
        const createdDate = new Date(course.createdAt || '2024-01-01');
        const filterDate = new Date(filters.createdAfter);
        if (createdDate < filterDate) {
          return false;
        }
      }

      return true;
    });
  }

  // Sort courses by various criteria
  sortCourses(courses, sortBy = 'title', order = 'asc') {
    return courses.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'title':
          aValue = a.title;
          bValue = b.title;
          break;
        case 'enrollmentCount':
          aValue = a.enrollmentCount;
          bValue = b.enrollmentCount;
          break;
        case 'activeUsers':
          aValue = a.activeUsers;
          bValue = b.activeUsers;
          break;
        case 'completionRate':
          aValue = a.completionRate;
          bValue = b.completionRate;
          break;
        case 'lessonCount':
          aValue = a.lessons?.length || 0;
          bValue = b.lessons?.length || 0;
          break;
        case 'totalDuration':
          aValue = a.lessons?.reduce((sum, lesson) => sum + lesson.duration, 0) || 0;
          bValue = b.lessons?.reduce((sum, lesson) => sum + lesson.duration, 0) || 0;
          break;
        default:
          aValue = a[sortBy];
          bValue = b[sortBy];
      }

      if (order === 'desc') {
        return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
      } else {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      }
    });
  }

  // ========================================
  // ASSESSMENT MICROSERVICE DATA PROCESSING
  // ========================================

  // Filter tests by various criteria
  filterTests(tests, filters = {}) {
    return tests.filter(test => {
      // Course filter
      if (filters.courseId && test.courseId !== filters.courseId) {
        return false;
      }

      // Difficulty filter
      if (filters.difficulty && test.difficulty !== filters.difficulty) {
        return false;
      }

      // Question count filter
      if (filters.minQuestions && test.questions.length < filters.minQuestions) {
        return false;
      }

      if (filters.maxQuestions && test.questions.length > filters.maxQuestions) {
        return false;
      }

      // Pass rate filter
      if (filters.minPassRate && test.passRate < filters.minPassRate) {
        return false;
      }

      // Average score filter
      if (filters.minAverageScore && test.averageScore < filters.minAverageScore) {
        return false;
      }

      // Total attempts filter
      if (filters.minAttempts && test.totalAttempts < filters.minAttempts) {
        return false;
      }

      // Search filter (title)
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        if (!test.title.toLowerCase().includes(searchTerm)) {
          return false;
        }
      }

      return true;
    });
  }

  // Sort tests by various criteria
  sortTests(tests, sortBy = 'title', order = 'asc') {
    return tests.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'title':
          aValue = a.title;
          bValue = b.title;
          break;
        case 'averageScore':
          aValue = a.averageScore;
          bValue = b.averageScore;
          break;
        case 'passRate':
          aValue = a.passRate;
          bValue = b.passRate;
          break;
        case 'totalAttempts':
          aValue = a.totalAttempts;
          bValue = b.totalAttempts;
          break;
        case 'questionCount':
          aValue = a.questions.length;
          bValue = b.questions.length;
          break;
        default:
          aValue = a[sortBy];
          bValue = b[sortBy];
      }

      if (order === 'desc') {
        return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
      } else {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      }
    });
  }

  // ========================================
  // LEARNER AI MICROSERVICE DATA PROCESSING
  // ========================================

  // Filter skills by various criteria
  filterSkills(skills, filters = {}) {
    return skills.filter(skill => {
      // User filter
      if (filters.userId && skill.userId !== filters.userId) {
        return false;
      }

      // Course filter
      if (filters.courseId && skill.courseId !== filters.courseId) {
        return false;
      }

      // Skill level filter
      if (filters.skillLevel && skill.skillLevel !== filters.skillLevel) {
        return false;
      }

      // Confidence score filter
      if (filters.minConfidenceScore && skill.confidenceScore < filters.minConfidenceScore) {
        return false;
      }

      // Date acquired filter
      if (filters.acquiredAfter) {
        const acquiredDate = new Date(skill.acquiredAt);
        const filterDate = new Date(filters.acquiredAfter);
        if (acquiredDate < filterDate) {
          return false;
        }
      }

      // Search filter (skill name)
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        if (!skill.skillName.toLowerCase().includes(searchTerm)) {
          return false;
        }
      }

      return true;
    });
  }

  // Sort skills by various criteria
  sortSkills(skills, sortBy = 'skillName', order = 'asc') {
    return skills.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'skillName':
          aValue = a.skillName;
          bValue = b.skillName;
          break;
        case 'skillLevel':
          const levelOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3, 'expert': 4 };
          aValue = levelOrder[a.skillLevel] || 0;
          bValue = levelOrder[b.skillLevel] || 0;
          break;
        case 'confidenceScore':
          aValue = a.confidenceScore;
          bValue = b.confidenceScore;
          break;
        case 'acquiredAt':
          aValue = new Date(a.acquiredAt);
          bValue = new Date(b.acquiredAt);
          break;
        default:
          aValue = a[sortBy];
          bValue = b[sortBy];
      }

      if (order === 'desc') {
        return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
      } else {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      }
    });
  }

  // ========================================
  // DEVLAB MICROSERVICE DATA PROCESSING
  // ========================================

  // Filter exercises by various criteria
  filterExercises(exercises, filters = {}) {
    return exercises.filter(exercise => {
      // Organization filter
      if (filters.organizationId && exercise.organizationId !== filters.organizationId) {
        return false;
      }

      // Difficulty filter
      if (filters.difficulty && exercise.difficulty !== filters.difficulty) {
        return false;
      }

      // Language filter
      if (filters.language && exercise.language !== filters.language) {
        return false;
      }

      // Participation count filter
      if (filters.minParticipation && exercise.participationCount < filters.minParticipation) {
        return false;
      }

      // Completion count filter
      if (filters.minCompletion && exercise.completionCount < filters.minCompletion) {
        return false;
      }

      // Average time filter
      if (filters.maxAverageTime && exercise.averageTime > filters.maxAverageTime) {
        return false;
      }

      // Search filter (title)
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        if (!exercise.title.toLowerCase().includes(searchTerm)) {
          return false;
        }
      }

      return true;
    });
  }

  // Sort exercises by various criteria
  sortExercises(exercises, sortBy = 'title', order = 'asc') {
    return exercises.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'title':
          aValue = a.title;
          bValue = b.title;
          break;
        case 'difficulty':
          const difficultyOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
          aValue = difficultyOrder[a.difficulty] || 0;
          bValue = difficultyOrder[b.difficulty] || 0;
          break;
        case 'participationCount':
          aValue = a.participationCount;
          bValue = b.participationCount;
          break;
        case 'completionCount':
          aValue = a.completionCount;
          bValue = b.completionCount;
          break;
        case 'averageTime':
          aValue = a.averageTime;
          bValue = b.averageTime;
          break;
        case 'completionRate':
          aValue = (a.completionCount / a.participationCount) * 100;
          bValue = (b.completionCount / b.participationCount) * 100;
          break;
        default:
          aValue = a[sortBy];
          bValue = b[sortBy];
      }

      if (order === 'desc') {
        return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
      } else {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      }
    });
  }

  // ========================================
  // LEARNING ANALYTICS MICROSERVICE DATA PROCESSING
  // ========================================

  // Filter performance trends by various criteria
  filterPerformanceTrends(trends, filters = {}) {
    return trends.filter(trend => {
      // Organization filter
      if (filters.organizationId && trend.organizationId !== filters.organizationId) {
        return false;
      }

      // Metric filter
      if (filters.metric && trend.metric !== filters.metric) {
        return false;
      }

      // Trend direction filter
      if (filters.trend && trend.trend !== filters.trend) {
        return false;
      }

      // Period filter
      if (filters.period && trend.period !== filters.period) {
        return false;
      }

      // Value range filter
      if (filters.minValue && trend.value < filters.minValue) {
        return false;
      }

      if (filters.maxValue && trend.value > filters.maxValue) {
        return false;
      }

      // Change percentage filter
      if (filters.minChangePercentage && Math.abs(trend.changePercentage) < filters.minChangePercentage) {
        return false;
      }

      return true;
    });
  }

  // Sort performance trends by various criteria
  sortPerformanceTrends(trends, sortBy = 'value', order = 'desc') {
    return trends.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'value':
          aValue = a.value;
          bValue = b.value;
          break;
        case 'changePercentage':
          aValue = Math.abs(a.changePercentage);
          bValue = Math.abs(b.changePercentage);
          break;
        case 'metric':
          aValue = a.metric;
          bValue = b.metric;
          break;
        case 'trend':
          const trendOrder = { 'decreasing': 1, 'stable': 2, 'increasing': 3 };
          aValue = trendOrder[a.trend] || 0;
          bValue = trendOrder[b.trend] || 0;
          break;
        default:
          aValue = a[sortBy];
          bValue = b[sortBy];
      }

      if (order === 'desc') {
        return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
      } else {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      }
    });
  }

  // ========================================
  // CACHING SYSTEM
  // ========================================

  // Generate cache key
  generateCacheKey(operation, filters = {}, sortBy = '', order = '') {
    const filterStr = JSON.stringify(filters);
    return `${operation}_${filterStr}_${sortBy}_${order}`;
  }

  // Check if cache is valid
  isCacheValid(key) {
    if (!this.cache.has(key) || !this.cacheExpiry.has(key)) {
      return false;
    }
    return Date.now() < this.cacheExpiry.get(key);
  }

  // Get data from cache
  getFromCache(key) {
    if (this.isCacheValid(key)) {
      return this.cache.get(key);
    }
    return null;
  }

  // Store data in cache
  setCache(key, data) {
    this.cache.set(key, data);
    this.cacheExpiry.set(key, Date.now() + this.CACHE_DURATION);
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
    this.cacheExpiry.clear();
  }

  // Clear expired cache entries
  clearExpiredCache() {
    const now = Date.now();
    for (const [key, expiry] of this.cacheExpiry.entries()) {
      if (now >= expiry) {
        this.cache.delete(key);
        this.cacheExpiry.delete(key);
      }
    }
  }

  // ========================================
  // PROCESSING PIPELINE
  // ========================================

  // Process data with filtering, sorting, and caching
  processData(dataType, data, filters = {}, sortBy = '', order = 'asc') {
    const cacheKey = this.generateCacheKey(dataType, filters, sortBy, order);
    
    // Check cache first
    const cachedData = this.getFromCache(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    let processedData = data;

    // Apply filtering
    switch (dataType) {
      case 'users':
        processedData = this.filterUsers(data, filters);
        break;
      case 'courses':
        processedData = this.filterCourses(data, filters);
        break;
      case 'tests':
        processedData = this.filterTests(data, filters);
        break;
      case 'skills':
        processedData = this.filterSkills(data, filters);
        break;
      case 'exercises':
        processedData = this.filterExercises(data, filters);
        break;
      case 'performanceTrends':
        processedData = this.filterPerformanceTrends(data, filters);
        break;
      default:
        console.warn(`Unknown data type: ${dataType}`);
    }

    // Apply sorting
    if (sortBy) {
      switch (dataType) {
        case 'users':
          processedData = this.sortUsers(processedData, sortBy, order);
          break;
        case 'courses':
          processedData = this.sortCourses(processedData, sortBy, order);
          break;
        case 'tests':
          processedData = this.sortTests(processedData, sortBy, order);
          break;
        case 'skills':
          processedData = this.sortSkills(processedData, sortBy, order);
          break;
        case 'exercises':
          processedData = this.sortExercises(processedData, sortBy, order);
          break;
        case 'performanceTrends':
          processedData = this.sortPerformanceTrends(processedData, sortBy, order);
          break;
      }
    }

    // Cache the result
    this.setCache(cacheKey, processedData);

    return processedData;
  }

  // ========================================
  // ANALYTICS FUNCTIONS
  // ========================================

  // Get data statistics
  getDataStats(dataType, data) {
    const stats = {
      total: data.length,
      timestamp: new Date().toISOString()
    };

    switch (dataType) {
      case 'users':
        stats.byRole = this.groupBy(data, 'role');
        stats.byDepartment = this.groupBy(data, 'department');
        stats.byStatus = this.groupBy(data, 'status');
        break;
      case 'courses':
        stats.byStatus = this.groupBy(data, 'status');
        stats.averageCompletionRate = this.calculateAverage(data, 'completionRate');
        stats.averageEnrollment = this.calculateAverage(data, 'enrollmentCount');
        break;
      case 'skills':
        stats.byLevel = this.groupBy(data, 'skillLevel');
        stats.averageConfidence = this.calculateAverage(data, 'confidenceScore');
        break;
      case 'exercises':
        stats.byDifficulty = this.groupBy(data, 'difficulty');
        stats.byLanguage = this.groupBy(data, 'language');
        stats.averageCompletionRate = this.calculateAverage(data, 'completionCount');
        break;
    }

    return stats;
  }

  // Helper function to group data by field
  groupBy(data, field) {
    return data.reduce((groups, item) => {
      const key = item[field] || 'Unknown';
      groups[key] = (groups[key] || 0) + 1;
      return groups;
    }, {});
  }

  // Helper function to calculate average
  calculateAverage(data, field) {
    if (data.length === 0) return 0;
    const sum = data.reduce((acc, item) => acc + (item[field] || 0), 0);
    return Math.round((sum / data.length) * 100) / 100;
  }
}

// Export the DataProcessor class
module.exports = DataProcessor;
