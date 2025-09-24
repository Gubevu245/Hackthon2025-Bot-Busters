const express = require("express");
const app = express();
const cors = require('cors');
require('dotenv').config();
const { sequelize } = require('./db');

// Server instance for graceful shutdown
let serverInstance;

// Keep the Node.js process running
process.stdin.resume();

// Set a simple interval to keep the event loop active
setInterval(() => {
  // This empty function keeps the event loop active
}, 60000); // Run every minute

// Middleware
app.use(express.json());
app.use(cors());

// Import routes
const userRoutes = require('./controller/user-controller');
const branchRoutes = require('./controller/branch-controller');
const alumniRoutes = require('./controller/alumni-controller');
const eventRoutes = require('./controller/event-controller');
const newsRoutes = require('./controller/news-controller');
const resourceRoutes = require('./controller/resource-controller');
const { router: authRoutes } = require('./controller/auth-controller');

// Use routes
app.use('/api', userRoutes);
app.use('/api', branchRoutes);
app.use('/api', alumniRoutes);
app.use('/api', eventRoutes);
app.use('/api', newsRoutes);
app.use('/api', resourceRoutes);
app.use('/api', authRoutes);

// Sync Sequelize models with the database
// Set force: true to drop and recreate tables (use with caution in production)
sequelize.sync({ force: false })
  .then(() => {
    console.log('Database synchronized');

    // Start server after database sync
    serverInstance = app.listen(3000, () => {
      console.log("Server running on port 3000");
      console.log("Server is ready to accept connections");
    });
  })
  .catch(err => {
    console.error('Failed to sync database:', err);
  });

// Handle graceful shutdown

// Function to gracefully shut down the server
const gracefulShutdown = () => {
  console.log('Gracefully shutting down');

  // Close the HTTP server if it exists
  if (serverInstance) {
    serverInstance.close(() => {
      console.log('HTTP server closed');

      // Close database connection
      sequelize.close().then(() => {
        console.log('Database connection closed');
        process.exit(0);
      }).catch(err => {
        console.error('Error closing database connection:', err);
        process.exit(1);
      });
    });
  } else {
    process.exit(0);
  }
};

// Listen for termination signals
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Attempt graceful shutdown
  gracefulShutdown();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection:', reason);
  // Attempt graceful shutdown
  gracefulShutdown();
});
