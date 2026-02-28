const express = require('express');
const {
  getOrCreateChat,
  getAllChats,
  sendMessage,
  getMessages,
  markMessageAsRead,
  deleteMessage,
  editMessage,
  searchUsers,
} = require('../controllers/Chat');

const { isAuthenticatedUser } = require('../middlewares/auth');

const router = express.Router();

// Chat routes
router.post('/or-create/:userId', isAuthenticatedUser, getOrCreateChat);
router.get('/all', isAuthenticatedUser, getAllChats);

// Message routes
router.post('/:chatId/send', isAuthenticatedUser, sendMessage);
router.get('/:chatId/messages', isAuthenticatedUser, getMessages);
router.put('/:messageId/read', isAuthenticatedUser, markMessageAsRead);
router.delete('/:messageId', isAuthenticatedUser, deleteMessage);
router.put('/:messageId', isAuthenticatedUser, editMessage);

// User search for starting chat
router.get('/search/users', isAuthenticatedUser, searchUsers);

module.exports = router;
