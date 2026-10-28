const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');

// Public authentication routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Private profile routes
router.get('/me', requireAuth, authController.getProfile);
router.put('/settings', requireAuth, authController.updateSettings);

module.exports = router;
