const express = require('express');
const router = express.Router();
const {
  getLatestNews,
  getProductionStats,
  getHealthBenefits,
  getDiseaseInfo,
  getCultivationGuide,
  searchNews,
} = require('../controllers/News');

// Get latest news with optional filtering
router.get('/latest', getLatestNews);

// Get production statistics
router.get('/stats/production', getProductionStats);

// Get health benefits information
router.get('/benefits', getHealthBenefits);

// Get disease management information
router.get('/diseases', getDiseaseInfo);

// Get cultivation guide
router.get('/guide/cultivation', getCultivationGuide);

// Search news by keyword
router.get('/search', searchNews);

module.exports = router;
