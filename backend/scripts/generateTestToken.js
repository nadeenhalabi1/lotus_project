/**
 * Generate Test JWT Token
 * For local development and testing
 */

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-local-development-only';

// Generate a test token with System Administrator role
const testToken = jwt.sign(
  {
    userId: 'test-admin-user',
    sub: 'test-admin-user',
    role: 'System Administrator',
    email: 'test@educoreai.com',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (2 * 60 * 60) // 2 hours
  },
  JWT_SECRET,
  { algorithm: 'HS256' }
);

console.log('\n✅ Test JWT Token Generated:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(testToken);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('\n📋 Instructions:');
console.log('1. Copy the token above');
console.log('2. Open browser console (F12)');
console.log('3. Run: localStorage.setItem("authToken", "YOUR_TOKEN_HERE")');
console.log('4. Refresh the page');
console.log('\n⚠️  This token is valid for 2 hours');
console.log('⚠️  Only use in development environment!\n');

