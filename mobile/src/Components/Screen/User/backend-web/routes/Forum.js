const express = require('express');
const router = express.Router();
const { isAuthenticatedUser } = require('../middlewares/auth');
const {
  // Fast feed
  getFastFeed,
  // New public post endpoints
  getAllPosts,
  getPostsByUser,
  // Threads
  createThread,
  getAllThreads,
  getDraftThreads,
  getThreadById,
  updateThread,
  deleteThread,
  toggleLikeThread,
  incrementViewCount,
  // Posts
  createPost,
  updatePost,
  deletePost,
  toggleLikePost,
  getDraftPosts,
  // Post Interactions
  markInterested,
  markUninterested,
  // Save Posts
  toggleSavePost,
  getUserSavedPosts,
  // Report Posts
  reportPost,
  getPostInteraction,
  // Thread Interactions
  markInterestedThread,
  markUninterestedThread,
  getInterestedThreads,
  getUninterestedThreads,
  // Save Threads
  toggleSaveThread,
  getUserSavedThreads,
  // Report Threads
  reportThread,
  getThreadInteraction
} = require('../controllers/Forum');

// ============ FORUM THREADS ROUTES ============

// Get all published threads (with filters & search)
router.get('/threads', getAllThreads);

// Create new thread
router.post('/threads', isAuthenticatedUser, createThread);

// Get user's draft threads
router.get('/threads/drafts/my-drafts', isAuthenticatedUser, getDraftThreads);

// Get single thread with posts
router.get('/threads/:threadId', getThreadById);

// Update thread
router.put('/threads/:threadId', isAuthenticatedUser, updateThread);

// Delete thread
router.delete('/threads/:threadId', isAuthenticatedUser, deleteThread);

// ============ FAST FEED ROUTE ============

// Get fast feed (all posts from all users or friends only)
router.get('/feed', isAuthenticatedUser, getFastFeed);

// ============ PUBLIC POSTS ROUTES ============

// Get all posts from all users (public feed)
router.get('/posts', getAllPosts);

// Get all posts by a specific user
router.get('/posts/user/:userId', getPostsByUser);

// ============ FORUM THREADS ROUTES ============

// Get all published threads (with filters & search)
router.get('/threads', getAllThreads);

// Create new thread
router.post('/threads', isAuthenticatedUser, createThread);

// Get user's draft threads
router.get('/threads/drafts/my-drafts', isAuthenticatedUser, getDraftThreads);

// Get single thread with posts
router.get('/threads/:threadId', getThreadById);

// Update thread
router.put('/threads/:threadId', isAuthenticatedUser, updateThread);

// Delete thread
router.delete('/threads/:threadId', isAuthenticatedUser, deleteThread);

// Like/Unlike thread
router.post('/threads/:threadId/like', isAuthenticatedUser, toggleLikeThread);

// Increment view count
router.post('/threads/:threadId/views', incrementViewCount);

// ============ FORUM POSTS ROUTES ============

// Create post/reply on thread
router.post('/threads/:threadId/posts', isAuthenticatedUser, createPost);

// Update post
router.put('/posts/:postId', isAuthenticatedUser, updatePost);

// Delete post
router.delete('/posts/:postId', isAuthenticatedUser, deletePost);

// Like/Unlike post
router.post('/posts/:postId/like', isAuthenticatedUser, toggleLikePost);

// Get user's draft posts
router.get('/posts/drafts/my-drafts', isAuthenticatedUser, getDraftPosts);

// ============ POST INTERACTIONS ROUTES ============

// Mark post as interested
router.post('/posts/:postId/interested', isAuthenticatedUser, markInterested);

// Mark post as uninterested
router.post('/posts/:postId/uninterested', isAuthenticatedUser, markUninterested);

// ============ SAVE POST ROUTES ============

// Save/Unsave post
router.post('/posts/:postId/save', isAuthenticatedUser, toggleSavePost);

// Get user's saved posts
router.get('/saved-posts', isAuthenticatedUser, getUserSavedPosts);

// ============ REPORT POST ROUTES ============

// Report a post
router.post('/posts/:postId/report', isAuthenticatedUser, reportPost);

// Get post interaction status for user
router.get('/posts/:postId/interaction', isAuthenticatedUser, getPostInteraction);

// ============ THREAD INTERACTIONS ROUTES ============

// Mark thread as interested
router.post('/threads/:threadId/interested', isAuthenticatedUser, markInterestedThread);

// Mark thread as uninterested
router.post('/threads/:threadId/uninterested', isAuthenticatedUser, markUninterestedThread);

// ============ SAVE THREAD ROUTES ============

// Save/Unsave thread
router.post('/threads/:threadId/save', isAuthenticatedUser, toggleSaveThread);

// Get user's saved threads
router.get('/saved-threads', isAuthenticatedUser, getUserSavedThreads);

// ============ USER'S THREAD INTERACTIONS VIEW ============

// Get user's interested threads
router.get('/threads/interested/all', isAuthenticatedUser, getInterestedThreads);

// Get user's uninterested threads
router.get('/threads/uninterested/all', isAuthenticatedUser, getUninterestedThreads);

// ============ REPORT THREAD ROUTES ============

// Report a thread
router.post('/threads/:threadId/report', isAuthenticatedUser, reportThread);

// Get thread interaction status for user
router.get('/threads/:threadId/interaction', isAuthenticatedUser, getThreadInteraction);

module.exports = router;
