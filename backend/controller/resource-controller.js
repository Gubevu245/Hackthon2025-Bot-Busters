const express = require("express");
const router = express.Router();
const { Resource, User, Branch, Sequelize } = require('../db');
const { Op } = Sequelize;

/**
 * GET /api/resources
 * Returns all resources from the database
 */
router.get('/resources', async (req, res) => {
  try {
    const resources = await Resource.findAll({
      include: [
        { model: User, as: 'uploader' },
        { model: Branch }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(resources);
    console.log("Resources fetched successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send('Database query failed');
  }
});

/**
 * GET /api/resources/:id
 * Returns a single resource by ID
 */
router.get('/resources/:id', async (req, res) => {
  try {
    const resource = await Resource.findByPk(req.params.id, {
      include: [
        { model: User, as: 'uploader' },
        { model: Branch }
      ]
    });
    if (!resource) {
      return res.status(404).send('Resource not found');
    }
    res.json(resource);
  } catch (err) {
    console.error(err);
    res.status(500).send('Database query failed');
  }
});

/**
 * GET /api/resources/branch/:branchId
 * Returns all resources for a specific branch
 */
router.get('/resources/branch/:branchId', async (req, res) => {
  try {
    const branchResources = await Resource.findAll({
      where: {
        branch_id: req.params.branchId,
        status: 'active'
      },
      include: [
        { model: User, as: 'uploader' },
        { model: Branch }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(branchResources);
  } catch (err) {
    console.error(err);
    res.status(500).send('Database query failed');
  }
});

/**
 * GET /api/resources/category/:category
 * Returns all resources for a specific category
 */
router.get('/resources/category/:category', async (req, res) => {
  try {
    const categoryResources = await Resource.findAll({
      where: {
        category: req.params.category,
        status: 'active'
      },
      include: [
        { model: User, as: 'uploader' },
        { model: Branch }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(categoryResources);
  } catch (err) {
    console.error(err);
    res.status(500).send('Database query failed');
  }
});

/**
 * GET /api/resources/search
 * Searches resources by title or description
 */
router.get('/resources/search', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).send('Search query is required');
    }
    
    const searchResults = await Resource.findAll({
      where: {
        [Op.or]: [
          { title: { [Op.iLike]: `%${query}%` } },
          { description: { [Op.iLike]: `%${query}%` } },
          { category: { [Op.iLike]: `%${query}%` } }
        ],
        status: 'active'
      },
      include: [
        { model: User, as: 'uploader' },
        { model: Branch }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(searchResults);
  } catch (err) {
    console.error(err);
    res.status(500).send('Database query failed');
  }
});

/**
 * POST /api/resources
 * Creates a new resource
 */
router.post('/resources', async (req, res) => {
  try {
    const resource = await Resource.create(req.body);
    
    // Return the created resource with associated user and branch
    const createdResource = await Resource.findByPk(resource.id, {
      include: [
        { model: User, as: 'uploader' },
        { model: Branch }
      ]
    });
    
    res.status(201).json(createdResource);
  } catch (err) {
    console.error(err);
    res.status(400).send('Failed to create resource');
  }
});

/**
 * PUT /api/resources/:id
 * Updates an existing resource
 */
router.put('/resources/:id', async (req, res) => {
  try {
    const [updated] = await Resource.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated) {
      const updatedResource = await Resource.findByPk(req.params.id, {
        include: [
          { model: User, as: 'uploader' },
          { model: Branch }
        ]
      });
      return res.json(updatedResource);
    }
    return res.status(404).send('Resource not found');
  } catch (err) {
    console.error(err);
    res.status(400).send('Failed to update resource');
  }
});

/**
 * PUT /api/resources/:id/download
 * Increments the download count for a resource
 */
router.put('/resources/:id/download', async (req, res) => {
  try {
    const resource = await Resource.findByPk(req.params.id);
    if (!resource) {
      return res.status(404).send('Resource not found');
    }
    
    const [updated] = await Resource.update(
      { download_count: resource.download_count + 1 },
      { where: { id: req.params.id } }
    );
    
    if (updated) {
      const updatedResource = await Resource.findByPk(req.params.id, {
        include: [
          { model: User, as: 'uploader' },
          { model: Branch }
        ]
      });
      return res.json(updatedResource);
    }
    return res.status(500).send('Failed to update download count');
  } catch (err) {
    console.error(err);
    res.status(400).send('Failed to update download count');
  }
});

/**
 * PUT /api/resources/:id/status
 * Updates the status of a resource (active, archived)
 */
router.put('/resources/:id/status', async (req, res) => {
  try {
    if (!req.body.status) {
      return res.status(400).send('Status is required');
    }
    
    const [updated] = await Resource.update(
      { status: req.body.status },
      { where: { id: req.params.id } }
    );
    
    if (updated) {
      const updatedResource = await Resource.findByPk(req.params.id, {
        include: [
          { model: User, as: 'uploader' },
          { model: Branch }
        ]
      });
      return res.json(updatedResource);
    }
    return res.status(404).send('Resource not found');
  } catch (err) {
    console.error(err);
    res.status(400).send('Failed to update resource status');
  }
});

/**
 * DELETE /api/resources/:id
 * Deletes a resource
 */
router.delete('/resources/:id', async (req, res) => {
  try {
    const deleted = await Resource.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      return res.status(204).send();
    }
    return res.status(404).send('Resource not found');
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to delete resource');
  }
});

module.exports = router;