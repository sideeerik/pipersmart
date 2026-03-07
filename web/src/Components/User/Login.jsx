import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider, facebookProvider } from '../../config/firebase';

const Login = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isFacebookLoading, setIsFacebookLoading] = useState(false);
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
    gradientEnd: '#1B4332',
    accent: '#52B788',
  };

const styles = {
    splitContainer: { minHeight: '100vh', display: 'flex', width: '100%', background: '#050505' },
leftColumn: { flex: '0 0 40%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0eeeece', padding: '40px', minHeight: '100vh' },
    authCard: { width: '100%', maxWidth: '440px' },
    logoTop: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' },
    logoIcon: { width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #52B788 0%, #1B4332 100%)', borderRadius: '10px', fontSize: '20px' },
    logoText: { fontSize: '22px', fontWeight: '700', color: '#52B788', fontFamily: "'Playfair Display', serif", textShadow: '0 0 20px rgba(82, 183, 136, 0.3)' },
    authTitle: { fontSize: '32px', fontWeight: '700', color: '#15684c', marginBottom: '8px', fontFamily: "'Playfair Display', serif" },
    authSubtitle: { fontSize: '15px', color: '#636464', marginBottom: '32px' },
    alert: { padding: '14px 16px', borderRadius: '10px', marginBottom: '24px', display: 'flex', alignItems: 'center', fontSize: '14px' },
    alertError: { backgroundColor: 'rgba(220, 53, 69, 0.1)', border: `1px solid ${colors.error}`, color: colors.error },
    formGroup: { marginBottom: '20px' },
    label: { display: 'block', color: '#5f5f5f', fontWeight: '600', marginBottom: '8px', fontSize: '14px', fontFamily: "'Inter', sans-serif" },
    input: { width: '100%', padding: '14px 16px', border: '2px solid #1B4332', borderRadius: '12px', fontSize: '15px', transition: 'all 0.3s ease', background: 'rgba(0, 0, 0, 0.5)', boxSizing: 'border-box', color: '#5c5b5b', fontFamily: "'Inter', sans-serif" },
    passwordContainer: { position: 'relative' },
    passwordToggle: { position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '4px', color: '#ADB5BD', zIndex: '2' },
    formOptions: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '24px 0' },
    checkboxLabel: { display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', color: '#626364', fontFamily: "'Inter', sans-serif" },
    forgotPassword: { color: '#52B788', textDecoration: 'none', fontSize: '14px', fontWeight: '600', fontFamily: "'Inter', sans-serif" },
    submitButton: { width: '100%', padding: '16px', background: 'linear-gradient(135deg, #52B788 0%, #1B4332 50%, #000000 100%)', color: '#FFFFFF', border: '1px solid rgba(82, 183, 136, 0.3)', borderRadius: '50px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '28px', fontFamily: "'Inter', sans-serif", boxShadow: '0 4px 15px rgba(82, 183, 136, 0.3)' },
    spinner: { width: '18px', height: '18px', border: '2px solid rgba(255, 255, 255, 0.3)', borderRadius: '50%', borderTopColor: 'white', animation: 'spin 1s ease-in-out infinite' },
    orDivider: { display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '24px 0', color: '#ADB5BD', fontSize: '14px', fontFamily: "'Inter', sans-serif" },
    orLine: { flex: 1, height: '1px', background: 'rgba(82, 183, 136, 0.3)' },
    orText: { padding: '0 16px' },
    socialContainer: { display: 'flex', justifyContent: 'center', gap: '16px' },
    socialButton: { width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0', border: '2px solid rgba(82, 183, 136, 0.3)', borderRadius: '50%', background: 'rgba(0, 0, 0, 0.3)', cursor: 'pointer', transition: 'all 0.3s ease' },
    socialIcon: { width: '24px', height: '24px' },
    socialSpinner: { width: '20px', height: '20px', border: '2px solid rgba(82, 183, 136, 0.3)', borderRadius: '50%', borderTopColor: '#52B788', animation: 'spin 1s ease-in-out infinite' },
    footer: { textAlign: 'center', marginTop: '32px', color: '#ADB5BD', fontSize: '15px', fontFamily: "'Inter', sans-serif" },
    link: { color: '#52B788', textDecoration: 'none', fontWeight: '600' },
rightColumn: { flex: '0 0 60%', background: 'linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.7) 100%), url(/LoginBG.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', position: 'relative', overflow: 'hidden', minHeight: '100vh' },
    geometricOverlay: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' },
    welcomeContent: { textAlign: 'center', maxWidth: '420px', position: 'relative', zIndex: 1 },
    welcomeTitle: { fontSize: '42px', fontWeight: '700', color: '#FFFFFF', marginBottom: '20px', fontFamily: "'Playfair Display', serif", lineHeight: '1.2', textShadow: '0 0 30px rgba(82, 183, 136, 0.3)' },
welcomeSubtitle: { fontSize: '17px', color: 'rgba(255, 255, 255, 0.95)', marginBottom: '36px', lineHeight: '1.6', fontFamily: "'Inter', sans-serif" },
    signupButton: { display: 'inline-block', padding: '16px 40px', background: 'transparent', color: '#52B788', border: '2px solid #52B788', borderRadius: '50px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s ease', textDecoration: 'none', fontFamily: "'Inter', sans-serif" },
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
      const response = await axios.post(`${API_BASE_URL}/api/v1/users/login`, formData, { headers: { 'Content-Type': 'application/json' } });

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        if (response.data.user.role === 'admin') navigate('/admin/dashboard');
        else navigate('/home');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.response) setError(error.response.data.message || 'Login failed. Please try again.');
      else if (error.request) setError('Cannot connect to server. Please check if backend is running.');
      else setError('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsGoogleLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const idToken = await user.getIdToken();
      const { data } = await axios.post(`${API_BASE_URL}/api/v1/users/firebase/auth/google`, { idToken });

      if (!data.token) throw new Error("No JWT token received from backend");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify({ 
        name: data.user.name, 
        email: data.user.email, 
        role: data.user.role, 
        id: data.user._id, 
        avatar: data.user.avatar 
      }));

      if (data.user.role === "admin") navigate("/admin/dashboard");
      else navigate("/home");

    } catch (error) {
      console.error("Google login error:", error);
      if (error.code === 'auth/popup-closed-by-user') setError("Google login was cancelled.");
      else if (error.code === 'auth/popup-blocked') setError("Popup was blocked by your browser.");
      else setError("Google login failed. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setError('');
    setIsFacebookLoading(true);

    try {
      await auth.signOut();
      await new Promise(resolve => setTimeout(resolve, 500));
      const result = await signInWithPopup(auth, facebookProvider);
      const user = result.user;
      const idToken = await user.getIdToken();
      const { data } = await axios.post(`${API_BASE_URL}/api/v1/users/firebase/auth/facebook`, { idToken });

      if (!data.token) throw new Error("No JWT token received from backend");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify({ 
        name: data.user.name, 
        email: data.user.email, 
        role: data.user.role, 
        id: data.user._id, 
        avatar: data.user.avatar 
      }));

      if (data.user.role === "admin") navigate("/admin/dashboard");
      else navigate("/home");

    } catch (error) {
      console.error("Facebook login error:", error);
      if (error.code === 'auth/popup-closed-by-user') { setError(""); return; }
      else if (error.code === 'auth/popup-blocked') setError("Popup was blocked by your browser.");
      else setError("Facebook login failed. Please try again.");
    } finally {
      setIsFacebookLoading(false);
    }
  };

  const handleTransition = (e, targetPath) => {
    e.preventDefault();
    setIsTransitioning(true);
    setTimeout(() => {
      navigate(targetPath);
    }, 300);
  };

  return (
    <div style={{...styles.splitContainer, opacity: isTransitioning ? 0 : 1, transition: 'opacity 0.3s ease'}}>
      <div style={styles.leftColumn}>
        <div style={styles.authCard}>
          <div style={styles.logoTop}>
            <img src="/logowalangbg.png" alt="PiperSmart Logo" style={{ width: '90px', height: '90px', borderRadius: '16px' }} />
            <span style={styles.logoText}>PiperSmart</span>
          </div>

          <h1 style={styles.authTitle}>Login to Your Account</h1>
          <p style={styles.authSubtitle}>Welcome back! Please enter your details.</p>

          {error && <div style={{...styles.alert, ...styles.alertError}}><span>{error}</span></div>}

          <form onSubmit={handleLocalLogin}>
            <div style={styles.formGroup}>
              <label htmlFor="email" style={styles.label}>Email Address</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" required disabled={loading || isGoogleLoading || isFacebookLoading} style={styles.input} />
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="password" style={styles.label}>Password</label>
              <div style={styles.passwordContainer}>
                <input type={showPassword ? 'text' : 'password'} id="password" name="password" value={formData.password} onChange={handleChange} placeholder="Enter your password" required disabled={loading || isGoogleLoading || isFacebookLoading} style={styles.input} />
                <button type="button" style={styles.passwordToggle} onClick={() => setShowPassword(!showPassword)}>{showPassword ? '🙈' : '👁️'}</button>
              </div>
            </div>

            <div style={styles.formOptions}>
              <label style={styles.checkboxLabel}><input type="checkbox" /><span>Remember me</span></label>
              <Link to="/forgot-password" style={styles.forgotPassword}>Forgot password?</Link>
            </div>

            <button type="submit" style={styles.submitButton} disabled={loading || isGoogleLoading || isFacebookLoading}>
              {loading ? <><span style={styles.spinner}></span>Signing In...</> : 'Sign In'}
            </button>
          </form>

          <div style={styles.orDivider}>
            <div style={styles.orLine}></div>
            <div style={styles.orText}>or</div>
            <div style={styles.orLine}></div>
          </div>

          <div style={styles.socialContainer}>
            <button type="button" style={styles.socialButton} onClick={handleGoogleLogin} disabled={loading || isGoogleLoading || isFacebookLoading} title="Continue with Google">
              {isGoogleLoading ? <span style={styles.socialSpinner}></span> : <svg style={styles.socialIcon} viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>}
            </button>

            <button type="button" style={styles.socialButton} onClick={handleFacebookLogin} disabled={loading || isFacebookLoading || isGoogleLoading} title="Continue with Facebook">
              {isFacebookLoading ? <span style={styles.socialSpinner}></span> : <svg style={styles.socialIcon} viewBox="0 0 24 24"><path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>}
            </button>
          </div>

          <div style={styles.footer}>
            <p>🌱 Join PiperSmart today!</p>
          </div>
        </div>
      </div>

      <div style={styles.rightColumn}>
        <div style={styles.geometricOverlay}>
<svg width="100%" height="100%" viewBox="0 0 400 400" preserveAspectRatio="none">
            <circle cx="350" cy="50" r="200" fill="rgba(82,183,136,0.1)" />
            <circle cx="0" cy="400" r="150" fill="rgba(82,183,136,0.08)" />
            <polygon points="400,0 500,0 400,200" fill="rgba(82,183,136,0.1)" />
            <circle cx="100" cy="100" r="80" fill="rgba(82,183,136,0.08)" />
          </svg>
        </div>

        <div style={styles.welcomeContent}>
          <h2 style={styles.welcomeTitle}>New to PiperSmart?</h2>
          <p style={styles.welcomeSubtitle}>Join our community of growers and spice experts to discover new harvest opportunities!</p>
          <Link to="/register" style={styles.signupButton} onClick={(e) => handleTransition(e, '/register')}>Sign Up</Link>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input:focus { outline: none; border-color: ${colors.borderFocus} !important; box-shadow: 0 0 0 3px rgba(27, 67, 50, 0.1) !important; }
        button:disabled { opacity: 0.6; cursor: not-allowed; }
        input:disabled { background-color: #f8f9fa; cursor: not-allowed; }
        a:hover { text-decoration: underline; }
        button:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(27, 67, 50, 0.4); }
        .signupButton:hover { background: rgba(255,255,255,0.15) !important; transform: translateY(-2px) scale(1.02); }
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');
      `}</style>
    </div>
  );
};

export default Login;
