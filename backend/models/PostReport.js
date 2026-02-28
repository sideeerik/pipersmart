const mongoose = require('mongoose');

const postReportSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ForumPost',
      required: true
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reason: {
      type: String,
      required: [true, 'Please provide a reason for the report'],
      trim: true,
      maxLength: [500, 'Report reason cannot exceed 500 characters']
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'dismissed', 'action-taken'],
      default: 'pending'
    },
    adminNotes: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Index for filtering
postReportSchema.index({ postId: 1, status: 1 });
postReportSchema.index({ reportedBy: 1 });

module.exports = mongoose.model('PostReport', postReportSchema);
