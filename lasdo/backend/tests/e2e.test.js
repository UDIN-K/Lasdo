const assert = require('assert');

process.env.NODE_ENV = 'test';
process.env.PORT = '5002';

const app = require('../server');

async function testHttpEndpoints() {
  console.log('🌐 Memulai Pengujian End-to-End HTTP Server Lasdo Family Futsal...\n');

  const server = app.listen(5002);
  const BASE_URL = 'http://localhost:5002';

  try {
    // 1. Health check
    console.log('1. Pengujian GET /api/health...');
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    assert.strictEqual(healthRes.status, 200);
    const healthData = await healthRes.json();
    assert.strictEqual(healthData.status, 'ok');
    console.log('✓ Health check berhasil:', healthData.app);

    // 2. Schedule endpoint
    console.log('\n2. Pengujian GET /api/schedules...');
    const schedRes = await fetch(`${BASE_URL}/api/schedules?date=2026-11-26`);
    assert.strictEqual(schedRes.status, 200);
    const schedData = await schedRes.json();
    assert.strictEqual(schedData.success, true);
    assert.strictEqual(schedData.data.slots.length, 14);
    console.log(`✓ Jadwal berhasil dimuat (${schedData.data.slots.length} slot jam 08:00 - 22:00)`);

    // 3. Create Booking & Collision Prevention via HTTP
    console.log('\n3. Pengujian POST /api/bookings...');
    const bookingRes = await fetch(`${BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_name: 'Juan Herbert Marpaung',
        phone_number: '081399887766',
        date: '2026-12-05',
        start_hour: 18,
        duration: 2, // 18:00 - 20:00
        service_type: 'futsal',
        event_notes: 'Latihan tim futsal kampus',
      }),
    });
    assert.strictEqual(bookingRes.status, 201);
    const bookingJson = await bookingRes.json();
    const createdCode = bookingJson.data.booking.booking_code;
    console.log(`✓ Pesanan berhasil dibuat via HTTP: ${createdCode}, Total: Rp ${bookingJson.data.booking.total_price.toLocaleString('id-ID')}`);

    // Uji bentrok HTTP 409 Conflict
    console.log('\n4. Pengujian Bentrok Jadwal via HTTP POST /api/bookings (Harus 409 Conflict)...');
    const clashRes = await fetch(`${BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_name: 'Penyewa Menabrak',
        phone_number: '085712349900',
        date: '2026-12-05',
        start_hour: 19,
        duration: 2, // 19:00 - 21:00 (beririsan di jam 19)
        service_type: 'futsal',
      }),
    });
    assert.strictEqual(clashRes.status, 409, 'Status bentrok harus 409 Conflict');
    const clashJson = await clashRes.json();
    console.log('✓ Respon penolakan bentrok HTTP 409:', clashJson.message);

    // 5. Lookup Booking via HTTP
    console.log('\n5. Pengujian GET /api/bookings/lookup?q=...');
    const lookupRes = await fetch(`${BASE_URL}/api/bookings/lookup?q=${encodeURIComponent(createdCode)}`);
    assert.strictEqual(lookupRes.status, 200);
    const lookupJson = await lookupRes.json();
    assert.strictEqual(lookupJson.data.booking_code, createdCode);
    console.log(`✓ Pelacakan pesanan berhasil: ${lookupJson.data.customer_name} (${lookupJson.data.payment_status})`);

    // 6. Admin Login via HTTP
    console.log('\n6. Pengujian POST /api/admin/login...');
    const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin',
        password: 'lasdo2026',
      }),
    });
    assert.strictEqual(loginRes.status, 200);
    const loginJson = await loginRes.json();
    const adminToken = loginJson.data.token;
    assert.ok(adminToken);
    console.log('✓ Login pengelola berhasil, JWT token diterima.');

    // 7. Protected Admin Bookings & Update Status
    console.log('\n7. Pengujian GET & PATCH /api/admin/bookings...');
    const adminBookingsRes = await fetch(`${BASE_URL}/api/admin/bookings`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(adminBookingsRes.status, 200);
    const adminBookingsJson = await adminBookingsRes.json();
    assert.ok(adminBookingsJson.data.bookings.length > 0);
    console.log(`✓ Admin mengambil daftar ${adminBookingsJson.data.bookings.length} pesanan.`);

    // Patch status pembayaran jadi Lunas
    const targetBookingId = bookingJson.data.booking.id;
    const patchRes = await fetch(`${BASE_URL}/api/admin/bookings/${targetBookingId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        booking_status: 'Dikonfirmasi',
        payment_status: 'Lunas',
      }),
    });
    assert.strictEqual(patchRes.status, 200);
    const patchJson = await patchRes.json();
    assert.strictEqual(patchJson.data.payment_status, 'Lunas');
    assert.strictEqual(patchJson.data.booking_status, 'Dikonfirmasi');
    console.log('✓ Pengelola berhasil memperbarui status booking dan QRIS menjadi Lunas.');

    // 8. Chatbot FAQ via HTTP
    console.log('\n8. Pengujian POST /api/chatbot...');
    const chatRes = await fetch(`${BASE_URL}/api/chatbot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Bagaimana cara pembayaran dengan QRIS?',
      }),
    });
    assert.strictEqual(chatRes.status, 200);
    const chatJson = await chatRes.json();
    assert.ok(chatJson.data.reply.includes('QRIS'));
    console.log('✓ Respon Chatbot FAQ valid via HTTP.');

    // 9. Crowd Prediction & Validation via HTTP
    console.log('\n9. Pengujian GET /api/admin/crowd-prediction...');
    const crowdRes = await fetch(`${BASE_URL}/api/admin/crowd-prediction?date=2026-12-05`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(crowdRes.status, 200);
    const crowdJson = await crowdRes.json();
    assert.strictEqual(crowdJson.data.predictions.length, 14);

    // Uji validasi jam salah (misal jam 25 atau jam 3 pagi)
    const invalidHourRes = await fetch(`${BASE_URL}/api/admin/crowd-prediction?date=2026-12-05&hour=23`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(invalidHourRes.status, 400, 'Jam di luar operasional wajib ditolak dengan HTTP 400');
    console.log('✓ Prediksi keramaian valid & penolakan jam luar operasional (HTTP 400) terkonfirmasi.');

    // 10. Intent Classification via HTTP
    console.log('\n10. Pengujian POST /api/admin/classify-intent...');
    const intentRes = await fetch(`${BASE_URL}/api/admin/classify-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        text: 'Apakah gedung serbaguna bisa disewa untuk acara syukuran warga?',
      }),
    });
    assert.strictEqual(intentRes.status, 200);
    const intentJson = await intentRes.json();
    assert.strictEqual(intentJson.data.intent, 'Sewa Gedung Serbaguna (Acara)');
    console.log(`✓ Klasifikasi Maksud: "${intentJson.data.intent}" (${(intentJson.data.confidence * 100).toFixed(1)}%)`);

    // 11. Analytics via HTTP
    console.log('\n11. Pengujian GET /api/admin/analytics...');
    const analyticsRes = await fetch(`${BASE_URL}/api/admin/analytics`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(analyticsRes.status, 200);
    const analyticsJson = await analyticsRes.json();
    assert.strictEqual(analyticsJson.data.isDemoData, true);
    console.log('✓ Analitik data UMKM valid dengan flag isDemoData: true.');

    // 12. Frontend SPA Index Serving via HTTP
    console.log('\n12. Pengujian GET / (Frontend Single Page App)...');
    const spaRes = await fetch(`${BASE_URL}/`);
    assert.strictEqual(spaRes.status, 200);
    const spaHtml = await spaRes.text();
    assert.ok(spaHtml.includes('Lasdo Family Futsal'));
    console.log('✓ Frontend static assets terlayani langsung oleh server.');

    console.log('\n=======================================================');
    console.log('🎉 SELURUH PENGUJIAN END-TO-END HTTP BERHASIL 100%!');
    console.log('=======================================================');
  } finally {
    server.close();
  }
}

testHttpEndpoints().catch((err) => {
  console.error('❌ E2E Test Failed:', err);
  process.exit(1);
});
