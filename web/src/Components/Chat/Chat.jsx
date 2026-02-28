import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Chat.css';

export default function Chat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState('chats'); // chats, friends, requests
  const [chats, setChats] = useState([]);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const messagesEndRef = useRef(null);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  // Get current user from localStorage
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        setCurrentUser(JSON.parse(user));
      } catch (error) {
        console.error('Error parsing user:', error);
      }
    }
  }, []);

  // Fetch chats on open
  useEffect(() => {
    if (isOpen && activeTab === 'chats') {
      fetchChats();
    }
  }, [isOpen, activeTab]);

  // Fetch friends on tab change
  useEffect(() => {
    if (isOpen && activeTab === 'friends') {
      fetchFriends();
    }
  }, [isOpen, activeTab]);

  // Fetch friend requests on tab change
  useEffect(() => {
    if (isOpen && activeTab === 'requests') {
      fetchFriendRequests();
    }
  }, [isOpen, activeTab]);

  // Fetch messages when chat selected
  useEffect(() => {
    if (selectedChat) {
      fetchMessages();
    }
  }, [selectedChat]);

  // Auto scroll to latest message
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
      setChats(response.data.data || []);
      console.log('✅ Chats loaded');
    } catch (error) {
      console.error('❌ Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFriends = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/v1/users/friends`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setFriends(response.data.data || []);
      console.log('✅ Friends loaded');
    } catch (error) {
      console.error('❌ Error fetching friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFriendRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/v1/users/friend-requests`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setFriendRequests(response.data.data || []);
      console.log('✅ Friend requests loaded');
    } catch (error) {
      console.error('❌ Error fetching friend requests:', error);
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
      console.log('📨 Messages response:', response.data.data);
      setMessages(response.data.data || []);
      console.log('✅ All messages loaded');
    } catch (error) {
      console.error('❌ Error fetching messages:', error);
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
      console.log('✅ Message sent');
    } catch (error) {
      console.error('❌ Error sending message:', error);
      alert('Failed to send message');
    }
  };

  const handleStartChat = async (userId) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/v1/chat/chats/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setSelectedChat(response.data.data);
      setActiveTab('messages');
      console.log('✅ Chat opened');
    } catch (error) {
      console.error('❌ Error starting chat:', error);
      alert('Failed to start chat. Make sure you\'re friends with this user.');
    }
  };

  const handleAcceptFriendRequest = async (senderId) => {
    try {
      await axios.post(
        `${BACKEND_URL}/api/v1/users/friend-request/${senderId}/accept`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      alert('Friend request accepted!');
      fetchFriendRequests();
      fetchFriends();
      console.log('✅ Friend request accepted');
    } catch (error) {
      console.error('❌ Error accepting request:', error);
      alert('Failed to accept friend request');
    }
  };

  const handleDeclineFriendRequest = async (senderId) => {
    try {
      await axios.post(
        `${BACKEND_URL}/api/v1/users/friend-request/${senderId}/decline`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      alert('Friend request declined');
      fetchFriendRequests();
      console.log('✅ Friend request declined');
    } catch (error) {
      console.error('❌ Error declining request:', error);
    }
  };

  const handleSendFriendRequest = async (userId) => {
    try {
      await axios.post(
        `${BACKEND_URL}/api/v1/users/friend-request/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      alert('Friend request sent!');
      setSearchResults(searchResults.filter(u => u._id !== userId));
      console.log('✅ Friend request sent');
    } catch (error) {
      console.error('❌ Error sending friend request:', error);
      alert(error.response?.data?.message || 'Failed to send friend request');
    }
  };

  const handleSearchUsers = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await axios.get(`${BACKEND_URL}/api/v1/chat/search/users?query=${query}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setSearchResults(response.data.data || []);
      console.log('✅ Users found');
    } catch (error) {
      console.error('❌ Error searching users:', error);
    }
  };

  const handleCloseChat = () => {
    setSelectedChat(null);
    setMessages([]);
    setMessageInput('');
  };

  if (!currentUser) {
    return null; // Don't show chat if user not logged in
  }

  return (
    <div className="chat-widget-container">
      {/* Floating Button */}
      {!isOpen && (
        <button
          className="chat-float-btn"
          onClick={() => setIsOpen(true)}
          title="Open Chat"
        >
          💬
          {friendRequests.length > 0 && (
            <span className="chat-badge">{friendRequests.length}</span>
          )}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`chat-window ${isMinimized ? 'minimized' : ''}`}>
          {/* Header */}
          <div className="chat-header">
            <h3>💬 Chat & Friends</h3>
            <div className="chat-controls">
              <button
                className="chat-minimize-btn"
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? '▲' : '▼'}
              </button>
              <button
                className="chat-close-btn"
                onClick={() => {
                  setIsOpen(false);
                  handleCloseChat();
                }}
                title="Close"
              >
                ✕
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Tabs */}
              <div className="chat-tabs">
                <button
                  className={`chat-tab ${activeTab === 'chats' ? 'active' : ''}`}
                  onClick={() => setActiveTab('chats')}
                >
                  💬 Chats
                </button>
                <button
                  className={`chat-tab ${activeTab === 'friends' ? 'active' : ''}`}
                  onClick={() => setActiveTab('friends')}
                >
                  👥 Friends
                </button>
                <button
                  className={`chat-tab ${activeTab === 'requests' ? 'active' : ''}`}
                  onClick={() => setActiveTab('requests')}
                >
                  📬 Requests {friendRequests.length > 0 && `(${friendRequests.length})`}
                </button>
              </div>

              {/* Content Area */}
              <div className="chat-content">
                {/* Messages View */}
                {selectedChat && activeTab === 'messages' && (
                  <div className="chat-messages-view">
                    <div className="chat-messages-header">
                      <button className="back-btn" onClick={handleCloseChat}>
                        ← Back
                      </button>
                      <h4>
                        {selectedChat.participants?.find(p => p._id !== currentUser._id)?.name || 'Chat'}
                      </h4>
                    </div>

                    <div className="messages-list">
                      {messages.length === 0 ? (
                        <div className="no-messages">No messages yet. Start typing!</div>
                      ) : (
                        messages.map((msg) => {
                          // Safety check for sender
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

                {/* Chats Tab */}
                {activeTab === 'chats' && !selectedChat && (
                  <div className="chat-list">
                    {loading ? (
                      <div className="loading">Loading chats...</div>
                    ) : chats.length === 0 ? (
                      <div className="empty-state">No chats yet. Add friends to start chatting!</div>
                    ) : (
                      chats.map((chat) => {
                        const otherUser = chat.participants?.find(p => p._id !== currentUser._id);
                        return (
                          <div
                            key={chat._id}
                            className="chat-item"
                            onClick={() => {
                              setSelectedChat(chat);
                              setActiveTab('messages');
                            }}
                          >
                            <div className="chat-avatar">
                              {otherUser?.name?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <div className="chat-info">
                              <p className="chat-name">{otherUser?.name || 'Unknown User'}</p>
                              <p className="chat-preview">
                                {chat.lastMessage ? chat.lastMessage.substring(0, 30) + '...' : 'No messages yet'}
                              </p>
                            </div>
                            <span className="chat-time">
                              {chat.lastMessageTime ? new Date(chat.lastMessageTime).toLocaleDateString() : ''}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {/* Friends Tab */}
                {activeTab === 'friends' && (
                  <div className="friends-list">
                    <div className="search-box">
                      <input
                        type="text"
                        className="friend-search"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          handleSearchUsers(e.target.value);
                        }}
                      />
                    </div>

                    {searchResults.length > 0 ? (
                      <div className="search-results">
                        {searchResults.map((user) => (
                          <div key={user._id} className="search-result-item">
                            <div className="user-info">
                              <div className="user-avatar">{user.name?.charAt(0).toUpperCase()}</div>
                              <div className="user-details">
                                <p className="user-name">{user.name}</p>
                                <p className="user-email">{user.email}</p>
                              </div>
                            </div>
                            <button
                              className="add-friend-btn"
                              onClick={() => handleSendFriendRequest(user._id)}
                            >
                              + Add
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="friends-grid">
                        {loading ? (
                          <div className="loading">Loading friends...</div>
                        ) : friends.length === 0 ? (
                          <div className="empty-state">No friends yet. Search and add some!</div>
                        ) : (
                          friends.map((friend) => (
                            <div key={friend._id} className="friend-card">
                              <div className="friend-avatar">
                                {friend.name?.charAt(0).toUpperCase()}
                              </div>
                              <p className="friend-name">{friend.name}</p>
                              <button
                                className="friend-chat-btn"
                                onClick={() => handleStartChat(friend._id)}
                              >
                                💬 Chat
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Friend Requests Tab */}
                {activeTab === 'requests' && (
                  <div className="requests-list">
                    {loading ? (
                      <div className="loading">Loading requests...</div>
                    ) : friendRequests.length === 0 ? (
                      <div className="empty-state">No pending friend requests</div>
                    ) : (
                      friendRequests.map((request) => (
                        <div key={request._id} className="request-item">
                          <div className="request-user">
                            <div className="user-avatar">
                              {request.from.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="request-info">
                              <p className="user-name">{request.from.name}</p>
                              <p className="user-email">{request.from.email}</p>
                            </div>
                          </div>
                          <div className="request-actions">
                            <button
                              className="accept-btn"
                              onClick={() => handleAcceptFriendRequest(request.from._id)}
                            >
                              ✓ Accept
                            </button>
                            <button
                              className="decline-btn"
                              onClick={() => handleDeclineFriendRequest(request.from._id)}
                            >
                              ✕ Decline
                            </button>
                          </div>
                        </div>
                      ))
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
}
