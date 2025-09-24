const express = require("express");
const router = express.Router();
const { User, Branch } = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET || 'natesa-secret-key';

/**
 * POST /api/auth/register
 * Registers a new user
 */
router.post('/auth/register', async (req, res) => {
  // Get transaction from sequelize
  const transaction = await User.sequelize.transaction();

  try {
    // Check if user already exists
    const existingUser = await User.findOne({
      where: { email: req.body.email },
      transaction
    });

    if (existingUser) {
      await transaction.rollback();
      return res.status(400).send('User with this email already exists');
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Create the user with hashed password
    const userData = {
      ...req.body,
      password: hashedPassword,
      status: 'active'
    };

    const user = await User.create(userData, { transaction });

    // If user is created successfully, update branch member count
    if (user && user.branch_id) {
      const branch = await Branch.findByPk(user.branch_id, { transaction });
      if (branch) {
        await Branch.update(
          { member_count: branch.member_count + 1 },
          { 
            where: { id: user.branch_id },
            transaction
          }
        );
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        role: user.role,
        is_bec_member: user.is_bec_member,
        branch_id: user.branch_id
      }, 
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Commit the transaction
    await transaction.commit();

    // Return user data and token (excluding password)
    const { password, ...userWithoutPassword } = user.toJSON();
    res.status(201).json({
      user: userWithoutPassword,
      token
    });

  } catch (err) {
    // Rollback the transaction in case of error
    await transaction.rollback();
    console.error('Registration error:', err);
    res.status(400).send('Registration failed: ' + (err.message || 'Unknown error'));
  }
});

/**
 * POST /api/auth/login
 * Authenticates a user and returns a token
 */
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email with password included for authentication
    const user = await User.scope('withPassword').findOne({
      where: { email },
      include: [{ model: Branch }]
    });

    if (!user) {
      return res.status(401).send('Invalid email or password');
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(401).send('Account is not active. Please contact an administrator.');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).send('Invalid email or password');
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        role: user.role,
        is_bec_member: user.is_bec_member,
        branch_id: user.branch_id
      }, 
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return user data and token (excluding password)
    const { password: _, ...userWithoutPassword } = user.toJSON();
    res.json({
      user: userWithoutPassword,
      token
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Login failed');
  }
});

/**
 * GET /api/auth/me
 * Returns the current user's information
 */
router.get('/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{ model: Branch }]
    });

    if (!user) {
      return res.status(404).send('User not found');
    }

    // Return user data (excluding password)
    const { password, ...userWithoutPassword } = user.toJSON();
    res.json(userWithoutPassword);

  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to get user information');
  }
});

/**
 * Middleware to authenticate JWT token
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).send('Access denied. No token provided.');
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).send('Invalid or expired token');
    }

    req.user = user;
    next();
  });
}

/**
 * Middleware to check if user has required role
 */
function authorize(roles = []) {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return [
    authenticateToken,
    (req, res, next) => {
      if (roles.length && !roles.includes(req.user.role)) {
        return res.status(403).send('Access denied. Insufficient permissions.');
      }

      next();
    }
  ];
}

// Export the router and middleware functions
module.exports = {
  router,
  authenticateToken,
  authorize
};
