const express = require('express');
const router = express.Router();
const {
  getMessages,
  sendMessage,
  deleteMessage,
  getConversations,
} = require('../controllers/messageController');

// Conversations list
router.get('/conversations', getConversations);

// Send message
router.post('/', sendMessage);

// Delete message (enforces 2-minute limit)
router.delete('/:messageId', deleteMessage);

// Get messages with a specific receiver
router.get('/:receiverId', getMessages);

module.exports = router;
