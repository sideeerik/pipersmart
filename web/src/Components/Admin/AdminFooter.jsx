import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminFooter = () => {
  const [systemStatus, setSystemStatus] = useState({
    apiStatus: 'checking',
    dbStatus: 'checking',
    uptime: '—',
  });

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  const colors = {
    primary: '#0F766E',
    primaryLight: '#14B8A6',
    secondary: '#FFDBAC',
    background: '#F8FAFC',
    text: '#0F172A',
    textLight: '#475569',
    border: '#E2E8F0',
    success: '#059669',
    warning: '#D97706',
    danger: '#DC2626',
  };

  useEffect(() => {
    const checkSystemStatus = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/v1/health`, {
          timeout: 5000,
        });
        
        if (response.data) {
          setSystemStatus({
            apiStatus: 'online',
            dbStatus: response.data.database === 'connected' ? 'online' : 'offline',
            uptime: response.data.uptime || '—',
          });
        }
      } catch (error) {
        setSystemStatus({
          apiStatus: 'offline',
          dbStatus: 'offline',
          uptime: '—',
        });
      }
    };

    checkSystemStatus();
    const interval = setInterval(checkSystemStatus, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [API_BASE_URL]);

  const StatusIndicator = ({ status, label }) => {
    const statusColor = status === 'online' ? colors.success : status === 'checking' ? colors.warning : colors.danger;
    const statusText = status === 'online' ? 'Online' : status === 'checking' ? 'Checking...' : 'Offline';

    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        backgroundColor: 'rgba(0, 0, 0, 0.02)',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '500',
        color: colors.textLight,
      }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: statusColor,
          animation: status === 'checking' ? 'pulse 2s infinite' : 'none',
        }} />
        <span>{label}</span>
        <span style={{ color: statusColor, fontWeight: '600' }}>({statusText})</span>
      </div>
    );
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer style={{
      backgroundColor: '#F8FAFB',
      borderTop: `2px solid ${colors.border}`,
      padding: '32px 24px',
      marginTop: '60px',
      fontFamily: 'inherit',
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Main Footer Content */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '32px',
          marginBottom: '32px',
        }}>
          {/* About Section */}
          <div>
            <h4 style={{ color: colors.text, fontSize: '14px', fontWeight: 'bold', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              About PiperSmart
            </h4>
            <p style={{ color: colors.textLight, fontSize: '13px', lineHeight: '1.6', margin: 0 }}>
              PiperSmart is an intelligent agricultural technology platform designed to detect and analyze black pepper diseases using advanced AI and machine learning.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: colors.text, fontSize: '14px', fontWeight: 'bold', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Quick Links
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>
                <a href="#" style={{
                  color: colors.primary,
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  display: 'inline-block',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = colors.primaryLight;
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = colors.primary;
                  e.currentTarget.style.transform = 'translateX(0)';
                }}>
                  → Documentation
                </a>
              </li>
              <li>
                <a href="#" style={{
                  color: colors.primary,
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  display: 'inline-block',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = colors.primaryLight;
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = colors.primary;
                  e.currentTarget.style.transform = 'translateX(0)';
                }}>
                  → Support
                </a>
              </li>
              <li>
                <a href="#" style={{
                  color: colors.primary,
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  display: 'inline-block',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = colors.primaryLight;
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = colors.primary;
                  e.currentTarget.style.transform = 'translateX(0)';
                }}>
                  → Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* System Status */}
          <div>
            <h4 style={{ color: colors.text, fontSize: '14px', fontWeight: 'bold', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              System Status
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <StatusIndicator status={systemStatus.apiStatus} label="API Server" />
              <StatusIndicator status={systemStatus.dbStatus} label="Database" />
              <div style={{
                padding: '8px 12px',
                backgroundColor: 'rgba(0, 0, 0, 0.02)',
                borderRadius: '6px',
                fontSize: '12px',
                color: colors.textLight,
              }}>
                <span style={{ fontWeight: '500' }}>Version:</span> <span style={{ fontWeight: '600', color: colors.text }}>1.0.0</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', backgroundColor: colors.border, margin: '24px 0' }} />

        {/* Bottom Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          fontSize: '12px',
          color: colors.textLight,
        }}>
          <div>
            <span style={{ fontWeight: '500' }}>© {currentYear} PiperSmart.</span>
            <span style={{ marginLeft: '8px' }}>All rights reserved.</span>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <a href="#" style={{ color: colors.primary, textDecoration: 'none', fontWeight: '500', transition: 'all 0.2s ease' }}
            onMouseEnter={(e) => e.currentTarget.style.color = colors.primaryLight}
            onMouseLeave={(e) => e.currentTarget.style.color = colors.primary}>
              Terms of Service
            </a>
            <span style={{ color: colors.border }}>•</span>
            <a href="#" style={{ color: colors.primary, textDecoration: 'none', fontWeight: '500', transition: 'all 0.2s ease' }}
            onMouseEnter={(e) => e.currentTarget.style.color = colors.primaryLight}
            onMouseLeave={(e) => e.currentTarget.style.color = colors.primary}>
              Contact
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </footer>
  );
};

export default AdminFooter;
