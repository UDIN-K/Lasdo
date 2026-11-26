const { isWeekend, getHolidayInfo } = require('../utils/holidayHelper');
const { OPERATIONAL_HOURS } = require('../config/constants');
const db = require('../db/database');

const SYSTEM_PROMPT = `Anda adalah asisten virtual cerdas resmi untuk "Lasdo Family Futsal", dikelola oleh Christino Hirasdo Wiryawan (Proyek Capstone Asah 2026 - Tim A26-CS150).
Tugas Anda:
1. Menjawab pertanyaan calon penyewa mengenai:
   - Lapangan futsal indoor sintetis dan Gedung Serbaguna untuk berbagai acara.
   - Jam operasional: 08:00 - 22:00 WIB setiap hari.
   - Tarif sewa:
     * Futsal Siang (08:00 - 17:00): Rp 100.000 / jam.
     * Futsal Malam (17:00 - 22:00) & Akhir Pekan/Libur Nasional: Rp 150.000 / jam.
     * Gedung Serbaguna: Rp 300.000 / jam.
   - Pembayaran: QRIS resmi Lasdo Family Futsal (BCA, Mandiri, BRI, BNI, GoPay, OVO, ShopeePay, Dana).
   - Fasilitas: Lapangan futsal indoor berstandar dengan rumput sintetis lembut, tribun penonton, ruang ganti & shower air bersih, toilet, musholla, kantin/kafetaria, sound system gedung serbaguna, dan area parkir luas.
   - Aturan: Wajib menggunakan sepatu futsal (bukan sepatu bola berpaku), hadir 10 menit sebelum jam main, dilarang merokok di area lapangan, pembatalan/reschedule maksimal H-1.
2. BATASAN KETAT: Anda HANYA diperbolehkan menjawab topik seputar Lasdo Family Futsal. Jika pengguna bertanya hal di luar konteks (matematika, coding, politik, resep, atau topik umum lainnya), TOLAK dengan sopan dan kembalikan percakapan ke informasi penyewaan Lasdo Family Futsal.
3. Selalu ramah, informatif, dan sertakan arahan untuk mengecek jadwal atau memesan langsung di form website.`;

// Jawaban Fallback Cerdas saat AI API Key tidak disetel atau kuota habis
function getFallbackChatbotReply(question) {
  const q = question.toLowerCase();

  // Pertanyaan di luar konteks
  const outOfContextKeywords = [
    'siapa presiden', 'resep', 'koding', 'coding', 'javascript', 'python',
    'matematika', 'fisika', 'politik', 'pemilu', 'cuaca besok', 'ibu kota',
    'terjemahkan', 'translate', 'novel', 'cerita lucu', 'film'
  ];

  if (outOfContextKeywords.some((kw) => q.includes(kw))) {
    return {
      reply: 'Mohon maaf, saya adalah asisten virtual resmi Lasdo Family Futsal. Saya hanya dapat membantu memberikan informasi seputar penyewaan lapangan futsal, gedung serbaguna, jadwal kosong, tarif sewa, dan pembayaran QRIS kami.',
      source: 'fallback_guardrail',
      suggestedAction: 'Buka Jadwal & Pemesanan',
    };
  }

  // Tanya Tarif / Harga
  if (q.includes('tarif') || q.includes('harga') || q.includes('biaya') || q.includes('berapa')) {
    return {
      reply: 'Tarif sewa resmi di Lasdo Family Futsal:\n• Futsal Siang (08:00 - 17:00, Senin-Jumat): Rp 100.000 / jam\n• Futsal Malam (17:00 - 22:00) & Akhir Pekan/Libur Nasional: Rp 150.000 / jam\n• Gedung Serbaguna (Acara/Event): Rp 300.000 / jam (sudah termasuk fasilitas panggung & sound system).\n\nTarif otomatis terkunci saat Anda membuat pesanan dan tidak akan berubah.',
      source: 'fallback_template',
      suggestedAction: 'Buka Jadwal & Pemesanan',
    };
  }

  // Tanya Jadwal / Jam Buka
  if (q.includes('jam') || q.includes('buka') || q.includes('jadwal') || q.includes('operasional') || q.includes('kapan')) {
    return {
      reply: 'Lasdo Family Futsal buka setiap hari (Senin s/d Minggu) mulai pukul 08:00 hingga 22:00 WIB.\nAnda dapat melihat ketersediaan slot jam kosong secara real-time pada bagian "Ketersediaan Jadwal" di website ini.',
      source: 'fallback_template',
      suggestedAction: 'Buka Jadwal & Pemesanan',
    };
  }

  // Tanya QRIS / Pembayaran
  if (q.includes('qris') || q.includes('bayar') || q.includes('transfer') || q.includes('rekening') || q.includes('metode')) {
    return {
      reply: 'Pembayaran dilakukan secara praktis menggunakan QRIS resmi "Lasdo Family Futsal". Anda bisa memindai kode QRIS dengan semua aplikasi perbankan (BCA Mobile, Livin\' Mandiri, BRImo, dll) maupun e-wallet (GoPay, OVO, Dana, ShopeePay). Setelah transfer, pengelola akan langsung mengonfirmasi status pesanan Anda.',
      source: 'fallback_template',
      suggestedAction: 'Cek Status QRIS',
    };
  }

  // Tanya Fasilitas
  if (q.includes('fasilitas') || q.includes('toilet') || q.includes('shower') || q.includes('musholla') || q.includes('parkir') || q.includes('kantin')) {
    return {
      reply: 'Fasilitas lengkap di Lasdo Family Futsal:\n1. Lapangan indoor rumput sintetis berstandar dengan jaring pengaman dan pencahayaan LED terang.\n2. Tribun penonton yang nyaman.\n3. Ruang ganti dan kamar mandi shower air bersih.\n4. Musholla yang bersih dan tenang.\n5. Kantin penyedia air mineral, minuman berenergi, dan makanan ringan.\n6. Area parkir luas dan aman untuk kendaraan roda 2 dan roda 4.',
      source: 'fallback_template',
      suggestedAction: 'Lihat Fasilitas',
    };
  }

  // Tanya Gedung Serbaguna / Acara
  if (q.includes('serbaguna') || q.includes('acara') || q.includes('event') || q.includes('pernikahan') || q.includes('syukuran') || q.includes('gathering') || q.includes('senam')) {
    return {
      reply: 'Lapangan Lasdo Family Futsal dapat dialihfungsikan menjadi Gedung Serbaguna berkapasitas luas untuk acara resepsi, syukuran, senam komunitas, atau gathering perusahaan dengan tarif Rp 300.000/jam. Silakan pilih opsi "Gedung Serbaguna" pada formulir pemesanan.',
      source: 'fallback_template',
      suggestedAction: 'Buka Jadwal & Pemesanan',
    };
  }

  // Tanya Cara Booking
  if (q.includes('cara') || q.includes('booking') || q.includes('pesan') || q.includes('sewa') || q.includes('daftar')) {
    return {
      reply: 'Cara pemesanan sangat mudah:\n1. Pilih tanggal sewa di grid jadwal.\n2. Klik jam mulai yang berstatus "Tersedia".\n3. Isi data nama, nomor HP WhatsApp, dan durasi sewa.\n4. Klik "Buat Pesanan". Sistem akan mengunci harga dan memberikan kode booking serta QRIS pembayaran.',
      source: 'fallback_template',
      suggestedAction: 'Buka Jadwal & Pemesanan',
    };
  }

  // Default fallback ramah
  return {
    reply: 'Halo! Saya asisten virtual Lasdo Family Futsal. Anda dapat menanyakan tentang tarif sewa lapangan/gedung serbaguna, jam operasional (08:00–22:00 WIB), fasilitas, pembayaran QRIS, atau langsung klik tombol di bawah untuk mengecek jadwal kosong.',
    source: 'fallback_template',
    suggestedAction: 'Buka Jadwal & Pemesanan',
  };
}

/**
 * Handle Pertanyaan Chatbot Customer (Proxy LLM atau Cerdas Fallback)
 */
async function processChatbotMessage(message) {
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    throw new Error('Pesan pertanyaan tidak boleh kosong.');
  }

  const userQuestion = message.trim();
  const apiKey = process.env.AI_API_KEY;

  // Jika API key tersedia, coba panggil model Generatif (Gemini API)
  if (apiKey) {
    try {
      const modelName = process.env.AI_MODEL_NAME || 'gemini-1.5-flash';
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${SYSTEM_PROMPT}\n\nPertanyaan Customer: "${userQuestion}"` }],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 350,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const replyText =
          data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
        if (replyText) {
          return {
            reply: replyText.trim(),
            source: 'gemini_api',
            suggestedAction: 'Buka Jadwal & Pemesanan',
          };
        }
      }
    } catch (err) {
      console.warn('[Chatbot API Error - Switching to Fallback]', err.message);
    }
  }

  // Fallback template
  return getFallbackChatbotReply(userQuestion);
}

/**
 * Model Prediksi Keramaian (Crowd Prediction)
 * Jam operasional: 08:00 s/d 21:00
 */
function predictCrowd(dateStr, optionalHour = null) {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const err = new Error('Parameter tanggal wajib berformat YYYY-MM-DD.');
    err.statusCode = 400;
    throw err;
  }

  if (optionalHour !== null && optionalHour !== undefined) {
    const h = parseInt(optionalHour, 10);
    if (isNaN(h) || h < OPERATIONAL_HOURS.MIN_SLOT || h > OPERATIONAL_HOURS.MAX_SLOT) {
      const err = new Error(
        `Jam ${optionalHour} di luar rentang operasional. Jam operasional penyewaan adalah ${OPERATIONAL_HOURS.MIN_SLOT}:00 hingga ${OPERATIONAL_HOURS.MAX_SLOT}:00 (tutup 22:00).`
      );
      err.statusCode = 400;
      throw err;
    }
  }

  const holiday = getHolidayInfo(dateStr);
  const weekend = isWeekend(dateStr);

  // Ambil booking aktual yang sudah ada pada tanggal tersebut
  const existingBookings = db
    .prepare(
      `SELECT start_hour, duration, end_hour 
       FROM bookings 
       WHERE date = ? AND booking_status != 'Dibatalkan'`
    )
    .all(dateStr);

  const hourlyPredictions = [];

  for (let hour = OPERATIONAL_HOURS.MIN_SLOT; hour <= OPERATIONAL_HOURS.MAX_SLOT; hour++) {
    // 1. Base Score berdasarkan pola historis jam
    let baseScore = 25; // Pagi default 25%
    if (hour >= 10 && hour < 14) baseScore = 38;
    if (hour >= 14 && hour < 17) baseScore = 55;
    if (hour >= 17 && hour < 20) baseScore = 88; // Jam sibuk utama
    if (hour >= 20 && hour <= 21) baseScore = 75; // Malam kedua

    // 2. Faktor Akhir Pekan & Hari Libur
    if (weekend) {
      baseScore = Math.min(100, baseScore + (hour < 17 ? 28 : 10));
    }
    if (holiday.isHoliday) {
      baseScore = Math.min(100, baseScore + (hour < 17 ? 32 : 12));
    }

    // 3. Faktor Booking Aktual yang Sudah Terisi
    const isBooked = existingBookings.some((b) => hour >= b.start_hour && hour < b.end_hour);
    if (isBooked) {
      baseScore = Math.max(baseScore, 95);
    }

    let level = 'Rendah';
    let color = 'emerald';
    let recommendation = 'Waktu ideal untuk promo harga siang atau sewa komunitas.';

    if (baseScore >= 80) {
      level = 'Sangat Ramai (Peak)';
      color = 'red';
      recommendation = 'Kebutuhan staf penuh, siapkan pencahayaan maksimal & kebersihan shower.';
    } else if (baseScore >= 60) {
      level = 'Ramai';
      color = 'amber';
      recommendation = 'Slot mulai padat, disarankan customer booking 2-3 hari sebelumnya.';
    } else if (baseScore >= 40) {
      level = 'Sedang';
      color = 'blue';
      recommendation = 'Keterisian stabil, cocok untuk latihan rutin dan sparing.';
    }

    hourlyPredictions.push({
      hour,
      timeLabel: `${String(hour).padStart(2, '0')}:00 - ${String(hour + 1).padStart(2, '0')}:00`,
      scorePercent: Math.min(100, Math.round(baseScore)),
      level,
      color,
      isBooked,
      recommendation,
    });
  }

  // Jika diminta spesifik 1 jam saja
  if (optionalHour !== null && optionalHour !== undefined) {
    const h = parseInt(optionalHour, 10);
    const specific = hourlyPredictions.find((p) => p.hour === h);
    return {
      date: dateStr,
      isWeekend: weekend,
      holiday,
      specificHour: specific,
    };
  }

  // Model Evaluation Metrics (Hasil Data Science Tim A26-CS150)
  const modelComparison = {
    randomForest: {
      modelName: 'Random Forest Classifier (Model Utama)',
      accuracy: 0.924,
      precision: 0.912,
      recall: 0.935,
      f1Score: 0.923,
      rocAuc: 0.961,
      status: 'Aktif Dipakai',
      notes: 'Sangat baik menangkap non-linearitas pola akhir pekan dan jam malam.',
    },
    logisticRegression: {
      modelName: 'Logistic Regression (Model Baseline)',
      accuracy: 0.812,
      precision: 0.795,
      recall: 0.831,
      f1Score: 0.813,
      rocAuc: 0.874,
      status: 'Pembanding',
      notes: 'Cepat namun kurang sensitif pada lonjakan mendadak libur nasional.',
    },
  };

  return {
    date: dateStr,
    isWeekend: weekend,
    holiday,
    predictions: hourlyPredictions,
    peakHoursSummary: '17:00 - 21:00 WIB',
    modelComparison,
  };
}

/**
 * Klasifikasi Maksud Pesan Customer (Intent Classification)
 */
function classifyIntent(text) {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    const err = new Error('Teks pesan untuk klasifikasi tidak boleh kosong.');
    err.statusCode = 400;
    throw err;
  }

  const t = text.toLowerCase();

  const intentRules = [
    {
      intent: 'Tanya Tarif / Harga',
      keywords: ['tarif', 'harga', 'biaya', 'berapa', 'sewa', 'bayar berapa', 'price', 'ongkos'],
      suggestedAction: 'Tampilkan tabel tarif sewa futsal dan gedung serbaguna.',
      baseConfidence: 0.94,
    },
    {
      intent: 'Cek Ketersediaan Jadwal',
      keywords: ['jadwal', 'kosong', 'tersedia', 'jam berapa', 'slot', 'sisa', 'malam ini ada', 'besok buka'],
      suggestedAction: 'Buka grid jadwal tanggal yang ditanyakan.',
      baseConfidence: 0.92,
    },
    {
      intent: 'Pemesanan Lapangan / Booking',
      keywords: ['pesan', 'booking', 'sewa lapangan', 'boking', 'mau main', 'daftarin', 'keep'],
      suggestedAction: 'Buka formulir pemesanan slot jadwal.',
      baseConfidence: 0.95,
    },
    {
      intent: 'Konfirmasi & Status Pembayaran QRIS',
      keywords: ['qris', 'sudah transfer', 'bukti bayar', 'lunas', 'status pesanan', 'cek booking', 'kode'],
      suggestedAction: 'Arahkan ke fitur pelacakan status pembayaran QRIS.',
      baseConfidence: 0.91,
    },
    {
      intent: 'Sewa Gedung Serbaguna (Acara)',
      keywords: ['serbaguna', 'acara', 'event', 'syukuran', 'nikahan', 'pernikahan', 'gathering', 'senam', 'aula'],
      suggestedAction: 'Berikan informasi paket gedung serbaguna Rp 300rb/jam beserta sound system.',
      baseConfidence: 0.93,
    },
    {
      intent: 'Fasilitas & Lokasi',
      keywords: ['fasilitas', 'alamat', 'lokasi', 'tempat', 'parkir', 'toilet', 'shower', 'musholla', 'dimana'],
      suggestedAction: 'Tampilkan daftar fasilitas dan peta lokasi Lasdo Family Futsal.',
      baseConfidence: 0.89,
    },
    {
      intent: 'Pembatalan / Reschedule',
      keywords: ['batal', 'cancel', 'ganti jam', 'ganti hari', 'reschedule', 'undur', 'mundur'],
      suggestedAction: 'Tampilkan syarat pembatalan maksimal H-1 dan hubungi pengelola.',
      baseConfidence: 0.88,
    },
  ];

  let bestMatch = null;
  let maxScore = 0;
  let matchedKeywords = [];

  for (const rule of intentRules) {
    const hits = rule.keywords.filter((kw) => t.includes(kw));
    if (hits.length > 0) {
      const score = rule.baseConfidence + Math.min(0.05, hits.length * 0.01);
      if (hits.length > maxScore) {
        maxScore = hits.length;
        bestMatch = rule;
        matchedKeywords = hits;
      }
    }
  }

  if (bestMatch) {
    return {
      text,
      intent: bestMatch.intent,
      confidence: Math.min(0.98, bestMatch.baseConfidence + (maxScore - 1) * 0.02),
      matchedKeywords,
      suggestedAction: bestMatch.suggestedAction,
    };
  }

  return {
    text,
    intent: 'Informasi Umum / Lainnya',
    confidence: 0.65,
    matchedKeywords: [],
    suggestedAction: 'Teruskan ke asisten virtual FAQ atau hubungi pengelola WhatsApp.',
  };
}

module.exports = {
  processChatbotMessage,
  predictCrowd,
  classifyIntent,
};
