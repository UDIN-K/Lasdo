module.exports = {
  OPERATIONAL_HOURS: {
    START: 8,
    END: 22,
    MIN_SLOT: 8,
    MAX_SLOT: 21,
  },
  DEFAULT_PRICING: {
    futsal_day: 100000,
    futsal_night_weekend: 150000,
    serbaguna: 300000,
  },
  BOOKING_STATUSES: [
    'Menunggu Konfirmasi',
    'Dikonfirmasi',
    'Selesai',
    'Dibatalkan',
  ],
  PAYMENT_STATUSES: ['Belum Bayar', 'Lunas'],
  SERVICE_TYPES: ['futsal', 'serbaguna'],
  BUSINESS_INFO: {
    name: 'Lasdo Family Futsal',
    tagline: 'Penyewaan Lapangan Futsal Indoor & Gedung Serbaguna',
    owner: 'Christino Hirasdo Wiryawan',
    team: 'A26-CS150 — Capstone Asah 2026',
    address: 'Jl. Lapangan Futsal No. 15, Area Olahraga & Komunitas',
    phone: '0812-3456-7890',
    qrisNmid: 'ID102026110015099',
    operationalText: '08:00 - 22:00 WIB Setiap Hari',
  },
};
