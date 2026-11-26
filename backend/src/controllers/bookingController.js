const {
  createBooking,
  lookupBooking,
  getAllBookings,
  updateBookingStatus,
} = require('../services/bookingService');

function handleCreateBooking(req, res, next) {
  try {
    const result = createBooking(req.body);
    res.status(201).json({
      success: true,
      message: 'Pesanan berhasil dibuat! Silakan lakukan pembayaran via QRIS.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

function handleLookupBooking(req, res, next) {
  try {
    const { q } = req.query;
    const booking = lookupBooking(q);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Pesanan tidak ditemukan dengan kode booking atau nomor HP tersebut.',
      });
    }

    res.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
}

function handleGetAdminBookings(req, res, next) {
  try {
    const result = getAllBookings(req.query);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

function handleUpdateBookingStatus(req, res, next) {
  try {
    const { id } = req.params;
    const updated = updateBookingStatus(id, req.body);
    res.json({
      success: true,
      message: 'Status pesanan berhasil diperbarui.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  handleCreateBooking,
  handleLookupBooking,
  handleGetAdminBookings,
  handleUpdateBookingStatus,
};
