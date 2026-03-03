import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import logoImage from './logowalangbg.png';

const AdminHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  const colors = {
    primary: '#27AE60',
    primaryLight: '#52BE80',
    secondary: '#FFFFFF',
    background: '#F0F9F4',
    text: '#1B4D3E',
    textLight: '#52866A',
    border: '#D5EFDB',
    accent: '#E67E22',
    danger: '#E74C3C',
  };

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const NavLink = ({ to, label, icon }) => (
    <button
      onClick={() => navigate(to)}
      style={{
        padding: '10px 16px',
        backgroundColor: isActive(to) ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
        color: colors.secondary,
        border: 'none',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: isActive(to) ? '700' : '500',
        borderBottom: isActive(to) ? `3px solid ${colors.secondary}` : 'none',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        borderRadius: '4px 4px 0 0',
      }}
      onMouseEnter={(e) => {
        if (!isActive(to)) {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive(to)) {
          e.currentTarget.style.backgroundColor = 'transparent';
        }
      }}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );

  return (
    <header style={{
      backgroundColor: colors.primary,
      background: `linear-gradient(90deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
      padding: '0',
      boxShadow: '0 4px 12px rgba(39, 174, 96, 0.15)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      borderBottom: `3px solid ${colors.secondary}`,
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0' }}>
        {/* Top Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          borderBottom: `1px solid rgba(255, 255, 255, 0.1)`,
        }}>
          {/* Logo and Title */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
          }}
          onClick={() => navigate('/admin/dashboard')}
          >
            <img src={logoImage} alt="Logo" style={{ height: '40px', objectFit: 'contain' }} />
            <div style={{ color: colors.secondary }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>PiperSmart</div>
              <div style={{ fontSize: '11px', opacity: 0.85, margin: 0 }}>Admin Panel</div>
            </div>
          </div>

          {/* User Profile Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: colors.secondary,
                padding: '8px 14px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)';
              }}
              onMouseLeave={(e) => {
                if (!dropdownOpen) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                }
              }}
            >
              {user?.avatar?.url && (
                <img
                  src={user.avatar.url}
                  alt="Avatar"
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: `2px solid ${colors.secondary}`,
                  }}
                />
              )}
              <span>{user?.name || 'Admin'}</span>
              <span style={{ fontSize: '16px', transition: 'all 0.3s ease', transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0)' }}>▼</span>
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '8px',
                backgroundColor: colors.secondary,
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                minWidth: '200px',
                overflow: 'hidden',
                zIndex: 1001,
              }}>
                <div style={{
                  padding: '12px 16px',
                  borderBottom: `1px solid ${colors.border}`,
                  fontSize: '13px',
                  color: colors.textLight,
                }}>
                  <div style={{ fontWeight: '600', color: colors.text }}>{user?.name || 'Admin'}</div>
                  <div style={{ marginTop: '4px', opacity: 0.8 }}>{user?.email}</div>
                  <div style={{ marginTop: '4px', fontSize: '12px', color: '#999' }}>Role: Administrator</div>
                </div>

                <button
                  onClick={() => {
                    navigate('/admin/profile');
                    setDropdownOpen(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: colors.text,
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    borderBottom: `1px solid ${colors.border}`,
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.background;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  👤 Profile Settings
                </button>

                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: colors.danger,
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#FFEBEE';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Bar */}
        <nav style={{
          display: 'flex',
          gap: '0',
          padding: '0 24px',
          overflow: 'auto',
        }}>
          <NavLink to="/admin/dashboard" label="Dashboard" icon="📊" />
          <NavLink to="/admin/reports" label="Reports & Analytics" icon="📈" />
          <NavLink to="/admin/profile" label="Profile" icon="👤" />
        </nav>
      </div>
    </header>
  );
};

export default AdminHeader;
