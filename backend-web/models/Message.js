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
    imageUrl: {
      type: String,
      default: null,
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
    isDeleted: {
      type: Boolean,
      default: false,
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
  },
  { timestamps: true }
);

// Index for efficient querying
messageSchema.index({ chatId: 1, createdAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });
messageSchema.index({ chatId: 1, isRead: 1 });

module.exports = mongoose.model('Message', messageSchema);
