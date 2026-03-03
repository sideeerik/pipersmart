const express = require('express');
const router = express.Router();
const { isAuthenticatedUser } = require('../middlewares/auth');
const {
  getAllReportedPosts,
  getReportedPostDetail,
  deleteReportedPost,
  dismissReport,
  getReportedPostsStats,
  markAsReviewed
} = require('../controllers/PostReportedController');

// Middleware: Check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    console.warn(`❌ Non-admin user attempted to access admin endpoint: ${req.originalUrl}`);
    return res.status(403).json({
      success: false,
      message: '❌ Access denied. Admin only.'
    });
  }
  next();
};

// ==================== REPORTED POSTS ENDPOINTS ====================

/**
 * GET /api/v1/reports/posts
 * Get all reported posts with filtering and pagination
 * Query params: page, limit, status, sortBy, sortOrder
 */
router.get('/posts', isAuthenticatedUser, isAdmin, getAllReportedPosts);

/**
 * GET /api/v1/reports/posts/stats
 * Get statistics about reported posts
 */
router.get('/posts/stats', isAuthenticatedUser, isAdmin, getReportedPostsStats);

/**
 * GET /api/v1/reports/posts/:reportId
 * Get detailed information about a single report
 */
router.get('/posts/:reportId', isAuthenticatedUser, isAdmin, getReportedPostDetail);

/**
 * POST /api/v1/reports/posts/:reportId/delete
 * Admin deletes the reported post
 * Body: { adminNotes?: string }
 */
router.post('/posts/:reportId/delete', isAuthenticatedUser, isAdmin, deleteReportedPost);

/**
 * POST /api/v1/reports/posts/:reportId/dismiss
 * Admin dismisses the report without deleting the post
 * Body: { adminNotes?: string }
 */
router.post('/posts/:reportId/dismiss', isAuthenticatedUser, isAdmin, dismissReport);

/**
 * POST /api/v1/reports/posts/:reportId/reviewed
 * Admin marks the report as reviewed
 */
router.post('/posts/:reportId/reviewed', isAuthenticatedUser, isAdmin, markAsReviewed);

module.exports = router;
