// Data Filtering and Normalization Functions
// This file contains comprehensive filtering and normalization utilities for all microservice data

const mockData = require('../data/mockData');

/**
 * Data Filtering Functions
 */

// DIRECTORY Microservice Filters
const directoryFilters = {
  // Filter users by department
  filterUsersByDepartment: (department) => {
    return mockData.directory.users.filter(user => 
      user.department.toLowerCase() === department.toLowerCase()
    );
  },

  // Filter users by role
  filterUsersByRole: (role) => {
    return mockData.directory.users.filter(user => 
      user.role.toLowerCase().includes(role.toLowerCase())
    );
  },

  // Filter users by status
  filterUsersByStatus: (status) => {
    return mockData.directory.users.filter(user => 
      user.status.toLowerCase() === status.toLowerCase()
    );
  },

  // Filter users by skills
  filterUsersBySkills: (skills) => {
    const skillArray = Array.isArray(skills) ? skills : [skills];
    return mockData.directory.users.filter(user => 
      skillArray.some(skill => 
        user.skills.some(userSkill => 
          userSkill.toLowerCase().includes(skill.toLowerCase())
        )
      )
    );
  },

  // Filter users by location
  filterUsersByLocation: (location) => {
    return mockData.directory.users.filter(user => 
      user.location.toLowerCase().includes(location.toLowerCase())
    );
  },

  // Filter users by hire date range
  filterUsersByHireDateRange: (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return mockData.directory.users.filter(user => {
      const hireDate = new Date(user.hireDate);
      return hireDate >= start && hireDate <= end;
    });
  },

  // Filter departments by employee count
  filterDepartmentsByEmployeeCount: (minCount, maxCount) => {
    return mockData.directory.departments.filter(dept => 
      dept.employeeCount >= minCount && dept.employeeCount <= maxCount
    );
  }
};

// COURSEBUILDER Microservice Filters
const coursebuilderFilters = {
  // Filter courses by category
  filterCoursesByCategory: (category) => {
    return mockData.coursebuilder.courses.filter(course => 
      course.category.toLowerCase() === category.toLowerCase()
    );
  },

  // Filter courses by difficulty
  filterCoursesByDifficulty: (difficulty) => {
    return mockData.coursebuilder.courses.filter(course => 
      course.difficulty.toLowerCase() === difficulty.toLowerCase()
    );
  },

  // Filter courses by instructor
  filterCoursesByInstructor: (instructor) => {
    return mockData.coursebuilder.courses.filter(course => 
      course.instructor.toLowerCase().includes(instructor.toLowerCase())
    );
  },

  // Filter courses by completion rate range
  filterCoursesByCompletionRate: (minRate, maxRate) => {
    return mockData.coursebuilder.courses.filter(course => 
      course.completionRate >= minRate && course.completionRate <= maxRate
    );
  },

  // Filter courses by rating
  filterCoursesByRating: (minRating) => {
    return mockData.coursebuilder.courses.filter(course => 
      course.averageRating >= minRating
    );
  },

  // Filter courses by enrollment count
  filterCoursesByEnrollment: (minEnrollment) => {
    return mockData.coursebuilder.courses.filter(course => 
      course.totalEnrollments >= minEnrollment
    );
  },

  // Filter lessons by type
  filterLessonsByType: (type) => {
    const lessons = [];
    mockData.coursebuilder.courses.forEach(course => {
      course.lessons.forEach(lesson => {
        if (lesson.type.toLowerCase() === type.toLowerCase()) {
          lessons.push({ ...lesson, courseId: course.id, courseTitle: course.title });
        }
      });
    });
    return lessons;
  },

  // Filter lessons by completion rate
  filterLessonsByCompletionRate: (minRate) => {
    const lessons = [];
    mockData.coursebuilder.courses.forEach(course => {
      course.lessons.forEach(lesson => {
        if (lesson.completionRate >= minRate) {
          lessons.push({ ...lesson, courseId: course.id, courseTitle: course.title });
        }
      });
    });
    return lessons;
  }
};

// ASSESSMENT Microservice Filters
const assessmentFilters = {
  // Filter tests by course
  filterTestsByCourse: (courseId) => {
    return mockData.assessment.tests.filter(test => 
      test.courseId === courseId
    );
  },

  // Filter attempts by user
  filterAttemptsByUser: (userId) => {
    const attempts = [];
    mockData.assessment.tests.forEach(test => {
      test.attempts.forEach(attempt => {
        if (attempt.userId === userId) {
          attempts.push({ ...attempt, testId: test.id, testTitle: test.title });
        }
      });
    });
    return attempts;
  },

  // Filter attempts by score range
  filterAttemptsByScore: (minScore, maxScore) => {
    const attempts = [];
    mockData.assessment.tests.forEach(test => {
      test.attempts.forEach(attempt => {
        if (attempt.score >= minScore && attempt.score <= maxScore) {
          attempts.push({ ...attempt, testId: test.id, testTitle: test.title });
        }
      });
    });
    return attempts;
  },

  // Filter attempts by grade
  filterAttemptsByGrade: (grade) => {
    const attempts = [];
    mockData.assessment.tests.forEach(test => {
      test.attempts.forEach(attempt => {
        if (attempt.grade === grade) {
          attempts.push({ ...attempt, testId: test.id, testTitle: test.title });
        }
      });
    });
    return attempts;
  },

  // Filter attempts by date range
  filterAttemptsByDateRange: (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const attempts = [];
    mockData.assessment.tests.forEach(test => {
      test.attempts.forEach(attempt => {
        const attemptDate = new Date(attempt.completedAt);
        if (attemptDate >= start && attemptDate <= end) {
          attempts.push({ ...attempt, testId: test.id, testTitle: test.title });
        }
      });
    });
    return attempts;
  },

  // Filter questions by difficulty
  filterQuestionsByDifficulty: (difficulty) => {
    const questions = [];
    mockData.assessment.tests.forEach(test => {
      test.questions.forEach(question => {
        if (question.difficulty.toLowerCase() === difficulty.toLowerCase()) {
          questions.push({ ...question, testId: test.id, testTitle: test.title });
        }
      });
    });
    return questions;
  },

  // Filter questions by type
  filterQuestionsByType: (type) => {
    const questions = [];
    mockData.assessment.tests.forEach(test => {
      test.questions.forEach(question => {
        if (question.type.toLowerCase() === type.toLowerCase()) {
          questions.push({ ...question, testId: test.id, testTitle: test.title });
        }
      });
    });
    return questions;
  }
};

// LEARNERAI Microservice Filters
const learneraiFilters = {
  // Filter skills by user
  filterSkillsByUser: (userId) => {
    const userSkills = mockData.learnerai.skillsAcquired.find(skill => 
      skill.userId === userId
    );
    return userSkills ? userSkills.skills : [];
  },

  // Filter skills by course
  filterSkillsByCourse: (courseId) => {
    const courseSkills = mockData.learnerai.skillsAcquired.find(skill => 
      skill.courseId === courseId
    );
    return courseSkills ? courseSkills.skills : [];
  },

  // Filter skills by proficiency level
  filterSkillsByProficiency: (minProficiency) => {
    const skills = [];
    mockData.learnerai.skillsAcquired.forEach(userSkill => {
      userSkill.skills.forEach(skill => {
        if (skill.proficiency >= minProficiency) {
          skills.push({ ...skill, userId: userSkill.userId, courseId: userSkill.courseId });
        }
      });
    });
    return skills;
  },

  // Filter skills by confidence level
  filterSkillsByConfidence: (minConfidence) => {
    const skills = [];
    mockData.learnerai.skillsAcquired.forEach(userSkill => {
      userSkill.skills.forEach(skill => {
        if (skill.confidence >= minConfidence) {
          skills.push({ ...skill, userId: userSkill.userId, courseId: userSkill.courseId });
        }
      });
    });
    return skills;
  },

  // Filter skill categories by acquisition count
  filterSkillCategoriesByAcquisition: (minAcquisitions) => {
    return mockData.learnerai.skillCategories.filter(category => 
      category.totalAcquisitions >= minAcquisitions
    );
  },

  // Filter skill categories by average proficiency
  filterSkillCategoriesByProficiency: (minProficiency) => {
    return mockData.learnerai.skillCategories.filter(category => 
      category.averageProficiency >= minProficiency
    );
  }
};

// DEVLAB Microservice Filters
const devlabFilters = {
  // Filter exercises by course
  filterExercisesByCourse: (courseId) => {
    return mockData.devlab.exercises.filter(exercise => 
      exercise.courseId === courseId
    );
  },

  // Filter exercises by difficulty
  filterExercisesByDifficulty: (difficulty) => {
    return mockData.devlab.exercises.filter(exercise => 
      exercise.difficulty.toLowerCase() === difficulty.toLowerCase()
    );
  },

  // Filter exercises by technology
  filterExercisesByTechnology: (technology) => {
    return mockData.devlab.exercises.filter(exercise => 
      exercise.technologies.some(tech => 
        tech.toLowerCase().includes(technology.toLowerCase())
      )
    );
  },

  // Filter exercises by estimated time range
  filterExercisesByTimeRange: (minTime, maxTime) => {
    return mockData.devlab.exercises.filter(exercise => 
      exercise.estimatedTime >= minTime && exercise.estimatedTime <= maxTime
    );
  },

  // Filter participants by user
  filterParticipantsByUser: (userId) => {
    const participations = [];
    mockData.devlab.exercises.forEach(exercise => {
      exercise.participants.forEach(participant => {
        if (participant.userId === userId) {
          participations.push({ 
            ...participant, 
            exerciseId: exercise.id, 
            exerciseTitle: exercise.title,
            difficulty: exercise.difficulty
          });
        }
      });
    });
    return participations;
  },

  // Filter participants by completion time range
  filterParticipantsByCompletionTime: (minTime, maxTime) => {
    const participations = [];
    mockData.devlab.exercises.forEach(exercise => {
      exercise.participants.forEach(participant => {
        if (participant.completionTime >= minTime && participant.completionTime <= maxTime) {
          participations.push({ 
            ...participant, 
            exerciseId: exercise.id, 
            exerciseTitle: exercise.title,
            difficulty: exercise.difficulty
          });
        }
      });
    });
    return participations;
  },

  // Filter participants by difficulty rating
  filterParticipantsByDifficultyRating: (minRating, maxRating) => {
    const participations = [];
    mockData.devlab.exercises.forEach(exercise => {
      exercise.participants.forEach(participant => {
        if (participant.difficultyRating >= minRating && participant.difficultyRating <= maxRating) {
          participations.push({ 
            ...participant, 
            exerciseId: exercise.id, 
            exerciseTitle: exercise.title,
            difficulty: exercise.difficulty
          });
        }
      });
    });
    return participations;
  }
};

// LEARNING ANALYTICS Microservice Filters
const learningAnalyticsFilters = {
  // Filter performance trends by metric
  filterPerformanceTrendsByMetric: (metric) => {
    return mockData.learningAnalytics.performanceTrends.filter(trend => 
      trend.metric.toLowerCase().includes(metric.toLowerCase())
    );
  },

  // Filter performance trends by trend direction
  filterPerformanceTrendsByTrend: (trendDirection) => {
    return mockData.learningAnalytics.performanceTrends.filter(trend => 
      trend.trend.toLowerCase() === trendDirection.toLowerCase()
    );
  },

  // Filter skill gaps by department
  filterSkillGapsByDepartment: (department) => {
    return mockData.learningAnalytics.skillGaps.filter(gap => 
      gap.department.toLowerCase() === department.toLowerCase()
    );
  },

  // Filter skill gaps by severity
  filterSkillGapsBySeverity: (severity) => {
    const gaps = [];
    mockData.learningAnalytics.skillGaps.forEach(departmentGap => {
      departmentGap.criticalGaps.forEach(gap => {
        if (gap.gapSeverity.toLowerCase() === severity.toLowerCase()) {
          gaps.push({ ...gap, department: departmentGap.department });
        }
      });
    });
    return gaps;
  },

  // Filter course effectiveness by effectiveness score
  filterCourseEffectivenessByScore: (minScore) => {
    return mockData.learningAnalytics.courseEffectiveness.filter(course => 
      course.effectiveness >= minScore
    );
  },

  // Filter strategic forecasts by timeframe
  filterStrategicForecastsByTimeframe: (timeframe) => {
    return mockData.learningAnalytics.strategicForecasts.filter(forecast => 
      forecast.timeframe.toLowerCase().includes(timeframe.toLowerCase())
    );
  },

  // Filter insights by type
  filterInsightsByType: (type) => {
    return mockData.learningAnalytics.insights.filter(insight => 
      insight.type.toLowerCase() === type.toLowerCase()
    );
  },

  // Filter insights by severity
  filterInsightsBySeverity: (severity) => {
    return mockData.learningAnalytics.insights.filter(insight => 
      insight.severity.toLowerCase() === severity.toLowerCase()
    );
  },

  // Filter insights by confidence level
  filterInsightsByConfidence: (minConfidence) => {
    return mockData.learningAnalytics.insights.filter(insight => 
      insight.confidence >= minConfidence
    );
  }
};

/**
 * Data Normalization Functions
 */

const dataNormalizers = {
  // Normalize user data
  normalizeUser: (user) => {
    return {
      id: user.id,
      fullName: `${user.firstName} ${user.lastName}`,
      email: user.email.toLowerCase(),
      role: user.role,
      department: user.department,
      manager: user.manager,
      hireDate: new Date(user.hireDate).toISOString(),
      location: user.location,
      status: user.status.toLowerCase(),
      skills: user.skills.map(skill => skill.toLowerCase()),
      certifications: user.certifications.map(cert => cert.toLowerCase()),
      lastLogin: new Date(user.lastLogin).toISOString(),
      tenureDays: Math.floor((new Date() - new Date(user.hireDate)) / (1000 * 60 * 60 * 24))
    };
  },

  // Normalize course data
  normalizeCourse: (course) => {
    return {
      id: course.id,
      title: course.title,
      description: course.description,
      instructor: course.instructor,
      category: course.category.toLowerCase(),
      difficulty: course.difficulty.toLowerCase(),
      duration: course.duration,
      lessons: course.lessons.map(lesson => ({
        id: lesson.id,
        title: lesson.title,
        duration: lesson.duration,
        order: lesson.order,
        type: lesson.type.toLowerCase(),
        completionRate: Math.round(lesson.completionRate * 100) / 100
      })),
      totalEnrollments: course.totalEnrollments,
      activeEnrollments: course.activeEnrollments,
      completionRate: Math.round(course.completionRate * 100) / 100,
      averageRating: Math.round(course.averageRating * 10) / 10,
      createdAt: new Date(course.createdAt).toISOString(),
      lastUpdated: new Date(course.lastUpdated).toISOString(),
      enrollmentRatio: Math.round((course.activeEnrollments / course.totalEnrollments) * 100) / 100
    };
  },

  // Normalize test data
  normalizeTest: (test) => {
    return {
      id: test.id,
      title: test.title,
      courseId: test.courseId,
      questions: test.questions.map(question => ({
        id: question.id,
        question: question.question,
        type: question.type.toLowerCase(),
        difficulty: question.difficulty.toLowerCase(),
        options: question.options || null,
        correctAnswer: question.correctAnswer || null
      })),
      totalQuestions: test.totalQuestions,
      timeLimit: test.timeLimit,
      passingScore: test.passingScore,
      attempts: test.attempts.map(attempt => ({
        userId: attempt.userId,
        attemptNumber: attempt.attemptNumber,
        score: attempt.score,
        grade: attempt.grade,
        completedAt: new Date(attempt.completedAt).toISOString(),
        timeSpent: attempt.timeSpent,
        feedback: attempt.feedback,
        passed: attempt.score >= test.passingScore
      })),
      averageScore: Math.round(test.averageScore * 10) / 10,
      passRate: Math.round(test.passRate * 100) / 100,
      totalAttempts: test.totalAttempts
    };
  },

  // Normalize skill data
  normalizeSkill: (skill) => {
    return {
      skill: skill.skill.toLowerCase(),
      proficiency: Math.round(skill.proficiency * 100) / 100,
      confidence: Math.round(skill.confidence * 100) / 100,
      acquiredAt: new Date(skill.acquiredAt).toISOString(),
      proficiencyLevel: skill.proficiency >= 0.8 ? 'expert' : 
                       skill.proficiency >= 0.6 ? 'intermediate' : 'beginner',
      confidenceLevel: skill.confidence >= 0.8 ? 'high' : 
                       skill.confidence >= 0.6 ? 'medium' : 'low'
    };
  },

  // Normalize exercise data
  normalizeExercise: (exercise) => {
    return {
      id: exercise.id,
      title: exercise.title,
      courseId: exercise.courseId,
      difficulty: exercise.difficulty.toLowerCase(),
      estimatedTime: exercise.estimatedTime,
      technologies: exercise.technologies.map(tech => tech.toLowerCase()),
      participants: exercise.participants.map(participant => ({
        userId: participant.userId,
        participationDate: new Date(participant.participationDate).toISOString(),
        completionTime: participant.completionTime,
        difficultyRating: participant.difficultyRating,
        feedback: participant.feedback,
        completionRatio: Math.round((participant.completionTime / exercise.estimatedTime) * 100) / 100
      })),
      totalParticipants: exercise.totalParticipants,
      averageCompletionTime: Math.round(exercise.averageCompletionTime * 10) / 10,
      averageDifficultyRating: Math.round(exercise.averageDifficultyRating * 10) / 10
    };
  },

  // Normalize performance trend data
  normalizePerformanceTrend: (trend) => {
    return {
      metric: trend.metric,
      currentValue: typeof trend.currentValue === 'number' ? 
        Math.round(trend.currentValue * 100) / 100 : trend.currentValue,
      previousValue: typeof trend.previousValue === 'number' ? 
        Math.round(trend.previousValue * 100) / 100 : trend.previousValue,
      change: Math.round(trend.change * 100) / 100,
      changePercentage: Math.round((trend.change / trend.previousValue) * 100 * 100) / 100,
      trend: trend.trend.toLowerCase(),
      period: trend.period.toLowerCase(),
      dataPoints: trend.dataPoints.map(point => ({
        date: new Date(point.date).toISOString(),
        value: Math.round(point.value * 100) / 100
      }))
    };
  },

  // Normalize insight data
  normalizeInsight: (insight) => {
    return {
      id: insight.id,
      type: insight.type.toLowerCase(),
      title: insight.title,
      description: insight.description,
      severity: insight.severity.toLowerCase(),
      confidence: Math.round(insight.confidence * 100) / 100,
      recommendation: insight.recommendation,
      generatedAt: new Date(insight.generatedAt).toISOString(),
      confidenceLevel: insight.confidence >= 0.8 ? 'high' : 
                      insight.confidence >= 0.6 ? 'medium' : 'low'
    };
  }
};

/**
 * Advanced Filtering Functions
 */

const advancedFilters = {
  // Multi-criteria user search
  searchUsers: (criteria) => {
    let users = mockData.directory.users;
    
    if (criteria.department) {
      users = users.filter(user => 
        user.department.toLowerCase() === criteria.department.toLowerCase()
      );
    }
    
    if (criteria.role) {
      users = users.filter(user => 
        user.role.toLowerCase().includes(criteria.role.toLowerCase())
      );
    }
    
    if (criteria.skills && criteria.skills.length > 0) {
      users = users.filter(user => 
        criteria.skills.some(skill => 
          user.skills.some(userSkill => 
            userSkill.toLowerCase().includes(skill.toLowerCase())
          )
        )
      );
    }
    
    if (criteria.status) {
      users = users.filter(user => 
        user.status.toLowerCase() === criteria.status.toLowerCase()
      );
    }
    
    if (criteria.location) {
      users = users.filter(user => 
        user.location.toLowerCase().includes(criteria.location.toLowerCase())
      );
    }
    
    return users;
  },

  // Multi-criteria course search
  searchCourses: (criteria) => {
    let courses = mockData.coursebuilder.courses;
    
    if (criteria.category) {
      courses = courses.filter(course => 
        course.category.toLowerCase() === criteria.category.toLowerCase()
      );
    }
    
    if (criteria.difficulty) {
      courses = courses.filter(course => 
        course.difficulty.toLowerCase() === criteria.difficulty.toLowerCase()
      );
    }
    
    if (criteria.instructor) {
      courses = courses.filter(course => 
        course.instructor.toLowerCase().includes(criteria.instructor.toLowerCase())
      );
    }
    
    if (criteria.minRating) {
      courses = courses.filter(course => 
        course.averageRating >= criteria.minRating
      );
    }
    
    if (criteria.minCompletionRate) {
      courses = courses.filter(course => 
        course.completionRate >= criteria.minCompletionRate
      );
    }
    
    return courses;
  },

  // Performance analytics filter
  getPerformanceAnalytics: (filters = {}) => {
    const analytics = {
      overall: {
        totalUsers: mockData.directory.totalUsers,
        activeUsers: mockData.directory.activeUsers,
        totalCourses: mockData.coursebuilder.totalCourses,
        totalEnrollments: mockData.coursebuilder.totalEnrollments,
        averageCompletionRate: mockData.coursebuilder.averageCompletionRate,
        averageTestScore: mockData.assessment.averageScore,
        overallPassRate: mockData.assessment.overallPassRate
      },
      trends: mockData.learningAnalytics.performanceTrends,
      skillGaps: mockData.learningAnalytics.skillGaps,
      insights: mockData.learningAnalytics.insights
    };
    
    // Apply filters if provided
    if (filters.department) {
      analytics.skillGaps = analytics.skillGaps.filter(gap => 
        gap.department.toLowerCase() === filters.department.toLowerCase()
      );
    }
    
    if (filters.severity) {
      analytics.insights = analytics.insights.filter(insight => 
        insight.severity.toLowerCase() === filters.severity.toLowerCase()
      );
    }
    
    return analytics;
  }
};

module.exports = {
  directoryFilters,
  coursebuilderFilters,
  assessmentFilters,
  learneraiFilters,
  devlabFilters,
  learningAnalyticsFilters,
  dataNormalizers,
  advancedFilters
};

