import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import AdminSidebar from './AdminSidebar';
import AdminFooter from './AdminFooter';
import LoadingScreen from './LoadingScreen';

const AdminProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');

      try {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await axios.get(`${API_BASE_URL}/api/v1/users/me`);

        if (response.data.success) {
          setUser(response.data.user);
        }
      } catch (error) {
        console.error('Profile fetch error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, API_BASE_URL]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const colors = {
    background: '#0F2A24',
    surface: '#0F3B32',
    card: '#F6FBF8',
    cardAlt: '#ECF8F1',
    text: '#0E1F1B',
    textLight: '#4A625B',
    border: '#CDE9D8',
    primary: '#1C9B7A',
    accent: '#F5A524',
    shadow: 'rgba(10, 30, 25, 0.18)'
  };
  const fonts = {
    display: "'Space Grotesk', sans-serif",
    body: "'Manrope', sans-serif"
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#1a5f52' }}>
        <AdminSidebar />
        <LoadingScreen message="Loading Profile" subtitle="Fetching your information..." />
      </div>
    );
  }

  const pageStyle = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: colors.background,
    color: colors.text,
    position: 'relative',
    overflow: 'hidden'
  };
  const mainStyle = {
    flex: 1,
    padding: '36px 28px 48px',
    overflowY: 'auto',
    height: '100vh',
    marginLeft: '280px',
    position: 'relative',
    zIndex: 1
  };
  const shellStyle = {
    maxWidth: '980px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '22px'
  };
  const heroStyle = {
    display: 'grid',
    gridTemplateColumns: '150px 1fr',
    gap: '22px',
    alignItems: 'center',
    padding: '24px',
    borderRadius: '20px',
    background: 'linear-gradient(140deg, #F9FFFC 0%, #E9F7F0 100%)',
    border: `1px solid ${colors.border}`,
    boxShadow: `0 18px 30px ${colors.shadow}`
  };
  const avatarFrameStyle = {
    width: '130px',
    height: '130px',
    borderRadius: '26px',
    padding: '8px',
    background: 'linear-gradient(135deg, #DFF4E9 0%, #F3FFF9 100%)',
    border: `1px solid ${colors.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };
  const avatarStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '18px',
    objectFit: 'cover',
    border: `2px solid ${colors.card}`
  };
  const badgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '999px',
    backgroundColor: '#E5F6EF',
    border: `1px solid ${colors.border}`,
    color: colors.primary,
    fontSize: '12px',
    fontWeight: 700
  };
  const infoGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '16px'
  };
  const infoCardStyle = {
    background: colors.card,
    borderRadius: '16px',
    padding: '18px 20px',
    border: `1px solid ${colors.border}`,
    boxShadow: `0 10px 18px ${colors.shadow}`
  };
  const rowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '10px',
    fontSize: '14px',
    padding: '6px 0',
    borderBottom: '1px dashed rgba(16, 126, 94, 0.15)'
  };
  const rowLabelStyle = { color: colors.textLight, fontWeight: 600 };
  const rowValueStyle = { color: colors.text, fontWeight: 700 };
  const actionsStyle = {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    marginTop: '6px'
  };
  const primaryBtnStyle = {
    padding: '10px 18px',
    borderRadius: '999px',
    backgroundColor: colors.primary,
    color: '#ffffff',
    border: 'none',
    fontWeight: 700,
    fontFamily: fonts.body,
    cursor: 'pointer',
    boxShadow: '0 12px 18px rgba(28, 155, 122, 0.25)',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px'
  };
  const ghostBtnStyle = {
    padding: '10px 18px',
    borderRadius: '999px',
    border: `1px solid ${colors.border}`,
    backgroundColor: '#ffffff',
    color: colors.text,
    fontWeight: 700,
    fontFamily: fonts.body,
    cursor: 'pointer',
    textDecoration: 'none'
  };

  return (
    <div style={pageStyle}>
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Manrope:wght@400;500;600;700&display=swap');`}
      </style>
      <div style={{
        position: 'absolute',
        top: '-120px',
        right: '-120px',
        width: '320px',
        height: '320px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(28,155,122,0.35) 0%, rgba(28,155,122,0) 70%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-160px',
        left: '-120px',
        width: '380px',
        height: '380px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(245,165,36,0.3) 0%, rgba(245,165,36,0) 70%)',
        pointerEvents: 'none'
      }} />
      <AdminSidebar />
      <main style={mainStyle}>
        <div style={shellStyle}>
          <div style={{ fontFamily: fonts.display, color: '#E7F7EF' }}>
            <div style={{ fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.8 }}>Admin Profile</div>
            <div style={{ fontSize: '28px', fontWeight: 700 }}>Account Overview</div>
            <div style={{ fontSize: '14px', fontFamily: fonts.body, opacity: 0.85 }}>Manage your profile details and security preferences.</div>
          </div>

          <section style={heroStyle}>
            <div style={avatarFrameStyle}>
              <img
                src={user?.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Admin')}`}
                alt={user?.name}
                style={avatarStyle}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ fontFamily: fonts.display, fontSize: '22px', fontWeight: 700, color: colors.text }}>
                  {user?.name || 'Admin User'}
                </div>
                <span style={badgeStyle}>System Admin</span>
              </div>
              <div style={{ fontFamily: fonts.body, color: colors.textLight }}>{user?.email}</div>
              {user?.contact && (
                <div style={{ fontFamily: fonts.body, color: colors.textLight }}>Contact: {user.contact}</div>
              )}
              <div style={actionsStyle}>
                <Link to="/admin/profile/edit" style={primaryBtnStyle}>Edit Profile</Link>
                <button onClick={handleLogout} style={{ ...ghostBtnStyle, borderColor: colors.accent, color: colors.accent }}>
                  Logout
                </button>
              </div>
            </div>
          </section>

          <section style={infoGridStyle}>
            <div style={infoCardStyle}>
              <div style={{ fontFamily: fonts.display, fontSize: '16px', fontWeight: 700, marginBottom: '10px' }}>Profile Details</div>
              <div style={rowStyle}>
                <span style={rowLabelStyle}>Full Name</span>
                <span style={rowValueStyle}>{user?.name || '-'}</span>
              </div>
              <div style={rowStyle}>
                <span style={rowLabelStyle}>Email</span>
                <span style={rowValueStyle}>{user?.email || '-'}</span>
              </div>
              <div style={{ ...rowStyle, borderBottom: 'none' }}>
                <span style={rowLabelStyle}>Contact</span>
                <span style={rowValueStyle}>{user?.contact || '-'}</span>
              </div>
            </div>

            <div style={infoCardStyle}>
              <div style={{ fontFamily: fonts.display, fontSize: '16px', fontWeight: 700, marginBottom: '10px' }}>Address</div>
              <div style={rowStyle}>
                <span style={rowLabelStyle}>City</span>
                <span style={rowValueStyle}>{user?.address?.city || '-'}</span>
              </div>
              <div style={rowStyle}>
                <span style={rowLabelStyle}>Barangay</span>
                <span style={rowValueStyle}>{user?.address?.barangay || '-'}</span>
              </div>
              <div style={rowStyle}>
                <span style={rowLabelStyle}>Street</span>
                <span style={rowValueStyle}>{user?.address?.street || '-'}</span>
              </div>
              <div style={{ ...rowStyle, borderBottom: 'none' }}>
                <span style={rowLabelStyle}>Zip Code</span>
                <span style={rowValueStyle}>{user?.address?.zipcode || '-'}</span>
              </div>
            </div>
          </section>
        </div>
      </main>
      <div style={{ marginLeft: '280px' }}>
        <AdminFooter />
      </div>
    </div>
  );
};

export default AdminProfile;
