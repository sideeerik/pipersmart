
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { validateContent } from '../utils/contentValidation';
import Header from '../shared/Header';
import './Forum.css';
import Chat from '../Chat/Chat';

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

export default function ThreadView() {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const [thread, setThread] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [replyImages, setReplyImages] = useState([]);
  const [replyPreviews, setReplyPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [expandedImage, setExpandedImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [user, setUser] = useState(null);
  const [replyValidation, setReplyValidation] = useState({ isValid: true, message: '', severity: 'OK' });
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [pendingComment, setPendingComment] = useState('');
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportType, setReportType] = useState('thread');
  const [reportReason, setReportReason] = useState('');
  const [reportingId, setReportingId] = useState(null);
  const [submittingReport, setSubmittingReport] = useState(false);
  const [threadMenuOpen, setThreadMenuOpen] = useState(false);
  
  // Read dark mode preference from localStorage
  const isDarkTheme = localStorage.getItem('forumDarkTheme') === 'true';

  useEffect(() => {
    fetchThreadData();
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
  }, [threadId]);

  // scroll to hash anchor after posts load
  useEffect(() => {
    if (!loading && posts.length > 0) {
      const hash = window.location.hash;
      if (hash) {
        const target = document.querySelector(hash);
        if (target) {
          setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
        }
      }
    }
  }, [loading, posts]);

  const fetchThreadData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/forum/threads/${threadId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data && response.data.data) {
        setThread(response.data.data.thread);
        setPosts(response.data.data.posts || []);
      }
    } catch (error) {
      console.error('Error fetching thread:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLikeThread = async () => {
    try {
      setThread((prev) => {
        if (!prev) return prev;
        const isLiked =
          prev.isLiked ??
          prev.hasLiked ??
          prev.userHasLiked ??
          prev.likedByCurrentUser ??
          prev.currentUserLiked ??
          false;
        const nextLiked = !isLiked;
        const safeLikes = Number(prev.likesCount) || 0;
        return {
          ...prev,
          likesCount: nextLiked ? safeLikes + 1 : Math.max(0, safeLikes - 1),
          isLiked: nextLiked,
        };
      });
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/forum/threads/${threadId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const serverData = response?.data?.data ?? {};
      const serverLikes =
        serverData.likesCount ??
        serverData.thread?.likesCount ??
        serverData.likes ??
        null;
      const serverLiked =
        serverData.isLiked ??
        serverData.hasLiked ??
        serverData.userHasLiked ??
        serverData.likedByCurrentUser ??
        serverData.currentUserLiked ??
        serverData.thread?.isLiked ??
        null;

      if (serverLikes != null || serverLiked != null) {
        setThread((prev) =>
          prev
            ? {
                ...prev,
                likesCount: serverLikes != null ? serverLikes : prev.likesCount,
                isLiked: serverLiked != null ? serverLiked : prev.isLiked,
              }
            : prev
        );
      } else {
        fetchThreadData();
      }
    } catch (error) {
      console.error('Error liking thread:', error);
      fetchThreadData();
    }
  };

  const handleMarkThreadInterested = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/forum/threads/${threadId}/interested`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('✅ Marked as interested!');
    } catch (error) {
      console.error('Error marking thread as interested:', error);
    }
  };

  const handleMarkThreadUninterested = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/forum/threads/${threadId}/uninterested`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('👎 Marked as not interested');
    } catch (error) {
      console.error('Error marking thread as uninterested:', error);
    }
  };

  const handleSaveThread = async () => {
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

  const handleSavePost = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/forum/posts/${postId}/save`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.isSaved) {
        alert('✅ Post saved!');
      } else {
        alert('🔖 Post removed from saved');
      }
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Failed to save post');
    }
  };

  const handleSubmitReport = async () => {
    if (!reportReason.trim()) {
      alert('Please provide a reason for the report');
      return;
    }
    try {
      setSubmittingReport(true);
      const token = localStorage.getItem('token');
      if (reportType === 'thread') {
        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/forum/threads/${reportingId}/report`,
          { reason: reportReason },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/forum/posts/${reportingId}/report`,
          { reason: reportReason },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      alert('✅ Report submitted. Thank you for keeping our community safe!');
      setReportModalOpen(false);
      setReportReason('');
      setReportingId(null);
    } catch (error) {
      console.error('Error submitting report:', error);
      alert(error.response?.data?.message || 'Failed to submit report');
    } finally {
      setSubmittingReport(false);
    }
  };

  const handleReplyImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in first to upload images');
      return;
    }

    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'pipersmart');

      try {
        const response = await axios.post(
          `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dlhxtzwsv'}/image/upload`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        const newImage = { url: response.data.secure_url, publicId: response.data.public_id };
        setReplyImages((prev) => [...prev, newImage]);
        setReplyPreviews((prev) => [...prev, newImage.url]);
      } catch (error) {
        console.error('❌ Error uploading image:', error.response?.data || error.message);
        alert('Failed to upload image');
      }
    }
  };

  const handleRemoveReplyImage = (index) => {
    setReplyImages((prev) => prev.filter((_, i) => i !== index));
    setReplyPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleReplyContentChange = (e) => {
    const content = e.target.value;
    setReplyContent(content);
    if (content.trim()) {
      const validationResult = validateContent(content);
      setReplyValidation(validationResult);
    } else {
      setReplyValidation({ isValid: true, message: '', severity: 'OK' });
    }
  };

  const handlePostReply = async () => {
    if (!replyContent.trim()) {
      alert('Please write a reply');
      return;
    }
    const validationResult = validateContent(replyContent);
    if (!validationResult.isValid && validationResult.severity === 'BLOCK') {
      setWarningMessage(validationResult.message);
      setPendingComment(replyContent);
      setShowWarningModal(true);
      return;
    }
    await submitReply();
  };

  const handleWarningModalConfirm = async () => {
    const validationResult = validateContent(pendingComment);
    if (!validationResult.isValid && validationResult.severity === 'BLOCK') {
      setWarningMessage(validationResult.message);
      return;
    }
    setReplyContent(pendingComment);
    setShowWarningModal(false);
    setWarningMessage('');
  };

  const handleWarningModalCancel = () => {
    setShowWarningModal(false);
    setWarningMessage('');
    setPendingComment('');
  };

  const submitReply = async () => {
    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      const replyData = { content: replyContent, status: 'published', images: replyImages };
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/forum/threads/${threadId}/posts`,
        replyData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts((prev) => [...prev, response.data.data]);
      setReplyContent('');
      setReplyImages([]);
      setReplyPreviews([]);
      setReplyValidation({ isValid: true, message: '', severity: 'OK' });
    } catch (error) {
      console.error('Error posting reply:', error);
      alert(error.response?.data?.message || 'Failed to post reply');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikePost = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/forum/posts/${postId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts((prev) => prev.map((post) => post._id === postId ? { ...post, likesCount: response.data.data.likesCount } : post));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const openImageLightbox = (images, index) => {
    setExpandedImage(images);
    setCurrentImageIndex(index);
  };

  const closeImageLightbox = () => {
    setExpandedImage(null);
    setCurrentImageIndex(0);
  };

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % expandedImage.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + expandedImage.length) % expandedImage.length);

  if (loading) {
    return <div className="thread-view-container loading">Loading discussion...</div>;
  }

  if (!thread) {
    return <div className="thread-view-container">Discussion not found</div>;
  }

  const isThreadLiked =
    thread.isLiked ??
    thread.hasLiked ??
    thread.userHasLiked ??
    thread.likedByCurrentUser ??
    thread.currentUserLiked ??
    false;

  return (
    <>
      <Header />
      <div className={`thread-view-container ${isDarkTheme ? 'dark-theme' : ''}`}>
        {/* Original Thread */}
        <div className="thread-detail-card">
          <div className="thread-detail-header">
            <div className="thread-author">
              <div className="author-avatar">
                {thread.createdBy?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="author-info">
                <p className="author-name">{thread.createdBy?.name || 'Unknown'}</p>
                <p className="thread-meta">
                  {formatTimeAgo(thread.createdAt)} •{' '}
                  <span className="category-badge-detail">{thread.category}</span>
                </p>
              </div>
            </div>
            <div className="post-menu">
              <button
                className="post-menu-btn"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setThreadMenuOpen((prev) => !prev);
                }}
                title="Post options"
                aria-label="Post options"
              >
                ⋯
              </button>
              {threadMenuOpen && (
                <div className="post-menu-dropdown" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="post-menu-item"
                    onClick={() => {
                      handleMarkThreadInterested();
                      setThreadMenuOpen(false);
                    }}
                  >
                    ❤️ Interested
                  </button>
                  <button
                    className="post-menu-item"
                    onClick={() => {
                      handleMarkThreadUninterested();
                      setThreadMenuOpen(false);
                    }}
                  >
                    👎 Not Interested
                  </button>
                  <button
                    className="post-menu-item"
                    onClick={() => {
                      handleSaveThread();
                      setThreadMenuOpen(false);
                    }}
                  >
                    🔖 Save
                  </button>
                  <button
                    className="post-menu-item danger"
                    onClick={() => {
                      setReportType('thread');
                      setReportingId(threadId);
                      setReportModalOpen(true);
                      setThreadMenuOpen(false);
                    }}
                  >
                    🚩 Report
                  </button>
                </div>
              )}
            </div>          </div>

          <div className="thread-detail-content">
            <h1 className="thread-detail-title">{thread.title}</h1>
            <p className="thread-detail-description">{thread.description}</p>

            {thread.images && thread.images.length > 0 && (
              <div className="thread-images-gallery">
                <div className="gallery-grid">
                  {thread.images.map((image, index) => (
                    <img key={index} src={image.url} alt={`Discussion image ${index + 1}`} className="gallery-image" onClick={() => openImageLightbox(thread.images, index)} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="thread-detail-actions">
            <div className="stats">
              <button
                type="button"
                className="stats-btn"
                onClick={handleLikeThread}
                aria-label={isThreadLiked ? 'Liked' : 'Like'}
              >
                👍 {thread.likesCount} {isThreadLiked ? 'Liked' : 'Like'}
              </button>
              <span>💬 {thread.repliesCount} Replies</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="thread-divider"></div>

        {/* Replies Section */}
        <div className="replies-section">
          <h2>💬 Replies ({thread.repliesCount})</h2>
          {posts.length === 0 ? (
            <p className="no-replies">No replies yet. Be the first to reply!</p>
          ) : (
            posts.map((post) => (
              <div id={`post-${post._id}`} key={post._id} className="reply-card">
                <div className="reply-header">
                  <div className="reply-author">
                    <div className="author-avatar-small">{post.createdBy?.name?.charAt(0).toUpperCase() || 'U'}</div>
                    <div className="reply-author-info">
                      <p className="reply-author-name">{post.createdBy?.name || 'Unknown'}</p>
                      <p className="reply-time">{formatTimeAgo(post.createdAt)}{post.isEdited && <span className="edited-badge"> (edited)</span>}</p>
                    </div>
                  </div>
                </div>
                <div className="reply-content">
                  <p>{post.content}</p>
                  {post.images && post.images.length > 0 && (
                    <div className="reply-images">
                      <div className="reply-image-grid">
                        {post.images.map((image, index) => (
                          <img key={index} src={image.url} alt={`Reply image ${index + 1}`} className="reply-image" onClick={() => openImageLightbox(post.images, index)} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="reply-actions">
                  <button className="reply-action" onClick={() => handleLikePost(post._id)}>👍 {post.likesCount}</button>
                  <button className="reply-action" onClick={() => handleSavePost(post._id)} title="Save post">🔖 Save</button>
                  <button className="reply-action" onClick={() => { setReportType('post'); setReportingId(post._id); setReportModalOpen(true); }} title="Report post">🚩 Report</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Reply Input Section */}
        <div className="reply-input-section">
          <h3>Write a Reply</h3>
          <div className="reply-form">
            <div className="reply-user-info">
              <div className="author-avatar-small">{user?.name?.charAt(0).toUpperCase() || 'U'}</div>
              <p>{user?.name || 'Guest'}</p>
            </div>
            <textarea value={replyContent} onChange={handleReplyContentChange} placeholder="Share your thoughts or experience..." className="reply-textarea" rows={4} />
            {!replyValidation.isValid && (
              <div style={{ padding: '12px', marginTop: '12px', borderRadius: '6px', backgroundColor: replyValidation.severity === 'BLOCK' ? '#fee' : '#fef3cd', border: `2px solid ${replyValidation.severity === 'BLOCK' ? '#f88' : '#ffc107'}`, color: replyValidation.severity === 'BLOCK' ? '#c33' : '#856404', fontSize: '13px', fontWeight: '600' }}>
                {replyValidation.message}
              </div>
            )}
            {replyPreviews.length > 0 && (
              <div className="reply-image-previews">
                {replyPreviews.map((preview, index) => (
                  <div key={index} className="preview-item-small">
                    <img src={preview} alt={`Preview ${index + 1}`} />
                    <button type="button" onClick={() => handleRemoveReplyImage(index)} className="remove-btn-small">✖</button>
                  </div>
                ))}
              </div>
            )}
            <div className="reply-form-actions">
              <label htmlFor="reply-image-input" className="image-upload-btn">📸 Add Image</label>
              <input id="reply-image-input" type="file" multiple accept="image/*" onChange={handleReplyImageUpload} style={{ display: 'none' }} />
              <button className="btn-post-reply" onClick={handlePostReply} disabled={submitting}>{submitting ? 'Posting...' : '✉️ Post Reply'}</button>
            </div>
          </div>
        </div>

        {/* Warning Modal */}
        {showWarningModal && (
          <div className="modal-overlay" onClick={handleWarningModalCancel}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={handleWarningModalCancel}>✖</button>
              <div className="modal-header"><h3>⚠️ Community Safety Check</h3></div>
              <div className="modal-body">
                <p className="warning-message">{warningMessage}</p>
                <div className="safe-space-notice">
                  <p>✨ <strong>This is a Safe Space Community</strong> ✨</p>
                  <p>We foster respectful discussions focused on black pepper farming. Please review and edit your comment.</p>
                </div>
                <label className="modal-label">Edit your comment:</label>
                <textarea className="modal-textarea" value={pendingComment} onChange={(e) => setPendingComment(e.target.value)} placeholder="Type your edited comment here..." rows="5" />
              </div>
              <div className="modal-footer">
                <button className="btn-cancel" onClick={handleWarningModalCancel}>Cancel</button>
                <button className="btn-confirm" onClick={handleWarningModalConfirm}>Continue</button>
              </div>
            </div>
          </div>
        )}

        {/* Image Lightbox */}
        {expandedImage && (
          <div className="lightbox" onClick={closeImageLightbox}>
            <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
              <button className="lightbox-close" onClick={closeImageLightbox}>✖</button>
              <img src={expandedImage[currentImageIndex].url} alt="Expanded view" className="lightbox-image" />
              {expandedImage.length > 1 && (
                <div className="lightbox-nav">
                  <button className="lightbox-btn" onClick={prevImage}>← Previous</button>
                  <span className="lightbox-counter">{currentImageIndex + 1} / {expandedImage.length}</span>
                  <button className="lightbox-btn" onClick={nextImage}>Next →</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Report Modal */}
        {reportModalOpen && (
          <div className="modal-overlay" onClick={() => setReportModalOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setReportModalOpen(false)}>✖</button>
              <div className="modal-header"><h3>🚩 Report {reportType === 'thread' ? 'Thread' : 'Post'}</h3></div>
              <div className="modal-body">
                <p>Help us keep our community safe. Please describe why you're reporting this {reportType}.</p>
                <textarea className="report-textarea" value={reportReason} onChange={(e) => setReportReason(e.target.value)} placeholder="Describe the issue..." rows={5} />
              </div>
              <div className="modal-footer">
                <button className="btn-cancel" onClick={() => setReportModalOpen(false)}>Cancel</button>
                <button className="btn-confirm" onClick={handleSubmitReport} disabled={submittingReport}>{submittingReport ? 'Submitting...' : 'Submit Report'}</button>
              </div>
            </div>
          </div>
        )}

        <Chat />
      </div>
    </>
  );
}


