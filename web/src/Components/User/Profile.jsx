import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Chat from '../Chat/Chat';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  const colors = {
    primary: '#1B4D3E',
    primaryLight: '#27AE60',
    primaryLightSecondary: '#52BE80',
    secondary: '#FFFFFF',
    background: '#F8FAF7',
    text: '#1B4D3E',
    textLight: '#5A7A73',
    border: '#D4E5DD',
    accent: '#D4AF37',
    success: '#27AE60',
    error: '#E74C3C',
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await axios.get(`${API_BASE_URL}/api/v1/users/me`);
        if (response.data.success) setUser(response.data.user);
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

  if (loading)
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: `linear-gradient(135deg, ${colors.primaryLight} 0%, ${colors.primary} 100%)`,
        }}
      >
        <div
          style={{
            width: '50px',
            height: '50px',
            border: `4px solid ${colors.secondary}`,
            borderTop: `4px solid ${colors.accent}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        padding: '20px',
        background: `linear-gradient(135deg, ${colors.primaryLight} 0%, ${colors.primary} 100%)`,
      }}
    >
      <div
        style={{
          textAlign: 'center',
          padding: '40px',
          background: colors.secondary,
          borderRadius: '16px',
          boxShadow: `0 10px 30px rgba(27, 77, 62, 0.15)`,
          width: '100%',
          maxWidth: '450px',
          animation: 'slideUp 0.5s ease',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ color: colors.primary, fontSize: '28px', margin: '0 0 10px 0' }}>
            🌱 My Profile
          </h1>
          <div
            style={{
              height: '3px',
              width: '60px',
              background: colors.accent,
              margin: '0 auto',
              borderRadius: '2px',
            }}
          />
        </div>

        {/* Avatar */}
        <div style={{ position: 'relative', marginBottom: '30px' }}>
          <img
            src={
              user?.avatar?.url ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}`
            }
            alt={user?.name}
            style={{
              width: '140px',
              height: '140px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: `4px solid ${colors.primaryLight}`,
              boxShadow: `0 4px 12px rgba(39, 174, 96, 0.2)`,
            }}
          />
          <span
            style={{
              position: 'absolute',
              bottom: '0',
              right: '0',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: colors.success,
              color: colors.secondary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              border: `3px solid ${colors.secondary}`,
            }}
          >
            ✓
          </span>
        </div>

        {/* Basic Info */}
        <div
          style={{
            background: colors.background,
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '25px',
            border: `1px solid ${colors.border}`,
          }}
        >
          <div style={{ marginBottom: '15px', textAlign: 'left' }}>
            <p style={{ color: colors.textLight, fontSize: '12px', margin: '0 0 5px 0', textTransform: 'uppercase' }}>
              Full Name
            </p>
            <p style={{ color: colors.text, fontSize: '16px', margin: '0', fontWeight: '600' }}>
              {user?.name}
            </p>
          </div>

          <div style={{ marginBottom: '15px', textAlign: 'left' }}>
            <p style={{ color: colors.textLight, fontSize: '12px', margin: '0 0 5px 0', textTransform: 'uppercase' }}>
              Email
            </p>
            <p style={{ color: colors.text, fontSize: '16px', margin: '0', fontWeight: '600' }}>
              {user?.email}
            </p>
          </div>

          {user?.contact && (
            <div style={{ textAlign: 'left' }}>
              <p style={{ color: colors.textLight, fontSize: '12px', margin: '0 0 5px 0', textTransform: 'uppercase' }}>
                Contact
              </p>
              <p style={{ color: colors.text, fontSize: '16px', margin: '0', fontWeight: '600' }}>
                {user.contact}
              </p>
            </div>
          )}
        </div>

        {/* Address */}
        {user?.address && (
          <div
            style={{
              background: colors.background,
              padding: '20px',
              borderRadius: '12px',
              marginBottom: '25px',
              border: `1px solid ${colors.border}`,
            }}
          >
            <h3
              style={{
                color: colors.primary,
                margin: '0 0 15px 0',
                fontSize: '14px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              📍 Address
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div style={{ textAlign: 'left' }}>
                <p style={{ color: colors.textLight, fontSize: '12px', margin: '0 0 5px 0', textTransform: 'uppercase' }}>
                  City
                </p>
                <p style={{ color: colors.text, fontSize: '15px', margin: '0', fontWeight: '600' }}>
                  {user.address.city || '-'}
                </p>
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ color: colors.textLight, fontSize: '12px', margin: '0 0 5px 0', textTransform: 'uppercase' }}>
                  Barangay
                </p>
                <p style={{ color: colors.text, fontSize: '15px', margin: '0', fontWeight: '600' }}>
                  {user.address.barangay || '-'}
                </p>
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ color: colors.textLight, fontSize: '12px', margin: '0 0 5px 0', textTransform: 'uppercase' }}>
                  Street
                </p>
                <p style={{ color: colors.text, fontSize: '15px', margin: '0', fontWeight: '600' }}>
                  {user.address.street || '-'}
                </p>
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ color: colors.textLight, fontSize: '12px', margin: '0 0 5px 0', textTransform: 'uppercase' }}>
                  Zip Code
                </p>
                <p style={{ color: colors.text, fontSize: '15px', margin: '0', fontWeight: '600' }}>
                  {user.address.zipcode || '-'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <Link
            to="/profile/edit"
            style={{
              padding: '12px 16px',
              background: colors.primaryLight,
              color: colors.secondary,
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '14px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: `0 4px 12px rgba(39, 174, 96, 0.2)`,
              display: 'inline-block',
              textAlign: 'center',
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = `0 6px 20px rgba(39, 174, 96, 0.3)`;
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = `0 4px 12px rgba(39, 174, 96, 0.2)`;
            }}
          >
            ✎ Edit Profile
          </Link>

          <Link
            to="/change-password"
            style={{
              padding: '12px 16px',
              background: colors.accent,
              color: colors.secondary,
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '14px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: `0 4px 12px rgba(212, 175, 55, 0.2)`,
              display: 'inline-block',
              textAlign: 'center',
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = `0 6px 20px rgba(212, 175, 55, 0.3)`;
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = `0 4px 12px rgba(212, 175, 55, 0.2)`;
            }}
          >
            🔑 Change Password
          </Link>
        </div>

        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '12px 16px',
            background: colors.error,
            color: colors.secondary,
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: `0 4px 12px rgba(231, 76, 60, 0.2)`,
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = `0 6px 20px rgba(231, 76, 60, 0.3)`;
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = `0 4px 12px rgba(231, 76, 60, 0.2)`;
          }}
        >
          🚪 Logout
        </button>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {/* Floating Chat Widget */}
      <Chat />
    </div>
  );
};

export default Profile;
