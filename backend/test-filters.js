// Test filters for data processing
const testFilters = {
  // Filter by date range
  filterByDateRange: (data, startDate, endDate) => {
    return data.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= new Date(startDate) && itemDate <= new Date(endDate);
    });
  },

  // Filter by status
  filterByStatus: (data, status) => {
    return data.filter(item => item.status === status);
  },

  // Filter by user type
  filterByUserType: (data, userType) => {
    return data.filter(item => item.userType === userType);
  },

  // Filter by organization
  filterByOrganization: (data, orgId) => {
    return data.filter(item => item.organizationId === orgId);
  },

  // Filter by performance range
  filterByPerformance: (data, minScore, maxScore) => {
    return data.filter(item => {
      const score = item.performanceScore || 0;
      return score >= minScore && score <= maxScore;
    });
  },

  // Filter by completion status
  filterByCompletion: (data, completionPercentage) => {
    return data.filter(item => {
      const completion = item.completionPercentage || 0;
      return completion >= completionPercentage;
    });
  },

  // Filter by skill level
  filterBySkillLevel: (data, skillLevel) => {
    return data.filter(item => item.skillLevel === skillLevel);
  },

  // Filter by department
  filterByDepartment: (data, department) => {
    return data.filter(item => item.department === department);
  },

  // Filter by role
  filterByRole: (data, role) => {
    return data.filter(item => item.role === role);
  },

  // Filter by experience level
  filterByExperience: (data, experienceLevel) => {
    return data.filter(item => item.experienceLevel === experienceLevel);
  }
};

module.exports = testFilters;