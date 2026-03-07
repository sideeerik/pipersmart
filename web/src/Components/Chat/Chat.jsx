import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import axios from 'axios';
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
  const messagesEndRef = useRef(null);

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
    }
  }, [selectedChat]);

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
    if (!messageInput.trim() || !selectedChat) return;

    try {
      await axios.post(
        `${BACKEND_URL}/api/v1/chat/chats/${selectedChat._id}/messages`,
        { content: messageInput },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setMessageInput('');
      fetchMessages();
      fetchChats();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    }
  };

  const handleCloseChat = () => {
    setSelectedChat(null);
    setMessages([]);
    setMessageInput('');
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
          💬
          {unreadCount > 0 && (
            <span className="chat-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
          )}
        </button>
      )}

      {isOpen && (
        <div className={`chat-window ${isMinimized ? 'minimized' : ''}`}>
          <div className="chat-header">
            <h3>💬 Messages</h3>
            <div className="chat-controls">
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
                {selectedChat && (
                  <div className="chat-messages-view">
                    <div className="chat-messages-header">
                      <h4>
                        {selectedChat.participants?.find(p => p._id !== currentUser._id)?.name || 'Chat'}
                      </h4>
                    </div>

                    <div className="messages-list">
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
                            >
                              <div className="message-content">
                                <p className="message-text">{msg.content || ''}</p>
                                <span className="message-time">
                                  {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  }) : ''}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    <div className="message-input-area">
                      <input
                        type="text"
                        className="message-input"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') handleSendMessage();
                        }}
                        placeholder="Type a message..."
                      />
                      <button className="send-btn" onClick={handleSendMessage}>
                        📤
                      </button>
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
