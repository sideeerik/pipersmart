import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LineChart, Line, PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import AdminHeader from './AdminHeader';
import AdminFooter from './AdminFooter';
import logoImage from '../Admin/logowalangbg.png';

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [userGrowth, setUserGrowth] = useState([]);
  const [analysisDistribution, setAnalysisDistribution] = useState([]);
  const [topDiseases, setTopDiseases] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [weeklyActivity, setWeeklyActivity] = useState([]);
  const [userOverview, setUserOverview] = useState(null);
  const [fullscreenChart, setFullscreenChart] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  // Modern corporate color palette
  const colors = {
    primary: '#0F766E',      // Dark teal
    primaryLight: '#14B8A6', // Light teal
    secondary: '#F8FAFC',    // Off white
    dark: '#0F172A',         // Very dark blue
    darkGray: '#1E293B',     // Dark gray
    lightGray: '#F1F5F9',    // Light gray
    border: '#E2E8F0',       // Border
    text: '#0F172A',
    textLight: '#475569',
    accent: '#8B5CF6',       // Purple accent
    success: '#10B981',      // Green
    warning: '#F59E0B',      // Amber
    info: '#0891B2',         // Cyan
    danger: '#EF4444'        // Red
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const [stats, growth, dist, diseases, activity, weekly, overview] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/v1/dashboard/stats`),
        axios.get(`${API_BASE_URL}/api/v1/dashboard/user-growth`),
        axios.get(`${API_BASE_URL}/api/v1/dashboard/analysis-distribution`),
        axios.get(`${API_BASE_URL}/api/v1/dashboard/top-diseases`),
        axios.get(`${API_BASE_URL}/api/v1/dashboard/recent-activity`),
        axios.get(`${API_BASE_URL}/api/v1/dashboard/weekly-activity`),
        axios.get(`${API_BASE_URL}/api/v1/dashboard/user-overview`)
      ]);
      
      if (stats.data.success) setDashboardData(stats.data.stats);
      if (growth.data.success) setUserGrowth(growth.data.data);
      if (dist.data.success) setAnalysisDistribution(dist.data.data);
      if (diseases.data.success) setTopDiseases(diseases.data.data);
      if (activity.data.success) setRecentActivity(activity.data.data);
      if (weekly.data.success) setWeeklyActivity(weekly.data.data);
      if (overview.data.success) setUserOverview(overview.data.data);
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');

      try {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Fetch user profile
        const userRes = await axios.get(`${API_BASE_URL}/api/v1/users/me`);
        if (userRes.data.success) {
          setUser(userRes.data.user);
        }

        // Fetch dashboard stats
        const statsRes = await axios.get(`${API_BASE_URL}/api/v1/dashboard/stats`);
        if (statsRes.data.success) {
          setDashboardData(statsRes.data.stats);
        }

        // Fetch user growth
        const growthRes = await axios.get(`${API_BASE_URL}/api/v1/dashboard/user-growth`);
        if (growthRes.data.success) {
          setUserGrowth(growthRes.data.data);
        }

        // Fetch analysis distribution
        const distRes = await axios.get(`${API_BASE_URL}/api/v1/dashboard/analysis-distribution`);
        if (distRes.data.success) {
          setAnalysisDistribution(distRes.data.data);
        }

        // Fetch top diseases
        const diseasesRes = await axios.get(`${API_BASE_URL}/api/v1/dashboard/top-diseases`);
        if (diseasesRes.data.success) {
          setTopDiseases(diseasesRes.data.data);
        }

        // Fetch recent activity
        const activityRes = await axios.get(`${API_BASE_URL}/api/v1/dashboard/recent-activity`);
        if (activityRes.data.success) {
          setRecentActivity(activityRes.data.data);
        }

        // Fetch weekly activity
        const weeklyRes = await axios.get(`${API_BASE_URL}/api/v1/dashboard/weekly-activity`);
        if (weeklyRes.data.success) {
          setWeeklyActivity(weeklyRes.data.data);
        }

        // Fetch user overview
        const userOverRes = await axios.get(`${API_BASE_URL}/api/v1/dashboard/user-overview`);
        if (userOverRes.data.success) {
          setUserOverview(userOverRes.data.data);
        }
      } catch (error) {
        console.error('Dashboard fetch error:', error);
        localStorage.removeItem('token');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate, API_BASE_URL]);

  if (loading) {
    return (
      <div className="h-screen w-full bg-gradient-to-b from-slate-900 via-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block mb-6">
            <div className="w-16 h-16 border-4 border-slate-200 border-t-teal-600 rounded-full animate-spin" />
          </div>
          <p className="text-slate-700 font-semibold text-lg">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  const chartColors = ['#0F766E', '#8B5CF6'];

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 to-white">
      <AdminHeader />
      
      {/* Main Scrollable Content */}
      <main className="overflow-y-auto scrollbar-hide">
        <div className="max-w-7xl mx-auto px-6 py-12">
          
          {/* Hero Section */}
          <div className="mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-2">
              Welcome back, <span className="text-teal-600">{user?.name || 'Admin'}</span> 👋
            </h1>
            <p className="text-slate-600 text-lg">Your PiperSmart dashboard insights at a glance</p>
          </div>

          {/* Quick Stats Grid - Premium Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <PremiumStatCard
              title="Total Users"
              value={dashboardData?.totalUsers || 0}
              icon="👥"
              color={colors.primary}
              subtitle={`${dashboardData?.activeUsers || 0} active`}
              isRefreshing={refreshing}
            />
            <PremiumStatCard
              title="Total Analyses"
              value={dashboardData?.totalAnalyses || 0}
              icon="📊"
              color={colors.accent}
              subtitle={`${dashboardData?.analysesThisMonth || 0} this month`}
            />
            <PremiumStatCard
              title="Bunga Analyses"
              value={dashboardData?.totalBungaAnalyses || 0}
              icon={logoImage}
              isImageIcon={true}
              color={colors.info}
              subtitle={`${dashboardData?.totalLeafAnalyses || 0} leaf analyses`}
            />
            <PremiumStatCard
              title="Verified Users"
              value={dashboardData?.verifiedUsers || 0}
              icon="✓"
              color={colors.success}
              subtitle={`${dashboardData?.unverifiedUsers || 0} pending`}
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
            {/* Large Chart - 2 columns */}
            <PremiumChartCard 
              title="📈 User Growth" 
              className="lg:col-span-2"
              onExpand={() => setFullscreenChart({ type: 'growth', data: userGrowth })}
            >
              {userGrowth.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                    <XAxis dataKey="date" stroke={colors.textLight} />
                    <YAxis stroke={colors.textLight} />
                    <Tooltip contentStyle={{ backgroundColor: colors.secondary, border: `1px solid ${colors.border}` }} />
                    <Line type="monotone" dataKey="users" stroke={colors.primary} strokeWidth={3} dot={{ fill: colors.primary, r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-slate-500 py-24">No data available</p>
              )}
            </PremiumChartCard>

            {/* Right side stacked */}
            <div className="flex flex-col gap-6">
              {/* Analysis Distribution */}
              <PremiumChartCard 
                title="📊 Distribution" 
                onExpand={() => setFullscreenChart({ type: 'distribution', data: analysisDistribution })}
              >
                {analysisDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie
                        data={analysisDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${percentage}%`}
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {analysisDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => value.toLocaleString()} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-slate-500 py-12">No data</p>
                )}
              </PremiumChartCard>

              {/* Top Diseases Mini */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-bold text-slate-900 mb-4">🦠 Top Diseases</h3>
                <div className="space-y-2">
                  {topDiseases.slice(0, 3).map((disease, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2">
                      <span className="text-sm text-slate-600">#{disease.rank} {disease.disease}</span>
                      <span className="font-bold text-teal-600 text-sm">{disease.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Activity & User Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            {/* Weekly Activity */}
            <PremiumChartCard 
              title="📅 Weekly Activity" 
              onExpand={() => setFullscreenChart({ type: 'weekly', data: weeklyActivity })}
            >
              {weeklyActivity.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyActivity}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                    <XAxis dataKey="date" stroke={colors.textLight} />
                    <YAxis stroke={colors.textLight} />
                    <Tooltip contentStyle={{ backgroundColor: colors.secondary, border: `1px solid ${colors.border}` }} />
                    <Legend />
                    <Bar dataKey="bunga" fill={colors.primary} radius={[8, 8, 0, 0]} />
                    <Bar dataKey="leaf" fill={colors.info} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-slate-500 py-20">No data available</p>
              )}
            </PremiumChartCard>

            {/* User Overview */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-bold text-slate-900 mb-6">👥 User Metrics</h3>
              <div className="space-y-4">
                <OverviewItemPremium label="Active Today" value={userOverview?.activeToday || 0} color={colors.success} />
                <OverviewItemPremium label="New This Week" value={userOverview?.newThisWeek || 0} color={colors.info} />
                <OverviewItemPremium label="Inactive (30d)" value={userOverview?.inactive || 0} color={colors.warning} />
                <OverviewItemPremium label="Verified" value={userOverview?.verified || 0} color={colors.success} />
                <OverviewItemPremium label="Unverified" value={userOverview?.unverified || 0} color={colors.danger} />
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition-shadow mb-12">
            <h3 className="text-lg font-bold text-slate-900 mb-6">🔔 Recent Activity</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-hide">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => {
                  const isBungaActivity = activity.title?.toLowerCase().includes('bunga') || activity.description?.toLowerCase().includes('bunga');
                  return (
                    <div key={index} className="flex gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition">
                      {isBungaActivity ? (
                        <img src={logoImage} alt="Bunga" className="h-8 w-8 object-contain flex-shrink-0" />
                      ) : (
                        <div className="text-2xl flex-shrink-0">{activity.icon}</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-900 text-sm">{activity.title}</div>
                        <div className="text-slate-600 text-xs mt-1">{activity.description}</div>
                        <div className="text-slate-400 text-xs mt-2">
                          {new Date(activity.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-slate-500 py-12">No recent activity</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <PremiumAction 
              label="Refresh Dashboard" 
              icon="🔄" 
              onClick={handleRefresh} 
              color={colors.primary}
              disabled={refreshing}
            />
            <PremiumAction 
              label="View All Users" 
              icon="👥" 
              onClick={() => navigate('/admin/profile')} 
              color={colors.primary}
            />
            <PremiumAction 
              label="View Reports" 
              icon="📊" 
              onClick={() => navigate('/admin/reports')} 
              color={colors.accent}
            />
            <PremiumAction 
              label="System Health" 
              icon="⚙️" 
              onClick={() => {}} 
              color={colors.info}
            />
          </div>
        </div>
      </main>

      {/* Fullscreen Chart Modal */}
      {fullscreenChart && (
        <FullscreenChartModal 
          chart={fullscreenChart} 
          onClose={() => setFullscreenChart(null)}
          colors={colors}
          chartColors={chartColors}
        />
      )}

      <AdminFooter />

      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

// Premium Helper Components
const PremiumStatCard = ({ title, value, icon, color, subtitle, isRefreshing, isImageIcon }) => (
  <div className="relative group bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-lg hover:border-slate-300 transition-all duration-300 overflow-hidden">
    {/* Accent line at top */}
    <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: color }} />
    
    <div className="flex justify-between items-start mb-4">
      {isImageIcon ? (
        <img src={icon} alt={title} className="h-12 w-12 object-contain" />
      ) : (
        <div className="text-4xl">{icon}</div>
      )}
      <div className="text-2xl opacity-10">→</div>
    </div>
    
    <div className="text-slate-600 text-xs font-semibold uppercase tracking-wider mb-2">{title}</div>
    <div className="text-4xl font-bold text-slate-900 mb-2" style={{ color }}>
      {value.toLocaleString()}
    </div>
    {subtitle && (
      <div className="text-sm text-slate-500">{subtitle}</div>
    )}
  </div>
);

const PremiumChartCard = ({ title, children, className = '', onExpand }) => (
  <div className={`bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-lg hover:border-slate-300 transition-all duration-300 ${className}`}>
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      <button
        onClick={onExpand}
        className="p-2 rounded-lg hover:bg-slate-100 transition-colors opacity-60 hover:opacity-100"
        title="Expand"
      >
        ⛶
      </button>
    </div>
    {children}
  </div>
);

const FullscreenChartModal = ({ chart, onClose, colors, chartColors }) => (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
    <div className="bg-white rounded-3xl border border-slate-300 w-full h-full max-w-6xl max-h-full shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
      <div className="flex justify-between items-center p-8 border-b border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900">
          {chart.type === 'growth' && '📈 User Growth (Last 7 Days)'}
          {chart.type === 'distribution' && '📊 Analysis Distribution'}
          {chart.type === 'weekly' && '📅 Weekly Activity'}
        </h2>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-slate-100 rounded-lg transition"
        >
          ✕
        </button>
      </div>
      <div className="flex-1 p-8 overflow-auto">
        {chart.type === 'growth' && (
          <ResponsiveContainer width="100%" height={500}>
            <LineChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
              <XAxis dataKey="date" stroke={colors.textLight} />
              <YAxis stroke={colors.textLight} />
              <Tooltip contentStyle={{ backgroundColor: colors.secondary, border: `1px solid ${colors.border}` }} />
              <Line type="monotone" dataKey="users" stroke={colors.primary} strokeWidth={3} dot={{ fill: colors.primary, r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
        {chart.type === 'distribution' && (
          <ResponsiveContainer width="100%" height={500}>
            <PieChart>
              <Pie
                data={chart.data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} ${percentage}%`}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
              >
                {chart.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => value.toLocaleString()} />
            </PieChart>
          </ResponsiveContainer>
        )}
        {chart.type === 'weekly' && (
          <ResponsiveContainer width="100%" height={500}>
            <BarChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
              <XAxis dataKey="date" stroke={colors.textLight} />
              <YAxis stroke={colors.textLight} />
              <Tooltip contentStyle={{ backgroundColor: colors.secondary, border: `1px solid ${colors.border}` }} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="bunga" fill={colors.primary} radius={[8, 8, 0, 0]} />
              <Bar dataKey="leaf" fill={colors.info} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  </div>
);

const OverviewItemPremium = ({ label, value, color }) => (
  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition">
    <span className="text-slate-700 font-medium text-sm">{label}</span>
    <span className="text-2xl font-bold" style={{ color }}>{value}</span>
  </div>
);

const PremiumAction = ({ label, icon, onClick, color, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`relative group bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm hover:shadow-lg hover:border-slate-300 transition-all duration-300 ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
  >
    {/* Accent line at top */}
    <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ backgroundColor: color }} />
    
    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{icon}</div>
    <div className="font-semibold text-slate-900 text-sm">{label}</div>
  </button>
);

export default AdminDashboard;
