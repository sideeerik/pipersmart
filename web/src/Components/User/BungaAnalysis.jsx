import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BungaAnalysis = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [processingTime, setProcessingTime] = useState(null);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  // CSS Keyframes for animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      @keyframes slideUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `;
    document.head.appendChild(style);
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

  // Ripeness recommendations
  const ripenessRecommendations = {
    'Ripe': {
      icon: '🟢',
      title: 'Bunga is Ripe',
      description: 'Your black pepper bunga has reached optimal ripeness for harvesting.',
      actions: [
        'Harvest immediately for best flavor',
        'Use sharp pruning shears to avoid damage',
        'Store in cool, dry place',
        'Process or dry within 24 hours'
      ],
      color: colors.success
    },
    'Unripe': {
      icon: '🟡',
      title: 'Bunga Not Yet Ripe',
      description: 'The bunga requires more time to reach full ripeness.',
      actions: [
        'Wait 5-7 more days before harvesting',
        'Ensure adequate water and nutrients',
        'Protect from birds and pests',
        'Check daily for color change'
      ],
      color: colors.warning
    },
    'Rotten': {
      icon: '🔴',
      title: 'Bunga is Rotten',
      description: 'The bunga has deteriorated and is no longer usable.',
      actions: [
        'Remove immediately to prevent disease spread',
        'Do not attempt to process or dry',
        'Inspect nearby bunches for signs of rot',
        'Improve ventilation to prevent future rot'
      ],
      color: colors.danger
    }
  };

  // Market grading logic
  const getMarketGrade = (classStr) => {
    if (!classStr) return null;
    
    if (classStr.toLowerCase() === 'rotten') {
      return {
        grade: 'Reject',
        icon: '❌',
        color: '#E74C3C',
        title: 'Reject Grade',
        description: 'This bunga is rotten and should not be processed or sold. Remove immediately to prevent contamination.',
        actions: [
          'Remove from harvest immediately',
          'Do not process or dry',
          'Prevent spread to other bunches',
          'Improve storage and ventilation conditions'
        ]
      };
    }
    
    const match = classStr.match(/Class\s*([A-D])-([a-d])/);
    if (!match) return null;
    
    const ripenessLetter = match[1];
    const healthLetter = match[2];
    
    // Reject: C-d, D-d
    if ((ripenessLetter === 'C' && healthLetter === 'd') ||
        (ripenessLetter === 'D' && healthLetter === 'd')) {
      return {
        grade: 'Reject',
        icon: '❌',
        color: '#E74C3C',
        title: 'Reject Grade',
        description: 'This bunga is not suitable for processing. Quality is too low for any commercial use.',
        actions: [
          'Do not harvest or process',
          'Wait for better development',
          'Remove defective bunches',
          'Improve care and growing conditions'
        ]
      };
    }
    
    // Premium: A-a
    if (ripenessLetter === 'A' && healthLetter === 'a') {
      return {
        grade: 'Premium',
        icon: '⭐',
        color: '#D4AF37',
        title: 'Premium Grade',
        description: 'Excellent quality bunga suitable for the finest market standards. Ideal for export.',
        actions: [
          'Harvest and dry immediately',
          'Use specialized drying equipment',
          'Store in airtight containers',
          'Target export markets for premium pricing'
        ]
      };
    }
    
    // Standard: A-b, B-a, B-b
    if ((ripenessLetter === 'A' && healthLetter === 'b') ||
        (ripenessLetter === 'B' && (healthLetter === 'a' || healthLetter === 'b'))) {
      return {
        grade: 'Standard',
        icon: '✅',
        color: '#27AE60',
        title: 'Standard Grade',
        description: 'Good quality bunga suitable for domestic and export markets. Standard processing recommended.',
        actions: [
          'Harvest and dry using standard methods',
          'Store in cool, dry conditions',
          'Suitable for domestic or regional export',
          'Expected good market value'
        ]
      };
    }
    
    // Commercial: Lower grades
    if ((ripenessLetter === 'A' && (healthLetter === 'c' || healthLetter === 'd')) ||
        (ripenessLetter === 'B' && (healthLetter === 'c' || healthLetter === 'd')) ||
        (ripenessLetter === 'C' && (healthLetter === 'a' || healthLetter === 'b' || healthLetter === 'c')) ||
        (ripenessLetter === 'D' && (healthLetter === 'a' || healthLetter === 'b' || healthLetter === 'c'))) {
      return {
        grade: 'Commercial',
        icon: '📦',
        color: '#F39C12',
        title: 'Commercial Grade',
        description: 'Acceptable for commercial use but with lower market value. Suitable for bulk processing.',
        actions: [
          'Harvest and dry with care',
          'Sort and remove defective portions',
          'Use bulk/commodity markets',
          'Consider processing for spice blends'
        ]
      };
    }
    
    return null;
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

  const handleAnalyze = async () => {
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
        `${API_BASE_URL}/api/v1/predict/bunga-with-objects`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          },
          timeout: 180000
        }
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      if (response.data) {
        setResult({ ...response.data, processingTime: duration });
        setProcessingTime(duration);
      } else {
        setError('No result received from server');
      }
    } catch (err) {
      console.error('❌ Prediction error:', err);
      
      let errorMsg = 'Failed to analyze image. Please try again.';
      
      if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      } else if (err.message === 'Network Error') {
        errorMsg = 'Network error. Make sure backend is running.';
      } else if (err.code === 'ECONNREFUSED') {
        errorMsg = 'Cannot connect to backend. Check if server is running.';
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const resultInfo = result && result.ripeness ? ripenessRecommendations[result.ripeness] : null;
  const marketGrade = result && result.class ? getMarketGrade(result.class) : null;

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${colors.primaryLight} 0%, ${colors.primary} 100%)`,
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 0'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: colors.secondary,
          cursor: 'pointer'
        }}
        onClick={() => navigate('/dashboard')}
        >
          <span style={{ fontSize: '28px' }}>🌱</span>
          <h1 style={{ margin: '0', fontSize: '24px', fontWeight: '800' }}>
            PiperSmart
          </h1>
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          style={{
            padding: '12px 24px',
            background: colors.secondary,
            color: colors.primary,
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
          }}
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Main Container */}
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: result ? '1fr 1fr' : '1fr',
        gap: '24px'
      }}>
        {/* Upload Section */}
        <div style={{
          background: colors.secondary,
          borderRadius: '16px',
          padding: '40px',
          boxShadow: `0 20px 60px rgba(27, 77, 62, 0.15)`,
          animation: 'slideUp 0.5s ease'
        }}>
          <h2 style={{
            color: colors.text,
            fontSize: '24px',
            fontWeight: '800',
            margin: '0 0 24px 0'
          }}>
            🫒 Bunga Ripeness Analyzer
          </h2>

          <p style={{
            color: colors.textLight,
            fontSize: '14px',
            margin: '0 0 24px 0',
            lineHeight: '1.6'
          }}>
            Upload a clear image of your black pepper bunga. Our AI model will analyze ripeness, health grade, and market classification.
          </p>

          {/* Image Preview or Placeholder */}
          {preview ? (
            <div style={{
              marginBottom: '24px',
              position: 'relative'
            }}>
              <img
                src={preview}
                alt="Preview"
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '12px',
                  border: `2px solid ${colors.border}`,
                  maxHeight: '300px',
                  objectFit: 'cover'
                }}
              />
              <button
                onClick={() => {
                  setImage(null);
                  setPreview(null);
                  setResult(null);
                  setError(null);
                }}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  background: colors.danger,
                  color: colors.secondary,
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                ✕
              </button>
            </div>
          ) : (
            <div style={{
              border: `2px dashed ${colors.border}`,
              borderRadius: '12px',
              padding: '40px',
              textAlign: 'center',
              marginBottom: '24px',
              backgroundColor: colors.background,
              transition: 'all 0.3s ease'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🫒</div>
              <div style={{
                color: colors.text,
                fontSize: '16px',
                fontWeight: '600',
                marginBottom: '8px'
              }}>
                No image selected
              </div>
              <div style={{
                color: colors.textLight,
                fontSize: '13px'
              }}>
                Upload a bunga image to analyze
              </div>
            </div>
          )}

          {/* Upload Buttons */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: '24px'
          }}>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              style={{
                padding: '12px 16px',
                background: colors.primary,
                color: colors.secondary,
                border: 'none',
                borderRadius: '12px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 0.3s ease',
                opacity: loading ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(27, 77, 62, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              📁 {preview ? 'Change' : 'Upload'}
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              style={{
                padding: '12px 16px',
                background: colors.primaryLight,
                color: colors.secondary,
                border: 'none',
                borderRadius: '12px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 0.3s ease',
                opacity: loading ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(39, 174, 96, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              📷 Camera
            </button>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageSelect}
            style={{ display: 'none' }}
          />

          {/* Error Message */}
          {error && (
            <div style={{
              background: `${colors.danger}15`,
              border: `2px solid ${colors.danger}`,
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px',
              color: colors.danger,
              fontSize: '14px',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
              animation: 'slideUp 0.3s ease'
            }}>
              <span style={{ fontSize: '18px', marginTop: '-2px', flexShrink: 0 }}>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={!image || loading}
            style={{
              width: '100%',
              padding: '16px',
              background: image ? colors.primary : `${colors.primary}55`,
              color: colors.secondary,
              border: 'none',
              borderRadius: '12px',
              cursor: image && !loading ? 'pointer' : 'not-allowed',
              fontWeight: '700',
              fontSize: '16px',
              transition: 'all 0.3s ease',
              boxShadow: image ? `0 4px 12px rgba(27, 77, 62, 0.3)` : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              opacity: loading ? 0.8 : 1
            }}
            onMouseEnter={(e) => {
              if (image && !loading) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(27, 77, 62, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (image && !loading) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(27, 77, 62, 0.3)';
              }
            }}
          >
            {loading ? (
              <>
                <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block', transformOrigin: 'center' }}>🔄</span>
                Analyzing...
              </>
            ) : (
              <>
                <span>🔍</span>
                Analyze Bunga
              </>
            )}
          </button>
        </div>

        {/* Results Section */}
        {result && (
          <div style={{
            background: colors.secondary,
            borderRadius: '16px',
            padding: '40px',
            boxShadow: `0 20px 60px rgba(27, 77, 62, 0.15)`,
            borderLeft: `4px solid ${resultInfo?.color || colors.textLight}`,
            animation: 'slideUp 0.5s ease'
          }}>
            <div style={{
              textAlign: 'center',
              marginBottom: '24px'
            }}>
              <div style={{
                fontSize: '64px',
                marginBottom: '16px'
              }}>
                {resultInfo?.icon || '🫒'}
              </div>
              <h2 style={{
                color: resultInfo?.color || colors.primary,
                fontSize: '24px',
                fontWeight: '800',
                margin: '0 0 12px 0'
              }}>
                {resultInfo?.title || 'Bunga Analysis'}
              </h2>
              <div style={{
                fontSize: '18px',
                fontWeight: '700',
                color: colors.primary,
                marginBottom: '12px'
              }}>
                {result.ripeness || 'Unknown'}
              </div>
              {result.processingTime && (
                <div style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  color: colors.textLight
                }}>
                  Processing time: {(result.processingTime / 1000).toFixed(2)}s
                </div>
              )}
            </div>

            {/* Class & Health Info */}
            {result.class && (
              <div style={{
                background: colors.background,
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '24px'
              }}>
                <div style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: colors.textLight,
                  marginBottom: '8px'
                }}>
                  Class
                </div>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '700',
                  color: colors.primary,
                  marginBottom: '12px'
                }}>
                  {result.class}
                </div>
                {result.health_range && (
                  <div style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: colors.text
                  }}>
                    Health Range: {result.health_range}
                  </div>
                )}
                {result.health_percentage !== undefined && (
                  <div style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: colors.text,
                    marginTop: '8px'
                  }}>
                    Health Quality: {Math.round(result.health_percentage)}%
                  </div>
                )}
              </div>
            )}

            {/* Confidence Score */}
            {result.ripeness_confidence !== undefined && (
              <div style={{
                background: colors.background,
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '24px'
              }}>
                <div style={{
                  height: '12px',
                  background: colors.border,
                  borderRadius: '6px',
                  overflow: 'hidden',
                  marginBottom: '8px'
                }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${result.ripeness_confidence}%`,
                      background: result.ripeness_confidence > 85 
                        ? `linear-gradient(90deg, ${colors.success} 0%, ${colors.primaryLight} 100%)`
                        : `linear-gradient(90deg, ${colors.warning} 0%, ${colors.accent} 100%)`,
                      transition: 'width 0.5s ease',
                      borderRadius: '6px'
                    }}
                  />
                </div>
                <div style={{
                  fontSize: '12px',
                  fontWeight: '700',
                  color: result.ripeness_confidence > 85 ? colors.success : colors.warning,
                  textAlign: 'center'
                }}>
                  {result.ripeness_confidence > 85 ? '✅ High Confidence' : '⚠️ Medium Confidence'} ({result.ripeness_confidence}%)
                </div>
              </div>
            )}

            {/* Market Grade Card */}
            {marketGrade && (
              <div style={{
                background: `${marketGrade.color}15`,
                border: `2px solid ${marketGrade.color}`,
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '24px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  marginBottom: '12px'
                }}>
                  <span style={{ fontSize: '32px' }}>{marketGrade.icon}</span>
                  <div>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: '700',
                      color: marketGrade.color
                    }}>
                      {marketGrade.grade}
                    </div>
                    <div style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      color: colors.text
                    }}>
                      {marketGrade.title}
                    </div>
                  </div>
                </div>
                <p style={{
                  color: colors.textLight,
                  fontSize: '13px',
                  lineHeight: '1.6',
                  margin: '0 0 12px 0'
                }}>
                  {marketGrade.description}
                </p>
                <div style={{
                  paddingLeft: '12px'
                }}>
                  {marketGrade.actions.map((action, idx) => (
                    <div key={idx} style={{
                      fontSize: '12px',
                      color: colors.text,
                      marginBottom: idx !== marketGrade.actions.length - 1 ? '6px' : '0',
                      paddingLeft: '16px',
                      position: 'relative'
                    }}>
                      <span style={{
                        position: 'absolute',
                        left: '0',
                        color: marketGrade.color
                      }}>
                        ✓
                      </span>
                      {action}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {resultInfo && (
              <div style={{
                background: colors.background,
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '24px',
                borderLeft: `4px solid ${resultInfo.color}`
              }}>
                <h4 style={{
                  color: colors.text,
                  fontSize: '14px',
                  fontWeight: '700',
                  margin: '0 0 16px 0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>📋</span>
                  Recommended Actions
                </h4>
                <ul style={{
                  margin: '0',
                  paddingLeft: '0',
                  listStyle: 'none'
                }}>
                  {resultInfo.actions.map((action, idx) => (
                    <li
                      key={idx}
                      style={{
                        color: colors.text,
                        fontSize: '13px',
                        marginBottom: idx !== resultInfo.actions.length - 1 ? '12px' : '0',
                        paddingLeft: '28px',
                        position: 'relative',
                        lineHeight: '1.5'
                      }}
                    >
                      <span style={{
                        position: 'absolute',
                        left: '0',
                        color: resultInfo.color,
                        fontSize: '16px'
                      }}>
                        ✓
                      </span>
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Other Detected Objects - DISABLED for now due to performance */}
            {/* 
            {result.other_objects && result.other_objects.length > 0 && (
              <div style={{
                background: colors.background,
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '24px',
                border: `1px solid ${colors.border}`
              }}>
                <h4 style={{
                  color: colors.text,
                  fontSize: '14px',
                  fontWeight: '700',
                  margin: '0 0 16px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>👁️</span>
                  Other Detected Objects
                </h4>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  {result.other_objects.map((obj, idx) => (
                    <div key={idx} style={{
                      background: colors.secondary,
                      border: `1px solid ${colors.border}`,
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '13px',
                      color: colors.text,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <span style={{ fontWeight: '600' }}>{obj.class}</span>
                      <span style={{ color: colors.textLight, fontSize: '11px' }}>
                        {Math.round(obj.confidence * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            */}

            {/* Analyze Another Button */}
            <button
              onClick={() => {
                setImage(null);
                setPreview(null);
                setResult(null);
                setError(null);
              }}
              style={{
                width: '100%',
                padding: '14px',
                marginTop: '24px',
                background: colors.primaryLight,
                color: colors.secondary,
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 0.3s ease',
                boxShadow: `0 4px 12px rgba(39, 174, 96, 0.3)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(39, 174, 96, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(39, 174, 96, 0.3)';
              }}
            >
              <span>🔄</span>
              Analyze Another Bunga
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        maxWidth: '1000px',
        margin: '40px auto 0',
        textAlign: 'center',
        color: colors.secondary,
        opacity: '0.8'
      }}>
        <p style={{ fontSize: '12px', margin: '0' }}>
          Model Accuracy: 98.5% | Bunga Classification with Health Grading
        </p>
      </div>
    </div>
  );
};

export default BungaAnalysis;
