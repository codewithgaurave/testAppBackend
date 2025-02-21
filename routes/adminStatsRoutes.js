const express = require('express');
const { getDetailedStats, getUserTestStats } = require('../controllers/adminStatsController');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();

// Get detailed stats for admin dashboard
router.get('/detailed', protect, admin, getDetailedStats);

// Get specific user's test statistics
router.get('/user/:userId', protect, admin, getUserTestStats);

module.exports = router;