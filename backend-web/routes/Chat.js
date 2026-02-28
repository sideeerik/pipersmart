const express = require('express');
const {
  getOrCreateChat,
  getAllChats,
  getMessages,
  sendMessage,
  markMessageAsRead,
  deleteMessage,
  editMessage,
  searchUsers
} = require('../controllers/Chat');
const { isAuthenticatedUser } = require('../middlewares/auth');

const router = express.Router();

// All chat routes require authentication
router.use(isAuthenticatedUser);

// Chat routes
router.get('/chat/chats', getAllChats);
router.get('/chat/chats/:userId', getOrCreateChat);
router.post('/chat/chats/:chatId/messages', sendMessage);
router.get('/chat/chats/:chatId/messages', getMessages);
router.put('/chat/messages/:messageId/read', markMessageAsRead);
router.delete('/chat/messages/:messageId', deleteMessage);
router.put('/chat/messages/:messageId', editMessage);

// User search for starting chat
router.get('/chat/search/users', searchUsers);

module.exports = router;
