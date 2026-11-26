const db = require('../db/database');
const { OPERATIONAL_HOURS, BOOKING_STATUSES, PAYMENT_STATUSES } = require('../config/constants');
const { generateBookingCode } = require('../utils/bookingCodeGenerator');
const { getPricing } = require('./pricingService');
const { calculateRentalPrice } = require('../utils/priceCalculator');

// Validasi format nomor HP Indonesia (+62 / 62 / 08, min 9 digit, max 14 digit)
function isValidIndonesianPhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  const cleanPhone = phone.replace(/[\s\-]/g, '');
  const regex = /^(?:\+62|62|0)8[1-9][0-9]{6,11}$/;
  return regex.test(cleanPhone);
}

function cleanPhoneNumber(phone) {
  return phone.replace(/[\s\-]/g, '');
}

/**
 * Buat Pesanan Baru dengan Validasi & Pencegahan Bentrok
 */
function createBooking(payload) {
  const {
    customer_name,
    phone_number,
    date,
    start_hour,
    duration,
    service_type = 'futsal',
    event_notes = '',
  } = payload;

  // 1. Validasi Nama
  if (!customer_name || typeof customer_name !== 'string' || customer_name.trim().length < 2) {
    const err = new Error('Nama pemesan wajib diisi dengan minimal 2 karakter.');
    err.statusCode = 400;
    throw err;
  }

  // 2. Validasi Nomor Telepon
  if (!isValidIndonesianPhone(phone_number)) {
    const err = new Error(
      'Nomor telepon tidak valid. Gunakan format nomor HP Indonesia aktif (contoh: 08123456789 atau +628123456789).'
    );
    err.statusCode = 400;
    throw err;
  }

  // 3. Validasi Tanggal
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const err = new Error('Format tanggal sewa tidak valid (wajib YYYY-MM-DD).');
    err.statusCode = 400;
    throw err;
  }

  // 4. Validasi Jam Mulai & Durasi Operasional
  const startH = parseInt(start_hour, 10);
  const dur = parseInt(duration, 10);

  if (isNaN(startH) || startH < OPERATIONAL_HOURS.MIN_SLOT || startH > OPERATIONAL_HOURS.MAX_SLOT) {
    const err = new Error(
      `Jam mulai sewa harus berada dalam jam operasional (${String(OPERATIONAL_HOURS.START).padStart(2, '0')}:00 s/d ${String(OPERATIONAL_HOURS.MAX_SLOT).padStart(2, '0')}:00).`
    );
    err.statusCode = 400;
    throw err;
  }

  if (isNaN(dur) || dur < 1) {
    const err = new Error('Durasi sewa minimal 1 jam.');
    err.statusCode = 400;
    throw err;
  }

  const endH = startH + dur;
  if (endH > OPERATIONAL_HOURS.END) {
    const err = new Error(
      `Total durasi sewa melebihi jam operasional tutup (${String(OPERATIONAL_HOURS.END).padStart(2, '0')}:00 WIB). Maksimal sewa hingga pukul 22:00.`
    );
    err.statusCode = 400;
    throw err;
  }

  // 5. Validasi Jenis Layanan
  const validService = service_type === 'serbaguna' ? 'serbaguna' : 'futsal';

  // 6. Pencegahan Bentrok Jadwal (Schedule Clash Prevention)
  // Bentrok jika: existing.start_hour < newEnd && existing.end_hour > newStart
  const conflictingBooking = db
    .prepare(
      `SELECT id, booking_code, customer_name, service_type, start_hour, end_hour
       FROM bookings
       WHERE date = ? 
         AND booking_status != 'Dibatalkan'
         AND (start_hour < ? AND end_hour > ?)
       LIMIT 1`
    )
    .get(date, endH, startH);

  if (conflictingBooking) {
    const clashService = conflictingBooking.service_type === 'futsal' ? 'Futsal' : 'Gedung Serbaguna';
    const err = new Error(
      `Jadwal bentrok! Slot jam ${String(conflictingBooking.start_hour).padStart(2, '0')}:00 - ${String(conflictingBooking.end_hour).padStart(2, '0')}:00 sudah terisi (${conflictingBooking.booking_code} - ${clashService}). Silakan pilih jam atau tanggal lain.`
    );
    err.statusCode = 409; // HTTP 409 Conflict
    err.conflictDetails = conflictingBooking;
    throw err;
  }

  // 7. Penguncian Harga Server-Side (Price Locking)
  const currentPricing = getPricing();
  const priceResult = calculateRentalPrice({
    serviceType: validService,
    date,
    startHour: startH,
    duration: dur,
    pricing: currentPricing,
  });

  // 8. Generate Booking Code & Simpan ke DB
  const bookingCode = generateBookingCode(db);
  const cleanedPhone = cleanPhoneNumber(phone_number);
  const now = new Date().toISOString();

  const insertStmt = db.prepare(`
    INSERT INTO bookings (
      booking_code, service_type, customer_name, phone_number,
      date, start_hour, duration, end_hour,
      locked_price_per_hour, total_price,
      booking_status, payment_status, payment_method, event_notes,
      created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?,
      'Menunggu Konfirmasi', 'Belum Bayar', 'QRIS', ?,
      ?, ?
    )
  `);

  const result = insertStmt.run(
    bookingCode,
    validService,
    customer_name.trim(),
    cleanedPhone,
    date,
    startH,
    dur,
    endH,
    priceResult.lockedPricePerHour,
    priceResult.totalPrice,
    event_notes ? event_notes.trim() : '',
    now,
    now
  );

  const createdBooking = db
    .prepare('SELECT * FROM bookings WHERE id = ?')
    .get(result.lastInsertRowid);

  return {
    booking: createdBooking,
    priceBreakdown: priceResult.breakdown,
    qrisDetails: {
      merchantName: 'Lasdo Family Futsal',
      nmid: 'ID102026110015099',
      bookingCode,
      amount: priceResult.totalPrice,
      paymentStatus: 'Belum Bayar',
    },
  };
}

/**
 * Pencarian Status Pesanan & Pembayaran QRIS untuk Customer
 */
function lookupBooking(query) {
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    const err = new Error('Masukkan kode booking atau nomor telepon.');
    err.statusCode = 400;
    throw err;
  }

  const cleanQ = query.trim();
  const cleanPhone = cleanQ.replace(/[\s\-]/g, '');

  const booking = db
    .prepare(
      `SELECT * FROM bookings 
       WHERE booking_code = ? 
          OR phone_number = ? 
          OR phone_number = ?
       ORDER BY id DESC LIMIT 1`
    )
    .get(cleanQ.toUpperCase(), cleanQ, cleanPhone);

  if (!booking) {
    return null;
  }

  return {
    ...booking,
    qrisDetails: {
      merchantName: 'Lasdo Family Futsal',
      nmid: 'ID102026110015099',
      bookingCode: booking.booking_code,
      amount: booking.total_price,
      paymentStatus: booking.payment_status,
      bookingStatus: booking.booking_status,
    },
  };
}

/**
 * Ambil Seluruh Pesanan untuk Portal Pengelola
 */
function getAllBookings(filters = {}) {
  const { status, payment, search, date } = filters;

  let query = 'SELECT * FROM bookings WHERE 1=1';
  const params = [];

  if (status && BOOKING_STATUSES.includes(status)) {
    query += ' AND booking_status = ?';
    params.push(status);
  }

  if (payment && PAYMENT_STATUSES.includes(payment)) {
    query += ' AND payment_status = ?';
    params.push(payment);
  }

  if (date) {
    query += ' AND date = ?';
    params.push(date);
  }

  if (search) {
    query += ' AND (booking_code LIKE ? OR customer_name LIKE ? OR phone_number LIKE ?)';
    const searchPattern = `%${search.trim()}%`;
    params.push(searchPattern, searchPattern, searchPattern);
  }

  query += ' ORDER BY date DESC, start_hour DESC, id DESC';

  const bookings = db.prepare(query).all(...params);

  // Hitung Metrik Ringkasan
  const totalBookings = db.prepare('SELECT COUNT(*) as count FROM bookings').get().count;
  const pendingCount = db.prepare("SELECT COUNT(*) as count FROM bookings WHERE booking_status = 'Menunggu Konfirmasi'").get().count;
  const confirmedCount = db.prepare("SELECT COUNT(*) as count FROM bookings WHERE booking_status = 'Dikonfirmasi'").get().count;
  const completedCount = db.prepare("SELECT COUNT(*) as count FROM bookings WHERE booking_status = 'Selesai'").get().count;
  const cancelledCount = db.prepare("SELECT COUNT(*) as count FROM bookings WHERE booking_status = 'Dibatalkan'").get().count;
  const unpaidCount = db.prepare("SELECT COUNT(*) as count FROM bookings WHERE payment_status = 'Belum Bayar' AND booking_status != 'Dibatalkan'").get().count;
  
  const revenueRow = db.prepare("SELECT SUM(total_price) as sum FROM bookings WHERE payment_status = 'Lunas' AND booking_status != 'Dibatalkan'").get();
  const totalRevenue = revenueRow && revenueRow.sum ? revenueRow.sum : 0;

  return {
    bookings,
    metrics: {
      totalBookings,
      pendingCount,
      confirmedCount,
      completedCount,
      cancelledCount,
      unpaidCount,
      totalRevenue,
    },
  };
}

/**
 * Update Status Pemesanan atau Pembayaran oleh Pengelola
 */
function updateBookingStatus(id, updateData) {
  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id);
  if (!booking) {
    const err = new Error(`Pesanan dengan ID ${id} tidak ditemukan.`);
    err.statusCode = 404;
    throw err;
  }

  const { booking_status, payment_status } = updateData;

  let newBookingStatus = booking.booking_status;
  let newPaymentStatus = booking.payment_status;

  if (booking_status) {
    if (!BOOKING_STATUSES.includes(booking_status)) {
      const err = new Error(`Status pemesanan "${booking_status}" tidak valid.`);
      err.statusCode = 400;
      throw err;
    }
    newBookingStatus = booking_status;
  }

  if (payment_status) {
    if (!PAYMENT_STATUSES.includes(payment_status)) {
      const err = new Error(`Status pembayaran "${payment_status}" tidak valid.`);
      err.statusCode = 400;
      throw err;
    }
    newPaymentStatus = payment_status;
  }

  const now = new Date().toISOString();
  db.prepare(`
    UPDATE bookings 
    SET booking_status = ?, payment_status = ?, updated_at = ?
    WHERE id = ?
  `).run(newBookingStatus, newPaymentStatus, now, id);

  return db.prepare('SELECT * FROM bookings WHERE id = ?').get(id);
}

module.exports = {
  createBooking,
  lookupBooking,
  getAllBookings,
  updateBookingStatus,
  isValidIndonesianPhone,
};
