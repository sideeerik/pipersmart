const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: [
        'disease_alert',
        'bunga_ripeness',
        'weather_alert',
        'forum_reply',
        'post_like',
        'new_message',
        'friend_request',
        'friend_post',
        'system',
        'account',
        'admin_broadcast'
      ],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    severity: {
      type: String,
      enum: ['info', 'warning', 'critical'],
      default: 'info'
    },
    read: {
      type: Boolean,
      default: false
    },
    actionUrl: {
      type: String,
      default: null
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 2592000 // Auto-delete after 30 days
    }
  },
  {
    timestamps: false
  }
);

// Index for efficient querying
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
