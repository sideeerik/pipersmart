const express = require('express');
const { getRecentActivities, getRecentActivitiesLimited } = require('../controllers/recentActivitiesController');
const { isAuthenticatedUser } = require('../middlewares/auth');

const router = express.Router();

// ================= RECENT ACTIVITIES =================

// Get all recent activities with pagination
router.get('/all', isAuthenticatedUser, getRecentActivities);

// Get recent activities limited (for HomeScreen - default 3)
router.get('/limited', isAuthenticatedUser, getRecentActivitiesLimited);

module.exports = router;
