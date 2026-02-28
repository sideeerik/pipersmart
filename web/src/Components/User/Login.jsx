import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider, facebookProvider } from '../../config/firebase';

const Login = () => {
  // Get API base URL from environment, default to 4001
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Social login loading states
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isFacebookLoading, setIsFacebookLoading] = useState(false);
  
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
    socialContainer: {
      display: 'flex',
      justifyContent: 'center',
      gap: '20px',
      marginTop: '25px',
    },
    socialButton: {
      width: '50px',
      height: '50px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0',
      border: `2px solid ${colors.border}`,
      borderRadius: '50%',
      background: colors.secondary,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden',
    },
    googleButton: {
      borderColor: colors.border,
    },
    facebookButton: {
      borderColor: colors.border,
    },
    socialIcon: {
      width: '24px',
      height: '24px',
    },
    formGroup: {
      marginBottom: '20px',
    },
    label: {
      display: 'block',
      color: colors.text,
      fontWeight: '600',
      marginBottom: '8px',
      fontSize: '14px',
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
    },
    formOptions: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      margin: '25px 0',
    },
    checkboxLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      cursor: 'pointer',
      fontSize: '14px',
      color: colors.textLight,
    },
    forgotPassword: {
      color: colors.accent,
      textDecoration: 'none',
      fontSize: '14px',
      fontWeight: '600',
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
      marginBottom: '25px',
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
    socialSpinner: {
      width: '20px',
      height: '20px',
      border: `2px solid rgba(39, 174, 96, 0.3)`,
      borderRadius: '50%',
      borderTopColor: colors.primary,
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
    orDivider: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '20px 0',
      color: colors.textLight,
      fontSize: '14px',
    },
    orLine: {
      flex: 1,
      height: '1px',
      background: colors.border,
    },
    orText: {
      padding: '0 15px',
    },
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleLocalLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/users/login`,
        formData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Check if user is admin and redirect accordingly
        if (response.data.user.role === 'admin') {
          navigate('/admin/dashboard');  // Redirect to admin dashboard
        } else {
          navigate('/home');  // Redirect to regular user home
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.response) {
        setError(error.response.data.message || 'Login failed. Please try again.');
      } else if (error.request) {
        setError('Cannot connect to server. Please check if backend is running on port 4001.');
      } else {
        setError('Error: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // ============== GOOGLE LOGIN ==============
  const handleGoogleLogin = async () => {
    setError('');
    setIsGoogleLoading(true);

    try {
      // Sign in with Google using Firebase
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Get the Firebase ID token
      const idToken = await user.getIdToken();

      console.log("🔥 Google login successful:", user.email);

      // Send the token to your backend
      const { data } = await axios.post(`${API_BASE_URL}/api/v1/users/firebase/auth/google`, { idToken })
;

      console.log("✅ Backend authentication successful");

      if (!data.token) {
        throw new Error("No JWT token received from backend");
      }

      // Store user data in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          id: data.user._id,
          avatar: data.user.avatar
        })
      );

      // Redirect based on role
      if (data.user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/home");
      }

    } catch (error) {
      console.error("❌ Google login error:", error);
      
      if (error.code === 'auth/popup-closed-by-user') {
        setError("Google login was cancelled. Please try again.");
      } else if (error.code === 'auth/popup-blocked') {
        setError("Popup was blocked by your browser. Please allow popups for this site.");
      } else if (error.code === 'auth/network-request-failed') {
        setError("Network error. Please check your internet connection.");
      } else {
        setError("Google login failed. Please try again.");
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // ============== FACEBOOK LOGIN ==============
  const handleFacebookLogin = async () => {
    setError('');
    setIsFacebookLoading(true);

    try {
      // Clear any existing auth state to force account selection
      await auth.signOut();
      
      // Add a small delay to ensure signOut completes
      await new Promise(resolve => setTimeout(resolve, 500));

      // Sign in with Facebook using Firebase
      const result = await signInWithPopup(auth, facebookProvider);
      const user = result.user;
      
      // Get the Firebase ID token
      const idToken = await user.getIdToken();

      console.log("🔥 Facebook login successful:", user.email);

      // Send the token to your backend
      const { data } = await axios.post(`${API_BASE_URL}/api/v1/users/firebase/auth/facebook`, { idToken })
;

      console.log("✅ Backend authentication successful");

      if (!data.token) {
        throw new Error("No JWT token received from backend");
      }

      // Store user data in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          id: data.user._id,
          avatar: data.user.avatar
        })
      );

      // Redirect based on role
      if (data.user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/home");
      }

    } catch (error) {
      console.error("❌ Facebook login error:", error);
      
      // Handle specific Facebook auth errors
      if (error.code === 'auth/popup-closed-by-user') {
        console.log("ℹ️ User closed Facebook login popup");
        setError(""); // Clear any previous messages
        return;
      } else if (error.code === 'auth/popup-blocked') {
        setError("Popup was blocked by your browser. Please allow popups for this site.");
      } else if (error.code === 'auth/network-request-failed') {
        setError("Network error. Please check your internet connection.");
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        setError("An account already exists with the same email but different sign-in method.");
      } else {
        setError("Facebook login failed. Please try again.");
      }
    } finally {
      setIsFacebookLoading(false);
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
          <p style={styles.headerP}>Smart Pepper Care</p>
        </div>

        {error && (
          <div style={{...styles.alert, ...styles.alertError}}>
            <span>{error}</span>
          </div>
        )}

        {/* Local Login Form */}
        <form onSubmit={handleLocalLogin}>
          <div style={styles.formGroup}>
            <label htmlFor="email" style={styles.label}>Email Address</label>
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
                disabled={loading || isGoogleLoading || isFacebookLoading}
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
            <label htmlFor="password" style={styles.label}>Password</label>
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
                disabled={loading || isGoogleLoading || isFacebookLoading}
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
                disabled={loading || isGoogleLoading || isFacebookLoading}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div style={styles.formOptions}>
            <label style={styles.checkboxLabel}>
              <input type="checkbox" disabled={loading || isGoogleLoading || isFacebookLoading} />
              <span>Remember me</span>
            </label>
            <Link to="/forgot-password" style={styles.forgotPassword}>
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            style={styles.submitButton}
            disabled={loading || isGoogleLoading || isFacebookLoading}
            onMouseEnter={(e) => !loading && !isGoogleLoading && !isFacebookLoading && (e.target.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => !loading && !isGoogleLoading && !isFacebookLoading && (e.target.style.transform = 'translateY(0)')}
          >
            {loading ? (
              <>
                <span style={styles.spinner}></span>
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* OR Divider */}
        <div style={styles.orDivider}>
          <div style={styles.orLine}></div>
          <div style={styles.orText}>Or sign in with</div>
          <div style={styles.orLine}></div>
        </div>

        {/* Social Login Buttons - Logo Only */}
        <div style={styles.socialContainer}>
          {/* Google Login Button */}
          <button
            type="button" 
            style={{...styles.socialButton, ...styles.googleButton}}
            onClick={handleGoogleLogin}
            disabled={loading || isGoogleLoading || isFacebookLoading}
            onMouseEnter={(e) => !loading && !isGoogleLoading && !isFacebookLoading && (e.currentTarget.style.transform = 'translateY(-4px) scale(1.1)', e.currentTarget.style.boxShadow = '0 8px 16px rgba(66, 133, 244, 0.3)')}
            onMouseLeave={(e) => !loading && !isGoogleLoading && !isFacebookLoading && (e.currentTarget.style.transform = 'translateY(0)', e.currentTarget.style.boxShadow = 'none')}
            title="Continue with Google"
          >
            {isGoogleLoading ? (
              <span style={styles.socialSpinner}></span>
            ) : (
              <svg style={styles.socialIcon} viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
          </button>

          {/* Facebook Login Button */}
          <button 
            type="button" 
            style={{...styles.socialButton, ...styles.facebookButton}}
            onClick={handleFacebookLogin}
            disabled={loading || isFacebookLoading || isGoogleLoading}
            onMouseEnter={(e) => !loading && !isFacebookLoading && !isGoogleLoading && (e.currentTarget.style.transform = 'translateY(-4px) scale(1.1)', e.currentTarget.style.boxShadow = '0 8px 16px rgba(24, 119, 242, 0.3)')}
            onMouseLeave={(e) => !loading && !isFacebookLoading && !isGoogleLoading && (e.currentTarget.style.transform = 'translateY(0)', e.currentTarget.style.boxShadow = 'none')}
            title="Continue with Facebook"
          >
            {isFacebookLoading ? (
              <span style={styles.socialSpinner}></span>
            ) : (
              <svg style={styles.socialIcon} viewBox="0 0 24 24">
                <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            )}
          </button>
        </div>

        <div style={styles.footer}>
          <p>
            Don't have an account?{' '}
            <Link to="/register" style={styles.link}>
              Sign up
            </Link>
          </p>
        </div>
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
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(39, 174, 96, 0.7);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(39, 174, 96, 0);
          }
        }
        input:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(39, 174, 96, 0.1) !important;
        }
        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        input:disabled {
          background-color: #f8f9fa;
          cursor: not-allowed;
        }
        a:hover {
          text-decoration: underline;
        }
        button:hover:not(:disabled) {
          box-shadow: 0 5px 15px rgba(39, 174, 96, 0.2);
        }
        button[type="submit"]:hover:not(:disabled) {
          box-shadow: 0 10px 20px rgba(39, 174, 96, 0.3);
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
};

export default Login;