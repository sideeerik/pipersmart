const Message = require('../models/Message');
const User = require('../models/User');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/Cloudinary');

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
        // Count unread messages in this chat for current user
        const unreadCount = await Message.countDocuments({ 
          chatId: chatKey, 
          isRead: false,
          sender: { $ne: userId } // Only messages from the other user
        });

        chats.push({
          _id: chatKey,
          participants: [
            { _id: userId, name: currentUser.name, email: currentUser.email, avatar: currentUser.avatar },
            { _id: otherUserId, name: otherUser.name, email: otherUser.email, avatar: otherUser.avatar }
          ],
          lastMessage: lastMsg.content,
          lastMessageBy: lastMsg.sender,
          lastMessageTime: lastMsg.createdAt,
          unreadCount: unreadCount, // NEW: unread messages in this chat
        });
      }
    }

    chats.sort((a, b) => b.lastMessageTime - a.lastMessageTime);
    res.status(200).json({
      success: true,
      data: chats,
    });
  } catch (error) {
    console.error('❌ Error fetching chats:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Send message (with optional image attachment)
exports.sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content } = req.body;
    const senderId = req.user._id;

    if (!content || !content.trim()) {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Message content or image is required' });
      }
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
      recipientId = chatId;
    }

    // Verify friendship
    const sender = await User.findById(senderId);
    if (!sender.friends.includes(recipientId)) {
      return res.status(403).json({ success: false, message: 'You can only chat with friends' });
    }

    // Create normalized chatKey
    const chatKey = [senderIdStr, recipientId].sort().join('-');

    // Handle image upload if present
    let attachment = null;
    if (req.file) {
      try {
        const fs = require('fs');
        const fileBuffer = fs.readFileSync(req.file.path);
        const b64 = fileBuffer.toString('base64');
        const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
        
        const uploadResult = await uploadToCloudinary(dataURI, 'pipersmart/chat_images');
        
        // Delete temp file after upload
        fs.unlinkSync(req.file.path);
        
        attachment = {
          url: uploadResult.url,
          type: req.file.mimetype,
          cloudinaryId: uploadResult.public_id,
        };
      } catch (uploadError) {
        console.error('❌ Image upload failed:', uploadError);
        // Continue without image if upload fails
      }
    }

    // Create message (content can be empty if image is provided)
    const messageData = {
      chatId: chatKey,
      sender: senderId,
      content: content?.trim() || '', // Empty string if no content
    };

    if (attachment) {
      messageData.attachment = attachment;
    }

    const message = await Message.create(messageData);
    const populatedMessage = await message.populate('sender', 'name email avatar');

    console.log(`✅ Message sent:`, message._id);
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

    // Populate reactions with user info
    for (let msg of messages) {
      if (msg.reactions && msg.reactions.length > 0) {
        for (let i = 0; i < msg.reactions.length; i++) {
          const reactionUser = await User.findById(msg.reactions[i].userId).select('name avatar');
          msg.reactions[i].userId = reactionUser;
        }
      }
    }

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

// Add or update reaction on message
exports.reactToMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id;

    const validEmojis = ['like', 'heart', 'haha', 'angry', 'sad'];
    if (!validEmojis.includes(emoji)) {
      return res.status(400).json({ success: false, message: 'Invalid emoji' });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    // Check if user already reacted (find existing reaction from this user)
    const existingReactionIndex = message.reactions.findIndex(
      r => r.userId.toString() === userId.toString()
    );

    if (existingReactionIndex !== -1) {
      // User already has a reaction - update it
      message.reactions[existingReactionIndex].emoji = emoji;
    } else {
      // New reaction from this user
      message.reactions.push({
        userId: userId,
        emoji: emoji,
      });
    }

    await message.save();
    
    // Populate the message with sender info and reaction user info
    await message.populate('sender', 'name email avatar');
    
    // Manually populate reactions with user info
    if (message.reactions && message.reactions.length > 0) {
      for (let i = 0; i < message.reactions.length; i++) {
        const reactionUser = await User.findById(message.reactions[i].userId).select('name avatar');
        message.reactions[i].userId = reactionUser;
      }
    }

    console.log(`✅ Reaction ${emoji} added to message ${messageId}`);
    res.status(200).json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error('❌ Error reacting to message:', error);
    console.error('   Details:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Remove reaction from message
exports.removeReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    // Remove this user's reaction
    message.reactions = message.reactions.filter(
      r => r.userId.toString() !== userId.toString()
    );

    await message.save();
    
    // Populate remaining reactions with user info
    if (message.reactions && message.reactions.length > 0) {
      for (let i = 0; i < message.reactions.length; i++) {
        const reactionUser = await User.findById(message.reactions[i].userId).select('name avatar');
        message.reactions[i].userId = reactionUser;
      }
    }
    
    await message.populate('sender', 'name email avatar');

    console.log('✅ Reaction removed from message');
    res.status(200).json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error('❌ Error removing reaction:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
