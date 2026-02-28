const mongoose = require('mongoose');

const forumPostSchema = new mongoose.Schema(
  {
    threadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ForumThread',
      required: true
    },
    content: {
      type: String,
      required: [true, 'Please provide post content'],
      trim: true
    },
    images: [
      {
        url: String,
        publicId: String
      }
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'published'
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    likesCount: {
      type: Number,
      default: 0
    },
    isEdited: {
      type: Boolean,
      default: false
    },
    editedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Index for filtering
forumPostSchema.index({ threadId: 1, status: 1, createdAt: 1 });

module.exports = mongoose.model('ForumPost', forumPostSchema);
