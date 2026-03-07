
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Chat from '../Chat/Chat';
import Header from '../shared/Header';
import UserProfileCard from './UserProfileCard';
import './Profile.css';
 
const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  const { userId } = useParams();
  const currentUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  const [requestSent, setRequestSent] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const endpoint = userId ?
          `${API_BASE_URL}/api/v1/users/${userId}` :
          `${API_BASE_URL}/api/v1/users/me`;
        const response = await axios.get(endpoint);
        if (response.data.success) setUser(response.data.user);
      // if viewing someone else, we might also check if there's a pending request
      if (userId) {
        setRequestSent(false); // reset
      }
      } catch (error) {
        console.error('Profile fetch error:', error);
        if (!userId) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, API_BASE_URL, userId]);

  useEffect(() => {
    if (userId || currentUser) {
      fetchSentFriendRequests();
    }
  }, [userId, currentUser]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleAddFriend = async () => {
    if (!user || !user._id) return;
    try {
      const cleanUserId = user._id.trim();
      console.log('Sending friend request to', cleanUserId);
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/users/friend-request/${cleanUserId}`
      );
      alert('Friend request sent!');
      setRequestSent(true);
      setPendingRequests(prev => [...prev, cleanUserId]);
    } catch (error) {
      console.error('Error sending friend request:', error);
      alert(error.response?.data?.message || 'Failed to send friend request');
    }
  };

  const fetchSentFriendRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/v1/users/sent-friend-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingRequests(res.data?.data || []);
    } catch (err) {
      console.error('Error loading pending requests', err);
      setPendingRequests([]);
    }
  };

  const handleCancelFriendRequest = async (userIdToCancel) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/v1/users/friend-request/${userIdToCancel}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Friend request cancelled');
      setPendingRequests(prev => prev.filter(id => id !== userIdToCancel));
      if (user && user._id === userIdToCancel) {
        setRequestSent(false);
      }
    } catch (error) {
      console.error('Error cancelling friend request', error);
    }
  };

  useEffect(() => {
    if (userId || currentUser) {
      fetchSentFriendRequests();
    }
  }, [userId, currentUser]);


  if (loading)
    return (
      <div className="page-wrapper">
        <div className="page-background">
          <img src="/paminta.webp" alt="Background" className="background-image" />
          <div className="background-overlay"></div>
        </div>
        <Header />
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          color: '#fff'
        }}>
          Loading...
        </div>
      </div>
    );

  return (
    <div className="page-wrapper">
      {/* Dark Theme Background with Image */}
      <div className="page-background">
        <img src="/paminta.webp" alt="Background" className="background-image" />
        <div className="background-overlay"></div>
      </div>

      {/* Header */}
      <Header />

      {/* Profile Content */}
      <UserProfileCard
        user={user}
        currentUser={currentUser}
        onBack={userId && currentUser && currentUser._id !== userId ? () => navigate(-1) : undefined}
        onAddFriend={userId && currentUser && currentUser._id !== userId ? handleAddFriend : undefined}
        onCancelFriend={userId && currentUser && currentUser._id !== userId ? handleCancelFriendRequest : undefined}
        pendingRequests={pendingRequests}
        isRequestSent={requestSent}
        selfActions={
          (!userId || (currentUser && currentUser._id === userId)) && (
            <>
              <div className="profile-actions-grid">
                <Link to="/profile/edit" className="profile-action-btn profile-edit-btn">
                  ✎ Edit Profile
                </Link>
                <Link to="/change-password" className="profile-action-btn profile-password-btn">
                  🔑 Change Password
                </Link>
              </div>

              <button onClick={handleLogout} className="profile-logout-btn">
                🚪 Logout
              </button>
            </>
          )
        }
      />

      {/* Floating Chat Widget */}
      <Chat />
    </div>
  );
};

export default Profile;

