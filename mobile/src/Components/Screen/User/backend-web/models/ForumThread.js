const mongoose = require('mongoose');

const forumThreadSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a thread title'],
      trim: true,
      maxLength: [200, 'Thread title cannot exceed 200 characters']
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      trim: true
    },
    category: {
      type: String,
      enum: ['Disease ID', 'Best Practices', 'Regional Tips', 'Equipment', 'Success Stories', 'General'],
      default: 'General'
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
    views: {
      type: Number,
      default: 0
    },
    repliesCount: {
      type: Number,
      default: 0
    },
    lastActivity: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Text index for search functionality
forumThreadSchema.index({ title: 'text', description: 'text' });

// Index for filtering
forumThreadSchema.index({ status: 1, category: 1, lastActivity: -1 });

module.exports = mongoose.model('ForumThread', forumThreadSchema);
