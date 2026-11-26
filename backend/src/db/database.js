const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const { DEFAULT_PRICING } = require('../config/constants');

const dbDir = path.resolve(__dirname);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'lasdo.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrency & performance
db.pragma('journal_mode = WAL');

// 1. Inisialisasi Tabel Pricing (Master Tarif Sewa)
db.exec(`
  CREATE TABLE IF NOT EXISTS pricing (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    futsal_day INTEGER NOT NULL,
    futsal_night_weekend INTEGER NOT NULL,
    serbaguna INTEGER NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// 2. Inisialisasi Tabel Bookings
db.exec(`
  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_code TEXT NOT NULL UNIQUE,
    service_type TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    date TEXT NOT NULL,
    start_hour INTEGER NOT NULL,
    duration INTEGER NOT NULL,
    end_hour INTEGER NOT NULL,
    locked_price_per_hour INTEGER NOT NULL,
    total_price INTEGER NOT NULL,
    booking_status TEXT NOT NULL DEFAULT 'Menunggu Konfirmasi',
    payment_status TEXT NOT NULL DEFAULT 'Belum Bayar',
    payment_method TEXT DEFAULT 'QRIS',
    event_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
  CREATE INDEX IF NOT EXISTS idx_bookings_code ON bookings(booking_code);
  CREATE INDEX IF NOT EXISTS idx_bookings_phone ON bookings(phone_number);
`);

// Seed Default Pricing if not present
const existingPricing = db.prepare('SELECT * FROM pricing WHERE id = 1').get();
if (!existingPricing) {
  db.prepare(`
    INSERT INTO pricing (id, futsal_day, futsal_night_weekend, serbaguna)
    VALUES (1, ?, ?, ?)
  `).run(
    DEFAULT_PRICING.futsal_day,
    DEFAULT_PRICING.futsal_night_weekend,
    DEFAULT_PRICING.serbaguna
  );
}

// Seed Demo Bookings if empty to provide immediate live MVP experience
const bookingCount = db.prepare('SELECT COUNT(*) as count FROM bookings').get().count;
if (bookingCount === 0) {
  const insertBooking = db.prepare(`
    INSERT INTO bookings (
      booking_code, service_type, customer_name, phone_number,
      date, start_hour, duration, end_hour,
      locked_price_per_hour, total_price,
      booking_status, payment_status, payment_method, event_notes,
      created_at
    ) VALUES (
      ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?,
      ?, ?, ?, ?,
      ?
    )
  `);

  // Helper date offset
  const getDateStr = (offsetDays) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  };

  const demoSeeds = [
    {
      code: 'LFF-2611-001',
      service: 'futsal',
      name: 'Dimas Kurniawan',
      phone: '081234567801',
      date: getDateStr(0), // Hari ini
      start: 19,
      duration: 2,
      end: 21,
      rate: 150000,
      total: 300000,
      status: 'Dikonfirmasi',
      payment: 'Lunas',
      notes: 'Latihan rutin Tim Futsal Garuda FC',
    },
    {
      code: 'LFF-2611-002',
      service: 'futsal',
      name: 'Budi Santoso',
      phone: '085712349988',
      date: getDateStr(0), // Hari ini
      start: 10,
      duration: 1,
      end: 11,
      rate: 100000,
      total: 100000,
      status: 'Selesai',
      payment: 'Lunas',
      notes: 'Sparing mahasiswa teknik',
    },
    {
      code: 'LFF-2611-003',
      service: 'futsal',
      name: 'Rian Pratama',
      phone: '082198765432',
      date: getDateStr(0), // Hari ini
      start: 16,
      duration: 2,
      end: 18,
      rate: 125000,
      total: 250000,
      status: 'Menunggu Konfirmasi',
      payment: 'Belum Bayar',
      notes: 'Pemesanan via website Lasdo',
    },
    {
      code: 'LFF-2611-004',
      service: 'serbaguna',
      name: 'Ibu Linda Marlina',
      phone: '081388992211',
      date: getDateStr(1), // Besok
      start: 9,
      duration: 4,
      end: 13,
      rate: 300000,
      total: 1200000,
      status: 'Dikonfirmasi',
      payment: 'Lunas',
      notes: 'Acara senam sehat & syukuran komunitas warga',
    },
    {
      code: 'LFF-2611-005',
      service: 'futsal',
      name: 'Kapten Arya',
      phone: '087812345678',
      date: getDateStr(1), // Besok
      start: 19,
      duration: 2,
      end: 21,
      rate: 150000,
      total: 300000,
      status: 'Dikonfirmasi',
      payment: 'Lunas',
      notes: 'Turnamen futsal persahabatan antar kantor',
    },
    {
      code: 'LFF-2611-006',
      service: 'futsal',
      name: 'Kevin Wijaya',
      phone: '089612349876',
      date: getDateStr(2), // Lusa
      start: 18,
      duration: 2,
      end: 20,
      rate: 150000,
      total: 300000,
      status: 'Menunggu Konfirmasi',
      payment: 'Belum Bayar',
      notes: 'Menunggu transfer QRIS',
    },
  ];

  const nowIso = new Date().toISOString();
  for (const item of demoSeeds) {
    insertBooking.run(
      item.code,
      item.service,
      item.name,
      item.phone,
      item.date,
      item.start,
      item.duration,
      item.end,
      item.rate,
      item.total,
      item.status,
      item.payment,
      'QRIS',
      item.notes,
      nowIso
    );
  }
}

module.exports = db;
