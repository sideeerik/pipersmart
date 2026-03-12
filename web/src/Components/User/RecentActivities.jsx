import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './RecentActivities.css';

const RecentActivities = ({ userId, currentUser }) => {
  const [leafAnalyses, setLeafAnalyses] = useState([]);
  const [bungaAnalyses, setBungaAnalyses] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
  const [savedMacromappings, setSavedMacromappings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchActivities();
  }, [userId]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const currentUserId = userId || currentUser?._id;

      // Fetch with individual error handling so one failure doesn't block others
      const [leafRes, bungaRes, postsRes, macromappingRes] = await Promise.allSettled([
        axios.get(`${BACKEND_URL}/api/v1/predict/leaf-analysis`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${BACKEND_URL}/api/v1/predict/bunga-analysis`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${BACKEND_URL}/api/v1/forum/posts/user/${currentUserId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${BACKEND_URL}/api/v1/macromap/analyses`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      // Handle settled promises
      setLeafAnalyses(leafRes.status === 'fulfilled' ? (leafRes.value?.data?.data || []) : []);
      setBungaAnalyses(bungaRes.status === 'fulfilled' ? (bungaRes.value?.data?.data || []) : []);
      setUserPosts(postsRes.status === 'fulfilled' ? (postsRes.value?.data?.data || []) : []);
      setSavedMacromappings(macromappingRes.status === 'fulfilled' ? (macromappingRes.value?.data?.data || []) : []);

      // Debug logging
      console.log('📊 Recent Activities Data:');
      console.log('🌿 Leaf:', leafRes.status === 'fulfilled' ? leafRes.value?.data?.data : 'Failed');
      if (leafRes.status === 'rejected') {
        console.error('❌ Leaf fetch error:', leafRes.reason?.response?.status, leafRes.reason?.response?.data?.message || leafRes.reason?.message);
      }
      console.log('🫒 Bunga:', bungaRes.status === 'fulfilled' ? bungaRes.value?.data?.data : 'Failed');
      if (bungaRes.status === 'rejected') {
        console.error('❌ Bunga fetch error:', bungaRes.reason?.response?.status, bungaRes.reason?.response?.data?.message || bungaRes.reason?.message);
      }
      console.log('📝 Posts:', postsRes.status === 'fulfilled' ? postsRes.value?.data?.data : 'Failed');
      if (postsRes.status === 'rejected') {
        console.error('❌ Posts fetch error:', postsRes.reason?.response?.status, postsRes.reason?.response?.data?.message || postsRes.reason?.message);
      }
      console.log('📍 Macromapping:', macromappingRes.status === 'fulfilled' ? macromappingRes.value?.data?.data : 'Failed');
      if (macromappingRes.status === 'rejected') {
        console.error('❌ Macromapping fetch error:', macromappingRes.reason?.response?.status, macromappingRes.reason?.response?.data?.message || macromappingRes.reason?.message);
      }
      console.log('🔑 Token present:', !!token);
      console.log('🌐 Backend URL:', BACKEND_URL);
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLeafAnalysis = async (id) => {
    if (!window.confirm('Are you sure you want to delete this leaf analysis?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${BACKEND_URL}/api/v1/predict/leaf-analysis/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeafAnalyses(leafAnalyses.filter(a => a._id !== id));
    } catch (err) {
      console.error('Error deleting leaf analysis:', err);
      alert('Failed to delete analysis');
    }
  };

  const handleDeleteBungaAnalysis = async (id) => {
    if (!window.confirm('Are you sure you want to delete this bunga analysis?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${BACKEND_URL}/api/v1/predict/bunga-analysis/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBungaAnalyses(bungaAnalyses.filter(a => a._id !== id));
    } catch (err) {
      console.error('Error deleting bunga analysis:', err);
      alert('Failed to delete analysis');
    }
  };

  const handleDeleteUserPost = async (id) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${BACKEND_URL}/api/v1/forum/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserPosts(userPosts.filter(p => p._id !== id));
    } catch (err) {
      console.error('Error deleting post:', err);
      alert('Failed to delete post');
    }
  };

  const handleDeleteMacromappingLocation = async (id) => {
    if (!window.confirm('Are you sure you want to delete this saved location?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${BACKEND_URL}/api/v1/macromap/analyses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSavedMacromappings(savedMacromappings.filter(m => m._id !== id));
    } catch (err) {
      console.error('Error deleting macromapping location:', err);
      alert('Failed to delete location');
    }
  };

  const handleClearAllHistory = async () => {
    if (!window.confirm('Are you sure you want to delete ALL analyses? This cannot be undone.')) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Delete all leaf analyses
      for (const analysis of leafAnalyses) {
        try {
          await axios.delete(`${BACKEND_URL}/api/v1/predict/leaf-analysis/${analysis._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } catch (err) {
          console.error('Error deleting leaf analysis:', err);
        }
      }

      // Delete all bunga analyses
      for (const analysis of bungaAnalyses) {
        try {
          await axios.delete(`${BACKEND_URL}/api/v1/predict/bunga-analysis/${analysis._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } catch (err) {
          console.error('Error deleting bunga analysis:', err);
        }
      }

      setLeafAnalyses([]);
      setBungaAnalyses([]);
      alert('All history cleared successfully');
    } catch (err) {
      console.error('Error clearing history:', err);
      alert('Failed to clear history completely');
    } finally {
      setLoading(false);
    }
  };

  const filteredLeafAnalyses = leafAnalyses || [];
  const filteredBungaAnalyses = bungaAnalyses || [];
  const filteredUserPosts = userPosts || [];
  const filteredMacromappings = savedMacromappings || [];

  const allActivities = [
    ...filteredLeafAnalyses.map(a => ({ ...a, type: 'leaf', activityType: 'analysis' })),
    ...filteredBungaAnalyses.map(a => ({ ...a, type: 'bunga', activityType: 'analysis' })),
    ...filteredUserPosts.map(p => ({ ...p, type: 'post', activityType: 'post' })),
    ...filteredMacromappings.map(m => ({ ...m, type: 'macromapping', activityType: 'location' }))
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const displayActivities = activeTab === 'all' ? allActivities :
    activeTab === 'leaf' ? filteredLeafAnalyses.map(a => ({ ...a, type: 'leaf', activityType: 'analysis' })) :
    activeTab === 'bunga' ? filteredBungaAnalyses.map(a => ({ ...a, type: 'bunga', activityType: 'analysis' })) :
    activeTab === 'posts' ? filteredUserPosts.map(p => ({ ...p, type: 'post', activityType: 'post' })) :
    activeTab === 'saved' ? filteredMacromappings.map(m => ({ ...m, type: 'macromapping', activityType: 'location' })) :
    allActivities;

  if (loading && displayActivities.length === 0) {
    return (
      <div className="recent-activities-container">
        <div className="loading-state">
          <p>Loading your activities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="recent-activities-container">
      {/* Tabs */}
      <div className="activities-tabs">
        <button
          className={`activity-tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          📊 All Activities ({allActivities.length})
        </button>
        <button
          className={`activity-tab ${activeTab === 'leaf' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaf')}
        >
          🍃 Leaf Analyses ({filteredLeafAnalyses.length})
        </button>
        <button
          className={`activity-tab ${activeTab === 'bunga' ? 'active' : ''}`}
          onClick={() => setActiveTab('bunga')}
        >
          🌶️ Bunga Analyses ({filteredBungaAnalyses.length})
        </button>
        <button
          className={`activity-tab ${activeTab === 'posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          📝 Posts ({filteredUserPosts.length})
        </button>
        <button
          className={`activity-tab ${activeTab === 'saved' ? 'active' : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          📍 Saved Locations ({filteredMacromappings.length})
        </button>
      </div>

      {/* Clear All Button - Only for analyses */}
      {displayActivities.length > 0 && (activeTab === 'all' || activeTab === 'leaf' || activeTab === 'bunga') && (
        <div className="activities-actions">
          <button 
            className="btn-clear-all"
            onClick={handleClearAllHistory}
            disabled={loading}
          >
            🗑️ Clear All History
          </button>
        </div>
      )}

      {/* Activities List */}
      <div className="activities-list">
        {displayActivities.length === 0 ? (
          <div className="empty-state">
            <p>No {activeTab !== 'all' ? activeTab : ''} activities yet</p>
            <small>Start analyzing to build your activity history</small>
          </div>
        ) : (
          displayActivities.map((activity) => (
            <div key={activity._id} className={`activity-item ${activity.type}`}>
              <div className="activity-header">
                <span className="activity-type-badge">
                  {activity.type === 'leaf' ? '🍃 Leaf Analysis' : activity.type === 'bunga' ? '🌶️ Bunga Analysis' : activity.type === 'post' ? '📝 My Post' : '📍 Saved Location'}
                </span>
                <span className="activity-date">
                  {new Date(activity.createdAt).toLocaleDateString()} {new Date(activity.createdAt).toLocaleTimeString()}
                </span>
              </div>

              <div className="activity-content">
                {activity.type === 'leaf' && (
                  <>
                    <div className="activity-details">
                      <div className="detail-row">
                        <span className="detail-label">Disease:</span>
                        <span className="detail-value">{activity.results?.disease || 'N/A'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Confidence:</span>
                        <span className="detail-value">{activity.results?.confidence?.toFixed(2) || 0}%</span>
                      </div>
                    </div>
                    {activity.image && (
                      <div className="activity-images">
                        <div className="activity-images-title">📸 Leaf Image</div>
                        <div className="activity-images-grid">
                          <div className="activity-image-wrapper">
                            <img src={activity.image?.url} alt="Leaf analysis" onError={(e) => e.target.style.display = 'none'} />
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {activity.type === 'bunga' && (
                  <>
                    <div className="activity-details">
                      <div className="detail-row">
                        <span className="detail-label">Ripeness:</span>
                        <span className="detail-value">{activity.results?.ripeness || 'N/A'} ({activity.results?.ripeness_percentage || 0}%)</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Health:</span>
                        <span className="detail-value">{activity.results?.health_class || 'N/A'} ({activity.results?.health_percentage || 0}%)</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Confidence:</span>
                        <span className="detail-value">{activity.results?.confidence?.toFixed(2) || 0}%</span>
                      </div>
                    </div>
                    {activity.image && (
                      <div className="activity-images">
                        <div className="activity-images-title">🫒 Pepper Image</div>
                        <div className="activity-images-grid">
                          <div className="activity-image-wrapper">
                            <img src={activity.image?.url} alt="Bunga analysis" onError={(e) => e.target.style.display = 'none'} />
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {activity.type === 'post' && (
                  <>
                    <div className="activity-details">
                      <div className="detail-row">
                        <span className="detail-label">Thread:</span>
                        <span className="detail-value">{activity.threadId?.title || 'No thread title'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Category:</span>
                        <span className="detail-value">{activity.threadId?.category || 'General'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Content:</span>
                        <span className="detail-value">{activity.content?.substring(0, 50) || 'No content'}...</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Created:</span>
                        <span className="detail-value">{new Date(activity.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {activity.images && activity.images.length > 0 && (
                      <div className="activity-images">
                        <div className="activity-images-title">📷 Posted Images ({activity.images.length})</div>
                        <div className="activity-images-grid">
                          {activity.images.map((img, idx) => (
                            <div key={idx} className="activity-image-wrapper">
                              <img src={img.url} alt={`Post image ${idx + 1}`} onError={(e) => e.target.style.display = 'none'} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {activity.type === 'macromapping' && (
                  <div className="activity-details">
                    <div className="detail-row">
                      <span className="detail-label">Location:</span>
                      <span className="detail-value">{activity.name || 'No name'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Suitability Score:</span>
                      <span className="detail-value">{activity.score || 0}% - {activity.rating?.rating || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Location:</span>
                      <span className="detail-value">{activity.latitude?.toFixed(6)}, {activity.longitude?.toFixed(6)}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="activity-actions">
                <button
                  className="btn-delete-activity"
                  onClick={() => {
                    if (activity.type === 'leaf') handleDeleteLeafAnalysis(activity._id);
                    else if (activity.type === 'bunga') handleDeleteBungaAnalysis(activity._id);
                    else if (activity.type === 'post') handleDeleteUserPost(activity._id);
                    else if (activity.type === 'macromapping') handleDeleteMacromappingLocation(activity._id);
                  }}
                  title={activity.type === 'leaf' || activity.type === 'bunga' ? 'Delete this analysis' : activity.type === 'post' ? 'Delete this post' : 'Delete this location'}
                >
                  🗑️ {activity.type === 'leaf' || activity.type === 'bunga' || activity.type === 'post' ? 'Delete' : 'Remove'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default RecentActivities;
