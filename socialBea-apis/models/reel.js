const mongoose = require('mongoose');

// Reply schema for reel comments
const reelReplySchema = new mongoose.Schema(
  {
    replyID: {
      type: String,
      required: true,
    },
    parentReplyID: {
      type: String,
      default: null,
    },
    userID: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userImage: {
      type: String,
      default: '',
    },
    reply: {
      type: String,
      required: true,
    },
    replyCreated: {
      type: Date,
      default: Date.now,
    },
    likes: [
      {
        type: String,
      },
    ],
  },
  {
    autoIndex: false,
  }
);

// Comment schema for reel
const reelCommentSchema = new mongoose.Schema(
  {
    commentID: {
      type: String,
      required: true,
    },
    reelID: {
      type: String,
      required: true,
    },
    userID: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userImage: {
      type: String,
      default: '',
    },
    comment: {
      type: String,
      required: true,
    },
    commentCreated: {
      type: Date,
      default: Date.now,
    },
    likes: [
      {
        type: String,
      },
    ],
    replies: [reelReplySchema],
  },
  {
    autoIndex: false,
  }
);

// Virtual for comment replies count
reelCommentSchema.virtual('repliesCount').get(function () {
  return this.replies ? this.replies.length : 0;
});

// Main Reel Schema
const reelSchema = new mongoose.Schema(
  {
    reelID: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userID: {
      type: String,
      required: true,
      index: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userImage: {
      type: String,
      default: '',
    },
    videoUrl: {
      type: String,
      required: true,
    },
    thumbnailUrl: {
      type: String,
      default: '',
    },
    caption: {
      type: String,
      default: '',
    },
    tags: [
      {
        type: String,
      },
    ],
    audioTitle: {
      type: String,
      default: 'Original Audio',
    },
    duration: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    shares: {
      type: Number,
      default: 0,
    },
    likes: [
      {
        type: String,
      },
    ],
    comments: [reelCommentSchema],
  },
  {
    timestamps: true,
    autoIndex: false,
  }
);

// Virtual for likes count
reelSchema.virtual('likesCount').get(function () {
  return this.likes ? this.likes.length : 0;
});

// Virtual for comments count
reelSchema.virtual('commentsCount').get(function () {
  return this.comments ? this.comments.length : 0;
});

reelSchema.set('toJSON', { virtuals: true });
reelSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Reel', reelSchema);
