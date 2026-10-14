const WebSocket = require('ws');
const mongoose = require('mongoose');
const User = require('../models/user');
const Message = require('../models/message');
const connectDB = require('../config/db');

// Map of userId string -> Set of active WebSocket connections
const userSockets = new Map();

// Helper to compute deterministic conversation ID between two users
const getConversationId = (id1, id2) => {
  return [id1.toString(), id2.toString()].sort().join('_');
};

// Helper to resolve user ObjectId
const resolveUserId = async id => {
  if (!id) return null;
  if (mongoose.Types.ObjectId.isValid(id)) {
    const user = await User.findById(id);
    if (user) return user._id;
  }
  const userByUid = await User.findOne({ uid: id });
  return userByUid ? userByUid._id : null;
};

// Send JSON payload to a specific user
const sendToUser = (userId, payload) => {
  if (!userId) return false;
  const key = userId.toString();
  const sockets = userSockets.get(key);
  if (!sockets || sockets.size === 0) return false;

  const data = JSON.stringify(payload);
  let delivered = false;
  sockets.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(data);
      delivered = true;
    }
  });
  return delivered;
};

// Initialize WebSocket server on existing HTTP server
const initChatSocket = server => {
  const wss = new WebSocket.Server({ server, path: '/ws' });

  wss.on('connection', ws => {
    ws.isAlive = true;
    ws.userId = null;

    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('message', async rawData => {
      try {
        const data = JSON.parse(rawData.toString());
        const { type } = data;

        await connectDB();

        switch (type) {
          // 1. Identify connected user
          case 'identify': {
            const rawUserId = data.userId || data.userID;
            const resolvedId = await resolveUserId(rawUserId);
            if (resolvedId) {
              const key = resolvedId.toString();
              ws.userId = key;
              if (!userSockets.has(key)) {
                userSockets.set(key, new Set());
              }
              userSockets.get(key).add(ws);
              ws.send(
                JSON.stringify({
                  type: 'identified',
                  success: true,
                  userId: key,
                })
              );
            }
            break;
          }

          // 2. Send real-time message
          case 'send_message': {
            const { senderID, receiverID, message, messageID, timeofsend } = data;
            if (!senderID || !receiverID || !message) {
              ws.send(
                JSON.stringify({
                  type: 'error',
                  message: 'Missing senderID, receiverID, or message',
                })
              );
              return;
            }

            const senderObjId = await resolveUserId(senderID);
            const receiverObjId = await resolveUserId(receiverID);

            if (!senderObjId || !receiverObjId) {
              ws.send(
                JSON.stringify({
                  type: 'error',
                  message: 'Sender or receiver user not found',
                })
              );
              return;
            }

            const convId = getConversationId(senderObjId, receiverObjId);
            const idToUse = messageID || new mongoose.Types.ObjectId().toString();

            const newMsg = await Message.create({
              sender: senderObjId,
              receiver: receiverObjId,
              message: message.trim(),
              messageID: idToUse,
              conversationId: convId,
              timeofsend: timeofsend || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            });

            const populatedMsg = await Message.findById(newMsg._id)
              .populate('sender', 'name image uid')
              .populate('receiver', 'name image uid');

            const payload = {
              type: 'new_message',
              message: populatedMsg,
            };

            // Send to receiver
            sendToUser(receiverObjId, payload);
            // Confirm to sender
            sendToUser(senderObjId, payload);
            break;
          }

          // 3. Delete message (with 2-minute rule)
          case 'delete_message': {
            const { messageID, userID } = data;
            const resolvedUserId = await resolveUserId(userID);

            if (!resolvedUserId) {
              ws.send(
                JSON.stringify({
                  type: 'error',
                  message: 'User authentication failed',
                })
              );
              return;
            }

            const query = mongoose.Types.ObjectId.isValid(messageID)
              ? { $or: [{ _id: messageID }, { messageID }] }
              : { messageID };

            const msg = await Message.findOne(query);

            if (!msg) {
              ws.send(
                JSON.stringify({
                  type: 'error',
                  message: 'Message not found',
                })
              );
              return;
            }

            if (msg.sender.toString() !== resolvedUserId.toString()) {
              ws.send(
                JSON.stringify({
                  type: 'error',
                  message: 'You can only delete your own messages',
                })
              );
              return;
            }

            // ⏱️ Check 2-minute rule (120 seconds)
            const elapsed = (Date.now() - new Date(msg.createdAt).getTime()) / 1000;
            if (elapsed > 120) {
              ws.send(
                JSON.stringify({
                  type: 'error',
                  message: 'Messages can only be deleted within 2 minutes of sending.',
                  elapsedSeconds: Math.floor(elapsed),
                })
              );
              return;
            }

            msg.isDeleted = true;
            msg.deletedAt = new Date();
            msg.message = 'This message was deleted';
            await msg.save();

            const deletePayload = {
              type: 'message_deleted',
              messageID: msg.messageID,
              messageDbId: msg._id,
              deletedAt: msg.deletedAt,
            };

            sendToUser(msg.sender, deletePayload);
            sendToUser(msg.receiver, deletePayload);
            break;
          }

          // 4. Typing indicators
          case 'typing': {
            const { senderID, receiverID, isTyping } = data;
            const receiverObjId = await resolveUserId(receiverID);
            if (receiverObjId) {
              sendToUser(receiverObjId, {
                type: 'typing',
                senderID,
                isTyping: !!isTyping,
              });
            }
            break;
          }

          default:
            break;
        }
      } catch (err) {
        console.error('Socket message handling error:', err);
      }
    });

    ws.on('close', () => {
      if (ws.userId && userSockets.has(ws.userId)) {
        const set = userSockets.get(ws.userId);
        set.delete(ws);
        if (set.size === 0) {
          userSockets.delete(ws.userId);
        }
      }
    });

    ws.on('error', err => {
      console.error('WebSocket connection error:', err);
    });
  });

  // Heartbeat ping interval
  const interval = setInterval(() => {
    wss.clients.forEach(ws => {
      if (ws.isAlive === false) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(interval);
  });

  console.log('Real-time Chat WebSocket initialized at /ws');
  return wss;
};

module.exports = {
  initChatSocket,
  sendToUser,
  getConversationId,
  resolveUserId,
};
