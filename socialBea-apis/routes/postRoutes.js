const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/postController');

// Post routes
router.post('/', createPost);
router.get('/', getAllPosts);
router.get('/:postID', getPostById);
router.get('/user/:userID', getPostsByUserId);
router.put('/:postID', updatePost);
router.delete('/:postID', deletePost);

// Like routes
router.post('/:postID/like', toggleLike);

// Comment routes
router.post('/:postID/comments', addComment);
router.get('/:postID/comments', getComments);
router.delete('/:postID/comments/:commentID', deleteComment);

// Reply routes (supports nested replies)
router.post('/:postID/replies', addReply);
router.get('/:postID/comments/:commentID/replies', getReplies);
router.delete('/:postID/replies/:replyID', deleteReply);

module.exports = router;