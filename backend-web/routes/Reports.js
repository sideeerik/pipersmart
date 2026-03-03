const express = require('express');
const router = express.Router();
const { isAuthenticatedUser } = require('../middlewares/auth');
const {
  getBungaAnalysisReports,
  getLeafAnalysisReports,
  getDashboardStats,
  filterBungaAnalyses,
  filterLeafAnalyses
} = require('../controllers/ReportsController');

// Middleware: Check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: '❌ Access denied. Admin only.'
    });
  }
  next();
};

// ==================== REPORTS ENDPOINTS ====================

/**
 * GET /api/v1/reports/dashboard
 * Get dashboard overview statistics
 * Query params: none
 */
router.get('/dashboard', isAuthenticatedUser, isAdmin, getDashboardStats);

/**
 * GET /api/v1/reports/bunga
 * Get all Bunga Analysis reports with pagination
 * Query params: page, limit, sortBy, sortOrder
 */
router.get('/bunga', isAuthenticatedUser, isAdmin, getBungaAnalysisReports);

/**
 * GET /api/v1/reports/leaf
 * Get all Leaf Analysis reports with pagination
 * Query params: page, limit, sortBy, sortOrder
 */
router.get('/leaf', isAuthenticatedUser, isAdmin, getLeafAnalysisReports);

/**
 * GET /api/v1/reports/bunga/filter
 * Filter Bunga Analysis by criteria
 * Query params: ripeness, marketGrade, healthClass, minConfidence, maxConfidence, page, limit
 */
router.get('/bunga/filter', isAuthenticatedUser, isAdmin, filterBungaAnalyses);

/**
 * GET /api/v1/reports/leaf/filter
 * Filter Leaf Analysis by criteria
 * Query params: disease, minConfidence, maxConfidence, page, limit
 */
router.get('/leaf/filter', isAuthenticatedUser, isAdmin, filterLeafAnalyses);

module.exports = router;
