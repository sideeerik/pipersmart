import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import './Forum.css';
import Header from '../shared/Header';
import Chat from '../Chat/Chat';
import UserProfileCard from './UserProfileCard';

const CATEGORIES = [
  { name: 'All', icon: '💬' },
  { name: 'Disease Identification', icon: '🍃' },
  { name: 'Best Practices', icon: '✅' },
  { name: 'Regional Tips', icon: '🌍' },
  { name: 'Equipment & Tools', icon: '🔧' },
  { name: 'Success Stories', icon: '🏆' }
];

export default function Forum() {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [draftCount, setDraftCount] = useState(0);
  const [composerText, setComposerText] = useState('');
  const [composerImages, setComposerImages] = useState([]);
  const [activeTab, setActiveTab] = useState('feed');
  const [filterType, setFilterType] = useState('all');
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportingThreadId, setReportingThreadId] = useState(null);
  const [submittingReport, setSubmittingReport] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [friends, setFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]); // Track sent friend requests

  // suggestion modal state
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [previewUser, setPreviewUser] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [modalScale, setModalScale] = useState(1);
  const modalRef = useRef(null);

  // when modal is open prevent background scrolling
  useEffect(() => {
    if (showSuggestionModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showSuggestionModal]);

  const closeSuggestionModal = () => {
    setShowSuggestionModal(false);
    setSelectedSuggestion(null);
    setPreviewUser(null);
    setModalScale(1);
  };

  const observerTarget = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const chatRef = useRef(null);
  const currentUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    setPage(1);
    fetchThreads(1, true);
    fetchDraftCount();
    fetchFriends();
    fetchSuggestions();
    fetchSentFriendRequests();
  }, [activeCategory, activeTab, filterType, isLoggedIn]);

  const fetchFriends = async () => {
    try {
      setLoadingFriends(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/users/friends`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFriends(response.data?.data || []);
    } catch (error) {
      console.error('Error fetching friends:', error);
      setFriends([]);
    } finally {
      setLoadingFriends(false);
    }
  };

  const fetchSuggestions = async () => {
    try {
      setLoadingSuggestions(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/users/suggestions`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      let list = response.data?.data || [];
      // just in case backend returned the current user, filter locally too
      if (currentUser) {
        list = list.filter(u => u._id !== currentUser._id);
      }
      setSuggestions(list);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const fetchSentFriendRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/users/sent-friend-requests`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPendingRequests(response.data?.data || []);
      console.log('✅ Loaded sent friend requests:', response.data?.data);
    } catch (error) {
      console.error('Error fetching sent friend requests:', error);
      setPendingRequests([]);
    }
  };

  const handleAddFriend = async (userId) => {
    try {
      // Debug: ensure userId is a clean string
      const cleanUserId = typeof userId === 'string' ? userId : userId?.toString?.();
      console.log('Adding friend, userId:', cleanUserId, 'type:', typeof cleanUserId);
      
      const token = localStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/users/friend-request/${cleanUserId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Friend request sent!');
      // Add to pending requests (dedupe) and keep suggestion visible
      setPendingRequests(prev => (prev.includes(cleanUserId) ? prev : [...prev, cleanUserId]));
      if (previewUser && previewUser._id === cleanUserId) {
        setPreviewUser(prev => ({ ...prev })); // trigger rerender if needed
      }
    } catch (error) {
      console.error('❌ Error adding friend:', error);
      console.error('Error response:', error.response?.data);
      alert(error.response?.data?.message || error.message || 'Failed to send friend request');
    }
  };

  const handleCancelFriendRequest = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/users/friend-request/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Friend request cancelled');
      setPendingRequests(prev => prev.filter(id => id !== userId));
    } catch (error) {
      console.error('Error cancelling friend request:', error);
      alert(error.response?.data?.message || 'Failed to cancel friend request');
    }
  };

  const handleFriendClick = (friend) => {
    // Open chat with this friend
    if (chatRef.current) {
      chatRef.current.openChatWithFriend(friend);
    }
  };

  const fetchPreviewUser = async (userId) => {
    if (!userId) return;
    setPreviewLoading(true);
    setPreviewUser(null);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && res.data.user) {
        setPreviewUser(res.data.user);
      }
    } catch (err) {
      console.error('Error fetching preview user', err);
      setPreviewUser(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  useEffect(() => {
    if (!showSuggestionModal || !modalRef.current) return;
    // compute scale based on actual content height (scrollHeight) so the
    // popup can shrink to avoid producing a scrollbar
    const adjustScale = () => {
        if (!modalRef.current) return;
        // use scrollHeight in case we previously had a max-height/overflow
        // constraint; this ensures we measure the full natural height.
        const el = modalRef.current;
        const height = Math.max(el.offsetHeight, el.scrollHeight);
        const max = window.innerHeight * 0.9;
        let scale = 1;
        if (height > max) {
          scale = max / height;
        }
        setModalScale(scale);
      };
    adjustScale();
    window.addEventListener('resize', adjustScale);
    let resizeObserver;
    if (window.ResizeObserver) {
      resizeObserver = new ResizeObserver(() => adjustScale());
      resizeObserver.observe(modalRef.current);
    }
    return () => {
      window.removeEventListener('resize', adjustScale);
      if (resizeObserver && modalRef.current) resizeObserver.unobserve(modalRef.current);
    };
  }, [showSuggestionModal, previewUser]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading]);

  useEffect(() => {
    if (page > 1) {
      fetchThreads(page, false);
    }
  }, [page]);

  const fetchThreads = async (pageNum = 1, reset = true) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      let url = `${import.meta.env.VITE_BACKEND_URL}/api/v1/forum/threads`;
      let params = {
        page: pageNum,
        limit: 10,
        ...(activeCategory !== 'All' && { category: activeCategory })
      };

      if (activeTab === 'feed') {
        url = `${import.meta.env.VITE_BACKEND_URL}/api/v1/forum/feed`;
        params = { filterType };
      } else if (activeTab === 'interested') {
        url = `${import.meta.env.VITE_BACKEND_URL}/api/v1/forum/threads/interested/all`;
        params = { page: pageNum, limit: 10 };
      } else if (activeTab === 'uninterested') {
        url = `${import.meta.env.VITE_BACKEND_URL}/api/v1/forum/threads/uninterested/all`;
        params = { page: pageNum, limit: 10 };
      } else if (activeTab === 'saved') {
        url = `${import.meta.env.VITE_BACKEND_URL}/api/v1/forum/saved-threads`;
        params = { page: pageNum, limit: 10 };
      }

      const response = await axios.get(url, {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });

      let newThreads = response.data?.data || [];
      
      if (activeTab === 'saved' || activeTab === 'interested' || activeTab === 'uninterested') {
        newThreads = newThreads.map(item => item.threadId || item).filter(Boolean);
      }

      const totalPages = response.data?.pagination?.pages || 1;

      if (reset) {
        setThreads(newThreads);
      } else {
        setThreads(prev => [...prev, ...newThreads]);
      }

      setHasMore(pageNum < totalPages);
    } catch (error) {
      console.error('Error fetching threads:', error);
      if (page === 1) setThreads([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDraftCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/forum/threads/drafts/my-drafts`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDraftCount(response.data?.count || 0);
    } catch (error) {
      console.error('Error fetching drafts:', error);
    }
  };

  const handleLikeThread = async (threadId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/forum/threads/${threadId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchThreads(1, true);
    } catch (error) {
      console.error('Error liking thread:', error);
    }
  };

  const handleMarkInterested = async (threadId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/forum/threads/${threadId}/interested`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchThreads(1, true);
    } catch (error) {
      console.error('Error marking thread as interested:', error);
    }
  };

  const handleMarkUninterested = async (threadId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/forum/threads/${threadId}/uninterested`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchThreads(1, true);
    } catch (error) {
      console.error('Error marking thread as uninterested:', error);
    }
  };

  const handleSaveThread = async (threadId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/forum/threads/${threadId}/save`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.isSaved) {
        alert('✅ Thread saved!');
      } else {
        alert('🔖 Thread removed from saved');
      }
    } catch (error) {
      console.error('Error saving thread:', error);
      alert('Failed to save thread');
    }
  };

  const handleReportThread = async () => {
    if (!reportReason.trim()) {
      alert('Please provide a reason for the report');
      return;
    }
    
    try {
      setSubmittingReport(true);
      const token = localStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/forum/threads/${reportingThreadId}/report`,
        { reason: reportReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('✅ Report submitted. Thank you for keeping our community safe!');
      setReportModalOpen(false);
      setReportReason('');
      setReportingThreadId(null);
    } catch (error) {
      console.error('Error reporting thread:', error);
      alert(error.response?.data?.message || 'Failed to submit report');
    } finally {
      setSubmittingReport(false);
    }
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setPage(1);
  };

  const handleComposerImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setComposerImages(prev => [...prev, ...newImages]);
  };

  const removeComposerImage = (index) => {
    setComposerImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreatePost = () => {
    if (!composerText.trim() && composerImages.length === 0) {
      alert('Please add text or images');
      return;
    }
    navigate('/forum/create', { state: { initialText: composerText, initialImages: composerImages } });
  };

  if (!isLoggedIn) {
  return (
    <>
      <Header />
      <div className="forum-container fb-layout">
        {/* Floating leaf icons background */}
        <div className="forum-floating-icons">
          <motion.div 
            className="forum-floating-icon icon-1"
            animate={{ y: [0, -15, 0], rotate: [0, 15, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z"/>
            </svg>
          </motion.div>
          <motion.div 
            className="forum-floating-icon icon-2"
            animate={{ y: [0, 12, 0], rotate: [0, -12, 12, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12c0 1.33.26 2.61.74 3.77l-1.89.66c-.6-1.41-.85-2.93-.85-4.43 0-4.97 4.03-9 9-9s9 4.03 9 9c0 1.5-.25 3.02-.85 4.43l-1.89-.66c.48-1.16.74-2.44.74-3.77 0-5.52-4.48-10-10-10z"/>
            </svg>
          </motion.div>
          <motion.div 
            className="forum-floating-icon icon-3"
            animate={{ y: [0, -10, 0], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 22c4-4 8-7.5 8-12 0-3.5-2.5-6-6-6s-6 2.5-6 6c0 4.5 4 8 8 12z"/>
            </svg>
          </motion.div>
          <motion.div 
            className="forum-floating-icon icon-4"
            animate={{ y: [0, -18, 0], rotate: [0, 8, -8, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z"/>
            </svg>
          </motion.div>
          <motion.div 
            className="forum-floating-icon icon-5"
            animate={{ y: [0, 14, 0], rotate: [0, -15, 15, 0] }}
            transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12c0 1.33.26 2.61.74 3.77l-1.89.66c-.6-1.41-.85-2.93-.85-4.43 0-4.97 4.03-9 9-9s9 4.03 9 9c0 1.5-.25 3.02-.85 4.43l-1.89-.66c.48-1.16.74-2.44.74-3.77 0-5.52-4.48-10-10-10z"/>
            </svg>
          </motion.div>
          <motion.div 
            className="forum-floating-icon icon-6"
            animate={{ y: [0, -12, 0], rotate: [0, 12, -12, 0] }}
            transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 22c4-4 8-7.5 8-12 0-3.5-2.5-6-6-6s-6 2.5-6 6c0 4.5 4 8 8 12z"/>
            </svg>
          </motion.div>
        </div>

        <div className="fb-main-wrapper">
            <div className="fb-feed-center">
              <div className="login-required-message">
                <div className="login-icon">🔐</div>
                <h2>Login Required</h2>
                <p>Please log in to view and participate in the forum discussions.</p>
                <button 
                  className="login-btn"
                  onClick={() => navigate('/login')}
                >
                  Log In
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="forum-container fb-layout">
        <div className="fb-main-wrapper">
          <div className="fb-sidebar-left">
            <div className="filter-section">
              <label>Show:</label>
              <div className="filter-buttons">
                <button
                  className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
                  onClick={() => setFilterType('all')}
                >
                  All Users
                </button>
                <button
                  className={`filter-btn ${filterType === 'friends' ? 'active' : ''}`}
                  onClick={() => setFilterType('friends')}
                >
                  Friends Only
                </button>
              </div>
            </div>

            <div className="forum-tabs">
              <button
                className={`tab-btn ${activeTab === 'feed' ? 'active' : ''}`}
                onClick={() => setActiveTab('feed')}
              >
                📰 Feed
              </button>
              <button
                className={`tab-btn ${activeTab === 'interested' ? 'active' : ''}`}
                onClick={() => setActiveTab('interested')}
              >
                ❤️ Interested
              </button>
              <button
                className={`tab-btn ${activeTab === 'uninterested' ? 'active' : ''}`}
                onClick={() => setActiveTab('uninterested')}
              >
                👎 Not Interested
              </button>
              <button
                className={`tab-btn ${activeTab === 'saved' ? 'active' : ''}`}
                onClick={() => setActiveTab('saved')}
              >
                🔖 Saved
              </button>
            </div>

            <div className="categories-list">
              <h3 className="sidebar-title">Categories</h3>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.name}
                  className={`category-item ${activeCategory === cat.name ? 'active' : ''}`}
                  onClick={() => handleCategoryChange(cat.name)}
                >
                  <span className="cat-icon">{cat.icon}</span>
                  <span className="cat-name">{cat.name}</span>
                </button>
              ))}
            </div>

            {draftCount > 0 && (
              <div className="drafts-section">
                <Link to="/forum/drafts" className="drafts-link">
                  📝 My Drafts ({draftCount})
                </Link>
              </div>
            )}
          </div>

          <div className="fb-feed-center">
            <button
              className="create-post-btn"
              onClick={() => navigate('/forum/create')}
            >
              ✏️ Create New Post
            </button>

            <div className="threads-feed">
              {loading && page === 1 ? (
                <div className="loading-spinner">Loading discussions...</div>
              ) : threads.length === 0 && page === 1 ? (
                <div className="no-threads-message">
                  <p>No discussions yet. Be the first to start one!</p>
                </div>
              ) : (
                threads.map((thread) => (
                  <div key={thread._id} className="thread-card fb-post">
                    <div className="post-header">
                      <div className="author-section">
                        <div className="author-avatar-fb">
                          {thread.createdBy?.avatar?.url ? (
                            <img 
                              src={thread.createdBy.avatar.url} 
                              alt={`${thread.createdBy.name}'s profile`}
                              className="author-profile-img"
                            />
                          ) : (
                            thread.createdBy?.name?.charAt(0).toUpperCase() || 'U'
                          )}
                        </div>
                        <div className="author-info">
                          <p className="author-name-fb">
                            {thread.createdBy?.name || 'Unknown'}
                          </p>
                          <div className="post-meta">
                            <span className="post-time">
                              {new Date(thread.createdAt).toLocaleDateString()}
                            </span>
                            <span className="category-badge-inline">
                              {thread.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="post-content-wrapper">
                      <Link to={`/forum/thread/${thread._id}`} className="post-title-link">
                        <h2 className="post-title">{thread.title}</h2>
                      </Link>
                      <p className="post-body">{thread.description}</p>

                      {thread.images && thread.images.length > 0 && (
                        <div className="post-images-fb">
                          {thread.images.slice(0, 4).map((image, index) => (
                            <Link
                              key={index}
                              to={`/forum/thread/${thread._id}`}
                              className="post-image-wrapper"
                            >
                              <img src={image.url} alt={`Image ${index + 1}`} />
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="post-stats-fb">
                      <span>👍 {thread.likesCount}</span>
                      <span>💬 {thread.repliesCount}</span>
                      <span>👁️ {thread.views}</span>
                    </div>

                    <div className="post-actions-fb">
                      <button
                        className="post-action-link"
                        onClick={() => handleLikeThread(thread._id)}
                      >
                        👍 Like
                      </button>
                      <button
                        className="post-action-link"
                        onClick={() => handleMarkInterested(thread._id)}
                        title="Mark as interested"
                      >
                        ❤️ Interested
                      </button>
                      <button
                        className="post-action-link"
                        onClick={() => handleMarkUninterested(thread._id)}
                        title="Mark as not interested"
                      >
                        👎 Not Interested
                      </button>
                      <Link
                        to={`/forum/thread/${thread._id}`}
                        className="post-action-link"
                      >
                        💬 Reply
                      </Link>
                      <button
                        className="post-action-link"
                        onClick={() => handleSaveThread(thread._id)}
                        title="Save thread"
                      >
                        🔖 Save
                      </button>
                      <button
                        className="post-action-link"
                        onClick={() => {
                          setReportingThreadId(thread._id);
                          setReportModalOpen(true);
                        }}
                        title="Report thread"
                      >
                        🚩 Report
                      </button>
                    </div>
                  </div>
                ))
              )}

              {hasMore && threads.length > 0 && (
                <div ref={observerTarget} className="scroll-trigger">
                  {loading && page > 1 && <div className="loading-spinner">Loading more...</div>}
                </div>
              )}
            </div>
          </div>

          <div className="fb-sidebar-right">
            {/* Friends Section */}
            <div className="friends-section">
              <h3 className="sidebar-title">👥 Friends</h3>
              {loadingFriends ? (
                <div className="friends-loading">Loading friends...</div>
              ) : friends.length > 0 ? (
                <div className="friends-list">
                  {friends.map((friend) => (
                    <div
                      key={friend._id}
                      className="friend-item"
                      onClick={() => handleFriendClick(friend)}
                      style={{ cursor: 'pointer' }}
                      title="Click to open chat"
                    >
                      <div className="friend-avatar">
                        {friend.avatar?.url ? (
                          <img src={friend.avatar.url} alt={friend.name} />
                        ) : (
                          <span>{friend.name?.charAt(0).toUpperCase() || 'U'}</span>
                        )}
                      </div>
                      <div className="friend-info">
                        <p className="friend-name">{friend.name}</p>
                        <p className="friend-status">{friend.status || 'Online'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-friends-message">
                  <p>No friends yet</p>
                  <span>Add friends to see them here!</span>
                </div>
              )}
            </div>

            {/* Suggestions Section */}
            <div className="suggestions-section">
              <h3 className="sidebar-title">💡 Suggestions</h3>
              {loadingSuggestions ? (
                <div className="friends-loading">Loading suggestions...</div>
              ) : suggestions.length > 0 ? (
                <div className="friends-list">
                  {suggestions.map((user) => (
                    <div key={user._id} className="suggestion-item">
                      <div
                        className="friend-item"
                        onClick={() => {
                          // don't preview yourself; go to profile page instead
                          if (currentUser && user._id === currentUser._id) {
                            navigate('/profile');
                            return;
                          }
                          setSelectedSuggestion(user);
                          setShowSuggestionModal(true);
                          fetchPreviewUser(user._id);
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="friend-avatar">
                          {user.avatar?.url ? (
                            <img src={user.avatar.url} alt={user.name} />
                          ) : (
                            <span>{user.name?.charAt(0).toUpperCase() || 'U'}</span>
                          )}
                        </div>
                        <div className="friend-info">
                          <p className="friend-name">{user.name}</p>
                          <p className="friend-status">{user.mutualFriends || 0} mutual friends</p>
                        </div>
                      </div>
                      {pendingRequests.includes(user._id) ? (
                        <button
                          className="cancel-friend-btn"
                          onClick={() => handleCancelFriendRequest(user._id)}
                          title="Cancel friend request"
                        >
                          ✕
                        </button>
                      ) : (
                        <button
                          className="add-friend-btn"
                          onClick={() => handleAddFriend(user._id)}
                          title="Add friend"
                        >
                          ➕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-friends-message">
                  <p>No suggestions</p>
                  <span>Check back later!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Chat Widget */}
      <Chat ref={chatRef} />

      {reportModalOpen && (
        <div className="modal-overlay" onClick={() => setReportModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setReportModalOpen(false)}
            >
              ✕
            </button>
            <div className="modal-header">
              <h3>🚩 Report Thread</h3>
            </div>
            <div className="modal-body">
              <p>Help us keep our community safe. Please describe why you're reporting this thread.</p>
              <textarea
                className="report-textarea"
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Describe the issue (e.g., inappropriate content, spam, harassment)..."
                rows={5}
              />
            </div>
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setReportModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="btn-confirm"
                onClick={handleReportThread}
                disabled={submittingReport}
              >
                {submittingReport ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suggestion profile modal */}
      {showSuggestionModal && (
        <div className="modal-overlay" onClick={closeSuggestionModal}>
          <div
            className="modal-content profile-preview-modal"
            onClick={(e) => e.stopPropagation()}
            ref={modalRef}
            style={{ transform: `scale(${modalScale})` }}
          >
            {/* close button inside modal - always on top */}
            <button
              className="modal-close"
              onClick={(e) => {
                e.stopPropagation();
                closeSuggestionModal();
              }}
              title="Close"
              type="button"
            >
              ✕
            </button>

            {previewLoading ? (
              <div style={{ padding: '16px' }}>Loading profile...</div>
            ) : (
              previewUser && (
                <UserProfileCard
                  user={previewUser}
                  currentUser={currentUser}
                  pendingRequests={pendingRequests}
                  onAddFriend={handleAddFriend}
                  onCancelFriend={handleCancelFriendRequest}
                />
              )
            )}
          </div>
        </div>
      )}
    </>  );
}
