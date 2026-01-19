const mongoose = require('mongoose');

// Recursive reply schema for infinite nesting
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
  parentReplyID: {
    type: String,
    default: null // null if it's a direct reply to comment
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
  },
  replies: [] // Will be populated recursively
});

// Allow recursive nesting
replySchema.add({ replies: [replySchema] });

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
    type: String
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

// Helper function to count all replies recursively
function countReplies(replies) {
  let count = replies.length;
  replies.forEach(reply => {
    if (reply.replies && reply.replies.length > 0) {
      count += countReplies(reply.replies);
    }
  });
  return count;
}

// Virtual for total replies count on comments
commentSchema.virtual('repliesCount').get(function() {
  return countReplies(this.replies);
});

// Ensure virtuals are included in JSON
postSchema.set('toJSON', { virtuals: true });
postSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Post', postSchema);