import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import logoImage from './logowalangbg.png';
import './AdminHeader.css';

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/admin/reports', label: 'Reports & Analytics', icon: 'reports' },
  { to: '/admin/reported-posts', label: 'Content Moderation', icon: 'flag' },
  { to: '/admin/profile', label: 'Admin Profile', icon: 'user' }
];

const Icon = ({ type }) => {
  if (type === 'dashboard') {
    return (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 13h6v7H4v-7ZM14 4h6v16h-6V4ZM4 4h6v7H4V4ZM14 12h6v8h-6v-8Z" fill="currentColor" />
      </svg>
    );
  }

  if (type === 'reports') {
    return (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 19V5m0 14h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="m7 15 4-4 3 2 4-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (type === 'flag') {
    return (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 21V4m0 0h11l-2 3 2 3H5Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5 20a7 7 0 0 1 14 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
};

const AdminHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        axios.defaults.headers.common.Authorization = `Bearer ${token}`;
        const response = await axios.get(`${API_BASE_URL}/api/v1/users/me`);
        if (response.data.success) {
          setUser(response.data.user);
        }
      } catch (error) {
        console.error('User fetch error:', error);
      }
    };

    fetchUser();
  }, [API_BASE_URL]);

  useEffect(() => {
    setDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className="admin-header">
      <div className="admin-header-inner">
        <div className="admin-header-top">
          <div className="admin-brand" onClick={() => navigate('/admin/dashboard')}>
            <img src={logoImage} alt="PiperSmart Logo" />
            <div>
              <div className="admin-brand-title">PiperSmart</div>
              <div className="admin-brand-subtitle">Administration Console</div>
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <button
              className="admin-user-btn"
              onClick={() => setDropdownOpen((prev) => !prev)}
              type="button"
            >
              {user?.avatar?.url ? (
                <img src={user.avatar.url} alt="Admin Avatar" className="admin-user-avatar" />
              ) : (
                <span
                  className="admin-user-avatar"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#1e293b',
                    color: '#e2e8f0',
                    fontWeight: 700,
                    fontSize: 12
                  }}
                >
                  {(user?.name || 'A').charAt(0).toUpperCase()}
                </span>
              )}
              <span className="admin-user-name">{user?.name || 'Administrator'}</span>
              <span className={`admin-user-caret ${dropdownOpen ? 'open' : ''}`}>v</span>
            </button>

            {dropdownOpen && (
              <div className="admin-user-menu">
                <div className="admin-user-menu-head">
                  <div className="admin-user-menu-name">{user?.name || 'Administrator'}</div>
                  <div className="admin-user-menu-email">{user?.email || 'No email'}</div>
                  <div className="admin-user-menu-role">Role: Administrator</div>
                </div>
                <button
                  type="button"
                  className="admin-user-menu-btn"
                  onClick={() => navigate('/admin/profile')}
                >
                  Profile Settings
                </button>
                <button
                  type="button"
                  className="admin-user-menu-btn danger"
                  onClick={handleLogout}
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>

        <nav className="admin-nav">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <button
                key={item.to}
                type="button"
                onClick={() => navigate(item.to)}
                className={`admin-nav-link ${active ? 'active' : ''}`}
              >
                <Icon type={item.icon} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

export default AdminHeader;
