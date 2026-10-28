const express = require('express');
const router = express.Router();
const audioController = require('../controllers/audioController');
const { optionalAuth } = require('../middleware/authMiddleware');

// Stem splitting & project export endpoints
router.post('/split-stems', optionalAuth, audioController.splitStems);
router.post('/export', optionalAuth, audioController.exportProject);

module.exports = router;
