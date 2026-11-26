const { DEFAULT_PRICING } = require('../config/constants');

// MOCKED — in-memory SQLite replacement (native better-sqlite3 stripped for Node.js container compatibility)
// Data persists for the lifetime of the server process and resets on container sleep/restart.

const store = {
  pricing: null,
  bookings: [],
  nextBookingId: 1,
};

function likeMatch(value, pattern) {
  if (value === null || value === undefined) return false;
  const escaped = String(pattern)
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/%/g, '.*')
    .replace(/_/g, '.');
  return new RegExp(`^${escaped}$`, 'i').test(String(value));
}

function normalizeSql(sql) {
  return sql.replace(/\s+/g, ' ').trim();
}

const db = {
  pragma() {
    // No-op in memory
  },
  exec() {
    // Tables are managed in-memory
  },
  prepare(rawSql) {
    const sql = normalizeSql(rawSql);
    const upper = sql.toUpperCase();

    return {
      get(...params) {
        // Pricing lookup
        if (upper.startsWith('SELECT * FROM PRICING WHERE ID = 1')) {
          return store.pricing ? { ...store.pricing } : undefined;
        }

        // Booking counts & sums
        if (upper === 'SELECT COUNT(*) AS COUNT FROM BOOKINGS') {
          return { count: store.bookings.length };
        }
        if (upper === "SELECT COUNT(*) AS COUNT FROM BOOKINGS WHERE BOOKING_STATUS = 'MENUNGGU KONFIRMASI'") {
          return { count: store.bookings.filter((b) => b.booking_status === 'Menunggu Konfirmasi').length };
        }
        if (upper === "SELECT COUNT(*) AS COUNT FROM BOOKINGS WHERE BOOKING_STATUS = 'DIKONFIRMASI'") {
          return { count: store.bookings.filter((b) => b.booking_status === 'Dikonfirmasi').length };
        }
        if (upper === "SELECT COUNT(*) AS COUNT FROM BOOKINGS WHERE BOOKING_STATUS = 'SELESAI'") {
          return { count: store.bookings.filter((b) => b.booking_status === 'Selesai').length };
        }
        if (upper === "SELECT COUNT(*) AS COUNT FROM BOOKINGS WHERE BOOKING_STATUS = 'DIBATALKAN'") {
          return { count: store.bookings.filter((b) => b.booking_status === 'Dibatalkan').length };
        }
        if (upper === "SELECT COUNT(*) AS COUNT FROM BOOKINGS WHERE PAYMENT_STATUS = 'BELUM BAYAR' AND BOOKING_STATUS != 'DIBATALKAN'") {
          return {
            count: store.bookings.filter(
              (b) => b.payment_status === 'Belum Bayar' && b.booking_status !== 'Dibatalkan'
            ).length,
          };
        }
        if (upper === "SELECT SUM(TOTAL_PRICE) AS SUM FROM BOOKINGS WHERE PAYMENT_STATUS = 'LUNAS' AND BOOKING_STATUS != 'DIBATALKAN'") {
          const sum = store.bookings
            .filter((b) => b.payment_status === 'Lunas' && b.booking_status !== 'Dibatalkan')
            .reduce((acc, b) => acc + Number(b.total_price || 0), 0);
          return { sum };
        }

        // Analytics counts
        if (upper === 'SELECT COUNT(*) AS C FROM BOOKINGS') {
          return { c: store.bookings.length };
        }
        if (upper === "SELECT COUNT(*) AS C FROM BOOKINGS WHERE SERVICE_TYPE = 'FUTSAL'") {
          return { c: store.bookings.filter((b) => b.service_type === 'futsal').length };
        }
        if (upper === "SELECT COUNT(*) AS C FROM BOOKINGS WHERE SERVICE_TYPE = 'SERBAGUNA'") {
          return { c: store.bookings.filter((b) => b.service_type === 'serbaguna').length };
        }

        // Booking conflict check
        if (
          upper.includes('FROM BOOKINGS') &&
          upper.includes("WHERE DATE = ? AND BOOKING_STATUS != 'DIBATALKAN' AND (START_HOUR < ? AND END_HOUR > ?)")
        ) {
          const [date, endH, startH] = params;
          const hit = store.bookings.find(
            (b) =>
              b.date === date &&
              b.booking_status !== 'Dibatalkan' &&
              b.start_hour < endH &&
              b.end_hour > startH
          );
          return hit ? { ...hit } : undefined;
        }

        // Booking by ID
        if (upper === 'SELECT * FROM BOOKINGS WHERE ID = ?') {
          const id = Number(params[0]);
          const hit = store.bookings.find((b) => b.id === id);
          return hit ? { ...hit } : undefined;
        }

        // Lookup by booking_code or phone_number
        if (
          upper.includes('FROM BOOKINGS') &&
          upper.includes('WHERE BOOKING_CODE = ? OR PHONE_NUMBER = ? OR PHONE_NUMBER = ?')
        ) {
          const [codeUpper, rawQ, cleanPhone] = params;
          const matches = store.bookings
            .filter(
              (b) =>
                b.booking_code.toUpperCase() === String(codeUpper).toUpperCase() ||
                b.phone_number === rawQ ||
                b.phone_number === cleanPhone
            )
            .sort((a, b) => b.id - a.id);
          return matches[0] ? { ...matches[0] } : undefined;
        }

        // Booking code generator
        if (upper.includes('SELECT BOOKING_CODE FROM BOOKINGS WHERE BOOKING_CODE LIKE ?')) {
          const [pattern] = params;
          const matches = store.bookings
            .filter((b) => likeMatch(b.booking_code, pattern))
            .sort((a, b) => b.id - a.id);
          return matches[0] ? { booking_code: matches[0].booking_code } : undefined;
        }

        return undefined;
      },

      all(...params) {
        // Daily schedule / crowd prediction active bookings
        if (
          upper.includes('FROM BOOKINGS') &&
          upper.includes("WHERE DATE = ? AND BOOKING_STATUS != 'DIBATALKAN'")
        ) {
          const [dateStr] = params;
          return store.bookings
            .filter((b) => b.date === dateStr && b.booking_status !== 'Dibatalkan')
            .sort((a, b) => a.start_hour - b.start_hour)
            .map((b) => ({ ...b }));
        }

        // Dynamic admin bookings filter query: SELECT * FROM bookings WHERE 1=1 ...
        if (upper.startsWith('SELECT * FROM BOOKINGS WHERE 1=1')) {
          let results = [...store.bookings];
          let idx = 0;

          if (upper.includes('AND BOOKING_STATUS = ?')) {
            const status = params[idx++];
            results = results.filter((b) => b.booking_status === status);
          }
          if (upper.includes('AND PAYMENT_STATUS = ?')) {
            const payment = params[idx++];
            results = results.filter((b) => b.payment_status === payment);
          }
          if (upper.includes('AND DATE = ?')) {
            const date = params[idx++];
            results = results.filter((b) => b.date === date);
          }
          if (upper.includes('AND (BOOKING_CODE LIKE ? OR CUSTOMER_NAME LIKE ? OR PHONE_NUMBER LIKE ?)')) {
            const p1 = params[idx++];
            const p2 = params[idx++];
            const p3 = params[idx++];
            results = results.filter(
              (b) =>
                likeMatch(b.booking_code, p1) ||
                likeMatch(b.customer_name, p2) ||
                likeMatch(b.phone_number, p3)
            );
          }

          results.sort((a, b) => {
            if (b.date !== a.date) return b.date.localeCompare(a.date);
            if (b.start_hour !== a.start_hour) return b.start_hour - a.start_hour;
            return b.id - a.id;
          });

          return results.map((b) => ({ ...b }));
        }

        return [];
      },

      run(...params) {
        // Insert default pricing
        if (upper.startsWith('INSERT INTO PRICING')) {
          const [futsal_day, futsal_night_weekend, serbaguna] = params;
          store.pricing = {
            id: 1,
            futsal_day: Number(futsal_day),
            futsal_night_weekend: Number(futsal_night_weekend),
            serbaguna: Number(serbaguna),
            updated_at: new Date().toISOString(),
          };
          return { changes: 1, lastInsertRowid: 1 };
        }

        // Update pricing
        if (upper.startsWith('UPDATE PRICING SET')) {
          const [futsal_day, futsal_night_weekend, serbaguna, updated_at] = params;
          store.pricing = {
            id: 1,
            futsal_day: Number(futsal_day),
            futsal_night_weekend: Number(futsal_night_weekend),
            serbaguna: Number(serbaguna),
            updated_at,
          };
          return { changes: 1 };
        }

        // Insert booking (supports both seed insert with 15 params and bookingService insert with 13 params)
        if (upper.startsWith('INSERT INTO BOOKINGS')) {
          const id = store.nextBookingId++;
          let record;
          if (params.length === 15) {
            const [
              booking_code,
              service_type,
              customer_name,
              phone_number,
              date,
              start_hour,
              duration,
              end_hour,
              locked_price_per_hour,
              total_price,
              booking_status,
              payment_status,
              payment_method,
              event_notes,
              created_at,
            ] = params;
            record = {
              id,
              booking_code,
              service_type,
              customer_name,
              phone_number,
              date,
              start_hour: Number(start_hour),
              duration: Number(duration),
              end_hour: Number(end_hour),
              locked_price_per_hour: Number(locked_price_per_hour),
              total_price: Number(total_price),
              booking_status,
              payment_status,
              payment_method,
              event_notes,
              created_at,
              updated_at: created_at,
            };
          } else {
            const [
              booking_code,
              service_type,
              customer_name,
              phone_number,
              date,
              start_hour,
              duration,
              end_hour,
              locked_price_per_hour,
              total_price,
              event_notes,
              created_at,
              updated_at,
            ] = params;
            record = {
              id,
              booking_code,
              service_type,
              customer_name,
              phone_number,
              date,
              start_hour: Number(start_hour),
              duration: Number(duration),
              end_hour: Number(end_hour),
              locked_price_per_hour: Number(locked_price_per_hour),
              total_price: Number(total_price),
              booking_status: 'Menunggu Konfirmasi',
              payment_status: 'Belum Bayar',
              payment_method: 'QRIS',
              event_notes,
              created_at,
              updated_at,
            };
          }
          store.bookings.push(record);
          return { changes: 1, lastInsertRowid: id };
        }

        // Update booking status
        if (upper.startsWith('UPDATE BOOKINGS SET BOOKING_STATUS = ?, PAYMENT_STATUS = ?, UPDATED_AT = ? WHERE ID = ?')) {
          const [booking_status, payment_status, updated_at, rawId] = params;
          const id = Number(rawId);
          const idx = store.bookings.findIndex((b) => b.id === id);
          if (idx === -1) return { changes: 0 };
          store.bookings[idx] = {
            ...store.bookings[idx],
            booking_status,
            payment_status,
            updated_at,
          };
          return { changes: 1 };
        }

        // Delete booking (used in tests)
        if (upper.startsWith('DELETE FROM BOOKINGS WHERE DATE = ? AND CUSTOMER_NAME LIKE')) {
          const date = params[0];
          const match = rawSql.match(/LIKE\s+'([^']+)'/i);
          const pattern = match ? match[1] : params[1];
          const before = store.bookings.length;
          store.bookings = store.bookings.filter(
            (b) => !(b.date === date && likeMatch(b.customer_name, pattern))
          );
          return { changes: before - store.bookings.length };
        }

        return { changes: 0 };
      },
    };
  },
};

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
      date: getDateStr(0),
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
      date: getDateStr(0),
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
      date: getDateStr(0),
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
      date: getDateStr(1),
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
      date: getDateStr(1),
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
      date: getDateStr(2),
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
