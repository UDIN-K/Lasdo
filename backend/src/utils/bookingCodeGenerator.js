/**
 * Generate Kode Booking Unik
 * Format: LFF-YYMM-XXX (contoh: LFF-2611-001)
 */
function generateBookingCode(db) {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `LFF-${yy}${mm}-`;

  try {
    const row = db
      .prepare(
        `SELECT booking_code FROM bookings 
         WHERE booking_code LIKE ? 
         ORDER BY id DESC LIMIT 1`
      )
      .get(`${prefix}%`);

    let nextNumber = 1;
    if (row && row.booking_code) {
      const parts = row.booking_code.split('-');
      const lastSeq = parseInt(parts[2], 10);
      if (!isNaN(lastSeq)) {
        nextNumber = lastSeq + 1;
      }
    }
    return `${prefix}${String(nextNumber).padStart(3, '0')}`;
  } catch (error) {
    const rand = Math.floor(100 + Math.random() * 900);
    return `${prefix}${rand}`;
  }
}

module.exports = {
  generateBookingCode,
};
