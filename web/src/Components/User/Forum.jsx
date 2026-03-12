import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { validateContent } from '../utils/contentValidation';
import './Forum.css';
import Header from '../shared/Header';
import Chat from '../Chat/Chat';
import UserProfileCard from './UserProfileCard';

const CATEGORIES = [
  { name: 'All', icon: '💬' },
  { name: 'Disease ID', icon: '🍃' },
  { name: 'Best Practices', icon: '✅' },
  { name: 'Regional Tips', icon: '🌍' },
  { name: 'Equipment', icon: '🔧' },
  { name: 'Success Stories', icon: '🏆' }
];

// Helper function to determine if user is online based on lastOnline
const getOnlineStatus = (lastOnline) => {
  if (!lastOnline) return { isOnline: false, text: 'Offline' };
  
  const lastOnlineDate = new Date(lastOnline);
  const now = new Date();
  const diffMinutes = (now - lastOnlineDate) / (1000 * 60);
  
  // User is online if they were active in the last 5 minutes
  const isOnline = diffMinutes < 5;
  
  if (isOnline) {
    return { isOnline: true, text: 'Active' };
  } else if (diffMinutes < 60) {
    return { isOnline: false, text: `${Math.floor(diffMinutes)}m ago` };
  } else if (diffMinutes < 1440) {
    return { isOnline: false, text: `${Math.floor(diffMinutes / 60)}h ago` };
  } else {
    return { isOnline: false, text: `${Math.floor(diffMinutes / 1440)}d ago` };
  }
};

const formatTimeAgo = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const now = new Date();
  const diffMs = now - date;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) {
    return diffMinutes === 1 ? '1 minute ago' : `${diffMinutes} minutes ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
  }

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) {
    return diffWeeks === 1 ? '1 week ago' : `${diffWeeks} weeks ago`;
  }

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) {
    return diffMonths === 1 ? '1 month ago' : `${diffMonths} months ago`;
  }

  const diffYears = Math.floor(diffDays / 365);
  return diffYears === 1 ? '1 year ago' : `${diffYears} years ago`;
};

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
  const [openMenuThreadId, setOpenMenuThreadId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [friends, setFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    // Read dark mode preference from localStorage on initial load
    const savedTheme = localStorage.getItem('forumDarkTheme');
    return savedTheme === 'true';
  });

  // Save dark mode preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('forumDarkTheme', isDarkTheme.toString());
  }, [isDarkTheme]);

  // Create Post popup state
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostDescription, setNewPostDescription] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('Disease ID');
  const [newPostImages, setNewPostImages] = useState([]);
  const [submittingPost, setSubmittingPost] = useState(false);

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

  useEffect(() => {
    setActiveSearch(searchQuery.trim().length > 0);
  }, [searchQuery]);

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
      // Optimistic UI update: keep user on the same post without reloading
      setThreads(prev =>
        prev.map(thread => {
          if (thread._id !== threadId) return thread;
          const isLiked =
            thread.isLiked ??
            thread.hasLiked ??
            thread.userHasLiked ??
            thread.likedByCurrentUser ??
            thread.currentUserLiked ??
            false;
          const nextLiked = !isLiked;
          const safeLikes = Number(thread.likesCount) || 0;
          return {
            ...thread,
            likesCount: nextLiked ? safeLikes + 1 : Math.max(0, safeLikes - 1),
            isLiked: nextLiked,
          };
        })
      );

      const token = localStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/forum/threads/${threadId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error('Error liking thread:', error);
      // If the request fails, revert by refetching the first page
      fetchThreads(1, true);
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

  // Filter threads based on search query (name and title) - only when search is active
  const filteredThreads = (() => {
    const currentUserId = currentUser?._id || currentUser?.id;
    const base = filterType === 'mine' && currentUserId
      ? threads.filter(thread => {
          const author = thread.createdBy;
          return (
            author?._id === currentUserId ||
            author?.id === currentUserId ||
            thread.userId === currentUserId ||
            thread.createdBy === currentUserId
          );
        })
      : threads;

    if (!activeSearch) return base;

    const searchLower = searchQuery.toLowerCase();
    return base.filter(thread => {
      const titleMatch = thread.title?.toLowerCase().includes(searchLower) || false;
      const nameMatch = thread.createdBy?.name?.toLowerCase().includes(searchLower) || false;
      const contentMatch = thread.description?.toLowerCase().includes(searchLower) || false;
      return titleMatch || nameMatch || contentMatch;
    });
  })();

  // Handle create post from popup
  const handleCreatePostSubmit = async () => {
    if (!newPostTitle.trim() || !newPostDescription.trim()) {
      alert('Please fill in title and description');
      return;
    }

    // Validate content - must be related to black pepper
    const combinedContent = `${newPostTitle} ${newPostDescription}`;
    const validationResult = validateContent(combinedContent);
    
    if (!validationResult.isValid) {
      if (validationResult.severity === 'BLOCK') {
        alert(`❌ ${validationResult.message}`);
        return;
      } else if (validationResult.severity === 'WARNING') {
        const confirm = window.confirm(
          `${validationResult.message}\n\nDo you want to continue anyway?`
        );
        if (!confirm) return;
      }
    }

    try {
      setSubmittingPost(true);
      const token = localStorage.getItem('token');
      
      // Upload images to Cloudinary first
      let uploadedImages = [];
      if (newPostImages.length > 0) {
        try {
          for (const image of newPostImages) {
            const formDataImg = new FormData();
            formDataImg.append('file', image);
            formDataImg.append('upload_preset', 'pipersmart');

            const uploadRes = await axios.post(
              `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
              formDataImg
            );

            if (uploadRes.data?.secure_url) {
              uploadedImages.push({ 
                url: uploadRes.data.secure_url,
                publicId: uploadRes.data.public_id
              });
            }
          }
        } catch (uploadError) {
          console.log('Image upload failed, continuing without images:', uploadError.message);
        }
      }

      // Get user ID
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const userId = user?.id || user?._id;

      // Create the thread with uploaded images
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/forum/threads`,
        {
          title: newPostTitle,
          description: newPostDescription,
          category: newPostCategory,
          images: uploadedImages,
          status: 'published',
          userId: userId
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('✅ Post created successfully!');
      setShowCreatePostModal(false);
      setNewPostTitle('');
      setNewPostDescription('');
      setNewPostCategory('Disease ID');
      setNewPostImages([]);
      fetchThreads(1, true);
    } catch (error) {
      console.error('Error creating post:', error);
      alert(error.response?.data?.message || 'Failed to create post');
    } finally {
      setSubmittingPost(false);
    }
  };

  const handleNewPostImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setNewPostImages(prev => [...prev, ...files]);
  };

  const removeNewPostImage = (index) => {
    setNewPostImages(prev => prev.filter((_, i) => i !== index));
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
            <img src="/search-icon.svg" alt="Search" />
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
      <div className={`forum-container fb-layout ${isDarkTheme ? 'dark-theme' : ''}`}>
        <div className="forum-header">
          <div className="forum-header-text">
            <h1 className="forum-header-title">Welcome to the Piper Community</h1>
            <p className="forum-header-subtitle">
              Share experiences, ask questions, and grow with fellow pepper farmers.
            </p>
          </div>
        </div>
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
                <button
                  className={`filter-btn ${filterType === 'mine' ? 'active' : ''}`}
                  onClick={() => setFilterType('mine')}
                >
                  My Posts
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

            {/* Settings Section */}
            <div className="settings-section">
              <button
                className="theme-toggle-btn"
                onClick={() => setIsDarkTheme(!isDarkTheme)}
                title={isDarkTheme ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDarkTheme ? '☀️ Light Mode' : '🌙 Dark Mode'}
              </button>
            </div>
          </div>

          <div className="fb-feed-center">
            <div className="feed-top-bar">
              <button
                className="create-post-btn-circular"
                onClick={() => setShowCreatePostModal(true)}
                title="Create New Post"
                aria-label="Create New Post"
              >
                <span className="create-post-plus-icon" aria-hidden="true">+</span>
              </button>
              <div className="feed-search-wrapper">
                <input
                  type="text"
                  className="search-input feed-search-input"
                  placeholder="Search by name or title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  className="search-button"
                  onClick={() => setSearchQuery('')}
                  title={activeSearch ? "Clear search" : "Search"}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M15.5 14h-.79l-.28-.27a6 6 0 1 0-.71.71l.27.28v.79L20 20.5 21.5 19 15.5 14zM10 15a5 5 0 1 1 0-10 5 5 0 0 1 0 10z" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="threads-feed">
              {loading && page === 1 ? (
                <div className="loading-spinner">Loading discussions...</div>
              ) : threads.length === 0 && page === 1 ? (
                <div className="no-threads-message">
                  <p>No discussions yet. Be the first to start one!</p>
                </div>
              ) : filteredThreads.length === 0 && activeSearch && searchQuery ? (
                <div className="no-threads-message">
                  <p>No discussions match your search.</p>
                </div>
              ) : (
                filteredThreads.map((thread) => (
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
                              {formatTimeAgo(thread.createdAt)}
                            </span>
                            <span className="category-badge-inline">
                              {thread.category}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="post-menu">
                        <button
                          className="post-menu-btn"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setOpenMenuThreadId((prev) => (prev === thread._id ? null : thread._id));
                          }}
                          title="Post options"
                          aria-label="Post options"
                        >
                          ⋯
                        </button>
                        {openMenuThreadId === thread._id && (
                          <div className="post-menu-dropdown" onClick={(e) => e.stopPropagation()}>
                            <button
                              className="post-menu-item"
                              onClick={() => {
                                handleMarkInterested(thread._id);
                                setOpenMenuThreadId(null);
                              }}
                            >
                              ❤️ Interested
                            </button>
                            <button
                              className="post-menu-item"
                              onClick={() => {
                                handleMarkUninterested(thread._id);
                                setOpenMenuThreadId(null);
                              }}
                            >
                              👎 Not Interested
                            </button>
                            <button
                              className="post-menu-item"
                              onClick={() => {
                                handleSaveThread(thread._id);
                                setOpenMenuThreadId(null);
                              }}
                            >
                              🔖 Save
                            </button>
                            <button
                              className="post-menu-item danger"
                              onClick={() => {
                                setReportingThreadId(thread._id);
                                setReportModalOpen(true);
                                setOpenMenuThreadId(null);
                              }}
                            >
                              🚩 Report
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="post-content-wrapper">
                      <Link to={`/forum/thread/${thread._id}`} className="post-title-link">
                        <h2 className="post-title">{thread.title}</h2>
                      </Link>
                      <p className="post-body">{thread.description}</p>

                      {thread.images && thread.images.length > 0 && (
                        <div className={`post-images-fb ${thread.images.length >= 5 ? 'images-5plus' : `images-${thread.images.length}`}`}>
                          {thread.images
                            .slice(0, thread.images.length >= 5 ? 5 : thread.images.length)
                            .map((image, index) => (
                            <Link
                              key={index}
                              to={`/forum/thread/${thread._id}`}
                              className="post-image-wrapper"
                            >
                              <img src={image.url} alt={`Image ${index + 1}`} />
                              {thread.images.length > 5 && index === 4 && (
                                <div className="image-more-overlay">
                                  <span>+{thread.images.length - 5}</span>
                                </div>
                              )}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="post-actions-fb">
                      <button
                        className="post-action-link"
                        onClick={() => handleLikeThread(thread._id)}
                      >
                        👍 {thread.likesCount} {thread.likesCount === 1 ? 'Like' : 'Likes'}
                      </button>
                      <Link
                        to={`/forum/thread/${thread._id}`}
                        className="post-action-link"
                      >
                        💬 {thread.repliesCount} {thread.repliesCount === 1 ? 'Reply' : 'Replies'}
                      </Link>
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
                        {(() => {
                          const status = getOnlineStatus(friend.lastOnline);
                          return (
                            <p className={`friend-status ${status.isOnline ? 'status-active' : 'status-offline'}`}>
                              {status.isOnline ? '🟢 Active' : `⚫ ${status.text}`}
                            </p>
                          );
                        })()}
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

      {/* Create Post Modal */}
      {showCreatePostModal && (
        <motion.div 
          className="modal-overlay" 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => setShowCreatePostModal(false)}
        >
          <motion.div 
            className="modal-content create-post-modal" 
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 25,
              duration: 0.3
            }}
          >
            <button
              className="modal-close"
              onClick={() => setShowCreatePostModal(false)}
            >
              ✕
            </button>
            <div className="modal-header">
              <h3>+ Create New Post</h3>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  placeholder="Enter post title..."
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  className="form-select"
                  value={newPostCategory}
                  onChange={(e) => setNewPostCategory(e.target.value)}
                >
                  {CATEGORIES.filter(cat => cat.name !== 'All').map((cat) => (
                    <option key={cat.name} value={cat.name}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  className="form-textarea"
                  value={newPostDescription}
                  onChange={(e) => setNewPostDescription(e.target.value)}
                  placeholder="What's on your mind?"
                  rows={5}
                />
              </div>
              <div className="form-group">
                <label>Images (optional)</label>
                <input
                  type="file"
                  className="form-file"
                  onChange={handleNewPostImageUpload}
                  accept="image/*"
                  multiple
                />
                {newPostImages.length > 0 && (
                  <div className="image-previews">
                    {newPostImages.map((image, index) => (
                      <div key={index} className="image-preview-item">
                        <img 
                          src={URL.createObjectURL(image)} 
                          alt={`Preview ${index + 1}`} 
                        />
                        <button
                          type="button"
                          className="remove-image-btn"
                          onClick={() => removeNewPostImage(index)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setShowCreatePostModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn-confirm"
                onClick={handleCreatePostSubmit}
                disabled={submittingPost}
              >
                {submittingPost ? 'Posting...' : 'Post'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>  );
}




