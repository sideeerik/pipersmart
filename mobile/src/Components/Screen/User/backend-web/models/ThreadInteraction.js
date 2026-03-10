const mongoose = require('mongoose');

const threadInteractionSchema = new mongoose.Schema(
  {
    threadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ForumThread',
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

// Unique index - one interaction per user per thread
threadInteractionSchema.index({ threadId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('ThreadInteraction', threadInteractionSchema);
