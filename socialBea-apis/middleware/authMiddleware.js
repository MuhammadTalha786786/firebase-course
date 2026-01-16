const { verifyToken } = require('../utils/jwtUtils');
const User = require('../models/User');

/**
 * Protect routes - verify JWT token
 */
const protect = async (req, res, next) => {
  let token;

  // Check if token exists in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header (format: "Bearer TOKEN")
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = verifyToken(token);

      // Get user from token and attach to request
      req.user = await User.findById(decoded.id).select('-__v');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      next();
    } catch (error) {
      console.error('Auth error:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed',
        error: error.message
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided'
    });
  }
};

module.exports = { protect };