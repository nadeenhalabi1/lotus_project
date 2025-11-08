import { DataNormalizationService } from '../../domain/services/DataNormalizationService.js';
import { DataValidationService } from '../../domain/services/DataValidationService.js';

export class CollectDataUseCase {
  constructor(cacheRepository, microserviceClient, retryService) {
    this.cacheRepository = cacheRepository;
    this.microserviceClient = microserviceClient;
    this.retryService = retryService;
    this.normalizationService = new DataNormalizationService();
    this.validationService = new DataValidationService();
    this.defaultServices = ['directory', 'courseBuilder', 'assessment', 'contentStudio', 'learningAnalytics'];
  }

  async execute(jwtToken, services = null) {
    const serviceList = services?.length ? services : this.defaultServices;
    const results = {
      successful: [],
      failed: [],
      partial: false
    };

    const dateRange = this.getDateRange();

    // MOCK DATA MODE - Generate mock data instead of calling microservices
    for (const service of serviceList) {
      try {
        // Generate mock data
        const mockData = this.generateMockData(service);
        
        // Normalize data
        const normalized = this.normalizationService.normalize(mockData, service);

        // Generate cache key
        const key = this.generateCacheKey(service, normalized, dateRange.end);

        // Store in cache
        await this.cacheRepository.set(key, normalized, 5184000); // 60 days

        results.successful.push({
          service,
          lastUpdated: normalized.metadata?.collected_at || new Date().toISOString()
        });
      } catch (error) {
        console.error(`Failed to collect data from ${service}:`, error);
        const lastSuccessful = await this.cacheRepository.getLatestByService(service);
        results.failed.push({
          service,
          reason: error.message,
          lastSuccessful: lastSuccessful?.metadata?.collected_at || null
        });
        results.partial = true;
      }
    }

    if (results.failed.length && results.successful.length === 0) {
      results.allFailed = true;
    }

    return results;
  }

  generateMockData(service) {
    // ROLLBACK MODE: Realistic mock data with all fields from microservices
    const now = new Date().toISOString();
    const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const randomFloat = (min, max, decimals = 1) => parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
    const randomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
    const randomChoice = (arr) => arr[randomInt(0, arr.length - 1)];

    // Realistic data pools - English only
    const organizations = [
      'TechCorp Solutions Inc.',
      'Advanced Learning Systems',
      'Digital Innovation Group',
      'Cloud Services Enterprise',
      'Software Development Hub',
      'Data Analytics Corporation',
      'Cyber Security Institute',
      'AI Research Labs',
      'DevOps Consulting Group',
      'Full Stack Academy'
    ];
    const courseNames = [
      'JavaScript Software Development',
      'Full Stack Development',
      'Advanced Python Programming',
      'React and Node.js Development',
      'DevOps and CI/CD',
      'Mobile Application Development',
      'Java Enterprise Development',
      'C# and .NET Development',
      'Angular and TypeScript',
      'Vue.js Development',
      'Backend Development with Node.js',
      'Advanced Frontend Development',
      'Microservices Architecture',
      'API and REST Development',
      'GraphQL Development',
      'Docker and Kubernetes',
      'Cloud Native Applications',
      'Serverless Development',
      'Web3 and Blockchain Development',
      'AI and Machine Learning',
      'Data Engineering',
      'Big Data Processing',
      'Embedded Systems Development',
      'Game Development',
      'IoT Applications Development',
      'Cybersecurity and Information Security',
      'Advanced Information Security',
      'Web Application Security',
      'Cloud Infrastructure Security',
      'Data Analysis and BI',
      'Big Data Analytics',
      'Data Science',
      'Machine Learning',
      'UX/UI Design for Applications',
      'Advanced User Interface Design',
      'Cloud Services Management',
      'Cloud Infrastructure Management',
      'Software Quality Assurance (QA)',
      'Software Project Management',
      'Agile and Scrum Management',
      'Software Architecture',
      'Design Patterns',
      'Algorithms and Data Structures',
      'SQL and NoSQL Databases',
      'Advanced Software Engineering',
      'Software Engineering - System Programming',
      'Software Engineering - Web Development',
      'Software Engineering - Mobile Development',
      'Software Engineering - Database Management'
    ];
    const courseTopics = ['Programming', 'Software Development', 'Software Engineering', 'Information Security', 'UX/UI Design', 'Data Analysis', 'Cloud Computing', 'DevOps', 'AI/ML', 'Database Management'];
    const departments = ['Engineering', 'Development', 'QA', 'DevOps', 'Security', 'Data Science', 'Product', 'Support'];
    const roles = ['Developer', 'Senior Developer', 'Team Lead', 'Architect', 'QA Engineer', 'DevOps Engineer', 'Data Analyst', 'Security Specialist'];
    const contentTypes = ['video', 'document', 'quiz', 'article', 'interactive', 'podcast', 'infographic', 'webinar'];

    // Generate detailed data for each service
    const serviceData = {
      directory: {
        // User count only - no personal information stored
        // We only track counts and aggregations for privacy
        userCount: randomInt(50, 200),
        // Aggregated metrics for charts
        metrics: {
          totalUsers: 0,
          totalOrganizations: 0,
          activeUsers: 0,
          usersByRole: {},
          usersByDepartment: {},
          organizationsActive: 0
        }
      },
      courseBuilder: {
        // Detailed course data with realistic English course names
        courses: Array.from({ length: randomInt(20, 80) }).map((_, i) => {
          const courseName = randomChoice(courseNames);
          const topic = randomChoice(courseTopics);
          return {
            course_id: `crs_${String(i + 1).padStart(6, '0')}`,
            course_name: courseName,
            course_description: `Comprehensive course on ${courseName} suitable for all levels`,
            topic: topic,
            duration: randomInt(5, 40), // hours
            totalEnrollments: randomInt(50, 500),
            activeEnrollments: randomInt(30, 400),
            completionRate: randomFloat(60, 95),
            averageRating: randomFloat(3.0, 4.9),
            instructor_id: `inst_${String(randomInt(1, 20)).padStart(6, '0')}`,
            language: randomChoice(['English', 'Hebrew', 'English and Hebrew']),
            level: randomChoice(['Beginner', 'Intermediate', 'Advanced', 'Expert']),
            createdAt: randomDate(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), new Date()),
            updatedAt: randomDate(new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), new Date())
          };
        }),
        // Aggregated metrics for charts
        metrics: {
          totalCourses: 0,
          totalEnrollments: 0,
          activeEnrollments: 0,
          averageCompletionRate: 0,
          averageRating: 0,
          totalCompletedCourses: 0,
          inProgressCourses: 0
        }
      },
      assessment: {
        // Detailed assessment data with realistic information
        assessments: Array.from({ length: randomInt(100, 500) }).map((_, i) => {
          const courseId = `crs_${String(randomInt(1, 80)).padStart(6, '0')}`;
          const questions = randomInt(10, 50);
          const correctAnswers = randomInt(Math.floor(questions * 0.5), questions);
          const passingGrade = 70;
          const finalGrade = randomInt(65, 98);
          const status = finalGrade >= passingGrade ? 'completed' : (finalGrade >= 50 ? 'in-progress' : 'failed');
          
          return {
            assessment_id: `assess_${String(i + 1).padStart(6, '0')}`,
            course_id: courseId,
            user_id: `usr_${String(randomInt(1, 200)).padStart(6, '0')}`, // Only ID, no name
            assessment_name: randomChoice(['Mid-term Exam', 'Final Exam', 'Practice Test', 'Self Assessment']),
            questions: questions,
            answers: correctAnswers, // correct answers
            grades: Array.from({ length: randomInt(3, 7) }).map(() => randomInt(60, 100)),
            passing_grade: passingGrade,
            final_grade: finalGrade,
            status: status,
            completed_at: status === 'completed' ? randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()) : null,
            time_spent_minutes: randomInt(15, 120),
            attempts: randomInt(1, 3)
          };
        }),
        // Aggregated metrics for charts
        metrics: {
          totalAssessments: 0,
          averageScore: 0,
          passRate: 0,
          completedAssessments: 0,
          failedAssessments: 0,
          passedAssessments: 0
        }
      },
      contentStudio: {
        // Detailed content data with realistic English content
        contentItems: Array.from({ length: randomInt(50, 200) }).map((_, i) => {
          const contentType = randomChoice(contentTypes);
          const topic = randomChoice(courseTopics);
          
          return {
            content_id: `cnt_${String(i + 1).padStart(6, '0')}`,
            course_id: `crs_${String(randomInt(1, 80)).padStart(6, '0')}`,
            trainer_id: `trn_${String(randomInt(1, 20)).padStart(6, '0')}`, // Only ID, no name
            content_type: contentType,
            content_title: `${randomChoice(['Introduction to', 'Guide to', 'Tips for', 'Tutorial on'])} ${randomChoice(['Programming', 'Software Development', 'Software Engineering', 'JavaScript', 'Python', 'React', 'Node.js', 'Information Security'])}`,
            content_description: `Quality ${contentType} content on ${topic}`,
            views: randomInt(100, 5000),
            likes: randomInt(10, 500),
            shares: randomInt(5, 200),
            comments: randomInt(0, 100),
            duration_minutes: contentType === 'video' || contentType === 'podcast' ? randomInt(5, 60) : null,
            file_size_mb: randomFloat(1, 500, 1),
            createdAt: randomDate(new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), new Date()),
            updatedAt: randomDate(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), new Date())
          };
        }),
        // Aggregated metrics for charts
        metrics: {
          totalContentItems: 0,
          totalViews: 0,
          totalLikes: 0,
          averageViewsPerContent: 0,
          contentByType: {},
          engagementScore: 0
        }
      },
      learningAnalytics: {
        // Detailed analytics data with English labels
        trends: Array.from({ length: randomInt(5, 12) }).map((_, i) => {
          const startDate = new Date(Date.now() - (i + 1) * 30 * 24 * 60 * 60 * 1000);
          const endDate = new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000);
          const period = randomChoice(['daily', 'weekly', 'monthly']);
          
          return {
            period: period,
            date_range: {
              start: startDate.toISOString(),
              end: endDate.toISOString()
            },
            metrics: {
              totalLearningHours: randomInt(50, 500),
              avgCompletionTime: randomInt(30, 120), // minutes
              newUsers: randomInt(5, 50),
              completedCourses: randomInt(10, 100),
              activeUsers: randomInt(20, 150),
              averageScore: randomFloat(75, 95),
              engagementRate: randomFloat(60, 95)
            },
            breakdowns: {
              byDepartment: departments.reduce((acc, dept) => {
                acc[dept] = randomInt(5, 100);
                return acc;
              }, {}),
              byCourseType: courseTopics.reduce((acc, topic) => {
                acc[topic] = randomInt(10, 150);
                return acc;
              }, {}),
              byOrganization: organizations.slice(0, 5).reduce((acc, org, idx) => {
                acc[org] = randomInt(5, 80);
                return acc;
              }, {})
            },
            calculated_at: randomDate(startDate, endDate)
          };
        }),
        // Aggregated metrics for charts
        metrics: {
          totalLearningHours: 0,
          averageLearningHoursPerUser: 0,
          platformUsageRate: 0,
          userSatisfactionScore: 0,
          activeLearningSessions: 0,
          learningROI: 0
        }
      }
    };

    // Calculate aggregated metrics from detailed data
    const data = serviceData[service];
    if (service === 'directory') {
      // Only count users, no personal data stored
      const userCount = data.userCount;
      const orgs = new Set(organizations);
      data.metrics.totalUsers = userCount;
      data.metrics.totalOrganizations = orgs.size;
      data.metrics.activeUsers = randomInt(Math.floor(userCount * 0.7), userCount);
      // Generate role distribution without storing user names
      data.metrics.usersByRole = roles.reduce((acc, role) => {
        acc[role] = randomInt(Math.floor(userCount / roles.length * 0.5), Math.floor(userCount / roles.length * 1.5));
        return acc;
      }, {});
      // Generate department distribution without storing user names
      data.metrics.usersByDepartment = departments.reduce((acc, dept) => {
        acc[dept] = randomInt(Math.floor(userCount / departments.length * 0.5), Math.floor(userCount / departments.length * 1.5));
        return acc;
      }, {});
      data.metrics.organizationsActive = orgs.size;
    } else if (service === 'courseBuilder') {
      const courses = data.courses;
      data.metrics.totalCourses = courses.length;
      data.metrics.totalEnrollments = courses.reduce((sum, c) => sum + c.totalEnrollments, 0);
      data.metrics.activeEnrollments = courses.reduce((sum, c) => sum + c.activeEnrollments, 0);
      data.metrics.averageCompletionRate = courses.reduce((sum, c) => sum + c.completionRate, 0) / courses.length;
      data.metrics.averageRating = courses.reduce((sum, c) => sum + c.averageRating, 0) / courses.length;
      data.metrics.totalCompletedCourses = courses.filter(c => c.completionRate >= 90).length;
      data.metrics.inProgressCourses = courses.filter(c => c.completionRate < 90 && c.completionRate > 0).length;
    } else if (service === 'assessment') {
      const assessments = data.assessments;
      data.metrics.totalAssessments = assessments.length;
      data.metrics.averageScore = assessments.reduce((sum, a) => sum + a.final_grade, 0) / assessments.length;
      data.metrics.completedAssessments = assessments.filter(a => a.status === 'completed').length;
      data.metrics.passedAssessments = assessments.filter(a => a.final_grade >= a.passing_grade).length;
      data.metrics.failedAssessments = assessments.filter(a => a.final_grade < a.passing_grade).length;
      data.metrics.passRate = (data.metrics.passedAssessments / data.metrics.completedAssessments) * 100;
    } else if (service === 'contentStudio') {
      const contentItems = data.contentItems;
      data.metrics.totalContentItems = contentItems.length;
      data.metrics.totalViews = contentItems.reduce((sum, c) => sum + c.views, 0);
      data.metrics.totalLikes = contentItems.reduce((sum, c) => sum + c.likes, 0);
      data.metrics.averageViewsPerContent = data.metrics.totalViews / contentItems.length;
      data.metrics.contentByType = contentItems.reduce((acc, c) => {
        acc[c.content_type] = (acc[c.content_type] || 0) + 1;
        return acc;
      }, {});
      data.metrics.engagementScore = (data.metrics.totalLikes / data.metrics.totalViews) * 100;
    } else if (service === 'learningAnalytics') {
      const trends = data.trends;
      const totalHours = trends.reduce((sum, t) => sum + t.metrics.totalLearningHours, 0);
      data.metrics.totalLearningHours = totalHours;
      data.metrics.averageLearningHoursPerUser = totalHours / randomInt(100, 500);
      data.metrics.platformUsageRate = randomFloat(70, 99);
      data.metrics.userSatisfactionScore = randomFloat(3.8, 4.9);
      data.metrics.activeLearningSessions = randomInt(100, 500);
      data.metrics.learningROI = randomFloat(1.2, 3.5, 2);
    }

    return {
      timestamp: now,
      data: {
        metrics: data.metrics,
        // Include detailed data for future use (no user names stored)
        details: service === 'directory' ? { userCount: data.userCount } :
                 service === 'courseBuilder' ? { courses: data.courses } :
                 service === 'assessment' ? { assessments: data.assessments } :
                 service === 'contentStudio' ? { contentItems: data.contentItems } :
                 { trends: data.trends }
      },
      metadata: {
        source: service,
        collected_at: now,
        schema_version: '1.0'
      }
    };
  }

  getDateRange() {
    const end = new Date();
    const start = new Date(end);
    start.setDate(start.getDate() - 1); // Last 24 hours

    return {
      start: start.toISOString(),
      end: end.toISOString()
    };
  }

  generateCacheKey(service, data, date) {
    const dateStr = new Date(date).toISOString().split('T')[0].replace(/-/g, '');
    const servicePrefix = this.getServicePrefix(service);
    const identifier = data.courseId || data.orgId || data.userId || 'default';

    return `mr:${servicePrefix}:${identifier}:${dateStr}`;
  }

  getServicePrefix(service) {
    const prefixes = {
      directory: 'dir',
      courseBuilder: 'cb',
      assessment: 'assess',
      contentStudio: 'cs',
      learningAnalytics: 'la'
    };
    return prefixes[service] || service;
  }
}

