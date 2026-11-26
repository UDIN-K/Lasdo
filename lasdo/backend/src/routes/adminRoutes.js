const express = require('express');
const router = express.Router();
const {
  handleAdminLogin,
  handleGetPricing,
  handleUpdatePricing,
} = require('../controllers/adminController');
const {
  handleGetAdminBookings,
  handleUpdateBookingStatus,
} = require('../controllers/bookingController');
const {
  handleCrowdPrediction,
  handleClassifyIntent,
  handleGetAnalytics,
} = require('../controllers/aiController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Public Admin Login
router.post('/login', handleAdminLogin);

// Protected Admin Routes
router.get('/bookings', authMiddleware, handleGetAdminBookings);
router.patch('/bookings/:id', authMiddleware, handleUpdateBookingStatus);
router.get('/pricing', authMiddleware, handleGetPricing);
router.put('/pricing', authMiddleware, handleUpdatePricing);

// AI & Data Science Admin Routes
router.get('/crowd-prediction', authMiddleware, handleCrowdPrediction);
router.post('/classify-intent', authMiddleware, handleClassifyIntent);
router.get('/analytics', authMiddleware, handleGetAnalytics);

module.exports = router;
