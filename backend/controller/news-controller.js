const express = require("express");
const router = express.Router();
const { News, User, Branch, Sequelize } = require('../db');
const { Op } = Sequelize;

/**
 * GET /api/news
 * Returns all news articles from the database
 */
router.get('/news', async (req, res) => {
  try {
    const news = await News.findAll({
      include: [
        { model: User, as: 'author' },
        { model: Branch }
      ],
      order: [['publish_date', 'DESC']]
    });
    res.json(news);
    console.log("News articles fetched successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send('Database query failed');
  }
});

/**
 * GET /api/news/:id
 * Returns a single news article by ID
 */
router.get('/news/:id', async (req, res) => {
  try {
    const newsArticle = await News.findByPk(req.params.id, {
      include: [
        { model: User, as: 'author' },
        { model: Branch }
      ]
    });
    if (!newsArticle) {
      return res.status(404).send('News article not found');
    }
    res.json(newsArticle);
  } catch (err) {
    console.error(err);
    res.status(500).send('Database query failed');
  }
});

/**
 * GET /api/news/featured
 * Returns featured news articles
 */
router.get('/news/featured', async (req, res) => {
  try {
    const featuredNews = await News.findAll({
      where: {
        is_featured: true,
        status: 'published'
      },
      include: [
        { model: User, as: 'author' },
        { model: Branch }
      ],
      order: [['publish_date', 'DESC']],
      limit: 5
    });
    res.json(featuredNews);
  } catch (err) {
    console.error(err);
    res.status(500).send('Database query failed');
  }
});

/**
 * GET /api/news/branch/:branchId
 * Returns all news articles for a specific branch
 */
router.get('/news/branch/:branchId', async (req, res) => {
  try {
    const branchNews = await News.findAll({
      where: {
        branch_id: req.params.branchId,
        status: 'published'
      },
      include: [
        { model: User, as: 'author' },
        { model: Branch }
      ],
      order: [['publish_date', 'DESC']]
    });
    res.json(branchNews);
  } catch (err) {
    console.error(err);
    res.status(500).send('Database query failed');
  }
});

/**
 * GET /api/news/search
 * Searches news articles by title or content
 */
router.get('/news/search', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).send('Search query is required');
    }
    
    const searchResults = await News.findAll({
      where: {
        [Op.or]: [
          { title: { [Op.iLike]: `%${query}%` } },
          { content: { [Op.iLike]: `%${query}%` } }
        ],
        status: 'published'
      },
      include: [
        { model: User, as: 'author' },
        { model: Branch }
      ],
      order: [['publish_date', 'DESC']]
    });
    res.json(searchResults);
  } catch (err) {
    console.error(err);
    res.status(500).send('Database query failed');
  }
});

/**
 * POST /api/news
 * Creates a new news article
 */
router.post('/news', async (req, res) => {
  try {
    const newsArticle = await News.create(req.body);
    
    // Return the created news article with associated user and branch
    const createdNews = await News.findByPk(newsArticle.id, {
      include: [
        { model: User, as: 'author' },
        { model: Branch }
      ]
    });
    
    res.status(201).json(createdNews);
  } catch (err) {
    console.error(err);
    res.status(400).send('Failed to create news article');
  }
});

/**
 * PUT /api/news/:id
 * Updates an existing news article
 */
router.put('/news/:id', async (req, res) => {
  try {
    const [updated] = await News.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated) {
      const updatedNews = await News.findByPk(req.params.id, {
        include: [
          { model: User, as: 'author' },
          { model: Branch }
        ]
      });
      return res.json(updatedNews);
    }
    return res.status(404).send('News article not found');
  } catch (err) {
    console.error(err);
    res.status(400).send('Failed to update news article');
  }
});

/**
 * PUT /api/news/:id/feature
 * Toggles the featured status of a news article
 */
router.put('/news/:id/feature', async (req, res) => {
  try {
    const newsArticle = await News.findByPk(req.params.id);
    if (!newsArticle) {
      return res.status(404).send('News article not found');
    }
    
    const [updated] = await News.update(
      { is_featured: !newsArticle.is_featured },
      { where: { id: req.params.id } }
    );
    
    if (updated) {
      const updatedNews = await News.findByPk(req.params.id, {
        include: [
          { model: User, as: 'author' },
          { model: Branch }
        ]
      });
      return res.json(updatedNews);
    }
    return res.status(500).send('Failed to update featured status');
  } catch (err) {
    console.error(err);
    res.status(400).send('Failed to update featured status');
  }
});

/**
 * PUT /api/news/:id/status
 * Updates the status of a news article (draft, published, archived)
 */
router.put('/news/:id/status', async (req, res) => {
  try {
    if (!req.body.status) {
      return res.status(400).send('Status is required');
    }
    
    const [updated] = await News.update(
      { status: req.body.status },
      { where: { id: req.params.id } }
    );
    
    if (updated) {
      const updatedNews = await News.findByPk(req.params.id, {
        include: [
          { model: User, as: 'author' },
          { model: Branch }
        ]
      });
      return res.json(updatedNews);
    }
    return res.status(404).send('News article not found');
  } catch (err) {
    console.error(err);
    res.status(400).send('Failed to update news status');
  }
});

/**
 * DELETE /api/news/:id
 * Deletes a news article
 */
router.delete('/news/:id', async (req, res) => {
  try {
    const deleted = await News.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      return res.status(204).send();
    }
    return res.status(404).send('News article not found');
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to delete news article');
  }
});

module.exports = router;