const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    chatId: {
      type: String,
      required: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
    },
    // Image attachment (optional)
    attachment: {
      url: String,
      type: {
        type: String, // 'image/jpeg', 'image/png', etc.
      },
      cloudinaryId: String, // For deletion later
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
    },
    // Reactions: each user can only have 1 reaction per message
    // { userId, emoji: 'like' | 'heart' | 'haha' | 'angry' | 'sad' }
    reactions: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        emoji: {
          type: String,
          enum: ['like', 'heart', 'haha', 'angry', 'sad'],
        },
        _id: false, // Prevent auto _id for subdocs
      }
    ],
  },
  { timestamps: true }
);

// Index for efficient querying
messageSchema.index({ chatId: 1, createdAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });
messageSchema.index({ chatId: 1, isRead: 1 });

module.exports = mongoose.model('Message', messageSchema);
