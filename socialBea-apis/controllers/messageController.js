const mongoose = require('mongoose');
const User = require('../models/user');
const Message = require('../models/message');
const connectDB = require('../config/db');
const { verifyToken } = require('../utils/jwtUtils');
const { sendToUser, getConversationId } = require('../socket/chatSocket');

// Helper to resolve user ID from token, header, or query/body
const resolveUserId = async req => {
  if (req.user && req.user._id) {
    return req.user._id;
  }

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = verifyToken(token);
      if (decoded && decoded.id) {
        return new mongoose.Types.ObjectId(decoded.id);
      }
    } catch (e) {
      // Continue to query/headers
    }
  }

  const rawId =
    req.headers['x-user-id'] ||
    req.query.userID ||
    req.query.userId ||
    req.body.userID ||
    req.body.userId;

  if (!rawId) return null;

  if (mongoose.Types.ObjectId.isValid(rawId)) {
    return new mongoose.Types.ObjectId(rawId);
  }

  const user = await User.findOne({ uid: rawId });
  return user ? user._id : null;
};

// Helper to resolve any user ID (ObjectId or uid)
const resolveAnyUserId = async id => {
  if (!id) return null;
  if (mongoose.Types.ObjectId.isValid(id)) {
    const user = await User.findById(id);
    if (user) return user._id;
  }
  const userByUid = await User.findOne({ uid: id });
  return userByUid ? userByUid._id : null;
};

// @desc    Get messages between current user and receiver
// @route   GET /api/messages/:receiverId
// @access  Public / Private
const getMessages = async (req, res) => {
  try {
    await connectDB();

    const currentUserId = await resolveUserId(req);
    const receiverId = await resolveAnyUserId(req.params.receiverId);

    if (!currentUserId) {
      return res.status(400).json({
        success: false,
        message: 'Current user identification is required (token or userID)',
      });
    }

    if (!receiverId) {
      return res.status(404).json({
        success: false,
        message: 'Receiver user not found',
      });
    }

    const conversationId = getConversationId(currentUserId, receiverId);

    const limit = Math.min(parseInt(req.query.limit, 10) || 100, 200);

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .limit(limit)
      .populate('sender', 'name image uid')
      .populate('receiver', 'name image uid');

    // Mark unread messages sent to current user as read
    await Message.updateMany(
      {
        conversationId,
        receiver: currentUserId,
        isRead: false,
      },
      {
        $set: { isRead: true, readAt: new Date() },
      }
    );

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    console.error('Error in getMessages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve messages',
      error: error.message,
    });
  }
};

// @desc    Send a new message
// @route   POST /api/messages
// @access  Public / Private
const sendMessage = async (req, res) => {
  try {
    await connectDB();

    const currentUserId = await resolveUserId(req);
    const { receiverID, message, messageID, timeofsend } = req.body;

    if (!currentUserId) {
      return res.status(400).json({
        success: false,
        message: 'Current user identification is required',
      });
    }

    if (!receiverID || !message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'receiverID and message content are required',
      });
    }

    const receiverObjId = await resolveAnyUserId(receiverID);
    if (!receiverObjId) {
      return res.status(404).json({
        success: false,
        message: 'Receiver user not found',
      });
    }

    const conversationId = getConversationId(currentUserId, receiverObjId);
    const idToUse = messageID || new mongoose.Types.ObjectId().toString();

    // Check if messageID already exists (idempotency)
    let existingMsg = await Message.findOne({ messageID: idToUse });
    if (existingMsg) {
      const populated = await Message.findById(existingMsg._id)
        .populate('sender', 'name image uid')
        .populate('receiver', 'name image uid');
      return res.status(200).json({
        success: true,
        message: 'Message already exists',
        data: populated,
      });
    }

    const newMsg = await Message.create({
      sender: currentUserId,
      receiver: receiverObjId,
      message: message.trim(),
      messageID: idToUse,
      conversationId,
      timeofsend:
        timeofsend ||
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    const populatedMsg = await Message.findById(newMsg._id)
      .populate('sender', 'name image uid')
      .populate('receiver', 'name image uid');

    // Notify real-time WebSocket if receiver is connected
    sendToUser(receiverObjId, {
      type: 'new_message',
      message: populatedMsg,
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: populatedMsg,
    });
  } catch (error) {
    console.error('Error in sendMessage:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message,
    });
  }
};

// @desc    Delete message (only within 2 minutes of sending)
// @route   DELETE /api/messages/:messageId
// @access  Public / Private
const deleteMessage = async (req, res) => {
  try {
    await connectDB();

    const currentUserId = await resolveUserId(req);
    const { messageId } = req.params;

    if (!currentUserId) {
      return res.status(400).json({
        success: false,
        message: 'Authentication required to delete message',
      });
    }

    const query = mongoose.Types.ObjectId.isValid(messageId)
      ? { $or: [{ _id: messageId }, { messageID: messageId }] }
      : { messageID: messageId };

    const msg = await Message.findOne(query);

    if (!msg) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    // Only original sender can delete
    if (msg.sender.toString() !== currentUserId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete messages sent by you',
      });
    }

    // ⏱️ STRICT 2-MINUTE RULE (120 SECONDS)
    const messageCreatedTime = new Date(msg.createdAt).getTime();
    const currentTime = Date.now();
    const elapsedSeconds = (currentTime - messageCreatedTime) / 1000;

    if (elapsedSeconds > 120) {
      return res.status(400).json({
        success: false,
        message: 'Messages can only be deleted within 2 minutes of sending.',
        elapsedSeconds: Math.floor(elapsedSeconds),
        timeLimitSeconds: 120,
      });
    }

    // Mark as deleted
    msg.isDeleted = true;
    msg.deletedAt = new Date();
    msg.message = 'This message was deleted';
    await msg.save();

    // Broadcast real-time deletion event to both users via WebSocket
    const deletePayload = {
      type: 'message_deleted',
      messageID: msg.messageID,
      messageDbId: msg._id,
      deletedAt: msg.deletedAt,
    };

    sendToUser(msg.sender, deletePayload);
    sendToUser(msg.receiver, deletePayload);

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully',
      data: msg,
    });
  } catch (error) {
    console.error('Error in deleteMessage:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message',
      error: error.message,
    });
  }
};

// @desc    Get user's recent conversations list
// @route   GET /api/messages/conversations
// @access  Public / Private
const getConversations = async (req, res) => {
  try {
    await connectDB();

    const currentUserId = await resolveUserId(req);
    if (!currentUserId) {
      return res.status(400).json({
        success: false,
        message: 'Current user identification is required',
      });
    }

    // Find all messages involving current user
    const messages = await Message.find({
      $or: [{ sender: currentUserId }, { receiver: currentUserId }],
    })
      .sort({ createdAt: -1 })
      .populate('sender', 'name image uid isLogin')
      .populate('receiver', 'name image uid isLogin');

    const conversationMap = new Map();

    for (const msg of messages) {
      const otherUser =
        msg.sender._id.toString() === currentUserId.toString()
          ? msg.receiver
          : msg.sender;

      if (!otherUser || !otherUser._id) continue;

      const otherKey = otherUser._id.toString();
      if (!conversationMap.has(otherKey)) {
        conversationMap.set(otherKey, {
          user: otherUser,
          lastMessage: msg.message,
          lastMessageTime: msg.createdAt,
          timeofsend: msg.timeofsend,
          unreadCount:
            msg.receiver._id.toString() === currentUserId.toString() && !msg.isRead
              ? 1
              : 0,
        });
      } else if (
        msg.receiver._id.toString() === currentUserId.toString() &&
        !msg.isRead
      ) {
        const item = conversationMap.get(otherKey);
        item.unreadCount += 1;
      }
    }

    res.status(200).json({
      success: true,
      data: Array.from(conversationMap.values()),
    });
  } catch (error) {
    console.error('Error in getConversations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve conversations',
      error: error.message,
    });
  }
};

module.exports = {
  getMessages,
  sendMessage,
  deleteMessage,
  getConversations,
};
