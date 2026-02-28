import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const EditProfile = () => {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    city: '',
    barangay: '',
    street: '',
    zipcode: '',
  });

  const [avatar, setAvatar] = useState(null);        // NEW
  const [avatarPreview, setAvatarPreview] = useState(''); // NEW
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  // Black Pepper farming system color palette
  const colors = {
    primary: '#1B4D3E',      // Deep green
    primaryLight: '#27AE60', // Light green
    secondary: '#FFFFFF',
    background: '#F8FAF7',
    text: '#1B4D3E',
    textLight: '#5A7A73',
    border: '#D4E5DD',
    accent: '#D4AF37',       // Gold accent
    success: '#27AE60',
    error: '#E74C3C',
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');

      try {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await axios.get(`${API_BASE_URL}/api/v1/users/me`);

        if (response.data.success) {
          const user = response.data.user;
          setUser(user);
          setAvatarPreview(user.avatar?.url || ''); // show existing avatar

          setFormData({
            name: user.name || '',
            contact: user.contact || '',
            city: user.address?.city || '',
            barangay: user.address?.barangay || '',
            street: user.address?.street || '',
            zipcode: user.address?.zipcode || '',
          });
        }
      } catch (error) {
        console.error('Profile fetch error:', error);
        navigate('/profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, API_BASE_URL]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  // 🖼 HANDLE AVATAR CHANGE
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAvatar(file);
    setAvatarPreview(URL.createObjectURL(file)); // preview image
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    if (!formData.name.trim()) {
      setError('Name is required');
      setSaving(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');

      // 🔥 USE FORMDATA INSTEAD OF JSON
      const data = new FormData();
      data.append('name', formData.name.trim());
      data.append('contact', formData.contact || '');
      data.append('city', formData.city || '');
      data.append('barangay', formData.barangay || '');
      data.append('street', formData.street || '');
      data.append('zipcode', formData.zipcode || '');

      if (avatar) {
        data.append('avatar', avatar); // field name must match multer config
      }

      const response = await axios.put(
        `${API_BASE_URL}/api/v1/users/me/update`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        setSuccess('Profile updated successfully!');
        setTimeout(() => navigate('/profile'), 1500);
      }

    } catch (error) {
      console.error('Update error:', error);
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
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
          boxShadow: `0 20px 60px rgba(27, 77, 62, 0.15)`
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid rgba(27, 77, 62, 0.2)',
            borderTopColor: colors.primary,
            borderRadius: '50%',
            margin: '0 auto 20px',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ color: colors.text, fontSize: '16px', fontWeight: '600' }}>
            Loading Profile...
          </p>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${colors.primaryLight} 0%, ${colors.primary} 100%)`,
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        background: colors.secondary,
        borderRadius: '16px',
        boxShadow: `0 20px 60px rgba(27, 77, 62, 0.15)`,
        padding: '40px',
        animation: 'slideUp 0.5s ease'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px'
        }}>
          <h1 style={{
            color: colors.text,
            fontSize: '28px',
            fontWeight: '800',
            margin: '0',
            letterSpacing: '-0.5px'
          }}>
            Edit Profile
          </h1>
          <Link
            to="/profile"
            style={{
              color: colors.primaryLight,
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              padding: '8px 16px',
              borderRadius: '8px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `rgba(39, 174, 96, 0.1)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            ← Cancel
          </Link>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            background: `rgba(231, 76, 60, 0.1)`,
            border: `1px solid ${colors.error}`,
            color: colors.error,
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            {error}
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div style={{
            background: `rgba(39, 174, 96, 0.1)`,
            border: `1px solid ${colors.success}`,
            color: colors.success,
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Avatar Section */}
          <div style={{
            marginBottom: '30px',
            textAlign: 'center',
            paddingBottom: '30px',
            borderBottom: `1px solid ${colors.border}`
          }}>
            <label style={{
              display: 'block',
              color: colors.text,
              fontWeight: '600',
              marginBottom: '12px',
              fontSize: '14px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Profile Avatar
            </label>
            {avatarPreview && (
              <img
                src={avatarPreview}
                alt="Avatar Preview"
                style={{
                  width: '140px',
                  height: '140px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  display: 'inline-block',
                  marginBottom: '16px',
                  border: `4px solid ${colors.primary}`,
                  boxShadow: `0 8px 24px rgba(27, 77, 62, 0.3)`,
                  transition: 'all 0.3s ease'
                }}
              />
            )}
            <div style={{
              position: 'relative',
              display: 'inline-block',
              width: '100%'
            }}>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{
                  display: 'none',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%'
                }}
                id="avatarInput"
              />
              <label
                htmlFor="avatarInput"
                style={{
                  display: 'inline-block',
                  padding: '12px 24px',
                  background: colors.primaryLight,
                  color: colors.secondary,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  boxShadow: `0 4px 12px rgba(39, 174, 96, 0.3)`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 8px 20px rgba(39, 174, 96, 0.4)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `0 4px 12px rgba(39, 174, 96, 0.3)`;
                }}
              >
                📤 Change Avatar
              </label>
            </div>
          </div>

          {/* Form Fields */}
          <div style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
            {[
              { label: 'Full Name', name: 'name', type: 'text', required: true },
              { label: 'Email Address', name: 'email', type: 'email', value: user?.email, disabled: true },
              { label: 'Contact Number', name: 'contact', type: 'text' },
              { label: 'City', name: 'city', type: 'text' },
              { label: 'Barangay', name: 'barangay', type: 'text' },
              { label: 'Street', name: 'street', type: 'text' },
              { label: 'Zip Code', name: 'zipcode', type: 'text' }
            ].map((field) => (
              <div key={field.name}>
                <label style={{
                  display: 'block',
                  color: colors.text,
                  fontWeight: '600',
                  marginBottom: '6px',
                  fontSize: '13px'
                }}>
                  {field.label}
                </label>
                <input
                  type={field.type}
                  name={field.name}
                  value={field.value !== undefined ? field.value : formData[field.name]}
                  onChange={handleChange}
                  placeholder={field.label}
                  required={field.required}
                  disabled={field.disabled}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: `2px solid ${colors.border}`,
                    borderRadius: '12px',
                    fontSize: '14px',
                    transition: 'all 0.3s ease',
                    background: field.disabled ? `rgba(0, 0, 0, 0.05)` : colors.secondary,
                    color: colors.text,
                    boxSizing: 'border-box',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => {
                    if (!field.disabled) {
                      e.target.style.borderColor = colors.primary;
                      e.target.style.boxShadow = `0 0 0 3px rgba(27, 77, 62, 0.1)`;
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = colors.border;
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving}
            style={{
              width: '100%',
              padding: '14px 24px',
              background: colors.primary,
              color: colors.secondary,
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: saving ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: `0 4px 12px rgba(27, 77, 62, 0.3)`,
              opacity: saving ? 0.7 : 1
            }}
            onMouseEnter={(e) => {
              if (!saving) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 8px 20px rgba(27, 77, 62, 0.4)`;
              }
            }}
            onMouseLeave={(e) => {
              if (!saving) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `0 4px 12px rgba(27, 77, 62, 0.3)`;
              }
            }}
          >
            {saving ? '💾 Saving...' : '💾 Save Changes'}
          </button>
        </form>
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
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default EditProfile;
