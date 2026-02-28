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
      const response = await axios.get('/api/v1/notifications');
      setNotifications(response.data.data.notifications);
      setUnreadCount(response.data.data.unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`/api/v1/notifications/${notificationId}/read`);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(`/api/v1/notifications/${notificationId}`);
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
        return '#E74C3C';
      case 'warning':
        return '#F39C12';
      default:
        return '#1B4D3E';
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
          <li className="menu-item-with-dropdown" onMouseEnter={() => handleMenuHover('features')} onMouseLeave={handleMenuLeave}>
            <a href="/#features">Features</a>
            {activeDropdown === 'features' && (
              <div className="nav-dropdown">
                <Link to="/leaf-analysis">Leaf Analysis</Link>
                <Link to="/bunga-analysis">Bunga Analysis</Link>
                <Link to="/forum">Community Forum</Link>
                <Link to="/weather">Weather</Link>
                <Link to="/macro-mapping">Macromapping</Link>
                <Link to="/how-it-works">How it works</Link>
              </div>
            )}
          </li>
          <li><Link to="/contact">Contact Us</Link></li>
        </ul>

        {/* Right Section - Conditional Rendering */}
        <div className="header-actions">
          <input type="text" placeholder="Search..." className="header-search" />

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
                            <button
                              className="delete-notification"
                              onClick={() => deleteNotification(notification._id)}
                            >
                              🗑️
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="user-profile" onClick={toggleDropdown}>
                <div className="user-avatar">
                  {user?.firstName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="user-info">
                  <p className="user-name">{user?.firstName} {user?.lastName}</p>
                  <p className="user-email">{user?.email}</p>
                </div>
                <span className={`dropdown-arrow ${showDropdown ? 'open' : ''}`}>▼</span>
              </div>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="dropdown-menu">
                  <Link to="/profile" className="dropdown-item">
                    👤 My Profile
                  </Link>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item logout-btn" onClick={handleLogout}>
                    🚪 Logout
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
