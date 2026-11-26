# Lasdo Family Futsal — Web Booking & Schedule Monitoring System
**Capstone Project Program Asah 2026 (Dicoding & GoTo) — Tim A26-CS150**

Aplikasi web full-stack MVP responsif untuk digitalisasi operasional penyewaan lapangan futsal indoor dan gedung serbaguna pada UMKM **Lasdo Family Futsal** (Kelolaan **Christino Hirasdo Wiryawan**).

---

## 📌 Ringkasan Masalah & Solusi
Sebelumnya, reservasi di Lasdo Family Futsal dilakukan manual via pesan WhatsApp, yang berisiko terjadinya bentrok jadwal (*double booking*), ketidakpastian status pembayaran, dan kesulitan dalam pemantauan operasional.

Sistem ini menghadirkan:
1. **Pencegahan Bentrok Jadwal Otomatis**: Server menolak pemesanan pada rentang waktu yang beririsan dengan HTTP `409 Conflict`.
2. **Penguncian Harga Server-Side (*Price Locking*)**: Tarif sewa dihitung dan dikunci langsung pada setiap record pesanan sehingga perubahan tarif master di masa depan tidak mempengaruhi tagihan pemesanan lama.
3. **Pelacakan Status & Pembayaran QRIS**: Customer dapat mencari status booking dan QRIS secara instan menggunakan kode booking (contoh: `LFF-2611-001`) atau nomor WhatsApp.
4. **Portal Pengelola Terpusat**: Pengelola dapat memantau keterisian slot harian, mengubah status pemesanan (`Menunggu Konfirmasi`, `Dikonfirmasi`, `Selesai`, `Dibatalkan`), memperbarui status QRIS (`Belum Bayar` / `Lunas`), dan mengatur master tarif sewa.
5. **Dukungan AI & Analisis Data**:
   - **Widget Chatbot FAQ**: Didukung sistem *guardrail* ketat yang hanya menjawab topik seputar Lasdo Family Futsal dengan fallback cerdas berbasis template.
   - **Prediksi Keramaian (*Crowd Prediction*)**: Model machine learning per jam (`08:00–21:00`) berbasis Random Forest vs Logistic Regression, dilengkapi validasi jam di luar jam operasional (HTTP `400`).
   - **Penguji Klasifikasi Maksud Pesan (*Intent Classification*)**: Mendeteksi maksud calon penyewa beserta tingkat keyakinan (*confidence*).
   - **Analisis Pola Penyewaan**: Ringkasan okupansi mingguan, perbandingan Futsal vs Gedung Serbaguna, dan rekomendasi bisnis dengan label transparan `isDemoData: true`.

---

## 🛠️ Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Lucide React.
  - Tipografi: *Outfit* (Heading), *Plus Jakarta Sans* (Body), *JetBrains Mono* (Waktu, Kode Booking & Angka).
  - Skema Warna: Neutral light (`slate-50/white`), aksen hijau arena (`emerald-700/600`), teks kontras tinggi (`slate-900`).
- **Backend**: Node.js + Express.js REST API JSON, CORS, dotenv, JSON Web Token (JWT).
- **Database**: SQLite terstruktur menggunakan `better-sqlite3` (lokal di `backend/src/db/lasdo.db`).
- **Keamanan**: Frontend hanya berkomunikasi ke Express `/api/*`. Tidak ada API key eksternal yang terekspos ke klien.

---

## 🚀 Panduan Instalasi & Menjalankan Aplikasi

### 1. Prasyarat
- Node.js (v18+ atau v20+)
- npm

### 2. Instalasi Dependensi
Jalankan perintah berikut di direktori root proyek:
```bash
# Instal dependensi root (concurrently)
npm install

# Instal dependensi backend
cd backend
npm install
cd ..

# Instal dependensi frontend
cd frontend
npm install
cd ..
```

### 3. Konfigurasi Lingkungan (`.env`)
Salin file konfigurasi di backend:
```bash
cp backend/.env.example backend/.env
```
Isi konfigurasi default sudah siap pakai untuk pengujian lokal:
```env
PORT=5000
NODE_ENV=development
ADMIN_USERNAME=admin
ADMIN_PASSWORD=lasdo2026
JWT_SECRET=lasdo_family_futsal_secret_key_2026_capstone_a26_cs150
AI_API_KEY=
AI_MODEL_NAME=gemini-1.5-flash
CROWD_MODEL_API_URL=
```
*(Catatan: `AI_API_KEY` bersifat opsional. Jika dikosongkan, chatbot otomatis menggunakan fallback template cerdas server-side).*

### 4. Menjalankan Aplikasi (Mode Pengembangan)
Cukup jalankan satu perintah di root:
```bash
npm run dev
```
Perintah ini akan menjalankan:
- **Backend API**: `http://localhost:5000/api`
- **Frontend Vite**: `http://localhost:5173` (dengan proxy otomatis `/api` ke backend)

### 5. Menjalankan Versi Production Terintegrasi
```bash
npm run build
npm start
```
Aplikasi full-stack yang telah di-build akan langsung dapat diakses di:
`http://localhost:5000`

---

## 🔑 Kredensial Login Pengelola (Admin Portal)
Untuk masuk ke Portal Pengelola (Admin Dashboard):
- **URL**: Klik tombol **"Portal Pengelola"** di pojok kanan atas navigasi, atau buka menu admin.
- **Username**: `admin`
- **Password**: `lasdo2026`
- **Shortcut**: Tersedia tombol **"Isi Kredensial Demo"** pada form login untuk memudahkan pengujian.

---

## 🧪 Pengujian Otomatis (Unit & Integration Tests)
Jalankan pengujian backend untuk memverifikasi logika pencegahan bentrok, penguncian harga, validasi jam, dan modul AI:
```bash
npm test
```
Hasil pengujian mencakup:
- ✅ Master tarif awal dan pembacaan slot operasional 08:00 – 22:00.
- ✅ Pembuatan pesanan & penguncian total harga (*price locking*).
- ✅ Pencegahan bentrok jadwal (verifikasi penolakan HTTP 409 Conflict).
- ✅ Uji kekebalan harga lama saat master tarif sewa diubah.
- ✅ Respons Chatbot guardrail dan klasifikasi intent pesan.
- ✅ Prediksi keramaian 14 slot jam dan validasi penolakan jam di luar operasional (HTTP 400).
- ✅ Validasi integritas analitik data dummy bertanda `isDemoData: true`.

---

## 👥 Tim Pengembang (Tim A26-CS150)
- **Full-Stack Development**: Raden Mas Fidel Khalid Ramadhan, Juan Herbert Aprianto Marpaung, Muhammad Syafri Syamsudin Syah
- **Gen AI**: Anas Novaldi, Yovana Ibnu Sina
- **Data Science**: Muhamad Agung Somomiharjo
- **Mitra UMKM**: Lasdo Family Futsal (Christino Hirasdo Wiryawan)
