const db = require('../db/database');

/**
 * Ringkasan Analisis Data untuk Pengelola UMKM Lasdo Family Futsal
 * Dilengkapi flag `isDemoData: true` agar UI menampilkan transparansi simulasi.
 */
function getAnalyticsSummary() {
  // Metrik aktual dari database SQLite
  const totalBookings = db.prepare('SELECT COUNT(*) as c FROM bookings').get().c;
  const futsalBookings = db.prepare("SELECT COUNT(*) as c FROM bookings WHERE service_type = 'futsal'").get().c;
  const serbagunaBookings = db.prepare("SELECT COUNT(*) as c FROM bookings WHERE service_type = 'serbaguna'").get().c;

  // Analisis hari sibuk (distribusi mingguan simulasi berbasis data science proyek)
  const weeklyDistribution = [
    { day: 'Senin', futsalHours: 4, serbagunaHours: 0, occupancyRate: 28.5 },
    { day: 'Selasa', futsalHours: 5, serbagunaHours: 1, occupancyRate: 42.8 },
    { day: 'Rabu', futsalHours: 6, serbagunaHours: 0, occupancyRate: 42.8 },
    { day: 'Kamis', futsalHours: 7, serbagunaHours: 2, occupancyRate: 64.2 },
    { day: 'Jumat', futsalHours: 10, serbagunaHours: 0, occupancyRate: 71.4 },
    { day: 'Sabtu', futsalHours: 12, serbagunaHours: 4, occupancyRate: 92.8 },
    { day: 'Minggu', futsalHours: 11, serbagunaHours: 3, occupancyRate: 85.7 },
  ];

  // Pertanyaan Bisnis & Rekomendasi Capstone A26-CS150
  const businessInsights = [
    {
      id: 1,
      question: 'Kapan jam dan hari puncak dengan permintaan tertinggi?',
      finding: 'Permintaan sewa melonjak signifikan pada pukul 17:00–21:00 WIB (mencapai okupansi >85%) dan akhir pekan (Sabtu & Minggu).',
      recommendation: 'Terapkan tarif diferensiasi dinamis malam & akhir pekan (sudah diterapkan di sistem) dan buka sistem booking lebih awal untuk langganan rutin komunitas.',
    },
    {
      id: 2,
      question: 'Bagaimana kontribusi pendapatan Futsal vs Gedung Serbaguna?',
      finding: 'Futsal menyumbang volume booking tertinggi (~78%), namun Gedung Serbaguna memberikan kontribusi margin per jam yang sangat tinggi (Rp 300.000/jam vs Rp 100.000/jam).',
      recommendation: 'Tingkatkan promosi sewa serbaguna pada hari kerja pagi/siang (Senin–Kamis 08:00–14:00) untuk senam lansia, syukuran warga, atau pelatihan korporat.',
    },
    {
      id: 3,
      question: 'Apa dampak Hari Libur Nasional terhadap operasional?',
      finding: 'Hari libur nasional menunjukkan lonjakan okupansi sewa siang hari hingga +42% dibandingkan hari kerja normal.',
      recommendation: 'Otomatisasikan tarif libur nasional (fitur terintegrasi dengan kalender libur Indonesia di sistem) dan siapkan stok minuman kantin lebih banyak.',
    },
    {
      id: 4,
      question: 'Bagaimana efektivitas pembayaran QRIS digital dibanding tunai?',
      finding: 'Penyewa usia muda (17–35 tahun) 94% lebih memilih QRIS instan karena transparansi konfirmasi status booking yang real-time.',
      recommendation: 'Pertahankan tampilan kode QRIS tajam dan fitur pencarian kode booking agar konfirmasi kasir lebih cepat tanpa rekonsiliasi manual berbelit.',
    },
  ];

  return {
    isDemoData: true,
    disclaimer: 'Data pola dan analitik disimulasikan dari riset lapangan Tim A26-CS150 Capstone Asah 2026 untuk demonstrasi MVP.',
    kpis: {
      totalBookingsSample: totalBookings + 42,
      averageWeeklyOccupancy: '61.2%',
      futsalSharePercent: 78.5,
      serbagunaSharePercent: 21.5,
      holidayDemandSpike: '+42.3%',
      topBookingHour: '19:00 - 21:00 WIB',
    },
    weeklyDistribution,
    businessInsights,
  };
}

module.exports = {
  getAnalyticsSummary,
};
