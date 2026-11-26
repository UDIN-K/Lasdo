const express = require('express');
const router = express.Router();

const scheduleRoutes = require('./scheduleRoutes');
const bookingRoutes = require('./bookingRoutes');
const adminRoutes = require('./adminRoutes');
const aiRoutes = require('./aiRoutes');

router.use('/schedules', scheduleRoutes);
router.use('/bookings', bookingRoutes);
router.use('/admin', adminRoutes);
router.use('/', aiRoutes); // handles /api/chatbot

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Lasdo Family Futsal API',
    version: '1.0.0',
    capstone: 'Capstone Asah 2026 - Tim A26-CS150',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
