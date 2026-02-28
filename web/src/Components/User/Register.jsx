import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

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

  const navigate = useNavigate();

  // Light green color palette (from mobile LoginScreen design)
  const colors = {
    primary: '#27AE60',        // Medium green
    primaryDark: '#1E8449',    // Dark green
    primaryLight: '#52BE80',   // Light green
    secondary: '#FFFFFF',      // White
    background: '#F0F9F4',     // Very light green background
    backgroundHover: '#E8F6F0', // Lighter green hover
    text: '#1B4D3E',           // Dark green text
    textLight: '#52866A',      // Medium green text
    border: '#C8E6C9',         // Light green border
    borderFocus: '#27AE60',    // Green border when focused
    error: '#E74C3C',          // Red for errors
    success: '#27AE60',        // Green for success
    accent: '#52BE80',         // Light green accent
  };

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: `linear-gradient(135deg, ${colors.primaryLight} 0%, ${colors.primary} 100%)`,
      padding: '20px',
    },
    card: {
      background: colors.secondary,
      borderRadius: '16px',
      boxShadow: `0 20px 60px rgba(39, 174, 96, 0.15)`,
      width: '100%',
      maxWidth: '500px',
      padding: '40px',
      animation: 'slideUp 0.5s ease',
    },
    header: {
      textAlign: 'center',
      marginBottom: '40px',
    },
    logoContainer: {
      width: '100px',
      height: '100px',
      margin: '0 auto 16px',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(39, 174, 96, 0.1)',
      borderRadius: '20px',
      borderWidth: '1px',
      borderColor: 'rgba(39, 174, 96, 0.2)',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      display: 'flex',
      animation: 'float 3s ease-in-out infinite',
    },
    logo: {
      width: '80%',
      height: '80%',
      fontSize: '48px',
    },
    headerH2: {
      color: colors.text,
      fontSize: '32px',
      fontWeight: '800',
      marginBottom: '8px',
      letterSpacing: '-0.5px',
    },
    headerP: {
      color: colors.textLight,
      fontSize: '14px',
      opacity: '0.8',
    },
    alert: {
      padding: '12px 16px',
      borderRadius: '8px',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
    },
    alertError: {
      backgroundColor: 'rgba(231, 76, 60, 0.1)',
      border: `1px solid ${colors.error}`,
      color: colors.error,
    },
    alertSuccess: {
      backgroundColor: 'rgba(39, 174, 96, 0.1)',
      border: `1px solid ${colors.success}`,
      color: colors.success,
    },
    formGroup: {
      marginBottom: '20px',
    },
    requiredLabel: {
      display: 'block',
      color: colors.text,
      fontWeight: '600',
      marginBottom: '8px',
      fontSize: '14px',
    },
    requiredStar: {
      color: colors.error,
    },
    input: {
      width: '100%',
      padding: '14px 16px',
      border: `2px solid ${colors.border}`,
      borderRadius: '12px',
      fontSize: '15px',
      transition: 'all 0.3s ease',
      background: colors.backgroundHover,
      boxSizing: 'border-box',
      color: colors.text,
      fontFamily: 'inherit',
    },
    inputIcon: {
      position: 'absolute',
      left: '16px',
      top: '50%',
      transform: 'translateY(-50%)',
      fontSize: '18px',
      color: colors.textLight,
      transition: 'all 0.3s ease',
    },
    inputWithIcon: {
      paddingLeft: '44px',
    },
    passwordContainer: {
      position: 'relative',
    },
    passwordToggle: {
      position: 'absolute',
      right: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: '16px',
      padding: '4px',
      color: colors.textLight,
      zIndex: '2',
      transition: 'all 0.3s ease',
    },
    smallText: {
      display: 'block',
      color: colors.textLight,
      fontSize: '12px',
      marginTop: '6px',
    },
    submitButton: {
      width: '100%',
      padding: '16px',
      background: colors.primary,
      color: colors.secondary,
      border: `1px solid ${colors.primary}`,
      borderRadius: '12px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      marginTop: '10px',
      boxShadow: `0 4px 12px rgba(39, 174, 96, 0.3)`,
    },
    spinner: {
      width: '18px',
      height: '18px',
      border: '2px solid rgba(255, 255, 255, 0.3)',
      borderRadius: '50%',
      borderTopColor: 'white',
      animation: 'spin 1s ease-in-out infinite',
    },
    footer: {
      textAlign: 'center',
      marginTop: '30px',
      paddingTop: '25px',
      borderTop: `1px solid ${colors.border}`,
      color: colors.textLight,
      fontSize: '15px',
    },
    link: {
      color: colors.accent,
      textDecoration: 'none',
      fontWeight: '600',
    },
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
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      };

      const response = await axios.post(
        `${API_BASE_URL}/api/v1/users/register`,
        userData,
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.data.success) {
        setSuccess(response.data.message);
        setFormData({ name: '', email: '', password: '', confirmPassword: '' });

        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response) {
        setError(error.response.data.message || 'Registration failed. Please try again.');
      } else if (error.request) {
        setError('Cannot connect to server. Please check if backend is running.');
      } else {
        setError('Error: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div 
            style={styles.logoContainer}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(39, 174, 96, 0.2)';
              e.currentTarget.style.transform = 'scale(1.1) translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(39, 174, 96, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(39, 174, 96, 0.1)';
              e.currentTarget.style.transform = 'scale(1) translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <span style={styles.logo}>🌱</span>
          </div>
          <h2 style={styles.headerH2}>PiperSmart</h2>
          <p style={styles.headerP}>Join our community</p>
        </div>

        {error && <div style={{ ...styles.alert, ...styles.alertError }}>{error}</div>}
        {success && <div style={{ ...styles.alert, ...styles.alertSuccess }}>{success}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label htmlFor="name" style={styles.requiredLabel}>
              Full Name <span style={styles.requiredStar}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <span style={styles.inputIcon}>👤</span>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
                disabled={loading}
                style={{...styles.input, ...styles.inputWithIcon}}
                onFocus={(e) => {
                  e.target.style.borderColor = colors.borderFocus;
                  e.target.style.boxShadow = `0 0 0 3px rgba(39, 174, 96, 0.1)`;
                  e.target.parentElement.querySelector('span').style.color = colors.primary;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.border;
                  e.target.style.boxShadow = 'none';
                  e.target.parentElement.querySelector('span').style.color = colors.textLight;
                }}
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="email" style={styles.requiredLabel}>
              Email Address <span style={styles.requiredStar}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <span style={styles.inputIcon}>✉️</span>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                disabled={loading}
                style={{...styles.input, ...styles.inputWithIcon}}
                onFocus={(e) => {
                  e.target.style.borderColor = colors.borderFocus;
                  e.target.style.boxShadow = `0 0 0 3px rgba(39, 174, 96, 0.1)`;
                  e.target.parentElement.querySelector('span').style.color = colors.primary;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.border;
                  e.target.style.boxShadow = 'none';
                  e.target.parentElement.querySelector('span').style.color = colors.textLight;
                }}
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="password" style={styles.requiredLabel}>
              Password <span style={styles.requiredStar}>*</span>
            </label>
            <div style={{...styles.passwordContainer, position: 'relative'}}>
              <span style={styles.inputIcon}>🔒</span>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                disabled={loading}
                style={{...styles.input, ...styles.inputWithIcon}}
                onFocus={(e) => {
                  e.target.style.borderColor = colors.borderFocus;
                  e.target.style.boxShadow = `0 0 0 3px rgba(39, 174, 96, 0.1)`;
                  e.target.parentElement.querySelector('span').style.color = colors.primary;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.border;
                  e.target.style.boxShadow = 'none';
                  e.target.parentElement.querySelector('span').style.color = colors.textLight;
                }}
              />
              <button
                type="button"
                style={{...styles.passwordToggle, left: 'auto'}}
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            <small style={styles.smallText}>Minimum 6 characters</small>
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="confirmPassword" style={styles.requiredLabel}>
              Confirm Password <span style={styles.requiredStar}>*</span>
            </label>
            <div style={{...styles.passwordContainer, position: 'relative'}}>
              <span style={styles.inputIcon}>🔒</span>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
                disabled={loading}
                style={{...styles.input, ...styles.inputWithIcon}}
                onFocus={(e) => {
                  e.target.style.borderColor = colors.borderFocus;
                  e.target.style.boxShadow = `0 0 0 3px rgba(39, 174, 96, 0.1)`;
                  e.target.parentElement.querySelector('span').style.color = colors.primary;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.border;
                  e.target.style.boxShadow = 'none';
                  e.target.parentElement.querySelector('span').style.color = colors.textLight;
                }}
              />
              <button
                type="button"
                style={{...styles.passwordToggle, left: 'auto'}}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
              >
                {showConfirmPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            style={styles.submitButton}
            disabled={loading}
            onMouseEnter={(e) => !loading && (e.target.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => !loading && (e.target.style.transform = 'translateY(0)')}
          >
            {loading ? (
              <>
                <span style={styles.spinner}></span>
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div style={styles.footer}>
          <p>
            Already have an account?{' '}
            <Link to="/login" style={styles.link}>
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        input:focus { 
          outline: none; 
          box-shadow: 0 0 0 3px rgba(39, 174, 96, 0.1) !important; 
        }
        button:disabled { opacity: 0.6; cursor: not-allowed; }
        input:disabled { background-color: #f8f9fa; cursor: not-allowed; }
        a:hover { text-decoration: underline; }
        button:hover:not(:disabled) { box-shadow: 0 5px 15px rgba(39, 174, 96, 0.2); }
        button[type="submit"]:hover:not(:disabled) { 
          box-shadow: 0 10px 20px rgba(39, 174, 96, 0.3); 
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
};

export default Register;
