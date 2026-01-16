const jwt = require('jsonwebtoken');

/**
 * Generate JWT token with 8-hour expiry
 * @param {Object} payload - Data to encode in token (user id, email, etc.)
 * @returns {String} JWT token
 */


const generateToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: '8h' } // Token expires in 8 hours
  );
};

/**
 * Verify JWT token
 * @param {String} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Decode JWT token without verification (for inspection)
 * @param {String} token - JWT token to decode
 * @returns {Object} Decoded token payload
 */
const decodeToken = (token) => {
  return jwt.decode(token);
};

module.exports = {
  generateToken,
  verifyToken,
  decodeToken
};