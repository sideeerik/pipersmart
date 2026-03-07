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
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  cancelFriendRequest,
  getFriends,
  getFriendRequests,
  removeFriend,
  getSuggestions,
  getSentFriendRequests
} = require('../controllers/User');

const { isAuthenticatedUser } = require('../middlewares/auth');

const router = express.Router();

// ================= AUTH =================
router.post('/register', registerUser);
router.post('/login', loginUser);

// ================= PROFILE =================
router.get('/me', isAuthenticatedUser, async (req, res) => {
  const user = await require('../models/User').findById(req.user._id);
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

// ================= FRIEND REQUEST =================
router.post('/friend-request/:userId', isAuthenticatedUser, sendFriendRequest);
router.post('/friend-request/:senderId/accept', isAuthenticatedUser, acceptFriendRequest);
router.post('/friend-request/:senderId/decline', isAuthenticatedUser, declineFriendRequest);
router.get('/friends', isAuthenticatedUser, getFriends);
router.get('/friend-requests', isAuthenticatedUser, getFriendRequests);
router.get('/sent-friend-requests', isAuthenticatedUser, getSentFriendRequests);
router.delete('/friends/:friendId', isAuthenticatedUser, removeFriend);
router.get('/suggestions', isAuthenticatedUser, getSuggestions);
router.delete('/friend-request/:userId', isAuthenticatedUser, cancelFriendRequest);
// view another user's profile (must come after other routes to avoid wildcard capture)
router.get('/:userId', isAuthenticatedUser, async (req, res, next) => {
  try {
    await require('../controllers/User').getUserById(req, res);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
