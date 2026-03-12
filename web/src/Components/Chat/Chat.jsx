import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import axios from 'axios';
import { MdPhotoCamera } from 'react-icons/md';
import './Chat.css';

const Chat = forwardRef((props, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [replyingTo, setReplyingTo] = useState(null);
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [chatBgColor, setChatBgColor] = useState(null);
  const [chatBgImage, setChatBgImage] = useState(null);
  const [chatNickname, setChatNickname] = useState('');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const bgImageInputRef = useRef(null);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  // Expose method to open chat with a friend
  useImperativeHandle(ref, () => ({
    openChatWithFriend: (friendData) => {
      openChatWithFriend(friendData);
    }
  }));

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        setCurrentUser(JSON.parse(user));
      } catch (error) {
        console.error('Error parsing user:', error);
      }
    }
    // reset unread count immediately on load
    markAllRead();
  }, []);

  // helper to refresh badge number
  const refreshUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${BACKEND_URL}/api/v1/chat/unread-count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('🔄 unread count response', response.data);
      setUnreadCount(response.data?.data?.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const markAllRead = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await axios.post(`${BACKEND_URL}/api/v1/chat/mark-all-read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('🧹 markAllRead', res.data);
      setUnreadCount(res.data?.data?.unreadCount || 0);
      // update chat list so that individual items no longer show unread styling
      fetchChats();
    } catch (err) {
      console.error('Error marking all read', err);
      if (err.response) {
        console.error('status', err.response.status, err.response.data);
        if (err.response.status === 404) {
          // route might not exist yet; clear badge anyway
          setUnreadCount(0);
        }
      }
    }
  };

  // Fetch unread count periodically
  useEffect(() => {
    refreshUnreadCount();
    const interval = setInterval(refreshUnreadCount, 2000);
    return () => clearInterval(interval);
  }, [BACKEND_URL]);

  useEffect(() => {
    if (isOpen) {
      fetchChats();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages();
      // when a conversation is selected, mark any unread messages in it as read
      markUnreadInCurrentChat(selectedChat);
      
      // Load chat settings from backend
      const loadChatSettings = async () => {
        try {
          const response = await axios.get(
            `${BACKEND_URL}/api/v1/chat/${selectedChat._id}/settings`,
            {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            }
          );
          const settings = response.data.data || {};
          setChatBgColor(settings.bgColor || null);
          setChatBgImage(settings.bgImage || null);
          setChatNickname(settings.nickname || '');
        } catch (error) {
          console.log('Note: Chat settings not available yet');
        }
      };

      // Debug: Log avatar data
      const otherUser = selectedChat.participants?.find(p => p._id !== currentUser._id);
      console.log('👤 Chat loaded with user:', otherUser?.name, 'Avatar:', otherUser?.avatar);
      
      loadChatSettings();
    }
  }, [selectedChat, BACKEND_URL]);

  // Real-time message polling - fetch new messages every 2 seconds
  useEffect(() => {
    if (!selectedChat) return;

    const pollMessages = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/v1/chat/chats/${selectedChat._id}/messages`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        const msgs = response.data.data || [];
        setMessages(msgs);
        await markUnreadMsgs(msgs);
      } catch (error) {
        console.error('Error polling messages:', error);
      }
    };

    // Poll every 2 seconds for new messages
    const interval = setInterval(pollMessages, 2000);
    return () => clearInterval(interval);
  }, [selectedChat, BACKEND_URL]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/v1/chat/chats`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const chatList = response.data.data || [];
      setChats(chatList);

      // update global badge based on sum of unread counts per chat
      const totalUnread = chatList.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
      setUnreadCount(totalUnread);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/v1/chat/chats/${selectedChat._id}/messages`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const msgs = response.data.data || [];
      setMessages(msgs);
      // mark any unread messages we just fetched
      await markUnreadMsgs(msgs);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if ((!messageInput.trim() && selectedImages.length === 0) || !selectedChat) return;

    try {
      setUploading(true);
      const uploadedImageUrls = [];

      // Upload all selected images
      for (const imageFile of selectedImages) {
        try {
          const formData = new FormData();
          formData.append('image', imageFile);

          const uploadResponse = await axios.post(
            `${BACKEND_URL}/api/v1/chat/upload-image`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'multipart/form-data'
              }
            }
          );
          uploadedImageUrls.push(uploadResponse.data.data.imageUrl);
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          alert(`Failed to upload image: ${imageFile.name}`);
        }
      }

      // Send message(s) with uploaded images
      // If multiple images, send one message with all images
      if (uploadedImageUrls.length > 0) {
        for (const imageUrl of uploadedImageUrls) {
          const messageData = { 
            content: messageInput || '',
            imageUrl: imageUrl
          };
          if (replyingTo) {
            messageData.replyTo = replyingTo._id;
          }

          await axios.post(
            `${BACKEND_URL}/api/v1/chat/chats/${selectedChat._id}/messages`,
            messageData,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
              }
            }
          );
        }
      } else if (messageInput.trim()) {
        // If no images, just send the text message
        const messageData = { content: messageInput };
        if (replyingTo) {
          messageData.replyTo = replyingTo._id;
        }
        
        await axios.post(
          `${BACKEND_URL}/api/v1/chat/chats/${selectedChat._id}/messages`,
          messageData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
      }

      setMessageInput('');
      setSelectedImages([]);
      setReplyingTo(null);
      await fetchMessages();
      await fetchChats();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Delete this message?')) return;
    
    try {
      await axios.delete(
        `${BACKEND_URL}/api/v1/chat/messages/${messageId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      fetchMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message');
    }
  };

  const handleReplyToMessage = (message) => {
    setReplyingTo(message);
    setHoveredMessageId(null);
  };

  const handleCloseChat = () => {
    setSelectedChat(null);
    setMessages([]);
    setMessageInput('');
    setSelectedImages([]);
    setShowSettings(false);
  };

  const saveChatSettings = async (bgColor = chatBgColor, bgImage = chatBgImage, nickname = chatNickname) => {
    if (!selectedChat) return;
    try {
      await axios.put(
        `${BACKEND_URL}/api/v1/chat/${selectedChat._id}/settings`,
        {
          bgColor: bgColor,
          bgImage: bgImage,
          nickname: nickname
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      console.log('✅ Chat settings saved to backend');
    } catch (error) {
      console.error('Error saving chat settings:', error);
    }
  };

  const handleBgColorChange = (color) => {
    setChatBgColor(color);
    saveChatSettings(color, chatBgImage, chatNickname);
  };

  const handleBgImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const imageData = event.target?.result;
        
        // Upload to Cloudinary via backend
        try {
          const formData = new FormData();
          formData.append('image', file);
          
          const uploadResponse = await axios.post(
            `${BACKEND_URL}/api/v1/chat/upload-image`,
            formData,
            {
              headers: { 
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'multipart/form-data'
              }
            }
          );
          
          const imageUrl = uploadResponse.data.data.imageUrl;
          setChatBgImage(imageUrl);
          saveChatSettings(chatBgColor, imageUrl, chatNickname);
        } catch (error) {
          console.error('Error uploading background image:', error);
          // Fallback to base64
          setChatBgImage(imageData);
          saveChatSettings(chatBgColor, imageData, chatNickname);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNicknameChange = (newNickname) => {
    setChatNickname(newNickname);
    saveChatSettings(chatBgColor, chatBgImage, newNickname);
  };

  const handleImageSelect = (e) => {
    const files = e.target.files;
    if (files) {
      const newImages = [];
      for (let file of files) {
        if (file.type.startsWith('image/')) {
          newImages.push(file);
        }
      }
      setSelectedImages(prev => [...prev, ...newImages]);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  // helper which accepts an array of messages and marks any that are unread and sent by others
  const markUnreadMsgs = async (msgs) => {
    if (!msgs || msgs.length === 0 || !currentUser) return;
    const myId = currentUser._id?.toString();
    const token = localStorage.getItem('token');
    const unreadMsgs = msgs.filter(m => {
      const senderId = typeof m.sender === 'object' ? m.sender._id?.toString() : m.sender?.toString();
      return !m.isRead && senderId && senderId !== myId;
    });
    if (unreadMsgs.length === 0) return;
    console.log('🔔 markUnreadMsgs will update', unreadMsgs.map(m=>m._id));
    for (const m of unreadMsgs) {
      try {
        await axios.put(
          `${BACKEND_URL}/api/v1/chat/messages/${m._id}/read`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        console.error('Error marking msg read', m._id, err);
      }
    }
    // adjust local badge
    setUnreadCount(prev => Math.max(0, prev - unreadMsgs.length));
    await refreshUnreadCount();
    // refresh overall chat list to pick up updated unread flags
    fetchChats();
  };

  // when selecting/chat opening we can call this helper with the current chat's messages
  const markUnreadInCurrentChat = async (chat) => {
    if (!chat) return;
    try {
      const res = await axios.get(`${BACKEND_URL}/api/v1/chat/chats/${chat._id}/messages`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const msgs = res.data.data || [];
      await markUnreadMsgs(msgs);
    } catch (err) {
      console.error('Error fetching msgs for markUnreadInCurrentChat', err);
    }
  };

  const openChatWithFriend = async (friendData) => {
    try {
      // ensure currentUser loaded in case this is called before initial effect
      if (!currentUser) {
        const u = localStorage.getItem('user');
        if (u) setCurrentUser(JSON.parse(u));
      }
      // Open the chat widget
      setIsOpen(true);
      // clear all unread on server when widget opens
      markAllRead();
      
      const token = localStorage.getItem('token');
      
      // Use the existing getOrCreateChat endpoint to get or create a chat
      let chatWithFriend;
      try {
        const response = await axios.get(
          `${BACKEND_URL}/api/v1/chat/chats/${friendData._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        chatWithFriend = response.data.data;
      } catch (chatError) {
        console.error('Error getting chat:', chatError);
        // If error (e.g., not friends), show alert
        if (chatError.response?.status === 403) {
          alert('You can only chat with friends. Please add this user as a friend first.');
          return;
        }
        // For other errors, still try to show UI
        chatWithFriend = null;
      }
      
      if (chatWithFriend) {
        setSelectedChat(chatWithFriend);
        // Fetch messages for this chat
        try {
          const messagesResponse = await axios.get(
            `${BACKEND_URL}/api/v1/chat/chats/${chatWithFriend._id}/messages`,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
          const msgs = messagesResponse.data.data || [];
          setMessages(msgs);

          // after loading messages, mark unread
          await markUnreadMsgs(msgs);
        } catch (error) {
          console.error('Error fetching messages:', error);
          setMessages([]);
        }
      }
      
      // Refresh chats list
      fetchChats();
    } catch (error) {
      console.error('Error opening chat with friend:', error);
      setIsOpen(true);
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="chat-widget-container">
      {!isOpen && (
        <button
          className="chat-float-btn"
          onClick={async () => { setIsOpen(true); await markAllRead(); }}
          title="Open Chat"
        >
          <span style={{color: '#27AE60', fontSize: '20px', fontWeight: 'bold'}}>💬</span>
          {unreadCount > 0 && (
            <span className="chat-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
          )}
        </button>
      )}

      {isOpen && (
        <div className={`chat-window ${isMinimized ? 'minimized' : ''}`}>
          <div className="chat-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src="/logowalangbg.png" alt="PiperSmart" style={{ height: '28px', width: 'auto' }} />
              <h3 style={{ margin: 0 }}>Messages</h3>
            </div>
            <div className="chat-controls">
              <button
                className="chat-settings-btn"
                onClick={() => setShowSettings(!showSettings)}
                title="Chat Settings"
              >
                ⋯
              </button>
              <button
                className="chat-minimize-btn"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? '▲' : '▼'}
              </button>
              <button
                className="chat-close-btn"
                onClick={() => {
                  setIsOpen(false);
                  handleCloseChat();
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              <div className="chat-content">
                {showSettings && selectedChat && (
                  <div className="chat-settings-modal">
                    <div className="settings-section">
                      <h4>Background Color</h4>
                      <div className="color-options">
                        <button 
                          className={`color-btn ${chatBgColor === null ? 'active' : ''}`}
                          style={{ background: '#FFFFFF', border: '2px solid #ddd' }}
                          onClick={() => handleBgColorChange(null)}
                          title="Default"
                        />
                        <button 
                          className={`color-btn ${chatBgColor === '#FFE5E5' ? 'active' : ''}`}
                          style={{ background: '#FFE5E5' }}
                          onClick={() => handleBgColorChange('#FFE5E5')}
                          title="Light Red"
                        />
                        <button 
                          className={`color-btn ${chatBgColor === '#E5F0FF' ? 'active' : ''}`}
                          style={{ background: '#E5F0FF' }}
                          onClick={() => handleBgColorChange('#E5F0FF')}
                          title="Light Blue"
                        />
                        <button 
                          className={`color-btn ${chatBgColor === '#FFFACD' ? 'active' : ''}`}
                          style={{ background: '#FFFACD' }}
                          onClick={() => handleBgColorChange('#FFFACD')}
                          title="Light Yellow"
                        />
                        <button 
                          className={`color-btn ${chatBgColor === '#E5FFE5' ? 'active' : ''}`}
                          style={{ background: '#E5FFE5' }}
                          onClick={() => handleBgColorChange('#E5FFE5')}
                          title="Light Green"
                        />
                        <button 
                          className={`color-btn ${chatBgColor === '#F5F5F5' ? 'active' : ''}`}
                          style={{ background: '#F5F5F5', border: '2px solid #999' }}
                          onClick={() => handleBgColorChange('#F5F5F5')}
                          title="Light Gray"
                        />
                        <button 
                          className={`color-btn ${chatBgColor === '#333333' ? 'active' : ''}`}
                          style={{ background: '#333333' }}
                          onClick={() => handleBgColorChange('#333333')}
                          title="Black"
                        />
                      </div>
                    </div>

                    <div className="settings-section">
                      <h4>Custom Background</h4>
                      <button 
                        className="upload-btn"
                        onClick={() => bgImageInputRef.current?.click()}
                      >
                        📸 Upload Image
                      </button>
                      <input
                        ref={bgImageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleBgImageUpload}
                        style={{ display: 'none' }}
                      />
                      {chatBgImage && (
                        <button 
                          className="remove-bg-btn"
                          onClick={() => {
                            setChatBgImage(null);
                            saveChatSettings(chatBgColor, null, chatNickname);
                          }}
                        >
                          ✕ Remove Custom Image
                        </button>
                      )}
                    </div>

                    <div className="settings-section">
                      <h4>Nickname</h4>
                      <input
                        type="text"
                        placeholder="Give this chat a nickname..."
                        value={chatNickname}
                        onChange={(e) => handleNicknameChange(e.target.value)}
                        className="nickname-input"
                        maxLength="30"
                      />
                    </div>
                  </div>
                )}

                {!showSettings && selectedChat && (
                  <div className="chat-messages-view">
                    <div className="chat-messages-header">
                      {(() => {
                        const otherUser = selectedChat.participants?.find(p => p._id !== currentUser._id);
                        return (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              backgroundColor: '#E4E6EB',
                              backgroundImage: (otherUser?.avatar && typeof otherUser.avatar === 'string') ? `url(${otherUser.avatar})` : 'none',
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              backgroundRepeat: 'no-repeat',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '20px',
                              fontWeight: 'bold',
                              color: '#27AE60',
                              border: '2px solid #ddd'
                            }}>
                              {(!otherUser?.avatar || typeof otherUser.avatar !== 'string') ? otherUser?.name?.charAt(0).toUpperCase() : ''}
                            </div>
                            <div>
                              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#000' }}>
                                {chatNickname || otherUser?.name || 'Chat'}
                              </h4>
                              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#65676B' }}>
                                Active now
                              </p>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    <div 
                      className="messages-list"
                      style={{
                        backgroundColor: chatBgColor || '#F0F0F0',
                        backgroundImage: chatBgImage ? `url(${chatBgImage})` : 'none',
                        backgroundSize: chatBgImage ? 'cover' : 'auto',
                        backgroundPosition: 'center',
                        backgroundAttachment: 'fixed'
                      }}
                    >
                      {messages.length === 0 ? (
                        <div className="no-messages">No messages yet. Start typing!</div>
                      ) : (
                        messages.map((msg) => {
                          if (!msg.sender) return null;
                          const senderId = msg.sender?._id || msg.sender;
                          const isSent = senderId === currentUser._id;
                          
                          return (
                            <div
                              key={msg._id}
                              className={`message-item ${isSent ? 'sent' : 'received'}`}
                              onMouseEnter={() => setHoveredMessageId(msg._id)}
                              onMouseLeave={() => setHoveredMessageId(null)}
                              style={{
                                display: 'flex',
                                alignItems: 'flex-end',
                                gap: '8px',
                                marginBottom: '8px',
                                justifyContent: isSent ? 'flex-end' : 'flex-start'
                              }}
                            >
                              {!isSent && (
                                <div 
                                  style={{
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '50%',
                                    backgroundColor: '#E4E6EB',
                                    backgroundImage: (msg.sender?.avatar && typeof msg.sender.avatar === 'string') ? `url(${msg.sender.avatar})` : 'none',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    color: '#27AE60',
                                    flexShrink: 0,
                                    border: '1px solid #ddd'
                                  }}
                                  title={msg.sender?.name}
                                >
                                  {(!msg.sender?.avatar || typeof msg.sender.avatar !== 'string') ? msg.sender?.name?.charAt(0).toUpperCase() : ''}
                                </div>
                              )}
                              <div className="message-content">
                                {msg.replyTo && !msg.isDeleted && (
                                  <div className="message-replied-content">
                                    <p className={`replied-message-text ${msg.replyTo.isDeleted ? 'deleted' : ''}`}>
                                      {msg.replyTo.isDeleted ? '[message deleted]' : (msg.replyTo.content || '')}
                                    </p>
                                  </div>
                                )}
                                {msg.isDeleted ? (
                                  <p className="message-deleted">{msg.sender?.name || 'User'} deleted a message</p>
                                ) : (
                                  <>
                                    {msg.content && <p className="message-text">{msg.content}</p>}
                                    {msg.imageUrl && (
                                      <img 
                                        src={msg.imageUrl} 
                                        alt="Chat image" 
                                        style={{
                                          maxWidth: '200px',
                                          maxHeight: '200px',
                                          borderRadius: '8px',
                                          marginBottom: '8px',
                                          cursor: 'pointer',
                                          display: 'block'
                                        }}
                                        onClick={() => window.open(msg.imageUrl, '_blank')}
                                      />
                                    )}
                                    <span className="message-time">
                                      {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      }) : ''}
                                    </span>
                                  </>
                                )}
                              </div>

                              {hoveredMessageId === msg._id && !msg.isDeleted && (
                                <div className="message-actions">
                                  {isSent ? (
                                    <button
                                      className="message-delete-btn"
                                      onClick={() => handleDeleteMessage(msg._id)}
                                      title="Delete message"
                                    >
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                        <line x1="10" y1="11" x2="10" y2="17"></line>
                                        <line x1="14" y1="11" x2="14" y2="17"></line>
                                      </svg>
                                    </button>
                                  ) : (
                                    <button
                                      className="message-reply-btn"
                                      onClick={() => handleReplyToMessage(msg)}
                                      title="Reply to message"
                                    >
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="23 4 23 10 17 10"></polyline>
                                        <path d="M20.49 15.004c-1.306-1.662-3.711-2.748-6.327-2.748-5.537 0-10.033 4.582-10.033 10.25S8.646 42.75 14.183 42.75c2.559 0 4.905-1.075 6.182-2.701"></path>
                                      </svg>
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    <div className="message-input-area">
                      {replyingTo && (
                        <div className="reply-preview">
                          <div className="reply-preview-content">
                            <span className="reply-preview-label">Replying to {replyingTo.sender?.name}:</span>
                            <span className="reply-preview-text">{replyingTo.content}</span>
                          </div>
                          <button
                            className="reply-preview-close"
                            onClick={() => setReplyingTo(null)}
                            title="Cancel reply"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                      
                      {selectedImages.length > 0 && (
                        <div style={{
                          padding: '8px 12px',
                          backgroundColor: '#F0F4F8',
                          borderBottom: '1px solid #E5E7EB',
                          display: 'flex',
                          gap: '8px',
                          flexWrap: 'wrap',
                          alignItems: 'flex-start'
                        }}>
                          {selectedImages.map((img, idx) => (
                            <div
                              key={idx}
                              style={{
                                position: 'relative',
                                display: 'inline-block'
                              }}
                            >
                              <img 
                                src={URL.createObjectURL(img)} 
                                alt={`Selected ${idx}`} 
                                style={{
                                  width: '50px',
                                  height: '50px',
                                  borderRadius: '4px',
                                  objectFit: 'cover'
                                }}
                              />
                              <button
                                onClick={() => removeImage(idx)}
                                style={{
                                  position: 'absolute',
                                  top: '-8px',
                                  right: '-8px',
                                  background: '#EF4444',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '50%',
                                  width: '20px',
                                  height: '20px',
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                                title="Remove"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="input-controls">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImageSelect}
                          accept="image/*"
                          multiple
                          style={{ display: 'none' }}
                        />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#27AE60',
                            cursor: 'pointer',
                            fontSize: '20px',
                            padding: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title="Add images"
                          disabled={uploading}
                        >
                          <MdPhotoCamera />
                        </button>
                        <input
                          type="text"
                          className="message-input"
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !uploading) handleSendMessage();
                          }}
                          placeholder="Type a message..."
                          disabled={uploading}
                        />
                        <button 
                          className="send-btn" 
                          onClick={handleSendMessage}
                          disabled={uploading}
                        >
                          <span style={{color: '#f7fcf9', fontSize: '16px'}}>
                            {uploading ? '...' : '➤'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {!selectedChat && (
                  <div className="chat-list">
                    {loading ? (
                      <div className="loading">Loading chats...</div>
                    ) : chats.length === 0 ? (
                      <div className="empty-state">No conversations yet. Start a conversation from the forum!</div>
                    ) : (
                      chats.map((chat) => {
                        const otherUser = chat.participants?.find(p => p._id !== currentUser._id);
                        const hasUnread = chat.unreadCount && chat.unreadCount > 0;
                        return (
                          <div
                            key={chat._id}
                            className={`chat-item ${hasUnread ? 'unread' : 'read'}`}
                            onClick={async () => {
                              setSelectedChat(chat);
                              if (hasUnread) await markUnreadInCurrentChat(chat);
                            }}
                          >
                            <div className="chat-avatar">
                              {otherUser?.name?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <div className="chat-info">
                              <p className={`chat-name ${hasUnread ? 'unread' : 'read'}`}>{otherUser?.name || 'Unknown User'}</p>
                              <p className="chat-preview">
                                {chat.lastMessage ? chat.lastMessage.substring(0, 30) + '...' : 'No messages yet'}
                              </p>
                            </div>
                            <span className="chat-time">
                              {chat.lastMessageTime ? new Date(chat.lastMessageTime).toLocaleDateString() : ''}
                            </span>
                            {hasUnread && (
                              <span className="chat-item-badge">
                                {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                              </span>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
});

Chat.displayName = 'Chat';

export default Chat;
