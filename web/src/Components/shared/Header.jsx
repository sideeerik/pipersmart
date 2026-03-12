import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHome, FaInfoCircle, FaClipboardCheck, FaAddressBook } from 'react-icons/fa';
import './Header.css';
import logo from '../../../../picturesofbp/logowalangbg.png';
import axios from 'axios';

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLoginNote, setShowLoginNote] = useState(false);
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
      setShowLoginNote(false);
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
            ? { ...notif, message: <span style={{color: '#27AE60'}}>✓ Request Accepted</span> }
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
            ? { ...notif, message: <span style={{color: '#E74C3C'}}>✕ Request Declined</span> }
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

  const handleProtectedNavClick = (event) => {
    if (isLoggedIn) return;
    event.preventDefault();
    setShowLoginNote(true);
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
          <li>
            <a href="/">
              <FaHome className="nav-menu-icon" />
              <span>Home</span>
            </a>
          </li>
          <li>
            <Link to="/about" onClick={handleProtectedNavClick}>
              <FaInfoCircle className="nav-menu-icon" />
              <span>About Us</span>
            </Link>
          </li>
<li 
            className="menu-item-with-dropdown" 
            onMouseEnter={() => handleMenuHover('features')} 
            onMouseLeave={handleMenuLeave}
          >
            <a href="/#features" onClick={handleProtectedNavClick}>
              <FaClipboardCheck className="nav-menu-icon" />
              <span>Features</span>
            </a>
            {activeDropdown === 'features' && (
              <div className="nav-dropdown">
                <Link to="/knowledge" onClick={handleProtectedNavClick}>Knowledge</Link>
                <Link to="/leaf-analysis" onClick={handleProtectedNavClick}>Leaf Analysis</Link>
                <Link to="/bunga-analysis" onClick={handleProtectedNavClick}>Bunga Analysis</Link>
                <Link to="/forum" onClick={handleProtectedNavClick}>Community Forum</Link>
                <Link to="/macro-mapping" onClick={handleProtectedNavClick}>Macromapping</Link>
                <Link to="/recent-activities" onClick={handleProtectedNavClick}>Recent Activities</Link>
                <Link to="/how-it-works" onClick={handleProtectedNavClick}>How it works</Link>
              </div>
            )}
          </li>
          <li>
            <Link to="/contact" onClick={handleProtectedNavClick}>
              <FaAddressBook className="nav-menu-icon" />
              <span>Contact Us</span>
            </Link>
          </li>
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
                  <span className="notification-theme-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M12 3a5 5 0 0 0-5 5v3.4c0 .7-.24 1.38-.69 1.92L4.7 15.2A1 1 0 0 0 5.47 17h13.06a1 1 0 0 0 .77-1.8l-1.61-1.88a3 3 0 0 1-.69-1.92V8a5 5 0 0 0-5-5Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9.5 18a2.5 2.5 0 0 0 5 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
                      <path d="M16.4 4.3c1.35.12 2.4.84 3.1 2.1-.92-.04-1.7.26-2.28.91-.58.64-.8 1.43-.68 2.36-1.16-.7-1.8-1.75-1.87-3.06-.06-.96.24-1.74.9-2.31.25 0 .52 0 .83 0Z" fill="currentColor" opacity="0.92"/>
                    </svg>
                  </span>
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
                                  <span style={{color: '#E74C3C'}}>🗑</span>
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

      {!isLoggedIn && showLoginNote && (
        <div className="header-login-note" role="status" aria-live="polite">
          <span>Please log in first to access this feature.</span>
          <div className="header-login-note-actions">
            <Link to="/login" className="header-login-note-link">Go to login</Link>
            <button type="button" className="header-login-note-cancel" onClick={() => setShowLoginNote(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
