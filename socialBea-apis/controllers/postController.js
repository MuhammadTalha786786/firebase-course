const Post = require('../models/post');
const connectDB = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// Helper function to find a reply by ID recursively
function findReplyById(replies, replyID) {
  for (let reply of replies) {
    if (reply.replyID === replyID) {
      return reply;
    }
    if (reply.replies && reply.replies.length > 0) {
      const found = findReplyById(reply.replies, replyID);
      if (found) return found;
    }
  }
  return null;
}

// Helper function to delete a reply by ID recursively
function deleteReplyById(replies, replyID) {
  for (let i = 0; i < replies.length; i++) {
    if (replies[i].replyID === replyID) {
      replies.splice(i, 1);
      return true;
    }
    if (replies[i].replies && replies[i].replies.length > 0) {
      if (deleteReplyById(replies[i].replies, replyID)) {
        return true;
      }
    }
  }
  return false;
}

// @desc    Create new post
// @route   POST /api/posts
// @access  Public
const createPost = async (req, res) => {
  try {
    await connectDB();
    
    const { userID, userName, userImage, postDetail, postImage } = req.body;

    if (!userID || !userName || !userImage || !postDetail) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const postID = uuidv4();

    const post = await Post.create({
      postID,
      userID,
      userName,
      userImage,
      postDetail,
      postImage: postImage || '',
      likes: [],
      comments: []
    });

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: post
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating post',
      error: error.message
    });
  }
};

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
const getAllPosts = async (req, res) => {
  try {
    await connectDB();
    
    const posts = await Post.find({}).sort({ dateCreated: -1 });
    
    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching posts',
      error: error.message
    });
  }
};

// @desc    Get single post by ID
// @route   GET /api/posts/:postID
// @access  Public
const getPostById = async (req, res) => {
  try {
    await connectDB();
    
    const post = await Post.findOne({ postID: req.params.postID });
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    res.status(200).json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching post',
      error: error.message
    });
  }
};

// @desc    Get posts by user ID
// @route   GET /api/posts/user/:userID
// @access  Public
const getPostsByUserId = async (req, res) => {
  try {
    await connectDB();
    
    const posts = await Post.find({ userID: req.params.userID }).sort({ dateCreated: -1 });
    
    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts
    });
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user posts',
      error: error.message
    });
  }
};

// @desc    Update post
// @route   PUT /api/posts/:postID
// @access  Public
const updatePost = async (req, res) => {
  try {
    await connectDB();
    
    const { postDetail, postImage } = req.body;

    const post = await Post.findOneAndUpdate(
      { postID: req.params.postID },
      { postDetail, postImage },
      { new: true, runValidators: true }
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      data: post
    });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating post',
      error: error.message
    });
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:postID
// @access  Public
const deletePost = async (req, res) => {
  try {
    await connectDB();
    
    const post = await Post.findOneAndDelete({ postID: req.params.postID });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting post',
      error: error.message
    });
  }
};

// @desc    Like/Unlike post
// @route   POST /api/posts/:postID/like
// @access  Public
const toggleLike = async (req, res) => {
  try {
    await connectDB();
    
    const { userID } = req.body;
    const { postID } = req.params;

    if (!userID) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const post = await Post.findOne({ postID });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const likeIndex = post.likes.indexOf(userID);

    if (likeIndex > -1) {
      post.likes.splice(likeIndex, 1);
      await post.save();

      return res.status(200).json({
        success: true,
        message: 'Post unliked successfully',
        data: {
          postID: post.postID,
          liked: false,
          likesCount: post.likesCount
        }
      });
    } else {
      post.likes.push(userID);
      await post.save();

      return res.status(200).json({
        success: true,
        message: 'Post liked successfully',
        data: {
          postID: post.postID,
          liked: true,
          likesCount: post.likesCount
        }
      });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while toggling like',
      error: error.message
    });
  }
};

// @desc    Add comment to post
// @route   POST /api/posts/:postID/comments
// @access  Public
const addComment = async (req, res) => {
  try {
    await connectDB();
    
    const { comment, userID, userImage, userProfileName } = req.body;
    const { postID } = req.params;

    if (!comment || !userID || !userImage || !userProfileName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const post = await Post.findOne({ postID });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const commentID = uuidv4();

    const newComment = {
      comment,
      commentID,
      postID,
      userID,
      userImage,
      userProfileName,
      commentCreated: new Date(),
      replies: []
    };

    post.comments.push(newComment);
    await post.save();

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: newComment
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding comment',
      error: error.message
    });
  }
};

// @desc    Get all comments for a post
// @route   GET /api/posts/:postID/comments
// @access  Public
const getComments = async (req, res) => {
  try {
    await connectDB();
    
    const { postID } = req.params;

    const post = await Post.findOne({ postID });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    res.status(200).json({
      success: true,
      count: post.comments.length,
      data: post.comments
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching comments',
      error: error.message
    });
  }
};

// @desc    Delete comment
// @route   DELETE /api/posts/:postID/comments/:commentID
// @access  Public
const deleteComment = async (req, res) => {
  try {
    await connectDB();
    
    const { postID, commentID } = req.params;

    const post = await Post.findOne({ postID });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const commentIndex = post.comments.findIndex(c => c.commentID === commentID);

    if (commentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    post.comments.splice(commentIndex, 1);
    await post.save();

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting comment',
      error: error.message
    });
  }
};

// @desc    Add reply to comment or nested reply
// @route   POST /api/posts/:postID/replies
// @access  Public
const addReply = async (req, res) => {
  try {
    await connectDB();
    
    const { reply, userID, userImage, userProfileName, parentReplyID, commentID } = req.body;
    const { postID } = req.params;

    // Validation
    if (!reply || !userID || !userImage || !userProfileName || !commentID) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (reply, userID, userImage, userProfileName, commentID)'
      });
    }

    const post = await Post.findOne({ postID });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const comment = post.comments.find(c => c.commentID === commentID);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    const replyID = uuidv4();

    const newReply = {
      reply,
      replyID,
      parentReplyID: parentReplyID || null,
      userID,
      userImage,
      userProfileName,
      replyCreated: new Date(),
      replies: []
    };

    // If parentReplyID is provided, add as nested reply
    if (parentReplyID) {
      const parentReply = findReplyById(comment.replies, parentReplyID);
      
      if (!parentReply) {
        return res.status(404).json({
          success: false,
          message: 'Parent reply not found'
        });
      }

      parentReply.replies.push(newReply);
    } else {
      // Add as direct reply to comment
      comment.replies.push(newReply);
    }

    await post.save();

    res.status(201).json({
      success: true,
      message: 'Reply added successfully',
      data: newReply
    });
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding reply',
      error: error.message
    });
  }
};

// @desc    Get all replies for a comment (includes nested)
// @route   GET /api/posts/:postID/comments/:commentID/replies
// @access  Public
const getReplies = async (req, res) => {
  try {
    await connectDB();
    
    const { postID, commentID } = req.params;

    const post = await Post.findOne({ postID });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const comment = post.comments.find(c => c.commentID === commentID);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    res.status(200).json({
      success: true,
      count: comment.replies.length,
      data: comment.replies
    });
  } catch (error) {
    console.error('Error fetching replies:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching replies',
      error: error.message
    });
  }
};

// @desc    Delete reply (works for any level of nesting)
// @route   DELETE /api/posts/:postID/replies/:replyID
// @access  Public
const deleteReply = async (req, res) => {
  try {
    await connectDB();
    
    const { postID, replyID } = req.params;
    const { commentID } = req.body;

    if (!commentID) {
      return res.status(400).json({
        success: false,
        message: 'commentID is required in request body'
      });
    }

    const post = await Post.findOne({ postID });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const comment = post.comments.find(c => c.commentID === commentID);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    const deleted = deleteReplyById(comment.replies, replyID);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Reply not found'
      });
    }

    await post.save();

    res.status(200).json({
      success: true,
      message: 'Reply deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting reply:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting reply',
      error: error.message
    });
  }
};

module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  getPostsByUserId,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
  getComments,
  deleteComment,
  addReply,
  getReplies,
  deleteReply
};