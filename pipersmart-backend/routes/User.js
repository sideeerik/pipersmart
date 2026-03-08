const express = require('express');
const { uploadWithJson } = require('../utils/Multer');
const {
  registerUser,
  loginUser,
  updateProfile,
  firebaseGoogleAuth,
  firebaseFacebookAuth,
  forgotPassword,
  resetPassword,
  changePassword,
  verifyEmail,
  getAllUsers,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  cancelFriendRequest,
  getFriends,
  getFriendRequests,
  removeFriend
} = require('../controllers/User');

const { isAuthenticatedUser } = require('../middlewares/auth');

const router = express.Router();

// ================= AUTH =================
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', isAuthenticatedUser, (req, res) => {
  console.log('🚪 LOGOUT - User:', req.user.id, '(' + req.user.email + ')');
  console.log('🔑 Token invalidated on backend');
  res.status(200).json({ success: true, message: 'Logout successful' });
});

// ================= PROFILE =================
router.get('/me', isAuthenticatedUser, async (req, res) => {
  console.log('📋 GET /me - Fetching user profile for:', req.user.id);
  const user = await require('../models/User').findById(req.user.id);
  console.log('✅ Profile returned for:', user.email);
  res.status(200).json({ success: true, user });
});

// UPDATE PROFILE
router.put('/me/update', isAuthenticatedUser, uploadWithJson, updateProfile);

// ================= FIREBASE AUTH =================
router.post('/firebase/auth/google', firebaseGoogleAuth);
router.post('/firebase/auth/facebook', firebaseFacebookAuth);

// ================= PASSWORD RESET =================
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

// ================= CHANGE PASSWORD =================
router.put('/change-password', isAuthenticatedUser, changePassword);

// ================= EMAIL VERIFICATION =================
// NOTE: The verification URL must include "/users" because the router is mounted at "/api/v1/users"
router.get('/verify-email/:token', verifyEmail);

// ================= FRIEND REQUESTS =================
router.get('/all-users', isAuthenticatedUser, getAllUsers);
router.post('/friend-request/:userId', isAuthenticatedUser, sendFriendRequest);
router.put('/friend-request/accept/:senderId', isAuthenticatedUser, acceptFriendRequest);
router.put('/friend-request/decline/:senderId', isAuthenticatedUser, declineFriendRequest);
router.put('/friend-request/cancel/:receiverId', isAuthenticatedUser, cancelFriendRequest);
router.get('/friends', isAuthenticatedUser, getFriends);
router.get('/friend-requests', isAuthenticatedUser, getFriendRequests);
router.delete('/friend/:friendId', isAuthenticatedUser, removeFriend);

module.exports = router;
