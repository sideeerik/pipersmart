import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';
import logo from '../../../../picturesofbp/logowalangbg.png';
import axios from 'axios';

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifLoading, setNotifLoading] = useState({}); // map id->true when performing action
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  // Glassmorphism scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/notifications`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications(response.data.data.notifications);
      setUnreadCount(response.data.data.unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const acceptFriendRequest = async (senderId, notificationId) => {
    try {
      // show loader
      setNotifLoading(prev => ({ ...prev, [notificationId]: true }));
      const token = localStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/users/friend-request/${senderId}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update notification message to show acceptance
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId 
            ? { ...notif, message: '✅ Request Accepted' } 
            : notif
        )
      );
      // Wait a moment, then delete
      setTimeout(async () => {
        if (notificationId) await deleteNotification(notificationId);
        fetchNotifications();
        checkAuthStatus();
      }, 800);
      alert('Friend request accepted');
    } catch (error) {
      console.error('Error accepting friend request:', error);
      alert(error.response?.data?.message || 'Failed to accept friend request');
    } finally {
      setNotifLoading(prev => {
        const copy = { ...prev };
        delete copy[notificationId];
        return copy;
      });
    }
  };

  const declineFriendRequest = async (senderId, notificationId) => {
    try {
      setNotifLoading(prev => ({ ...prev, [notificationId]: true }));
      const token = localStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/users/friend-request/${senderId}/decline`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update notification message to show rejection
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId 
            ? { ...notif, message: '❌ Request Declined' } 
            : notif
        )
      );
      // Wait a moment, then delete
      setTimeout(async () => {
        if (notificationId) await deleteNotification(notificationId);
        fetchNotifications();
      }, 800);
      alert('Friend request declined');
    } catch (error) {
      console.error('Error declining friend request:', error);
      alert(error.response?.data?.message || 'Failed to decline friend request');
    } finally {
      setNotifLoading(prev => {
        const copy = { ...prev };
        delete copy[notificationId];
        return copy;
      });
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/notifications/${notificationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification._id);
    }
    if (notification.actionUrl) {
      setShowNotifications(false);
      navigate(notification.actionUrl);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return '#ff4757';
      case 'warning':
        return '#ffa502';
      default:
        return '#00FF88';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    setShowDropdown(false);
    navigate('/');
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleMenuHover = (menu) => {
    setActiveDropdown(menu);
  };

  const handleMenuLeave = () => {
    setActiveDropdown(null);
  };

  return (
    <nav className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-content">
        {/* Logo & Brand */}
        <Link to="/" className="header-brand">
          <img src={logo} alt="PiperSmart Logo" className="header-logo" />
          <h1>PiperSmart</h1>
        </Link>

        {/* Navigation Menu */}
        <ul className="header-menu">
          <li><a href="/">Home</a></li>
          <li><Link to="/about">About Us</Link></li>
<li 
            className="menu-item-with-dropdown" 
            onMouseEnter={() => handleMenuHover('features')} 
            onMouseLeave={handleMenuLeave}
          >
            <a href="/#features">Features</a>
            {activeDropdown === 'features' && (
              <div className="nav-dropdown">
                <Link to="/knowledge">Knowledge</Link>
                <Link to="/leaf-analysis">Leaf Analysis</Link>
                <Link to="/bunga-analysis">Bunga Analysis</Link>
                <Link to="/forum">Community Forum</Link>
                <Link to="/macro-mapping">Macromapping</Link>
                <Link to="/how-it-works">How it works</Link>
              </div>
            )}
          </li>
          <li><Link to="/contact">Contact Us</Link></li>
        </ul>

        {/* Right Section - Conditional Rendering */}
        <div className="header-actions">
          {!isLoggedIn ? (
            /* Non-Logged-In User */
            <div className="header-auth-buttons">
              <Link to="/login" className="btn-login">
                Login
              </Link>
              <Link to="/register" className="btn-register">
                Register
              </Link>
            </div>
          ) : (
            /* Logged-In User */
            <div className="header-user-section">
              {/* Notifications Bell */}
              <div className="notification-bell-container">
                <button
                  className="notification-bell"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  🔔
                  {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="notification-dropdown">
                    <div className="notification-header">
                      <h4>Notifications</h4>
                      <button onClick={() => setShowNotifications(false)} className="close-btn">✕</button>
                    </div>
                    {notifications.length === 0 ? (
                      <div className="empty-notifications">
                        <p>No notifications</p>
                      </div>
                    ) : (
                      <div className="notification-list">
                        {notifications.map((notification) => (
                          <div
                            key={notification._id}
                            className={`notification-item ${!notification.read ? 'unread' : ''}`}
                            style={{ borderLeftColor: getSeverityColor(notification.severity) }}
                          >
                            <div
                              className="notification-content"
                              onClick={() => handleNotificationClick(notification)}
                            >
                              <div className="notification-title">
                                {notification.title}
                                {!notification.read && <span className="unread-dot"></span>}
                              </div>
                              <p className="notification-message">{notification.message}</p>
                              <span className="notification-time">
                                {new Date(notification.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                              {/* If this notification is a friend request, show accept/decline */}
                              {notification.type === 'friend_request' && notification.data?.senderId ? (
                                <div className="notification-actions">
                                  <button
                                    className="btn-accept"
                                    disabled={notifLoading[notification._id]}
                                    onClick={(e) => { e.stopPropagation(); acceptFriendRequest(notification.data.senderId, notification._id); }}
                                  >
                                    {notifLoading[notification._id] ? '…' : 'Accept'}
                                  </button>
                                  <button
                                    className="btn-decline"
                                    disabled={notifLoading[notification._id]}
                                    onClick={(e) => { e.stopPropagation(); declineFriendRequest(notification.data.senderId, notification._id); }}
                                  >
                                    {notifLoading[notification._id] ? '…' : 'Reject'}
                                  </button>
                                </div>
                              ) : (
                                <button
                                  className="delete-notification"
                                  onClick={() => deleteNotification(notification._id)}
                                >
                                  🗑️
                                </button>
                              )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="user-profile">
                <div className="user-info">
                  <p className="user-name">{user?.name}</p>
                  <p className="user-email">{user?.email}</p>
                </div>
                <div className="user-avatar" onClick={toggleDropdown}>
                  {user?.avatar?.url ? (
                    <img src={user.avatar.url} alt="Profile" className="user-avatar-img" />
                  ) : (
                    user?.name?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
              </div>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="dropdown-menu">
                  <Link to="/profile" className="dropdown-item">
                    My Profile
                  </Link>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item logout-btn" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
