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
  reactToMessage,
  removeReaction,
} = require('../controllers/Chat');

const { isAuthenticatedUser } = require('../middlewares/auth');
const { upload } = require('../utils/Multer');

const router = express.Router();

// Chat routes
router.post('/or-create/:userId', isAuthenticatedUser, getOrCreateChat);
router.get('/all', isAuthenticatedUser, getAllChats);

// Message routes
router.post('/:chatId/send', isAuthenticatedUser, upload.single('image'), sendMessage);
router.get('/:chatId/messages', isAuthenticatedUser, getMessages);
router.put('/:messageId/read', isAuthenticatedUser, markMessageAsRead);
router.delete('/:messageId', isAuthenticatedUser, deleteMessage);
router.put('/:messageId', isAuthenticatedUser, editMessage);

// Reaction routes
router.post('/:messageId/react', isAuthenticatedUser, reactToMessage);
router.delete('/:messageId/react', isAuthenticatedUser, removeReaction);

// User search for starting chat
router.get('/search/users', isAuthenticatedUser, searchUsers);

module.exports = router;
