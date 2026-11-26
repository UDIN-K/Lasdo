import React from 'react';
import {
  Calendar,
  Search,
  RefreshCw,
  CheckCircle2,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { formatHour, formatRupiah } from '../../utils/bookingHelpers';

export default function AdminBookingsTab({
  bookings,
  metrics,
  isLoadingBookings,
  filterStatus,
  setFilterStatus,
  filterPayment,
  setFilterPayment,
  filterSearch,
  setFilterSearch,
  updatingBookingId,
  onRefresh,
  onResetFilters,
  onUpdateStatus,
}) {
  const hasActiveFilter = Boolean(filterStatus || filterPayment || filterSearch);

  return (
    <div className="space-y-6">
      {/* KPI Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs text-slate-500 font-medium block">Total Pesanan</span>
          <span className="font-heading text-2xl font-bold text-slate-900 tabular-nums mt-1 block">
            {metrics ? metrics.totalBookings : '–'}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs text-amber-700 font-medium block">Menunggu Konfirmasi</span>
          <span className="font-heading text-2xl font-bold text-amber-700 tabular-nums mt-1 block">
            {metrics ? metrics.pendingCount : '–'}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs text-emerald-700 font-medium block">Terkonfirmasi</span>
          <span className="font-heading text-2xl font-bold text-emerald-700 tabular-nums mt-1 block">
            {metrics ? metrics.confirmedCount : '–'}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs text-slate-500 font-medium block">Pendapatan Lunas</span>
          <span className="font-heading text-lg sm:text-xl font-bold text-emerald-700 tabular-nums mt-1 block truncate">
            {metrics ? formatRupiah(metrics.totalRevenue) : '–'}
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex-1 relative">
            <label htmlFor="admin-booking-search" className="sr-only">
              Cari kode booking, nama pemesan, atau nomor HP
            </label>
            <input
              id="admin-booking-search"
              type="text"
              placeholder="Cari kode booking, nama pemesan, atau nomor HP..."
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onRefresh()}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Filter status booking"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="">Semua Status Booking</option>
              <option value="Menunggu Konfirmasi">Menunggu Konfirmasi</option>
              <option value="Dikonfirmasi">Dikonfirmasi</option>
              <option value="Selesai">Selesai</option>
              <option value="Dibatalkan">Dibatalkan</option>
            </select>

            <select
              aria-label="Filter status pembayaran"
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="">Semua Status Bayar</option>
              <option value="Belum Bayar">Belum Bayar</option>
              <option value="Lunas">Lunas</option>
            </select>

            {hasActiveFilter && (
              <button
                type="button"
                onClick={onResetFilters}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}

            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoadingBookings}
              aria-label="Segarkan data pesanan"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingBookings ? 'animate-spin' : ''}`} />
              <span>Segarkan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-700" />
            <span>Daftar Pesanan ({bookings.length})</span>
          </h3>
          <span className="text-xs text-slate-500">
            Perubahan status langsung terlihat di halaman Cek QRIS pelanggan
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
              <tr>
                <th className="px-4 py-3">Kode & Tanggal</th>
                <th className="px-4 py-3">Pemesan</th>
                <th className="px-4 py-3">Layanan & Jam</th>
                <th className="px-4 py-3 text-right">Total Terkunci</th>
                <th className="px-4 py-3">Status Booking</th>
                <th className="px-4 py-3">Status QRIS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoadingBookings && bookings.length === 0 ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={idx}>
                    <td colSpan={6} className="px-4 py-4">
                      <div className="h-4 bg-slate-100 rounded animate-pulse w-full" />
                    </td>
                  </tr>
                ))
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-500 space-y-2">
                    <p className="font-medium">Tidak ada pesanan yang sesuai dengan filter saat ini.</p>
                    {hasActiveFilter && (
                      <button
                        type="button"
                        onClick={onResetFilters}
                        className="text-xs font-semibold text-emerald-700 hover:underline cursor-pointer"
                      >
                        Tampilkan semua pesanan
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-mono font-semibold text-slate-900 block">
                        {b.booking_code}
                      </span>
                      <span className="text-[11px] text-slate-500 tabular-nums">
                        {b.date}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-900 block">
                        {b.customer_name}
                      </span>
                      <span className="text-[11px] text-slate-500 tabular-nums">
                        {b.phone_number}
                      </span>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-semibold text-slate-800 block">
                        {b.service_type === 'serbaguna' ? 'Gedung Serbaguna' : 'Lapangan Futsal'}
                      </span>
                      <span className="text-[11px] text-slate-600 tabular-nums">
                        {formatHour(b.start_hour)} – {formatHour(b.end_hour)} ({b.duration} Jam)
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <span className="font-bold text-slate-900 tabular-nums block">
                        {formatRupiah(b.total_price)}
                      </span>
                      <span className="text-[11px] text-slate-500 tabular-nums">
                        @ {formatRupiah(b.locked_price_per_hour)}/jam
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <select
                        aria-label={`Ubah status booking ${b.booking_code}`}
                        value={b.booking_status}
                        disabled={updatingBookingId === b.id}
                        onChange={(e) =>
                          onUpdateStatus(b.id, { booking_status: e.target.value })
                        }
                        className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold border focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer ${
                          b.booking_status === 'Dikonfirmasi'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : b.booking_status === 'Selesai'
                            ? 'bg-blue-50 text-blue-800 border-blue-300'
                            : b.booking_status === 'Dibatalkan'
                            ? 'bg-red-50 text-red-800 border-red-300'
                            : 'bg-amber-50 text-amber-800 border-amber-300'
                        }`}
                      >
                        <option value="Menunggu Konfirmasi">Menunggu Konfirmasi</option>
                        <option value="Dikonfirmasi">Dikonfirmasi</option>
                        <option value="Selesai">Selesai</option>
                        <option value="Dibatalkan">Dibatalkan</option>
                      </select>
                    </td>

                    <td className="px-4 py-3">
                      <button
                        type="button"
                        disabled={updatingBookingId === b.id}
                        onClick={() =>
                          onUpdateStatus(b.id, {
                            payment_status: b.payment_status === 'Lunas' ? 'Belum Bayar' : 'Lunas',
                          })
                        }
                        aria-label={`Ubah status pembayaran ${b.booking_code}`}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                          b.payment_status === 'Lunas'
                            ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                            : 'bg-white hover:bg-red-50 text-red-700 border border-red-300'
                        }`}
                      >
                        {b.payment_status === 'Lunas' ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Lunas</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3.5 h-3.5" />
                            <span>Tandai Lunas</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
