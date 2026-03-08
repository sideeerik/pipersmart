const express = require('express');
const { exportActivitiesPDF, exportActivitiesWord } = require('../controllers/exportController');
const { isAuthenticatedUser } = require('../middlewares/auth');

const router = express.Router();

// ================= EXPORT ROUTES =================

// Export recent activities as PDF
router.get('/pdf', isAuthenticatedUser, exportActivitiesPDF);

// Export recent activities as Word
router.get('/word', isAuthenticatedUser, exportActivitiesWord);

module.exports = router;
