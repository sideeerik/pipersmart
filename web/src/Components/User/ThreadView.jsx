import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { validateContent } from '../../utils/contentValidation';
import './Forum.css';
import Chat from '../Chat/Chat';

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
  const [reportType, setReportType] = useState('thread'); // 'thread' or 'post'
  const [reportReason, setReportReason] = useState('');
  const [reportingId, setReportingId] = useState(null);
  const [submittingReport, setSubmittingReport] = useState(false);

  useEffect(() => {
    fetchThreadData();
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
  }, [threadId]);

  const fetchThreadData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/forum/threads/${threadId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
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
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/forum/threads/${threadId}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setThread((prev) => ({
        ...prev,
        likesCount: response.data.data.likesCount
      }));
    } catch (error) {
      console.error('Error liking thread:', error);
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
    
    // Check if user is logged in
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
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        const newImage = {
          url: response.data.secure_url,
          publicId: response.data.public_id
        };

        setReplyImages((prev) => [...prev, newImage]);
        setReplyPreviews((prev) => [...prev, newImage.url]);
      } catch (error) {
        console.error('❌ Error uploading image:', error.response?.data || error.message);
        alert('Failed to upload image. Make sure the upload preset "pipersmart" exists in Cloudinary.');
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
    
    // Real-time validation
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

    // Validate reply content
    const validationResult = validateContent(replyContent);
    
    if (!validationResult.isValid) {
      if (validationResult.severity === 'BLOCK') {
        // Show warning modal for blocked content
        setWarningMessage(validationResult.message);
        setPendingComment(replyContent);
        setShowWarningModal(true);
        return;
      }
    }

    // Content is valid, proceed with posting
    await submitReply();
  };

  const handleWarningModalConfirm = async () => {
    // Re-validate the edited comment
    const validationResult = validateContent(pendingComment);
    
    if (!validationResult.isValid && validationResult.severity === 'BLOCK') {
      // Still contains restricted content
      setWarningMessage(validationResult.message);
      return;
    }

    // Update the reply content and close modal
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
      const replyData = {
        content: replyContent,
        status: 'published',
        images: replyImages
      };

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/forum/threads/${threadId}/posts`,
        replyData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
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
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setPosts((prev) =>
        prev.map((post) =>
          post._id === postId
            ? { ...post, likesCount: response.data.data.likesCount }
            : post
        )
      );
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

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % expandedImage.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + expandedImage.length) % expandedImage.length
    );
  };

  if (loading) {
    return <div className="thread-view-container loading">Loading discussion...</div>;
  }

  if (!thread) {
    return <div className="thread-view-container">Discussion not found</div>;
  }

  return (
    <div className="thread-view-container">
      {/* Original Thread */}
      <div className="thread-detail-card">
        <div className="thread-detail-header">
          <div className="thread-author">
            <div className="author-avatar">
              {thread.createdBy?.firstName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="author-info">
              <p className="author-name">
                {thread.createdBy?.firstName} {thread.createdBy?.lastName}
              </p>
              <p className="thread-meta">
                {new Date(thread.createdAt).toLocaleDateString()} •{' '}
                <span className="category-badge-detail">{thread.category}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="thread-detail-content">
          <h1 className="thread-detail-title">{thread.title}</h1>
          <p className="thread-detail-description">{thread.description}</p>

          {/* Thread Images Gallery */}
          {thread.images && thread.images.length > 0 && (
            <div className="thread-images-gallery">
              <div className="gallery-grid">
                {thread.images.map((image, index) => (
                  <img
                    key={index}
                    src={image.url}
                    alt={`Discussion image ${index + 1}`}
                    className="gallery-image"
                    onClick={() => openImageLightbox(thread.images, index)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Thread Actions */}
        <div className="thread-detail-actions">
          <div className="stats">
            <span>👍 {thread.likesCount} Likes</span>
            <span>💬 {thread.repliesCount} Replies</span>
            <span>👁️ {thread.views} Views</span>
          </div>
          <div className="actions">
            <button className="action-btn" onClick={handleLikeThread}>
              👍 Like
            </button>
            <button className="action-btn" onClick={handleMarkThreadInterested}>
              ❤️ Interested
            </button>
            <button className="action-btn" onClick={handleMarkThreadUninterested}>
              👎 Not Interested
            </button>
            <button className="action-btn" onClick={handleSaveThread}>
              🔖 Save
            </button>
            <button
              className="action-btn"
              onClick={() => {
                setReportType('thread');
                setReportingId(threadId);
                setReportModalOpen(true);
              }}
            >
              🚩 Report
            </button>
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
            <div key={post._id} className="reply-card">
              <div className="reply-header">
                <div className="reply-author">
                  <div className="author-avatar-small">
                    {post.createdBy?.firstName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="reply-author-info">
                    <p className="reply-author-name">
                      {post.createdBy?.firstName} {post.createdBy?.lastName}
                    </p>
                    <p className="reply-time">
                      {new Date(post.createdAt).toLocaleDateString()}
                      {post.isEdited && <span className="edited-badge"> (edited)</span>}
                    </p>
                  </div>
                </div>
              </div>

              <div className="reply-content">
                <p>{post.content}</p>

                {/* Reply Images */}
                {post.images && post.images.length > 0 && (
                  <div className="reply-images">
                    <div className="reply-image-grid">
                      {post.images.map((image, index) => (
                        <img
                          key={index}
                          src={image.url}
                          alt={`Reply image ${index + 1}`}
                          className="reply-image"
                          onClick={() => openImageLightbox(post.images, index)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="reply-actions">
                <button className="reply-action" onClick={() => handleLikePost(post._id)}>
                  👍 {post.likesCount}
                </button>
                <button
                  className="reply-action"
                  onClick={() => handleSavePost(post._id)}
                  title="Save post"
                >
                  🔖 Save
                </button>
                <button
                  className="reply-action"
                  onClick={() => {
                    setReportType('post');
                    setReportingId(post._id);
                    setReportModalOpen(true);
                  }}
                  title="Report post"
                >
                  🚩 Report
                </button>
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
            <div className="author-avatar-small">
              {user?.firstName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <p>{user?.firstName} {user?.lastName}</p>
          </div>

          <textarea
            value={replyContent}
            onChange={handleReplyContentChange}
            placeholder="Share your thoughts or experience..."
            className="reply-textarea"
            rows={4}
          />

          {/* Validation Message */}
          {!replyValidation.isValid && (
            <div style={{
              padding: '12px',
              marginTop: '12px',
              marginBottom: '12px',
              borderRadius: '6px',
              backgroundColor: replyValidation.severity === 'BLOCK' ? '#fee' : '#fef3cd',
              border: `2px solid ${replyValidation.severity === 'BLOCK' ? '#f88' : '#ffc107'}`,
              color: replyValidation.severity === 'BLOCK' ? '#c33' : '#856404',
              fontSize: '13px',
              fontWeight: '600'
            }}>
              {replyValidation.message}
            </div>
          )}

          {/* Reply Image Previews */}
          {replyPreviews.length > 0 && (
            <div className="reply-image-previews">
              {replyPreviews.map((preview, index) => (
                <div key={index} className="preview-item-small">
                  <img src={preview} alt={`Preview ${index + 1}`} />
                  <button
                    type="button"
                    onClick={() => handleRemoveReplyImage(index)}
                    className="remove-btn-small"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="reply-form-actions">
            <label htmlFor="reply-image-input" className="image-upload-btn">
              📸 Add Image
            </label>
            <input
              id="reply-image-input"
              type="file"
              multiple
              accept="image/*"
              onChange={handleReplyImageUpload}
              style={{ display: 'none' }}
            />

            <button
              className="btn-post-reply"
              onClick={handlePostReply}
              disabled={submitting}
            >
              {submitting ? 'Posting...' : '✉️ Post Reply'}
            </button>
          </div>
        </div>
      </div>

      {/* Warning Modal */}
      {showWarningModal && (
        <div className="modal-overlay" onClick={handleWarningModalCancel}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleWarningModalCancel}>
              ✕
            </button>
            <div className="modal-header">
              <h3>⚠️ Community Safety Check</h3>
            </div>
            <div className="modal-body">
              <p className="warning-message">{warningMessage}</p>
              <div className="safe-space-notice">
                <p>
                  ✨ <strong>This is a Safe Space Community</strong> ✨
                </p>
                <p>
                  We foster respectful discussions focused on black pepper farming. Please review and edit your comment to ensure it aligns with our community standards.
                </p>
              </div>
              <label className="modal-label">Edit your comment:</label>
              <textarea
                className="modal-textarea"
                value={pendingComment}
                onChange={(e) => setPendingComment(e.target.value)}
                placeholder="Type your edited comment here..."
                rows="5"
              />
            </div>
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={handleWarningModalCancel}
              >
                Cancel
              </button>
              <button
                className="btn-confirm"
                onClick={handleWarningModalConfirm}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Lightbox */}
      {expandedImage && (
        <div className="lightbox" onClick={closeImageLightbox}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={closeImageLightbox}>
              ✕
            </button>
            <img
              src={expandedImage[currentImageIndex].url}
              alt="Expanded view"
              className="lightbox-image"
            />
            {expandedImage.length > 1 && (
              <div className="lightbox-nav">
                <button className="lightbox-btn" onClick={prevImage}>
                  ← Previous
                </button>
                <span className="lightbox-counter">
                  {currentImageIndex + 1} / {expandedImage.length}
                </span>
                <button className="lightbox-btn" onClick={nextImage}>
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Report Modal */}
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
              <h3>🚩 Report {reportType === 'thread' ? 'Thread' : 'Post'}</h3>
            </div>
            <div className="modal-body">
              <p>Help us keep our community safe. Please describe why you're reporting this {reportType}.</p>
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
                onClick={handleSubmitReport}
                disabled={submittingReport}
              >
                {submittingReport ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Chat Widget */}
      <Chat />
    </div>
  );
}
