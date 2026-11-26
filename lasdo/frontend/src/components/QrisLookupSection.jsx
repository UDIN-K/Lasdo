import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { lookupBooking } from '../services/api';
import { formatHour, formatRupiah } from '../utils/bookingHelpers';

function buildDeterministicQrMatrix(seedText) {
  const size = 21;
  const grid = Array.from({ length: size }, () => Array(size).fill(false));

  const drawFinder = (r0, c0) => {
    for (let r = 0; r < 7; r += 1) {
      for (let c = 0; c < 7; c += 1) {
        const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
        const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        grid[r0 + r][c0 + c] = isBorder || isInner;
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  for (let i = 8; i < size - 8; i += 1) {
    grid[6][i] = i % 2 === 0;
    grid[i][6] = i % 2 === 0;
  }

  let hash = 2166136261;
  for (let i = 0; i < seedText.length; i += 1) {
    hash ^= seedText.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      const inTopLeft = r < 8 && c < 8;
      const inTopRight = r < 8 && c >= size - 8;
      const inBottomLeft = r >= size - 8 && c < 8;
      const inCenterLogo = r >= 8 && r <= 12 && c >= 8 && c <= 12;
      if (inTopLeft || inTopRight || inBottomLeft || r === 6 || c === 6 || inCenterLogo) {
        continue;
      }
      hash ^= (r * 31 + c * 17);
      hash = Math.imul(hash, 16777619);
      grid[r][c] = ((hash >>> 0) % 10) < 5;
    }
  }

  return grid;
}

export default function QrisLookupSection({ prefillCode }) {
  const [query, setQuery] = useState(prefillCode || 'LFF-2611-001');
  const [bookingData, setBookingData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

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

  useEffect(() => {
    if (prefillCode) {
      setQuery(prefillCode);
      handleSearch(prefillCode);
    }
  }, [prefillCode]);

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const qrMatrix = useMemo(
    () => buildDeterministicQrMatrix(bookingData?.booking_code || 'LFF-2611-001'),
    [bookingData?.booking_code]
  );

  const isCancelled = bookingData?.booking_status === 'Dibatalkan';
  const isPaid = bookingData?.payment_status === 'Lunas';
  const isConfirmed =
    bookingData?.booking_status === 'Dikonfirmasi' || bookingData?.booking_status === 'Selesai';

  return (
    <section id="qris" className="py-12 bg-white border-b border-stone-200 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-7">
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
            Cek Pesanan & Bayar QRIS
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 mt-1.5">
            Masukkan kode booking atau nomor WhatsApp untuk melihat status pesanan dan kode QRIS pembayaran.
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
              <label htmlFor="qris-lookup-input" className="sr-only">
                Kode Booking atau Nomor WhatsApp
              </label>
              <input
                id="qris-lookup-input"
                type="text"
                placeholder="Kode Booking (LFF-...) atau Nomor HP..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-md pl-10 pr-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm shrink-0 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? 'Mencari...' : 'Cari Pesanan'}
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-zinc-500">
            <span>Contoh kode:</span>
            {['LFF-2611-001', 'LFF-2611-003', 'LFF-2611-004'].map((demoCode) => (
              <button
                key={demoCode}
                type="button"
                onClick={() => {
                  setQuery(demoCode);
                  handleSearch(demoCode);
                }}
                className="font-mono text-emerald-800 hover:underline font-medium cursor-pointer"
              >
                {demoCode}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div role="alert" className="max-w-2xl mb-6 p-4 rounded-md bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {bookingData && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
            {/* Order Slip */}
            <div className="lg:col-span-7 bg-[#fafaf8] p-6 rounded-lg border border-stone-200 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-200">
                <div>
                  <span className="text-xs text-zinc-500 block">Kode Booking</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-xl font-bold text-zinc-900 tracking-tight">
                      {bookingData.booking_code}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyCode(bookingData.booking_code)}
                      aria-label="Salin kode booking"
                      className="p-1.5 rounded text-zinc-500 hover:text-emerald-700 hover:bg-white transition-colors cursor-pointer"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
                    </button>
                    {copied && <span className="text-xs font-medium text-emerald-700">Tersalin</span>}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSearch(bookingData.booking_code)}
                  disabled={isLoading}
                  aria-label="Perbarui status pesanan"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-stone-200 text-xs font-semibold text-zinc-700 hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Perbarui</span>
                </button>
              </div>

              {isCancelled ? (
                <div className="p-3.5 rounded-md bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-center gap-2.5">
                  <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                  <span>Pesanan ini berstatus <strong>Dibatalkan</strong>. Hubungi pengelola untuk penjadwalan ulang.</span>
                </div>
              ) : (
                <div className="grid grid-cols-3 rounded-md bg-white border border-stone-200 divide-x divide-stone-200 overflow-hidden text-xs">
                  <div className="p-3 bg-emerald-50/40">
                    <span className="font-semibold text-emerald-800 block">1. Diajukan</span>
                    <span className="text-zinc-600 text-[11px]">Jadwal terkunci</span>
                  </div>
                  <div className={`p-3 ${isPaid ? 'bg-emerald-50/40' : 'bg-amber-50/60'}`}>
                    <span className={`font-semibold block ${isPaid ? 'text-emerald-800' : 'text-amber-800'}`}>
                      2. Pembayaran
                    </span>
                    <span className="text-zinc-600 text-[11px]">
                      {isPaid ? 'Lunas terverifikasi' : 'Menunggu QRIS'}
                    </span>
                  </div>
                  <div className={`p-3 ${isConfirmed ? 'bg-emerald-50/40' : 'bg-white'}`}>
                    <span className={`font-semibold block ${isConfirmed ? 'text-emerald-800' : 'text-zinc-500'}`}>
                      3. Konfirmasi
                    </span>
                    <span className="text-zinc-600 text-[11px]">
                      {bookingData.booking_status}
                    </span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm">
                <div>
                  <span className="text-zinc-500 text-xs block">Pemesan</span>
                  <span className="font-semibold text-zinc-900">{bookingData.customer_name}</span>
                </div>
                <div>
                  <span className="text-zinc-500 text-xs block">Nomor WhatsApp</span>
                  <span className="font-medium text-zinc-900 tabular-nums">{bookingData.phone_number}</span>
                </div>
                <div>
                  <span className="text-zinc-500 text-xs block">Layanan</span>
                  <span className="font-semibold text-zinc-900">
                    {bookingData.service_type === 'serbaguna' ? 'Gedung Serbaguna' : 'Lapangan Futsal'}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 text-xs block">Jadwal Sewa</span>
                  <span className="font-semibold text-zinc-900 tabular-nums">
                    {bookingData.date} ({formatHour(bookingData.start_hour)} – {formatHour(bookingData.end_hour)})
                  </span>
                </div>
              </div>

              {bookingData.event_notes && (
                <div className="pt-3 border-t border-stone-200 text-xs text-zinc-600">
                  <strong className="text-zinc-800">Catatan:</strong> {bookingData.event_notes}
                </div>
              )}

              <div className="pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-semibold text-zinc-700 block">Total Tagihan</span>
                  <span className="text-[11px] text-zinc-500 tabular-nums">
                    Tarif {formatRupiah(bookingData.locked_price_per_hour)} / jam
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-heading text-2xl font-bold text-emerald-800 tabular-nums block">
                    {formatRupiah(bookingData.total_price)}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold mt-0.5 text-zinc-700">
                    {isPaid ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                        <span className="text-emerald-800">Lunas</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span className="text-amber-800">Belum Bayar</span>
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Realistic QRIS Standee Card */}
            <div className="lg:col-span-5 bg-white p-6 rounded-lg border border-stone-200 text-center space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <span className="font-heading font-bold text-zinc-900 text-sm">
                  QRIS Pembayaran
                </span>
                <span className="text-[11px] font-mono text-zinc-500">
                  NMID ID102026110015099
                </span>
              </div>

              <div className="py-2">
                <div className="inline-block p-3 bg-white border border-stone-200 rounded-md">
                  <svg
                    className="w-44 h-44 mx-auto"
                    viewBox="0 0 210 210"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    role="img"
                    aria-label={`Kode QRIS pembayaran untuk ${bookingData.booking_code}`}
                  >
                    <rect width="210" height="210" fill="#ffffff" />
                    {qrMatrix.map((row, r) =>
                      row.map((filled, c) =>
                        filled ? (
                          <rect
                            key={`${r}-${c}`}
                            x={c * 10}
                            y={r * 10}
                            width="9.5"
                            height="9.5"
                            fill="#18181b"
                            rx="1"
                          />
                        ) : null
                      )
                    )}
                    <rect x="82" y="82" width="46" height="46" rx="6" fill="#ffffff" stroke="#e4e4e7" strokeWidth="2" />
                    <text
                      x="105"
                      y="109"
                      fontFamily="Bricolage Grotesque, Plus Jakarta Sans, sans-serif"
                      fontSize="13"
                      fontWeight="800"
                      fill="#15803d"
                      textAnchor="middle"
                    >
                      LFF
                    </text>
                  </svg>
                </div>

                <div className="mt-3 text-sm font-bold text-zinc-900">
                  Lasdo Family Futsal
                </div>
                <div className="text-xs text-zinc-600 tabular-nums mt-0.5">
                  Nominal: <strong className="text-zinc-900">{formatRupiah(bookingData.total_price)}</strong>
                </div>
              </div>

              <div className="text-xs text-zinc-500 space-y-1 pt-2 border-t border-stone-100">
                <p>
                  Dapat dipindai dari aplikasi BCA, Mandiri, BRI, BNI, GoPay, OVO, Dana, atau ShopeePay.
                </p>
                <p className="text-emerald-800 font-medium">
                  Setelah transfer, klik Perbarui untuk melihat status konfirmasi pengelola.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
