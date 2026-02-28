import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { validateContent } from '../../utils/contentValidation';
import './Forum.css';

const CATEGORIES = [
  'Disease Identification',
  'Best Practices',
  'Regional Tips',
  'Equipment & Tools',
  'Success Stories',
  'General'
];

export default function CreateThread() {
  const navigate = useNavigate();
  const { threadId } = useParams(); // For editing drafts
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'General',
    images: []
  });
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [autoSaveTimer, setAutoSaveTimer] = useState(null);
  const [isDraft, setIsDraft] = useState(false);
  const [validation, setValidation] = useState({ isValid: true, message: '', severity: 'OK' });

  useEffect(() => {
    if (threadId) {
      fetchDraftThread();
    }
  }, [threadId]);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.title || formData.description) {
        handleSaveDraft();
      }
    }, 30000);

    return () => clearTimeout(timer);
  }, [formData]);

  const fetchDraftThread = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/forum/threads/${threadId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const thread = response.data.data.thread;
      if (thread.status === 'draft') {
        setFormData({
          title: thread.title,
          description: thread.description,
          category: thread.category,
          images: thread.images || []
        });
        setImagePreviews(thread.images || []);
        setIsDraft(true);
      }
    } catch (error) {
      console.error('Error loading draft:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    
    // Real-time validation
    if (name === 'title' || name === 'description') {
      const combinedContent = name === 'title' 
        ? `${value} ${formData.description}` 
        : `${formData.title} ${value}`;
      
      const validationResult = validateContent(combinedContent);
      setValidation(validationResult);
    }
    
    setSaveMessage('');
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);

    for (const file of files) {
      const formDataImg = new FormData();
      formDataImg.append('file', file);
      formDataImg.append('upload_preset', 'pipersmart');

      try {
        const response = await axios.post(
          `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
          formDataImg
        );

        const newImage = {
          url: response.data.secure_url,
          publicId: response.data.public_id,
          uploadedAt: new Date()
        };

        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, newImage]
        }));

        setImagePreviews((prev) => [...prev, newImage]);
        console.log('✅ Image uploaded successfully');
      } catch (error) {
        console.error('❌ Error uploading image:', error.response?.data || error.message);
        alert('Failed to upload image. Please try again.');
      }
    }
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveDraft = async () => {
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      
      // Check for both 'id' and '_id' fields
      const userId = user?.id || user?._id;
      
      if (!user || !userId) {
        console.log('❌ User not found in localStorage:', user);
        alert('Please log in first to save drafts');
        return;
      }

      const draftData = {
        ...formData,
        status: 'draft',
        userId: userId
      };

      if (isDraft && threadId) {
        // Update existing draft
        const response = await axios.put(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/forum/threads/${threadId}`,
          draftData,
          {
            headers: { 
              'Content-Type': 'application/json'
            }
          }
        );
        console.log('✅ Draft updated:', response.data);
      } else {
        // Create new draft
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/forum/threads`,
          draftData,
          {
            headers: { 
              'Content-Type': 'application/json'
            }
          }
        );
        console.log('✅ Draft created:', response.data);
      }

      setSaveMessage('✅ Draft saved');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('❌ Error saving draft:', error.response?.data || error.message);
      setSaveMessage('❌ Failed to save draft');
    }
  };

  const handlePostDiscussion = async () => {
    if (!formData.title.trim()) {
      alert('Please enter a title');
      return;
    }

    if (!formData.description.trim()) {
      alert('Please enter a description');
      return;
    }

    // Validate content
    const combinedContent = `${formData.title} ${formData.description}`;
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
      setLoading(true);
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      
      // Check for both 'id' and '_id' fields
      const userId = user?.id || user?._id;
      
      if (!user || !userId) {
        console.log('❌ User not found in localStorage:', user);
        alert('Please log in first to post discussions');
        setLoading(false);
        return;
      }

      const postData = {
        ...formData,
        status: 'published',
        userId: userId
      };

      if (isDraft && threadId) {
        // Update draft to published
        await axios.put(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/forum/threads/${threadId}`,
          postData,
          {
            headers: { 'Content-Type': 'application/json' }
          }
        );
      } else {
        // Create new published thread
        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/forum/threads`,
          postData,
          {
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      navigate('/forum');
    } catch (error) {
      console.error('❌ Error posting discussion:', error.response?.data || error.message);
      alert(error.response?.data?.message || 'Failed to post discussion. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (formData.title || formData.description) {
      const confirmDiscard = window.confirm(
        'Are you sure you want to discard this draft? (Your draft will be saved automatically)'
      );
      if (!confirmDiscard) return;
    }
    navigate('/forum');
  };

  return (
    <div className="create-thread-container">
      <div className="create-thread-card">
        <h1>✍️ Create New Discussion</h1>

        {isDraft && (
          <div className="draft-badge">
            📝 Editing saved draft
          </div>
        )}

        {saveMessage && (
          <div className="save-message">
            {saveMessage}
          </div>
        )}

        {/* Validation Message Banner */}
        {!validation.isValid && (
          <div style={{
            padding: '16px',
            marginBottom: '20px',
            borderRadius: '8px',
            backgroundColor: validation.severity === 'BLOCK' ? '#fee' : '#fef3cd',
            border: `2px solid ${validation.severity === 'BLOCK' ? '#f88' : '#ffc107'}`,
            color: validation.severity === 'BLOCK' ? '#c33' : '#856404',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            {validation.message}
          </div>
        )}

        {/* Title Input */}
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="What's your question or topic?"
            className="form-input"
            maxLength={200}
          />
          <p className="char-count">{formData.title.length}/200</p>
        </div>

        {/* Category Dropdown */}
        <div className="form-group">
          <label>Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="form-select"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Description Textarea */}
        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Provide more details about your discussion..."
            className="form-textarea"
            rows={8}
          />
          <p className="char-count">{formData.description.length} characters</p>
        </div>

        {/* Image Upload Section */}
        <div className="form-group">
          <label>📸 Add Pictures</label>
          <div className="image-upload-area">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="image-input"
              id="image-input"
            />
            <label htmlFor="image-input" className="image-upload-label">
              + Click to upload images or drag and drop
            </label>
          </div>

          {/* Image Previews */}
          {imagePreviews.length > 0 && (
            <div className="image-previews">
              <p className="preview-title">
                {imagePreviews.length} image{imagePreviews.length !== 1 ? 's' : ''} attached
              </p>
              <div className="preview-grid">
                {imagePreviews.map((image, index) => (
                  <div key={index} className="preview-item">
                    <img src={image.url} alt={`Preview ${index + 1}`} />
                    <button
                      type="button"
                      className="remove-image-btn"
                      onClick={() => handleRemoveImage(index)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button
            className="btn btn-draft"
            onClick={handleSaveDraft}
            disabled={loading}
          >
            📝 Save Draft
          </button>
          <button
            className="btn btn-post"
            onClick={handlePostDiscussion}
            disabled={loading}
          >
            {loading ? 'Posting...' : '✉️ Post Discussion'}
          </button>
          <button
            className="btn btn-cancel"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
