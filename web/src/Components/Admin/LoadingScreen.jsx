import React from 'react';

const LoadingScreen = ({ message = 'Loading', subtitle = 'Please wait...' }) => {
  return (
    <div style={{
      height: 'calc(100vh - 80px)',
      width: '100%',
      background: 'linear-gradient(135deg, #1a5f52 0%, #2a7a68 50%, #1a5f52 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Background Blobs */}
      <div style={{
        position: 'absolute',
        width: '200px',
        height: '200px',
        background: 'rgba(168, 213, 186, 0.1)',
        borderRadius: '50%',
        top: '-100px',
        left: '-100px',
        animation: 'float 8s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute',
        width: '150px',
        height: '150px',
        background: 'rgba(168, 213, 186, 0.08)',
        borderRadius: '50%',
        bottom: '-75px',
        right: '-75px',
        animation: 'float 10s ease-in-out infinite reverse'
      }} />
      <div style={{
        position: 'absolute',
        width: '180px',
        height: '180px',
        background: 'rgba(168, 213, 186, 0.06)',
        borderRadius: '50%',
        top: '20%',
        right: '10%',
        animation: 'float 12s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute',
        width: '120px',
        height: '120px',
        background: 'rgba(168, 213, 186, 0.12)',
        borderRadius: '50%',
        bottom: '20%',
        left: '15%',
        animation: 'float 9s ease-in-out infinite reverse'
      }} />
      <div style={{
        position: 'absolute',
        width: '160px',
        height: '160px',
        background: 'rgba(168, 213, 186, 0.05)',
        borderRadius: '50%',
        top: '50%',
        left: '-80px',
        animation: 'float 11s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute',
        width: '100px',
        height: '100px',
        background: 'rgba(168, 213, 186, 0.09)',
        borderRadius: '50%',
        bottom: '30%',
        right: '5%',
        animation: 'float 7s ease-in-out infinite reverse'
      }} />

      {/* Loading Container */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        textAlign: 'center'
      }}>
        {/* Animated Spinner */}
        <div style={{
          marginBottom: '40px',
          display: 'flex',
          justifyContent: 'center'
        }}>
          {/* Outer rotating ring */}
          <div style={{
            position: 'relative',
            width: '100px',
            height: '100px'
          }}>
            {/* Main spinner */}
            <div style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              border: '4px solid rgba(168, 213, 186, 0.2)',
              borderTop: '4px solid #a8d5ba',
              borderRadius: '50%',
              animation: 'spin 1.5s linear infinite'
            }} />

            {/* Secondary spinner - offset */}
            <div style={{
              position: 'absolute',
              width: '70%',
              height: '70%',
              border: '3px solid rgba(168, 213, 186, 0.15)',
              borderRight: '3px solid #7fb3a0',
              borderRadius: '50%',
              top: '15%',
              left: '15%',
              animation: 'spin-reverse 2s linear infinite'
            }} />

            {/* Center dot */}
            <div style={{
              position: 'absolute',
              width: '20px',
              height: '20px',
              background: '#a8d5ba',
              borderRadius: '50%',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              boxShadow: '0 0 15px rgba(168, 213, 186, 0.6)'
            }} />
          </div>
        </div>

        {/* Main Text */}
        <h2 style={{
          fontSize: '32px',
          fontWeight: '700',
          color: '#ffffff',
          margin: '0 0 12px 0',
          letterSpacing: '0.5px',
          textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
          fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
        }}>
          {message}
        </h2>

        {/* Subtitle */}
        <p style={{
          fontSize: '16px',
          color: '#000000',
          margin: '0 0 24px 0',
          fontWeight: '500',
          letterSpacing: '0.3px',
          fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
        }}>
          {subtitle}
        </p>

        {/* Animated dots */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          alignItems: 'center'
        }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: '8px',
                height: '8px',
                background: '#a8d5ba',
                borderRadius: '50%',
                animation: `bounce 1.4s infinite ease-in-out`,
                animationDelay: `${i * 0.2}s`,
                boxShadow: '0 0 8px rgba(168, 213, 186, 0.5)'
              }}
            />
          ))}
        </div>
      </div>

      {/* Styles */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes spin-reverse {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(20px); }
        }

        @keyframes bounce {
          0%, 80%, 100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          40% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
