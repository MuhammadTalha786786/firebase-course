const express = require('express');
const router = express.Router();
const {
  loginUser,
  googleSignIn,
  logoutUser,
  verifyUser
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/login', loginUser);
router.post('/google', googleSignIn);

// Protected routes
router.post('/logout', protect, logoutUser);
router.get('/verify', protect, verifyUser);

module.exports = router;