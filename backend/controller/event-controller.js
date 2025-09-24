const express = require("express");
const router = express.Router();
const { Event, User, Branch, Sequelize } = require('../db');
const { Op } = Sequelize;

/**
 * GET /api/events
 * Returns all events from the database
 */
router.get('/events', async (req, res) => {
  try {
    const events = await Event.findAll({
      include: [
        { model: User, as: 'creator' },
        { model: Branch }
      ]
    });
    res.json(events);
    console.log("Events fetched successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send('Database query failed');
  }
});

/**
 * GET /api/events/:id
 * Returns a single event by ID
 */
router.get('/events/:id', async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id, {
      include: [
        { model: User, as: 'creator' },
        { model: Branch }
      ]
    });
    if (!event) {
      return res.status(404).send('Event not found');
    }
    res.json(event);
  } catch (err) {
    console.error(err);
    res.status(500).send('Database query failed');
  }
});

/**
 * GET /api/events/upcoming
 * Returns all upcoming events
 */
router.get('/events/upcoming', async (req, res) => {
  try {
    const events = await Event.findAll({
      where: {
        date: {
          [Op.gte]: new Date()
        },
        status: 'upcoming'
      },
      include: [
        { model: User, as: 'creator' },
        { model: Branch }
      ],
      order: [['date', 'ASC']]
    });
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).send('Database query failed');
  }
});

/**
 * GET /api/events/branch/:branchId
 * Returns all events for a specific branch
 */
router.get('/events/branch/:branchId', async (req, res) => {
  try {
    const events = await Event.findAll({
      where: {
        branch_id: req.params.branchId
      },
      include: [
        { model: User, as: 'creator' },
        { model: Branch }
      ],
      order: [['date', 'DESC']]
    });
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).send('Database query failed');
  }
});

/**
 * POST /api/events
 * Creates a new event
 */
router.post('/events', async (req, res) => {
  try {
    const event = await Event.create(req.body);

    // Return the created event with associated user and branch
    const createdEvent = await Event.findByPk(event.id, {
      include: [
        { model: User, as: 'creator' },
        { model: Branch }
      ]
    });

    res.status(201).json(createdEvent);
  } catch (err) {
    console.error(err);
    res.status(400).send('Failed to create event');
  }
});

/**
 * PUT /api/events/:id
 * Updates an existing event
 */
router.put('/events/:id', async (req, res) => {
  try {
    const [updated] = await Event.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated) {
      const updatedEvent = await Event.findByPk(req.params.id, {
        include: [
          { model: User, as: 'creator' },
          { model: Branch }
        ]
      });
      return res.json(updatedEvent);
    }
    return res.status(404).send('Event not found');
  } catch (err) {
    console.error(err);
    res.status(400).send('Failed to update event');
  }
});

/**
 * PUT /api/events/:id/status
 * Updates the status of an event (upcoming, ongoing, completed, cancelled)
 */
router.put('/events/:id/status', async (req, res) => {
  try {
    if (!req.body.status) {
      return res.status(400).send('Status is required');
    }

    const [updated] = await Event.update(
      { status: req.body.status },
      { where: { id: req.params.id } }
    );

    if (updated) {
      const updatedEvent = await Event.findByPk(req.params.id, {
        include: [
          { model: User, as: 'creator' },
          { model: Branch }
        ]
      });
      return res.json(updatedEvent);
    }
    return res.status(404).send('Event not found');
  } catch (err) {
    console.error(err);
    res.status(400).send('Failed to update event status');
  }
});

/**
 * DELETE /api/events/:id
 * Deletes an event
 */
router.delete('/events/:id', async (req, res) => {
  try {
    const deleted = await Event.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      return res.status(204).send();
    }
    return res.status(404).send('Event not found');
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to delete event');
  }
});

module.exports = router;
