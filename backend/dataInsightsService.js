// Data Insights Service for HR Management Reporting
// Generates interesting analytics and insights from cached data

class DataInsightsService {
  constructor(dataProcessor, cacheManager) {
    this.dataProcessor = dataProcessor;
    this.cacheManager = cacheManager;
  }

  // ========================================
  // COURSE ANALYTICS INSIGHTS
  // ========================================

  // Active vs Registered Users Comparison
  generateActiveVsRegisteredInsights(courses) {
    return courses.map(course => ({
      courseId: course.id,
      courseTitle: course.title,
      organizationId: course.organizationId,
      registeredUsers: course.enrollmentCount,
      activeUsers: course.activeUsers,
      inactiveUsers: course.enrollmentCount - course.activeUsers,
      activityRate: Math.round((course.activeUsers / course.enrollmentCount) * 100),
      engagementLevel: this.getEngagementLevel(course.activeUsers, course.enrollmentCount)
    }));
  }

  // Course Completion Trends
  generateCompletionTrends(courses) {
    const trends = courses.map(course => ({
      courseId: course.id,
      courseTitle: course.title,
      completionRate: course.completionRate,
      enrollmentCount: course.enrollmentCount,
      completionCount: Math.round((course.completionRate / 100) * course.enrollmentCount),
      nonCompletionCount: course.enrollmentCount - Math.round((course.completionRate / 100) * course.enrollmentCount),
      performanceCategory: this.getPerformanceCategory(course.completionRate)
    }));

    return {
      courses: trends,
      summary: {
        averageCompletionRate: Math.round(trends.reduce((sum, t) => sum + t.completionRate, 0) / trends.length),
        highPerformers: trends.filter(t => t.completionRate >= 80).length,
        lowPerformers: trends.filter(t => t.completionRate < 60).length,
        totalEnrollments: trends.reduce((sum, t) => sum + t.enrollmentCount, 0),
        totalCompletions: trends.reduce((sum, t) => sum + t.completionCount, 0)
      }
    };
  }

  // ========================================
  // SKILL DEVELOPMENT INSIGHTS
  // ========================================

  // Skill Acquisition Timeline
  generateSkillAcquisitionInsights(skills) {
    const skillTimeline = skills.map(skill => ({
      skillId: skill.id,
      skillName: skill.skillName,
      skillLevel: skill.skillLevel,
      userId: skill.userId,
      acquiredAt: skill.acquiredAt,
      confidenceScore: skill.confidenceScore,
      month: new Date(skill.acquiredAt).toISOString().substring(0, 7), // YYYY-MM
      year: new Date(skill.acquiredAt).getFullYear(),
      quarter: this.getQuarter(new Date(skill.acquiredAt))
    }));

    // Group by time periods
    const monthlyData = this.groupBy(skillTimeline, 'month');
    const quarterlyData = this.groupBy(skillTimeline, 'quarter');
    const yearlyData = this.groupBy(skillTimeline, 'year');

    return {
      timeline: skillTimeline,
      monthlyBreakdown: Object.keys(monthlyData).map(month => ({
        period: month,
        skillsAcquired: monthlyData[month].length,
        averageConfidence: Math.round(
          monthlyData[month].reduce((sum, skill) => sum + skill.confidenceScore, 0) / monthlyData[month].length * 100
        ) / 100,
        skillLevels: this.groupBy(monthlyData[month], 'skillLevel')
      })),
      quarterlyBreakdown: Object.keys(quarterlyData).map(quarter => ({
        period: quarter,
        skillsAcquired: quarterlyData[quarter].length,
        averageConfidence: Math.round(
          quarterlyData[quarter].reduce((sum, skill) => sum + skill.confidenceScore, 0) / quarterlyData[quarter].length * 100
        ) / 100
      })),
      yearlyBreakdown: Object.keys(yearlyData).map(year => ({
        period: year,
        skillsAcquired: yearlyData[year].length,
        averageConfidence: Math.round(
          yearlyData[year].reduce((sum, skill) => sum + skill.confidenceScore, 0) / yearlyData[year].length * 100
        ) / 100
      }))
    };
  }

  // Skill Gap Analysis
  generateSkillGapInsights(skillGaps, users) {
    return skillGaps.map(gap => ({
      organizationId: gap.organizationId,
      skillName: gap.skillName,
      gapPercentage: gap.gapPercentage,
      affectedUsers: gap.affectedUsers,
      priority: gap.priority,
      recommendedCourses: gap.recommendedCourses,
      impactLevel: this.getImpactLevel(gap.gapPercentage),
      urgencyScore: this.calculateUrgencyScore(gap.gapPercentage, gap.affectedUsers),
      estimatedTrainingHours: this.estimateTrainingHours(gap.skillName, gap.affectedUsers)
    }));
  }

  // ========================================
  // USER ENGAGEMENT INSIGHTS
  // ========================================

  // User Activity Patterns
  generateUserActivityInsights(users, courses, exercises) {
    return users.map(user => {
      const userCourses = courses.filter(course => 
        course.enrollmentCount > 0 && course.organizationId === user.organizationId
      );
      const userExercises = exercises.filter(exercise => 
        exercise.participationCount > 0 && exercise.organizationId === user.organizationId
      );

      return {
        userId: user.id,
        userName: `${user.firstName} ${user.lastName}`,
        organizationId: user.organizationId,
        role: user.role,
        department: user.department,
        lastLogin: user.lastLogin,
        daysSinceLastLogin: this.getDaysSinceLastLogin(user.lastLogin),
        activityLevel: this.getActivityLevel(user.lastLogin),
        skillCount: user.profile?.skills?.length || 0,
        experienceYears: parseInt(user.profile?.experience || '0'),
        engagementScore: this.calculateEngagementScore(user, userCourses, userExercises),
        learningVelocity: this.calculateLearningVelocity(user.profile?.skills || [])
      };
    });
  }

  // ========================================
  // ORGANIZATIONAL PERFORMANCE INSIGHTS
  // ========================================

  // Cross-Organizational Comparison
  generateCrossOrgInsights(organizations, courses, users, trends) {
    return organizations.map(org => {
      const orgCourses = courses.filter(course => course.organizationId === org.id);
      const orgUsers = users.filter(user => user.organizationId === org.id);
      const orgTrends = trends.filter(trend => trend.organizationId === org.id);

      return {
        organizationId: org.id,
        organizationName: org.name,
        userCount: orgUsers.length,
        courseCount: orgCourses.length,
        averageCompletionRate: orgCourses.length > 0 ? 
          Math.round(orgCourses.reduce((sum, course) => sum + course.completionRate, 0) / orgCourses.length) : 0,
        totalEnrollments: orgCourses.reduce((sum, course) => sum + course.enrollmentCount, 0),
        activeUsers: orgCourses.reduce((sum, course) => sum + course.activeUsers, 0),
        performanceScore: this.calculateOrgPerformanceScore(orgCourses, orgUsers, orgTrends),
        growthTrend: this.getGrowthTrend(orgTrends),
        skillDiversity: this.calculateSkillDiversity(orgUsers),
        learningEfficiency: this.calculateLearningEfficiency(orgCourses, orgUsers)
      };
    });
  }

  // ========================================
  // EXERCISE PERFORMANCE INSIGHTS
  // ========================================

  // Exercise Difficulty vs Completion Analysis
  generateExerciseInsights(exercises, participations) {
    return exercises.map(exercise => {
      const exerciseParticipations = participations.filter(p => p.exerciseId === exercise.id);
      const completionRate = exercise.participationCount > 0 ? 
        (exercise.completionCount / exercise.participationCount) * 100 : 0;
      
      return {
        exerciseId: exercise.id,
        exerciseTitle: exercise.title,
        difficulty: exercise.difficulty,
        language: exercise.language,
        organizationId: exercise.organizationId,
        participationCount: exercise.participationCount,
        completionCount: exercise.completionCount,
        completionRate: Math.round(completionRate),
        averageTime: exercise.averageTime,
        difficultyScore: this.getDifficultyScore(exercise.difficulty),
        efficiencyScore: this.calculateEfficiencyScore(exercise.averageTime, exercise.completionRate),
        popularityRank: 0, // Will be calculated after sorting
        performanceCategory: this.getExercisePerformanceCategory(completionRate, exercise.averageTime)
      };
    }).sort((a, b) => b.participationCount - a.participationCount)
      .map((exercise, index) => ({ ...exercise, popularityRank: index + 1 }));
  }

  // ========================================
  // PREDICTIVE INSIGHTS
  // ========================================

  // Learning Outcome Predictions
  generatePredictiveInsights(courses, skills, trends) {
    return {
      courseSuccessPredictions: courses.map(course => ({
        courseId: course.id,
        courseTitle: course.title,
        currentCompletionRate: course.completionRate,
        predictedCompletionRate: this.predictCompletionRate(course),
        confidenceLevel: this.getPredictionConfidence(course),
        riskFactors: this.identifyRiskFactors(course),
        recommendations: this.generateCourseRecommendations(course)
      })),
      
      skillDemandForecast: this.generateSkillDemandForecast(skills, trends),
      
      organizationalGrowthProjections: this.generateOrgGrowthProjections(trends)
    };
  }

  // ========================================
  // HELPER FUNCTIONS
  // ========================================

  getEngagementLevel(activeUsers, totalUsers) {
    const ratio = activeUsers / totalUsers;
    if (ratio >= 0.8) return 'High';
    if (ratio >= 0.6) return 'Medium';
    if (ratio >= 0.4) return 'Low';
    return 'Very Low';
  }

  getPerformanceCategory(completionRate) {
    if (completionRate >= 90) return 'Excellent';
    if (completionRate >= 80) return 'Good';
    if (completionRate >= 70) return 'Average';
    if (completionRate >= 60) return 'Below Average';
    return 'Poor';
  }

  getQuarter(date) {
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    if (month <= 3) return `Q1 ${year}`;
    if (month <= 6) return `Q2 ${year}`;
    if (month <= 9) return `Q3 ${year}`;
    return `Q4 ${year}`;
  }

  getImpactLevel(gapPercentage) {
    if (gapPercentage >= 50) return 'Critical';
    if (gapPercentage >= 30) return 'High';
    if (gapPercentage >= 15) return 'Medium';
    return 'Low';
  }

  calculateUrgencyScore(gapPercentage, affectedUsers) {
    return Math.round((gapPercentage * affectedUsers) / 100);
  }

  estimateTrainingHours(skillName, userCount) {
    const baseHours = {
      'JavaScript': 40,
      'Python': 35,
      'React': 30,
      'Node.js': 25,
      'Data Analysis': 45,
      'Leadership': 20
    };
    return (baseHours[skillName] || 30) * userCount;
  }

  getDaysSinceLastLogin(lastLogin) {
    const lastLoginDate = new Date(lastLogin);
    const now = new Date();
    return Math.floor((now - lastLoginDate) / (1000 * 60 * 60 * 24));
  }

  getActivityLevel(lastLogin) {
    const daysSince = this.getDaysSinceLastLogin(lastLogin);
    if (daysSince <= 1) return 'Very Active';
    if (daysSince <= 7) return 'Active';
    if (daysSince <= 30) return 'Moderate';
    if (daysSince <= 90) return 'Low';
    return 'Inactive';
  }

  calculateEngagementScore(user, courses, exercises) {
    const skillCount = user.profile?.skills?.length || 0;
    const experienceYears = parseInt(user.profile?.experience || '0');
    const daysSinceLogin = this.getDaysSinceLastLogin(user.lastLogin);
    
    let score = 0;
    score += skillCount * 10; // Skills contribute to engagement
    score += experienceYears * 5; // Experience contributes
    score += Math.max(0, 30 - daysSinceLogin); // Recent activity contributes
    
    return Math.min(100, Math.max(0, score));
  }

  calculateLearningVelocity(skills) {
    if (skills.length === 0) return 0;
    // Simple calculation based on skill count
    return Math.min(10, skills.length);
  }

  calculateOrgPerformanceScore(courses, users, trends) {
    const avgCompletionRate = courses.length > 0 ? 
      courses.reduce((sum, course) => sum + course.completionRate, 0) / courses.length : 0;
    const userEngagement = users.length > 0 ? 
      users.reduce((sum, user) => sum + (user.profile?.skills?.length || 0), 0) / users.length : 0;
    const trendScore = trends.length > 0 ? 
      trends.reduce((sum, trend) => sum + trend.value, 0) / trends.length : 0;
    
    return Math.round((avgCompletionRate + userEngagement * 10 + trendScore) / 3);
  }

  getGrowthTrend(trends) {
    const increasingTrends = trends.filter(trend => trend.trend === 'increasing').length;
    const totalTrends = trends.length;
    
    if (totalTrends === 0) return 'Unknown';
    if (increasingTrends / totalTrends >= 0.7) return 'Growing';
    if (increasingTrends / totalTrends >= 0.4) return 'Stable';
    return 'Declining';
  }

  calculateSkillDiversity(users) {
    const allSkills = users.flatMap(user => user.profile?.skills || []);
    const uniqueSkills = [...new Set(allSkills)];
    return uniqueSkills.length;
  }

  calculateLearningEfficiency(courses, users) {
    const totalCompletions = courses.reduce((sum, course) => 
      sum + Math.round((course.completionRate / 100) * course.enrollmentCount), 0);
    const totalUsers = users.length;
    
    return totalUsers > 0 ? Math.round(totalCompletions / totalUsers) : 0;
  }

  getDifficultyScore(difficulty) {
    const scores = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
    return scores[difficulty] || 1;
  }

  calculateEfficiencyScore(averageTime, completionRate) {
    // Lower time and higher completion rate = better efficiency
    const timeScore = Math.max(0, 60 - averageTime) / 60 * 50;
    const completionScore = completionRate / 100 * 50;
    return Math.round(timeScore + completionScore);
  }

  getExercisePerformanceCategory(completionRate, averageTime) {
    if (completionRate >= 80 && averageTime <= 45) return 'Excellent';
    if (completionRate >= 70 && averageTime <= 60) return 'Good';
    if (completionRate >= 60) return 'Average';
    return 'Needs Improvement';
  }

  predictCompletionRate(course) {
    // Simple prediction based on current metrics
    const baseRate = course.completionRate;
    const enrollmentFactor = Math.min(1.2, course.enrollmentCount / 20);
    const activityFactor = course.activeUsers / course.enrollmentCount;
    
    return Math.min(100, Math.round(baseRate * enrollmentFactor * activityFactor));
  }

  getPredictionConfidence(course) {
    // Confidence based on data quality and sample size
    const sampleSize = course.enrollmentCount;
    if (sampleSize >= 50) return 'High';
    if (sampleSize >= 20) return 'Medium';
    return 'Low';
  }

  identifyRiskFactors(course) {
    const risks = [];
    if (course.completionRate < 60) risks.push('Low completion rate');
    if (course.activeUsers / course.enrollmentCount < 0.5) risks.push('Low engagement');
    if (course.enrollmentCount < 10) risks.push('Small sample size');
    return risks;
  }

  generateCourseRecommendations(course) {
    const recommendations = [];
    if (course.completionRate < 70) recommendations.push('Consider additional support materials');
    if (course.activeUsers / course.enrollmentCount < 0.6) recommendations.push('Implement engagement strategies');
    if (course.enrollmentCount > 50) recommendations.push('Consider breaking into smaller groups');
    return recommendations;
  }

  generateSkillDemandForecast(skills, trends) {
    const skillCounts = this.groupBy(skills, 'skillName');
    return Object.keys(skillCounts).map(skillName => ({
      skillName,
      currentDemand: skillCounts[skillName].length,
      predictedDemand: Math.round(skillCounts[skillName].length * 1.2), // 20% growth
      growthRate: 20,
      trend: 'increasing'
    }));
  }

  generateOrgGrowthProjections(trends) {
    const orgTrends = this.groupBy(trends, 'organizationId');
    return Object.keys(orgTrends).map(orgId => ({
      organizationId: orgId,
      currentPerformance: orgTrends[orgId].reduce((sum, trend) => sum + trend.value, 0) / orgTrends[orgId].length,
      projectedGrowth: 15, // 15% projected growth
      confidenceLevel: 'Medium'
    }));
  }

  groupBy(array, key) {
    return array.reduce((groups, item) => {
      const group = item[key];
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    }, {});
  }
}

// Export the DataInsightsService class
module.exports = DataInsightsService;
