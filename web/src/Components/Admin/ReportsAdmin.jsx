import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import logoImage from './logowalangbg.png';
import AdminHeader from './AdminHeader';
import AdminFooter from './AdminFooter';

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
    } else if (activeTab === 'charts') {
      // Charts tab always needs data - load both if not available
      if (!bungaReports) fetchBungaReports(1);
      if (!leafReports) fetchLeafReports(1);
    }
  }, [activeTab]);

  // ==================== DASHBOARD TAB ====================
  const DashboardTab = () => {
    if (!dashboardData) return <div className="text-center p-12" style={{color: colors.textLight}}>⏳ Loading dashboard...</div>;

    const { overview, bungaStatistics, latestBungaAnalyses, latestLeafAnalyses } = dashboardData;
    
    // Ensure confidence is a valid number
    const avgConfidence = parseFloat(bungaStatistics.averageConfidence) || 0;

    return (
      <div className="space-y-8">
        {/* Overview Cards */}
        <div>
          <h2 style={{ color: colors.text, fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>📊 Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <StatCard title="Total Analyses" value={overview.totalAnalyses} icon="📊" color={colors.primary} />
            <StatCardWithLogo title="Bunga Analyses" value={overview.totalBungaAnalyses} logo={logoImage} color={colors.accent} />
            <StatCard title="Leaf Analyses" value={overview.totalLeafAnalyses} icon="🍃" color={colors.info} />
            <StatCard title="Users" value={overview.totalUsers} icon="👥" color={colors.primaryLight} />
            <StatCard title="System Users" value={overview.systemUsers} icon="🔐" color={colors.warning} />
          </div>
        </div>

        {/* Bunga Statistics */}
        <div style={{
          backgroundColor: colors.secondary,
          border: `2px solid ${colors.primary}`,
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 4px 12px rgba(39, 174, 96, 0.1)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img src={logoImage} alt="bunga" style={{ height: '50px', objectFit: 'contain', marginBottom: '12px', margin: '0 auto 12px auto', display: 'block' }} />
            <h3 style={{ color: colors.text, fontSize: '18px', fontWeight: 'bold', margin: '0' }}>
              Bunga Statistics
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div style={{
                  backgroundColor: colors.background,
                  padding: '16px',
                  borderRadius: '10px',
                  textAlign: 'center',
                  borderLeft: `4px solid ${colors.success}`
                }}>
                  <div style={{ color: colors.textLight, fontSize: '12px', marginBottom: '8px' }}>Ripe</div>
                  <div style={{ color: colors.success, fontSize: '24px', fontWeight: 'bold' }}>
                    {bungaStatistics.ripeness.Ripe}
                  </div>
                </div>
                <div style={{
                  backgroundColor: colors.background,
                  padding: '16px',
                  borderRadius: '10px',
                  textAlign: 'center',
                  borderLeft: `4px solid ${colors.warning}`
                }}>
                  <div style={{ color: colors.textLight, fontSize: '12px', marginBottom: '8px' }}>Unripe</div>
                  <div style={{ color: colors.warning, fontSize: '24px', fontWeight: 'bold' }}>
                    {bungaStatistics.ripeness.Unripe}
                  </div>
                </div>
                <div style={{
                  backgroundColor: colors.background,
                  padding: '16px',
                  borderRadius: '10px',
                  textAlign: 'center',
                  borderLeft: `4px solid ${colors.danger}`
                }}>
                  <div style={{ color: colors.textLight, fontSize: '12px', marginBottom: '8px' }}>Rotten</div>
                  <div style={{ color: colors.danger, fontSize: '24px', fontWeight: 'bold' }}>
                    {bungaStatistics.ripeness.Rotten}
                  </div>
                </div>
              </div>
            </div>
            <div style={{
              backgroundColor: colors.background,
              padding: '20px',
              borderRadius: '10px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <div style={{ color: colors.textLight, fontSize: '14px', marginBottom: '12px' }}>Average Confidence</div>
              <div style={{ 
                color: colors.primary, 
                fontSize: '48px', 
                fontWeight: 'bold',
                textShadow: `0 2px 4px rgba(39, 174, 96, 0.2)`
              }}>
                {isNaN(avgConfidence) ? '0' : avgConfidence.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        {/* Latest Analyses */}
        <div>
          <h2 style={{ color: colors.text, fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>⏱️ Recent Activity</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Latest Bunga */}
            <div style={{
              backgroundColor: colors.secondary,
              border: `2px solid ${colors.accent}`,
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 4px 12px rgba(230, 126, 34, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <img src={logoImage} alt="bunga" style={{ height: '50px', objectFit: 'contain', marginBottom: '12px' }} />
              <h3 style={{ color: colors.text, fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', margin: '0 0 16px 0' }}>
                Recent Bunga Analyses
              </h3>
              <div className="space-y-3" style={{ width: '100%' }}>
                {latestBungaAnalyses?.map((analysis) => (
                  <div key={analysis._id} style={{
                    backgroundColor: colors.background,
                    padding: '12px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    borderLeft: `3px solid ${colors.accent}`,
                    transition: 'all 0.3s ease'
                  }}>
                    <div style={{ color: colors.text, fontWeight: 'bold', marginBottom: '4px' }}>{analysis.userName}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: colors.textLight, fontSize: '13px' }}>
                      <span>🌿 {analysis.ripeness}</span>
                      <span style={{ color: colors.primary, fontWeight: 'bold' }}>{analysis.confidence}%</span>
                    </div>
                    <div style={{ color: colors.textLight, fontSize: '11px', marginTop: '6px' }}>
                      {new Date(analysis.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Latest Leaf */}
            <div style={{
              backgroundColor: colors.secondary,
              border: `2px solid ${colors.info}`,
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 4px 12px rgba(52, 152, 219, 0.1)'
            }}>
              <h3 style={{ color: colors.text, fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>
                🍃 Recent Leaf Analyses
              </h3>
              <div className="space-y-3">
                {latestLeafAnalyses?.map((analysis) => (
                  <div key={analysis._id} style={{
                    backgroundColor: colors.background,
                    padding: '12px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    borderLeft: `3px solid ${colors.info}`,
                    transition: 'all 0.3s ease'
                  }}>
                    <div style={{ color: colors.text, fontWeight: 'bold', marginBottom: '4px' }}>{analysis.userName}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: colors.textLight, fontSize: '13px' }}>
                      <span>🦠 {analysis.disease}</span>
                      <span style={{ color: colors.primary, fontWeight: 'bold' }}>{analysis.confidence}%</span>
                    </div>
                    <div style={{ color: colors.textLight, fontSize: '11px', marginTop: '6px' }}>
                      {new Date(analysis.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ==================== BUNGA REPORTS TAB ====================
  const BungaReportsTab = () => {
    if (!bungaReports) return <div className="text-center p-12" style={{color: colors.textLight}}>⏳ Loading bunga reports...</div>;

    const { statistics, data, pagination } = bungaReports;

    return (
      <div className="space-y-8">
        {/* Statistics Cards Grid */}
        <div>
          <h2 style={{ color: colors.text, fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>📊 Detailed Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div style={{
              backgroundColor: colors.secondary,
              border: `2px solid ${colors.success}`,
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 4px 12px rgba(39, 174, 96, 0.1)'
            }}>
              <h3 style={{ color: colors.text, fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '20px', marginRight: '8px' }}>📊</span> Ripeness Distribution
              </h3>
              <div className="space-y-3">
                <StatItem label="🟢 Ripe" value={`${statistics.ripeness.Ripe}% (${statistics.ripeness.counts.Ripe})`} color={colors.success} />
                <StatItem label="🟡 Unripe" value={`${statistics.ripeness.Unripe}% (${statistics.ripeness.counts.Unripe})`} color={colors.warning} />
                <StatItem label="🔴 Rotten" value={`${statistics.ripeness.Rotten}% (${statistics.ripeness.counts.Rotten})`} color={colors.danger} />
              </div>
            </div>

            <div style={{
              backgroundColor: colors.secondary,
              border: `2px solid ${colors.accent}`,
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 4px 12px rgba(230, 126, 34, 0.1)'
            }}>
              <h3 style={{ color: colors.text, fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '20px', marginRight: '8px' }}>🏆</span> Market Grade Distribution
              </h3>
              <div className="space-y-3">
                <StatItem label="⭐ Premium" value={`${statistics.marketGrade.Premium}% (${statistics.marketGrade.counts.Premium})`} color={colors.success} />
                <StatItem label="✅ Standard" value={`${statistics.marketGrade.Standard}% (${statistics.marketGrade.counts.Standard})`} color={colors.primary} />
                <StatItem label="📦 Commercial" value={`${statistics.marketGrade.Commercial}% (${statistics.marketGrade.counts.Commercial})`} color={colors.info} />
                <StatItem label="❌ Reject" value={`${statistics.marketGrade.Reject}% (${statistics.marketGrade.counts.Reject})`} color={colors.danger} />
              </div>
            </div>

            <div style={{
              backgroundColor: colors.secondary,
              border: `2px solid ${colors.info}`,
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 4px 12px rgba(52, 152, 219, 0.1)'
            }}>
              <h3 style={{ color: colors.text, fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '20px', marginRight: '8px' }}>💪</span> Health Class Distribution
              </h3>
              <div className="space-y-3">
                <StatItem label="A" value={`${statistics.healthClass.A}% (${statistics.healthClass.counts.a})`} color={colors.success} />
                <StatItem label="B" value={`${statistics.healthClass.B}% (${statistics.healthClass.counts.b})`} color={colors.primary} />
                <StatItem label="C" value={`${statistics.healthClass.C}% (${statistics.healthClass.counts.c})`} color={colors.info} />
                <StatItem label="D" value={`${statistics.healthClass.D}% (${statistics.healthClass.counts.d})`} color={colors.danger} />
              </div>
            </div>

            <div style={{
              backgroundColor: colors.secondary,
              border: `2px solid ${colors.primary}`,
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 4px 12px rgba(39, 174, 96, 0.1)'
            }}>
              <h3 style={{ color: colors.text, fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '20px', marginRight: '8px' }}>🎯</span> Performance Metrics
              </h3>
              <div className="space-y-3">
                <StatItem label="📊 Average Confidence" value={`${statistics.confidence.average}%`} color={colors.primary} />
                <StatItem label="⚡ Avg Processing Time" value={`${statistics.processingTime.average}s`} color={colors.info} />
                <StatItem label="📈 Total Records" value={statistics.totalRecords} color={colors.text} />
              </div>
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
    if (!leafReports) return <div className="text-center p-12" style={{color: colors.textLight}}>⏳ Loading leaf reports...</div>;

    const { statistics, data, pagination } = leafReports;

    return (
      <div className="space-y-8">
        {/* Statistics */}
        <div>
          <h2 style={{ color: colors.text, fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>📊 Leaf Analysis Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div style={{
              backgroundColor: colors.secondary,
              border: `2px solid ${colors.info}`,
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 4px 12px rgba(52, 152, 219, 0.1)'
            }}>
              <h3 style={{ color: colors.text, fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '20px', marginRight: '8px' }}>🍃</span> Disease Distribution
              </h3>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {Object.entries(statistics.diseaseDistribution).map(([disease, stats]) => (
                  <StatItem
                    key={disease}
                    label={`🦠 ${disease}`}
                    value={`${stats.percentage}% (${stats.count})`}
                    color={colors.primary}
                  />
                ))}
              </div>
            </div>

            <div style={{
              backgroundColor: colors.secondary,
              border: `2px solid ${colors.primary}`,
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 4px 12px rgba(39, 174, 96, 0.1)'
            }}>
              <h3 style={{ color: colors.text, fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '20px', marginRight: '8px' }}>📊</span> Analysis Metrics
              </h3>
              <div className="space-y-3">
                <StatItem label="🥇 Most Common Disease" value={statistics.mostCommonDisease} color={colors.success} />
                <StatItem label="📊 Avg Confidence" value={`${statistics.confidence.average}%`} color={colors.primary} />
                <StatItem label="🎯 Total Detections" value={statistics.totalDetections} color={colors.info} />
                <StatItem label="📈 Avg /Analysis" value={statistics.averageDetectionsPerAnalysis} color={colors.accent} />
                <StatItem label="⚡ Avg Processing Time" value={`${statistics.processingTime.average}s`} color={colors.warning} />
                <StatItem label="📋 Total Records" value={statistics.totalRecords} color={colors.text} />
              </div>
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

  // ==================== CHARTS TAB ====================
  const ChartsTab = () => {
    const [chartData, setChartData] = useState({
      bungaRipeness: [],
      bungaMarketGrade: [],
      bungaHealthClass: [],
      leafDisease: [],
      bungaConfidence: [],
      leafConfidence: []
    });

    useEffect(() => {
      // Build pie chart data for Bunga Ripeness
      if (bungaReports?.statistics?.ripeness) {
        const ripData = [
          { name: 'Ripe', value: parseFloat(bungaReports.statistics.ripeness.Ripe) || 0 },
          { name: 'Unripe', value: parseFloat(bungaReports.statistics.ripeness.Unripe) || 0 },
          { name: 'Rotten', value: parseFloat(bungaReports.statistics.ripeness.Rotten) || 0 }
        ].filter(item => item.value > 0);
        setChartData(prev => ({ ...prev, bungaRipeness: ripData }));
      }

      // Build bar chart data for Market Grade
      if (bungaReports?.statistics?.marketGrade) {
        const gradeData = [
          { name: 'Premium', value: parseFloat(bungaReports.statistics.marketGrade.Premium) || 0 },
          { name: 'Standard', value: parseFloat(bungaReports.statistics.marketGrade.Standard) || 0 },
          { name: 'Commercial', value: parseFloat(bungaReports.statistics.marketGrade.Commercial) || 0 },
          { name: 'Reject', value: parseFloat(bungaReports.statistics.marketGrade.Reject) || 0 }
        ].filter(item => item.value > 0);
        setChartData(prev => ({ ...prev, bungaMarketGrade: gradeData }));
      }

      // Build bar chart data for Health Class
      if (bungaReports?.statistics?.healthClass) {
        const healthData = [
          { name: 'Class A', value: parseFloat(bungaReports.statistics.healthClass.A) || 0 },
          { name: 'Class B', value: parseFloat(bungaReports.statistics.healthClass.B) || 0 },
          { name: 'Class C', value: parseFloat(bungaReports.statistics.healthClass.C) || 0 },
          { name: 'Class D', value: parseFloat(bungaReports.statistics.healthClass.D) || 0 }
        ].filter(item => item.value > 0);
        setChartData(prev => ({ ...prev, bungaHealthClass: healthData }));
      }

      // Build pie chart data for Leaf Disease
      if (leafReports?.statistics?.diseaseDistribution) {
        const diseaseData = Object.entries(leafReports.statistics.diseaseDistribution)
          .map(([disease, stats]) => ({
            name: disease,
            value: parseFloat(stats.percentage) || 0
          }))
          .filter(item => item.value > 0);
        setChartData(prev => ({ ...prev, leafDisease: diseaseData }));
      }
    }, [bungaReports, leafReports]);

    const COLORS = ['#27AE60', '#F39C12', '#E74C3C', '#3498DB', '#9B59B6', '#1ABC9C', '#E67E22', '#16A085'];

    return (
      <div className="space-y-8">
        <h2 style={{ color: colors.text, fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>📊 Visual Analytics</h2>
        {/* Chart Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bunga Ripeness - Pie Chart */}
          <div style={{
            backgroundColor: colors.secondary,
            border: `2px solid ${colors.success}`,
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 12px rgba(39, 174, 96, 0.1)'
          }}>
            <h3 style={{ color: colors.text, fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={logoImage} alt="bunga" style={{ height: '24px', objectFit: 'contain', marginRight: '8px' }} />
              Bunga Ripeness Distribution
            </h3>
            {chartData.bungaRipeness && chartData.bungaRipeness.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.bungaRipeness}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.bungaRipeness.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.textLight }}>
                📭 No data available
              </div>
            )}
          </div>

          {/* Market Grade - Bar Chart */}
          <div style={{
            backgroundColor: colors.secondary,
            border: `2px solid ${colors.accent}`,
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 12px rgba(230, 126, 34, 0.1)'
          }}>
            <h3 style={{ color: colors.text, fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '20px', marginRight: '8px' }}>🏆</span> Market Grade Distribution
            </h3>
            {chartData.bungaMarketGrade && chartData.bungaMarketGrade.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.bungaMarketGrade}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                  <XAxis dataKey="name" stroke={colors.text} />
                  <YAxis stroke={colors.text} />
                  <Tooltip contentStyle={{ backgroundColor: colors.secondary, border: `1px solid ${colors.border}` }} />
                  <Bar dataKey="value" fill={colors.accent} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.textLight }}>
                📭 No data available
              </div>
            )}
          </div>

          {/* Health Class - Bar Chart */}
          <div style={{
            backgroundColor: colors.secondary,
            border: `2px solid ${colors.info}`,
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 12px rgba(52, 152, 219, 0.1)'
          }}>
            <h3 style={{ color: colors.text, fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '20px', marginRight: '8px' }}>💪</span> Health Class Distribution
            </h3>
            {chartData.bungaHealthClass && chartData.bungaHealthClass.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.bungaHealthClass}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                  <XAxis dataKey="name" stroke={colors.text} />
                  <YAxis stroke={colors.text} />
                  <Tooltip contentStyle={{ backgroundColor: colors.secondary, border: `1px solid ${colors.border}` }} />
                  <Bar dataKey="value" fill={colors.primary} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.textLight }}>
                📭 No data available
              </div>
            )}
          </div>

          {/* Leaf Disease - Pie Chart */}
          <div style={{
            backgroundColor: colors.secondary,
            border: `2px solid ${colors.info}`,
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 12px rgba(52, 152, 219, 0.1)'
          }}>
            <h3 style={{ color: colors.text, fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '20px', marginRight: '8px' }}>🍃</span> Disease Distribution
            </h3>
            {chartData.leafDisease && chartData.leafDisease.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.leafDisease}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.leafDisease.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.textLight }}>
                📭 No data available
              </div>
            )}
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
      backgroundColor: '#F8FAFB',
      fontFamily: 'inherit'
    }}>
      <AdminHeader />

      <main style={{
        flex: 1,
        padding: '32px 20px',
        backgroundImage: `linear-gradient(135deg, #F0F9F4 0%, #F8FAFB 100%)`
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
            ❌ {error}
          </div>
        )}

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '32px',
          borderBottom: `3px solid ${colors.border}`,
          backgroundColor: colors.secondary,
          borderRadius: '12px 12px 0 0',
          padding: '0',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
        }}>
          {['dashboard', 'bunga', 'leaf', 'charts'].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setError(null);
              }}
              style={{
                padding: '16px 28px',
                backgroundColor: activeTab === tab ? colors.primary : 'transparent',
                color: activeTab === tab ? colors.secondary : colors.text,
                border: 'none',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: activeTab === tab ? '700' : '600',
                borderBottom: activeTab === tab ? `4px solid ${colors.accent}` : 'none',
                transition: 'all 0.3s ease',
                borderRadius: activeTab === tab ? '8px 8px 0 0' : '0',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab) {
                  e.target.style.backgroundColor = colors.background;
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab) {
                  e.target.style.backgroundColor = 'transparent';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {tab === 'bunga' && <img src={logoImage} alt="bunga" style={{ height: '20px', objectFit: 'contain' }} />}
                {tab === 'dashboard' && '📈'}
                {tab === 'leaf' && '🍃'}
                {tab === 'charts' && '📊'}
                <span>
                  {tab === 'dashboard' && 'Dashboard'}
                  {tab === 'bunga' && 'Bunga Analysis'}
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

      <AdminFooter />
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

const DataTable = ({ data, type, colors, pagination, currentPage, onPageChange }) => (
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
          <tr style={{ backgroundColor: `linear-gradient(90deg, ${colors.primary}, ${colors.primaryLight})`, color: colors.secondary }}>
            <th style={{ padding: '16px', textAlign: 'left', fontWeight: 'bold', fontSize: '14px' }}>User</th>
            <th style={{ padding: '16px', textAlign: 'left', fontWeight: 'bold', fontSize: '14px' }}>Image</th>
            {type === 'bunga' ? (
              <>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 'bold', fontSize: '14px' }}>Ripeness</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 'bold', fontSize: '14px' }}>Health Class</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 'bold', fontSize: '14px' }}>Market Grade</th>
              </>
            ) : (
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: 'bold', fontSize: '14px' }}>Disease</th>
            )}
            <th style={{ padding: '16px', textAlign: 'left', fontWeight: 'bold', fontSize: '14px' }}>Confidence</th>
            <th style={{ padding: '16px', textAlign: 'left', fontWeight: 'bold', fontSize: '14px' }}>Time</th>
            <th style={{ padding: '16px', textAlign: 'left', fontWeight: 'bold', fontSize: '14px' }}>Date</th>
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
                          {String(results.health_class || 'N/A')}
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
