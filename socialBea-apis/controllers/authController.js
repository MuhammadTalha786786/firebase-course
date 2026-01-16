const User = require('../models/User');
const { generateToken } = require('../utils/jwtUtils');

// @desc    Login user / Generate new token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Get user WITH password for validation
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update login status
    user.isLogin = true;
    await user.save();

    // Generate JWT token
    const token = generateToken({
      id: user._id,
      email: user.email,
      uid: user.uid,
      name: user.name
    });

    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000);

    // Convert mongoose doc → plain object
    const userData = user.toObject();
    delete userData.password; // 🔥 REMOVE PASSWORD

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userData,
        token,
        expiresIn: '8h',
        expiresAt: expiresAt.toISOString()
      }
    });

  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while logging in',
      error: error.message
    });
  }
};


// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update login status
    user.isLogin = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Error logging out:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while logging out',
      error: error.message
    });
  }
};

// @desc    Verify token
// @route   GET /api/auth/verify
// @access  Private
const verifyUser = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Token is valid',
    data: {
      user: req.user
    }
  });
};

module.exports = {
  loginUser,
  logoutUser,
  verifyUser
};