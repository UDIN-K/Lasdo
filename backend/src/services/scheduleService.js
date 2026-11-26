const db = require('../db/database');
const { OPERATIONAL_HOURS } = require('../config/constants');
const { isWeekend, getHolidayInfo } = require('../utils/holidayHelper');
const { getPricing } = require('./pricingService');
const { calculateRentalPrice } = require('../utils/priceCalculator');

function getDailySchedule(dateStr) {
  // Ambil semua booking aktif di tanggal tersebut
  const activeBookings = db
    .prepare(
      `SELECT id, booking_code, service_type, customer_name, phone_number,
              date, start_hour, duration, end_hour,
              locked_price_per_hour, total_price,
              booking_status, payment_status, event_notes, created_at
       FROM bookings
       WHERE date = ? AND booking_status != 'Dibatalkan'
       ORDER BY start_hour ASC`
    )
    .all(dateStr);

  const weekend = isWeekend(dateStr);
  const holiday = getHolidayInfo(dateStr);
  const pricing = getPricing();

  // Susun slot jam 08:00 sampai 21:00 (14 slot 1-jam)
  const slots = [];
  for (let hour = OPERATIONAL_HOURS.MIN_SLOT; hour <= OPERATIONAL_HOURS.MAX_SLOT; hour++) {
    const endHour = hour + 1;
    const timeLabel = `${String(hour).padStart(2, '0')}:00 - ${String(endHour).padStart(2, '0')}:00`;

    // Cari apakah ada booking yang mencakup jam ini
    const matchedBooking = activeBookings.find(
      (b) => hour >= b.start_hour && hour < b.end_hour
    );

    // Hitung tarif estimasi untuk slot ini jika futsal & serbaguna
    const futsalPricing = calculateRentalPrice({
      serviceType: 'futsal',
      date: dateStr,
      startHour: hour,
      duration: 1,
      pricing,
    });

    const serbagunaPricing = calculateRentalPrice({
      serviceType: 'serbaguna',
      date: dateStr,
      startHour: hour,
      duration: 1,
      pricing,
    });

    slots.push({
      hour,
      endHour,
      timeLabel,
      isAvailable: !matchedBooking,
      futsalPrice: futsalPricing.totalPrice,
      serbagunaPrice: serbagunaPricing.totalPrice,
      booking: matchedBooking
        ? {
            id: matchedBooking.id,
            booking_code: matchedBooking.booking_code,
            service_type: matchedBooking.service_type,
            customer_name: matchedBooking.customer_name,
            booking_status: matchedBooking.booking_status,
            payment_status: matchedBooking.payment_status,
            start_hour: matchedBooking.start_hour,
            end_hour: matchedBooking.end_hour,
          }
        : null,
    });
  }

  return {
    date: dateStr,
    isWeekend: weekend,
    holiday,
    operationalHours: `${String(OPERATIONAL_HOURS.START).padStart(2, '0')}:00 - ${String(OPERATIONAL_HOURS.END).padStart(2, '0')}:00 WIB`,
    totalSlots: slots.length,
    availableSlotsCount: slots.filter((s) => s.isAvailable).length,
    bookedSlotsCount: slots.filter((s) => !s.isAvailable).length,
    slots,
    activeBookings,
  };
}

module.exports = {
  getDailySchedule,
};
