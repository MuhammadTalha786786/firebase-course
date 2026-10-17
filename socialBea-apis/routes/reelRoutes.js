const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/reelController');

// Base reel endpoints
router.post('/', createReel);
router.get('/', getAllReels);
router.get('/:reelID', getReelById);
router.get('/user/:userID', getReelsByUserId);
router.delete('/:reelID', deleteReel);

// Interactions
router.post('/:reelID/like', toggleLikeReel);
router.post('/:reelID/view', incrementReelViews);

// Comments
router.post('/:reelID/comments', addReelComment);
router.get('/:reelID/comments', getReelComments);
router.delete('/:reelID/comments/:commentID', deleteReelComment);

module.exports = router;
