const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  reply: {
    type: String,
    required: true
  },
  replyID: {
    type: String,
    required: true,
    unique: true
  },
  commentID: {
    type: String,
    required: true
  },
  userID: {
    type: String,
    required: true
  },
  userImage: {
    type: String,
    required: true
  },
  userProfileName: {
    type: String,
    required: true
  },
  replyCreated: {
    type: Date,
    default: Date.now
  }
});

const commentSchema = new mongoose.Schema({
  comment: {
    type: String,
    required: true
  },
  commentCreated: {
    type: Date,
    default: Date.now
  },
  commentID: {
    type: String,
    required: true,
    unique: true
  },
  postID: {
    type: String,
    required: true
  },
  userID: {
    type: String,
    required: true
  },
  userImage: {
    type: String,
    required: true
  },
  userProfileName: {
    type: String,
    required: true
  },
  replies: [replySchema]
});

const postSchema = new mongoose.Schema({
  postID: {
    type: String,
    required: true,
    unique: true
  },
  userID: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userImage: {
    type: String,
    required: true
  },
  postDetail: {
    type: String,
    required: true
  },
  postImage: {
    type: String,
    default: ''
  },
  dateCreated: {
    type: Date,
    default: Date.now
  },
  likes: [{
    type: String // Array of userIDs who liked the post
  }],
  comments: [commentSchema]
}, {
  timestamps: true
});

// Virtual for likes count
postSchema.virtual('likesCount').get(function() {
  return this.likes.length;
});

// Virtual for comments count
postSchema.virtual('commentsCount').get(function() {
  return this.comments.length;
});

// Virtual for replies count on comments
commentSchema.virtual('repliesCount').get(function() {
  return this.replies.length;
});

// Ensure virtuals are included in JSON
postSchema.set('toJSON', { virtuals: true });
postSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Post', postSchema);