const express = require('express');
const router = express.Router();
const { loginUser, logoutUser, verifyUser } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/login', loginUser);

// Protected routes
router.post('/logout', protect, logoutUser);
router.get('/verify', protect, verifyUser);

module.exports = router;