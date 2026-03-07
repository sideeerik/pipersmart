import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../shared/Header';

const BungaAnalysis = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
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
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes scaleIn {
        from { opacity: 0; transform: scale(0.9); }
        to { opacity: 1; transform: scale(1); }
      }
      .glass-card {
        animation: fadeInUp 0.6s ease forwards;
      }
      .result-card {
        animation: scaleIn 0.5s ease forwards;
      }
    `;
    document.head.appendChild(style);
  }, []);

  const colors = {
    primary: '#1B4D3E',
    primaryLight: '#27AE60',
    secondary: '#ffffffbb',
    background: '#f8faf798',
    text: '#1B4D3E',
    textLight: '#3c4d49f6',
    border: '#D4E5DD',
    accent: '#D4AF37',
    danger: '#E74C3C',
  };

  const ripenessRecommendations = {
    'Ripe': {
      icon: '🟢',
      title: 'Bunga is Ripe',
      description: 'Your black pepper bunga has reached optimal ripeness for harvesting.',
      actions: ['Harvest immediately for best flavor', 'Use sharp pruning shears to avoid damage', 'Store in cool, dry place', 'Process or dry within 24 hours'],
      color: colors.primaryLight
    },
    'Unripe': {
      icon: '🟡',
      title: 'Bunga Not Yet Ripe',
      description: 'The bunga requires more time to reach full ripeness.',
      actions: ['Wait 5-7 more days before harvesting', 'Ensure adequate water and nutrients', 'Protect from birds and pests', 'Check daily for color change'],
      color: '#F39C12'
    },
    'Rotten': {
      icon: '🔴',
      title: 'Bunga is Rotten',
      description: 'The bunga has deteriorated and is no longer usable.',
      actions: ['Remove immediately to prevent disease spread', 'Do not attempt to process or dry', 'Inspect nearby bunches for signs of rot', 'Improve ventilation to prevent future rot'],
      color: colors.danger
    }
  };

  const getMarketGrade = (classStr) => {
    if (!classStr) return null;
    if (classStr.toLowerCase() === 'rotten') {
      return { grade: 'Reject', icon: '❌', color: '#E74C3C', title: 'Reject Grade', description: 'This bunga is rotten and should not be processed or sold.', actions: ['Remove from harvest immediately', 'Do not process or dry', 'Prevent spread to other bunches'] };
    }
    const match = classStr.match(/Class\s*([A-D])-([a-d])/);
    if (!match) return null;
    const ripenessLetter = match[1];
    const healthLetter = match[2];
    if ((ripenessLetter === 'C' && healthLetter === 'd') || (ripenessLetter === 'D' && healthLetter === 'd')) {
      return { grade: 'Reject', icon: '❌', color: '#E74C3C', title: 'Reject Grade', description: 'This bunga is not suitable for processing.', actions: ['Do not harvest or process', 'Wait for better development'] };
    }
    if (ripenessLetter === 'A' && healthLetter === 'a') {
      return { grade: 'Premium', icon: '⭐', color: '#D4AF37', title: 'Premium Grade', description: 'Excellent quality bunga suitable for export.', actions: ['Harvest and dry immediately', 'Use specialized drying equipment', 'Store in airtight containers'] };
    }
    if ((ripenessLetter === 'A' && healthLetter === 'b') || (ripenessLetter === 'B' && (healthLetter === 'a' || healthLetter === 'b'))) {
      return { grade: 'Standard', icon: '✅', color: '#27AE60', title: 'Standard Grade', description: 'Good quality bunga for domestic markets.', actions: ['Harvest and dry using standard methods', 'Store in cool, dry conditions'] };
    }
    return { grade: 'Commercial', icon: '📦', color: '#F39C12', title: 'Commercial Grade', description: 'Acceptable for commercial use.', actions: ['Harvest and dry with care', 'Sort and remove defective portions'] };
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) { setError('Please select a valid image file'); return; }
      if (file.size > 10 * 1024 * 1024) { setError('Image size must be less than 10MB'); return; }
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => { setPreview(reader.result); };
      reader.readAsDataURL(file);
      setError(null);
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!image) { setError('Please select an image first'); return; }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) { setError('Authentication token not found. Please login again.'); setLoading(false); return; }

      const formData = new FormData();
      formData.append('image', image);

      const response = await axios.post(`${API_BASE_URL}/api/v1/predict/bunga-with-objects`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` },
        timeout: 180000
      });

      if (response.data) {
        setResult(response.data);
      } else {
        setError('No result received from server');
      }
    } catch (err) {
      console.error('Prediction error:', err);
      let errorMsg = 'Failed to analyze image. Please try again.';
      if (err.response?.data?.error) errorMsg = err.response.data.error;
      else if (err.message === 'Network Error') errorMsg = 'Network error. Make sure backend is running.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const resultInfo = result && result.ripeness ? ripenessRecommendations[result.ripeness] : null;
  const marketGrade = result && result.class ? getMarketGrade(result.class) : null;

  return (
    <div style={{ minHeight: '100vh', position: 'relative', fontFamily: 'Inter, sans-serif' }}>
      <Header />
      {/* Background stays as requested */}
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100%', minHeight: '100vh', zIndex: -1,
        background: `radial-gradient(ellipse at 20% 30%, rgba(0, 40, 20, 0.85) 0%, transparent 50%), linear-gradient(180deg, rgba(10, 10, 10, 0.9) 0%, rgba(13, 26, 18, 0.85) 50%, rgba(10, 10, 10, 0.9) 100%)`,
      }} />

      <div style={{ padding: '100px 20px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          
          {/* Dual Card Layout - Two separate cards */}
          <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1fr' : '1fr', gap: '24px' }}>
            
            {/* Card 1: Image/Input Area */}
            <div className="glass-card" style={{ 
              background: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: '24px',
              padding: '32px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)'
            }}>
              {/* Top Header Bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ 
                  width: '48px', height: '48px', 
                  borderRadius: '12px', 
                  background: 'linear-gradient(135deg, #1B4D3E 0%, #27AE60 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '24px'
                }}>
                  🫒
                </div>
                <div>
                  <h2 style={{ margin: 0, color: 'white', fontSize: '20px', fontWeight: '700' }}>Bunga Ripeness Analyzer</h2>
                  <p style={{ margin: '4px 0 0 0', color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>Upload from gallery or take a photo</p>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', marginBottom: '20px' }}>
                  Upload a clear image of your black pepper bunga. Our AI model will analyze ripeness, health grade, and market classification.
                </p>
                
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
                        <img src={preview} alt="Bunga" style={{ width: '100%', height: result ? '400px' : '280px', objectFit: 'cover', display: 'block' }} />
                        {loading && <div className="scanning-bar" />}
                        {loading && (
                          <div style={{ position: 'absolute', bottom: '20px', left: '0', width: '100%', textAlign: 'center', color: 'white', textShadow: '0 2px 4px black', fontWeight: '600' }}>
                            Detecting Ripeness...<br/>Calculating Health...
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
                
                {/* Button Arrangement: Change and Camera side-by-side above Analyze */}
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

                <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleImageSelect} style={{ display: 'none' }} />

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

                {!result && (
                  <button 
                    onClick={handleAnalyze} 
                    disabled={!image || loading}
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
                    {loading ? '🔄 Processing...' : '🔍 Analyze Bunga'}
                  </button>
                )}
              </div>
            </div>

            {/* Card 2: Results Area */}
            {result && (
              <div className="result-card" style={{
                background: 'rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: '24px',
                padding: '32px',
                border: `1px solid ${resultInfo?.color}40`,
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
                borderLeft: `4px solid ${resultInfo?.color}`
              }}>
                {/* Results Header */}
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <div style={{ 
                    width: '80px', height: '80px', 
                    borderRadius: '50%', 
                    background: `linear-gradient(135deg, ${resultInfo?.color} 0%, ${resultInfo?.color}CC 100%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '40px',
                    margin: '0 auto 16px',
                    boxShadow: `0 8px 30px ${resultInfo?.color}40`
                  }}>
                    {resultInfo?.icon || '📊'}
                  </div>
                  <h2 style={{ margin: 0, color: 'white', fontSize: '24px', fontWeight: '800' }}>
                    {resultInfo?.title || 'Analysis Complete'}
                  </h2>
                </div>

                {/* Class Box */}
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px', textAlign: 'center', marginBottom: '20px' }}>
                  <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '5px' }}>Class</div>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: 'white' }}>{result.class || 'Class A-a'}</div>
                </div>

                {/* Description - Centered text */}
                <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.8)', fontSize: '14px', marginBottom: '20px', lineHeight: '1.6' }}>
                  {resultInfo?.description || 'Your bunga has been analyzed successfully.'}
                </p>

                {/* Recommended Actions */}
                <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
                  <h4 style={{ margin: '0 0 16px 0', color: 'white', fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    📋 Recommended Actions
                  </h4>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                    {resultInfo?.actions?.map((action, idx) => (
                      <li key={idx} style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', marginBottom: '12px', paddingLeft: '24px', position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '0', color: resultInfo?.color }}>✓</span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Market Grade Info */}
                {marketGrade && (
                  <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
                    <h4 style={{ margin: '0 0 8px 0', color: 'white', fontSize: '14px', fontWeight: '700' }}>{marketGrade.title}</h4>
                    <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>{marketGrade.description}</p>
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                      {marketGrade.actions?.map((action, idx) => (
                        <li key={idx} style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', marginBottom: '8px', paddingLeft: '24px', position: 'relative' }}>
                          <span style={{ position: 'absolute', left: '0', color: marketGrade.color }}>✓</span>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Bottom Action Button */}
                <button 
                  onClick={() => {setResult(null); setPreview(null); setImage(null);}}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '12px',
                    border: 'none',
                    background: `linear-gradient(135deg, ${resultInfo?.color} 0%, ${resultInfo?.color}CC 100%)`,
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '14px',
                    boxShadow: `0 4px 15px ${resultInfo?.color}40`,
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                >
                  🔄 Analyze Another Bunga
                </button>
              </div>
            )}
          </div>

          <div style={{ textAlign: 'center', marginTop: '20px', color: 'white', opacity: 0.7, fontSize: '12px' }}>
            Model Accuracy: 98.5% | Bunga Classification with Health Grading
          </div>
        </div>
      </div>
    </div>
  );
};

export default BungaAnalysis;
