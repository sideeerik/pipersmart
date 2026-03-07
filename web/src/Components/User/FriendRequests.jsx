import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../shared/Header';
import './FriendRequests.css';

export default function FriendRequests() {
  const [friendRequests, setFriendRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      navigate('/login');
      return;
    }
    
    fetchFriendRequests();
  }, [navigate]);

  const fetchFriendRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/users/friend-requests`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFriendRequests(response.data?.data || []);
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (senderId) => {
    try {
      setProcessing(senderId);
      const token = localStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/users/friend-request/${senderId}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Friend request accepted!');
      setFriendRequests(prev => prev.filter(req => req.from?._id !== senderId));
    } catch (error) {
      console.error('Error accepting friend request:', error);
      alert(error.response?.data?.message || 'Failed to accept friend request');
    } finally {
      setProcessing(null);
    }
  };

  const handleDecline = async (senderId) => {
    try {
      setProcessing(senderId);
      const token = localStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/users/friend-request/${senderId}/decline`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFriendRequests(prev => prev.filter(req => req.from?._id !== senderId));
    } catch (error) {
      console.error('Error declining friend request:', error);
      alert(error.response?.data?.message || 'Failed to decline friend request');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <>
      <Header />
      <div className="friend-requests-page">
        <div className="friend-requests-container">
          <h1>Friend Requests</h1>
          
          {loading ? (
            <div className="loading">Loading friend requests...</div>
          ) : friendRequests.length === 0 ? (
            <div className="no-requests">
              <p>No pending friend requests</p>
              <button onClick={() => navigate('/forum')} className="back-btn">
                Go to Forum
              </button>
            </div>
          ) : (
            <div className="requests-list">
              {friendRequests.map((request) => (
                <div key={request._id} className="request-card">
                  <div className="request-user">
                    <div className="user-avatar">
                      {request.from?.avatar?.url ? (
                        <img src={request.from.avatar.url} alt={request.from.name} />
                      ) : (
                        <span>{request.from?.name?.charAt(0).toUpperCase() || 'U'}</span>
                      )}
                    </div>
                    <div className="user-info">
                      <h3>{request.from?.name}</h3>
                      <p>{request.from?.email}</p>
                    </div>
                  </div>
                  <div className="request-actions">
                    <button 
                      className="accept-btn"
                      onClick={() => handleAccept(request.from?._id)}
                      disabled={processing === request.from?._id}
                    >
                      {processing === request.from?._id ? 'Accepting...' : 'Accept'}
                    </button>
                    <button 
                      className="decline-btn"
                      onClick={() => handleDecline(request.from?._id)}
                      disabled={processing === request.from?._id}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

