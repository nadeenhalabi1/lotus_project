import pkg from "pg";
import { fileURLToPath } from 'url';
import { resolve } from 'path';
const { Client } = pkg;

/**
 * Seeding script for mock data
 * 
 * This script populates all tables (except AI tables) with realistic mock data
 * representing a software engineering / programming learning platform.
 * 
 * Usage: node backend/src/infrastructure/seedMockData.js
 * 
 * Safety: Uses TRUNCATE CASCADE to ensure idempotency (safe to run multiple times)
 */

// ====================================================
// Helper: Generate UUIDs for organizations
// ====================================================
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// ====================================================
// Seed Learning Analytics Tables
// ====================================================
async function seedLearningAnalytics(client) {
  console.log('  → Seeding Learning Analytics tables...');
  
  const today = new Date();
  const snapshotDates = [
    today.toISOString().split('T')[0],
    new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Weekly
  ];
  
  const periods = ['daily', 'daily', 'daily', 'daily', 'weekly'];
  const snapshotIds = [];
  
  // Insert snapshots
  for (let i = 0; i < snapshotDates.length; i++) {
    const snapshotDate = snapshotDates[i];
    const period = periods[i];
    const startDate = new Date(snapshotDate);
    const endDate = new Date(snapshotDate);
    endDate.setHours(23, 59, 59, 999);
    const calculatedAt = new Date();
    
    const result = await client.query(
      `INSERT INTO public.learning_analytics_snapshot 
       (snapshot_date, period, start_date, end_date, calculated_at, version, raw_payload)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [
        snapshotDate,
        period,
        startDate.toISOString(),
        endDate.toISOString(),
        calculatedAt.toISOString(),
        '1.0',
        JSON.stringify({ mock: true, snapshot_index: i })
      ]
    );
    
    snapshotIds.push(result.rows[0].id);
  }
  
  // Insert one-to-one metric tables for each snapshot
  for (let i = 0; i < snapshotIds.length; i++) {
    const snapshotId = snapshotIds[i];
    const baseMultiplier = i + 1; // Vary data slightly per snapshot
    
    // Learners
    await client.query(
      `INSERT INTO public.learning_analytics_learners 
       (snapshot_id, total_learners, active_learners, total_organizations)
       VALUES ($1, $2, $3, $4)`,
      [
        snapshotId,
        5000 * baseMultiplier,
        3200 * baseMultiplier,
        45 + i * 2
      ]
    );
    
    // Courses
    await client.query(
      `INSERT INTO public.learning_analytics_courses 
       (snapshot_id, total_courses, courses_completed, average_completion_rate, 
        total_enrollments, active_enrollments, average_course_duration_hours, average_lessons_per_course)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        snapshotId,
        145 + i * 5,
        1234 + i * 50,
        68.5 + i * 0.5,
        15678 + i * 200,
        4321 + i * 100,
        12.5 + i * 0.2,
        8.5 + i * 0.1
      ]
    );
    
    // Content
    await client.query(
      `INSERT INTO public.learning_analytics_content 
       (snapshot_id, total_topics, average_topics_per_content)
       VALUES ($1, $2, $3)`,
      [
        snapshotId,
        523 + i * 10,
        2.3 + i * 0.05
      ]
    );
    
    // Skills
    await client.query(
      `INSERT INTO public.learning_analytics_skills 
       (snapshot_id, total_skills_acquired, average_skills_per_competency, 
        total_unique_learning_paths, average_skills_per_learning_path)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        snapshotId,
        45678 + i * 500,
        8.3 + i * 0.1,
        8920 + i * 100,
        5.8 + i * 0.05
      ]
    );
    
    // Assessments
    await client.query(
      `INSERT INTO public.learning_analytics_assessments 
       (snapshot_id, total_assessments, total_distinct_assessments, 
        average_attempts_per_assessment, pass_rate, average_final_grade, average_passing_grade)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        snapshotId,
        34567 + i * 500,
        1234 + i * 20,
        2.1 + i * 0.05,
        72.5 + i * 0.5,
        78.5 + i * 0.3,
        70.0 + i * 0.2
      ]
    );
    
    // Engagement
    await client.query(
      `INSERT INTO public.learning_analytics_engagement 
       (snapshot_id, average_feedback_rating, total_feedback_submissions, 
        total_competitions, average_competition_score)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        snapshotId,
        4.2 + i * 0.02,
        5432 + i * 100,
        892 + i * 20,
        82.3 + i * 0.5
      ]
    );
    
    // Competency level breakdown
    const competencyLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
    for (const level of competencyLevels) {
      const counts = {
        beginner: 3456 + i * 50,
        intermediate: 5678 + i * 80,
        advanced: 4321 + i * 60,
        expert: 1965 + i * 30
      };
      
      await client.query(
        `INSERT INTO public.learning_analytics_competency_level_breakdown 
         (snapshot_id, level, learner_count)
         VALUES ($1, $2, $3)`,
        [snapshotId, level, counts[level]]
      );
    }
    
    // Feedback rating breakdown (1-5)
    for (let rating = 1; rating <= 5; rating++) {
      const counts = {
        1: 234 + i * 5,
        2: 456 + i * 8,
        3: 1234 + i * 20,
        4: 2345 + i * 40,
        5: 1163 + i * 25
      };
      
      await client.query(
        `INSERT INTO public.learning_analytics_feedback_rating_breakdown 
         (snapshot_id, rating, count)
         VALUES ($1, $2, $3)`,
        [snapshotId, rating, counts[rating]]
      );
    }
    
    // Course status breakdown
    const courseStatuses = ['active', 'draft', 'archived'];
    for (const status of courseStatuses) {
      const counts = {
        active: 123 + i * 3,
        draft: 15 + i,
        archived: 7
      };
      
      await client.query(
        `INSERT INTO public.learning_analytics_course_status_breakdown 
         (snapshot_id, status, count)
         VALUES ($1, $2, $3)`,
        [snapshotId, status, counts[status]]
      );
    }
    
    // Skill demand (top 5 most demanded skills)
    const topSkills = [
      { skill_id: 'JS-001', skill_name: 'JavaScript', demand_count: 1250 + i * 50 },
      { skill_id: 'TS-001', skill_name: 'TypeScript', demand_count: 980 + i * 40 },
      { skill_id: 'REACT-001', skill_name: 'React', demand_count: 750 + i * 30 },
      { skill_id: 'NODE-001', skill_name: 'Node.js', demand_count: 650 + i * 25 },
      { skill_id: 'DOCKER-001', skill_name: 'Docker', demand_count: 520 + i * 20 }
    ];
    
    for (let rank = 0; rank < topSkills.length; rank++) {
      const skill = topSkills[rank];
      await client.query(
        `INSERT INTO public.learning_analytics_skill_demand 
         (snapshot_id, skill_id, skill_name, demand_count, rank_position)
         VALUES ($1, $2, $3, $4, $5)`,
        [snapshotId, skill.skill_id, skill.skill_name, skill.demand_count, rank + 1]
      );
    }
  }
  
  console.log(`  ✅ Seeded ${snapshotIds.length} learning analytics snapshots`);
}

// ====================================================
// Seed Courses and Topics Schema
// ====================================================
async function seedCoursesAndTopics(client) {
  console.log('  → Seeding Courses and Topics tables...');
  
  const courses = [
    {
      course_id: 'COURSE-001',
      course_name: 'Full-Stack Web Development with React & Node.js',
      course_language: 'en',
      trainer_id: 'TRAINER-001',
      trainer_name: 'Sarah Johnson',
      permission_scope: 'orgs',
      total_usage_count: 1250,
      created_at: new Date('2024-01-15'),
      status: 'active'
    },
    {
      course_id: 'COURSE-002',
      course_name: 'Introduction to PostgreSQL Database Design',
      course_language: 'en',
      trainer_id: 'TRAINER-002',
      trainer_name: 'Michael Chen',
      permission_scope: 'all',
      total_usage_count: 890,
      created_at: new Date('2024-02-20'),
      status: 'active'
    },
    {
      course_id: 'COURSE-003',
      course_name: 'DevOps with Docker & Kubernetes',
      course_language: 'en',
      trainer_id: 'TRAINER-003',
      trainer_name: 'David Rodriguez',
      permission_scope: 'orgs',
      total_usage_count: 650,
      created_at: new Date('2024-03-10'),
      status: 'active'
    },
    {
      course_id: 'COURSE-004',
      course_name: 'Advanced TypeScript Patterns',
      course_language: 'en',
      trainer_id: 'TRAINER-001',
      trainer_name: 'Sarah Johnson',
      permission_scope: 'all',
      total_usage_count: 420,
      created_at: new Date('2024-04-05'),
      status: 'archived'
    },
    {
      course_id: 'COURSE-005',
      course_name: 'CI/CD Pipelines with GitHub Actions',
      course_language: 'en',
      trainer_id: 'TRAINER-004',
      trainer_name: 'Emily Watson',
      permission_scope: 'orgs',
      total_usage_count: 380,
      created_at: new Date('2024-05-12'),
      status: 'active'
    }
  ];
  
  // Insert courses
  for (const course of courses) {
    await client.query(
      `INSERT INTO public.courses 
       (course_id, course_name, course_language, trainer_id, trainer_name, 
        permission_scope, total_usage_count, created_at, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        course.course_id,
        course.course_name,
        course.course_language,
        course.trainer_id,
        course.trainer_name,
        course.permission_scope,
        course.total_usage_count,
        course.created_at.toISOString(),
        course.status
      ]
    );
  }
  
  // Generate organization UUIDs
  const orgUUIDs = [
    generateUUID(),
    generateUUID(),
    generateUUID(),
    generateUUID(),
    generateUUID()
  ];
  
  // Course org permissions (2-3 orgs per course)
  const courseOrgPermissions = [
    { course_id: 'COURSE-001', orgs: [orgUUIDs[0], orgUUIDs[1], orgUUIDs[2]] },
    { course_id: 'COURSE-002', orgs: [] }, // 'all' scope, no org restrictions
    { course_id: 'COURSE-003', orgs: [orgUUIDs[1], orgUUIDs[3]] },
    { course_id: 'COURSE-004', orgs: [] }, // 'all' scope
    { course_id: 'COURSE-005', orgs: [orgUUIDs[0], orgUUIDs[2], orgUUIDs[4]] }
  ];
  
  for (const perm of courseOrgPermissions) {
    for (const orgUuid of perm.orgs) {
      await client.query(
        `INSERT INTO public.course_org_permissions (course_id, org_uuid)
         VALUES ($1, $2)`,
        [perm.course_id, orgUuid]
      );
    }
  }
  
  // Topics
  const topics = [
    {
      topic_id: 'T-101',
      topic_name: 'React Fundamentals: Components and Props',
      topic_language: 'en',
      total_usage_count: 850,
      created_at: new Date('2024-01-20'),
      status: 'active'
    },
    {
      topic_id: 'T-102',
      topic_name: 'React Hooks: useState and useEffect',
      topic_language: 'en',
      total_usage_count: 720,
      created_at: new Date('2024-01-25'),
      status: 'active'
    },
    {
      topic_id: 'T-103',
      topic_name: 'Node.js Express.js Routing',
      topic_language: 'en',
      total_usage_count: 680,
      created_at: new Date('2024-02-01'),
      status: 'active'
    },
    {
      topic_id: 'T-104',
      topic_name: 'PostgreSQL Schema Design',
      topic_language: 'en',
      total_usage_count: 560,
      created_at: new Date('2024-02-25'),
      status: 'active'
    },
    {
      topic_id: 'T-105',
      topic_name: 'SQL Queries and Joins',
      topic_language: 'en',
      total_usage_count: 490,
      created_at: new Date('2024-03-01'),
      status: 'active'
    },
    {
      topic_id: 'T-106',
      topic_name: 'Docker Container Basics',
      topic_language: 'en',
      total_usage_count: 520,
      created_at: new Date('2024-03-15'),
      status: 'active'
    },
    {
      topic_id: 'T-107',
      topic_name: 'Kubernetes Pods and Deployments',
      topic_language: 'en',
      total_usage_count: 380,
      created_at: new Date('2024-03-20'),
      status: 'active'
    },
    {
      topic_id: 'T-108',
      topic_name: 'TypeScript Generics and Advanced Types',
      topic_language: 'en',
      total_usage_count: 310,
      created_at: new Date('2024-04-10'),
      status: 'archived'
    },
    {
      topic_id: 'T-109',
      topic_name: 'GitHub Actions Workflows',
      topic_language: 'en',
      total_usage_count: 290,
      created_at: new Date('2024-05-15'),
      status: 'active'
    },
    {
      topic_id: 'T-110',
      topic_name: 'Automated Testing in CI/CD',
      topic_language: 'en',
      total_usage_count: 250,
      created_at: new Date('2024-05-18'),
      status: 'active'
    },
    {
      topic_id: 'T-111',
      topic_name: 'RESTful API Design Principles',
      topic_language: 'en',
      total_usage_count: 420,
      created_at: new Date('2024-02-05'),
      status: 'active'
    },
    {
      topic_id: 'T-112',
      topic_name: 'State Management with Redux',
      topic_language: 'en',
      total_usage_count: 350,
      created_at: new Date('2024-01-30'),
      status: 'active'
    }
  ];
  
  // Insert topics
  for (const topic of topics) {
    await client.query(
      `INSERT INTO public.topics 
       (topic_id, topic_name, topic_language, total_usage_count, created_at, status)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        topic.topic_id,
        topic.topic_name,
        topic.topic_language,
        topic.total_usage_count,
        topic.created_at.toISOString(),
        topic.status
      ]
    );
  }
  
  // Course-Topics relationships (2-4 topics per course)
  const courseTopics = [
    { course_id: 'COURSE-001', topics: ['T-101', 'T-102', 'T-103', 'T-111', 'T-112'], sort_order: [1, 2, 3, 4, 5] },
    { course_id: 'COURSE-002', topics: ['T-104', 'T-105'], sort_order: [1, 2] },
    { course_id: 'COURSE-003', topics: ['T-106', 'T-107'], sort_order: [1, 2] },
    { course_id: 'COURSE-004', topics: ['T-108'], sort_order: [1] },
    { course_id: 'COURSE-005', topics: ['T-109', 'T-110'], sort_order: [1, 2] }
  ];
  
  for (const ct of courseTopics) {
    for (let i = 0; i < ct.topics.length; i++) {
      await client.query(
        `INSERT INTO public.course_topics (course_id, topic_id, sort_order)
         VALUES ($1, $2, $3)`,
        [ct.course_id, ct.topics[i], ct.sort_order[i]]
      );
    }
  }
  
  // Topic-Skills relationships (2-5 skills per topic)
  const topicSkills = [
    { topic_id: 'T-101', skills: ['JavaScript', 'React', 'JSX'] },
    { topic_id: 'T-102', skills: ['React', 'React Hooks', 'JavaScript'] },
    { topic_id: 'T-103', skills: ['Node.js', 'Express.js', 'REST API', 'JavaScript'] },
    { topic_id: 'T-104', skills: ['PostgreSQL', 'SQL', 'Database Design'] },
    { topic_id: 'T-105', skills: ['SQL', 'PostgreSQL', 'Database Queries'] },
    { topic_id: 'T-106', skills: ['Docker', 'Containerization', 'DevOps'] },
    { topic_id: 'T-107', skills: ['Kubernetes', 'Container Orchestration', 'DevOps'] },
    { topic_id: 'T-108', skills: ['TypeScript', 'Advanced Types', 'Generics'] },
    { topic_id: 'T-109', skills: ['CI/CD', 'GitHub Actions', 'DevOps', 'Automation'] },
    { topic_id: 'T-110', skills: ['CI/CD', 'Testing', 'Automation', 'Quality Assurance'] },
    { topic_id: 'T-111', skills: ['REST API', 'API Design', 'Backend Development'] },
    { topic_id: 'T-112', skills: ['React', 'Redux', 'State Management', 'JavaScript'] }
  ];
  
  for (const ts of topicSkills) {
    for (const skill of ts.skills) {
      await client.query(
        `INSERT INTO public.topic_skills (topic_id, skill_code)
         VALUES ($1, $2)`,
        [ts.topic_id, skill]
      );
    }
  }
  
  // Contents (2-3 contents per topic, different types)
  const contents = [
    {
      content_id: 'C-001',
      topic_id: 'T-101',
      content_type: 'avatar_video',
      content_data: { video_url: 'https://example.com/videos/react-fundamentals.mp4', duration: 1200 },
      generation_method: 'manual'
    },
    {
      content_id: 'C-002',
      topic_id: 'T-101',
      content_type: 'code',
      content_data: { code_examples: ['ComponentExample.jsx', 'PropsExample.jsx'], language: 'javascript' },
      generation_method: 'ai_assisted'
    },
    {
      content_id: 'C-003',
      topic_id: 'T-102',
      content_type: 'text_audio',
      content_data: { text: 'Introduction to React Hooks...', audio_url: 'https://example.com/audio/hooks-intro.mp3' },
      generation_method: 'mixed'
    },
    {
      content_id: 'C-004',
      topic_id: 'T-102',
      content_type: 'presentation',
      content_data: { slides: 25, presentation_url: 'https://example.com/presentations/react-hooks.pdf' },
      generation_method: 'full_ai'
    },
    {
      content_id: 'C-005',
      topic_id: 'T-103',
      content_type: 'code',
      content_data: { code_examples: ['server.js', 'routes.js'], language: 'javascript' },
      generation_method: 'manual'
    },
    {
      content_id: 'C-006',
      topic_id: 'T-103',
      content_type: 'mind_map',
      content_data: { map_url: 'https://example.com/mindmaps/express-routing.png' },
      generation_method: 'ai_assisted'
    },
    {
      content_id: 'C-007',
      topic_id: 'T-104',
      content_type: 'avatar_video',
      content_data: { video_url: 'https://example.com/videos/postgresql-schema.mp4', duration: 1800 },
      generation_method: 'manual'
    },
    {
      content_id: 'C-008',
      topic_id: 'T-104',
      content_type: 'presentation',
      content_data: { slides: 30, presentation_url: 'https://example.com/presentations/db-design.pdf' },
      generation_method: 'mixed'
    },
    {
      content_id: 'C-009',
      topic_id: 'T-105',
      content_type: 'code',
      content_data: { code_examples: ['queries.sql'], language: 'sql' },
      generation_method: 'manual'
    },
    {
      content_id: 'C-010',
      topic_id: 'T-106',
      content_type: 'avatar_video',
      content_data: { video_url: 'https://example.com/videos/docker-basics.mp4', duration: 1500 },
      generation_method: 'ai_assisted'
    },
    {
      content_id: 'C-011',
      topic_id: 'T-106',
      content_type: 'text_audio',
      content_data: { text: 'Docker container concepts...', audio_url: 'https://example.com/audio/docker-intro.mp3' },
      generation_method: 'full_ai'
    },
    {
      content_id: 'C-012',
      topic_id: 'T-107',
      content_type: 'presentation',
      content_data: { slides: 35, presentation_url: 'https://example.com/presentations/kubernetes.pdf' },
      generation_method: 'manual'
    },
    {
      content_id: 'C-013',
      topic_id: 'T-108',
      content_type: 'code',
      content_data: { code_examples: ['generics.ts', 'advanced-types.ts'], language: 'typescript' },
      generation_method: 'ai_assisted'
    },
    {
      content_id: 'C-014',
      topic_id: 'T-109',
      content_type: 'mind_map',
      content_data: { map_url: 'https://example.com/mindmaps/github-actions.png' },
      generation_method: 'mixed'
    },
    {
      content_id: 'C-015',
      topic_id: 'T-110',
      content_type: 'code',
      content_data: { code_examples: ['test.yml'], language: 'yaml' },
      generation_method: 'manual'
    },
    {
      content_id: 'C-016',
      topic_id: 'T-111',
      content_type: 'avatar_video',
      content_data: { video_url: 'https://example.com/videos/rest-api.mp4', duration: 2000 },
      generation_method: 'ai_assisted'
    },
    {
      content_id: 'C-017',
      topic_id: 'T-112',
      content_type: 'text_audio',
      content_data: { text: 'Redux state management...', audio_url: 'https://example.com/audio/redux-intro.mp3' },
      generation_method: 'full_ai'
    }
  ];
  
  for (const content of contents) {
    await client.query(
      `INSERT INTO public.contents 
       (content_id, topic_id, content_type, content_data, generation_method, generation_method_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        content.content_id,
        content.topic_id,
        content.content_type,
        JSON.stringify(content.content_data),
        content.generation_method,
        content.generation_method_id || null
      ]
    );
  }
  
  console.log(`  ✅ Seeded ${courses.length} courses, ${topics.length} topics, ${contents.length} contents`);
}

// ====================================================
// Seed Cache Tables
// ====================================================
async function seedCacheTables(client) {
  console.log('  → Seeding Cache tables...');
  
  const today = new Date();
  const snapshotDate = today.toISOString().split('T')[0];
  
  // Course Builder Cache
  const courseBuilderData = [
    {
      snapshot_date: snapshotDate,
      course_id: 'COURSE-001',
      course_name: 'Full-Stack Web Development with React & Node.js',
      totalEnrollments: 1250,
      activeEnrollment: 890,
      completionRate: 72.5,
      averageRating: 4.6,
      createdAt: new Date('2024-01-15'),
      feedback: 'Excellent course with practical examples'
    },
    {
      snapshot_date: snapshotDate,
      course_id: 'COURSE-002',
      course_name: 'Introduction to PostgreSQL Database Design',
      totalEnrollments: 890,
      activeEnrollment: 650,
      completionRate: 68.2,
      averageRating: 4.4,
      createdAt: new Date('2024-02-20'),
      feedback: 'Great introduction to database concepts'
    },
    {
      snapshot_date: snapshotDate,
      course_id: 'COURSE-003',
      course_name: 'DevOps with Docker & Kubernetes',
      totalEnrollments: 650,
      activeEnrollment: 480,
      completionRate: 65.8,
      averageRating: 4.5,
      createdAt: new Date('2024-03-10'),
      feedback: 'Comprehensive DevOps training'
    },
    {
      snapshot_date: snapshotDate,
      course_id: 'COURSE-004',
      course_name: 'Advanced TypeScript Patterns',
      totalEnrollments: 420,
      activeEnrollment: 280,
      completionRate: 58.3,
      averageRating: 4.3,
      createdAt: new Date('2024-04-05'),
      feedback: 'Advanced concepts well explained'
    },
    {
      snapshot_date: snapshotDate,
      course_id: 'COURSE-005',
      course_name: 'CI/CD Pipelines with GitHub Actions',
      totalEnrollments: 380,
      activeEnrollment: 290,
      completionRate: 70.1,
      averageRating: 4.7,
      createdAt: new Date('2024-05-12'),
      feedback: 'Practical CI/CD implementation guide'
    }
  ];
  
  for (const data of courseBuilderData) {
    await client.query(
      `INSERT INTO public.course_builder_cache 
       (snapshot_date, course_id, course_name, "totalEnrollments", "activeEnrollment", 
        "completionRate", "averageRating", "createdAt", feedback)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        data.snapshot_date,
        data.course_id,
        data.course_name,
        data.totalEnrollments,
        data.activeEnrollment,
        data.completionRate,
        data.averageRating,
        data.createdAt.toISOString(),
        data.feedback
      ]
    );
  }
  
  // Assessments Cache
  const assessmentsData = [
    {
      snapshot_date: snapshotDate,
      user_id: 'USER-001',
      course_id: 'COURSE-001',
      exam_type: 'precourse',
      attempt_no: 1,
      passing_grade: 70,
      final_grade: 65,
      passed: false
    },
    {
      snapshot_date: snapshotDate,
      user_id: 'USER-001',
      course_id: 'COURSE-001',
      exam_type: 'postcourse',
      attempt_no: 1,
      passing_grade: 70,
      final_grade: 85,
      passed: true
    },
    {
      snapshot_date: snapshotDate,
      user_id: 'USER-002',
      course_id: 'COURSE-001',
      exam_type: 'precourse',
      attempt_no: 1,
      passing_grade: 70,
      final_grade: 72,
      passed: true
    },
    {
      snapshot_date: snapshotDate,
      user_id: 'USER-002',
      course_id: 'COURSE-001',
      exam_type: 'midcourse',
      attempt_no: 1,
      passing_grade: 70,
      final_grade: 78,
      passed: true
    },
    {
      snapshot_date: snapshotDate,
      user_id: 'USER-002',
      course_id: 'COURSE-001',
      exam_type: 'postcourse',
      attempt_no: 1,
      passing_grade: 70,
      final_grade: 88,
      passed: true
    },
    {
      snapshot_date: snapshotDate,
      user_id: 'USER-003',
      course_id: 'COURSE-002',
      exam_type: 'precourse',
      attempt_no: 1,
      passing_grade: 70,
      final_grade: 68,
      passed: false
    },
    {
      snapshot_date: snapshotDate,
      user_id: 'USER-003',
      course_id: 'COURSE-002',
      exam_type: 'precourse',
      attempt_no: 2,
      passing_grade: 70,
      final_grade: 75,
      passed: true
    },
    {
      snapshot_date: snapshotDate,
      user_id: 'USER-003',
      course_id: 'COURSE-002',
      exam_type: 'postcourse',
      attempt_no: 1,
      passing_grade: 70,
      final_grade: 82,
      passed: true
    },
    {
      snapshot_date: snapshotDate,
      user_id: 'USER-004',
      course_id: 'COURSE-003',
      exam_type: 'precourse',
      attempt_no: 1,
      passing_grade: 70,
      final_grade: 80,
      passed: true
    },
    {
      snapshot_date: snapshotDate,
      user_id: 'USER-004',
      course_id: 'COURSE-003',
      exam_type: 'midcourse',
      attempt_no: 1,
      passing_grade: 70,
      final_grade: 75,
      passed: true
    },
    {
      snapshot_date: snapshotDate,
      user_id: 'USER-005',
      course_id: 'COURSE-005',
      exam_type: 'precourse',
      attempt_no: 1,
      passing_grade: 70,
      final_grade: 90,
      passed: true
    },
    {
      snapshot_date: snapshotDate,
      user_id: 'USER-005',
      course_id: 'COURSE-005',
      exam_type: 'postcourse',
      attempt_no: 1,
      passing_grade: 70,
      final_grade: 92,
      passed: true
    }
  ];
  
  for (const data of assessmentsData) {
    await client.query(
      `INSERT INTO public.assessments_cache 
       (snapshot_date, user_id, course_id, exam_type, attempt_no, 
        passing_grade, final_grade, passed)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        data.snapshot_date,
        data.user_id,
        data.course_id,
        data.exam_type,
        data.attempt_no,
        data.passing_grade,
        data.final_grade,
        data.passed
      ]
    );
  }
  
  // Directory Cache
  const directoryData = [
    {
      snapshot_date: snapshotDate,
      company_id: 'COMP-001',
      company_name: 'TechStart Solutions',
      industry: 'Software Development',
      company_size: '50-200',
      date_registered: new Date('2023-06-15'),
      primary_hr_contact: 'hr@techstart.com',
      approval_policy: 'manager_approval',
      decision_maker: 'John Smith',
      kpis: { completion_rate: 75, engagement_score: 82 },
      max_test_attempts: 3,
      website_url: 'https://techstart.com',
      verification_status: 'verified',
      hierarchy: { departments: ['Engineering', 'Product', 'Sales'] }
    },
    {
      snapshot_date: snapshotDate,
      company_id: 'COMP-002',
      company_name: 'CloudScale Inc',
      industry: 'Cloud Services',
      company_size: '200-500',
      date_registered: new Date('2023-08-20'),
      primary_hr_contact: 'hr@cloudscale.com',
      approval_policy: 'auto_approval',
      decision_maker: 'Maria Garcia',
      kpis: { completion_rate: 68, engagement_score: 79 },
      max_test_attempts: 2,
      website_url: 'https://cloudscale.com',
      verification_status: 'verified',
      hierarchy: { departments: ['DevOps', 'Engineering', 'Support'] }
    },
    {
      snapshot_date: snapshotDate,
      company_id: 'COMP-003',
      company_name: 'DataFlow Systems',
      industry: 'Data Analytics',
      company_size: '10-50',
      date_registered: new Date('2024-01-10'),
      primary_hr_contact: 'hr@dataflow.com',
      approval_policy: 'manager_approval',
      decision_maker: 'Robert Lee',
      kpis: { completion_rate: 72, engagement_score: 85 },
      max_test_attempts: 3,
      website_url: 'https://dataflow.com',
      verification_status: 'pending',
      hierarchy: { departments: ['Data Science', 'Engineering'] }
    },
    {
      snapshot_date: snapshotDate,
      company_id: 'COMP-004',
      company_name: 'DevOps Pro',
      industry: 'IT Services',
      company_size: '50-200',
      date_registered: new Date('2023-11-05'),
      primary_hr_contact: 'hr@devopspro.com',
      approval_policy: 'auto_approval',
      decision_maker: 'Jennifer Brown',
      kpis: { completion_rate: 80, engagement_score: 88 },
      max_test_attempts: 2,
      website_url: 'https://devopspro.com',
      verification_status: 'verified',
      hierarchy: { departments: ['DevOps', 'Security', 'Engineering'] }
    },
    {
      snapshot_date: snapshotDate,
      company_id: 'COMP-005',
      company_name: 'CodeMasters Academy',
      industry: 'Education',
      company_size: '200-500',
      date_registered: new Date('2023-09-12'),
      primary_hr_contact: 'hr@codemasters.com',
      approval_policy: 'manager_approval',
      decision_maker: 'Thomas Anderson',
      kpis: { completion_rate: 85, engagement_score: 90 },
      max_test_attempts: 5,
      website_url: 'https://codemasters.com',
      verification_status: 'verified',
      hierarchy: { departments: ['Training', 'Curriculum', 'Support'] }
    }
  ];
  
  for (const data of directoryData) {
    await client.query(
      `INSERT INTO public.directory_cache 
       (snapshot_date, company_id, company_name, industry, company_size, 
        date_registered, primary_hr_contact, approval_policy, decision_maker, 
        kpis, max_test_attempts, website_url, verification_status, hierarchy)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [
        data.snapshot_date,
        data.company_id,
        data.company_name,
        data.industry,
        data.company_size,
        data.date_registered.toISOString(),
        data.primary_hr_contact,
        data.approval_policy,
        data.decision_maker,
        JSON.stringify(data.kpis),
        data.max_test_attempts,
        data.website_url,
        data.verification_status,
        JSON.stringify(data.hierarchy)
      ]
    );
  }
  
  console.log(`  ✅ Seeded cache tables: ${courseBuilderData.length} courses, ${assessmentsData.length} assessments, ${directoryData.length} companies`);
}

// ====================================================
// Main Seeding Function
// ====================================================
async function seedMockData() {
  const conn = process.env.DATABASE_URL;
  if (!conn) {
    console.log("⚠️  DATABASE_URL not set, skipping seed");
    return;
  }

  const client = new Client({
    connectionString: conn,
    ssl: { rejectUnauthorized: false } // required for Supabase
  });

  try {
    console.log("Connecting to DB...");
    await client.connect();
    
    console.log("Seeding mock data...");
    await client.query("BEGIN");
    
    // Truncate tables in correct order (respecting foreign keys)
    // Note: We do NOT truncate ai_chart_transcriptions or ai_report_conclusions
    console.log("  → Truncating existing data (CASCADE)...");
    
    // Truncate in reverse dependency order
    await client.query(`
      TRUNCATE TABLE 
        public.learning_analytics_skill_demand,
        public.learning_analytics_course_status_breakdown,
        public.learning_analytics_feedback_rating_breakdown,
        public.learning_analytics_competency_level_breakdown,
        public.learning_analytics_engagement,
        public.learning_analytics_assessments,
        public.learning_analytics_skills,
        public.learning_analytics_content,
        public.learning_analytics_courses,
        public.learning_analytics_learners,
        public.learning_analytics_snapshot,
        public.contents,
        public.topic_skills,
        public.course_topics,
        public.topics,
        public.course_org_permissions,
        public.courses,
        public.course_builder_cache,
        public.assessments_cache,
        public.directory_cache
      CASCADE
    `);
    
    console.log("  ✅ Tables truncated");
    
    // Seed in correct order
    await seedLearningAnalytics(client);
    await seedCoursesAndTopics(client);
    await seedCacheTables(client);
    
    await client.query("COMMIT");
    console.log("✅ Mock data seeded successfully");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Error seeding mock data:", error.message);
    console.error(error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run if executed directly
const __filename = fileURLToPath(import.meta.url);
const isMainModule = process.argv[1] && resolve(process.argv[1]) === __filename;

if (isMainModule) {
  seedMockData()
    .then(() => {
      console.log("Seeding completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seeding failed:", error);
      process.exit(1);
    });
}

export default seedMockData;

