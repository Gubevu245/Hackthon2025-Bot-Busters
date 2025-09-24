const express = require("express");
const router = express.Router();
const { Branch, User, Alumni, Event, News } = require('../db');

/**
 * GET /api/branches
 * Returns all branches from the database
 */
router.get('/branches', async (req, res) => {
  try {
    const branches = await Branch.findAll();
    res.json(branches);
    console.log("Branches fetched successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send('Database query failed');
  }
});

/**
 * GET /api/branches/:id
 * Returns a single branch by ID
 */
router.get('/branches/:id', async (req, res) => {
  try {
    const branch = await Branch.findByPk(req.params.id);
    if (!branch) {
      return res.status(404).send('Branch not found');
    }
    res.json(branch);
  } catch (err) {
    console.error(err);
    res.status(500).send('Database query failed');
  }
});

/**
 * GET /api/branches/:id/users
 * Returns all users belonging to a branch
 */
router.get('/branches/:id/users', async (req, res) => {
  try {
    const users = await User.findAll({
      where: { branch_id: req.params.id }
    });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).send('Database query failed');
  }
});

/**
 * GET /api/branches/:id/alumni
 * Returns all alumni belonging to a branch
 */
router.get('/branches/:id/alumni', async (req, res) => {
  try {
    const alumni = await Alumni.findAll({
      where: { branch_id: req.params.id },
      include: [{ model: User }]
    });
    res.json(alumni);
  } catch (err) {
    console.error(err);
    res.status(500).send('Database query failed');
  }
});

/**
 * GET /api/branches/:id/events
 * Returns all events for a branch
 */
router.get('/branches/:id/events', async (req, res) => {
  try {
    const events = await Event.findAll({
      where: { branch_id: req.params.id },
      include: [{ model: User, as: 'creator' }]
    });
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).send('Database query failed');
  }
});

/**
 * GET /api/branches/:id/news
 * Returns all news for a branch
 */
router.get('/branches/:id/news', async (req, res) => {
  try {
    const news = await News.findAll({
      where: { branch_id: req.params.id },
      include: [{ model: User, as: 'author' }]
    });
    res.json(news);
  } catch (err) {
    console.error(err);
    res.status(500).send('Database query failed');
  }
});

/**
 * POST /api/branches
 * Creates a new branch
 */
router.post('/branches', async (req, res) => {
  try {
    const branch = await Branch.create(req.body);
    res.status(201).json(branch);
  } catch (err) {
    console.error(err);
    res.status(400).send('Failed to create branch');
  }
});

/**
 * PUT /api/branches/:id
 * Updates an existing branch
 */
router.put('/branches/:id', async (req, res) => {
  try {
    const [updated] = await Branch.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated) {
      const updatedBranch = await Branch.findByPk(req.params.id);
      return res.json(updatedBranch);
    }
    return res.status(404).send('Branch not found');
  } catch (err) {
    console.error(err);
    res.status(400).send('Failed to update branch');
  }
});

/**
 * DELETE /api/branches/:id
 * Deletes a branch
 */
router.delete('/branches/:id', async (req, res) => {
  try {
    const deleted = await Branch.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      return res.status(204).send();
    }
    return res.status(404).send('Branch not found');
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to delete branch');
  }
});

module.exports = router;