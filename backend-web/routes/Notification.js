const express = require('express');
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification
} = require('../controllers/Notification');
const { isAuthenticatedUser } = require('../middlewares/auth');

const router = express.Router();

// Protected routes
router.get('/notifications', isAuthenticatedUser, getNotifications);
router.get('/notifications/unread-count', isAuthenticatedUser, getUnreadCount);
router.put('/notifications/:id/read', isAuthenticatedUser, markAsRead);
router.put('/notifications/mark-all-read', isAuthenticatedUser, markAllAsRead);
router.delete('/notifications/:id', isAuthenticatedUser, deleteNotification);

// Admin route (create notification)
router.post('/notifications', isAuthenticatedUser, createNotification);

module.exports = router;
