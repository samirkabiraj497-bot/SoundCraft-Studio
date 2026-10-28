const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { requireAuth, optionalAuth } = require('../middleware/authMiddleware');

// AI Arranger and Lyric Generator endpoints
router.post('/arranger', optionalAuth, aiController.generateArrangement);
router.post('/lyrics', optionalAuth, aiController.generateLyrics);
router.get('/lyrics', requireAuth, aiController.getUserLyrics);

module.exports = router;
