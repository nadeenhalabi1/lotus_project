const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from frontend
app.use(express.static(path.join(__dirname, 'frontend/dist')));

// API Routes
app.get('/api/status', (req, res) => {
  res.json({ 
    message: 'Management Reporting Microservice is running!',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Microservices mock data routes
app.use('/api/microservices', require('./backend/src/routes/microservices'));

// Enhanced microservices routes with filtering and normalization
app.use('/api/enhanced', require('./backend/src/routes/enhancedMicroservices'));

// Legacy dashboard endpoint for backward compatibility
app.get('/api/dashboard', (req, res) => {
  res.json({
    totalUsers: 12345,
    courseCompletions: 8765,
    aiInsights: 234,
    lastUpdated: new Date().toISOString()
  });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Dashboard available at http://localhost:${PORT}`);
  console.log(`🔗 API endpoints available at http://localhost:${PORT}/api/microservices/`);
});
