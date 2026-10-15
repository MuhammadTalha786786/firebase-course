const express = require('express');
const router = express.Router();
const {
  getSuggestions,
  getRequests,
  getFriends,
  getAllFriendData,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
  removeFriend,
} = require('../controllers/friendController');

// Consolidated quick load
router.get('/all', getAllFriendData);

// Friend lists & suggestions
router.get('/suggestions', getSuggestions);
router.get('/requests', getRequests);
router.get('/', getFriends);

// Request actions
router.post('/request', sendFriendRequest);
router.put('/request/:id/accept', acceptFriendRequest);
router.put('/request/:id/reject', rejectFriendRequest);
router.delete('/request/:id/cancel', cancelFriendRequest);

// Remove friend
router.delete('/:friendId', removeFriend);

module.exports = router;
