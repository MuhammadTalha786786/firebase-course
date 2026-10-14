const User = require('../models/user');
const connectDB = require('../config/db');
const { generateToken } = require('../utils/jwtUtils');
const crypto = require('crypto');

// @desc    Login user / Generate new token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    await connectDB();
    
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
    delete userData.password;

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

// @desc    Google Sign-In / OAuth Login & Register
// @route   POST /api/auth/google
// @access  Public
const googleSignIn = async (req, res) => {
  try {
    await connectDB();

    const { email, name, image, uid } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email for Google Sign-In'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists by email or uid
    let user = await User.findOne({
      $or: [{ email: normalizedEmail }, ...(uid ? [{ uid }] : [])]
    });

    if (user) {
      // User exists: update login state and latest profile info
      user.isLogin = true;
      if (name && (!user.name || user.name.trim() === '')) {
        user.name = name.trim();
      }
      if (image && (!user.image || user.image.trim() === '')) {
        user.image = image;
      }
      if (uid && (!user.uid || user.uid.trim() === '')) {
        user.uid = uid;
      }
      await user.save();
    } else {
      // First-time sign-in: create new user
      const defaultAvatar =
        image ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80';
      const userName = name ? name.trim() : normalizedEmail.split('@')[0];
      const userUid =
        uid ||
        (crypto.randomUUID
          ? crypto.randomUUID()
          : Math.random().toString(36).substring(2));

      user = await User.create({
        email: normalizedEmail,
        name: userName,
        image: defaultAvatar,
        uid: userUid,
        isLogin: true
      });
    }

    // Generate JWT token
    const token = generateToken({
      id: user._id,
      email: user.email,
      uid: user.uid,
      name: user.name
    });

    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000);

    const userData = user.toObject();
    delete userData.password;

    res.status(200).json({
      success: true,
      message: 'Google Sign-In successful',
      data: {
        user: userData,
        token,
        expiresIn: '8h',
        expiresAt: expiresAt.toISOString()
      }
    });
  } catch (error) {
    console.error('Error during Google Sign-In:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during Google Sign-In',
      error: error.message
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = async (req, res) => {
  try {
    await connectDB();
    
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
  googleSignIn,
  logoutUser,
  verifyUser
};