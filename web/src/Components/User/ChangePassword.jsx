import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../shared/Header';

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    error: '#DC3545',
    success: '#28A745',
    accent: '#52B788',
    gold: '#D4AF37',
  };

  const styles = {
    pageWrapper: { minHeight: '100vh', position: 'relative' },
    pageBackground: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 },
    backgroundImage: { width: '100%', height: '100%', objectFit: 'cover' },
    backgroundOverlay: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0, 0, 0, 0.6)' },
    contentWrapper: { position: 'relative', zIndex: 1, minHeight: '100vh', padding: '120px 20px 40px', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' },
    card: { width: '100%', maxWidth: '440px', background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', borderRadius: '16px', padding: '40px', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)' },
    header: { textAlign: 'center', marginBottom: '32px' },
    logoTop: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '24px' },
    logoIcon: { width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #52B788 0%, #1B4332 100%)', borderRadius: '12px', fontSize: '24px' },
    logoText: { fontSize: '24px', fontWeight: '700', color: '#52B788', fontFamily: "'Playfair Display', serif" },
    title: { fontSize: '28px', fontWeight: '700', color: '#1B4332', marginBottom: '8px', fontFamily: "'Playfair Display', serif" },
    subtitle: { fontSize: '15px', color: '#636464', marginBottom: '0' },
    alert: { padding: '14px 16px', borderRadius: '10px', marginBottom: '24px', display: 'flex', alignItems: 'center', fontSize: '14px' },
    alertError: { backgroundColor: 'rgba(220, 53, 69, 0.1)', border: `1px solid ${colors.error}`, color: colors.error },
    alertSuccess: { backgroundColor: 'rgba(40, 167, 69, 0.1)', border: `1px solid ${colors.success}`, color: colors.success },
    formGroup: { marginBottom: '20px' },
    label: { display: 'block', color: '#5f5f5f', fontWeight: '600', marginBottom: '8px', fontSize: '14px', fontFamily: "'Inter', sans-serif" },
    inputContainer: { position: 'relative' },
    input: { width: '100%', padding: '14px 16px', paddingRight: '48px', border: '2px solid #1B4332', borderRadius: '12px', fontSize: '15px', transition: 'all 0.3s ease', background: 'rgba(255, 255, 255, 0.9)', boxSizing: 'border-box', color: '#1B4332', fontFamily: "'Inter', sans-serif" },
    passwordToggle: { position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '4px', color: '#5f5f5f', zIndex: '2' },
    submitButton: { width: '100%', padding: '16px', background: 'linear-gradient(135deg, #52B788 0%, #1B4332 50%, #000000 100%)', color: '#FFFFFF', border: '1px solid rgba(82, 183, 136, 0.3)', borderRadius: '50px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '28px', fontFamily: "'Inter', sans-serif", boxShadow: '0 4px 15px rgba(82, 183, 136, 0.3)' },
    spinner: { width: '18px', height: '18px', border: '2px solid rgba(255, 255, 255, 0.3)', borderRadius: '50%', borderTopColor: 'white', animation: 'spin 1s ease-in-out infinite' },
    backLink: { display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '24px', color: '#52B788', textDecoration: 'none', fontSize: '14px', fontWeight: '600', fontFamily: "'Inter', sans-serif", gap: '8px' },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('You must be logged in');

      const response = await axios.put(
        `${API_BASE_URL}/api/v1/users/change-password`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setMessage(response.data.message || 'Password changed successfully');
        setTimeout(() => navigate('/profile'), 2000);
      } else {
        setError(response.data.message || 'Failed to change password');
      }
    } catch (err) {
      console.error('Change password error:', err);
      setError(err.response?.data?.message || err.message || 'Server error');
    } finally {
      setLoading(false);
    }
  };

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
              <div style={styles.logoIcon}><span style={{color: '#fff', fontSize: '24px'}}>P</span></div>
              <span style={styles.logoText}>PiperSmart</span>
            </div>
            <h1 style={styles.title}>Change Password</h1>
            <p style={styles.subtitle}>Update your account password</p>
          </div>

          {message && (
            <div style={{ ...styles.alert, ...styles.alertSuccess }}>
              <span>✓ {message}</span>
            </div>
          )}
          {error && (
            <div style={{ ...styles.alert, ...styles.alertError }}>
              <span>⚠ {error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label htmlFor="currentPassword" style={styles.label}>Current Password</label>
              <div style={styles.inputContainer}>
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  id="currentPassword"
                  placeholder="Enter your current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  style={styles.input}
                />
                <button
                  type="button"
                  style={styles.passwordToggle}
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <span style={{color: '#1B4332'}}>🙈</span> : <span style={{color: '#1B4332'}}>👁</span>}
                </button>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="newPassword" style={styles.label}>New Password</label>
              <div style={styles.inputContainer}>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  id="newPassword"
                  placeholder="Enter your new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  style={styles.input}
                />
                <button
                  type="button"
                  style={styles.passwordToggle}
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <span style={{color: '#1B4332'}}>🙈</span> : <span style={{color: '#1B4332'}}>👁</span>}
                </button>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="confirmPassword" style={styles.label}>Confirm New Password</label>
              <div style={styles.inputContainer}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  style={styles.input}
                />
                <button
                  type="button"
                  style={styles.passwordToggle}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <span style={{color: '#1B4332'}}>🙈</span> : <span style={{color: '#1B4332'}}>👁</span>}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={styles.submitButton}
            >
              {loading ? <><span style={styles.spinner}></span>Updating...</> : '🔑 Update Password'}
            </button>
          </form>

          <Link to="/profile" style={styles.backLink}>
            ← Back to Profile
          </Link>
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

export default ChangePassword;

