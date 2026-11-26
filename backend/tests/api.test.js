const assert = require('assert');

// Set test environment
process.env.NODE_ENV = 'test';
process.env.PORT = '5001';

const app = require('../server');
const db = require('../src/db/database');
const { getPricing, updatePricing } = require('../src/services/pricingService');
const { createBooking, lookupBooking } = require('../src/services/bookingService');
const { getDailySchedule } = require('../src/services/scheduleService');
const { predictCrowd, classifyIntent, processChatbotMessage } = require('../src/services/aiService');
const { getAnalyticsSummary } = require('../src/services/analyticsService');

async function runTests() {
  console.log('🧪 Memulai Pengujian Backend Lasdo Family Futsal...\n');

  // Test 1: Pricing default check
  console.log('Test 1: Memeriksa master tarif awal...');
  const pricing = getPricing();
  assert.strictEqual(typeof pricing.futsal_day, 'number');
  assert.strictEqual(typeof pricing.futsal_night_weekend, 'number');
  assert.strictEqual(typeof pricing.serbaguna, 'number');
  console.log('✓ Master tarif awal valid:', pricing);

  // Test 2: Jadwal slot jam operasional
  console.log('\nTest 2: Memeriksa ketersediaan jadwal harian (08:00 - 22:00)...');
  const todayStr = new Date().toISOString().split('T')[0];
  const schedule = getDailySchedule(todayStr);
  assert.strictEqual(schedule.slots.length, 14, 'Jumlah slot harus 14 (jam 8 s/d 21)');
  assert.strictEqual(schedule.slots[0].hour, 8);
  assert.strictEqual(schedule.slots[13].hour, 21);
  console.log(`✓ Slot jadwal valid (${schedule.slots.length} slot, ${schedule.availableSlotsCount} tersedia)`);

  // Test 3: Pembuatan pesanan & Penguncian Harga
  console.log('\nTest 3: Uji pembuatan pesanan & penguncian harga...');
  const testDate = '2026-12-01'; // Selasa (hari kerja)
  // Bersihkan record uji coba sebelumnya jika ada
  db.prepare("DELETE FROM bookings WHERE date = ? AND customer_name LIKE '%Fidel%'").run(testDate);
  db.prepare("DELETE FROM bookings WHERE date = ? AND customer_name LIKE '%Bentrok%'").run(testDate);

  const newBookingRes = createBooking({
    customer_name: 'Fidel Khalid',
    phone_number: '081234567890',
    date: testDate,
    start_hour: 14,
    duration: 2, // 14:00 - 16:00
    service_type: 'futsal',
    event_notes: 'Uji coba otomatis booking',
  });

  const created = newBookingRes.booking;
  assert.ok(created.booking_code.startsWith('LFF-'));
  assert.strictEqual(created.start_hour, 14);
  assert.strictEqual(created.end_hour, 16);
  assert.strictEqual(created.booking_status, 'Menunggu Konfirmasi');
  assert.strictEqual(created.payment_status, 'Belum Bayar');
  const originalTotalPrice = created.total_price;
  console.log(`✓ Booking berhasil dibuat: ${created.booking_code}, Total: Rp ${originalTotalPrice.toLocaleString('id-ID')}`);

  // Test 4: Uji Pencegahan Bentrok Jadwal (Conflict 409)
  console.log('\nTest 4: Uji pencegahan bentrok jadwal...');
  let clashCaught = false;
  try {
    // Mencoba booking di jam yang tumpang tindih: 15:00 - 17:00 (beririsan di jam 15)
    createBooking({
      customer_name: 'Calon Bentrok',
      phone_number: '085712345678',
      date: testDate,
      start_hour: 15,
      duration: 2,
      service_type: 'futsal',
    });
  } catch (err) {
    if (err.statusCode === 409) {
      clashCaught = true;
      console.log('✓ Berhasil menolak booking bentrok dengan HTTP 409:', err.message);
    } else {
      throw err;
    }
  }
  assert.strictEqual(clashCaught, true, 'Sistem harus menolak bentrok jadwal!');

  // Test 5: Uji Penguncian Harga (Price Locking Resilience)
  console.log('\nTest 5: Uji penguncian harga terhadap perubahan master tarif...');
  // Ubah tarif di masa depan
  updatePricing({
    futsal_day: 130000,
    futsal_night_weekend: 180000,
    serbaguna: 350000,
  });
  // Ambil kembali booking yang dibuat sebelumnya
  const lookupAfterPriceChange = lookupBooking(created.booking_code);
  assert.strictEqual(
    lookupAfterPriceChange.total_price,
    originalTotalPrice,
    'Total tagihan pesanan lama TIDAK boleh berubah setelah tarif master diubah!'
  );
  console.log(`✓ Penguncian harga terbukti aman: Total tetap Rp ${lookupAfterPriceChange.total_price.toLocaleString('id-ID')}`);
  // Kembalikan tarif ke standar
  updatePricing({
    futsal_day: 100000,
    futsal_night_weekend: 150000,
    serbaguna: 300000,
  });

  // Test 6: Uji Chatbot Fallback & Intent Classification
  console.log('\nTest 6: Uji Chatbot Fallback & Klasifikasi Intent...');
  const chatReply = await processChatbotMessage('Berapa tarif sewa lapangan futsal dan gedung serbaguna?');
  assert.ok(chatReply.reply.includes('100.000'));
  console.log('✓ Respons Chatbot:', chatReply.reply.slice(0, 80) + '...');

  const guardrailReply = await processChatbotMessage('Tolong tuliskan puisi tentang kopi dan politik');
  assert.ok(guardrailReply.reply.includes('Mohon maaf'));
  console.log('✓ Guardrail Chatbot:', guardrailReply.reply.slice(0, 80) + '...');

  const intent = classifyIntent('Halo min, mau booking lapangan futsal buat hari sabtu malam');
  assert.strictEqual(intent.intent, 'Pemesanan Lapangan / Booking');
  console.log(`✓ Klasifikasi Intent: "${intent.intent}" (Confidence: ${intent.confidence})`);

  // Test 7: Uji Prediksi Keramaian & Validasi Jam
  console.log('\nTest 7: Uji Prediksi Keramaian & Validasi Jam...');
  const crowd = predictCrowd(testDate);
  assert.strictEqual(crowd.predictions.length, 14);
  console.log(`✓ Prediksi keramaian 14 jam valid. Model utama: ${crowd.modelComparison.randomForest.modelName}`);

  let hourValidationCaught = false;
  try {
    predictCrowd(testDate, 23); // Jam 23 di luar operasional (08 - 21)
  } catch (err) {
    if (err.statusCode === 400) {
      hourValidationCaught = true;
      console.log('✓ Validasi jam di luar operasional berhasil:', err.message);
    }
  }
  assert.strictEqual(hourValidationCaught, true, 'Sistem harus menolak jam di luar 08-21 dengan HTTP 400!');

  // Test 8: Uji Analitik & Flag Data Dummy
  console.log('\nTest 8: Uji Analisis Data & Transparansi Simulasi...');
  const analytics = getAnalyticsSummary();
  assert.strictEqual(analytics.isDemoData, true, 'Flag isDemoData harus true');
  assert.ok(analytics.weeklyDistribution.length === 7);
  console.log(`✓ Analitik data valid (isDemoData: ${analytics.isDemoData}, ${analytics.businessInsights.length} temuan bisnis)`);

  console.log('\n🎉 SEMUA PENGUJIAN BACKEND BERHASIL 100%!');
}

runTests().catch((err) => {
  console.error('❌ Pengujian Gagal:', err);
  process.exit(1);
});
