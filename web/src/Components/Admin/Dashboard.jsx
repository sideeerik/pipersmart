import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const AdminProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');

      try {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await axios.get(`${API_BASE_URL}/api/v1/users/me`);
        if (response.data.success) {
          setUser(response.data.user);
        }
      } catch (error) {
        console.error('Profile fetch error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, API_BASE_URL]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Light green color palette
  const colors = {
    primary: '#27AE60',
    primaryLight: '#52BE80',
    secondary: '#FFFFFF',
    background: '#F0F9F4',
    backgroundHover: '#E8F6F0',
    text: '#1B4D3E',
    textLight: '#52866A',
    border: '#C8E6C9',
    error: '#E74C3C',
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${colors.primaryLight} 0%, ${colors.primary} 100%)`
      }}>
        <div style={{
          textAlign: 'center',
          padding: '40px',
          background: colors.secondary,
          borderRadius: '16px',
          boxShadow: `0 20px 60px rgba(39, 174, 96, 0.15)`
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid rgba(39, 174, 96, 0.2)',
            borderTopColor: colors.primary,
            borderRadius: '50%',
            margin: '0 auto 20px',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ color: colors.text, fontSize: '16px', fontWeight: '600' }}>
            Loading Admin Profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${colors.primaryLight} 0%, ${colors.primary} 100%)`,
      padding: '20px',
      fontFamily: 'inherit'
    }}>
      {/* Header with Buttons */}
      <div style={{
        width: '100%',
        maxWidth: '600px',
        margin: '0 auto 40px',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '10px'
      }}>
        <Link
          to="/admin/profile"
          style={{
            padding: '12px 24px',
            background: colors.secondary,
            color: colors.primary,
            border: 'none',
            borderRadius: '12px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '14px',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
          }}
        >
          👤 Profile
        </Link>
        <button
          onClick={handleLogout}
          style={{
            padding: '12px 24px',
            background: colors.error,
            color: colors.secondary,
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(231, 76, 60, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(231, 76, 60, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(231, 76, 60, 0.3)';
          }}
        >
          🚪 Logout
        </button>
      </div>

      {/* Centered Welcome Text */}
      <h1 style={{
        textAlign: 'center',
        color: colors.secondary,
        fontSize: '32px',
        fontWeight: '800',
        margin: '0 0 40px 0',
        letterSpacing: '-0.5px',
        textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
      }}>
        🌱 Welcome Admin
      </h1>

      {/* Optional Avatar */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginTop: '20px'
      }}>
        {user?.avatar?.url && (
          <div style={{
            position: 'relative',
            display: 'inline-block'
          }}>
            <img
              src={user.avatar.url}
              alt="Admin Avatar"
              style={{
                width: '140px',
                height: '140px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: `4px solid ${colors.secondary}`,
                boxShadow: `0 8px 24px rgba(0, 0, 0, 0.2)`,
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = `0 12px 32px rgba(0, 0, 0, 0.3)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = `0 8px 24px rgba(0, 0, 0, 0.2)`;
              }}
            />
            <span style={{
              position: 'absolute',
              bottom: '0',
              right: '0',
              width: '40px',
              height: '40px',
              background: colors.primary,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              border: `3px solid ${colors.secondary}`,
              boxShadow: `0 4px 12px rgba(39, 174, 96, 0.3)`
            }}>
              ✓
            </span>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AdminProfile;
