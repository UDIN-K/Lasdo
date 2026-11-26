const { isWeekend, getHolidayInfo } = require('./holidayHelper');

/**
 * Menghitung harga sewa berdasarkan jenis layanan, tanggal, jam mulai, dan durasi.
 * Mengembalikan:
 * - totalPrice: Total yang harus dibayar customer
 * - lockedPricePerHour: Harga rata-rata per jam yang akan dikunci pada record booking
 * - breakdown: Rincian tarif per jam
 */
function calculateRentalPrice({ serviceType, date, startHour, duration, pricing }) {
  const holiday = getHolidayInfo(date);
  const weekend = isWeekend(date);
  const isPeakDay = weekend || holiday.isHoliday;

  let total = 0;
  const breakdown = [];

  for (let i = 0; i < duration; i++) {
    const hour = startHour + i;
    let hourlyRate = 0;
    let rateType = '';

    if (serviceType === 'serbaguna') {
      hourlyRate = pricing.serbaguna;
      rateType = 'Gedung Serbaguna';
    } else {
      // Futsal
      if (isPeakDay) {
        hourlyRate = pricing.futsal_night_weekend;
        rateType = holiday.isHoliday
          ? `Libur Nasional (${holiday.name})`
          : 'Akhir Pekan (Sabtu/Minggu)';
      } else {
        // Hari kerja biasa
        if (hour >= 17) {
          hourlyRate = pricing.futsal_night_weekend;
          rateType = 'Malam Hari (17:00 - 22:00)';
        } else {
          hourlyRate = pricing.futsal_day;
          rateType = 'Siang Hari (08:00 - 17:00)';
        }
      }
    }

    total += hourlyRate;
    breakdown.push({
      hour: `${String(hour).padStart(2, '0')}:00 - ${String(hour + 1).padStart(2, '0')}:00`,
      rate: hourlyRate,
      rateType,
    });
  }

  const lockedPricePerHour = Math.round(total / duration);

  return {
    totalPrice: total,
    lockedPricePerHour,
    breakdown,
    isPeakDay,
    holidayName: holiday.name,
  };
}

module.exports = {
  calculateRentalPrice,
};
