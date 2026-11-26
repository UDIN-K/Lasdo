import React, { useState } from 'react';
import { Search, CreditCard, Copy, Check, RefreshCw, AlertCircle, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { lookupBooking } from '../services/api';

export default function QrisLookupSection({ prefillCode }) {
  const [query, setQuery] = useState(prefillCode || 'LFF-2611-001');
  const [bookingData, setBookingData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Update query saat prefillCode berubah
  React.useEffect(() => {
    if (prefillCode) {
      setQuery(prefillCode);
      handleSearch(prefillCode);
    }
  }, [prefillCode]);

  const handleSearch = async (searchQ = query) => {
    if (!searchQ || !searchQ.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await lookupBooking(searchQ.trim());
      setBookingData(data);
    } catch (err) {
      setError(err.message || 'Pesanan tidak ditemukan.');
      setBookingData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="qris" className="py-14 bg-slate-50 border-b border-slate-200 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
            Bagian 02
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Pembayaran QRIS & Cek Status Pemesanan
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-2">
            Lacak status verifikasi pesanan dan konfirmasi pembayaran QRIS Anda secara transparan dan real-time.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-xl mb-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Masukkan Kode Booking (LFF-...) atau Nomor HP..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-xs flex items-center gap-2 shrink-0 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Cari</span>
                </>
              )}
            </button>
          </form>

          {/* Contoh Kode Booking Cepat untuk Pengujian */}
          <div className="flex flex-wrap items-center gap-2 mt-2.5 text-xs text-slate-500">
            <span className="font-medium">Contoh untuk Demo:</span>
            {['LFF-2611-001', 'LFF-2611-003', 'LFF-2611-004'].map((demoCode) => (
              <button
                key={demoCode}
                type="button"
                onClick={() => {
                  setQuery(demoCode);
                  handleSearch(demoCode);
                }}
                className="font-mono text-emerald-700 hover:underline hover:text-emerald-900 font-semibold"
              >
                {demoCode}
              </button>
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="max-w-2xl mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Hasil Pencarian & Kartu QRIS */}
        {bookingData && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Kartu Status Pemesanan */}
            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-xs text-slate-500 block">Kode Booking</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-xl font-black text-slate-900 tracking-tight">
                      {bookingData.booking_code}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyCode(bookingData.booking_code)}
                      className="p-1 rounded-md text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                      title="Salin Kode Booking"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSearch(bookingData.booking_code)}
                    disabled={isLoading}
                    className="p-2 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-slate-100 transition-colors"
                    title="Perbarui Status Realtime"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  </button>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      bookingData.booking_status === 'Dikonfirmasi'
                        ? 'bg-emerald-100 text-emerald-800'
                        : bookingData.booking_status === 'Selesai'
                        ? 'bg-blue-100 text-blue-800'
                        : bookingData.booking_status === 'Dibatalkan'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {bookingData.booking_status}
                  </span>
                </div>
              </div>

              {/* Rincian Pesanan */}
              <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm">
                <div>
                  <span className="text-slate-500 text-xs block">Pemesan</span>
                  <span className="font-bold text-slate-900">{bookingData.customer_name}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-xs block">Nomor HP WhatsApp</span>
                  <span className="font-mono text-slate-900">{bookingData.phone_number}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-xs block">Layanan</span>
                  <span className="font-semibold text-slate-900">
                    {bookingData.service_type === 'serbaguna' ? 'Gedung Serbaguna' : 'Futsal Reguler'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-xs block">Jadwal Sewa</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {bookingData.date} ({String(bookingData.start_hour).padStart(2, '0')}:00 – {String(bookingData.end_hour).padStart(2, '0')}:00)
                  </span>
                </div>
              </div>

              {bookingData.event_notes && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                  <strong className="text-slate-700 block mb-0.5">Catatan Acara:</strong>
                  <span>{bookingData.event_notes}</span>
                </div>
              )}

              {/* Harga Terkunci */}
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-xs text-emerald-900 font-semibold block">Total Tagihan Terkunci:</span>
                  <span className="text-[11px] text-emerald-700">
                    Tarif sewa per jam terkunci Rp {bookingData.locked_price_per_hour.toLocaleString('id-ID')}
                  </span>
                </div>
                <span className="font-mono text-xl font-extrabold text-emerald-800 tabular-nums">
                  Rp {bookingData.total_price.toLocaleString('id-ID')}
                </span>
              </div>

              {/* Status Pembayaran */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-500">Status Pembayaran:</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 ${
                    bookingData.payment_status === 'Lunas'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}
                >
                  {bookingData.payment_status === 'Lunas' ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Lunas (Terverifikasi)</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-3.5 h-3.5 text-red-600" />
                      <span>Belum Bayar (Menunggu Transfer)</span>
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Kartu QRIS Contoh Demo */}
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-700" />
                  <span className="font-heading font-bold text-slate-900 text-sm">
                    QRIS Standar Pembayaran
                  </span>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  NMID: ID102026110015099
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 inline-block">
                {/* SVG QRIS Mockup Bersih & Tajam */}
                <svg
                  className="w-48 h-48 mx-auto"
                  viewBox="0 0 200 200"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="200" height="200" fill="white" rx="8" />
                  {/* Outer Frame Corners */}
                  <rect x="20" y="20" width="45" height="45" fill="#047857" rx="4" />
                  <rect x="25" y="25" width="35" height="35" fill="white" rx="2" />
                  <rect x="30" y="30" width="25" height="25" fill="#047857" rx="2" />

                  <rect x="135" y="20" width="45" height="45" fill="#047857" rx="4" />
                  <rect x="140" y="25" width="35" height="35" fill="white" rx="2" />
                  <rect x="145" y="30" width="25" height="25" fill="#047857" rx="2" />

                  <rect x="20" y="135" width="45" height="45" fill="#047857" rx="4" />
                  <rect x="25" y="140" width="35" height="35" fill="white" rx="2" />
                  <rect x="30" y="145" width="25" height="25" fill="#047857" rx="2" />

                  {/* QR Pattern Matrix Dots */}
                  <rect x="75" y="25" width="10" height="10" fill="#0f172a" />
                  <rect x="95" y="25" width="10" height="10" fill="#0f172a" />
                  <rect x="115" y="25" width="10" height="10" fill="#0f172a" />
                  <rect x="75" y="45" width="10" height="10" fill="#0f172a" />
                  <rect x="105" y="45" width="10" height="10" fill="#0f172a" />

                  <rect x="25" y="75" width="10" height="10" fill="#0f172a" />
                  <rect x="45" y="75" width="10" height="10" fill="#0f172a" />
                  <rect x="65" y="75" width="10" height="10" fill="#0f172a" />
                  <rect x="85" y="75" width="10" height="10" fill="#047857" />
                  <rect x="105" y="75" width="10" height="10" fill="#0f172a" />
                  <rect x="125" y="75" width="10" height="10" fill="#0f172a" />
                  <rect x="145" y="75" width="10" height="10" fill="#0f172a" />
                  <rect x="165" y="75" width="10" height="10" fill="#0f172a" />

                  <rect x="75" y="95" width="10" height="10" fill="#0f172a" />
                  <rect x="95" y="95" width="10" height="10" fill="#047857" />
                  <rect x="115" y="95" width="10" height="10" fill="#0f172a" />

                  <rect x="25" y="115" width="10" height="10" fill="#0f172a" />
                  <rect x="55" y="115" width="10" height="10" fill="#0f172a" />
                  <rect x="85" y="115" width="10" height="10" fill="#0f172a" />
                  <rect x="115" y="115" width="10" height="10" fill="#0f172a" />
                  <rect x="145" y="115" width="10" height="10" fill="#0f172a" />
                  <rect x="165" y="115" width="10" height="10" fill="#0f172a" />

                  <rect x="75" y="135" width="10" height="10" fill="#0f172a" />
                  <rect x="95" y="135" width="10" height="10" fill="#0f172a" />
                  <rect x="115" y="135" width="10" height="10" fill="#0f172a" />
                  <rect x="135" y="135" width="10" height="10" fill="#0f172a" />
                  <rect x="155" y="135" width="10" height="10" fill="#0f172a" />

                  <rect x="75" y="155" width="10" height="10" fill="#0f172a" />
                  <rect x="105" y="155" width="10" height="10" fill="#0f172a" />
                  <rect x="125" y="155" width="10" height="10" fill="#0f172a" />
                  <rect x="165" y="155" width="10" height="10" fill="#0f172a" />

                  {/* Center Badge */}
                  <circle cx="100" cy="100" r="18" fill="white" stroke="#047857" strokeWidth="2" />
                  <text
                    x="100"
                    y="104"
                    fontFamily="Outfit, sans-serif"
                    fontSize="11"
                    fontWeight="800"
                    fill="#047857"
                    textAnchor="middle"
                  >
                    LFF
                  </text>
                </svg>
                <div className="mt-2 text-xs font-bold text-slate-900">
                  Lasdo Family Futsal
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  Nominal: Rp {bookingData.total_price.toLocaleString('id-ID')}
                </div>
              </div>

              <div className="text-xs text-slate-500 space-y-1">
                <p>
                  Dapat dipindai melalui <strong>BCA, Mandiri, BRI, BNI</strong>, serta e-wallet <strong>GoPay, OVO, Dana, ShopeePay</strong>.
                </p>
                <p className="text-[11px] text-emerald-700 font-medium">
                  Setelah bayar, status pesanan otomatis disinkronkan oleh pengelola UMKM.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
