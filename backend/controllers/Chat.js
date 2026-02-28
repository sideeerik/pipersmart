const Message = require('../models/Message');
const User = require('../models/User');

// Get or create chat between two users (only if friends)
exports.getOrCreateChat = async (req, res) => {
  try {
    const { userId: otherUserId } = req.params;
    const currentUserId = req.user._id;

    if (currentUserId.toString() === otherUserId) {
      return res.status(400).json({ success: false, message: 'Cannot chat with yourself' });
    }

    // Check if users are friends
    const currentUser = await User.findById(currentUserId);
    const otherUser = await User.findById(otherUserId);

    if (!otherUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!currentUser.friends.includes(otherUserId)) {
      return res.status(403).json({ success: false, message: 'You can only chat with friends' });
    }

    // Get last message between users
    const chatKey = [currentUserId, otherUserId].sort().join('-');
    const lastMessage = await Message.findOne({
      chatId: chatKey
    }).sort({ createdAt: -1 });

    // Create virtual chat object
    const chat = {
      _id: chatKey,
      participants: [
        { _id: currentUserId, name: currentUser.name, email: currentUser.email, avatar: currentUser.avatar },
        { _id: otherUserId, name: otherUser.name, email: otherUser.email, avatar: otherUser.avatar }
      ],
      lastMessage: lastMessage?.content || null,
      lastMessageBy: lastMessage?.sender || null,
      lastMessageTime: lastMessage?.createdAt || new Date()
    };

    console.log('✅ Chat retrieved:', chat._id);
    res.status(200).json({
      success: true,
      data: chat,
    });
  } catch (error) {
    console.error('❌ Error getting/creating chat:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all chats for user
exports.getAllChats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Use regex to find all messages where chatId contains this userId
    const userIdStr = userId.toString();
    const chatRegex = new RegExp(userIdStr);
    const messages = await Message.find({
      $or: [
        { sender: userId },
        { chatId: chatRegex }
      ]
    })
      .populate('sender', 'name email avatar')
      .sort({ createdAt: -1 });

    // Group by unique chat partners
    const chatMap = new Map();
    messages.forEach(msg => {
      // Extract the other user's ID from the chatId string
      const [user1, user2] = msg.chatId.split('-');
      const otherUserId = user1 === userId.toString() ? user2 : user1;
      const chatKey = msg.chatId; // Use the chatId directly as it's already normalized
      if (!chatMap.has(chatKey)) {
        chatMap.set(chatKey, msg);
      }
    });

    // Build chat list
    const chats = [];
    for (const [chatKey, lastMsg] of chatMap) {
      const [user1, user2] = chatKey.split('-');
      const otherUserId = user1 === userId.toString() ? user2 : user1;
      const otherUser = await User.findById(otherUserId);
      const currentUser = await User.findById(userId);

      if (otherUser) {
        chats.push({
          _id: chatKey,
          participants: [
            { _id: userId, name: currentUser.name, email: currentUser.email, avatar: currentUser.avatar },
            { _id: otherUserId, name: otherUser.name, email: otherUser.email, avatar: otherUser.avatar }
          ],
          lastMessage: lastMsg.content,
          lastMessageBy: lastMsg.sender,
          lastMessageTime: lastMsg.createdAt
        });
      }
    }

    chats.sort((a, b) => b.lastMessageTime - a.lastMessageTime);
    console.log(`✅ Fetched ${chats.length} chats`);
    res.status(200).json({
      success: true,
      data: chats,
    });
  } catch (error) {
    console.error('❌ Error fetching chats:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Send message
exports.sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content } = req.body;
    const senderId = req.user._id;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }

    // chatId is in format: userId1-userId2
    // Extract the other user's ID
    let recipientId;
    const senderIdStr = senderId.toString();
    
    if (chatId.includes('-')) {
      const parts = chatId.split('-');
      // Find which part is NOT the sender
      recipientId = parts[0] === senderIdStr ? parts[1] : parts[0];
    } else {
      // Shouldn't happen for web, but handle mobile format
      recipientId = chatId;
    }

    // Verify friendship
    const sender = await User.findById(senderId);
    if (!sender.friends.includes(recipientId)) {
      return res.status(403).json({ success: false, message: 'You can only chat with friends' });
    }

    // Create normalized chatKey (should match the passed chatId)
    const chatKey = [senderIdStr, recipientId].sort().join('-');

    const message = await Message.create({
      chatId: chatKey,
      sender: senderId,
      content: content,
    });

    const populatedMessage = await message.populate('sender', 'name email avatar');

    console.log('✅ Message sent:', message._id);
    res.status(201).json({
      success: true,
      data: populatedMessage,
    });
  } catch (error) {
    console.error('❌ Error sending message:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get messages in chat
exports.getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;

    // chatId is already in normalized format: userId1-userId2
    const messages = await Message.find({ chatId: chatId })
      .populate('sender', 'name email avatar')
      .sort({ createdAt: 1 });

    console.log(`✅ Fetched ${messages.length} messages from chatId: ${chatId}`);
    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error('❌ Error fetching messages:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark message as read
exports.markMessageAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findByIdAndUpdate(
      messageId,
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    res.status(200).json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error('❌ Error marking message as read:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete message
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    if (message.sender.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this message' });
    }

    await Message.findByIdAndDelete(messageId);

    console.log('✅ Message deleted:', messageId);
    res.status(200).json({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error) {
    console.error('❌ Error deleting message:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Edit message
exports.editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    if (message.sender.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this message' });
    }

    message.content = content;
    message.isEdited = true;
    message.editedAt = new Date();
    await message.save();

    const populatedMessage = await message.populate('sender', 'name email avatar');

    console.log('✅ Message edited:', messageId);
    res.status(200).json({
      success: true,
      data: populatedMessage,
    });
  } catch (error) {
    console.error('❌ Error editing message:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Search users to start chat
exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const userId = req.user._id;

    if (!query || query.length < 2) {
      return res.status(400).json({ success: false, message: 'Query must be at least 2 characters' });
    }

    const users = await User.find({
      _id: { $ne: userId },
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    })
      .select('_id name email avatar')
      .limit(10);

    console.log(`✅ Found ${users.length} users`);
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error('❌ Error searching users:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
