const mongoose = require('mongoose');

const savedPostSchema = new mongoose.Schema(
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
    }
  },
  {
    timestamps: true
  }
);

// Unique index - one save per user per post
savedPostSchema.index({ postId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('SavedPost', savedPostSchema);
