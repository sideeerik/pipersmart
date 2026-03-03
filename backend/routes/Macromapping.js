const express = require('express');
const {
  saveLocation,
  getSavedLocations,
  getLocationDetails,
  unsaveLocation,
  updateLocation,
  recordVisit,
  getLocationTips,
  toggleFavorite,
  deleteAllSavedLocations
} = require('../controllers/macromappingController');

const { isAuthenticatedUser } = require('../middlewares/auth');

const router = express.Router();

// ================= SAVED LOCATIONS =================
// Save a location
router.post('/save', isAuthenticatedUser, saveLocation);

// Get all saved locations (with sorting and filtering)
router.get('/saved', isAuthenticatedUser, getSavedLocations);

// Get single saved location with tips
router.get('/saved/:locationId', isAuthenticatedUser, getLocationDetails);

// Unsave a location
router.delete('/saved/:locationId', isAuthenticatedUser, unsaveLocation);

// Update location notes, tags, ratings
router.put('/saved/:locationId', isAuthenticatedUser, updateLocation);

// Toggle favorite status
router.patch('/saved/:locationId/favorite', isAuthenticatedUser, toggleFavorite);

// Record a visit
router.post('/saved/:locationId/visit', isAuthenticatedUser, recordVisit);

// Delete all saved locations
router.delete('/saved', isAuthenticatedUser, deleteAllSavedLocations);

// ================= LOCATION TIPS =================
// Get tips for any location (doesn't require save)
router.get('/tips', getLocationTips);

module.exports = router;
