const Post = require('../models/post');
const { v4: uuidv4 } = require('uuid');

// @desc    Create new post
// @route   POST /api/posts
// @access  Public
const createPost = async (req, res) => {
  try {
    const { userID, userName, userImage, postDetail, postImage } = req.body;

    // Validation
    if (!userID || !userName || !userImage || !postDetail) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const postID = uuidv4();

    // Create post
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

    // Check if user already liked the post
    const likeIndex = post.likes.indexOf(userID);

    if (likeIndex > -1) {
      // Unlike: Remove user from likes array
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
      // Like: Add user to likes array
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
    const { comment, userID, userImage, userProfileName } = req.body;
    const { postID } = req.params;

    // Validation
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

// @desc    Add reply to comment
// @route   POST /api/posts/:postID/comments/:commentID/replies
// @access  Public
const addReply = async (req, res) => {
  try {
    const { reply, userID, userImage, userProfileName } = req.body;
    const { postID, commentID } = req.params;

    // Validation
    if (!reply || !userID || !userImage || !userProfileName) {
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
      commentID,
      userID,
      userImage,
      userProfileName,
      replyCreated: new Date()
    };

    comment.replies.push(newReply);
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

// @desc    Get all replies for a comment
// @route   GET /api/posts/:postID/comments/:commentID/replies
// @access  Public
const getReplies = async (req, res) => {
  try {
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

// @desc    Delete reply
// @route   DELETE /api/posts/:postID/comments/:commentID/replies/:replyID
// @access  Public
const deleteReply = async (req, res) => {
  try {
    const { postID, commentID, replyID } = req.params;

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

    const replyIndex = comment.replies.findIndex(r => r.replyID === replyID);

    if (replyIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Reply not found'
      });
    }

    comment.replies.splice(replyIndex, 1);
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