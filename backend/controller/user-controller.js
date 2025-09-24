const express = require("express");
const router = express.Router();

// Import models with error handling
let User, sequelize;
try {
  const db = require('../db');
  User = db.User;
  sequelize = db.sequelize;

  if (!User) {
    console.error('User model not found in db import');
  }

  if (!sequelize) {
    console.error('sequelize instance not found in db import');
  }
} catch (importError) {
  console.error('Error importing database models:', importError);
}

/**
 * GET /api/users
 * Returns all users from the database
 * This route will be accessible at http://localhost:3000/api/users
 */
router.get('/users', async (req, res) => {
  // Set a timeout for the entire request
  const timeout = setTimeout(() => {
    res.status(504).send('Request timed out');
  }, 15000); // 15 seconds timeout

  // Check if models were properly imported
  if (!User || !sequelize) {
    console.error('Models not properly imported, cannot process request');
    clearTimeout(timeout);
    return res.status(500).send('Database configuration error');
  }

  try {
    // Add options to the query to prevent hanging
    let queryOptions = {};

    try {
      // Add Postgres-specific options if using Postgres
      if (sequelize && sequelize.options && sequelize.options.dialect === 'postgres') {
        queryOptions.lock = false;
        queryOptions.queryOptions = { statement_timeout: 10000 }; // 10 seconds in milliseconds
      }
    } catch (optionsErr) {
      console.error('Error setting query options:', optionsErr);
      // Continue with default options if there's an error
    }

    // Verify that User model is properly defined
    if (!User || typeof User.findAll !== 'function') {
      throw new Error('User model is not properly defined or imported');
    }

    const users = await User.findAll(queryOptions);

    // Clear the timeout since the request completed successfully
    clearTimeout(timeout);

    // Send the response
    res.json(users);
    console.log("data fetched successfully");
  } catch (err) {
    // Clear the timeout since we're handling the error
    clearTimeout(timeout);

    console.error('Error in GET /api/users:', err);
    console.error('Error stack:', err.stack);
    res.status(500).send(`Database query failed: ${err.message}`);
  }
});

/**
 * GET /api/users/:id
 * Returns a single user by ID
 */
router.get('/users/:id', async (req, res) => {
  // Set a timeout for the entire request
  const timeout = setTimeout(() => {
    res.status(504).send('Request timed out');
  }, 15000); // 15 seconds timeout

  // Check if models were properly imported
  if (!User || !sequelize) {
    console.error('Models not properly imported, cannot process request');
    clearTimeout(timeout);
    return res.status(500).send('Database configuration error');
  }

  try {
    // Add options to the query to prevent hanging
    let queryOptions = {};

    try {
      // Add Postgres-specific options if using Postgres
      if (sequelize && sequelize.options && sequelize.options.dialect === 'postgres') {
        queryOptions.lock = false;
        queryOptions.queryOptions = { statement_timeout: 10000 }; // 10 seconds in milliseconds
      }
    } catch (optionsErr) {
      console.error('Error setting query options:', optionsErr);
      // Continue with default options if there's an error
    }

    // Verify that User model is properly defined
    if (!User || typeof User.findByPk !== 'function') {
      throw new Error('User model is not properly defined or imported');
    }

    const user = await User.findByPk(req.params.id, queryOptions);

    // Clear the timeout since the request completed successfully
    clearTimeout(timeout);

    if (!user) {
      return res.status(404).send('User not found');
    }

    res.json(user);
  } catch (err) {
    // Clear the timeout since we're handling the error
    clearTimeout(timeout);

    console.error('Error in GET /api/users/:id:', err);
    console.error('Error stack:', err.stack);
    res.status(500).send(`Database query failed: ${err.message}`);
  }
});

/**
 * POST /api/users
 * Creates a new user
 */
router.post('/users', async (req, res) => {
  // Check if models were properly imported
  if (!User) {
    console.error('User model not properly imported, cannot process request');
    return res.status(500).send('Database configuration error');
  }

  try {
    // Check if req.body is an array and use the first element if it is
    const userData = Array.isArray(req.body) ? req.body[0] : req.body;

    if (!userData) {
      return res.status(400).send('No user data provided');
    }

    const user = await User.create(userData);
    res.status(201).json(user);
  } catch (err) {
    console.error('Error in POST /api/users:', err);
    console.error('Error stack:', err.stack);
    res.status(400).send(`Failed to create user: ${err.message}`);
  }
});

/**
 * PUT /api/users/:id
 * Updates an existing user
 */
router.put('/users/:id', async (req, res) => {
  // Check if models were properly imported
  if (!User) {
    console.error('User model not properly imported, cannot process request');
    return res.status(500).send('Database configuration error');
  }

  try {
    const [updated] = await User.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated) {
      const updatedUser = await User.findByPk(req.params.id);
      return res.json(updatedUser);
    }
    return res.status(404).send('User not found');
  } catch (err) {
    console.error('Error in PUT /api/users/:id:', err);
    console.error('Error stack:', err.stack);
    res.status(400).send(`Failed to update user: ${err.message}`);
  }
});

/**
 * DELETE /api/users/:id
 * Deletes a user
 */
router.delete('/users/:id', async (req, res) => {
  // Check if models were properly imported
  if (!User) {
    console.error('User model not properly imported, cannot process request');
    return res.status(500).send('Database configuration error');
  }

  try {
    const deleted = await User.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      return res.status(204).send();
    }
    return res.status(404).send('User not found');
  } catch (err) {
    console.error('Error in DELETE /api/users/:id:', err);
    console.error('Error stack:', err.stack);
    res.status(500).send(`Failed to delete user: ${err.message}`);
  }
});

module.exports = router;
