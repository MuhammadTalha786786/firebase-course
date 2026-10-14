const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    messageID: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    conversationId: {
      type: String,
      required: true,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
    timeofsend: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for fast query of conversation threads
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
