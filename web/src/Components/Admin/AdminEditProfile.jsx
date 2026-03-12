import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import AdminHeader from './AdminHeader';
import AdminFooter from './AdminFooter';
import LoadingScreen from './LoadingScreen';

const AdminEditProfile = () => {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    city: '',
    barangay: '',
    street: '',
    zipcode: ''
  });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  const colors = {
    background: '#0F2A24',
    card: '#F6FBF8',
    cardAlt: '#ECF8F1',
    text: '#0E1F1B',
    textLight: '#4A625B',
    border: '#CDE9D8',
    primary: '#1C9B7A',
    danger: '#DC2626',
    success: '#059669',
    accent: '#F5A524',
    shadow: 'rgba(10, 30, 25, 0.18)'
  };
  const fonts = {
    display: "'Space Grotesk', sans-serif",
    body: "'Manrope', sans-serif"
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');

      try {
        axios.defaults.headers.common.Authorization = `Bearer ${token}`;
        const response = await axios.get(`${API_BASE_URL}/api/v1/users/me`);

        if (response.data.success) {
          const currentUser = response.data.user;
          setUser(currentUser);
          setAvatarPreview(currentUser.avatar?.url || '');
          setFormData({
            name: currentUser.name || '',
            contact: currentUser.contact || '',
            city: currentUser.address?.city || '',
            barangay: currentUser.address?.barangay || '',
            street: currentUser.address?.street || '',
            zipcode: currentUser.address?.zipcode || ''
          });
        }
      } catch {
        navigate('/admin/profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, API_BASE_URL]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    if (!formData.name.trim()) {
      setError('Name is required');
      setSaving(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      data.append('name', formData.name.trim());
      data.append('contact', formData.contact || '');
      data.append('city', formData.city || '');
      data.append('barangay', formData.barangay || '');
      data.append('street', formData.street || '');
      data.append('zipcode', formData.zipcode || '');
      if (avatar) data.append('avatar', avatar);

      const response = await axios.put(
        `${API_BASE_URL}/api/v1/users/me/update`,
        data,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
      );

      if (response.data.success) {
        setSuccess('Profile updated successfully!');
        setTimeout(() => navigate('/admin/profile'), 1200);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#1a5f52' }}>
        <AdminHeader />
        <LoadingScreen message="Loading Profile" subtitle="Preparing edit form..." />
      </div>
    );
  }

  const pageStyle = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: colors.background,
    position: 'relative',
    overflow: 'hidden'
  };
  const mainStyle = {
    flex: 1,
    padding: '36px 28px 48px',
    overflowY: 'auto',
    height: 'calc(100vh - 80px)',
    position: 'relative',
    zIndex: 1
  };
  const cardStyle = {
    width: '100%',
    maxWidth: '960px',
    margin: '0 auto',
    background: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: '22px',
    padding: '28px',
    boxShadow: `0 18px 30px ${colors.shadow}`
  };
  const sectionTitleStyle = {
    fontFamily: fonts.display,
    fontSize: '16px',
    fontWeight: 700,
    color: colors.text,
    marginBottom: '12px'
  };
  const inputStyle = {
    padding: '12px 14px',
    borderRadius: '12px',
    border: `1px solid ${colors.border}`,
    backgroundColor: '#ffffff',
    fontFamily: fonts.body,
    fontSize: '14px',
    color: colors.text,
    boxShadow: '0 6px 14px rgba(15, 23, 42, 0.06)'
  };
  const labelStyle = {
    fontSize: '12px',
    color: colors.textLight,
    fontWeight: 600
  };
  const primaryBtnStyle = {
    padding: '12px 18px',
    borderRadius: '999px',
    border: 'none',
    backgroundColor: colors.primary,
    color: '#ffffff',
    fontWeight: 700,
    fontFamily: fonts.body,
    cursor: 'pointer',
    boxShadow: '0 12px 18px rgba(28, 155, 122, 0.25)'
  };
  const ghostBtnStyle = {
    padding: '10px 16px',
    borderRadius: '999px',
    border: `1px solid ${colors.border}`,
    backgroundColor: '#ffffff',
    color: colors.text,
    fontWeight: 700,
    fontFamily: fonts.body,
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px'
  };

  return (
    <div style={pageStyle}>
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Manrope:wght@400;500;600;700&display=swap');`}
      </style>
      <div style={{
        position: 'absolute',
        top: '-140px',
        right: '-140px',
        width: '360px',
        height: '360px',
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
      <AdminHeader />
      <main style={mainStyle}>
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', color: colors.textLight, fontFamily: fonts.body }}>Admin Settings</div>
              <h2 style={{ color: colors.text, margin: '6px 0 6px', fontFamily: fonts.display }}>Edit Profile</h2>
              <p style={{ margin: 0, color: colors.textLight, fontFamily: fonts.body, fontSize: '14px' }}>
                Keep your profile and contact details up to date.
              </p>
            </div>
            <Link to="/admin/profile" style={ghostBtnStyle}>Back to Profile</Link>
          </div>

          {(error || success) && (
            <div style={{
              marginTop: '14px',
              padding: '10px 14px',
              borderRadius: '12px',
              backgroundColor: error ? '#FDE8E8' : '#E7F9F1',
              color: error ? colors.danger : colors.success,
              fontFamily: fonts.body,
              fontWeight: 600
            }}>
              {error || success}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginTop: '20px' }}>
            <section style={{ background: colors.cardAlt, borderRadius: '16px', padding: '16px', border: `1px solid ${colors.border}` }}>
              <div style={sectionTitleStyle}>Profile Photo</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
                {avatarPreview && (
                  <img
                    src={avatarPreview}
                    alt="Avatar Preview"
                    style={{ width: '110px', height: '110px', borderRadius: '20px', objectFit: 'cover', border: `2px solid ${colors.border}` }}
                  />
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={labelStyle}>Upload new avatar</label>
                  <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ fontFamily: fonts.body }} />
                </div>
              </div>
            </section>

            <section style={{ background: '#ffffff', borderRadius: '16px', padding: '16px', border: `1px solid ${colors.border}` }}>
              <div style={sectionTitleStyle}>Basic Information</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '14px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={labelStyle}>Full Name</label>
                  <input name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" required style={inputStyle} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={labelStyle}>Email</label>
                  <input value={user?.email || ''} disabled style={{ ...inputStyle, background: '#F5F7F9', color: colors.textLight }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={labelStyle}>Contact</label>
                  <input name="contact" value={formData.contact} onChange={handleChange} placeholder="Contact" style={inputStyle} />
                </div>
              </div>
            </section>

            <section style={{ background: '#ffffff', borderRadius: '16px', padding: '16px', border: `1px solid ${colors.border}` }}>
              <div style={sectionTitleStyle}>Address Details</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '14px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={labelStyle}>City</label>
                  <input name="city" value={formData.city} onChange={handleChange} placeholder="City" style={inputStyle} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={labelStyle}>Barangay</label>
                  <input name="barangay" value={formData.barangay} onChange={handleChange} placeholder="Barangay" style={inputStyle} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={labelStyle}>Street</label>
                  <input name="street" value={formData.street} onChange={handleChange} placeholder="Street" style={inputStyle} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={labelStyle}>Zip Code</label>
                  <input name="zipcode" value={formData.zipcode} onChange={handleChange} placeholder="Zip Code" style={inputStyle} />
                </div>
              </div>
            </section>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <Link to="/admin/profile" style={ghostBtnStyle}>Cancel</Link>
              <button type="submit" disabled={saving} style={{ ...primaryBtnStyle, opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </main>
      <AdminFooter />
    </div>
  );
};

export default AdminEditProfile;
