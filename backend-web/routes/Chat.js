const express = require('express');
const {
  getOrCreateChat,
  getAllChats,
  getMessages,
  sendMessage,
  markMessageAsRead,
  deleteMessage,
  editMessage,
  searchUsers,
  getUnreadCount,
  markAllMessagesRead,
  uploadChatImage,
  updateChatSettings,
  getChatSettings
} = require('../controllers/Chat');
const { isAuthenticatedUser } = require('../middlewares/auth');
const { upload } = require('../utils/Multer');

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

// Image upload for chat
router.post('/chat/upload-image', upload.single('image'), uploadChatImage);

// Chat settings
router.put('/chat/:chatId/settings', updateChatSettings);
router.get('/chat/:chatId/settings', getChatSettings);

// User search for starting chat
router.get('/chat/search/users', searchUsers);

// Unread messages count
router.get('/chat/unread-count', getUnreadCount);
// mark all as read
router.post('/chat/mark-all-read', markAllMessagesRead);

module.exports = router;
