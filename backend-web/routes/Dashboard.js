const express = require('express');
const { isAuthenticatedUser } = require('../middlewares/auth');
const {
  getDashboardStats,
  getUserGrowth,
  getAnalysisDistribution,
  getTopDiseases,
  getRecentActivity,
  getWeeklyActivity,
  getUserOverview,
  getSystemHealth,
  getCompleteDashboard
} = require('../controllers/DashboardController');

const router = express.Router();

// Protected routes - Require admin authentication
router.get('/stats', isAuthenticatedUser, getDashboardStats);
router.get('/user-growth', isAuthenticatedUser, getUserGrowth);
router.get('/analysis-distribution', isAuthenticatedUser, getAnalysisDistribution);
router.get('/top-diseases', isAuthenticatedUser, getTopDiseases);
router.get('/recent-activity', isAuthenticatedUser, getRecentActivity);
router.get('/weekly-activity', isAuthenticatedUser, getWeeklyActivity);
router.get('/user-overview', isAuthenticatedUser, getUserOverview);
router.get('/system-health', isAuthenticatedUser, getSystemHealth);
router.get('/complete', isAuthenticatedUser, getCompleteDashboard);

module.exports = router;
