const mongoose = require('mongoose');

const postInteractionSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ForumPost',
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    interactionType: {
      type: String,
      enum: ['interested', 'uninterested', 'none'],
      default: 'none'
    }
  },
  {
    timestamps: true
  }
);

// Unique index - one interaction per user per post
postInteractionSchema.index({ postId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('PostInteraction', postInteractionSchema);
