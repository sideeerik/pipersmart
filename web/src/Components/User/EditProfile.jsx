import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../shared/Header';

const EditProfile = () => {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    city: '',
    barangay: '',
    street: '',
    zipcode: '',
  });

  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  const colors = {
    primary: '#1B4332',
    primaryLight: '#1B4332',
    secondary: '#FFFFFF',
    background: '#050505',
    text: '#1B4332',
    textLight: '#5f5f5f',
    border: '#1B4332',
    borderFocus: '#52B788',
    accent: '#52B788',
    gold: '#D4AF37',
    success: '#28A745',
    error: '#DC3545',
  };

  const styles = {
    pageWrapper: { minHeight: '100vh', position: 'relative' },
    pageBackground: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 },
    backgroundImage: { width: '100%', height: '100%', objectFit: 'cover' },
    backgroundOverlay: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0, 0, 0, 0.6)' },
    contentWrapper: { position: 'relative', zIndex: 1, minHeight: '100vh', padding: '120px 20px 40px', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' },
    card: { width: '100%', maxWidth: '500px', background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', borderRadius: '16px', padding: '40px', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)' },
    header: { textAlign: 'center', marginBottom: '32px' },
    logoTop: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '24px' },
    logoIcon: { width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #52B788 0%, #1B4332 100%)', borderRadius: '12px', fontSize: '24px' },
    logoText: { fontSize: '24px', fontWeight: '700', color: '#52B788', fontFamily: "'Playfair Display', serif" },
    title: { fontSize: '28px', fontWeight: '700', color: '#1B4332', marginBottom: '8px', fontFamily: "'Playfair Display', serif" },
    subtitle: { fontSize: '15px', color: '#636464', marginBottom: '0' },
    backLink: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: '20px', color: '#52B788', textDecoration: 'none', fontSize: '14px', fontWeight: '600', fontFamily: "'Inter', sans-serif", gap: '8px' },
    alert: { padding: '14px 16px', borderRadius: '10px', marginBottom: '24px', display: 'flex', alignItems: 'center', fontSize: '14px' },
    alertError: { backgroundColor: 'rgba(220, 53, 69, 0.1)', border: `1px solid ${colors.error}`, color: colors.error },
    alertSuccess: { backgroundColor: 'rgba(40, 167, 69, 0.1)', border: `1px solid ${colors.success}`, color: colors.success },
    formGroup: { marginBottom: '20px' },
    label: { display: 'block', color: '#5f5f5f', fontWeight: '600', marginBottom: '8px', fontSize: '14px', fontFamily: "'Inter', sans-serif" },
    input: { width: '100%', padding: '14px 16px', border: '2px solid #1B4332', borderRadius: '12px', fontSize: '15px', transition: 'all 0.3s ease', background: 'rgba(255, 255, 255, 0.9)', boxSizing: 'border-box', color: '#1B4332', fontFamily: "'Inter', sans-serif" },
    inputDisabled: { width: '100%', padding: '14px 16px', border: '2px solid #ddd', borderRadius: '12px', fontSize: '15px', background: '#f5f5f5', boxSizing: 'border-box', color: '#888', fontFamily: "'Inter', sans-serif" },
    avatarSection: { textAlign: 'center', marginBottom: '30px', paddingBottom: '30px', borderBottom: '1px solid #D4E5DD' },
    avatarImage: { width: '140px', height: '140px', borderRadius: '50%', objectFit: 'cover', display: 'inline-block', marginBottom: '16px', border: '4px solid #52B788', boxShadow: '0 8px 24px rgba(27, 77, 62, 0.3)', transition: 'all 0.3s ease' },
    avatarLabel: { display: 'inline-block', padding: '12px 24px', background: 'linear-gradient(135deg, #52B788 0%, #1B4332 100%)', color: '#fff', borderRadius: '12px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', transition: 'all 0.3s ease', boxShadow: '0 4px 12px rgba(82, 183, 136, 0.3)', border: 'none' },
    submitButton: { width: '100%', padding: '16px', background: 'linear-gradient(135deg, #52B788 0%, #1B4332 50%, #000000 100%)', color: '#FFFFFF', border: '1px solid rgba(82, 183, 136, 0.3)', borderRadius: '50px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '28px', fontFamily: "'Inter', sans-serif", boxShadow: '0 4px 15px rgba(82, 183, 136, 0.3)' },
    spinner: { width: '18px', height: '18px', border: '2px solid rgba(255, 255, 255, 0.3)', borderRadius: '50%', borderTopColor: 'white', animation: 'spin 1s ease-in-out infinite' },
    loadingWrapper: { minHeight: '100vh', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' },
    loadingCard: { textAlign: 'center', padding: '40px', background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)' },
    loadingSpinner: { width: '50px', height: '50px', border: '4px solid rgba(82, 183, 136, 0.2)', borderTopColor: '#52B788', borderRadius: '50%', margin: '0 auto 20px', animation: 'spin 1s linear infinite' },
    loadingText: { color: '#1B4332', fontSize: '16px', fontWeight: '600', fontFamily: "'Inter', sans-serif" },
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
          setAvatarPreview(user.avatar?.url || '');

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

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
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

      const data = new FormData();
      data.append('name', formData.name.trim());
      data.append('contact', formData.contact || '');
      data.append('city', formData.city || '');
      data.append('barangay', formData.barangay || '');
      data.append('street', formData.street || '');
      data.append('zipcode', formData.zipcode || '');

      if (avatar) {
        data.append('avatar', avatar);
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
      <div style={styles.pageWrapper}>
        <div style={styles.pageBackground}>
          <img src="/paminta.webp" alt="Background" style={styles.backgroundImage} />
          <div style={styles.backgroundOverlay}></div>
        </div>
        <Header />
        <div style={styles.loadingWrapper}>
          <div style={styles.loadingCard}>
            <div style={styles.loadingSpinner}></div>
            <p style={styles.loadingText}>Loading Profile...</p>
          </div>
        </div>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <div style={styles.pageWrapper}>
      {/* Background */}
      <div style={styles.pageBackground}>
        <img src="/paminta.webp" alt="Background" style={styles.backgroundImage} />
        <div style={styles.backgroundOverlay}></div>
      </div>

      {/* Header */}
      <Header />

      {/* Content */}
      <div style={styles.contentWrapper}>
        <div style={styles.card}>
          <div style={styles.header}>
            <div style={styles.logoTop}>
              <div style={styles.logoIcon}>✏️</div>
              <span style={styles.logoText}>PiperSmart</span>
            </div>
            <h1 style={styles.title}>Edit Profile</h1>
            <p style={styles.subtitle}>Update your account information</p>
          </div>

          <Link to="/profile" style={styles.backLink}>
            ← Back to Profile
          </Link>

          {error && (
            <div style={{ ...styles.alert, ...styles.alertError }}>
              <span>⚠ {error}</span>
            </div>
          )}
          {success && (
            <div style={{ ...styles.alert, ...styles.alertSuccess }}>
              <span>✓ {success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Avatar Section */}
            <div style={styles.avatarSection}>
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
                  style={styles.avatarImage}
                />
              )}
              <div style={{ marginTop: '16px' }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                  id="avatarInput"
                />
                <label htmlFor="avatarInput" style={styles.avatarLabel}>
                  📤 Change Avatar
                </label>
              </div>
            </div>

            {/* Form Fields */}
            <div style={styles.formGroup}>
              <label htmlFor="name" style={styles.label}>Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="email" style={styles.label}>Email Address</label>
              <input
                type="email"
                id="email"
                value={user?.email || ''}
                disabled
                style={styles.inputDisabled}
              />
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="contact" style={styles.label}>Contact Number</label>
              <input
                type="text"
                id="contact"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                placeholder="Enter your contact number"
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="city" style={styles.label}>City</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Enter your city"
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="barangay" style={styles.label}>Barangay</label>
              <input
                type="text"
                id="barangay"
                name="barangay"
                value={formData.barangay}
                onChange={handleChange}
                placeholder="Enter your barangay"
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="street" style={styles.label}>Street</label>
              <input
                type="text"
                id="street"
                name="street"
                value={formData.street}
                onChange={handleChange}
                placeholder="Enter your street"
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="zipcode" style={styles.label}>Zip Code</label>
              <input
                type="text"
                id="zipcode"
                name="zipcode"
                value={formData.zipcode}
                onChange={handleChange}
                placeholder="Enter your zip code"
                style={styles.input}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              style={styles.submitButton}
            >
              {saving ? <><span style={styles.spinner}></span>Saving...</> : '💾 Save Changes'}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input:focus { outline: none; border-color: #52B788 !important; box-shadow: 0 0 0 3px rgba(82, 183, 136, 0.2) !important; }
        button:disabled { opacity: 0.6; cursor: not-allowed; }
        button:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(82, 183, 136, 0.4); }
        a:hover { text-decoration: underline; }
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');
      `}</style>
    </div>
  );
};

export default EditProfile;

