const express = require('express');
const router = express.Router();
const {
  handleCreateBooking,
  handleLookupBooking,
} = require('../controllers/bookingController');

router.post('/', handleCreateBooking);
router.get('/lookup', handleLookupBooking);

module.exports = router;
