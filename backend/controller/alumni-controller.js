const express = require("express");
const router = express.Router();
const { Alumni, User, Branch } = require('../db');

/**
 * GET /api/alumni
 * Returns all alumni from the database
 */
router.get('/alumni', async (req, res) => {
  try {
    const alumni = await Alumni.findAll({
      include: [
        { model: User },
        { model: Branch }
      ]
    });
    res.json(alumni);
    console.log("Alumni fetched successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send('Database query failed');
  }
});

/**
 * GET /api/alumni/:id
 * Returns a single alumni by ID
 */
router.get('/alumni/:id', async (req, res) => {
  try {
    const alumni = await Alumni.findByPk(req.params.id, {
      include: [
        { model: User },
        { model: Branch }
      ]
    });
    if (!alumni) {
      return res.status(404).send('Alumni not found');
    }
    res.json(alumni);
  } catch (err) {
    console.error(err);
    res.status(500).send('Database query failed');
  }
});

/**
 * POST /api/alumni
 * Creates a new alumni record
 */
router.post('/alumni', async (req, res) => {
  try {
    const alumni = await Alumni.create(req.body);
    
    // Update the user's status to 'alumni'
    if (req.body.user_id) {
      await User.update(
        { status: 'alumni' },
        { where: { id: req.body.user_id } }
      );
    }
    
    // Increment the alumni_count for the branch
    if (req.body.branch_id) {
      const branch = await Branch.findByPk(req.body.branch_id);
      if (branch) {
        await Branch.update(
          { alumni_count: branch.alumni_count + 1 },
          { where: { id: req.body.branch_id } }
        );
      }
    }
    
    // Return the created alumni with associated user and branch
    const createdAlumni = await Alumni.findByPk(alumni.id, {
      include: [
        { model: User },
        { model: Branch }
      ]
    });
    
    res.status(201).json(createdAlumni);
  } catch (err) {
    console.error(err);
    res.status(400).send('Failed to create alumni record');
  }
});

/**
 * PUT /api/alumni/:id
 * Updates an existing alumni record
 */
router.put('/alumni/:id', async (req, res) => {
  try {
    const [updated] = await Alumni.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated) {
      const updatedAlumni = await Alumni.findByPk(req.params.id, {
        include: [
          { model: User },
          { model: Branch }
        ]
      });
      return res.json(updatedAlumni);
    }
    return res.status(404).send('Alumni not found');
  } catch (err) {
    console.error(err);
    res.status(400).send('Failed to update alumni record');
  }
});

/**
 * DELETE /api/alumni/:id
 * Deletes an alumni record
 */
router.delete('/alumni/:id', async (req, res) => {
  try {
    // Get the alumni record first to access branch_id
    const alumni = await Alumni.findByPk(req.params.id);
    if (!alumni) {
      return res.status(404).send('Alumni not found');
    }
    
    // Delete the alumni record
    await Alumni.destroy({
      where: { id: req.params.id }
    });
    
    // Decrement the alumni_count for the branch
    if (alumni.branch_id) {
      const branch = await Branch.findByPk(alumni.branch_id);
      if (branch && branch.alumni_count > 0) {
        await Branch.update(
          { alumni_count: branch.alumni_count - 1 },
          { where: { id: alumni.branch_id } }
        );
      }
    }
    
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to delete alumni record');
  }
});

module.exports = router;