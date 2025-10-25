// Mock Data for educoreAI Management Reporting Microservice
// This file contains realistic mock data from all microservices

const mockData = {
  // DIRECTORY Microservice - User profiles and data
  directory: {
    users: [
      {
        id: "user_001",
        firstName: "Sarah",
        lastName: "Johnson",
        email: "sarah.johnson@educoreai.com",
        role: "Software Engineer",
        department: "Engineering",
        manager: "Mike Chen",
        hireDate: "2022-03-15",
        location: "San Francisco, CA",
        status: "active",
        skills: ["JavaScript", "React", "Node.js", "Python"],
        certifications: ["AWS Certified Developer", "Google Cloud Professional"],
        lastLogin: "2024-01-15T09:30:00Z"
      },
      {
        id: "user_002",
        firstName: "Michael",
        lastName: "Chen",
        email: "michael.chen@educoreai.com",
        role: "Engineering Manager",
        department: "Engineering",
        manager: "Jennifer Smith",
        hireDate: "2021-08-20",
        location: "San Francisco, CA",
        status: "active",
        skills: ["Leadership", "Project Management", "System Architecture", "Python"],
        certifications: ["PMP", "AWS Solutions Architect"],
        lastLogin: "2024-01-15T08:45:00Z"
      },
      {
        id: "user_003",
        firstName: "Emily",
        lastName: "Rodriguez",
        email: "emily.rodriguez@educoreai.com",
        role: "Marketing Specialist",
        department: "Marketing",
        manager: "David Wilson",
        hireDate: "2023-01-10",
        location: "New York, NY",
        status: "active",
        skills: ["Digital Marketing", "Content Creation", "Analytics", "Social Media"],
        certifications: ["Google Analytics Certified", "HubSpot Content Marketing"],
        lastLogin: "2024-01-15T10:15:00Z"
      },
      {
        id: "user_004",
        firstName: "James",
        lastName: "Wilson",
        email: "james.wilson@educoreai.com",
        role: "Data Scientist",
        department: "Data Science",
        manager: "Lisa Brown",
        hireDate: "2022-11-05",
        location: "Austin, TX",
        status: "active",
        skills: ["Machine Learning", "Python", "R", "SQL", "TensorFlow"],
        certifications: ["AWS Machine Learning Specialty", "Google Data Analytics"],
        lastLogin: "2024-01-15T07:20:00Z"
      },
      {
        id: "user_005",
        firstName: "Lisa",
        lastName: "Brown",
        email: "lisa.brown@educoreai.com",
        role: "Data Science Manager",
        department: "Data Science",
        manager: "Jennifer Smith",
        hireDate: "2021-05-12",
        location: "Austin, TX",
        status: "active",
        skills: ["Leadership", "Machine Learning", "Statistics", "Python", "R"],
        certifications: ["PMP", "AWS Machine Learning Specialty"],
        lastLogin: "2024-01-15T09:00:00Z"
      }
    ],
    departments: [
      { id: "dept_001", name: "Engineering", head: "Mike Chen", employeeCount: 45 },
      { id: "dept_002", name: "Marketing", head: "David Wilson", employeeCount: 12 },
      { id: "dept_003", name: "Data Science", head: "Lisa Brown", employeeCount: 18 },
      { id: "dept_004", name: "Sales", head: "Robert Taylor", employeeCount: 25 },
      { id: "dept_005", name: "HR", head: "Jennifer Smith", employeeCount: 8 }
    ],
    totalUsers: 12345,
    activeUsers: 11890,
    newUsersThisMonth: 156
  },

  // COURSEBUILDER Microservice - Course lessons, completion, enrollments
  coursebuilder: {
    courses: [
      {
        id: "course_001",
        title: "Advanced JavaScript Development",
        description: "Master modern JavaScript concepts and frameworks",
        instructor: "Sarah Johnson",
        category: "Programming",
        difficulty: "Advanced",
        duration: "8 weeks",
        lessons: [
          {
            id: "lesson_001",
            title: "ES6+ Features and Syntax",
            duration: 45,
            order: 1,
            type: "video",
            completionRate: 0.87
          },
          {
            id: "lesson_002",
            title: "Async Programming with Promises",
            duration: 60,
            order: 2,
            type: "interactive",
            completionRate: 0.82
          },
          {
            id: "lesson_003",
            title: "Modern React Patterns",
            duration: 90,
            order: 3,
            type: "hands-on",
            completionRate: 0.79
          }
        ],
        totalEnrollments: 1247,
        activeEnrollments: 892,
        completionRate: 0.73,
        averageRating: 4.6,
        createdAt: "2023-09-15",
        lastUpdated: "2024-01-10"
      },
      {
        id: "course_002",
        title: "Data Science Fundamentals",
        description: "Introduction to data science and machine learning",
        instructor: "James Wilson",
        category: "Data Science",
        difficulty: "Intermediate",
        duration: "6 weeks",
        lessons: [
          {
            id: "lesson_004",
            title: "Python for Data Analysis",
            duration: 50,
            order: 1,
            type: "video",
            completionRate: 0.91
          },
          {
            id: "lesson_005",
            title: "Statistical Analysis",
            duration: 70,
            order: 2,
            type: "interactive",
            completionRate: 0.85
          },
          {
            id: "lesson_006",
            title: "Machine Learning Basics",
            duration: 80,
            order: 3,
            type: "hands-on",
            completionRate: 0.78
          }
        ],
        totalEnrollments: 2156,
        activeEnrollments: 1689,
        completionRate: 0.68,
        averageRating: 4.4,
        createdAt: "2023-08-20",
        lastUpdated: "2024-01-08"
      },
      {
        id: "course_003",
        title: "Digital Marketing Strategy",
        description: "Comprehensive guide to modern digital marketing",
        instructor: "Emily Rodriguez",
        category: "Marketing",
        difficulty: "Beginner",
        duration: "4 weeks",
        lessons: [
          {
            id: "lesson_007",
            title: "SEO Fundamentals",
            duration: 40,
            order: 1,
            type: "video",
            completionRate: 0.94
          },
          {
            id: "lesson_008",
            title: "Social Media Marketing",
            duration: 55,
            order: 2,
            type: "interactive",
            completionRate: 0.89
          },
          {
            id: "lesson_009",
            title: "Content Marketing",
            duration: 65,
            order: 3,
            type: "hands-on",
            completionRate: 0.86
          }
        ],
        totalEnrollments: 3421,
        activeEnrollments: 2890,
        completionRate: 0.81,
        averageRating: 4.7,
        createdAt: "2023-10-01",
        lastUpdated: "2024-01-12"
      }
    ],
    totalCourses: 156,
    totalLessons: 1247,
    totalEnrollments: 8765,
    activeEnrollments: 6890,
    averageCompletionRate: 0.74,
    coursesCompletedThisMonth: 234
  },

  // ASSESSMENT Microservice - Tests, grades, attempts
  assessment: {
    tests: [
      {
        id: "test_001",
        title: "JavaScript Fundamentals Assessment",
        courseId: "course_001",
        questions: [
          {
            id: "q_001",
            question: "What is the difference between let and var in JavaScript?",
            type: "multiple-choice",
            options: ["No difference", "let has block scope", "var is faster", "let is deprecated"],
            correctAnswer: 1,
            difficulty: "medium"
          },
          {
            id: "q_002",
            question: "Explain the concept of closures in JavaScript.",
            type: "essay",
            difficulty: "hard"
          },
          {
            id: "q_003",
            question: "Which method is used to add an element to the end of an array?",
            type: "multiple-choice",
            options: ["push()", "pop()", "shift()", "unshift()"],
            correctAnswer: 0,
            difficulty: "easy"
          }
        ],
        totalQuestions: 25,
        timeLimit: 60,
        passingScore: 70,
        attempts: [
          {
            userId: "user_001",
            attemptNumber: 1,
            score: 85,
            grade: "B+",
            completedAt: "2024-01-10T14:30:00Z",
            timeSpent: 45,
            feedback: "Excellent understanding of JavaScript fundamentals. Consider reviewing async programming concepts."
          },
          {
            userId: "user_002",
            attemptNumber: 1,
            score: 92,
            grade: "A",
            completedAt: "2024-01-11T09:15:00Z",
            timeSpent: 38,
            feedback: "Outstanding performance! Strong grasp of all JavaScript concepts."
          },
          {
            userId: "user_003",
            attemptNumber: 2,
            score: 78,
            grade: "C+",
            completedAt: "2024-01-12T16:45:00Z",
            timeSpent: 52,
            feedback: "Good improvement from first attempt. Focus on understanding closures and scope."
          }
        ],
        averageScore: 85.2,
        passRate: 0.87,
        totalAttempts: 1247
      },
      {
        id: "test_002",
        title: "Data Science Concepts Quiz",
        courseId: "course_002",
        questions: [
          {
            id: "q_004",
            question: "What is the purpose of cross-validation in machine learning?",
            type: "multiple-choice",
            options: ["To increase model complexity", "To prevent overfitting", "To reduce training time", "To improve data quality"],
            correctAnswer: 1,
            difficulty: "medium"
          },
          {
            id: "q_005",
            question: "Explain the difference between supervised and unsupervised learning.",
            type: "essay",
            difficulty: "medium"
          }
        ],
        totalQuestions: 20,
        timeLimit: 45,
        passingScore: 75,
        attempts: [
          {
            userId: "user_004",
            attemptNumber: 1,
            score: 88,
            grade: "B+",
            completedAt: "2024-01-13T11:20:00Z",
            timeSpent: 38,
            feedback: "Strong understanding of data science concepts. Well done!"
          },
          {
            userId: "user_005",
            attemptNumber: 1,
            score: 95,
            grade: "A",
            completedAt: "2024-01-14T08:30:00Z",
            timeSpent: 35,
            feedback: "Exceptional performance! Deep understanding of machine learning principles."
          }
        ],
        averageScore: 91.5,
        passRate: 0.92,
        totalAttempts: 892
      }
    ],
    totalTests: 89,
    totalAttempts: 8765,
    averageScore: 82.3,
    overallPassRate: 0.84,
    testsCompletedThisMonth: 1567
  },

  // LEARNERAI Microservice - Skills acquired after course completion
  learnerai: {
    skillsAcquired: [
      {
        userId: "user_001",
        courseId: "course_001",
        skills: [
          {
            skill: "Advanced JavaScript",
            proficiency: 0.85,
            acquiredAt: "2024-01-10T14:30:00Z",
            confidence: 0.88
          },
          {
            skill: "React Development",
            proficiency: 0.78,
            acquiredAt: "2024-01-10T14:30:00Z",
            confidence: 0.82
          },
          {
            skill: "Async Programming",
            proficiency: 0.82,
            acquiredAt: "2024-01-10T14:30:00Z",
            confidence: 0.79
          }
        ]
      },
      {
        userId: "user_002",
        courseId: "course_001",
        skills: [
          {
            skill: "Advanced JavaScript",
            proficiency: 0.92,
            acquiredAt: "2024-01-11T09:15:00Z",
            confidence: 0.95
          },
          {
            skill: "React Development",
            proficiency: 0.88,
            acquiredAt: "2024-01-11T09:15:00Z",
            confidence: 0.91
          },
          {
            skill: "Async Programming",
            proficiency: 0.90,
            acquiredAt: "2024-01-11T09:15:00Z",
            confidence: 0.93
          }
        ]
      },
      {
        userId: "user_004",
        courseId: "course_002",
        skills: [
          {
            skill: "Python for Data Analysis",
            proficiency: 0.88,
            acquiredAt: "2024-01-13T11:20:00Z",
            confidence: 0.91
          },
          {
            skill: "Statistical Analysis",
            proficiency: 0.85,
            acquiredAt: "2024-01-13T11:20:00Z",
            confidence: 0.88
          },
          {
            skill: "Machine Learning Basics",
            proficiency: 0.82,
            acquiredAt: "2024-01-13T11:20:00Z",
            confidence: 0.85
          }
        ]
      }
    ],
    skillCategories: [
      {
        category: "Programming",
        skills: ["JavaScript", "Python", "React", "Node.js", "TypeScript"],
        totalAcquisitions: 2341,
        averageProficiency: 0.82
      },
      {
        category: "Data Science",
        skills: ["Machine Learning", "Statistical Analysis", "Data Visualization", "SQL"],
        totalAcquisitions: 1567,
        averageProficiency: 0.78
      },
      {
        category: "Marketing",
        skills: ["Digital Marketing", "SEO", "Social Media", "Content Marketing"],
        totalAcquisitions: 1890,
        averageProficiency: 0.85
      }
    ],
    totalSkillsAcquired: 5798,
    averageProficiency: 0.82,
    skillsAcquiredThisMonth: 456
  },

  // DEVLAB Microservice - Exercise participation and difficulty
  devlab: {
    exercises: [
      {
        id: "exercise_001",
        title: "Build a Todo App with React",
        courseId: "course_001",
        difficulty: "intermediate",
        estimatedTime: 120,
        technologies: ["React", "JavaScript", "CSS"],
        participants: [
          {
            userId: "user_001",
            participationDate: "2024-01-08T10:00:00Z",
            completionTime: 95,
            difficultyRating: 3,
            feedback: "Great exercise! Helped solidify React concepts."
          },
          {
            userId: "user_002",
            participationDate: "2024-01-09T14:30:00Z",
            completionTime: 78,
            difficultyRating: 2,
            feedback: "Challenging but manageable. Good practice."
          }
        ],
        totalParticipants: 1247,
        averageCompletionTime: 98,
        averageDifficultyRating: 2.8
      },
      {
        id: "exercise_002",
        title: "Data Analysis with Pandas",
        courseId: "course_002",
        difficulty: "beginner",
        estimatedTime: 90,
        technologies: ["Python", "Pandas", "Matplotlib"],
        participants: [
          {
            userId: "user_004",
            participationDate: "2024-01-12T09:15:00Z",
            completionTime: 85,
            difficultyRating: 2,
            feedback: "Excellent introduction to data analysis!"
          },
          {
            userId: "user_005",
            participationDate: "2024-01-13T11:45:00Z",
            completionTime: 72,
            difficultyRating: 1,
            feedback: "Perfect for beginners. Very well structured."
          }
        ],
        totalParticipants: 892,
        averageCompletionTime: 88,
        averageDifficultyRating: 2.2
      },
      {
        id: "exercise_003",
        title: "Advanced Machine Learning Pipeline",
        courseId: "course_002",
        difficulty: "advanced",
        estimatedTime: 180,
        technologies: ["Python", "Scikit-learn", "TensorFlow"],
        participants: [
          {
            userId: "user_004",
            participationDate: "2024-01-14T08:00:00Z",
            completionTime: 165,
            difficultyRating: 4,
            feedback: "Very challenging but rewarding. Great learning experience."
          }
        ],
        totalParticipants: 234,
        averageCompletionTime: 172,
        averageDifficultyRating: 4.1
      }
    ],
    totalExercises: 67,
    totalParticipants: 4567,
    averageParticipationRate: 0.73,
    difficultyDistribution: {
      beginner: 0.35,
      intermediate: 0.45,
      advanced: 0.20
    },
    exercisesCompletedThisMonth: 1234
  },

  // LEARNING ANALYTICS Microservice - Performance trends, insights, forecasts
  learningAnalytics: {
    performanceTrends: [
      {
        metric: "Course Completion Rate",
        currentValue: 0.74,
        previousValue: 0.68,
        change: 0.06,
        trend: "increasing",
        period: "monthly",
        dataPoints: [
          { date: "2023-10-01", value: 0.68 },
          { date: "2023-11-01", value: 0.71 },
          { date: "2023-12-01", value: 0.72 },
          { date: "2024-01-01", value: 0.74 }
        ]
      },
      {
        metric: "Average Test Score",
        currentValue: 82.3,
        previousValue: 79.8,
        change: 2.5,
        trend: "increasing",
        period: "monthly",
        dataPoints: [
          { date: "2023-10-01", value: 79.8 },
          { date: "2023-11-01", value: 80.5 },
          { date: "2023-12-01", value: 81.2 },
          { date: "2024-01-01", value: 82.3 }
        ]
      },
      {
        metric: "User Engagement",
        currentValue: 0.89,
        previousValue: 0.85,
        change: 0.04,
        trend: "increasing",
        period: "monthly",
        dataPoints: [
          { date: "2023-10-01", value: 0.85 },
          { date: "2023-11-01", value: 0.87 },
          { date: "2023-12-01", value: 0.88 },
          { date: "2024-01-01", value: 0.89 }
        ]
      }
    ],
    skillGaps: [
      {
        department: "Engineering",
        criticalGaps: [
          {
            skill: "Cloud Architecture",
            gapSeverity: "high",
            affectedUsers: 23,
            recommendedCourses: ["AWS Solutions Architect", "Cloud Infrastructure Design"]
          },
          {
            skill: "DevOps Practices",
            gapSeverity: "medium",
            affectedUsers: 18,
            recommendedCourses: ["Docker Fundamentals", "Kubernetes Basics"]
          }
        ]
      },
      {
        department: "Marketing",
        criticalGaps: [
          {
            skill: "Data Analytics",
            gapSeverity: "high",
            affectedUsers: 8,
            recommendedCourses: ["Marketing Analytics", "Google Analytics Advanced"]
          },
          {
            skill: "AI in Marketing",
            gapSeverity: "medium",
            affectedUsers: 6,
            recommendedCourses: ["AI for Marketers", "Marketing Automation"]
          }
        ]
      },
      {
        department: "Data Science",
        criticalGaps: [
          {
            skill: "Deep Learning",
            gapSeverity: "medium",
            affectedUsers: 12,
            recommendedCourses: ["Deep Learning Fundamentals", "Neural Networks"]
          }
        ]
      }
    ],
    courseEffectiveness: [
      {
        courseId: "course_001",
        title: "Advanced JavaScript Development",
        effectiveness: 0.87,
        metrics: {
          completionRate: 0.73,
          averageScore: 85.2,
          skillRetention: 0.82,
          jobApplication: 0.78
        },
        insights: [
          "High completion rate indicates good course structure",
          "Strong skill retention suggests effective learning methods",
          "Good job application rate shows practical relevance"
        ]
      },
      {
        courseId: "course_002",
        title: "Data Science Fundamentals",
        effectiveness: 0.82,
        metrics: {
          completionRate: 0.68,
          averageScore: 91.5,
          skillRetention: 0.85,
          jobApplication: 0.72
        },
        insights: [
          "Excellent average scores show high-quality content",
          "Good skill retention indicates effective learning",
          "Room for improvement in completion rates"
        ]
      },
      {
        courseId: "course_003",
        title: "Digital Marketing Strategy",
        effectiveness: 0.91,
        metrics: {
          completionRate: 0.81,
          averageScore: 88.7,
          skillRetention: 0.89,
          jobApplication: 0.85
        },
        insights: [
          "Highest effectiveness score across all courses",
          "Excellent completion and retention rates",
          "Strong practical application in workplace"
        ]
      }
    ],
    strategicForecasts: [
      {
        forecast: "Course Completion Rate",
        currentValue: 0.74,
        predictedValue: 0.78,
        confidence: 0.85,
        timeframe: "3 months",
        factors: [
          "Improved course content quality",
          "Enhanced user engagement features",
          "Better learning path recommendations"
        ]
      },
      {
        forecast: "User Engagement",
        currentValue: 0.89,
        predictedValue: 0.92,
        confidence: 0.78,
        timeframe: "6 months",
        factors: [
          "New interactive features rollout",
          "Personalized learning recommendations",
          "Gamification elements introduction"
        ]
      },
      {
        forecast: "Skill Gap Reduction",
        currentValue: 0.23,
        predictedValue: 0.18,
        confidence: 0.82,
        timeframe: "12 months",
        factors: [
          "Targeted training programs",
          "Mentorship initiatives",
          "Cross-department collaboration"
        ]
      }
    ],
    insights: [
      {
        id: "insight_001",
        type: "anomaly",
        title: "Unusual Drop in JavaScript Course Completion",
        description: "JavaScript course completion rate dropped 15% this week compared to previous weeks.",
        severity: "medium",
        confidence: 0.78,
        recommendation: "Investigate recent course updates and gather user feedback",
        generatedAt: "2024-01-15T10:30:00Z"
      },
      {
        id: "insight_002",
        type: "trend",
        title: "Growing Interest in AI/ML Courses",
        description: "Enrollment in AI and Machine Learning courses has increased 45% over the past month.",
        severity: "low",
        confidence: 0.92,
        recommendation: "Consider expanding AI/ML course offerings and hiring additional instructors",
        generatedAt: "2024-01-15T09:15:00Z"
      },
      {
        id: "insight_003",
        type: "forecast",
        title: "Predicted Skill Gap in Cloud Technologies",
        description: "Based on current trends, we predict a 30% increase in cloud technology skill gaps by Q2 2024.",
        severity: "high",
        confidence: 0.85,
        recommendation: "Develop comprehensive cloud training program and partner with cloud providers",
        generatedAt: "2024-01-15T08:45:00Z"
      }
    ]
  }
};

module.exports = mockData;

