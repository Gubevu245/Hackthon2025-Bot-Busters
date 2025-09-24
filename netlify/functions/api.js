const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const { sequelize } = require('../../backend/db');

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Import routes
const userRoutes = require('../../backend/controller/user-controller');
const branchRoutes = require('../../backend/controller/branch-controller');
const alumniRoutes = require('../../backend/controller/alumni-controller');
const eventRoutes = require('../../backend/controller/event-controller');
const newsRoutes = require('../../backend/controller/news-controller');
const resourceRoutes = require('../../backend/controller/resource-controller');
const { router: authRoutes } = require('../../backend/controller/auth-controller');

// Use routes - Note: the /api prefix is handled by the Netlify redirect
app.use('/', userRoutes);
app.use('/', branchRoutes);
app.use('/', alumniRoutes);
app.use('/', eventRoutes);
app.use('/', newsRoutes);
app.use('/', resourceRoutes);
app.use('/', authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// Export the serverless function
module.exports.handler = serverless(app);