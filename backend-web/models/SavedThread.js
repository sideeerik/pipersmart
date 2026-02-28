const mongoose = require('mongoose');

const savedThreadSchema = new mongoose.Schema(
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
    }
  },
  {
    timestamps: true
  }
);

// Unique index - one save per user per thread
savedThreadSchema.index({ threadId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('SavedThread', savedThreadSchema);
