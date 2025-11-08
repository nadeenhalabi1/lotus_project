/**
 * Mock Data Script
 * Adds sample data to Redis for local testing
 */

import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const SERVICES = [
  { name: 'directory', prefix: 'dir', title: 'Organization Directory Overview' },
  { name: 'courseBuilder', prefix: 'cb', title: 'Course Completion Metrics' },
  { name: 'assessment', prefix: 'assess', title: 'Assessment Performance' },
  { name: 'contentStudio', prefix: 'cs', title: 'Content Engagement' },
  { name: 'learningAnalytics', prefix: 'la', title: 'Learning Analytics Summary' }
];

const generateMockData = (service) => {
  const baseMetrics = {
    directory: {
      totalUsers: Math.floor(Math.random() * 1000) + 500,
      totalOrganizations: Math.floor(Math.random() * 50) + 20,
      activeUsers: Math.floor(Math.random() * 800) + 400
    },
    courseBuilder: {
      enrollments: Math.floor(Math.random() * 500) + 200,
      completionRate: Math.floor(Math.random() * 30) + 70,
      averageRating: (Math.random() * 1.5 + 3.5).toFixed(1)
    },
    assessment: {
      totalAssessments: Math.floor(Math.random() * 300) + 100,
      averageScore: Math.floor(Math.random() * 20) + 75,
      passRate: Math.floor(Math.random() * 25) + 70
    },
    contentStudio: {
      contentViews: Math.floor(Math.random() * 2000) + 1000,
      engagementScore: Math.floor(Math.random() * 30) + 65,
      averageTimeSpent: Math.floor(Math.random() * 20) + 15
    },
    learningAnalytics: {
      learningHours: Math.floor(Math.random() * 500) + 200,
      skillImprovement: Math.floor(Math.random() * 25) + 15,
      platformUsage: Math.floor(Math.random() * 40) + 60
    }
  };

  return {
    data: {
      metrics: baseMetrics[service.name] || {}
    },
    metadata: {
      collected_at: new Date().toISOString(),
      source: service.name,
      schema_version: '1.0',
      is_suspect: false
    }
  };
};

const addMockData = async () => {
  const client = createClient({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    ...(process.env.REDIS_TLS === 'true' && { tls: {} })
  });

  try {
    await client.connect();
    console.log('Connected to Redis');

    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');

    for (const service of SERVICES) {
      const mockData = generateMockData(service);
      const key = `mr:${service.prefix}:default:${dateStr}`;
      
      await client.setEx(key, 5184000, JSON.stringify(mockData)); // 60 days TTL
      console.log(`✓ Added mock data for ${service.name} (key: ${key})`);
    }

    console.log('\n✅ Mock data added successfully!');
    console.log('Refresh your dashboard to see the data.');
  } catch (error) {
    console.error('Error adding mock data:', error);
  } finally {
    await client.quit();
  }
};

addMockData();

