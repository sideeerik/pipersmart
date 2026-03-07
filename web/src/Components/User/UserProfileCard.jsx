import React from 'react';
import { Link } from 'react-router-dom';
import './Profile.css';

// Reusable profile card used by full page and popups.  It does not fetch data,
// it just renders a `user` object that has already been loaded.
//
// Props:
//   user            - the user document to display (required)
//   currentUser     - currently logged in user object (may be null)
//   onBack          - optional callback, if provided a back button is shown
//   onAddFriend     - if provided and viewing a different user, a button will
//                     call this callback when clicked
//   onCancelFriend  - optional cancel callback (same conditions as above)
//   isRequestSent   - boolean used to toggle add/cancel text
//   pendingRequests - array of ids used for convenience (profile page passes
//                     its own state, popup uses the outer value)
//   selfActions    - optional React node containing extra buttons (edit/logout)

export default function UserProfileCard({
  user,
  currentUser,
  onBack,
  onAddFriend,
  onCancelFriend,
  isRequestSent,
  pendingRequests = [],
  selfActions
}) {
  if (!user) return null;

  const viewingOther = currentUser && currentUser._id !== user._id;
  const requestPending = pendingRequests.includes(user._id) || isRequestSent;

  return (
    <div className="profile-container">
      <div className="profile-card">
        {onBack && (
          <button
            onClick={onBack}
            className="back-button"
            title="Go back"
          >
            ←
          </button>
        )}

        <div className="profile-header">
          <h1 className="profile-title">
            🌱 {viewingOther ? 'Profile' : 'My Profile'}
          </h1>
          <div className="profile-title-underline"></div>
        </div>


        <div className="profile-avatar-container">
          <img
            src={
              user?.avatar?.url ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}`
            }
            alt={user?.name}
            className="profile-avatar"
          />
          <span className="profile-avatar-badge">✓</span>
        </div>

        <div className="profile-info-section">
          <div className="profile-info-item">
            <p className="profile-info-label">Full Name</p>
            <p className="profile-info-value">{user?.name}</p>
          </div>

          <div className="profile-info-item">
            <p className="profile-info-label">Email</p>
            <p className="profile-info-value">{user?.email}</p>
          </div>

          {user?.contact && (
            <div className="profile-info-item">
              <p className="profile-info-label">Contact</p>
              <p className="profile-info-value">{user.contact}</p>
            </div>
          )}
        </div>

        {user?.address && (() => {
          const { city, barangay, street, zipcode } = user.address;
          const hasAny = city || barangay || street || zipcode;
          if (!hasAny) {
            return (
              <div className="profile-address-section">
                <h3 className="profile-section-title">📍 Address</h3>
                <p style={{ textAlign: 'center', color: '#666' }}>No address provided</p>
              </div>
            );
          }
          return (
            <div className="profile-address-section">
              <h3 className="profile-section-title">📍 Address</h3>
              <div className="profile-address-grid">
                <div className="profile-address-item">
                  <p className="profile-info-label">City</p>
                  <p className="profile-info-value">{city || '-'}</p>
                </div>
                <div className="profile-address-item">
                  <p className="profile-info-label">Barangay</p>
                  <p className="profile-info-value">{barangay || '-'}</p>
                </div>
                <div className="profile-address-item">
                  <p className="profile-info-label">Street</p>
                  <p className="profile-info-value">{street || '-'}</p>
                </div>
                <div className="profile-address-item">
                  <p className="profile-info-label">Zip Code</p>
                  <p className="profile-info-value">{zipcode || '-'}</p>
                </div>
              </div>
            </div>
          );
        })()}

        {viewingOther && (
          requestPending ? (
            <button
              onClick={() => onCancelFriend && onCancelFriend(user._id)}
              className="profile-cancel-friend-btn"
            >
              ✖ Cancel Request
            </button>
          ) : (
            <button
              onClick={() => onAddFriend && onAddFriend(user._id)}
              className="profile-add-friend-btn"
            >
              ➕ Add Friend
            </button>
          )
        )}

        {/* custom actions for self, passed by parent */}
        {!viewingOther && selfActions && (
          <div className="self-actions-container">
            {selfActions}
          </div>
        )}
      </div>
    </div>
  );
}
