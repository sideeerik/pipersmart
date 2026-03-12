import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider, facebookProvider } from '../../config/firebase';
import logo from '/logowalangbg.png';
import './Auth.css';


const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  // Login form state
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isFacebookLoading, setIsFacebookLoading] = useState(false);

  // Register form state
  const [registerData, setRegisterData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    pepperRed: '#A4161A',
    accent: '#52B788',
  };

  const handleSwitch = (toLogin) => {
    if (toLogin === isLogin) return;
    setIsAnimating(true);
    setTimeout(() => {
      setIsLogin(toLogin);
      setIsAnimating(false);
    }, 400);
  };

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
    setLoginError('');
  };

  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
    setRegisterError('');
    setRegisterSuccess('');
  };

  const handleLocalLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    if (!loginData.email || !loginData.password) {
      setLoginError('Please fill in all fields');
      setLoginLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/users/login`, loginData, { headers: { 'Content-Type': 'application/json' } });

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        if (response.data.user.role === 'admin') navigate('/admin/dashboard');
        else navigate('/home');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.response) setLoginError(error.response.data.message || 'Login failed. Please try again.');
      else if (error.request) setLoginError('Cannot connect to server. Please check if backend is running.');
      else setLoginError('Error: ' + error.message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoginError('');
    setIsGoogleLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const idToken = await user.getIdToken();
      const { data } = await axios.post(`${API_BASE_URL}/api/v1/users/firebase/auth/google`, { idToken });

      if (!data.token) throw new Error("No JWT token received from backend");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify({ name: data.user.name, email: data.user.email, role: data.user.role, id: data.user._id, avatar: data.user.avatar }));

      if (data.user.role === "admin") navigate("/admin/dashboard");
      else navigate("/home");

    } catch (error) {
      console.error("Google login error:", error);
      if (error.code === 'auth/popup-closed-by-user') setLoginError("Google login was cancelled.");
      else if (error.code === 'auth/popup-blocked') setLoginError("Popup was blocked by your browser.");
      else setLoginError("Google login failed. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setLoginError('');
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
      localStorage.setItem("user", JSON.stringify({ name: data.user.name, email: data.user.email, role: data.user.role, id: data.user._id, avatar: data.user.avatar }));

      if (data.user.role === "admin") navigate("/admin/dashboard");
      else navigate("/home");

    } catch (error) {
      console.error("Facebook login error:", error);
      if (error.code === 'auth/popup-closed-by-user') { setLoginError(""); return; }
      else if (error.code === 'auth/popup-blocked') setLoginError("Popup was blocked by your browser.");
      else setLoginError("Facebook login failed. Please try again.");
    } finally {
      setIsFacebookLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterLoading(true);
    setRegisterError('');
    setRegisterSuccess('');

    if (!registerData.name || !registerData.email || !registerData.password) {
      setRegisterError('Please fill in all required fields');
      setRegisterLoading(false);
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setRegisterError('Passwords do not match');
      setRegisterLoading(false);
      return;
    }

    if (registerData.password.length < 6) {
      setRegisterError('Password must be at least 6 characters long');
      setRegisterLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerData.email)) {
      setRegisterError('Please enter a valid email address');
      setRegisterLoading(false);
      return;
    }

    try {
      const userData = { name: registerData.name, email: registerData.email, password: registerData.password };
      const response = await axios.post(`${API_BASE_URL}/api/v1/users/register`, userData, { headers: { 'Content-Type': 'application/json' } });

      if (response.data.success) {
        setRegisterSuccess(response.data.message);
        setRegisterData({ name: '', email: '', password: '', confirmPassword: '' });
        setTimeout(() => {
          handleSwitch(true);
          setLoginData({ email: registerData.email, password: '' });
        }, 3000);
      }
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response) setRegisterError(error.response.data.message || 'Registration failed. Please try again.');
      else if (error.request) setRegisterError('Cannot connect to server. Please check if backend is running.');
      else setRegisterError('Error: ' + error.message);
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className={`auth-wrapper ${isAnimating ? 'animating' : ''} ${!isLogin ? 'show-register' : ''}`}>
        
        {/* Left Panel - Form */}
        <div className="auth-form-container">
          <div className="auth-card">
            <div className="auth-logo">
              <img src={logo} alt="PiperSmart Logo" className="logo-img" />
              <span className="logo-text">PiperSmart</span>
            </div>

            {isLogin ? (
              // Login Form
              <div className="form-content">
                <h1 className="auth-title">Welcome Back</h1>
                <p className="auth-subtitle">Sign in to continue your journey</p>

                {loginError && <div className="auth-alert auth-alert-error">{loginError}</div>}

                <form onSubmit={handleLocalLogin}>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" name="email" value={loginData.email} onChange={handleLoginChange} placeholder="Enter your email" required disabled={loginLoading || isGoogleLoading || isFacebookLoading} />
                  </div>

                  <div className="form-group">
                    <label>Password</label>
                    <div className="password-input-wrapper">
                      <input type={showPassword ? 'text' : 'password'} name="password" value={loginData.password} onChange={handleLoginChange} placeholder="Enter your password" required disabled={loginLoading || isGoogleLoading || isFacebookLoading} />
                      <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <span style={{color: '#1B4D3E'}}>🙈</span> : <span style={{color: '#1B4D3E'}}>👁</span>}
                      </button>
                    </div>
                  </div>

                  <div className="form-options">
                    <label className="checkbox-label"><input type="checkbox" /><span>Remember me</span></label>
                    <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
                  </div>

                  <button type="submit" className="auth-submit-btn" disabled={loginLoading || isGoogleLoading || isFacebookLoading}>
                    {loginLoading ? <><span className="spinner"></span>Signing In...</> : 'Sign In'}
                  </button>
                </form>

                <div className="or-divider">
                  <span>or continue with</span>
                </div>

                <div className="social-buttons">
                  <button className="social-btn" onClick={handleGoogleLogin} disabled={loginLoading || isGoogleLoading || isFacebookLoading} title="Continue with Google">
                    {isGoogleLoading ? <span className="social-spinner"></span> : <svg viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>}
                  </button>
                  <button className="social-btn" onClick={handleFacebookLogin} disabled={loginLoading || isFacebookLoading || isGoogleLoading} title="Continue with Facebook">
                    {isFacebookLoading ? <span className="social-spinner"></span> : <svg viewBox="0 0 24 24"><path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>}
                  </button>
                </div>

                <p className="auth-footer">Don't have an account? <button type="button" className="switch-link" onClick={() => handleSwitch(false)}>Sign up</button></p>
              </div>
            ) : (
              // Register Form
              <div className="form-content">
                <h1 className="auth-title">Create Account</h1>
                <p className="auth-subtitle">Join our community of growers</p>

                {registerError && <div className="auth-alert auth-alert-error">{registerError}</div>}
                {registerSuccess && <div className="auth-alert auth-alert-success">{registerSuccess}</div>}

                <form onSubmit={handleRegister}>
                  <div className="form-group">
                    <label>Full Name <span className="required">*</span></label>
                    <input type="text" name="name" value={registerData.name} onChange={handleRegisterChange} placeholder="Enter your full name" required disabled={registerLoading} />
                  </div>
                  <div className="form-group">
                    <label>Email Address <span className="required">*</span></label>
                    <input type="email" name="email" value={registerData.email} onChange={handleRegisterChange} placeholder="Enter your email" required disabled={registerLoading} />
                  </div>
                  <div className="form-group">
                    <label>Password <span className="required">*</span></label>
                    <div className="password-input-wrapper">
                      <input type={showRegisterPassword ? 'text' : 'password'} name="password" value={registerData.password} onChange={handleRegisterChange} placeholder="Create a password" required disabled={registerLoading} />
                      <button type="button" className="password-toggle" onClick={() => setShowRegisterPassword(!showRegisterPassword)}>{showRegisterPassword ? <span style={{color: '#1B4D3E'}}>🙈</span> : <span style={{color: '#1B4D3E'}}>👁</span>}</button>
                    </div>
                    <small className="input-hint">Minimum 6 characters</small>
                  </div>
                  <div className="form-group">
                    <label>Confirm Password <span className="required">*</span></label>
                    <div className="password-input-wrapper">
                      <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={registerData.confirmPassword} onChange={handleRegisterChange} placeholder="Confirm your password" required disabled={registerLoading} />
                      <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? <span style={{color: '#1B4D3E'}}>🙈</span> : <span style={{color: '#1B4D3E'}}>👁</span>}</button>
                    </div>
                  </div>

                  <button type="submit" className="auth-submit-btn" disabled={registerLoading}>
                    {registerLoading ? <><span className="spinner"></span>Creating Account...</> : 'Create Account'}
                  </button>
                </form>

                <p className="auth-footer">Already have an account? <button type="button" className="switch-link" onClick={() => handleSwitch(true)}>Sign in</button></p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Welcome Banner */}
        <div className="auth-banner-container">
          <div className="banner-overlay">
            <svg className="banner-shapes" viewBox="0 0 400 400" preserveAspectRatio="none">
              <circle cx="350" cy="50" r="200" fill="rgba(255,255,255,0.05)" />
              <circle cx="0" cy="400" r="150" fill="rgba(255,255,255,0.03)" />
              <polygon points="400,0 500,0 400,200" fill="rgba(255,255,255,0.04)" />
              <circle cx="100" cy="100" r="80" fill="rgba(255,255,255,0.03)" />
            </svg>
          </div>
          
          <div className="banner-content">
            {isLogin ? (
              <>
                <h2 className="banner-title">New to PiperSmart?</h2>
                <p className="banner-subtitle">Join our community of growers and spice experts to discover new harvest opportunities!</p>
                <button className="banner-btn" onClick={() => handleSwitch(false)}>Sign Up</button>
              </>
            ) : (
              <>
                <h2 className="banner-title">Welcome Back!</h2>
                <p className="banner-subtitle">Sign in to continue your journey with PiperSmart community</p>
                <button className="banner-btn" onClick={() => handleSwitch(true)}>Sign In</button>
              </>
            )}
          </div>

          <div className="banner-decoration">
            <div className="decoration-circle circle-1"></div>
            <div className="decoration-circle circle-2"></div>
            <div className="decoration-circle circle-3"></div>
          </div>
        </div>

        {/* Sliding Overlay */}
        <div className={`auth-overlay ${!isLogin ? 'active' : ''}`}>
          <div className="overlay-content">
            {isLogin ? (
              <>
                <h2 className="overlay-title">Hello, Friend!</h2>
                <p className="overlay-text">Enter your personal details and start your journey with us</p>
                <button className="overlay-btn" onClick={() => handleSwitch(false)}>Sign Up</button>
              </>
            ) : (
              <>
                <h2 className="overlay-title">Welcome Back!</h2>
                <p className="overlay-text">To keep connected with us please login with your personal info</p>
                <button className="overlay-btn" onClick={() => handleSwitch(true)}>Sign In</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
