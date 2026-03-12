import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MdList, MdSchedule, MdSearch, MdComment, MdPerson, MdCheckCircle, MdDelete, MdEdit, MdLabel, MdVisibility, MdArticle, MdClear, MdBuild, MdBarChart } from 'react-icons/md';
import AdminSidebar from './AdminSidebar';
import AdminFooter from './AdminFooter';

const PostReported = () => {
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  // State management
  const [reportedPosts, setReportedPosts] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    reviewed: 0,
    dismissed: 0,
    actionTaken: 0
  });
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Pagination and filters
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [adminNotes, setAdminNotes] = useState('');

  // Color scheme
  const colors = {
    primary: '#1C9B7A',
    primaryLight: '#2DD4BF',
    secondary: '#F6FBF8',
    background: '#0F2A24',
    backgroundHover: '#ECF8F1',
    text: '#0E1F1B',
    textLight: '#4A625B',
    border: '#CDE9D8',
    accent: '#F5A524',
    danger: '#E45757',
    success: '#1FA47A',
    warning: '#F0B429',
    info: '#4E9FFF'
  };
  const fonts = {
    display: "'Space Grotesk', sans-serif",
    body: "'Manrope', sans-serif"
  };

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/login');
  }, [navigate]);

  // Setup axios interceptor
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  // Fetch reported posts
  const fetchReportedPosts = async (page = 1, status = '') => {
    setLoading(true);
    setError(null);
    try {
      let url = `${API_BASE_URL}/api/v1/reports/posts?page=${page}&limit=${pageSize}`;
      if (status && status !== 'all') {
        url += `&status=${status}`;
      }

      console.log('[INFO] Fetching reported posts from:', url);
      console.log('[AUTH] Auth header:', axios.defaults.headers.common['Authorization']);

      const response = await axios.get(url);
      console.log('[SUCCESS] Response received:', response.data);
      
      if (response.data.success) {
        console.log('[DATA] Posts data:', response.data.data);
        setReportedPosts(response.data.data);
        setCurrentPage(page);
      } else {
        console.warn('[WARNING] Response not successful:', response.data);
        setError('Failed to load reported posts');
      }
    } catch (err) {
      console.error('[ERROR] Error fetching reported posts:', err);
      console.error('   Status:', err.response?.status);
      console.error('   Data:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to fetch reported posts');
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const statsUrl = `${API_BASE_URL}/api/v1/reports/posts/stats`;
      console.log('[DATA] Fetching stats from:', statsUrl);
      const response = await axios.get(statsUrl);
      console.log('[SUCCESS] Stats response:', response.data);
      if (response.data.success) {
        console.log('[STATS] Stats data:', response.data.data);
        setStats(response.data.data);
      }
    } catch (err) {
      console.error('[ERROR] Error fetching stats:', err);
      console.error('   Status:', err.response?.status);
      console.error('   Data:', err.response?.data);
    }
  };

  // Get single report detail
  const fetchReportDetail = async (reportId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/reports/posts/${reportId}`);
      if (response.data.success) {
        setSelectedReport(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch report detail');
    } finally {
      setLoading(false);
    }
  };

  // Delete reported post
  const handleDeletePost = async (reportId) => {
    if (!window.confirm('Are you sure you want to DELETE this post? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/reports/posts/${reportId}/delete`, {
        adminNotes: adminNotes || 'Post deleted due to violation'
      });

      if (response.data.success) {
        setSuccessMessage('Post deleted successfully!');
        setSelectedReport(null);
        setAdminNotes('');
        fetchReportedPosts(1, statusFilter);
        fetchStats();
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete post');
    } finally {
      setLoading(false);
    }
  };

  // Dismiss report
  const handleDismissReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to DISMISS this report? The post will remain.')) {
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/reports/posts/${reportId}/dismiss`, {
        adminNotes: adminNotes || 'Report dismissed - no action needed'
      });

      if (response.data.success) {
        setSuccessMessage('Report dismissed successfully!');
        setSelectedReport(null);
        setAdminNotes('');
        fetchReportedPosts(1, statusFilter);
        fetchStats();
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to dismiss report');
    } finally {
      setLoading(false);
    }
  };

  // Mark as reviewed
  const handleMarkReviewed = async (reportId) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/reports/posts/${reportId}/reviewed`);

      if (response.data.success) {
        setSuccessMessage('Report marked as reviewed!');
        fetchReportedPosts(currentPage, statusFilter);
        fetchStats();
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark as reviewed');
    } finally {
      setLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchStats();
    fetchReportedPosts(1, statusFilter);
  }, [statusFilter]);

  // ==================== UI COMPONENTS ====================

  const StatCard = ({ label, value, icon, color }) => (
    <div style={{
      backgroundColor: '#FFFFFF',
      backgroundImage: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
      border: `2px solid ${color}30`,
      borderRadius: '16px',
      padding: '24px',
      textAlign: 'center',
      boxShadow: `0 10px 30px ${color}15, inset 0 1px 1px rgba(255,255,255,0.5)`,
      transition: 'all 0.4s cubic-bezier(0.23, 1, 0.320, 1)',
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: fonts.body
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-8px)';
      e.currentTarget.style.boxShadow = `0 20px 40px ${color}25, inset 0 1px 1px rgba(255,255,255,0.8)`;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = `0 10px 30px ${color}15, inset 0 1px 1px rgba(255,255,255,0.5)`;
    }}
    >
      <div style={{
        position: 'absolute',
        top: '-20px',
        right: '-20px',
        fontSize: '80px',
        opacity: 0.08,
        transform: 'rotate(-25deg)'
      }}>
        {icon}
      </div>
      <div style={{
        fontSize: '32px',
        marginBottom: '12px',
        animation: 'pulse 2s infinite',
        filter: `drop-shadow(0 4px 8px ${color}20)`
      }}>
        {icon}
      </div>
      <div style={{
        color: colors.textLight,
        fontSize: '11px',
        fontWeight: '700',
        marginBottom: '8px',
        letterSpacing: '0.5px',
        textTransform: 'uppercase',
        opacity: 0.7
      }}>
        {label}
      </div>
      <div style={{
        color: color,
        fontSize: '36px',
        fontWeight: 'bold',
        marginTop: '8px'
      }}>
        {value ?? 0}
      </div>
    </div>
  );

  const StatusBadge = ({ status }) => {
    const badgeConfigs = {
      pending: {
        bgColor: 'linear-gradient(135deg, #FFF3CD, #FFECB3)',
        textColor: '#856404',
        icon: <MdSchedule size={16} />,
        label: 'Pending'
      },
      reviewed: {
        bgColor: 'linear-gradient(135deg, #D1ECF1, #B3E5FC)',
        textColor: '#0C5460',
        icon: <MdVisibility size={16} />,
        label: 'Reviewed'
      },
      dismissed: {
        bgColor: 'linear-gradient(135deg, #D4EDDA, #C8E6C9)',
        textColor: '#155724',
        icon: <MdCheckCircle size={16} />,
        label: 'Dismissed'
      },
      'action-taken': {
        bgColor: 'linear-gradient(135deg, #F8D7DA, #FFCDD2)',
        textColor: '#721C24',
        icon: <MdDelete size={16} />,
        label: 'Action Taken'
      }
    };

    const config = badgeConfigs[status] || badgeConfigs.pending;

    return (
      <span style={{
        background: config.bgColor,
        color: config.textColor,
        padding: '8px 16px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 'bold',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease',
        animation: 'slideIn 0.4s ease'
      }}>
        <span style={{ fontSize: '14px' }}>{config.icon}</span>
        {config.label}
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: colors.background, position: 'relative', overflow: 'hidden' }}>
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
        background: 'radial-gradient(circle, rgba(245,165,36,0.25) 0%, rgba(245,165,36,0) 70%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-180px',
        left: '-140px',
        width: '420px',
        height: '420px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(28,155,122,0.35) 0%, rgba(28,155,122,0) 70%)',
        pointerEvents: 'none'
      }} />
      <AdminSidebar />
      <main style={{
      flex: 1,
      padding: '32px 20px',
      overflowY: 'auto',
      height: '100vh',
      marginLeft: '280px',
      fontFamily: fonts.body,
      position: 'relative',
      zIndex: 1
    }}>
      <style>{`
        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
      
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          background: `linear-gradient(135deg, #E45757 0%, #F08A5D 50%, #F5A524 100%)`,
          backgroundSize: '200% 200%',
          animation: 'slideInDown 0.6s ease',
          color: colors.secondary,
          padding: '48px 40px',
          borderRadius: '20px',
          marginBottom: '40px',
          boxShadow: '0 20px 60px rgba(228, 87, 87, 0.25)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-80px',
            right: '-80px',
            fontSize: '300px',
            opacity: 0.08,
            animation: 'pulse 3s infinite'
          }}>
            🚩
          </div>
          <div style={{
            position: 'absolute',
            bottom: '-60px',
            left: '-60px',
            fontSize: '250px',
            opacity: 0.06,
            animation: 'pulse 4s infinite'
          }}>
            <div style={{ fontSize: '250px', opacity: 0.06 }}><MdList /></div>
          </div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h1 style={{
              fontSize: '42px',
              fontWeight: 'bold',
              margin: '0 0 12px 0',
              textShadow: '0 4px 12px rgba(0,0,0,0.2)',
              letterSpacing: '-0.5px',
              fontFamily: fonts.display
            }}>
              🚩 Reported Threads Management
            </h1>
            <p style={{
              margin: 0,
              fontSize: '16px',
              opacity: 0.95,
              fontWeight: '500',
              fontFamily: fonts.body
            }}>
              Review and moderate user-reported forum discussions
            </p>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div style={{
            backgroundColor: colors.success,
            color: colors.secondary,
            padding: '16px 20px',
            borderRadius: '12px',
            marginBottom: '24px',
            boxShadow: `0 8px 24px ${colors.success}30`,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            animation: 'slideIn 0.4s ease',
            borderLeft: `4px solid ${colors.secondary}`,
            fontWeight: '500'
          }}>
            <span style={{ fontSize: '20px' }}><MdCheckCircle size={24} color={colors.success} /></span>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={{
            backgroundColor: colors.danger,
            color: colors.secondary,
            padding: '16px 20px',
            borderRadius: '12px',
            marginBottom: '24px',
            boxShadow: `0 8px 24px ${colors.danger}30`,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            animation: 'slideIn 0.4s ease',
            borderLeft: `4px solid ${colors.secondary}`,
            fontWeight: '500'
          }}>
            <span style={{ fontSize: '20px' }}><MdClear size={24} color={colors.danger} /></span>
            <span>{error}</span>
          </div>
        )}

        {/* Statistics */}
        <div style={{ animation: 'fadeIn 0.6s ease' }}>
          <h2 style={{
            color: colors.secondary,
            fontSize: '22px',
            fontWeight: 'bold',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontFamily: fonts.display
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MdBarChart /> Overview</span>
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
            marginBottom: '40px'
          }}>
            <StatCard label="Total Reports" value={stats?.total || 0} icon={<MdArticle size={20} />} color={colors.primary} />
            <StatCard label="Pending Review" value={stats?.pending || 0} icon={<MdSchedule size={20} />} color={colors.warning} />
            <StatCard label="Reviewed" value={stats?.reviewed || 0} icon={<MdVisibility size={20} />} color={colors.info} />
            <StatCard label="Dismissed" value={stats?.dismissed || 0} icon={<MdCheckCircle size={20} />} color={colors.success} />
            <StatCard label="Action Taken" value={stats?.actionTaken || 0} icon={<MdDelete size={20} />} color={colors.danger} />
          </div>
        </div>

        {/* Filter Section */}
        <div style={{
          backgroundColor: colors.secondary,
          padding: '24px',
          borderRadius: '16px',
          marginBottom: '30px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          border: `1px solid ${colors.border}`,
          animation: 'fadeIn 0.6s ease'
        }}>
          <label style={{
            color: colors.text,
            fontWeight: '600',
            marginRight: '16px',
            fontSize: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '12px'
          }}>
            <span>🔍</span> Filter by Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: '12px 16px',
              border: `2px solid ${colors.border}`,
              borderRadius: '10px',
              backgroundColor: colors.secondary,
              color: colors.text,
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              maxWidth: '100%'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = colors.primary;
              e.currentTarget.style.boxShadow = `0 4px 12px ${colors.primary}20`;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = colors.border;
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
            }}
          >
            <option value="all"><MdArticle size={16} style={{ display: 'inline', marginRight: '4px' }} /> All Reports</option>
            <option value="pending"><MdSchedule size={16} style={{ display: 'inline', marginRight: '4px' }} /> Pending Review</option>
            <option value="reviewed"><MdVisibility size={16} style={{ display: 'inline', marginRight: '4px' }} /> Reviewed</option>
            <option value="dismissed"><MdCheckCircle size={16} style={{ display: 'inline', marginRight: '4px' }} /> Dismissed</option>
            <option value="action-taken"><MdDelete size={16} style={{ display: 'inline', marginRight: '4px' }} /> Action Taken</option>
          </select>
        </div>

        {/* Reported Posts List */}
        {loading && (
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
            animation: 'fadeIn 0.4s ease'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '20px',
              animation: 'bounce 1.5s infinite'
            }}>
              <MdSchedule size={48} color={colors.warning} />
            </div>
            <p style={{ color: colors.textLight, fontSize: '16px', fontWeight: '500' }}>
              Loading reported threads...
            </p>
          </div>
        )}

        {!loading && reportedPosts.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'fadeIn 0.6s ease' }}>
            {reportedPosts.map((item, index) => (
              <div
                key={item._id}
                style={{
                  backgroundColor: colors.secondary,
                  border: `2px solid ${colors.border}`,
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08), inset 0 1px 1px rgba(255,255,255,0.3)',
                  transition: 'all 0.3s cubic-bezier(0.23, 1, 0.320, 1)',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  animation: `slideIn 0.4s ease ${index * 0.05}s both`,
                  backgroundImage: `linear-gradient(135deg, transparent 0%, ${colors.background}20 100%)`
                }}
                onClick={() => fetchReportDetail(item._id)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 16px 48px rgba(39, 174, 96, 0.2), inset 0 1px 1px rgba(255,255,255,0.5)`;
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = colors.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.08), inset 0 1px 1px rgba(255,255,255,0.3)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = colors.border;
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '20px', alignItems: 'start', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{
                      color: colors.text,
                      fontWeight: 'bold',
                      margin: '0 0 8px 0',
                      fontSize: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <MdArticle size={24} color={colors.primary} />
                      {item.post.title}
                    </h3>
                    <p style={{
                      color: colors.textLight,
                      fontSize: '13px',
                      margin: '0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <MdEdit size={16} /> By: {item.author.name}
                    </p>
                  </div>
                  <StatusBadge status={item.report.status} />
                </div>

                <div style={{
                  color: colors.text,
                  fontSize: '14px',
                  marginBottom: '16px',
                  padding: '14px',
                  backgroundColor: colors.background,
                  borderRadius: '12px',
                  maxHeight: '100px',
                  overflow: 'hidden',
                  borderLeft: `4px solid ${colors.accent}`,
                  lineHeight: '1.5'
                }}>
                    <strong style={{ color: colors.accent, display: 'flex', alignItems: 'center', gap: '6px' }}><MdComment size={16} /> Report Reason:</strong>
                  <div style={{ marginTop: '8px', color: colors.text }}>{item.report.reason}</div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                  gap: '12px',
                  marginBottom: '16px',
                  fontSize: '13px',
                  color: colors.textLight
                }}>
                  <div style={{
                    backgroundColor: colors.background,
                    padding: '10px 12px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <MdLabel size={16} />
                    <span><strong>Category:</strong> {item.post.category}</span>
                  </div>
                  <div style={{
                    backgroundColor: colors.background,
                    padding: '10px 12px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <MdPerson size={16} />
                    <span><strong>Reporter:</strong> {item.reportedBy.name}</span>
                  </div>
                  <div style={{
                    backgroundColor: colors.background,
                    padding: '10px 12px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MdSchedule size={14} /> {new Date(item.report.createdAt).toLocaleDateString()}</span>
                    <span>{new Date(item.report.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '16px',
                  borderTop: `1px solid ${colors.border}`
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '12px',
                    color: colors.textLight
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MdVisibility size={14} /> {item.post.views || 0} views</span>
                    <span>•</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MdComment size={14} /> {item.post.repliesCount || 0} replies</span>
                  </div>
                  <span style={{
                    cursor: 'pointer',
                    color: colors.primary,
                    fontWeight: 'bold',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.2s ease'
                  }}>
                    View Details → 
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && reportedPosts.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '100px 30px',
            backgroundColor: colors.secondary,
            border: `2px dashed ${colors.primary}40`,
            borderRadius: '16px',
            color: colors.textLight,
            backgroundImage: `linear-gradient(135deg, transparent 0%, ${colors.primary}05 100%)`,
            animation: 'fadeIn 0.5s ease'
          }}>
            <div style={{
              fontSize: '72px',
              marginBottom: '24px',
              animation: 'bounce 2s infinite',
              display: 'inline-block'
            }}>
              📭
            </div>
            <p style={{
              fontSize: '18px',
              fontWeight: '600',
              margin: '0 0 8px 0',
              color: colors.text
            }}>
              No Reported Threads Found
            </p>
            <p style={{
              fontSize: '14px',
              margin: '0',
              color: colors.textLight,
              maxWidth: '400px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}>
              Great news! There are no reported threads in this category. The community is keeping things clean and respectful.
            </p>
          </div>
        )}

        {/* Detail Modal */}
        {selectedReport && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '20px',
            backdropFilter: 'blur(4px)',
            animation: 'fadeIn 0.3s ease'
          }}
          onClick={() => setSelectedReport(null)}
          >
            <div
              style={{
                backgroundColor: colors.secondary,
                borderRadius: '20px',
                padding: '40px',
                maxWidth: '800px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 25px 80px rgba(0, 0, 0, 0.4), 0 0 80px rgba(39, 174, 96, 0.1)',
                border: `2px solid ${colors.primary}20`,
                backgroundImage: `linear-gradient(135deg, transparent 0%, ${colors.primary}08 100%)`,
                animation: 'slideIn 0.4s ease'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedReport(null)}
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  backgroundColor: colors.danger,
                  color: colors.secondary,
                  border: 'none',
                  borderRadius: '50%',
                  width: '44px',
                  height: '44px',
                  fontSize: '22px',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.23, 1, 0.320, 1)',
                  boxShadow: `0 6px 20px ${colors.danger}30`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.15) rotate(90deg)';
                  e.currentTarget.style.boxShadow = `0 10px 30px ${colors.danger}50`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                  e.currentTarget.style.boxShadow = `0 6px 20px ${colors.danger}30`;
                }}
              >
                ✕
              </button>

              <h2 style={{ color: colors.text, fontSize: '28px', fontWeight: 'bold', marginBottom: '28px', marginTop: 0, display: 'flex', alignItems: 'center', gap: '12px', animation: 'slideInDown 0.5s ease' }}>
                <span style={{ fontSize: '32px' }}>🚩</span>
                Report Details
              </h2>

              {/* Report Info */}
              <div style={{
                backgroundImage: `linear-gradient(135deg, ${colors.accent}10 0%, ${colors.accent}05 100%)`,
                border: `2px solid ${colors.accent}30`,
                padding: '20px',
                borderRadius: '14px',
                marginBottom: '24px',
                borderLeft: `6px solid ${colors.accent}`,
                boxShadow: `0 8px 24px ${colors.accent}15`,
                animation: 'slideIn 0.5s ease 0.1s both'
              }}>
                <h3 style={{ color: colors.text, margin: '0 0 16px 0', fontSize: '15px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MdArticle size={18} />
                  Report Information
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '13px' }}>
                  <div style={{
                    backgroundColor: colors.secondary,
                    padding: '12px',
                    borderRadius: '10px',
                    border: `1px solid ${colors.accent}20`
                  }}>
                    <span style={{ color: colors.textLight, fontWeight: '600', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}><MdBarChart size={16} /> Status</span>
                    <div style={{ marginTop: '4px' }}>
                      <StatusBadge status={selectedReport.report.status} />
                    </div>
                  </div>
                  <div style={{
                    backgroundColor: colors.secondary,
                    padding: '12px',
                    borderRadius: '10px',
                    border: `1px solid ${colors.accent}20`
                  }}>
                    <span style={{ color: colors.textLight, fontWeight: '600', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}><MdPerson size={16} /> Reported By</span>
                    <div style={{ marginTop: '4px', color: colors.text, fontWeight: '600' }}>
                      {selectedReport.reportedBy.name}
                    </div>
                  </div>
                  <div style={{
                    backgroundColor: colors.secondary,
                    padding: '12px',
                    borderRadius: '10px',
                    border: `1px solid ${colors.accent}20`
                  }}>
                    <span style={{ color: colors.textLight, fontWeight: '600', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}><MdSchedule size={16} /> Report Date</span>
                    <div style={{ marginTop: '4px', color: colors.text }}>
                      {new Date(selectedReport.report.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div style={{
                    backgroundColor: colors.secondary,
                    padding: '12px',
                    borderRadius: '10px',
                    border: `1px solid ${colors.accent}20`
                  }}>
                    <span style={{ color: colors.textLight, fontWeight: '600', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}><MdLabel size={16} /> Reason</span>
                    <div style={{ marginTop: '4px', color: colors.text, fontWeight: '500' }}>
                      {selectedReport.report.reason}
                    </div>
                  </div>
                </div>
              </div>

              {/* Thread Content */}
              <div style={{
                backgroundImage: `linear-gradient(135deg, ${colors.info}10 0%, ${colors.info}05 100%)`,
                border: `2px solid ${colors.info}30`,
                padding: '20px',
                borderRadius: '14px',
                marginBottom: '24px',
                borderLeft: `6px solid ${colors.info}`,
                boxShadow: `0 8px 24px ${colors.info}15`,
                animation: 'slideIn 0.5s ease 0.2s both'
              }}>
                <h3 style={{ color: colors.text, margin: '0 0 16px 0', fontSize: '15px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>📌</span>
                  Reported Thread
                </h3>
                <div style={{ fontSize: '13px' }}>
                  <div style={{
                    marginBottom: '14px',
                    padding: '12px',
                    borderRadius: '10px',
                    backgroundColor: colors.secondary,
                    border: `1px solid ${colors.info}20`
                  }}>
                    <span style={{ color: colors.textLight, fontWeight: '600' }}>📝 Title:</span>
                    <div style={{ marginTop: '6px', color: colors.text, fontWeight: 'bold', fontSize: '16px' }}>
                      {selectedReport.post.title}
                    </div>
                  </div>
                  <div style={{
                    marginBottom: '14px',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px'
                  }}>
                    <div style={{
                      padding: '12px',
                      borderRadius: '10px',
                      backgroundColor: colors.secondary,
                      border: `1px solid ${colors.info}20`
                    }}>
                      <span style={{ color: colors.textLight, fontWeight: '600', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}><MdPerson size={14} /> Author:</span>
                      <div style={{ marginTop: '6px', color: colors.text, fontWeight: '500' }}>
                        {selectedReport.author.name}
                      </div>
                      <div style={{ marginTop: '2px', color: colors.textLight, fontSize: '11px' }}>
                        {selectedReport.author.email}
                      </div>
                    </div>
                    <div style={{
                      padding: '12px',
                      borderRadius: '10px',
                      backgroundColor: colors.secondary,
                      border: `1px solid ${colors.info}20`
                    }}>
                      <span style={{ color: colors.textLight, fontWeight: '600', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}><MdLabel size={14} /> Category:</span>
                      <div style={{ marginTop: '6px', color: colors.text, fontWeight: '500' }}>
                        {selectedReport.post.category}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    marginBottom: '14px',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    fontSize: '12px'
                  }}>
                    <div style={{
                      padding: '12px',
                      borderRadius: '10px',
                      backgroundColor: colors.secondary,
                      border: `1px solid ${colors.info}20`,
                      textAlign: 'center'
                    }}>
                      <span style={{ color: colors.textLight, display: 'flex', alignItems: 'center', gap: '4px' }}><MdVisibility size={14} /> Views</span>
                      <div style={{ marginTop: '4px', color: colors.text, fontWeight: 'bold', fontSize: '14px' }}>
                        {selectedReport.post.views || 0}
                      </div>
                    </div>
                    <div style={{
                      padding: '12px',
                      borderRadius: '10px',
                      backgroundColor: colors.secondary,
                      border: `1px solid ${colors.info}20`,
                      textAlign: 'center'
                    }}>
                      <span style={{ color: colors.textLight, display: 'flex', alignItems: 'center', gap: '4px' }}><MdComment size={14} /> Replies</span>
                      <div style={{ marginTop: '4px', color: colors.text, fontWeight: 'bold', fontSize: '14px' }}>
                        {selectedReport.post.repliesCount || 0}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    backgroundColor: colors.secondary,
                    border: `2px solid ${colors.info}20`,
                    borderLeft: `4px solid ${colors.info}`,
                    padding: '14px',
                    borderRadius: '10px',
                    maxHeight: '180px',
                    overflowY: 'auto',
                    fontSize: '13px'
                  }}>
                    <div style={{ color: colors.textLight, fontWeight: '600', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><MdArticle size={16} /> Description:</div>
                    <p style={{ margin: 0, color: colors.text, lineHeight: '1.6', fontStyle: 'italic' }}>
                      {selectedReport.post.content || selectedReport.post.description || 'No description available'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Admin Notes */}
              <div style={{ marginBottom: '24px', animation: 'slideIn 0.5s ease 0.3s both' }}>
                <label style={{ color: colors.text, fontWeight: '700', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <span>📝</span>
                  Admin Notes
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add your notes before taking action..."
                  style={{
                    width: '100%',
                    padding: '14px',
                    border: `2px solid ${colors.border}`,
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    minHeight: '100px',
                    fontColor: colors.text,
                    backgroundColor: colors.background,
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    color: colors.text
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = colors.primary;
                    e.currentTarget.style.boxShadow = `0 2px 12px ${colors.primary}20`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end',
                marginTop: '28px',
                flexWrap: 'wrap',
                animation: 'slideIn 0.5s ease 0.4s both'
              }}>
                <button
                  onClick={() => setSelectedReport(null)}
                  style={{
                    padding: '14px 28px',
                    backgroundColor: colors.textLight,
                    color: colors.secondary,
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.23, 1, 0.320, 1)',
                    boxShadow: '0 6px 20px rgba(127, 140, 141, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.text;
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = colors.textLight;
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(127, 140, 141, 0.3)';
                  }}
                >
                  <span>✕ Close</span>
                </button>

                {selectedReport.report.status !== 'reviewed' && (
                  <button
                    onClick={() => handleMarkReviewed(selectedReport._id)}
                    disabled={loading}
                    style={{
                      padding: '14px 28px',
                      backgroundImage: `linear-gradient(135deg, #3498db 0%, #2980b9 100%)`,
                      color: colors.secondary,
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.23, 1, 0.320, 1)',
                      boxShadow: '0 6px 20px rgba(52, 152, 219, 0.4)',
                      opacity: loading ? 0.6 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontStyle: 'normal'
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.currentTarget.style.transform = 'translateY(-3px)';
                        e.currentTarget.style.boxShadow = '0 10px 30px rgba(52, 152, 219, 0.6)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!loading) {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(52, 152, 219, 0.4)';
                      }
                    }}
                  >
                    <span><MdVisibility size={18} /></span>
                    <span>Mark Reviewed</span>
                  </button>
                )}

                {selectedReport.report.status !== 'dismissed' && selectedReport.report.status !== 'action-taken' && (
                  <button
                    onClick={() => handleDismissReport(selectedReport._id)}
                    disabled={loading}
                    style={{
                      padding: '14px 28px',
                      backgroundImage: `linear-gradient(135deg, #27AE60 0%, #229954 100%)`,
                      color: colors.secondary,
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.23, 1, 0.320, 1)',
                      boxShadow: '0 6px 20px rgba(39, 174, 96, 0.4)',
                      opacity: loading ? 0.6 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.currentTarget.style.transform = 'translateY(-3px)';
                        e.currentTarget.style.boxShadow = '0 10px 30px rgba(39, 174, 96, 0.6)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!loading) {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(39, 174, 96, 0.4)';
                      }
                    }}
                  >
                    <span><MdCheckCircle size={18} /></span>
                    <span>Dismiss Report</span>
                  </button>
                )}

                {selectedReport.report.status !== 'action-taken' && (
                  <button
                    onClick={() => handleDeletePost(selectedReport._id)}
                    disabled={loading}
                    style={{
                      padding: '14px 28px',
                      backgroundImage: `linear-gradient(135deg, #E74C3C 0%, #C0392B 100%)`,
                      color: colors.secondary,
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.23, 1, 0.320, 1)',
                      boxShadow: '0 6px 20px rgba(231, 76, 60, 0.4)',
                      opacity: loading ? 0.6 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.currentTarget.style.transform = 'translateY(-3px)';
                        e.currentTarget.style.boxShadow = '0 10px 30px rgba(231, 76, 60, 0.6)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!loading) {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(231, 76, 60, 0.4)';
                      }
                    }}
                  >
                    <span><MdDelete size={18} /></span>
                    <span>Delete Thread</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      </main>
      <div style={{ marginLeft: '280px' }}>
        <AdminFooter />
      </div>
    </div>
  );
};

export default PostReported;
