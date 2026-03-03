import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ReportsAdmin = () => {
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  // State management
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [bungaReports, setBungaReports] = useState(null);
  const [leafReports, setLeafReports] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination and filters
  const [bungaPage, setBungaPage] = useState(1);
  const [leafPage, setLeafPage] = useState(1);
  const [pageSize] = useState(10);
  const [bungaFilters, setBungaFilters] = useState({});
  const [leafFilters, setLeafFilters] = useState({});

  // Color scheme (green theme)
  const colors = {
    primary: '#27AE60',
    primaryLight: '#52BE80',
    secondary: '#FFFFFF',
    background: '#F0F9F4',
    backgroundHover: '#E8F6F0',
    text: '#1B4D3E',
    textLight: '#52866A',
    border: '#D5EFDB',
    accent: '#E67E22',
    danger: '#E74C3C',
    success: '#27AE60',
    warning: '#F39C12',
    info: '#3498DB'
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

  // Fetch dashboard data
  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/reports/dashboard`);
      if (response.data.success) {
        setDashboardData(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard data');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch bunga reports
  const fetchBungaReports = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      let url = `${API_BASE_URL}/api/v1/reports/bunga?page=${page}&limit=${pageSize}`;
      
      if (Object.keys(bungaFilters).length > 0) {
        Object.entries(bungaFilters).forEach(([key, value]) => {
          if (value) url += `&${key}=${value}`;
        });
      }

      const response = await axios.get(url);
      if (response.data.success) {
        setBungaReports(response.data);
        setBungaPage(page);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch bunga reports');
      console.error('Bunga reports fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch leaf reports
  const fetchLeafReports = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      let url = `${API_BASE_URL}/api/v1/reports/leaf?page=${page}&limit=${pageSize}`;
      
      if (Object.keys(leafFilters).length > 0) {
        Object.entries(leafFilters).forEach(([key, value]) => {
          if (value) url += `&${key}=${value}`;
        });
      }

      const response = await axios.get(url);
      if (response.data.success) {
        setLeafReports(response.data);
        setLeafPage(page);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch leaf reports');
      console.error('Leaf reports fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load data on tab change
  useEffect(() => {
    if (activeTab === 'dashboard' && !dashboardData) {
      fetchDashboard();
    } else if (activeTab === 'bunga' && !bungaReports) {
      fetchBungaReports(1);
    } else if (activeTab === 'leaf' && !leafReports) {
      fetchLeafReports(1);
    }
  }, [activeTab]);

  // ==================== DASHBOARD TAB ====================
  const DashboardTab = () => {
    if (!dashboardData) return <div className="text-center p-8">Loading...</div>;

    const { overview, bungaStatistics, latestBungaAnalyses, latestLeafAnalyses } = dashboardData;

    return (
      <div className="space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <StatCard title="Total Analyses" value={overview.totalAnalyses} icon="📊" color={colors.primary} />
          <StatCard title="Bunga Analyses" value={overview.totalBungaAnalyses} icon="🌶️" color={colors.accent} />
          <StatCard title="Leaf Analyses" value={overview.totalLeafAnalyses} icon="🍃" color={colors.info} />
          <StatCard title="Users" value={overview.totalUsers} icon="👥" color={colors.primaryLight} />
          <StatCard title="System Users" value={overview.systemUsers} icon="🔐" color={colors.warning} />
        </div>

        {/* Bunga Statistics */}
        <div style={{
          backgroundColor: colors.secondary,
          border: `1px solid ${colors.border}`,
          borderRadius: '8px',
          padding: '20px'
        }}>
          <h3 style={{ color: colors.text, fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>
            🌶️ Bunga Statistics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <StatItem label="Ripe" value={bungaStatistics.ripeness.Ripe} color={colors.success} />
            <StatItem label="Unripe" value={bungaStatistics.ripeness.Unripe} color={colors.warning} />
            <StatItem label="Rotten" value={bungaStatistics.ripeness.Rotten} color={colors.danger} />
          </div>
          <StatItem label="Average Confidence" value={`${bungaStatistics.averageConfidence}%`} color={colors.primary} />
        </div>

        {/* Latest Analyses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Latest Bunga */}
          <div style={{
            backgroundColor: colors.secondary,
            border: `1px solid ${colors.border}`,
            borderRadius: '8px',
            padding: '20px'
          }}>
            <h3 style={{ color: colors.text, fontSize: '16px', fontWeight: 'bold', marginBottom: '15px' }}>
              Recent Bunga Analyses
            </h3>
            <div className="space-y-2">
              {latestBungaAnalyses?.map((analysis) => (
                <div key={analysis._id} style={{
                  backgroundColor: colors.background,
                  padding: '10px',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}>
                  <div style={{ color: colors.text, fontWeight: 'bold' }}>{analysis.userName}</div>
                  <div style={{ color: colors.textLight }}>Ripeness: {analysis.ripeness}</div>
                  <div style={{ color: colors.textLight }}>Confidence: {analysis.confidence}%</div>
                  <div style={{ color: colors.textLight, fontSize: '12px' }}>
                    {new Date(analysis.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Latest Leaf */}
          <div style={{
            backgroundColor: colors.secondary,
            border: `1px solid ${colors.border}`,
            borderRadius: '8px',
            padding: '20px'
          }}>
            <h3 style={{ color: colors.text, fontSize: '16px', fontWeight: 'bold', marginBottom: '15px' }}>
              Recent Leaf Analyses
            </h3>
            <div className="space-y-2">
              {latestLeafAnalyses?.map((analysis) => (
                <div key={analysis._id} style={{
                  backgroundColor: colors.background,
                  padding: '10px',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}>
                  <div style={{ color: colors.text, fontWeight: 'bold' }}>{analysis.userName}</div>
                  <div style={{ color: colors.textLight }}>Disease: {analysis.disease}</div>
                  <div style={{ color: colors.textLight }}>Confidence: {analysis.confidence}%</div>
                  <div style={{ color: colors.textLight, fontSize: '12px' }}>
                    {new Date(analysis.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ==================== BUNGA REPORTS TAB ====================
  const BungaReportsTab = () => {
    if (!bungaReports) return <div className="text-center p-8">Loading...</div>;

    const { statistics, data, pagination } = bungaReports;

    return (
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div style={{
            backgroundColor: colors.secondary,
            border: `1px solid ${colors.border}`,
            borderRadius: '8px',
            padding: '20px'
          }}>
            <h3 style={{ color: colors.text, fontSize: '16px', fontWeight: 'bold', marginBottom: '15px' }}>
              📊 Ripeness Distribution
            </h3>
            <div className="space-y-2">
              <StatItem label="Ripe" value={`${statistics.ripeness.Ripe}% (${statistics.ripeness.counts.Ripe})`} color={colors.success} />
              <StatItem label="Unripe" value={`${statistics.ripeness.Unripe}% (${statistics.ripeness.counts.Unripe})`} color={colors.warning} />
              <StatItem label="Rotten" value={`${statistics.ripeness.Rotten}% (${statistics.ripeness.counts.Rotten})`} color={colors.danger} />
            </div>
          </div>

          <div style={{
            backgroundColor: colors.secondary,
            border: `1px solid ${colors.border}`,
            borderRadius: '8px',
            padding: '20px'
          }}>
            <h3 style={{ color: colors.text, fontSize: '16px', fontWeight: 'bold', marginBottom: '15px' }}>
              🏆 Market Grade Distribution
            </h3>
            <div className="space-y-2">
              <StatItem label="Premium" value={`${statistics.marketGrade.Premium}% (${statistics.marketGrade.counts.Premium})`} color={colors.success} />
              <StatItem label="Standard" value={`${statistics.marketGrade.Standard}% (${statistics.marketGrade.counts.Standard})`} color={colors.primary} />
              <StatItem label="Commercial" value={`${statistics.marketGrade.Commercial}% (${statistics.marketGrade.counts.Commercial})`} color={colors.info} />
              <StatItem label="Reject" value={`${statistics.marketGrade.Reject}% (${statistics.marketGrade.counts.Reject})`} color={colors.danger} />
            </div>
          </div>

          <div style={{
            backgroundColor: colors.secondary,
            border: `1px solid ${colors.border}`,
            borderRadius: '8px',
            padding: '20px'
          }}>
            <h3 style={{ color: colors.text, fontSize: '16px', fontWeight: 'bold', marginBottom: '15px' }}>
              💪 Health Class Distribution
            </h3>
            <div className="space-y-2">
              <StatItem label="Class A" value={`${statistics.healthClass.A}% (${statistics.healthClass.counts.a})`} color={colors.success} />
              <StatItem label="Class B" value={`${statistics.healthClass.B}% (${statistics.healthClass.counts.b})`} color={colors.primary} />
              <StatItem label="Class C" value={`${statistics.healthClass.C}% (${statistics.healthClass.counts.c})`} color={colors.info} />
              <StatItem label="Class D" value={`${statistics.healthClass.D}% (${statistics.healthClass.counts.d})`} color={colors.danger} />
            </div>
          </div>

          <div style={{
            backgroundColor: colors.secondary,
            border: `1px solid ${colors.border}`,
            borderRadius: '8px',
            padding: '20px'
          }}>
            <h3 style={{ color: colors.text, fontSize: '16px', fontWeight: 'bold', marginBottom: '15px' }}>
              🎯 Performance Metrics
            </h3>
            <div className="space-y-2">
              <StatItem label="Average Confidence" value={`${statistics.confidence.average}%`} color={colors.primary} />
              <StatItem label="Avg Processing Time" value={`${statistics.processingTime.average}s`} color={colors.info} />
              <StatItem label="Total Records" value={statistics.totalRecords} color={colors.text} />
            </div>
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          data={data}
          type="bunga"
          colors={colors}
          pagination={pagination}
          currentPage={bungaPage}
          onPageChange={fetchBungaReports}
        />
      </div>
    );
  };

  // ==================== LEAF REPORTS TAB ====================
  const LeafReportsTab = () => {
    if (!leafReports) return <div className="text-center p-8">Loading...</div>;

    const { statistics, data, pagination } = leafReports;

    return (
      <div className="space-y-6">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div style={{
            backgroundColor: colors.secondary,
            border: `1px solid ${colors.border}`,
            borderRadius: '8px',
            padding: '20px'
          }}>
            <h3 style={{ color: colors.text, fontSize: '16px', fontWeight: 'bold', marginBottom: '15px' }}>
              🍃 Disease Distribution
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {Object.entries(statistics.diseaseDistribution).map(([disease, stats]) => (
                <StatItem
                  key={disease}
                  label={disease}
                  value={`${stats.percentage}% (${stats.count})`}
                  color={colors.primary}
                />
              ))}
            </div>
          </div>

          <div style={{
            backgroundColor: colors.secondary,
            border: `1px solid ${colors.border}`,
            borderRadius: '8px',
            padding: '20px'
          }}>
            <h3 style={{ color: colors.text, fontSize: '16px', fontWeight: 'bold', marginBottom: '15px' }}>
              📊 Analysis Metrics
            </h3>
            <div className="space-y-2">
              <StatItem label="Most Common Disease" value={statistics.mostCommonDisease} color={colors.success} />
              <StatItem label="Average Confidence" value={`${statistics.confidence.average}%`} color={colors.primary} />
              <StatItem label="Total Detections" value={statistics.totalDetections} color={colors.info} />
              <StatItem label="Avg Detections/Analysis" value={statistics.averageDetectionsPerAnalysis} color={colors.accent} />
              <StatItem label="Avg Processing Time" value={`${statistics.processingTime.average}s`} color={colors.warning} />
              <StatItem label="Total Records" value={statistics.totalRecords} color={colors.text} />
            </div>
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          data={data}
          type="leaf"
          colors={colors}
          pagination={pagination}
          currentPage={leafPage}
          onPageChange={fetchLeafReports}
        />
      </div>
    );
  };

  return (
    <div style={{ backgroundColor: colors.background, minHeight: '100vh', padding: '20px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          backgroundColor: colors.primary,
          color: colors.secondary,
          padding: '30px',
          borderRadius: '12px',
          marginBottom: '30px'
        }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 10px 0' }}>
            📊 Reports & Analytics
          </h1>
          <p style={{ margin: 0, fontSize: '16px', opacity: 0.9 }}>
            Comprehensive analysis of all user data
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            backgroundColor: colors.danger,
            color: colors.secondary,
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            ❌ {error}
          </div>
        )}

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '30px',
          borderBottom: `2px solid ${colors.border}`
        }}>
          {['dashboard', 'bunga', 'leaf'].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setError(null);
              }}
              style={{
                padding: '15px 25px',
                backgroundColor: activeTab === tab ? colors.primary : 'transparent',
                color: activeTab === tab ? colors.secondary : colors.text,
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: activeTab === tab ? 'bold' : 'normal',
                borderBottom: activeTab === tab ? `3px solid ${colors.accent}` : 'none',
                transition: 'all 0.3s ease'
              }}
            >
              {tab === 'dashboard' && '📈 Dashboard'}
              {tab === 'bunga' && '🌶️ Bunga Analysis'}
              {tab === 'leaf' && '🍃 Leaf Analysis'}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ minHeight: '600px' }}>
          {loading && activeTab !== 'dashboard' ? (
            <div style={{ textAlign: 'center', padding: '50px', color: colors.textLight }}>
              ⏳ Loading...
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && <DashboardTab />}
              {activeTab === 'bunga' && <BungaReportsTab />}
              {activeTab === 'leaf' && <LeafReportsTab />}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ==================== HELPER COMPONENTS ====================

const StatCard = ({ title, value, icon, color }) => (
  <div style={{
    backgroundColor: '#FFFFFF',
    border: `2px solid ${color}`,
    borderRadius: '8px',
    padding: '20px',
    textAlign: 'center'
  }}>
    <div style={{ fontSize: '32px', marginBottom: '10px' }}>{icon}</div>
    <div style={{ color: '#888', fontSize: '12px', marginBottom: '5px' }}>{title}</div>
    <div style={{ color, fontSize: '24px', fontWeight: 'bold' }}>{value}</div>
  </div>
);

const StatItem = ({ label, value, color }) => (
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid #E0E0E0'
  }}>
    <span style={{ color: '#555', fontSize: '14px' }}>{label}</span>
    <span style={{ color, fontSize: '14px', fontWeight: 'bold' }}>{value}</span>
  </div>
);

const DataTable = ({ data, type, colors, pagination, currentPage, onPageChange }) => (
  <div style={{
    backgroundColor: colors.secondary,
    border: `1px solid ${colors.border}`,
    borderRadius: '8px',
    overflow: 'hidden'
  }}>
    {/* Table */}
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: colors.primaryLight, color: colors.secondary }}>
            <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>User</th>
            <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Image</th>
            {type === 'bunga' ? (
              <>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Ripeness</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Health Class</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Market Grade</th>
              </>
            ) : (
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Disease</th>
            )}
            <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Confidence</th>
            <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Processing Time</th>
            <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Date</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr
              key={item._id}
              style={{
                backgroundColor: index % 2 === 0 ? colors.background : colors.secondary,
                borderBottom: `1px solid ${colors.border}`
              }}
            >
              <td style={{ padding: '12px', color: colors.text }}>{item.userName}</td>
              <td style={{ padding: '12px' }}>
                <img
                  src={item.image?.url}
                  alt="analysis"
                  style={{ width: '50px', height: '50px', borderRadius: '4px', objectFit: 'cover' }}
                />
              </td>
              {type === 'bunga' ? (
                <>
                  <td style={{ padding: '12px', color: colors.text }}>{item.results.ripeness}</td>
                  <td style={{ padding: '12px', color: colors.text }}>
                    {item.results.health_class || 'N/A'}
                  </td>
                  <td style={{ padding: '12px', color: colors.text }}>
                    {item.results.market_grade}
                  </td>
                </>
              ) : (
                <td style={{ padding: '12px', color: colors.text }}>{item.results.disease}</td>
              )}
              <td style={{ padding: '12px', color: colors.primary, fontWeight: 'bold' }}>
                {item.results.confidence}%
              </td>
              <td style={{ padding: '12px', color: colors.text }}>{item.processingTime}</td>
              <td style={{ padding: '12px', fontSize: '12px', color: colors.textLight }}>
                {new Date(item.createdAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Pagination */}
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '15px 20px',
      backgroundColor: colors.background,
      borderTop: `1px solid ${colors.border}`
    }}>
      <div style={{ color: colors.text, fontSize: '14px' }}>
        Page {currentPage} of {pagination.totalPages} ({pagination.totalRecords} total)
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          style={{
            padding: '8px 15px',
            backgroundColor: currentPage === 1 ? '#CCC' : colors.primary,
            color: colors.secondary,
            border: 'none',
            borderRadius: '4px',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
          }}
        >
          ← Previous
        </button>
        <button
          onClick={() => onPageChange(Math.min(pagination.totalPages, currentPage + 1))}
          disabled={currentPage === pagination.totalPages}
          style={{
            padding: '8px 15px',
            backgroundColor: currentPage === pagination.totalPages ? '#CCC' : colors.primary,
            color: colors.secondary,
            border: 'none',
            borderRadius: '4px',
            cursor: currentPage === pagination.totalPages ? 'not-allowed' : 'pointer'
          }}
        >
          Next →
        </button>
      </div>
    </div>
  </div>
);

export default ReportsAdmin;
