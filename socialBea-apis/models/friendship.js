const mongoose = require('mongoose');

const friendshipSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate friendships between same two users
friendshipSchema.index({ requester: 1, recipient: 1 });
friendshipSchema.index({ recipient: 1, status: 1 });
friendshipSchema.index({ requester: 1, status: 1 });

module.exports = mongoose.model('Friendship', friendshipSchema);
