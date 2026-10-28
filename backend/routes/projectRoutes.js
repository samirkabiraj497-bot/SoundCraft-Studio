const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { requireAuth, optionalAuth } = require('../middleware/authMiddleware');

// CRUD operations on DAW projects
router.post('/', requireAuth, projectController.createProject);
router.get('/', requireAuth, projectController.getUserProjects);
router.get('/:id', optionalAuth, projectController.getProjectById);
router.put('/:id', requireAuth, projectController.updateProject);
router.delete('/:id', requireAuth, projectController.deleteProject);

module.exports = router;
