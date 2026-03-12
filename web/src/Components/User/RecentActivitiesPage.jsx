import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FiActivity,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiChevronUp,
  FiMapPin,
  FiMessageCircle,
} from 'react-icons/fi';
import {
  MdEco,
  MdClose,
  MdDelete,
  MdDownload,
  MdFilterList,
  MdPictureAsPdf,
  MdSort,
  MdDescription,
} from 'react-icons/md';
import Header from '../shared/Header';
import Footer from '../shared/Footer';
import './RecentActivitiesPage.css';
import mainBg from '../../../media/Main BG.jpg';

const bungaLogo = '/logowalangbg.png';

const COLORS = {
  primary: '#1A5F52',
  primaryDark: '#0F3B32',
  primaryLight: '#E6F1EA',
  secondary: '#FFFFFF',
  background: '#F5F2EA',
  text: '#153B34',
  textLight: '#4F6B63',
  border: '#D7E4DD',
  accent: '#8B6F47',
  warning: '#D4A574',
  danger: '#E74C3C',
  success: '#556B2F',
  cardBg: '#FFFFFF',
};

const ITEMS_PER_PAGE = 10;

const RecentActivitiesPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalActivities, setTotalActivities] = useState(0);
  const [filterSort, setFilterSort] = useState('newest');
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  const [activityFilter, setActivityFilter] = useState('all');
  const [filterExpanded, setFilterExpanded] = useState(false);
  const [exportMenuVisible, setExportMenuVisible] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportNotes, setExportNotes] = useState('');
  const lastFetchRef = useRef(null);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    fetchActivities();
  }, [filterSort, isLoggedIn]);

  useEffect(() => {
    setPage(1);
  }, [activityFilter]);

  const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    } else {
      setIsLoggedIn(false);
    }
  };

  const fetchActivities = async () => {
    const fetchKey = `${filterSort}`;
    if (lastFetchRef.current === fetchKey) return;
    lastFetchRef.current = fetchKey;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoggedIn(false);
        return;
      }

      const firstResponse = await axios.get(
        `${BACKEND_URL}/api/v1/activities/all?page=1&limit=${ITEMS_PER_PAGE}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (firstResponse.data?.success) {
        let allActivities = firstResponse.data.data.activities || [];
        const totalPagesFromApi = firstResponse.data.data.pagination?.totalPages || 1;

        if (totalPagesFromApi > 1) {
          for (let p = 2; p <= totalPagesFromApi; p += 1) {
            const pageResponse = await axios.get(
              `${BACKEND_URL}/api/v1/activities/all?page=${p}&limit=${ITEMS_PER_PAGE}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            if (pageResponse.data?.success) {
              allActivities = allActivities.concat(pageResponse.data.data.activities || []);
            }
          }
        }

        if (filterSort === 'oldest') {
          allActivities = allActivities.slice().reverse();
        }

        setActivities(allActivities);
        setTotalActivities(allActivities.length);
        console.log(`Fetched ${allActivities.length} activities (All Pages)`);
      }
    } catch (error) {
      const status = error?.response?.status;
      if (status === 404) {
        await fetchActivitiesLegacy();
        return;
      }
      console.error('Error fetching activities:', error.message);
      window.alert('Failed to load recent activities');
    } finally {
      setLoading(false);
    }
  };

  const fetchActivitiesLegacy = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoggedIn(false);
        return;
      }

      const currentUserId = user?._id || JSON.parse(localStorage.getItem('user') || '{}')?._id;
      const [leafRes, bungaRes, postsRes, macromapRes] = await Promise.allSettled([
        axios.get(`${BACKEND_URL}/api/v1/predict/leaf-analysis`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${BACKEND_URL}/api/v1/predict/bunga-analysis`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        currentUserId
          ? axios.get(`${BACKEND_URL}/api/v1/forum/posts/user/${currentUserId}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          : Promise.resolve({ data: { data: [] } }),
        axios.get(`${BACKEND_URL}/api/v1/macromap/analyses`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const leafItems = leafRes.status === 'fulfilled' ? (leafRes.value?.data?.data || []) : [];
      const bungaItems = bungaRes.status === 'fulfilled' ? (bungaRes.value?.data?.data || []) : [];
      const postItems = postsRes.status === 'fulfilled' ? (postsRes.value?.data?.data || []) : [];
      const macromapItems = macromapRes.status === 'fulfilled' ? (macromapRes.value?.data?.data || []) : [];

      const mappedLeaf = leafItems.map((item) => ({
        ...item,
        type: 'LEAF_ANALYSIS',
        createdAt: item.createdAt || item.timestamp,
      }));

      const mappedBunga = bungaItems.map((item) => ({
        ...item,
        type: 'BUNGA_ANALYSIS',
        createdAt: item.createdAt || item.timestamp,
      }));

      const mappedPosts = postItems.map((item) => ({
        ...item,
        type: 'FORUM_POST',
        createdAt: item.createdAt || item.timestamp,
      }));

      const mappedLocations = macromapItems.map((item) => ({
        ...item,
        type: 'SAVED_LOCATION',
        createdAt: item.createdAt || item.timestamp,
        farm: {
          name: item.name || item.displayName || 'Saved Location',
          address: item.locationDetails?.address || item.locationDetails?.formattedAddress || '',
          latitude: item.latitude,
          longitude: item.longitude,
        },
      }));

      let combined = [...mappedLeaf, ...mappedBunga, ...mappedPosts, ...mappedLocations];
      combined = combined.sort((a, b) => {
        const aTime = new Date(a.createdAt || a.savedAt || 0).getTime();
        const bTime = new Date(b.createdAt || b.savedAt || 0).getTime();
        return bTime - aTime;
      });

      if (filterSort === 'oldest') {
        combined = combined.slice().reverse();
      }

      setActivities(combined);
      setTotalActivities(combined.length);
    } catch (legacyError) {
      console.error('Error fetching activities (legacy):', legacyError.message);
      window.alert('Failed to load recent activities');
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'BUNGA_ANALYSIS':
        return { isImage: true, image: bungaLogo, color: COLORS.warning, label: 'Peppercorn' };
      case 'LEAF_ANALYSIS':
        return { Icon: MdEco, color: COLORS.success, label: 'Leaf' };
      case 'FORUM_POST':
        return { Icon: FiMessageCircle, color: COLORS.primary, label: 'Forum' };
      case 'SAVED_LOCATION':
        return { Icon: FiMapPin, color: COLORS.danger, label: 'Location' };
      default:
        return { Icon: FiActivity, color: COLORS.textLight, label: 'Activity' };
    }
  };

  const getActivityTitle = (activity) => {
    switch (activity.type) {
      case 'BUNGA_ANALYSIS': {
        const ripenessValue = typeof activity.results?.ripeness === 'object'
          ? activity.results?.ripeness?.grade
          : activity.results?.ripeness;
        return `Peppercorn Analysis: ${ripenessValue || 'Unknown'} (${activity.results?.market_grade || 'N/A'})`;
      }
      case 'LEAF_ANALYSIS':
        return `Leaf Disease: ${activity.results?.disease || 'Unknown'}`;
      case 'FORUM_POST':
        return `Forum Post in "${activity.threadId?.title || 'Unknown Thread'}"`;
      case 'SAVED_LOCATION':
        return `Saved Location: ${activity.farm?.name || 'Unknown'}`;
      default:
        return 'Recent Activity';
    }
  };

  const getActivityDescription = (activity) => {
    switch (activity.type) {
      case 'BUNGA_ANALYSIS': {
        const ripenessValue = typeof activity.results?.ripeness === 'object'
          ? activity.results?.ripeness?.grade
          : activity.results?.ripeness;
        const confidenceValue = typeof activity.results?.confidence === 'number'
          ? activity.results?.confidence
          : (activity.results?.ripeness?.confidence || 0);
        return `Ripeness: ${ripenessValue || 'Unknown'} | Health: ${activity.results?.health_class || 'N/A'} | Confidence: ${confidenceValue}%`;
      }
      case 'LEAF_ANALYSIS':
        return `Disease: ${activity.results?.disease || 'Unknown'} | Confidence: ${activity.results?.confidence || 0}%`;
      case 'FORUM_POST':
        return `Posted in "${activity.threadId?.title || 'Unknown Thread'}"`;
      case 'SAVED_LOCATION': {
        const lat = activity.farm?.latitude;
        const lng = activity.farm?.longitude;
        const coords = (typeof lat === 'number' && typeof lng === 'number')
          ? `${lat.toFixed(4)}, ${lng.toFixed(4)}`
          : 'Coordinates not available';
        return `${activity.farm?.address || 'Location saved'} | ${coords}`;
      }
      default:
        return 'Activity recorded';
    }
  };

  const getActivityTypeChipLabel = (type) => {
    switch (type) {
      case 'BUNGA_ANALYSIS':
        return 'Peppercorn';
      case 'LEAF_ANALYSIS':
        return 'Leaf';
      case 'FORUM_POST':
        return 'Forum';
      case 'SAVED_LOCATION':
        return 'Location';
      default:
        return 'Activity';
    }
  };

  const getFilteredActivities = () => {
    if (activityFilter === 'all') return activities;
    return activities.filter((activity) => activity.type === activityFilter);
  };

  const getActivityDetails = (activity) => {
    switch (activity.type) {
      case 'BUNGA_ANALYSIS': {
        const ripenessValue = typeof activity.results?.ripeness === 'object'
          ? activity.results?.ripeness?.grade || 'Unknown'
          : activity.results?.ripeness || 'Unknown';
        const ripenessPercent = typeof activity.results?.ripeness_percentage === 'number'
          ? activity.results?.ripeness_percentage
          : (activity.results?.ripeness?.percentage || 0);
        const healthPercent = typeof activity.results?.health_percentage === 'number'
          ? activity.results?.health_percentage
          : (activity.results?.health?.percentage || 0);
        const confidenceValue = typeof activity.results?.confidence === 'number'
          ? activity.results?.confidence
          : (activity.results?.ripeness?.confidence || 0);

        return [
          { label: 'Ripeness', value: String(ripenessValue), iconImage: bungaLogo, metric: true },
          { label: 'Ripeness %', value: `${ripenessPercent}%`, icon: 'R', percentage: ripenessPercent },
          { label: 'Health Class', value: String(activity.results?.health_class || 'N/A'), icon: 'H', metric: true },
          { label: 'Health %', value: `${healthPercent}%`, icon: 'HP', percentage: healthPercent },
          { label: 'Confidence', value: `${confidenceValue}%`, icon: 'C', percentage: confidenceValue },
          { label: 'Market Grade', value: String(activity.results?.market_grade || 'Unknown'), icon: 'MG', metric: true },
          { label: 'Scan Image', value: activity.image?.url ? 'View Image' : 'No Image', icon: 'IMG', isImage: true, imageUrl: activity.image?.url },
          { label: 'Processing Time', value: `${activity.processingTime || 0}ms`, icon: 'TIME', metric: true },
        ];
      }
      case 'LEAF_ANALYSIS':
        return [
          { label: 'Disease', value: String(activity.results?.disease || 'Unknown'), icon: 'D', metric: true },
          { label: 'Confidence', value: `${activity.results?.confidence || 0}%`, icon: 'C', percentage: activity.results?.confidence || 0 },
          { label: 'Scan Image', value: activity.image?.url ? 'View Image' : 'No Image', icon: 'IMG', isImage: true, imageUrl: activity.image?.url },
          { label: 'Processing Time', value: `${activity.processingTime || 0}ms`, icon: 'TIME', metric: true },
        ];
      case 'FORUM_POST':
        return [
          { label: 'Thread', value: activity.threadId?.title || 'Unknown', icon: 'T', metric: true },
          { label: 'Content', value: `${activity.content?.substring(0, 50) || ''}${activity.content?.length > 50 ? '...' : ''}`, icon: 'C' },
          { label: 'Category', value: activity.threadId?.category || 'General', icon: 'CAT' },
          { label: 'Replies', value: String(activity.threadId?.interactionCount || '0'), icon: 'R' },
        ];
      case 'SAVED_LOCATION':
        return [
          { label: 'Location Name', value: activity.farm?.name || 'N/A', icon: 'N', metric: true },
          { label: 'Address', value: activity.farm?.address || 'N/A', icon: 'A' },
          {
            label: 'Coordinates',
            value: `${activity.farm?.latitude?.toFixed(4) || 'N/A'}, ${activity.farm?.longitude?.toFixed(4) || 'N/A'}`,
            icon: 'GPS',
          },
        ];
      default:
        return [];
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getExportFilterLabel = () => {
    if (activityFilter === 'all') return 'All Activities';
    if (activityFilter === 'BUNGA_ANALYSIS') return 'Peppercorn Analysis';
    if (activityFilter === 'LEAF_ANALYSIS') return 'Leaf Analysis';
    if (activityFilter === 'FORUM_POST') return 'Forum Posts';
    if (activityFilter === 'SAVED_LOCATION') return 'Saved Locations';
    return 'All Activities';
  };

  const getFilterBadgeLabel = () => {
    if (activityFilter === 'all') return 'All';
    if (activityFilter === 'BUNGA_ANALYSIS') return 'Peppercorn Analysis';
    if (activityFilter === 'LEAF_ANALYSIS') return 'Leaf Analysis';
    if (activityFilter === 'FORUM_POST') return 'Forum Posts';
    if (activityFilter === 'SAVED_LOCATION') return 'Saved Locations';
    return 'All';
  };

  const handleActivityPress = (activity) => {
    const shouldProceed = window.confirm('Navigate to the details of this activity?');
    if (!shouldProceed) return;

    switch (activity.type) {
      case 'SAVED_LOCATION':
        navigate('/macro-mapping');
        break;
      case 'FORUM_POST':
        if (activity.threadId?._id) {
          navigate(`/forum/thread/${activity.threadId?._id}`);
        } else {
          navigate('/forum');
        }
        break;
      case 'BUNGA_ANALYSIS':
        navigate('/bunga-analysis');
        break;
      case 'LEAF_ANALYSIS':
        navigate('/leaf-analysis');
        break;
      default:
        break;
    }
  };

  const handleDeleteActivity = async (activity) => {
    const activityType = activity.type === 'BUNGA_ANALYSIS' ? 'peppercorn' : 'leaf';
    const ok = window.confirm(
      `Are you sure you want to delete this ${activityType} analysis? This action cannot be undone.`
    );
    if (!ok) return;

    try {
      setActivities((prev) => prev.filter((item) => item._id !== activity._id));
      const token = localStorage.getItem('token');
      const endpoints = activity.type === 'BUNGA_ANALYSIS'
        ? [`/api/v1/predict/bunga-analysis/${activity._id}`, `/api/v1/predict/bunga/${activity._id}`]
        : [`/api/v1/predict/leaf-analysis/${activity._id}`, `/api/v1/predict/leaf/${activity._id}`];

      let deleted = false;
      for (const endpoint of endpoints) {
        try {
          const response = await axios.delete(
            `${BACKEND_URL}${endpoint}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (response.data?.success !== false) {
            deleted = true;
            break;
          }
        } catch (deleteError) {
          if (deleteError?.response?.status !== 404) {
            throw deleteError;
          }
        }
      }

      if (deleted) {
        console.log(`${activityType} analysis deleted`);
      }
    } catch (error) {
      console.error(`Error deleting ${activityType} analysis:`, error.message);
      const errorMsg = error.response?.data?.error || 'Failed to delete analysis record';
      window.alert(errorMsg);
      fetchActivities();
    }
  };

  const exportActivities = async (format = 'pdf') => {
    setExporting(true);
    setExportMenuVisible(false);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No auth token found');

      const queryParams = new URLSearchParams();
      if (filterSort) queryParams.append('sort', filterSort);
      if (activityFilter !== 'all') queryParams.append('types', activityFilter);
      if (exportNotes.trim()) queryParams.append('notes', exportNotes.trim());

      const queryString = queryParams.toString();
      const endpoint = `${BACKEND_URL}/api/v1/export/${format}${queryString ? `?${queryString}` : ''}`;

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });

      const extension = format === 'pdf' ? 'pdf' : 'doc';
      const fileName = `PiperSmart_Activities_${new Date().toISOString().split('T')[0]}.${extension}`;
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      window.alert(`${format.toUpperCase()} exported successfully.`);
    } catch (error) {
      const status = error?.response?.status;
      if (status === 404) {
        window.alert('Export is not available on this server.');
      } else {
        console.error(`Export error (${format}):`, error);
        window.alert('Export failed. Please try again.');
      }
    } finally {
      setExporting(false);
    }
  };

  const filteredActivities = useMemo(() => getFilteredActivities(), [activities, activityFilter]);
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredActivities.length / ITEMS_PER_PAGE)),
    [filteredActivities.length]
  );
  const pagedActivities = useMemo(
    () => filteredActivities.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE),
    [filteredActivities, page]
  );

  const pageCounts = useMemo(
    () => ({
      bunga: activities.filter((item) => item.type === 'BUNGA_ANALYSIS').length,
      leaf: activities.filter((item) => item.type === 'LEAF_ANALYSIS').length,
      other: activities.filter((item) => item.type === 'FORUM_POST' || item.type === 'SAVED_LOCATION').length,
    }),
    [activities]
  );

  if (!isLoggedIn || !user) {
    return (
      <div className="page-wrapper">
        <Header />
        <div className="recent-activities-page-container">
          <div className="unauthorized-message">
            <p>Please log in to view your recent activities.</p>
            <Link to="/login" className="btn-login-link">Go to Login</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page-wrapper recent-activities-page">
      <div className="page-background">
        <img src={mainBg} alt="Background" className="background-image" />
        <div className="background-overlay"></div>
      </div>

      <Header />
      <div className="recent-activities-page-container">
        <div className="activities-page-content">
          <div className="hero-card">
            <div className="hero-glow hero-glow-top" />
            <div className="hero-glow hero-glow-bottom" />
            <div className="hero-eyebrow">PiperSmart Feed</div>
            <h1 className="hero-title">Recent Activities</h1>
            <p className="hero-subtitle">
              {totalActivities} activities | page {page} of {totalPages}
            </p>

            <div className="hero-stats-row">
              <div className="hero-stat-card">
                <div className="hero-stat-value">{filteredActivities.length}</div>
                <div className="hero-stat-label">Visible</div>
              </div>
              <div className="hero-stat-card">
                <div className="hero-stat-value">{pageCounts.bunga + pageCounts.leaf}</div>
                <div className="hero-stat-label">Scans</div>
              </div>
              <div className="hero-stat-card">
                <div className="hero-stat-value">{pageCounts.other}</div>
                <div className="hero-stat-label">Community</div>
              </div>
            </div>

            <div className="controls-row">
              <button
                className={`control-button sort-button ${sortMenuVisible ? 'active' : ''}`}
                onClick={() => {
                  setExportMenuVisible(false);
                  setSortMenuVisible(!sortMenuVisible);
                }}
                type="button"
              >
                <MdSort size={18} />
                <span>{filterSort}</span>
              </button>

              <button
                className={`control-button export-button ${exportMenuVisible ? 'active' : ''}`}
                onClick={() => {
                  setSortMenuVisible(false);
                  setExportMenuVisible(!exportMenuVisible);
                }}
                type="button"
                disabled={exporting}
              >
                <MdDownload size={18} />
                <span>{exporting ? 'Exporting...' : 'Export'}</span>
              </button>
            </div>
          </div>

          {sortMenuVisible && (
            <div className="menu-panel sort-menu">
              <button
                className={`menu-option ${filterSort === 'newest' ? 'active' : ''}`}
                onClick={() => {
                  setFilterSort('newest');
                  setPage(1);
                  setSortMenuVisible(false);
                }}
                type="button"
              >
                Newest First
              </button>
              <button
                className={`menu-option ${filterSort === 'oldest' ? 'active' : ''}`}
                onClick={() => {
                  setFilterSort('oldest');
                  setPage(1);
                  setSortMenuVisible(false);
                }}
                type="button"
              >
                Oldest First
              </button>
            </div>
          )}

          {exportMenuVisible && (
            <div className="menu-panel export-menu">
              <div className="export-header">
                <div>
                  <div className="export-title">Export Report</div>
                  <div className="export-subtitle">Current filters for this export</div>
                </div>
                <button
                  className="icon-button"
                  type="button"
                  onClick={() => setExportMenuVisible(false)}
                >
                  <MdClose size={18} />
                </button>
              </div>

              <div className="export-chip-row">
                <div className="export-chip">
                  <MdFilterList size={14} />
                  <span>{getExportFilterLabel()}</span>
                </div>
                <div className="export-chip">
                  <MdSort size={14} />
                  <span>{filterSort === 'newest' ? 'Newest First' : 'Oldest First'}</span>
                </div>
              </div>

              <label className="export-label" htmlFor="exportNotes">Notes (optional)</label>
              <textarea
                id="exportNotes"
                value={exportNotes}
                onChange={(event) => setExportNotes(event.target.value)}
                placeholder="Example: Weekly report for team review"
                maxLength={1000}
                rows={4}
                className="export-notes-input"
              />
              <div className="export-counter">{exportNotes.length}/1000</div>

              <div className="export-action-row">
                <button
                  className="export-action-button danger"
                  onClick={() => exportActivities('pdf')}
                  type="button"
                  disabled={exporting}
                >
                  <MdPictureAsPdf size={18} />
                  <span>{exporting ? 'Exporting...' : 'PDF'}</span>
                </button>
                <button
                  className="export-action-button secondary"
                  onClick={() => exportActivities('word')}
                  type="button"
                  disabled={exporting}
                >
                  <MdDescription size={18} />
                  <span>{exporting ? 'Exporting...' : 'Word'}</span>
                </button>
              </div>
            </div>
          )}

          <div className="filter-header">
            <div className="active-filter-meta">
              <div className="active-filter-chip">
                <MdFilterList size={14} />
                <span>{getExportFilterLabel()}</span>
              </div>
              <div className="active-filter-chip">
                <MdSort size={14} />
                <span>{filterSort === 'newest' ? 'Newest First' : 'Oldest First'}</span>
              </div>
            </div>

            <button
              className="filter-toggle-button"
              onClick={() => setFilterExpanded(!filterExpanded)}
              type="button"
            >
              {filterExpanded ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
              <span>Filters</span>
              <span className="filter-badge">{getFilterBadgeLabel()}</span>
            </button>
          </div>

          {filterExpanded && (
            <div className="filter-panel">
              <button
                className={`filter-option ${activityFilter === 'all' ? 'active' : ''}`}
                onClick={() => {
                  setActivityFilter('all');
                  setPage(1);
                  setFilterExpanded(false);
                }}
                type="button"
              >
                <span className="filter-dot" />
                Show All Activities
              </button>
              <button
                className={`filter-option ${activityFilter === 'BUNGA_ANALYSIS' ? 'active' : ''}`}
                onClick={() => {
                  setActivityFilter('BUNGA_ANALYSIS');
                  setPage(1);
                  setFilterExpanded(false);
                }}
                type="button"
              >
                <span className="filter-dot" />
                Peppercorn Analysis
              </button>
              <button
                className={`filter-option ${activityFilter === 'LEAF_ANALYSIS' ? 'active' : ''}`}
                onClick={() => {
                  setActivityFilter('LEAF_ANALYSIS');
                  setPage(1);
                  setFilterExpanded(false);
                }}
                type="button"
              >
                <span className="filter-dot" />
                Leaf Disease
              </button>
              <button
                className={`filter-option ${activityFilter === 'FORUM_POST' ? 'active' : ''}`}
                onClick={() => {
                  setActivityFilter('FORUM_POST');
                  setPage(1);
                  setFilterExpanded(false);
                }}
                type="button"
              >
                <span className="filter-dot" />
                Forum Posts
              </button>
              <button
                className={`filter-option ${activityFilter === 'SAVED_LOCATION' ? 'active' : ''}`}
                onClick={() => {
                  setActivityFilter('SAVED_LOCATION');
                  setPage(1);
                  setFilterExpanded(false);
                }}
                type="button"
              >
                <span className="filter-dot" />
                Saved Locations
              </button>
            </div>
          )}

          <div className="activities-list">
            {loading && page === 1 ? (
              <div className="loader-container">
                <div className="loader-spinner" />
                <p>Loading activities...</p>
              </div>
            ) : filteredActivities.length > 0 ? (
              <>
                {pagedActivities.map((activity) => (
                  <ActivityCard
                    key={activity._id}
                    activity={activity}
                    getActivityIcon={getActivityIcon}
                    getActivityTitle={getActivityTitle}
                    getActivityDescription={getActivityDescription}
                    getActivityTypeChipLabel={getActivityTypeChipLabel}
                    getActivityDetails={getActivityDetails}
                    formatDate={formatDate}
                    handleDeleteActivity={handleDeleteActivity}
                    onNavigate={handleActivityPress}
                  />
                ))}

                <div className="pagination-container">
                  <button
                    className="pagination-button"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    type="button"
                  >
                    <FiChevronLeft size={18} />
                    Previous
                  </button>

                  <div className="page-indicator">
                    {page} / {totalPages}
                  </div>

                  <button
                    className="pagination-button"
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    type="button"
                  >
                    Next
                    <FiChevronRight size={18} />
                  </button>
                </div>
              </>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">
                  <FiActivity size={48} />
                </div>
                <div className="empty-title">No Activities Yet</div>
                <div className="empty-desc">
                  Your recent activities will appear here. Start by analyzing leaves or saving locations.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

const ActivityCard = ({
  activity,
  getActivityIcon,
  getActivityTitle,
  getActivityDescription,
  getActivityTypeChipLabel,
  getActivityDetails,
  formatDate,
  handleDeleteActivity,
  onNavigate,
}) => {
  const [expanded, setExpanded] = useState(false);
  const iconData = getActivityIcon(activity.type);
  const details = getActivityDetails(activity);
  const Icon = iconData.Icon;

  return (
    <div
      className={`activity-card ${expanded ? 'expanded' : ''}`}
      style={{ '--accent-color': iconData.color }}
      onClick={() => setExpanded(!expanded)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          setExpanded(!expanded);
        }
      }}
    >
      <div className="card-accent" />
      <div className="card-header">
        <div className="icon-container">
          {iconData.isImage ? (
            <img src={iconData.image} alt="" className="activity-image" />
          ) : (
            Icon && <Icon size={26} color={iconData.color} />
          )}
        </div>
        <div className="title-section">
          <div className="activity-title">{getActivityTitle(activity)}</div>
          <div className="activity-time">{formatDate(activity.createdAt || activity.savedAt)}</div>
        </div>
        <div className="header-right">
          <div className="activity-badge">{getActivityTypeChipLabel(activity.type)}</div>
          {expanded ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
        </div>
      </div>
      <div className="description-section">
        <div className="activity-desc">{getActivityDescription(activity)}</div>
      </div>

      {expanded && details.length > 0 && (
        <div className="expanded-details">
          <div className="details-divider" />
          <div className="details-grid">
            {details.map((detail, idx) => (
              <div key={`${detail.label}-${idx}`} className="detail-item">
                <div className="detail-icon">
                  {detail.iconImage ? (
                    <img src={detail.iconImage} alt="" className="detail-icon-image" />
                  ) : (
                    <span>{detail.icon || ''}</span>
                  )}
                </div>
                <div className="detail-content">
                  <div className="detail-label">{detail.label}</div>
                  {detail.percentage !== undefined && (
                    <div className="progress-bar-container">
                      <div
                        className="progress-bar"
                        style={{ width: `${Math.min(detail.percentage, 100)}%` }}
                      />
                    </div>
                  )}
                  {detail.isImage ? (
                    detail.imageUrl ? (
                      <img src={detail.imageUrl} alt={detail.label} className="detail-image" />
                    ) : (
                      <div className="detail-value muted">No image</div>
                    )
                  ) : (
                    <div className="detail-value">{detail.value}</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {(activity.type === 'BUNGA_ANALYSIS' || activity.type === 'LEAF_ANALYSIS') && (
            <div className="actions-container">
              <button
                className="action-button danger"
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  handleDeleteActivity(activity);
                }}
              >
                <MdDelete size={16} />
                Delete
              </button>
              <button
                className="action-button secondary"
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onNavigate(activity);
                }}
              >
                View Details
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecentActivitiesPage;
