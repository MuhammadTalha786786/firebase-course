const mongoose = require('mongoose');
const User = require('../models/user');
const Friendship = require('../models/friendship');
const connectDB = require('../config/db');
const { verifyToken } = require('../utils/jwtUtils');

// Helper to resolve current user's ObjectId
const resolveUserId = async req => {
  if (req.user && req.user._id) {
    return req.user._id;
  }

  // Check Bearer token in header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = verifyToken(token);
      if (decoded && decoded.id) {
        return new mongoose.Types.ObjectId(decoded.id);
      }
    } catch (e) {
      // Continue to check other sources
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

  // Search by uid
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

// @desc    Get suggested friends for current user
// @route   GET /api/friends/suggestions
// @access  Public / Private
const getSuggestions = async (req, res) => {
  try {
    await connectDB();
    const currentUserId = await resolveUserId(req);

    if (!currentUserId) {
      return res.status(400).json({
        success: false,
        message: 'Current user identification is required',
      });
    }

    // Find all users except current user
    const users = await User.find({ _id: { $ne: currentUserId } })
      .select('name email image uid isLogin createdAt')
      .lean();

    // Find all friendships involving current user
    const friendships = await Friendship.find({
      $or: [{ requester: currentUserId }, { recipient: currentUserId }],
    }).lean();

    // Map each user with relationship status
    const suggestions = [];

    for (const u of users) {
      const rel = friendships.find(
        f =>
          (f.requester.toString() === currentUserId.toString() &&
            f.recipient.toString() === u._id.toString()) ||
          (f.recipient.toString() === currentUserId.toString() &&
            f.requester.toString() === u._id.toString())
      );

      let friendshipStatus = 'none'; // 'none' | 'sent' | 'received' | 'friends'
      let friendshipId = null;

      if (rel) {
        friendshipId = rel._id;
        if (rel.status === 'accepted') {
          friendshipStatus = 'friends';
        } else if (rel.status === 'pending') {
          if (rel.requester.toString() === currentUserId.toString()) {
            friendshipStatus = 'sent';
          } else {
            friendshipStatus = 'received';
          }
        }
      }

      // Filter out users who are already friends from suggestions list
      if (friendshipStatus !== 'friends') {
        suggestions.push({
          ...u,
          friendshipStatus,
          friendshipId,
        });
      }
    }

    res.status(200).json({
      success: true,
      count: suggestions.length,
      data: suggestions,
    });
  } catch (error) {
    console.error('Error in getSuggestions:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching suggestions',
      error: error.message,
    });
  }
};

// @desc    Get incoming and outgoing friend requests
// @route   GET /api/friends/requests
// @access  Public / Private
const getRequests = async (req, res) => {
  try {
    await connectDB();
    const currentUserId = await resolveUserId(req);

    if (!currentUserId) {
      return res.status(400).json({
        success: false,
        message: 'Current user identification is required',
      });
    }

    // Incoming requests (people who sent requests to current user)
    const received = await Friendship.find({
      recipient: currentUserId,
      status: 'pending',
    })
      .populate('requester', 'name email image uid isLogin createdAt')
      .sort({ createdAt: -1 })
      .lean();

    // Outgoing requests (requests current user sent to others)
    const sent = await Friendship.find({
      requester: currentUserId,
      status: 'pending',
    })
      .populate('recipient', 'name email image uid isLogin createdAt')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: {
        received: received.map(r => ({
          requestId: r._id,
          createdAt: r.createdAt,
          user: r.requester,
        })),
        sent: sent.map(s => ({
          requestId: s._id,
          createdAt: s.createdAt,
          user: s.recipient,
        })),
      },
    });
  } catch (error) {
    console.error('Error in getRequests:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching friend requests',
      error: error.message,
    });
  }
};

// @desc    Get list of confirmed friends
// @route   GET /api/friends
// @access  Public / Private
const getFriends = async (req, res) => {
  try {
    await connectDB();
    const currentUserId = await resolveUserId(req);

    if (!currentUserId) {
      return res.status(400).json({
        success: false,
        message: 'Current user identification is required',
      });
    }

    const friendships = await Friendship.find({
      status: 'accepted',
      $or: [{ requester: currentUserId }, { recipient: currentUserId }],
    })
      .populate('requester', 'name email image uid isLogin createdAt')
      .populate('recipient', 'name email image uid isLogin createdAt')
      .sort({ updatedAt: -1 })
      .lean();

    const friends = friendships
      .map(f => {
        const isRequester = f.requester._id.toString() === currentUserId.toString();
        const friendUser = isRequester ? f.recipient : f.requester;
        return {
          friendshipId: f._id,
          friendsSince: f.updatedAt,
          ...friendUser,
        };
      })
      .filter(Boolean);

    res.status(200).json({
      success: true,
      count: friends.length,
      data: friends,
    });
  } catch (error) {
    console.error('Error in getFriends:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching friends',
      error: error.message,
    });
  }
};

// @desc    Send a friend request
// @route   POST /api/friends/request
// @access  Public / Private
const sendFriendRequest = async (req, res) => {
  try {
    await connectDB();
    const currentUserId = await resolveUserId(req);

    if (!currentUserId) {
      return res.status(400).json({
        success: false,
        message: 'Current user identification is required',
      });
    }

    const targetId = req.body.recipientID || req.body.recipientId || req.body.targetId;
    const recipientUserId = await resolveAnyUserId(targetId);

    if (!recipientUserId) {
      return res.status(404).json({
        success: false,
        message: 'Recipient user not found',
      });
    }

    if (currentUserId.toString() === recipientUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot send a friend request to yourself',
      });
    }

    // Check existing friendship in either direction
    let existing = await Friendship.findOne({
      $or: [
        { requester: currentUserId, recipient: recipientUserId },
        { requester: recipientUserId, recipient: currentUserId },
      ],
    });

    if (existing) {
      if (existing.status === 'accepted') {
        return res.status(200).json({
          success: true,
          message: 'You are already friends with this user',
          data: existing,
        });
      }

      if (existing.status === 'pending') {
        // If other user already requested to be friends with current user, auto-accept!
        if (existing.recipient.toString() === currentUserId.toString()) {
          existing.status = 'accepted';
          await existing.save();
          return res.status(200).json({
            success: true,
            message: 'Friend request accepted!',
            data: existing,
          });
        }

        return res.status(200).json({
          success: true,
          message: 'Friend request already sent',
          data: existing,
        });
      }

      // If previously rejected, re-open request
      existing.requester = currentUserId;
      existing.recipient = recipientUserId;
      existing.status = 'pending';
      await existing.save();

      return res.status(200).json({
        success: true,
        message: 'Friend request sent',
        data: existing,
      });
    }

    // Create new friend request
    const newFriendship = await Friendship.create({
      requester: currentUserId,
      recipient: recipientUserId,
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Friend request sent successfully',
      data: newFriendship,
    });
  } catch (error) {
    console.error('Error in sendFriendRequest:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending friend request',
      error: error.message,
    });
  }
};

// @desc    Accept an incoming friend request
// @route   PUT /api/friends/request/:id/accept
// @access  Public / Private
const acceptFriendRequest = async (req, res) => {
  try {
    await connectDB();
    const currentUserId = await resolveUserId(req);
    const requestId = req.params.id;

    let friendship = null;

    if (mongoose.Types.ObjectId.isValid(requestId)) {
      friendship = await Friendship.findById(requestId);
    }

    // If not found by requestId, find by requester ID
    if (!friendship && currentUserId) {
      const otherUserId = await resolveAnyUserId(requestId);
      if (otherUserId) {
        friendship = await Friendship.findOne({
          requester: otherUserId,
          recipient: currentUserId,
          status: 'pending',
        });
      }
    }

    if (!friendship) {
      return res.status(404).json({
        success: false,
        message: 'Friend request not found',
      });
    }

    // Verify current user is recipient
    if (
      currentUserId &&
      friendship.recipient.toString() !== currentUserId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You can only accept requests sent to you',
      });
    }

    friendship.status = 'accepted';
    await friendship.save();

    res.status(200).json({
      success: true,
      message: 'Friend request accepted! You are now friends.',
      data: friendship,
    });
  } catch (error) {
    console.error('Error in acceptFriendRequest:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while accepting friend request',
      error: error.message,
    });
  }
};

// @desc    Reject / Decline an incoming friend request
// @route   PUT /api/friends/request/:id/reject
// @access  Public / Private
const rejectFriendRequest = async (req, res) => {
  try {
    await connectDB();
    const currentUserId = await resolveUserId(req);
    const requestId = req.params.id;

    let friendship = null;

    if (mongoose.Types.ObjectId.isValid(requestId)) {
      friendship = await Friendship.findById(requestId);
    }

    if (!friendship && currentUserId) {
      const otherUserId = await resolveAnyUserId(requestId);
      if (otherUserId) {
        friendship = await Friendship.findOne({
          requester: otherUserId,
          recipient: currentUserId,
          status: 'pending',
        });
      }
    }

    if (!friendship) {
      return res.status(404).json({
        success: false,
        message: 'Friend request not found',
      });
    }

    // Delete request on decline
    await Friendship.findByIdAndDelete(friendship._id);

    res.status(200).json({
      success: true,
      message: 'Friend request declined',
    });
  } catch (error) {
    console.error('Error in rejectFriendRequest:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while rejecting friend request',
      error: error.message,
    });
  }
};

// @desc    Cancel an outgoing sent friend request
// @route   DELETE /api/friends/request/:id/cancel
// @access  Public / Private
const cancelFriendRequest = async (req, res) => {
  try {
    await connectDB();
    const currentUserId = await resolveUserId(req);
    const requestId = req.params.id;

    let friendship = null;

    if (mongoose.Types.ObjectId.isValid(requestId)) {
      friendship = await Friendship.findById(requestId);
    }

    if (!friendship && currentUserId) {
      const otherUserId = await resolveAnyUserId(requestId);
      if (otherUserId) {
        friendship = await Friendship.findOne({
          requester: currentUserId,
          recipient: otherUserId,
          status: 'pending',
        });
      }
    }

    if (!friendship) {
      return res.status(404).json({
        success: false,
        message: 'Friend request not found',
      });
    }

    // Verify current user is requester
    if (
      currentUserId &&
      friendship.requester.toString() !== currentUserId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel requests you sent',
      });
    }

    await Friendship.findByIdAndDelete(friendship._id);

    res.status(200).json({
      success: true,
      message: 'Friend request canceled successfully',
    });
  } catch (error) {
    console.error('Error in cancelFriendRequest:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while canceling friend request',
      error: error.message,
    });
  }
};

// @desc    Remove / Unfriend a user
// @route   DELETE /api/friends/:friendId
// @access  Public / Private
const removeFriend = async (req, res) => {
  try {
    await connectDB();
    const currentUserId = await resolveUserId(req);
    const friendTargetId = req.params.friendId;

    if (!currentUserId) {
      return res.status(400).json({
        success: false,
        message: 'Current user identification is required',
      });
    }

    const otherUserId = await resolveAnyUserId(friendTargetId);

    if (!otherUserId) {
      return res.status(404).json({
        success: false,
        message: 'Friend user not found',
      });
    }

    await Friendship.findOneAndDelete({
      status: 'accepted',
      $or: [
        { requester: currentUserId, recipient: otherUserId },
        { requester: otherUserId, recipient: currentUserId },
      ],
    });

    res.status(200).json({
      success: true,
      message: 'Friend removed successfully',
    });
  } catch (error) {
    console.error('Error in removeFriend:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while removing friend',
      error: error.message,
    });
  }
};

// @desc    Get all friend data (suggestions, requests, friends) in one single query
// @route   GET /api/friends/all
// @access  Public / Private
const getAllFriendData = async (req, res) => {
  try {
    await connectDB();
    const currentUserId = await resolveUserId(req);

    if (!currentUserId) {
      return res.status(400).json({
        success: false,
        message: 'Current user identification is required',
      });
    }

    // Run both queries in parallel with lean() for maximum speed
    const [users, allFriendships] = await Promise.all([
      User.find({ _id: { $ne: currentUserId } })
        .select('name email image uid isLogin createdAt')
        .lean(),
      Friendship.find({
        $or: [{ requester: currentUserId }, { recipient: currentUserId }],
      })
        .populate('requester', 'name email image uid isLogin createdAt')
        .populate('recipient', 'name email image uid isLogin createdAt')
        .sort({ updatedAt: -1 })
        .lean(),
    ]);

    // 1. Process Friends & Requests in a single pass
    const friends = [];
    const receivedRequests = [];
    const sentRequests = [];
    const relationshipMap = new Map();

    for (const f of allFriendships) {
      const requesterId = (f.requester?._id || f.requester).toString();
      const recipientId = (f.recipient?._id || f.recipient).toString();
      const otherUserId =
        requesterId === currentUserId.toString() ? recipientId : requesterId;

      relationshipMap.set(otherUserId, f);

      if (f.status === 'accepted') {
        const isRequester = requesterId === currentUserId.toString();
        const friendUser = isRequester ? f.recipient : f.requester;
        friends.push({
          friendshipId: f._id,
          friendsSince: f.updatedAt,
          ...friendUser,
        });
      } else if (f.status === 'pending') {
        if (recipientId === currentUserId.toString()) {
          receivedRequests.push({
            requestId: f._id,
            createdAt: f.createdAt,
            user: f.requester,
          });
        } else {
          sentRequests.push({
            requestId: f._id,
            createdAt: f.createdAt,
            user: f.recipient,
          });
        }
      }
    }

    // 2. Process Suggestions (users not already accepted friends)
    const suggestions = [];
    for (const u of users) {
      const uIdStr = u._id.toString();
      const rel = relationshipMap.get(uIdStr);

      let friendshipStatus = 'none';
      let friendshipId = null;

      if (rel) {
        friendshipId = rel._id;
        if (rel.status === 'accepted') {
          friendshipStatus = 'friends';
        } else if (rel.status === 'pending') {
          const reqId = (rel.requester?._id || rel.requester).toString();
          friendshipStatus =
            reqId === currentUserId.toString() ? 'sent' : 'received';
        }
      }

      if (friendshipStatus !== 'friends') {
        suggestions.push({
          ...u,
          friendshipStatus,
          friendshipId,
        });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        suggestions,
        requests: {
          received: receivedRequests,
          sent: sentRequests,
        },
        friends,
      },
    });
  } catch (error) {
    console.error('Error in getAllFriendData:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching all friend data',
      error: error.message,
    });
  }
};

module.exports = {
  getSuggestions,
  getRequests,
  getFriends,
  getAllFriendData,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
  removeFriend,
};
