import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '/logowalangbg.png';

const Register = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const navigate = useNavigate();

const colors = {
    primary: '#000000',
    primaryLight: '#1B4332',
    secondary: '#FFFFFF',
    background: '#050505',
    text: '#FFFFFF',
    textLight: '#ADB5BD',
    border: '#1B4332',
    borderFocus: '#52B788',
    error: '#DC3545',
    success: '#52B788',
    gradientEnd: '#1B4332',
    accent: '#52B788',
  };

const styles = {
    splitContainer: { minHeight: '100vh', display: 'flex', width: '100%', background: '#050505' },
leftColumn: {
      flex: '0 0 60%',
      background: 'linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.7) 100%), url(/registerBG.webp)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
      position: 'relative',
      overflow: 'hidden',
      minHeight: '100vh',
    },
    geometricOverlay: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' },
    welcomeContent: { textAlign: 'center', maxWidth: '420px', position: 'relative', zIndex: 1 },
    welcomeTitle: { fontSize: '42px', fontWeight: '700', color: '#ffffff', marginBottom: '20px', fontFamily: "'Playfair Display', serif", lineHeight: '1.2', textShadow: '0 0 30px rgba(82, 183, 136, 0.3)' },
    welcomeSubtitle: { fontSize: '17px', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '36px', lineHeight: '1.6', fontFamily: "'Inter', sans-serif" },
    signinButton: { display: 'inline-block', padding: '16px 40px', background: 'transparent', color: '#52B788', border: '2px solid #52B788', borderRadius: '50px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s ease', textDecoration: 'none', fontFamily: "'Inter', sans-serif" },
    rightColumn: { flex: '0 0 40%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg, #f7faf6 0%, #edf5ee 100%)', padding: '40px', minHeight: '100vh' },
    authCard: { width: '100%', maxWidth: '440px' },
    logoTop: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginBottom: '40px' },
    logoImg: { width: '150px', height: '150px', objectFit: 'contain', borderRadius: '20px' },
    logoText: { fontSize: '30px', fontWeight: '800', color: '#1e5a46', fontFamily: "'Playfair Display', serif", letterSpacing: '0.3px', textShadow: '0 6px 20px rgba(27, 67, 50, 0.18)', textAlign: 'center' },
    authTitle: { fontSize: '32px', fontWeight: '700', color: '#133a2e', marginBottom: '8px', fontFamily: "'Playfair Display', serif" },
    authSubtitle: { fontSize: '15px', color: '#46524d', marginBottom: '32px' },
    alert: { padding: '14px 16px', borderRadius: '10px', marginBottom: '24px', display: 'flex', alignItems: 'center', fontSize: '14px' },
    alertError: { backgroundColor: 'rgba(220, 53, 69, 0.1)', border: `1px solid ${colors.error}`, color: colors.error },
    alertSuccess: { backgroundColor: 'rgba(82, 183, 136, 0.1)', border: `1px solid ${colors.success}`, color: colors.success },
    formGroup: { marginBottom: '20px' },
    requiredLabel: { display: 'block', color: '#2f3a37', fontWeight: '600', marginBottom: '8px', fontSize: '14px', fontFamily: "'Inter', sans-serif" },
    requiredStar: { color: colors.error },
    input: { width: '100%', padding: '14px 16px', border: '2px solid #b7c9bf', borderRadius: '12px', fontSize: '15px', transition: 'all 0.3s ease', background: '#ffffff', boxSizing: 'border-box', color: '#1f2a24', fontFamily: "'Inter', sans-serif" },
    passwordContainer: { position: 'relative' },
    passwordToggle: { position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '4px', color: '#5e6c66', zIndex: '2' },
    smallText: { display: 'block', color: '#5f6b66', fontSize: '12px', marginTop: '6px', fontFamily: "'Inter', sans-serif" },
    submitButton: { width: '100%', padding: '16px', background: 'linear-gradient(135deg, #52B788 0%, #1B4332 50%, #000000 100%)', color: '#FFFFFF', border: '1px solid rgba(82, 183, 136, 0.3)', borderRadius: '50px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '12px', fontFamily: "'Inter', sans-serif", boxShadow: '0 4px 15px rgba(82, 183, 136, 0.3)' },
    spinner: { width: '18px', height: '18px', border: '2px solid rgba(255, 255, 255, 0.3)', borderRadius: '50%', borderTopColor: 'white', animation: 'spin 1s ease-in-out infinite' },
    footer: { textAlign: 'center', marginTop: '32px', color: '#4b5752', fontSize: '15px', fontFamily: "'Inter', sans-serif" },
    link: { color: '#52B788', textDecoration: 'none', fontWeight: '600' },
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      const userData = { name: formData.name, email: formData.email, password: formData.password };
      const response = await axios.post(`${API_BASE_URL}/api/v1/users/register`, userData, { headers: { 'Content-Type': 'application/json' } });

      if (response.data.success) {
        setSuccess(response.data.message);
        setFormData({ name: '', email: '', password: '', confirmPassword: '' });
        setTimeout(() => navigate('/login'), 3000);
      }
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response) setError(error.response.data.message || 'Registration failed. Please try again.');
      else if (error.request) setError('Cannot connect to server. Please check if backend is running.');
      else setError('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTransition = (e, targetPath) => {
    e.preventDefault();
    setIsTransitioning(true);
    setTimeout(() => {
      navigate(targetPath);
    }, 300);
  };

  const leftColumnStyle = {
    ...styles.leftColumn,
    transition: 'transform 0.85s cubic-bezier(0.16, 0.84, 0.44, 1), opacity 0.85s ease',
    transform: isTransitioning ? 'translateX(-18px)' : 'translateX(0)',
    opacity: isTransitioning ? 0 : 1,
  };

  const rightColumnStyle = {
    ...styles.rightColumn,
    transition: 'transform 0.85s cubic-bezier(0.16, 0.84, 0.44, 1), opacity 0.85s ease',
    transform: isTransitioning ? 'translateX(18px)' : 'translateX(0)',
    opacity: isTransitioning ? 0 : 1,
  };

  return (
    <div style={{...styles.splitContainer}}>
      <div style={leftColumnStyle}>
        <div style={styles.geometricOverlay}>
          <svg width="100%" height="100%" viewBox="0 0 400 400" preserveAspectRatio="none">
            <circle cx="350" cy="50" r="200" fill="rgba(255,255,255,0.05)" />
            <circle cx="0" cy="400" r="150" fill="rgba(255,255,255,0.03)" />
            <polygon points="400,0 500,0 400,200" fill="rgba(255,255,255,0.04)" />
            <circle cx="100" cy="100" r="80" fill="rgba(255,255,255,0.03)" />
          </svg>
        </div>
        <div style={styles.welcomeContent}>
          <h2 style={styles.welcomeTitle}>Welcome to PiperSmart</h2>
          <p style={styles.welcomeSubtitle}>Join our community of growers and spice experts to discover new harvest opportunities!</p>
          <Link to="/login" style={styles.signinButton} onClick={(e) => handleTransition(e, '/login')}>Sign In</Link>
        </div>
      </div>

      <div style={rightColumnStyle}>
        <div style={styles.authCard}>
          <div style={styles.logoTop}>
            <img src={logo} alt="PiperSmart Logo" style={styles.logoImg} />
            <span style={styles.logoText}>PiperSmart</span>
          </div>
          <h1 style={styles.authTitle}>Create Your Account</h1>
          <p style={styles.authSubtitle}>Start your journey with us today!</p>
          {error && <div style={{...styles.alert, ...styles.alertError}}>{error}</div>}
          {success && <div style={{...styles.alert, ...styles.alertSuccess}}>{success}</div>}

          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label htmlFor="name" style={styles.requiredLabel}>Full Name <span style={styles.requiredStar}>*</span></label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Enter your full name" required disabled={loading} style={styles.input} />
            </div>
            <div style={styles.formGroup}>
              <label htmlFor="email" style={styles.requiredLabel}>Email Address <span style={styles.requiredStar}>*</span></label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" required disabled={loading} style={styles.input} />
            </div>
            <div style={styles.formGroup}>
              <label htmlFor="password" style={styles.requiredLabel}>Password <span style={styles.requiredStar}>*</span></label>
              <div style={styles.passwordContainer}>
                <input type={showPassword ? 'text' : 'password'} id="password" name="password" value={formData.password} onChange={handleChange} placeholder="Create a password" required disabled={loading} style={styles.input} />
                <button type="button" style={styles.passwordToggle} onClick={() => setShowPassword(!showPassword)} disabled={loading}>{showPassword ? '🙈' : '👁️'}</button>
              </div>
              <small style={styles.smallText}>Minimum 6 characters</small>
            </div>
            <div style={styles.formGroup}>
              <label htmlFor="confirmPassword" style={styles.requiredLabel}>Confirm Password <span style={styles.requiredStar}>*</span></label>
              <div style={styles.passwordContainer}>
                <input type={showConfirmPassword ? 'text' : 'password'} id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm your password" required disabled={loading} style={styles.input} />
                <button type="button" style={styles.passwordToggle} onClick={() => setShowConfirmPassword(!showConfirmPassword)} disabled={loading}>{showConfirmPassword ? '🙈' : '👁️'}</button>
              </div>
            </div>
            <button type="submit" style={styles.submitButton} disabled={loading}>
              {loading ? <><span style={styles.spinner}></span>Creating Account...</> : 'Create Account'}
            </button>
          </form>
          <div style={styles.footer}>
            <p>🌱 Welcome to PiperSmart!</p>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input:focus { outline: none; border-color: ${colors.borderFocus} !important; box-shadow: 0 0 0 3px rgba(27, 67, 50, 0.15) !important; }
        button:disabled { opacity: 0.6; cursor: not-allowed; }
        input:disabled { background-color: #f2f4f3; cursor: not-allowed; color: #6b7370; }
        input::placeholder { color: #7b8a83; }
        a:hover { text-decoration: underline; }
        button:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(27, 67, 50, 0.4); }
        .signinButton:hover { background: rgba(255,255,255,0.15) !important; transform: translateY(-2px) scale(1.02); }
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');
      `}</style>
    </div>
  );
};

export default Register;
