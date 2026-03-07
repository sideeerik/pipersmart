import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../shared/Header';

// Floating Leaves Component with animation
const FloatingLeaves = () => {
  const leaves = [
    { top: '8%', left: '3%', rotation: '15deg', opacity: 0.12, size: '36px', animationDuration: '20s' },
    { top: '15%', left: '88%', rotation: '-25deg', opacity: 0.1, size: '32px', animationDuration: '25s' },
    { top: '45%', left: '2%', rotation: '35deg', opacity: 0.08, size: '28px', animationDuration: '22s' },
    { top: '70%', left: '92%', rotation: '-40deg', opacity: 0.1, size: '40px', animationDuration: '18s' },
    { top: '35%', left: '95%', rotation: '50deg', opacity: 0.08, size: '26px', animationDuration: '28s' },
    { top: '85%', left: '8%', rotation: '-15deg', opacity: 0.1, size: '34px', animationDuration: '24s' },
    { top: '55%', left: '5%', rotation: '60deg', opacity: 0.06, size: '30px', animationDuration: '21s' },
    { top: '25%', left: '75%', rotation: '-30deg', opacity: 0.08, size: '38px', animationDuration: '26s' },
  ];

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes float {
        0%, 100% { transform: translateY(0) rotate(var(--rotation)); }
        50% { transform: translateY(-20px) rotate(calc(var(--rotation) + 10deg)); }
      }
      .leaf-float {
        animation: float var(--duration) ease-in-out infinite;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      {leaves.map((leaf, idx) => (
        <span key={idx} className="leaf-float" style={{
          position: 'absolute',
          top: leaf.top,
          left: leaf.left,
          opacity: leaf.opacity,
          fontSize: leaf.size,
          '--rotation': leaf.rotation,
          '--duration': leaf.animationDuration,
        }}>
          🍃
        </span>
      ))}
    </div>
  );
};

const LeafAnalysis = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [processingTime, setProcessingTime] = useState(null);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0%, 100% { box-shadow: 0 0 0 0 rgba(39, 174, 96, 0.4); }
        50% { box-shadow: 0 0 0 15px rgba(39, 174, 96, 0); }
      }
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes scaleIn {
        from { opacity: 0; transform: scale(0.9); }
        to { opacity: 1; transform: scale(1); }
      }
      @keyframes scan {
        0% { top: 0%; }
        100% { top: 100%; }
      }
      .scanning-bar {
        position: absolute;
        left: 0;
        width: 100%;
        height: 4px;
        background: rgba(39, 174, 96, 0.8);
        box-shadow: 0 0 15px 5px rgba(39, 174, 96, 0.5);
        z-index: 10;
        animation: scan 2s linear infinite;
      }
      .glass-card {
        animation: fadeInUp 0.6s ease forwards;
      }
      .result-card {
        animation: scaleIn 0.5s ease forwards;
      }
      .analyzing-btn {
        animation: pulse 2s infinite;
      }
      .loading-shimmer {
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const colors = {
    primary: '#1B4D3E',
    primaryDark: '#0D2818',
    primaryLight: '#27AE60',
    secondary: '#FFFFFF',
    background: '#F8FAF7',
    text: '#1B4D3E',
    textLight: '#5A7A73',
    border: '#D4E5DD',
    accent: '#D4AF37',
    warning: '#F39C12',
    danger: '#E74C3C',
    success: '#27AE60',
  };

  const diseaseRecommendations = {
    'Healthy': {
      icon: '✅',
      title: 'Plant is Healthy',
      description: 'Your pepper plant shows no signs of disease. Keep up the great work!',
      actions: ['Continue regular watering routine', 'Weekly monitoring recommended', 'Maintain proper plant spacing', 'Ensure adequate sunlight exposure'],
      color: colors.success,
      gradient: 'linear-gradient(135deg, #27AE60 0%, #2ECC71 100%)'
    },
    'Footrot': {
      icon: '⚠️',
      title: 'Footrot Disease Detected',
      description: 'This is a serious fungal disease affecting the base of the plant. Immediate action recommended.',
      actions: ['Remove infected plant parts immediately', 'Improve soil drainage', 'Apply copper-based fungicide', 'Avoid waterlogging', 'Quarantine affected plants'],
      color: colors.danger,
      gradient: 'linear-gradient(135deg, #E74C3C 0%, #C0392B 100%)'
    },
    'Pollu_Disease': {
      icon: '🚨',
      title: 'Pollu Disease Detected',
      description: 'Viral infection causing leaf curling and discoloration. Spread by aphids.',
      actions: ['Isolate affected plant immediately', 'Remove all diseased leaves', 'Control aphid population', 'Apply insecticidal soap', 'Monitor nearby plants'],
      color: colors.warning,
      gradient: 'linear-gradient(135deg, #F39C12 0%, #E67E22 100%)'
    },
    'Slow-Decline': {
      icon: '📉',
      title: 'Slow Decline Detected',
      description: 'Progressive weakening of plant vigor. Usually caused by poor soil conditions.',
      actions: ['Test soil moisture levels', 'Conduct soil pH test', 'Improve fertilization schedule', 'Ensure proper drainage', 'Add organic matter to soil'],
      color: colors.warning,
      gradient: 'linear-gradient(135deg, #F39C12 0%, #E67E22 100%)'
    },
    'Slow_Decline': {
      icon: '📉',
      title: 'Slow Decline Detected',
      description: 'Progressive weakening of plant vigor. Usually caused by poor soil conditions.',
      actions: ['Test soil moisture levels', 'Conduct soil pH test', 'Improve fertilization schedule', 'Ensure proper drainage', 'Add organic matter to soil'],
      color: colors.warning,
      gradient: 'linear-gradient(135deg, #F39C12 0%, #E67E22 100%)'
    },
    'Leaf_Blight': {
      icon: '🍂',
      title: 'Leaf Blight Detected',
      description: 'Fungal infection causing leaf spots, browning, and premature leaf drop.',
      actions: ['Remove and destroy affected leaves', 'Improve air circulation', 'Reduce leaf wetness duration', 'Apply copper fungicide', 'Avoid overhead watering'],
      color: colors.danger,
      gradient: 'linear-gradient(135deg, #E74C3C 0%, #C0392B 100%)'
    },
    'Yellow_Mottle_Virus': {
      icon: '💛',
      title: 'Yellow Mottle Virus',
      description: 'Viral infection causing yellow patterns on leaves. Can spread rapidly.',
      actions: ['Remove infected plant if severe', 'Control insect vectors aggressively', 'Sanitize all tools', 'Avoid working with wet plants', 'Monitor all nearby plants'],
      color: colors.danger,
      gradient: 'linear-gradient(135deg, #E74C3C 0%, #C0392B 100%)'
    }
  };

  const normalizeDiseaseeName = (diseaseName) => {
    const diseaseMapping = {
      'healthy': 'Healthy',
      'footrot': 'Footrot',
      'pollu': 'Pollu_Disease',
      'pollu_disease': 'Pollu_Disease',
      'slow-decline': 'Slow-Decline',
      'slow_decline': 'Slow_Decline',
      'slowdecline': 'Slow_Decline',
      'leaf-blight': 'Leaf_Blight',
      'leaf_blight': 'Leaf_Blight',
      'leafblight': 'Leaf_Blight',
      'yellow-mottle': 'Yellow_Mottle_Virus',
      'yellow_mottle': 'Yellow_Mottle_Virus',
      'yellow_mottle_virus': 'Yellow_Mottle_Virus',
      'ymv': 'Yellow_Mottle_Virus'
    };
    const lowerName = (diseaseName || '').toLowerCase().trim();
    return diseaseMapping[lowerName] || diseaseName;
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('Image size must be less than 10MB');
        return;
      }
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError(null);
      setResult(null);
    }
  };

  const handlePredict = async () => {
    if (!image) {
      setError('Please select an image first');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    const startTime = Date.now();

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please login again.');
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('image', image);

      const response = await axios.post(
        `${API_BASE_URL}/api/v1/predict/disease`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          },
          timeout: 60000
        }
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      if (response.data) {
        if (response.data.success === false) {
          setError(response.data.error || 'Prediction failed');
        } else if (response.data.disease) {
          const normalizedDisease = normalizeDiseaseeName(response.data.disease);
          setResult({ ...response.data, disease: normalizedDisease, processingTime: duration });
          setProcessingTime(duration);
        } else {
          setError('No disease detected in response');
        }
      } else {
        setError('No response from server');
      }
    } catch (err) {
      console.error('Prediction error:', err);
      let errorMsg = 'Failed to analyze image. Please try again.';
      if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      } else if (err.message === 'Network Error') {
        errorMsg = 'Network error. Make sure backend is running.';
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getDiseaseInfo = (diseaseName) => {
    const normalized = normalizeDiseaseeName(diseaseName);
    return diseaseRecommendations[normalized] || {
      icon: '❓',
      title: `${diseaseName || 'Unknown'} Disease`,
      description: 'Unable to identify the disease. Please consult an agricultural expert.',
      actions: ['Consult agricultural expert', 'Get professional diagnosis', 'Take clear photos of symptoms'],
      color: colors.textLight,
      gradient: 'linear-gradient(135deg, #95A5A6 0%, #7F8C8D 100%)'
    };
  };

  const resultInfo = result ? getDiseaseInfo(result.disease) : null;

  // Calculate confidence level
  const getConfidenceLevel = (confidence) => {
    if (confidence >= 85) return { label: 'High Confidence', color: colors.success };
    if (confidence >= 60) return { label: 'Medium Confidence', color: colors.warning };
    return { label: 'Low Confidence', color: colors.danger };
  };

  const confidenceLevel = result ? getConfidenceLevel(result.confidence) : null;

  return (
    <div style={{ minHeight: '100vh', position: 'relative', fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      <Header />
      
      {/* Floating Leaves Background */}
      <FloatingLeaves />

      {/* Background */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        minHeight: '100vh',
        zIndex: -1,
        background: `
          radial-gradient(ellipse at 20% 30%, rgba(0, 40, 20, 0.85) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 70%, rgba(10, 30, 15, 0.75) 0%, transparent 50%),
          linear-gradient(180deg, rgba(10, 10, 10, 0.9) 0%, rgba(13, 26, 18, 0.85) 50%, rgba(10, 10, 10, 0.9) 100%),
          url('../../../paminta.webp')
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }} />
      
      <div style={{ minHeight: '100vh', padding: '90px 20px 40px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{ 
              color: 'white', 
              fontSize: '36px', 
              fontWeight: '800', 
              margin: '0 0 12px 0',
              textShadow: '0 2px 20px rgba(0, 255, 136, 0.3)',
              background: 'linear-gradient(135deg, #ffffff 0%, #00FF88 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              🔬 Leaf Disease Detection
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '16px', margin: 0 }}>
              Upload a leaf image for AI-powered disease analysis
            </p>
          </div>

          {/* Dual Card Layout */}
          <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1fr' : '1fr', gap: '24px' }}>
            
            {/* Upload Card */}
            <div className="glass-card" style={{
              background: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: '24px',
              padding: '32px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)'
            }}>
              {/* Card Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ 
                  width: '48px', height: '48px', 
                  borderRadius: '12px', 
                  background: 'linear-gradient(135deg, #1B4D3E 0%, #27AE60 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '24px'
                }}>
                  🍃
                </div>
                <div>
                  <h2 style={{ margin: 0, color: 'white', fontSize: '20px', fontWeight: '700' }}>Upload Leaf Image</h2>
                  <p style={{ margin: '4px 0 0 0', color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>Select from gallery or take a photo</p>
                </div>
              </div>

{/* Image Preview - Widens when results are shown */}
              <div style={{ position: 'relative', marginBottom: '24px' }}>
                <div style={{ 
                  borderRadius: '16px', 
                  overflow: 'hidden',
                  border: '2px dashed rgba(255,255,255,0.3)',
                  background: preview ? 'transparent' : 'rgba(0,0,0,0.2)',
                  transition: 'height 0.3s ease'
                }}>
{preview ? (
                    <div style={{ position: 'relative' }}>
                      <img src={preview} alt="Preview" style={{ 
                        width: '100%', 
height: result ? '400px' : '280px',
                        objectFit: 'cover',
                        display: 'block'
                      }} />
                      {loading && <div className="scanning-bar" />}
                      {loading && (
                        <div style={{
                          position: 'absolute', bottom: '20px', left: '0', width: '100%', 
                          textAlign: 'center', color: 'white', textShadow: '0 2px 4px black',
                          fontWeight: '600'
                        }}>
                          Detecting Disease...<br/>Analyzing Leaf...
                        </div>
                      )}
                      <button 
                        onClick={() => { setImage(null); setPreview(null); setResult(null); setError(null); }}
                        style={{
                          position: 'absolute', top: '12px', right: '12px',
                          width: '36px', height: '36px',
                          borderRadius: '50%',
                          background: 'rgba(231, 76, 60, 0.9)',
                          border: 'none', color: 'white',
                          cursor: 'pointer', fontSize: '18px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div style={{ 
                      padding: '60px 20px', 
                      textAlign: 'center',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px'
                    }}>
                      <div style={{ fontSize: '56px', opacity: 0.5 }}>🖼️</div>
                      <div style={{ color: 'rgba(255,255,255,0.7)', fontWeight: '500' }}>No image selected</div>
                      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>Click buttons below to upload</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <button 
                  onClick={() => fileInputRef.current?.click()} 
                  disabled={loading}
                  style={{
                    padding: '14px 20px',
                    borderRadius: '12px',
                    border: 'none',
                    background: loading ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.15)',
                    color: 'white',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    fontSize: '14px',
                    transition: 'all 0.3s ease'
                  }}
                >
                  📁 {preview ? 'Change' : 'Upload'}
                </button>
                <button 
                  onClick={() => fileInputRef.current?.click()} 
                  disabled={loading}
                  style={{
                    padding: '14px 20px',
                    borderRadius: '12px',
                    border: 'none',
                    background: loading ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #27AE60 0%, #1B4D3E 100%)',
                    color: 'white',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    fontSize: '14px',
                    boxShadow: loading ? 'none' : '0 4px 15px rgba(39, 174, 96, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  📷 Camera
                </button>
              </div>

              <input 
                ref={fileInputRef} 
                type="file" 
                accept="image/*" 
                capture="environment" 
                onChange={handleImageSelect} 
                style={{ display: 'none' }} 
              />

              {error && (
                <div style={{ 
                  background: 'rgba(231, 76, 60, 0.15)', 
                  border: '1px solid rgba(231, 76, 60, 0.3)',
                  borderRadius: '12px', 
                  padding: '14px', 
                  marginBottom: '20px', 
                  color: '#E74C3C', 
                  fontSize: '14px',
                  display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                  <span>⚠️</span> {error}
                </div>
              )}

              <button 
                onClick={handlePredict} 
                disabled={!image || loading}
                className={loading ? 'analyzing-btn' : ''}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '12px',
                  border: 'none',
                  background: image && !loading 
                    ? 'linear-gradient(135deg, #27AE60 0%, #1B4D3E 100%)' 
                    : 'rgba(255,255,255,0.1)',
                  color: image && !loading ? 'white' : 'rgba(255,255,255,0.4)',
                  cursor: image && !loading ? 'pointer' : 'not-allowed',
                  fontWeight: '700',
                  fontSize: '16px',
                  boxShadow: image && !loading ? '0 8px 25px rgba(39, 174, 96, 0.4)' : 'none',
                  transition: 'all 0.3s ease'
                }}
              >
                {loading ? '🔄 Analyzing...' : '🔍 Analyze Leaf'}
              </button>
            </div>

            {/* Results Card */}
            {result && resultInfo && (
              <div className="result-card" style={{
                background: 'rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: '24px',
                padding: '32px',
                border: `1px solid ${resultInfo.color}40`,
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
                borderLeft: `4px solid ${resultInfo.color}`
              }}>
                {/* Result Header */}
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <div style={{ 
                    width: '80px', height: '80px', 
                    borderRadius: '50%', 
                    background: resultInfo.gradient,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '40px',
                    margin: '0 auto 16px',
                    boxShadow: `0 8px 30px ${resultInfo.color}40`
                  }}>
                    {resultInfo.icon}
                  </div>
                  <h2 style={{ margin: 0, color: resultInfo.color, fontSize: '24px', fontWeight: '800' }}>
                    {resultInfo.title}
                  </h2>
                </div>

                {/* Confidence Gauge */}
                <div style={{ 
                  background: 'rgba(0,0,0,0.2)', 
                  borderRadius: '16px', 
                  padding: '20px', 
                  marginBottom: '20px',
                  textAlign: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                    <div style={{ position: 'relative', width: '100px', height: '55px' }}>
                      {/* Arc Background */}
                      <div style={{
                        position: 'absolute',
                        width: '100px',
                        height: '50px',
                        borderRadius: '50px 50px 0 0',
                        background: 'rgba(255,255,255,0.1)',
                        overflow: 'hidden'
                      }} />
                      {/* Arc Fill */}
                      <div style={{
                        position: 'absolute',
                        width: '100px',
                        height: '50px',
                        borderRadius: '50px 50px 0 0',
                        background: `conic-gradient(from 180deg, ${confidenceLevel?.color} 0deg, transparent ${(result.confidence / 100) * 180}deg)`,
                      }} />
                      {/* Percentage */}
                      <div style={{
                        position: 'absolute',
                        bottom: '0',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: '24px',
                        fontWeight: '800',
                        color: 'white'
                      }}>
                        {result.confidence}%
                      </div>
                    </div>
                  </div>
                  <div style={{
                    display: 'inline-block',
                    marginTop: '12px',
                    padding: '6px 16px',
                    background: `${confidenceLevel?.color}20`,
                    borderRadius: '20px',
                    color: confidenceLevel?.color,
                    fontSize: '13px',
                    fontWeight: '600'
                  }}>
                    {confidenceLevel?.label}
                  </div>
                </div>

                {/* Description */}
                <p style={{ 
                  color: 'rgba(255,255,255,0.8)', 
                  fontSize: '14px', 
                  lineHeight: '1.7', 
                  marginBottom: '20px',
                  textAlign: 'center' 
                }}>
                  {resultInfo.description}
                </p>

                {/* Actions */}
                <div style={{ 
                  background: 'rgba(0,0,0,0.2)', 
                  borderRadius: '16px', 
                  padding: '20px',
                  marginBottom: '20px'
                }}>
                  <h4 style={{ 
                    margin: '0 0 16px 0', 
                    color: 'white', 
                    fontSize: '14px', 
                    fontWeight: '700',
                    display: 'flex', alignItems: 'center', gap: '8px'
                  }}>
                    📋 Recommended Actions
                  </h4>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                    {resultInfo.actions.map((action, idx) => (
                      <li key={idx} style={{ 
                        color: 'rgba(255,255,255,0.8)', 
                        fontSize: '13px', 
                        marginBottom: '12px',
                        paddingLeft: '24px',
                        position: 'relative'
                      }}>
                        <span style={{ 
                          position: 'absolute', 
                          left: '0', 
                          color: resultInfo.color 
                        }}>✓</span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Button */}
                <button 
                  onClick={() => { setImage(null); setPreview(null); setResult(null); setError(null); }}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '12px',
                    border: 'none',
                    background: resultInfo.gradient,
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '14px',
                    boxShadow: `0 4px 15px ${resultInfo.color}40`,
                    transition: 'all 0.3s ease'
                  }}
                >
                  🔄 Analyze Another Leaf
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ textAlign: 'center', marginTop: '40px', color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
            <span style={{ 
              padding: '6px 16px', 
              background: 'rgba(255,255,255,0.1)', 
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              ✨ Model Accuracy: 99.22% | 6 Disease Classes
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeafAnalysis;
