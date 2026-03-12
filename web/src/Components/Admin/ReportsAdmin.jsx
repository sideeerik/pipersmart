import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell, LineChart, Line
} from 'recharts';
import { MdBarChart, MdTrendingUp, MdDownload, MdGroup, MdLock, MdAnalytics, MdClear, MdAccessTime, MdArticle, MdCheckCircle, MdEco } from 'react-icons/md';
import logoImage from './logowalangbg.png';
import AdminSidebar from './AdminSidebar';
import AdminFooter from './AdminFooter';
import ExportPdfModal from './ExportPdfModal';

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
  const defaultPageSize = 10;
  const [bungaPageSize, setBungaPageSize] = useState(defaultPageSize);
  const [leafPageSize, setLeafPageSize] = useState(defaultPageSize);
  const [bungaFilters, setBungaFilters] = useState({});
  const [leafFilters, setLeafFilters] = useState({});
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFiltersSuggestion, setExportFiltersSuggestion] = useState({});

  // Color scheme (green theme)
  const colors = {
    primary: '#27AE60',
    primaryLight: '#52BE80',
    secondary: '#a8d5ba',
    background: '#F0F9F4',
    backgroundHover: '#E8F6F0',
    text: '#000000',
    textLight: '#333333',
    border: '#2a8566',
    accent: '#FFD700',
    danger: '#FF6B6B',
    success: '#51CF66',
    warning: '#FFD43B',
    info: '#74C0FC'
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

  // Fetch peppercorns reports
  const fetchBungaReports = async (page = 1, limitOverride) => {
    setLoading(true);
    setError(null);
    try {
      const limitValue = limitOverride || bungaPageSize;
      let url = `${API_BASE_URL}/api/v1/reports/bunga?page=${page}&limit=${limitValue}`;
      
      if (Object.keys(bungaFilters).length > 0) {
        Object.entries(bungaFilters).forEach(([key, value]) => {
          if (value) url += `&${key}=${value}`;
        });
      }

      const response = await axios.get(url);
      if (response.data.success) {
        setBungaReports(response.data);
        setBungaPage(page);
        if (limitOverride) {
          setBungaPageSize(limitValue);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch peppercorns reports');
      console.error('Peppercorns reports fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch leaf reports
  const fetchLeafReports = async (page = 1, limitOverride) => {
    setLoading(true);
    setError(null);
    try {
      const limitValue = limitOverride || leafPageSize;
      let url = `${API_BASE_URL}/api/v1/reports/leaf?page=${page}&limit=${limitValue}`;
      
      if (Object.keys(leafFilters).length > 0) {
        Object.entries(leafFilters).forEach(([key, value]) => {
          if (value) url += `&${key}=${value}`;
        });
      }

      const response = await axios.get(url);
      if (response.data.success) {
        setLeafReports(response.data);
        setLeafPage(page);
        if (limitOverride) {
          setLeafPageSize(limitValue);
        }
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
    } else if (activeTab === 'charts') {
      // Charts tab always needs data - load both if not available
      if (!bungaReports) fetchBungaReports(1);
      if (!leafReports) fetchLeafReports(1);
    }
  }, [activeTab]);

  // Update export filters when active tab changes
  useEffect(() => {
    if (activeTab === 'bunga') {
      setExportFiltersSuggestion(bungaFilters);
    } else if (activeTab === 'leaf') {
      setExportFiltersSuggestion(leafFilters);
    } else {
      setExportFiltersSuggestion({});
    }
  }, [activeTab, bungaFilters, leafFilters]);

  // ==================== DASHBOARD TAB ====================
  const DashboardTab = () => {
    if (!dashboardData) return <div className="text-center p-12" style={{color: colors.textLight}}>⏳ Loading dashboard...</div>;

    const { overview, bungaStatistics, latestBungaAnalyses, latestLeafAnalyses } = dashboardData;
    
    // Ensure confidence is a valid number
    const avgConfidence = parseFloat(bungaStatistics.averageConfidence) || 0;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3in' }}>
        {/* Overview Cards */}
        <div style={{
          backgroundColor: '#ffffff',
          border: `1px solid ${colors.border}`,
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 10px 24px rgba(15, 23, 42, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: colors.textLight, marginBottom: '6px' }}>Overview</div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: colors.text }}>Admin Summary</div>
              <div style={{ fontSize: '13px', color: colors.textLight }}>Snapshot of platform totals and activity.</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '0.3in' }}>
            <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '16px', boxShadow: '0 10px 20px rgba(15, 23, 42, 0.08)', border: `1px solid ${colors.border}` }}>
              <div style={{ fontSize: '11px', color: colors.textLight, marginBottom: '6px' }}>Total Analyses</div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: colors.text }}>{overview.totalAnalyses}</div>
              <div style={{ fontSize: '11px', color: colors.textLight }}>All activity</div>
            </div>
            <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '16px', boxShadow: '0 10px 20px rgba(15, 23, 42, 0.08)', border: `1px solid ${colors.border}` }}>
              <div style={{ fontSize: '11px', color: colors.textLight, marginBottom: '6px' }}>Peppercorns Analyses</div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: colors.text }}>{overview.totalBungaAnalyses}</div>
              <div style={{ fontSize: '11px', color: colors.textLight }}>Peppercorns only</div>
            </div>
            <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '16px', boxShadow: '0 10px 20px rgba(15, 23, 42, 0.08)', border: `1px solid ${colors.border}` }}>
              <div style={{ fontSize: '11px', color: colors.textLight, marginBottom: '6px' }}>Leaf Analyses</div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: colors.text }}>{overview.totalLeafAnalyses}</div>
              <div style={{ fontSize: '11px', color: colors.textLight }}>Leaf only</div>
            </div>
            <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '16px', boxShadow: '0 10px 20px rgba(15, 23, 42, 0.08)', border: `1px solid ${colors.border}` }}>
              <div style={{ fontSize: '11px', color: colors.textLight, marginBottom: '6px' }}>Users</div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: colors.text }}>{overview.totalUsers}</div>
              <div style={{ fontSize: '11px', color: colors.textLight }}>Registered</div>
            </div>
            <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '16px', boxShadow: '0 10px 20px rgba(15, 23, 42, 0.08)', border: `1px solid ${colors.border}` }}>
              <div style={{ fontSize: '11px', color: colors.textLight, marginBottom: '6px' }}>System Users</div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: colors.text }}>{overview.systemUsers}</div>
              <div style={{ fontSize: '11px', color: colors.textLight }}>Admins & staff</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '0.3in' }}>
          {/* Recent Activity */}
          <div style={{
            backgroundColor: '#ffffff',
            border: `1px solid ${colors.border}`,
            borderRadius: '16px',
            padding: '22px',
            backgroundImage: 'linear-gradient(180deg, #ffffff 0%, #f6fbf8 100%)',
            boxShadow: '0 14px 28px rgba(15, 23, 42, 0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ fontWeight: '700', color: colors.text, letterSpacing: '0.2px' }}>Recent Activity</div>
              <MdAccessTime size={18} color={colors.textLight} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px' }}>
              <div style={{
                backgroundColor: '#f0fbf4',
                border: `2px solid ${colors.accent}`,
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 4px 12px rgba(230, 126, 34, 0.1)',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '999px',
                      backgroundColor: '#ffffff',
                      border: `1px solid ${colors.accent}`,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <img src={logoImage} alt="peppercorns" style={{ height: '16px', objectFit: 'contain' }} />
                    </span>
                    <span style={{ color: colors.text, fontSize: '13px', fontWeight: '700' }}>Recent Peppercorns Analyses</span>
                  </div>
                  <span style={{
                    fontSize: '11px',
                    color: colors.textLight,
                    backgroundColor: '#ffffff',
                    border: `1px solid ${colors.accent}`,
                    padding: '2px 8px',
                    borderRadius: '999px'
                  }}>
                    Latest
                  </span>
                </div>
                <div className="space-y-3" style={{ width: '100%' }}>
                  {latestBungaAnalyses?.map((analysis) => (
                    <div key={analysis._id} style={{
                      backgroundColor: '#ffffff',
                      padding: '12px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      border: `1px solid rgba(230, 126, 34, 0.2)`,
                      borderLeft: `4px solid ${colors.accent}`
                    }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px', alignItems: 'center' }}>
                        <div>
                          <div style={{ color: colors.text, fontWeight: 'bold', marginBottom: '4px' }}>{analysis.userName}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: colors.textLight, fontSize: '12px' }}>
                            <MdAnalytics size={12} color={colors.accent} />
                            <span>{analysis.ripeness}</span>
                          </div>
                          <div style={{ color: colors.textLight, fontSize: '10px', marginTop: '6px' }}>
                            {new Date(analysis.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <div style={{
                          color: colors.primary,
                          fontWeight: '700',
                          fontSize: '13px',
                          backgroundColor: colors.background,
                          padding: '6px 10px',
                          borderRadius: '999px',
                          border: `1px solid rgba(39, 174, 96, 0.2)`
                        }}>
                          {analysis.confidence}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{
                backgroundColor: '#eff8ff',
                border: `2px solid ${colors.info}`,
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 4px 12px rgba(52, 152, 219, 0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '999px',
                      backgroundColor: '#ffffff',
                      border: `1px solid ${colors.info}`,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <MdEco size={16} color={colors.primary} />
                    </span>
                    <span style={{ color: colors.text, fontSize: '13px', fontWeight: '700' }}>Recent Leaf Analyses</span>
                  </div>
                  <span style={{
                    fontSize: '11px',
                    color: colors.textLight,
                    backgroundColor: '#ffffff',
                    border: `1px solid ${colors.info}`,
                    padding: '2px 8px',
                    borderRadius: '999px'
                  }}>
                    Latest
                  </span>
                </div>
                <div className="space-y-3">
                  {latestLeafAnalyses?.map((analysis) => (
                    <div key={analysis._id} style={{
                      backgroundColor: '#ffffff',
                      padding: '12px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      border: `1px solid rgba(52, 152, 219, 0.2)`,
                      borderLeft: `4px solid ${colors.info}`
                    }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px', alignItems: 'center' }}>
                        <div>
                          <div style={{ color: colors.text, fontWeight: 'bold', marginBottom: '4px' }}>{analysis.userName}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: colors.textLight, fontSize: '12px' }}>
                            <MdEco size={12} color={colors.primary} />
                            <span>{analysis.disease}</span>
                          </div>
                          <div style={{ color: colors.textLight, fontSize: '10px', marginTop: '6px' }}>
                            {new Date(analysis.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <div style={{
                          color: colors.primary,
                          fontWeight: '700',
                          fontSize: '13px',
                          backgroundColor: colors.background,
                          padding: '6px 10px',
                          borderRadius: '999px',
                          border: `1px solid rgba(39, 174, 96, 0.2)`
                        }}>
                          {analysis.confidence}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ==================== BUNGA REPORTS TAB ====================
  const BungaReportsTab = () => {
    if (!bungaReports) return <div className="text-center p-12" style={{color: colors.textLight}}>⏳ Loading peppercorns reports...</div>;

    const { statistics, data, pagination } = bungaReports;
    const ripenessData = [
      { name: 'Ripe', value: parseFloat(statistics?.ripeness?.Ripe) || 0 },
      { name: 'Unripe', value: parseFloat(statistics?.ripeness?.Unripe) || 0 },
      { name: 'Rotten', value: parseFloat(statistics?.ripeness?.Rotten) || 0 }
    ].filter(item => item.value > 0);
    const marketGradeData = [
      { name: 'Premium', value: Number(statistics?.marketGrade?.counts?.Premium) || 0 },
      { name: 'Standard', value: Number(statistics?.marketGrade?.counts?.Standard) || 0 },
      { name: 'Commercial', value: Number(statistics?.marketGrade?.counts?.Commercial) || 0 },
      { name: 'Reject', value: Number(statistics?.marketGrade?.counts?.Reject) || 0 }
    ];
    const healthClassData = [
      { name: 'Class A', value: Number(statistics?.healthClass?.counts?.a) || 0 },
      { name: 'Class B', value: Number(statistics?.healthClass?.counts?.b) || 0 },
      { name: 'Class C', value: Number(statistics?.healthClass?.counts?.c) || 0 },
      { name: 'Class D', value: Number(statistics?.healthClass?.counts?.d) || 0 }
    ];
    const fallbackRipenessCounts = { A: 0, B: 0, C: 0, D: 0 };
    (data || []).forEach((item) => {
      const pct = Number(item?.results?.ripeness_percentage);
      if (!Number.isFinite(pct)) return;
      if (pct >= 76) fallbackRipenessCounts.A += 1;
      else if (pct >= 51) fallbackRipenessCounts.B += 1;
      else if (pct >= 26) fallbackRipenessCounts.C += 1;
      else if (pct >= 0) fallbackRipenessCounts.D += 1;
    });
    const ripenessClassCounts = statistics?.ripenessClass?.counts || fallbackRipenessCounts;
    const ripenessClassData = ['A', 'B', 'C', 'D'].map((letter) => ({
      name: letter.toLowerCase(),
      value: Number(ripenessClassCounts?.[letter]) || 0
    }));
    const chartCardStyle = {
      backgroundColor: '#ffffff',
      backgroundImage: 'linear-gradient(180deg, #ffffff 0%, #f5faf7 100%)',
      border: '1px solid rgba(42, 133, 102, 0.2)',
      borderRadius: '18px',
      padding: '20px',
      boxShadow: '0 14px 28px rgba(15, 23, 42, 0.08)',
      minHeight: '360px',
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      minWidth: 0
    };
    const chartHeaderStyle = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '12px',
      gap: '12px'
    };
    const chartTitleStyle = {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontWeight: 700,
      color: colors.text,
      fontSize: '16px'
    };
    const chartBadgeStyle = {
      fontSize: '11px',
      color: colors.textLight,
      backgroundColor: '#ffffff',
      padding: '4px 10px',
      borderRadius: '999px',
      border: '1px solid rgba(42, 133, 102, 0.2)',
      whiteSpace: 'nowrap',
      boxShadow: '0 6px 12px rgba(15, 23, 42, 0.08)'
    };
    const chartBodyStyle = {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3in' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '0.3in' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '16px', boxShadow: '0 10px 20px rgba(15, 23, 42, 0.08)', border: `1px solid ${colors.border}` }}>
            <div style={{ fontSize: '11px', color: colors.textLight, marginBottom: '6px' }}>Total Records</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: colors.text }}>{pagination.totalRecords}</div>
            <div style={{ fontSize: '11px', color: colors.textLight }}>All time</div>
          </div>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '16px', boxShadow: '0 10px 20px rgba(15, 23, 42, 0.08)', border: `1px solid ${colors.border}` }}>
            <div style={{ fontSize: '11px', color: colors.textLight, marginBottom: '6px' }}>Avg Processing</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: colors.text }}>{statistics.processingTime.average}s</div>
            <div style={{ fontSize: '11px', color: colors.textLight }}>Per analysis</div>
          </div>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '16px', boxShadow: '0 10px 20px rgba(15, 23, 42, 0.08)', border: `1px solid ${colors.border}` }}>
            <div style={{ fontSize: '11px', color: colors.textLight, marginBottom: '6px' }}>Avg Confidence</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: colors.text }}>{statistics.confidence.average}%</div>
            <div style={{ fontSize: '11px', color: colors.textLight }}>Quality index</div>
          </div>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '16px', boxShadow: '0 10px 20px rgba(15, 23, 42, 0.08)', border: `1px solid ${colors.border}` }}>
            <div style={{ fontSize: '11px', color: colors.textLight, marginBottom: '6px' }}>Total Confidence</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: colors.text }}>{statistics.confidence.total}</div>
            <div style={{ fontSize: '11px', color: colors.textLight }}>Aggregate</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.3in' }}>
          <div style={{ ...chartCardStyle, borderTop: '3px solid #F39C12' }}>
            <div style={chartHeaderStyle}>
              <div style={chartTitleStyle}>
                <img src={logoImage} alt="peppercorns" style={{ height: '20px', objectFit: 'contain' }} />
                Peppercorns Ripeness
              </div>
              <div style={chartBadgeStyle}>Distribution</div>
            </div>
            <div style={chartBodyStyle}>
              {ripenessData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={ripenessData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => name + ': ' + value.toFixed(1) + '%'}
                      outerRadius={80}
                      innerRadius={40}
                      dataKey="value"
                    >
                      {ripenessData.map((entry, index) => (
                        <Cell key={'cell-' + index} fill={['#27AE60', '#F39C12', '#E74C3C'][index % 3]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => value.toFixed(1) + '%'} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.textLight }}>No data available</div>
              )}
            </div>
          </div>

          <div style={{ ...chartCardStyle, borderTop: '3px solid #E67E22' }}>
            <div style={chartHeaderStyle}>
              <div style={chartTitleStyle}>Market Grade</div>
              <div style={chartBadgeStyle}>Peppercorns quality</div>
            </div>
            <div style={chartBodyStyle}>
              {marketGradeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={marketGradeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                    <XAxis dataKey="name" stroke={colors.text} interval={0} />
                    <YAxis stroke={colors.text} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: `1px solid ${colors.border}` }} />
                    <Bar dataKey="value" fill={colors.accent} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.textLight }}>No data available</div>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.3in', alignItems: 'stretch' }}>
          <div style={{ ...chartCardStyle, borderTop: '3px solid #27AE60' }}>
            <div style={chartHeaderStyle}>
              <div style={chartTitleStyle}>Health Class</div>
              <div style={chartBadgeStyle}>Peppercorns health</div>
            </div>
            <div style={chartBodyStyle}>
              {healthClassData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={healthClassData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                    <XAxis dataKey="name" stroke={colors.text} />
                    <YAxis stroke={colors.text} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: `1px solid ${colors.border}` }} />
                    <Bar dataKey="value" fill={colors.primary} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.textLight }}>No data available</div>
              )}
            </div>
          </div>

          <div style={{ ...chartCardStyle, borderTop: '3px solid #2D6A4F' }}>
            <div style={chartHeaderStyle}>
              <div style={chartTitleStyle}>Ripeness Class</div>
              <div style={chartBadgeStyle}>a-d</div>
            </div>
            <div style={chartBodyStyle}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ripenessClassData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                  <XAxis dataKey="name" stroke={colors.text} />
                  <YAxis stroke={colors.text} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: `1px solid ${colors.border}` }} />
                  <Bar dataKey="value" fill="#2D6A4F" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: colors.secondary, border: `2px solid ${colors.border}`, borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 24px rgba(0,0,0,0.08)' }}>
          <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', backgroundColor: colors.background }}>
            <div style={{ fontWeight: '700', color: colors.text }}>Peppercorns Analysis Records</div>
            <div style={{ fontSize: '12px', color: colors.textLight }}>Page {bungaPage} of {pagination.totalPages}</div>
          </div>
          <DataTable
            data={data}
            type="bunga"
            colors={colors}
            pagination={pagination}
            currentPage={bungaPage}
            onPageChange={fetchBungaReports}
            onShowAll={() => fetchBungaReports(1, pagination.totalRecords)}
            onShowDefault={() => fetchBungaReports(1, defaultPageSize)}
            isAll={bungaPageSize >= pagination.totalRecords}
            defaultPageSize={defaultPageSize}
          />
        </div>
      </div>
    );
  };

  // ==================== LEAF REPORTS TAB ====================
  const LeafReportsTab = () => {
    if (!leafReports) return <div className="text-center p-12" style={{color: colors.textLight}}>⏳ Loading leaf reports...</div>;

    const { statistics, data, pagination } = leafReports;
    const diseaseOrder = ['Pollu_Disease', 'Footrot', 'Healthy', 'Slow Decline'];
    const normalizeDisease = (value) => String(value || '')
      .toLowerCase()
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const toTitleCase = (value) => value
      .split(' ')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
    const canonicalMap = {
      'pollu disease': 'Pollu_Disease',
      'footrot': 'Footrot',
      'healthy': 'Healthy',
      'slow decline': 'Slow Decline',
      'leaf blight': 'Leaf Blight',
      'yellow mottle virus': 'Yellow Mottle Virus'
    };
    const aggregated = Object.entries(statistics?.diseaseDistribution || {}).reduce((acc, [name, stats]) => {
      const normalized = normalizeDisease(name);
      const displayName = canonicalMap[normalized] || toTitleCase(normalized);
      if (!acc[displayName]) acc[displayName] = { count: 0 };
      acc[displayName].count += Number(stats?.count) || 0;
      return acc;
    }, {});
    const totalCounts = Object.values(aggregated).reduce((sum, item) => sum + (Number(item.count) || 0), 0);
    const orderedDiseases = diseaseOrder.map((name) => {
      const stats = aggregated[name] || { count: 0 };
      return {
        name,
        count: stats.count,
        percentage: totalCounts > 0 ? ((stats.count / totalCounts) * 100).toFixed(2) : 0
      };
    });
    const extraDiseases = Object.keys(aggregated)
      .filter((name) => !diseaseOrder.includes(name))
      .map((name) => ({
        name,
        count: aggregated[name].count,
        percentage: totalCounts > 0 ? ((aggregated[name].count / totalCounts) * 100).toFixed(2) : 0
      }))
      .sort((a, b) => b.count - a.count);
    const diseaseList = [...orderedDiseases, ...extraDiseases];
    const mostCommonDisease = diseaseList.reduce((max, item) => (item.count > max.count ? item : max), { name: 'None', count: 0 }).name;
    const chartDiseaseData = diseaseList
      .filter((item) => Number(item.count) > 0)
      .map((item) => ({
        name: item.name,
        value: Number(item.percentage) || 0
      }));
    const chartColors = ['#27AE60', '#F39C12', '#E74C3C', '#3498DB', '#9B59B6', '#1ABC9C', '#E67E22', '#16A085'];
    const chartCardStyle = {
      backgroundColor: '#ffffff',
      backgroundImage: 'linear-gradient(180deg, #ffffff 0%, #f5faf7 100%)',
      border: '1px solid rgba(42, 133, 102, 0.2)',
      borderRadius: '18px',
      padding: '20px',
      boxShadow: '0 14px 28px rgba(15, 23, 42, 0.08)',
      minHeight: '360px',
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      minWidth: 0
    };
    const chartHeaderStyle = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '12px',
      gap: '12px'
    };
    const chartTitleStyle = {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontWeight: 700,
      color: colors.text,
      fontSize: '16px'
    };
    const chartBadgeStyle = {
      fontSize: '11px',
      color: colors.textLight,
      backgroundColor: '#ffffff',
      padding: '4px 10px',
      borderRadius: '999px',
      border: '1px solid rgba(42, 133, 102, 0.2)',
      whiteSpace: 'nowrap',
      boxShadow: '0 6px 12px rgba(15, 23, 42, 0.08)'
    };
    const chartBodyStyle = {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3in' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '0.3in' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '16px', boxShadow: '0 10px 20px rgba(15, 23, 42, 0.08)', border: `1px solid ${colors.border}` }}>
            <div style={{ fontSize: '11px', color: colors.textLight, marginBottom: '6px' }}>Total Records</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: colors.text }}>{statistics.totalRecords}</div>
            <div style={{ fontSize: '11px', color: colors.textLight }}>All time</div>
          </div>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '16px', boxShadow: '0 10px 20px rgba(15, 23, 42, 0.08)', border: `1px solid ${colors.border}` }}>
            <div style={{ fontSize: '11px', color: colors.textLight, marginBottom: '6px' }}>Avg Confidence</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: colors.text }}>{statistics.confidence.average}%</div>
            <div style={{ fontSize: '11px', color: colors.textLight }}>Detection quality</div>
          </div>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '16px', boxShadow: '0 10px 20px rgba(15, 23, 42, 0.08)', border: `1px solid ${colors.border}` }}>
            <div style={{ fontSize: '11px', color: colors.textLight, marginBottom: '6px' }}>Avg Processing</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: colors.text }}>{statistics.processingTime.average}s</div>
            <div style={{ fontSize: '11px', color: colors.textLight }}>Per analysis</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '0.3in', alignItems: 'stretch' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px', border: `1px solid ${colors.border}`, boxShadow: '0 12px 24px rgba(15, 23, 42, 0.08)', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ fontWeight: '700', color: colors.text, fontSize: '16px' }}>Disease Distribution</div>
              <div style={{ fontSize: '12px', color: colors.textLight }}>Most common: {mostCommonDisease}</div>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
            {diseaseList.map((item) => (
              <StatItem
                key={item.name}
                label={`Disease: ${item.name}`}
                value={`${item.percentage}% (${item.count})`}
                color={colors.primary}
              />
            ))}
            </div>
          </div>

          <div style={{ ...chartCardStyle, borderTop: '3px solid #8B6F47' }}>
            <div style={chartHeaderStyle}>
              <div style={chartTitleStyle}>Leaf Disease Distribution</div>
              <div style={chartBadgeStyle}>Leaf analyses</div>
            </div>
            <div style={chartBodyStyle}>
              {chartDiseaseData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartDiseaseData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => name + ': ' + value.toFixed(1) + '%'}
                      outerRadius={90}
                      innerRadius={50}
                      dataKey="value"
                    >
                      {chartDiseaseData.map((entry, index) => (
                        <Cell key={'cell-' + index} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => value.toFixed(1) + '%'} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.textLight }}>No data available</div>
              )}
            </div>
          </div>
        </div>

        <div>
          <div style={{ backgroundColor: colors.secondary, border: `2px solid ${colors.border}`, borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 24px rgba(0,0,0,0.08)' }}>
            <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', backgroundColor: colors.background }}>
              <div style={{ fontWeight: '700', color: colors.text }}>Leaf Analysis Records</div>
              <div style={{ fontSize: '12px', color: colors.textLight }}>Page {leafPage} of {pagination.totalPages}</div>
            </div>
          <DataTable
            data={data}
            type="leaf"
            colors={colors}
            pagination={pagination}
            currentPage={leafPage}
            onPageChange={fetchLeafReports}
            onShowAll={() => fetchLeafReports(1, pagination.totalRecords)}
            onShowDefault={() => fetchLeafReports(1, defaultPageSize)}
            isAll={leafPageSize >= pagination.totalRecords}
            defaultPageSize={defaultPageSize}
          />
          </div>
        </div>
      </div>
    );
  };
  // ==================== CHARTS TAB ====================
  const ChartsTab = () => {
    const [chartData, setChartData] = useState({
      bungaRipeness: [],
      bungaMarketGrade: [],
      bungaHealthClass: [],
      bungaRipenessClass: [],
      leafDisease: [],
      bungaConfidence: [],
      leafConfidence: [],
      weeklyActivity: [],
      analysisDistribution: [],
      userGrowth: []
    });
    const [selectedMonth, setSelectedMonth] = useState('all');

    useEffect(() => {
      const bungaStats = bungaReports?.statistics || {};
      const bungaData = bungaReports?.data || [];
      const hasAny = (obj) => Object.values(obj || {}).some((value) => Number(value) > 0);
      const normalizeMarketGradeCounts = (counts = {}) => {
        const normalized = { Premium: 0, Standard: 0, Commercial: 0, Reject: 0 };
        Object.entries(counts).forEach(([key, value]) => {
          const label = String(key || '').toLowerCase();
          const amount = Number(value) || 0;
          if (label.includes('premium')) normalized.Premium += amount;
          else if (label.includes('standard')) normalized.Standard += amount;
          else if (label.includes('commercial')) normalized.Commercial += amount;
          else if (label.includes('reject')) normalized.Reject += amount;
        });
        return normalized;
      };
      const normalizeLetterCounts = (counts = {}) => {
        const normalized = { A: 0, B: 0, C: 0, D: 0 };
        Object.entries(counts).forEach(([key, value]) => {
          const label = String(key || '').toLowerCase().replace(/[^a-d]/g, ' ').trim();
          const match = label.match(/\b(a|b|c|d)\b/);
          const amount = Number(value) || 0;
          if (!match) return;
          const letter = match[1].toUpperCase();
          normalized[letter] += amount;
        });
        return normalized;
      };

      const fallbackMarketGradeCounts = {
        Premium: 0,
        Standard: 0,
        Commercial: 0,
        Reject: 0
      };
      const fallbackHealthCounts = { a: 0, b: 0, c: 0, d: 0 };
      const fallbackRipenessCounts = { A: 0, B: 0, C: 0, D: 0 };

      bungaData.forEach((item) => {
        const grade = String(item?.results?.market_grade || '').toLowerCase();
        if (grade.includes('premium')) fallbackMarketGradeCounts.Premium += 1;
        else if (grade.includes('standard')) fallbackMarketGradeCounts.Standard += 1;
        else if (grade.includes('commercial')) fallbackMarketGradeCounts.Commercial += 1;
        else if (grade.includes('reject')) fallbackMarketGradeCounts.Reject += 1;

        const health = String(item?.results?.health_class || '').toLowerCase();
        if (health === 'a') fallbackHealthCounts.a += 1;
        else if (health === 'b') fallbackHealthCounts.b += 1;
        else if (health === 'c') fallbackHealthCounts.c += 1;
        else if (health === 'd') fallbackHealthCounts.d += 1;

        const pct = Number(item?.results?.ripeness_percentage);
        if (Number.isFinite(pct)) {
          if (pct >= 76) fallbackRipenessCounts.A += 1;
          else if (pct >= 51) fallbackRipenessCounts.B += 1;
          else if (pct >= 26) fallbackRipenessCounts.C += 1;
          else if (pct >= 0) fallbackRipenessCounts.D += 1;
        }
      });

      const normalizedMarketGradeCounts = normalizeMarketGradeCounts(bungaStats?.marketGrade?.counts || {});
      const normalizedHealthCounts = normalizeLetterCounts(bungaStats?.healthClass?.counts || {});
      const normalizedRipenessCounts = normalizeLetterCounts(bungaStats?.ripenessClass?.counts || {});
      const normalizeLeafDisease = (value) => String(value || '')
        .toLowerCase()
        .replace(/[_-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/\b\w/g, (m) => m.toUpperCase());

      // Build pie chart data for Bunga Ripeness
      if (bungaStats?.ripeness) {
        const ripData = [
          { name: 'Ripe', value: parseFloat(bungaStats.ripeness.Ripe) || 0 },
          { name: 'Unripe', value: parseFloat(bungaStats.ripeness.Unripe) || 0 },
          { name: 'Rotten', value: parseFloat(bungaStats.ripeness.Rotten) || 0 }
        ].filter(item => item.value > 0);
        setChartData(prev => ({ ...prev, bungaRipeness: ripData }));
      }

      // Build bar chart data for Market Grade (counts)
      if (bungaStats?.marketGrade) {
        const selectedCounts = hasAny(normalizedMarketGradeCounts)
          ? normalizedMarketGradeCounts
          : hasAny(fallbackMarketGradeCounts)
            ? fallbackMarketGradeCounts
            : null;
        const gradeData = [
          { name: 'Premium', value: selectedCounts ? Number(selectedCounts.Premium) || 0 : parseFloat(bungaStats.marketGrade.Premium) || 0 },
          { name: 'Standard', value: selectedCounts ? Number(selectedCounts.Standard) || 0 : parseFloat(bungaStats.marketGrade.Standard) || 0 },
          { name: 'Commercial', value: selectedCounts ? Number(selectedCounts.Commercial) || 0 : parseFloat(bungaStats.marketGrade.Commercial) || 0 },
          { name: 'Reject', value: selectedCounts ? Number(selectedCounts.Reject) || 0 : parseFloat(bungaStats.marketGrade.Reject) || 0 }
        ];
        setChartData(prev => ({ ...prev, bungaMarketGrade: gradeData }));
      }

      // Build bar chart data for Health Class (counts)
      if (bungaStats?.healthClass) {
        const selectedCounts = hasAny(normalizedHealthCounts)
          ? normalizedHealthCounts
          : hasAny(fallbackHealthCounts)
            ? fallbackHealthCounts
            : null;
        const healthData = [
          { name: 'Class A', value: selectedCounts ? Number(selectedCounts.A) || 0 : parseFloat(bungaStats.healthClass.A) || 0 },
          { name: 'Class B', value: selectedCounts ? Number(selectedCounts.B) || 0 : parseFloat(bungaStats.healthClass.B) || 0 },
          { name: 'Class C', value: selectedCounts ? Number(selectedCounts.C) || 0 : parseFloat(bungaStats.healthClass.C) || 0 },
          { name: 'Class D', value: selectedCounts ? Number(selectedCounts.D) || 0 : parseFloat(bungaStats.healthClass.D) || 0 }
        ];
        setChartData(prev => ({ ...prev, bungaHealthClass: healthData }));
      }

      // Build bar chart data for Ripeness Class (counts)
      if (bungaStats?.ripenessClass) {
        const selectedCounts = hasAny(normalizedRipenessCounts)
          ? normalizedRipenessCounts
          : hasAny(fallbackRipenessCounts)
            ? fallbackRipenessCounts
            : null;
        const ripenessClassData = [
          { name: 'a', value: selectedCounts ? Number(selectedCounts.A) || 0 : parseFloat(bungaStats.ripenessClass.A) || 0 },
          { name: 'b', value: selectedCounts ? Number(selectedCounts.B) || 0 : parseFloat(bungaStats.ripenessClass.B) || 0 },
          { name: 'c', value: selectedCounts ? Number(selectedCounts.C) || 0 : parseFloat(bungaStats.ripenessClass.C) || 0 },
          { name: 'd', value: selectedCounts ? Number(selectedCounts.D) || 0 : parseFloat(bungaStats.ripenessClass.D) || 0 }
        ];
        setChartData(prev => ({ ...prev, bungaRipenessClass: ripenessClassData }));
      }

      // Build pie chart data for Leaf Disease
      if (leafReports?.statistics?.diseaseDistribution) {
        const distribution = leafReports.statistics.diseaseDistribution || {};
        const entries = Object.entries(distribution).map(([disease, stats]) => ({
          disease,
          count: Number(stats?.count ?? stats?.value ?? stats) || 0,
          percentage: Number(stats?.percentage) || 0
        }));
        const hasPercentages = entries.some((item) => Number(item.percentage) > 0);
        const total = entries.reduce((sum, item) => sum + (Number(item.count) || 0), 0);
        const diseaseData = entries
          .map((item) => ({
            name: normalizeLeafDisease(item.disease),
            value: hasPercentages ? (Number(item.percentage) || 0) : total > 0 ? ((Number(item.count) || 0) / total) * 100 : 0
          }))
          .filter((item) => item.value > 0);
        setChartData(prev => ({ ...prev, leafDisease: diseaseData }));
      } else if (leafReports?.data?.length) {
        const diseaseCounts = {};
        leafReports.data.forEach((item) => {
          const label = normalizeLeafDisease(item?.results?.disease || '');
          if (!label) return;
          diseaseCounts[label] = (diseaseCounts[label] || 0) + 1;
        });
        const total = Object.values(diseaseCounts).reduce((sum, value) => sum + value, 0);
        const diseaseData = Object.entries(diseaseCounts)
          .map(([name, count]) => ({
            name,
            value: total > 0 ? (count / total) * 100 : 0
          }))
          .filter((item) => item.value > 0);
        setChartData(prev => ({ ...prev, leafDisease: diseaseData }));
      }

      // Fetch weekly activity data
      const fetchWeeklyActivity = async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/api/v1/dashboard/weekly-activity`);
          if (response.data.success) {
            setChartData(prev => ({ ...prev, weeklyActivity: response.data.data }));
          }
        } catch (err) {
          console.error('Error fetching weekly activity:', err);
        }
      };

      // Fetch analysis distribution data
      const fetchAnalysisDistribution = async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/api/v1/dashboard/analysis-distribution`);
          if (response.data.success) {
            setChartData(prev => ({ ...prev, analysisDistribution: response.data.data }));
          }
        } catch (err) {
          console.error('Error fetching analysis distribution:', err);
        }
      };

      // Fetch user growth data
      const fetchUserGrowth = async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/api/v1/dashboard/user-growth`);
          if (response.data.success) {
            setChartData(prev => ({ ...prev, userGrowth: response.data.data }));
          }
        } catch (err) {
          console.error('Error fetching user growth:', err);
        }
      };

      // Call fetch functions
      fetchWeeklyActivity();
      fetchAnalysisDistribution();
      fetchUserGrowth();
    }, [bungaReports, leafReports, API_BASE_URL]);

    const COLORS = ['#27AE60', '#F39C12', '#E74C3C', '#3498DB', '#9B59B6', '#1ABC9C', '#E67E22', '#16A085'];
    const monthOptions = [
      { label: 'All', value: 'all' },
      { label: 'January', value: 'Jan' },
      { label: 'February', value: 'Feb' },
      { label: 'March', value: 'Mar' },
      { label: 'April', value: 'Apr' },
      { label: 'May', value: 'May' },
      { label: 'June', value: 'Jun' },
      { label: 'July', value: 'Jul' },
      { label: 'August', value: 'Aug' },
      { label: 'September', value: 'Sep' },
      { label: 'October', value: 'Oct' },
      { label: 'November', value: 'Nov' },
      { label: 'December', value: 'Dec' }
    ];
    const filteredUserGrowth = selectedMonth === 'all'
      ? chartData.userGrowth
      : (chartData.userGrowth || []).filter((item) => {
        const label = String(item?.date || '');
        return label.startsWith(selectedMonth);
      });
    const selectedMonthLabel = monthOptions.find((month) => month.value === selectedMonth)?.label || 'All';
    const chartCardStyle = {
      backgroundColor: '#ffffff',
      backgroundImage: 'linear-gradient(180deg, #ffffff 0%, #f5faf7 100%)',
      border: '1px solid rgba(42, 133, 102, 0.2)',
      borderRadius: '18px',
      padding: '20px',
      boxShadow: '0 14px 28px rgba(15, 23, 42, 0.08)',
      minHeight: '360px',
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      minWidth: 0
    };
    const chartHeaderStyle = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '12px',
      gap: '12px'
    };
    const chartTitleStyle = {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontWeight: 700,
      color: colors.text,
      fontSize: '16px'
    };
    const chartBadgeStyle = {
      fontSize: '11px',
      color: colors.textLight,
      backgroundColor: '#ffffff',
      padding: '4px 10px',
      borderRadius: '999px',
      border: '1px solid rgba(42, 133, 102, 0.2)',
      whiteSpace: 'nowrap',
      boxShadow: '0 6px 12px rgba(15, 23, 42, 0.08)'
    };
    const chartBodyStyle = {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    };
    const analysisTotal = (chartData.analysisDistribution || []).reduce((sum, item) => sum + (Number(item.value) || 0), 0);
    const bungaTotal = (chartData.analysisDistribution || []).find((item) => String(item.name).toLowerCase().includes('bunga'))?.value || 0;
    const leafTotal = (chartData.analysisDistribution || []).find((item) => String(item.name).toLowerCase().includes('leaf'))?.value || 0;
    const weeklyTotal = (chartData.weeklyActivity || []).reduce((sum, item) => sum + (Number(item.bunga) || 0) + (Number(item.leaf) || 0), 0);
    const weeklyTotals = (chartData.weeklyActivity || []).map((item) => ({
      ...item,
      total: (Number(item.bunga) || 0) + (Number(item.leaf) || 0)
    }));
    const formatNumber = (value) => Number(value || 0).toLocaleString();
    const hasBungaMarketGrade = (chartData.bungaMarketGrade || []).some((item) => Number(item.value) > 0);
    const hasBungaHealthClass = (chartData.bungaHealthClass || []).some((item) => Number(item.value) > 0);
    const hasBungaRipenessClass = (chartData.bungaRipenessClass || []).some((item) => Number(item.value) > 0);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{
          backgroundColor: '#f7f9f6',
          border: '1px solid rgba(15, 23, 42, 0.08)',
          borderRadius: '20px',
          padding: '20px',
          boxShadow: '0 16px 32px rgba(15, 23, 42, 0.12)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: colors.textLight, marginBottom: '6px' }}>Charts</div>
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: colors.text }}>Charts Overview</h2>
              <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: colors.textLight }}>Two charts per row, clean and consistent.</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label htmlFor="chart-month" style={{ fontSize: '12px', fontWeight: 700, color: colors.text }}>Filter by Month</label>
              <select
                id="chart-month"
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(event.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: `1px solid ${colors.border}`,
                  backgroundColor: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: colors.text,
                  boxShadow: '0 6px 14px rgba(15, 23, 42, 0.08)',
                  cursor: 'pointer'
                }}
              >
                {monthOptions.map((month) => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '24px' }}>
          <div style={{ ...chartCardStyle, borderTop: '3px solid #F39C12' }}>
            <div style={chartHeaderStyle}>
              <div style={chartTitleStyle}>
                <img src={logoImage} alt="peppercorns" style={{ height: '20px', objectFit: 'contain' }} />
                Peppercorns Ripeness
              </div>
              <div style={chartBadgeStyle}>Distribution</div>
            </div>
            <div style={chartBodyStyle}>
              {chartData.bungaRipeness && chartData.bungaRipeness.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData.bungaRipeness}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => name + ': ' + value.toFixed(1) + '%'}
                      outerRadius={90}
                      innerRadius={50}
                      dataKey="value"
                    >
                      {chartData.bungaRipeness.map((entry, index) => (
                        <Cell key={'cell-' + index} fill={['#27AE60', '#F39C12', '#E74C3C'][index % 3]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => value.toFixed(1) + '%'} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.textLight }}>No data available</div>
              )}
            </div>
          </div>

          <div style={{ ...chartCardStyle, borderTop: '3px solid #E67E22' }}>
            <div style={chartHeaderStyle}>
              <div style={chartTitleStyle}>Market Grade</div>
              <div style={chartBadgeStyle}>Peppercorns quality</div>
            </div>
            <div style={chartBodyStyle}>
              {hasBungaMarketGrade ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.bungaMarketGrade}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                    <XAxis dataKey="name" stroke={colors.text} interval={0} />
                    <YAxis stroke={colors.text} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: `1px solid ${colors.border}` }} />
                    <Bar dataKey="value" fill={colors.accent} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.textLight }}>No data available</div>
              )}
            </div>
          </div>

          <div style={{ ...chartCardStyle, borderTop: '3px solid #27AE60' }}>
            <div style={chartHeaderStyle}>
              <div style={chartTitleStyle}>Health Class</div>
              <div style={chartBadgeStyle}>Peppercorns health</div>
            </div>
            <div style={chartBodyStyle}>
              {hasBungaHealthClass ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.bungaHealthClass}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                    <XAxis dataKey="name" stroke={colors.text} />
                    <YAxis stroke={colors.text} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: `1px solid ${colors.border}` }} />
                    <Bar dataKey="value" fill={colors.primary} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.textLight }}>No data available</div>
              )}
            </div>
          </div>

          <div style={{ ...chartCardStyle, borderTop: '3px solid #2D6A4F' }}>
            <div style={chartHeaderStyle}>
              <div style={chartTitleStyle}>Ripeness Class</div>
              <div style={chartBadgeStyle}>a-d</div>
            </div>
            <div style={chartBodyStyle}>
              {hasBungaRipenessClass ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.bungaRipenessClass}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                    <XAxis dataKey="name" stroke={colors.text} />
                    <YAxis stroke={colors.text} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: `1px solid ${colors.border}` }} />
                    <Bar dataKey="value" fill="#2D6A4F" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.textLight }}>No data available</div>
              )}
            </div>
          </div>

          <div style={{ ...chartCardStyle, borderTop: '3px solid #27AE60' }}>
            <div style={chartHeaderStyle}>
              <div style={chartTitleStyle}><MdTrendingUp size={18} /> User Growth Trend</div>
              <div style={chartBadgeStyle}>{selectedMonthLabel}</div>
            </div>
            <div style={chartBodyStyle}>
              {filteredUserGrowth && filteredUserGrowth.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={filteredUserGrowth}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                    <XAxis dataKey="date" stroke={colors.text} />
                    <YAxis stroke={colors.text} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: `1px solid ${colors.border}` }} formatter={(value) => value.toLocaleString()} />
                    <Line type="monotone" dataKey="users" stroke={colors.primary} strokeWidth={3} dot={{ fill: colors.primary, r: 5 }} activeDot={{ r: 7 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.textLight }}>No data available</div>
              )}
            </div>
          </div>

          <div style={{ ...chartCardStyle, borderTop: '3px solid #1ABC9C' }}>
            <div style={chartHeaderStyle}>
              <div style={chartTitleStyle}><MdAnalytics size={18} /> Analysis Distribution</div>
              <div style={chartBadgeStyle}>Overall</div>
            </div>
            <div style={chartBodyStyle}>
              {chartData.analysisDistribution && chartData.analysisDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData.analysisDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, percentage }) => name + ': ' + value + ' (' + percentage + '%)'}
                      outerRadius={90}
                      innerRadius={50}
                      dataKey="value"
                    >
                      {chartData.analysisDistribution.map((entry, index) => (
                        <Cell key={'cell-' + index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => value.toLocaleString()} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.textLight }}>No data available</div>
              )}
            </div>
          </div>

          <div style={{ ...chartCardStyle, borderTop: '3px solid #3498DB' }}>
            <div style={chartHeaderStyle}>
              <div style={chartTitleStyle}><MdBarChart size={18} /> Weekly Activity</div>
              <div style={chartBadgeStyle}>Last 7 days</div>
            </div>
            <div style={chartBodyStyle}>
              {chartData.weeklyActivity && chartData.weeklyActivity.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.weeklyActivity}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                    <XAxis dataKey="date" stroke={colors.text} />
                    <YAxis stroke={colors.text} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: `1px solid ${colors.border}` }} />
                    <Legend />
                    <Bar dataKey="bunga" fill="#27AE60" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="leaf" fill="#E67E22" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.textLight }}>No data available</div>
              )}
            </div>
          </div>

          <div style={{ ...chartCardStyle, borderTop: '3px solid #556B2F' }}>
            <div style={chartHeaderStyle}>
              <div style={chartTitleStyle}><MdTrendingUp size={18} /> Total Activity Trend</div>
              <div style={chartBadgeStyle}>Combined</div>
            </div>
            <div style={chartBodyStyle}>
              {weeklyTotals && weeklyTotals.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={weeklyTotals}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                    <XAxis dataKey="date" stroke={colors.text} />
                    <YAxis stroke={colors.text} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: `1px solid ${colors.border}` }} />
                    <Line type="monotone" dataKey="total" stroke="#8B6F47" strokeWidth={3} dot={{ fill: '#8B6F47', r: 5 }} activeDot={{ r: 7 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.textLight }}>No data available</div>
              )}
            </div>
          </div>
        </div>
      </div>
    );


  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      backgroundColor: '#1a5f52',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative Circle Opacity Background */}
      <div style={{
        position: 'fixed',
        top: '-100px',
        left: '-100px',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        backgroundColor: 'rgba(39, 174, 96, 0.15)',
        pointerEvents: 'none',
        zIndex: 0
      }} />
      <div style={{
        position: 'fixed',
        top: '50%',
        right: '-150px',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        backgroundColor: 'rgba(52, 211, 153, 0.1)',
        pointerEvents: 'none',
        zIndex: 0
      }} />
      <div style={{
        position: 'fixed',
        bottom: '-120px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '350px',
        height: '350px',
        borderRadius: '50%',
        backgroundColor: 'rgba(16, 185, 129, 0.08)',
        pointerEvents: 'none',
        zIndex: 0
      }} />
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        <AdminSidebar />
      </div>

      <main style={{
        flex: 1,
        padding: '32px 20px',
        marginLeft: '280px',
        overflowY: 'auto',
        height: 'calc(100vh - 80px)',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {/* Error Alert */}
          {error && (
          <div style={{
            backgroundColor: '#FFEBEE',
            border: `2px solid ${colors.danger}`,
            color: colors.danger,
            padding: '16px 20px',
            borderRadius: '10px',
            marginBottom: '24px',
            borderLeft: `4px solid ${colors.danger}`,
            boxShadow: `0 4px 12px ${colors.danger}20`
          }}>
            <MdClear size={20} /> {error}
          </div>
        )}

        {/* Export Controls */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          marginBottom: '20px'
        }}>
          <button
            onClick={() => setShowExportModal(true)}
            style={{
              padding: '12px 18px',
              backgroundColor: colors.accent,
              color: '#ffffff',
              border: `1px solid ${colors.accent}`,
              borderRadius: '999px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px',
              transition: 'all 0.3s ease',
              boxShadow: '0 10px 20px rgba(230, 126, 34, 0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#D95A1C';
              e.target.style.boxShadow = '0 14px 24px rgba(230, 126, 34, 0.35)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = colors.accent;
              e.target.style.boxShadow = '0 10px 20px rgba(230, 126, 34, 0.25)';
            }}
            title="Export current data as PDF"
          >
            <MdDownload size={18} />
            Export PDF
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '32px',
          backgroundColor: '#dff3e8',
          borderRadius: '999px',
          padding: '6px',
          border: `1px solid ${colors.border}`,
          boxShadow: '0 10px 24px rgba(15, 23, 42, 0.08)'
        }}>
          {['dashboard', 'bunga', 'leaf', 'charts'].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setError(null);
              }}
              style={{
                padding: '12px 20px',
                backgroundColor: activeTab === tab ? colors.primary : 'transparent',
                color: activeTab === tab ? '#ffffff' : colors.text,
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: activeTab === tab ? '700' : '600',
                transition: 'all 0.3s ease',
                borderRadius: '999px',
                position: 'relative',
                boxShadow: activeTab === tab ? '0 10px 20px rgba(39, 174, 96, 0.25)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab) {
                  e.target.style.backgroundColor = '#ffffff';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab) {
                  e.target.style.backgroundColor = 'transparent';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {tab === 'bunga' && <img src={logoImage} alt="peppercorns" style={{ height: '20px', objectFit: 'contain' }} />}
                {tab === 'dashboard' && <MdTrendingUp size={20} />}
                {tab === 'leaf' && <MdTrendingUp size={20} />}
                {tab === 'charts' && <MdBarChart size={20} />}
                <span>
                  {tab === 'dashboard' && 'Dashboard'}
                  {tab === 'bunga' && 'Peppercorns Analysis'}
                  {tab === 'leaf' && 'Leaf Analysis'}
                  {tab === 'charts' && 'Charts'}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ minHeight: '600px' }}>
          {loading && activeTab !== 'dashboard' && activeTab !== 'charts' ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: colors.textLight }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
              <p style={{ fontSize: '16px' }}>Loading data...</p>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && <DashboardTab />}
              {activeTab === 'bunga' && <BungaReportsTab />}
              {activeTab === 'leaf' && <LeafReportsTab />}
              {activeTab === 'charts' && <ChartsTab />}
            </>
          )}
        </div>
        </div>
      </main>

      <ExportPdfModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        currentFilters={exportFiltersSuggestion}
        currentActiveTab={activeTab}
        API_BASE_URL={API_BASE_URL}
      />

      <div style={{ marginLeft: '280px' }}>
        <AdminFooter />
      </div>
    </div>
  );
};

// ==================== HELPER COMPONENTS ====================

const StatCard = ({ title, value, icon, color }) => (
  <div style={{
    backgroundColor: '#FFFFFF',
    backgroundImage: `linear-gradient(135deg, ${color}11 0%, transparent 100%)`,
    border: `2px solid ${color}`,
    borderRadius: '12px',
    padding: '24px',
    textAlign: 'center',
    boxShadow: `0 8px 24px ${color}20`,
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    transform: 'translateY(0)',
    ':hover': {
      transform: 'translateY(-4px)',
      boxShadow: `0 12px 32px ${color}30`
    }
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = 'translateY(-4px)';
    e.currentTarget.style.boxShadow = `0 12px 32px ${color}30`;
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = `0 8px 24px ${color}20`;
  }}>
    <div style={{ fontSize: '40px', marginBottom: '12px' }}>{icon}</div>
    <div style={{ color: '#999', fontSize: '11px', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</div>
    <div style={{ color, fontSize: '32px', fontWeight: 'bold' }}>{value}</div>
  </div>
);

const StatCardWithLogo = ({ title, value, logo, color }) => (
  <div style={{
    backgroundColor: '#FFFFFF',
    backgroundImage: `linear-gradient(135deg, ${color}11 0%, transparent 100%)`,
    border: `2px solid ${color}`,
    borderRadius: '12px',
    padding: '24px',
    textAlign: 'center',
    boxShadow: `0 8px 24px ${color}20`,
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    transform: 'translateY(0)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    ':hover': {
      transform: 'translateY(-4px)',
      boxShadow: `0 12px 32px ${color}30`
    }
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = 'translateY(-4px)';
    e.currentTarget.style.boxShadow = `0 12px 32px ${color}30`;
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = `0 8px 24px ${color}20`;
  }}>
    <img src={logo} alt="logo" style={{ height: '50px', marginBottom: '12px', objectFit: 'contain', margin: '0 auto 12px auto', display: 'block' }} />
    <div style={{ color: '#999', fontSize: '11px', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</div>
    <div style={{ color, fontSize: '32px', fontWeight: 'bold' }}>{value}</div>
  </div>
);

const StatItem = ({ label, value, color }) => (
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderRadius: '8px',
    backgroundColor: '#F5F5F5',
    marginBottom: '8px',
    borderLeft: `4px solid ${color}`,
    transition: 'all 0.2s ease'
  }}>
    <span style={{ color: '#555', fontSize: '14px', fontWeight: '500' }}>{label}</span>
    <span style={{ color, fontSize: '16px', fontWeight: 'bold' }}>{value}</span>
  </div>
);

const DataTable = ({ data, type, colors, pagination, currentPage, onPageChange, onShowAll, onShowDefault, isAll, defaultPageSize = 10 }) => (
  <div style={{
    backgroundColor: colors.secondary,
    border: `2px solid ${colors.border}`,
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)'
  }}>
    {/* Table */}
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: `linear-gradient(90deg, ${colors.primary}, ${colors.primaryLight})`, color: '#ffffff' }}>
            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '14px' }}>User</th>
            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '14px' }}>Image</th>
            {type === 'bunga' ? (
              <>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '14px' }}>Ripeness</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '14px' }}>Health Class</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '14px' }}>Market Grade</th>
              </>
            ) : (
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '14px' }}>Disease</th>
            )}
            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '14px' }}>Confidence</th>
            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '14px' }}>Time</th>
            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '14px' }}>Date</th>
          </tr>
        </thead>
        <tbody>
          {data && data.length > 0 ? (
            data.map((item, index) => {
              const results = item.results || {};
              
              return (
                <tr
                  key={item._id}
                  style={{
                    backgroundColor: index % 2 === 0 ? '#F8FAFB' : colors.secondary,
                    borderBottom: `1px solid ${colors.border}`,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.background;
                    e.currentTarget.style.boxShadow = 'inset 0 0 0 2px ' + colors.primary + '20';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#F8FAFB' : colors.secondary;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <td style={{ padding: '14px 16px', color: colors.text, fontWeight: '500' }}>{item.userName || 'Unknown'}</td>
                  <td style={{ padding: '14px 16px' }}>
                    {item.image?.url && (
                      <img
                        src={item.image.url}
                        alt="analysis"
                        style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover', border: `2px solid ${colors.border}` }}
                      />
                    )}
                  </td>
                  {type === 'bunga' ? (
                    <>
                      <td style={{ padding: '14px 16px', color: colors.text }}>
                        <span style={{ 
                          backgroundColor: String(results.ripeness) === 'Ripe' ? '#D4EDDA' : String(results.ripeness) === 'Unripe' ? '#FFF3CD' : '#F8D7DA',
                          color: String(results.ripeness) === 'Ripe' ? '#155724' : String(results.ripeness) === 'Unripe' ? '#856404' : '#721C24',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {String(results.ripeness || 'N/A')}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', color: colors.text }}>
                        <span style={{
                          backgroundColor: colors.background,
                          color: colors.text,
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {Number.isFinite(Number(results.health_percentage))
                            ? `${Number(results.health_percentage).toFixed(2)}%`
                            : 'N/A'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', color: colors.text }}>
                        <span style={{
                          backgroundColor: colors.background,
                          color: colors.text,
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {String(results.market_grade || 'N/A')}
                        </span>
                      </td>
                    </>
                  ) : (
                    <td style={{ padding: '14px 16px', color: colors.text }}>
                      <span style={{
                        backgroundColor: colors.background,
                        color: colors.text,
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {String(results.disease || 'N/A')}
                      </span>
                    </td>
                  )}
                  <td style={{ padding: '14px 16px', color: colors.primary, fontWeight: 'bold', fontSize: '14px' }}>
                    {String(results.confidence || 0)}%
                  </td>
                  <td style={{ padding: '14px 16px', color: colors.text, fontSize: '13px' }}>
                    {String(item.processingTime || '0s')}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '12px', color: colors.textLight }}>
                    {new Date(item.createdAt).toLocaleString()}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={type === 'bunga' ? 8 : 7} style={{ padding: '40px 20px', textAlign: 'center', color: colors.textLight }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
                <div>No data available</div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

    {/* Pagination */}
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '20px 24px',
      backgroundColor: colors.background,
      borderTop: `1px solid ${colors.border}`
    }}>
      <div style={{ color: colors.text, fontSize: '13px', fontWeight: '500' }}>
        Page <span style={{ color: colors.primary, fontWeight: 'bold' }}>{currentPage}</span> of <span style={{ color: colors.primary, fontWeight: 'bold' }}>{pagination.totalPages}</span> ({pagination.totalRecords} total)
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        {(onShowAll && onShowDefault) && (
          <button
            onClick={() => (isAll ? onShowDefault() : onShowAll())}
            style={{
              padding: '10px 14px',
              backgroundColor: colors.background,
              color: colors.text,
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '13px',
              transition: 'all 0.2s ease'
            }}
            title={isAll ? `Show ${defaultPageSize}` : 'Show all'}
          >
            {isAll ? `Show ${defaultPageSize}` : 'Show all'}
          </button>
        )}
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          style={{
            padding: '10px 16px',
            backgroundColor: currentPage === 1 ? '#E0E0E0' : colors.primary,
            color: colors.secondary,
            border: 'none',
            borderRadius: '8px',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            fontSize: '13px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (currentPage !== 1) {
              e.target.style.backgroundColor = colors.primaryLight;
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = `0 4px 8px ${colors.primary}30`;
            }
          }}
          onMouseLeave={(e) => {
            if (currentPage !== 1) {
              e.target.style.backgroundColor = colors.primary;
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }
          }}
        >
          ← Previous
        </button>
        <button
          onClick={() => onPageChange(Math.min(pagination.totalPages, currentPage + 1))}
          disabled={currentPage === pagination.totalPages}
          style={{
            padding: '10px 16px',
            backgroundColor: currentPage === pagination.totalPages ? '#E0E0E0' : colors.primary,
            color: colors.secondary,
            border: 'none',
            borderRadius: '8px',
            cursor: currentPage === pagination.totalPages ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            fontSize: '13px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (currentPage !== pagination.totalPages) {
              e.target.style.backgroundColor = colors.primaryLight;
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = `0 4px 8px ${colors.primary}30`;
            }
          }}
          onMouseLeave={(e) => {
            if (currentPage !== pagination.totalPages) {
              e.target.style.backgroundColor = colors.primary;
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }
          }}
        >
          Next →
        </button>
      </div>
    </div>
  </div>
);

export default ReportsAdmin;




