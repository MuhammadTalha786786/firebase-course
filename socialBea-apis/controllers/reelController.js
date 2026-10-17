const Reel = require('../models/reel');
const connectDB = require('../config/db');
const { v4: uuidv4 } = require('uuid');

/**
 * Extracts hashtags from a text string.
 * @param {string} text
 * @returns {string[]}
 */
const extractHashtags = (text = '') => {
  if (!text) return [];
  const matches = text.match(/#[a-zA-Z0-9_]+/g);
  return matches ? matches.map((tag) => tag.substring(1).toLowerCase()) : [];
};

// @desc    Create new reel
// @route   POST /api/reels
// @access  Public / Authenticated
const createReel = async (req, res) => {
  try {
    await connectDB();

    const {
      userID,
      userName,
      userImage,
      videoUrl,
      thumbnailUrl,
      caption,
      tags,
      audioTitle,
      duration,
    } = req.body;

    if (!userID || !userName) {
      return res.status(400).json({
        success: false,
        message: 'User ID and username are required',
      });
    }

    if (!videoUrl) {
      return res.status(400).json({
        success: false,
        message: 'Video URL is required to create a reel',
      });
    }

    // Merge explicitly provided tags with tags parsed from caption
    const parsedTags = extractHashtags(caption);
    const combinedTags = Array.from(
      new Set([...(Array.isArray(tags) ? tags : []), ...parsedTags])
    );

    const reelID = uuidv4();

    const reel = await Reel.create({
      reelID,
      userID,
      userName,
      userImage: userImage || '',
      videoUrl,
      thumbnailUrl: thumbnailUrl || '',
      caption: caption || '',
      tags: combinedTags,
      audioTitle: audioTitle || 'Original Audio - ' + userName,
      duration: Number(duration) || 0,
      likes: [],
      views: 0,
      shares: 0,
      comments: [],
    });

    res.status(201).json({
      success: true,
      message: 'Reel created successfully',
      data: reel,
    });
  } catch (error) {
    console.error('Error creating reel:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating reel',
      error: error.message,
    });
  }
};

// @desc    Get all reels with pagination
// @route   GET /api/reels
// @access  Public
const getAllReels = async (req, res) => {
  try {
    await connectDB();

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const currentUserId = req.headers['x-user-id'] || req.query.currentUserId || '';

    const totalReels = await Reel.countDocuments();
    const reels = await Reel.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean({ virtuals: true });

    // Format data with user-friendly flags
    const formattedReels = reels.map((reel) => {
      const isLiked = currentUserId
        ? Array.isArray(reel.likes) && reel.likes.includes(currentUserId)
        : false;
      return {
        ...reel,
        likesCount: Array.isArray(reel.likes) ? reel.likes.length : 0,
        commentsCount: Array.isArray(reel.comments) ? reel.comments.length : 0,
        isLiked,
      };
    });

    res.status(200).json({
      success: true,
      count: formattedReels.length,
      total: totalReels,
      currentPage: page,
      totalPages: Math.ceil(totalReels / limit),
      hasMore: skip + formattedReels.length < totalReels,
      data: formattedReels,
    });
  } catch (error) {
    console.error('Error fetching reels:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching reels',
      error: error.message,
    });
  }
};

// @desc    Get reel by ID
// @route   GET /api/reels/:reelID
// @access  Public
const getReelById = async (req, res) => {
  try {
    await connectDB();

    const { reelID } = req.params;
    const currentUserId = req.headers['x-user-id'] || req.query.currentUserId || '';

    const reel = await Reel.findOne({ reelID }).lean({ virtuals: true });

    if (!reel) {
      return res.status(404).json({
        success: false,
        message: 'Reel not found',
      });
    }

    const isLiked = currentUserId
      ? Array.isArray(reel.likes) && reel.likes.includes(currentUserId)
      : false;

    res.status(200).json({
      success: true,
      data: {
        ...reel,
        likesCount: Array.isArray(reel.likes) ? reel.likes.length : 0,
        commentsCount: Array.isArray(reel.comments) ? reel.comments.length : 0,
        isLiked,
      },
    });
  } catch (error) {
    console.error('Error fetching reel by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching reel',
      error: error.message,
    });
  }
};

// @desc    Get reels by user ID
// @route   GET /api/reels/user/:userID
// @access  Public
const getReelsByUserId = async (req, res) => {
  try {
    await connectDB();

    const { userID } = req.params;
    const currentUserId = req.headers['x-user-id'] || req.query.currentUserId || '';

    const reels = await Reel.find({ userID })
      .sort({ createdAt: -1 })
      .lean({ virtuals: true });

    const formattedReels = reels.map((reel) => {
      const isLiked = currentUserId
        ? Array.isArray(reel.likes) && reel.likes.includes(currentUserId)
        : false;
      return {
        ...reel,
        likesCount: Array.isArray(reel.likes) ? reel.likes.length : 0,
        commentsCount: Array.isArray(reel.comments) ? reel.comments.length : 0,
        isLiked,
      };
    });

    res.status(200).json({
      success: true,
      count: formattedReels.length,
      data: formattedReels,
    });
  } catch (error) {
    console.error('Error fetching user reels:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user reels',
      error: error.message,
    });
  }
};

// @desc    Toggle like on a reel
// @route   POST /api/reels/:reelID/like
// @access  Public / Authenticated
const toggleLikeReel = async (req, res) => {
  try {
    await connectDB();

    const { reelID } = req.params;
    const { userID } = req.body;

    if (!userID) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required to like/unlike',
      });
    }

    const reel = await Reel.findOne({ reelID });

    if (!reel) {
      return res.status(404).json({
        success: false,
        message: 'Reel not found',
      });
    }

    const index = reel.likes.indexOf(userID);
    let isLiked = false;

    if (index > -1) {
      // Already liked -> remove like
      reel.likes.splice(index, 1);
      isLiked = false;
    } else {
      // Not liked yet -> add like
      reel.likes.push(userID);
      isLiked = true;
    }

    await reel.save();

    res.status(200).json({
      success: true,
      message: isLiked ? 'Reel liked successfully' : 'Reel unliked successfully',
      data: {
        reelID: reel.reelID,
        isLiked,
        likesCount: reel.likes.length,
      },
    });
  } catch (error) {
    console.error('Error toggling reel like:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while toggling like',
      error: error.message,
    });
  }
};

// @desc    Increment reel view count
// @route   POST /api/reels/:reelID/view
// @access  Public
const incrementReelViews = async (req, res) => {
  try {
    await connectDB();

    const { reelID } = req.params;

    const reel = await Reel.findOneAndUpdate(
      { reelID },
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!reel) {
      return res.status(404).json({
        success: false,
        message: 'Reel not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        reelID: reel.reelID,
        views: reel.views,
      },
    });
  } catch (error) {
    console.error('Error incrementing reel views:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating views',
      error: error.message,
    });
  }
};

// @desc    Add comment to reel
// @route   POST /api/reels/:reelID/comments
// @access  Public / Authenticated
const addReelComment = async (req, res) => {
  try {
    await connectDB();

    const { reelID } = req.params;
    const { comment, userID, userName, userImage } = req.body;

    if (!comment || !comment.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment text cannot be empty',
      });
    }

    if (!userID || !userName) {
      return res.status(400).json({
        success: false,
        message: 'User ID and username are required',
      });
    }

    const reel = await Reel.findOne({ reelID });

    if (!reel) {
      return res.status(404).json({
        success: false,
        message: 'Reel not found',
      });
    }

    const newComment = {
      commentID: uuidv4(),
      reelID,
      userID,
      userName,
      userImage: userImage || '',
      comment: comment.trim(),
      commentCreated: new Date(),
      likes: [],
      replies: [],
    };

    reel.comments.unshift(newComment);
    await reel.save();

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: newComment,
      commentsCount: reel.comments.length,
    });
  } catch (error) {
    console.error('Error adding reel comment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding comment',
      error: error.message,
    });
  }
};

// @desc    Get comments for a reel
// @route   GET /api/reels/:reelID/comments
// @access  Public
const getReelComments = async (req, res) => {
  try {
    await connectDB();

    const { reelID } = req.params;
    const reel = await Reel.findOne({ reelID });

    if (!reel) {
      return res.status(404).json({
        success: false,
        message: 'Reel not found',
      });
    }

    // Return newest comments first
    const comments = (reel.comments || []).sort(
      (a, b) => new Date(b.commentCreated) - new Date(a.commentCreated)
    );

    res.status(200).json({
      success: true,
      count: comments.length,
      data: comments,
    });
  } catch (error) {
    console.error('Error fetching reel comments:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching comments',
      error: error.message,
    });
  }
};

// @desc    Delete comment from reel
// @route   DELETE /api/reels/:reelID/comments/:commentID
// @access  Public / Authenticated
const deleteReelComment = async (req, res) => {
  try {
    await connectDB();

    const { reelID, commentID } = req.params;
    const { userID } = req.body;

    const reel = await Reel.findOne({ reelID });

    if (!reel) {
      return res.status(404).json({
        success: false,
        message: 'Reel not found',
      });
    }

    const commentIndex = reel.comments.findIndex(
      (c) => c.commentID === commentID
    );

    if (commentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    // Allow author of comment or author of reel to delete
    const comment = reel.comments[commentIndex];
    if (userID && comment.userID !== userID && reel.userID !== userID) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment',
      });
    }

    reel.comments.splice(commentIndex, 1);
    await reel.save();

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
      commentsCount: reel.comments.length,
    });
  } catch (error) {
    console.error('Error deleting reel comment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting comment',
      error: error.message,
    });
  }
};

// @desc    Delete a reel
// @route   DELETE /api/reels/:reelID
// @access  Public / Authenticated
const deleteReel = async (req, res) => {
  try {
    await connectDB();

    const { reelID } = req.params;
    const { userID } = req.body;

    const reel = await Reel.findOne({ reelID });

    if (!reel) {
      return res.status(404).json({
        success: false,
        message: 'Reel not found',
      });
    }

    if (userID && reel.userID !== userID) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this reel',
      });
    }

    await Reel.findOneAndDelete({ reelID });

    res.status(200).json({
      success: true,
      message: 'Reel deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting reel:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting reel',
      error: error.message,
    });
  }
};

module.exports = {
  createReel,
  getAllReels,
  getReelById,
  getReelsByUserId,
  toggleLikeReel,
  incrementReelViews,
  addReelComment,
  getReelComments,
  deleteReelComment,
  deleteReel,
};
