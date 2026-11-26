import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, Clock, CheckCircle2, XCircle, AlertCircle, 
  Sparkles, ShieldCheck, ArrowRight, Check, AlertTriangle, Building2, User, Phone, FileText 
} from 'lucide-react';
import { fetchSchedule, createBooking } from '../services/api';

export default function ScheduleSection({ onBookingSuccess }) {
  // Tanggal terpilih (format YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Jenis layanan ('futsal' | 'serbaguna')
  const [serviceType, setServiceType] = useState('futsal');

  // State data jadwal dari API
  const [scheduleData, setScheduleData] = useState(null);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(false);
  const [scheduleError, setScheduleError] = useState(null);

  // Peringatan bentrok saat klik slot terisi
  const [clashWarning, setClashWarning] = useState(null);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [startHour, setStartHour] = useState(19);
  const [duration, setDuration] = useState(1);
  const [eventNotes, setEventNotes] = useState('');

  // Status submission booking
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [createdBooking, setCreatedBooking] = useState(null);

  // 7 Hari Cepat
  const quickDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = new Intl.DateTimeFormat('id-ID', { weekday: 'short' }).format(d);
    const dayNumber = d.getDate();
    const monthName = new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(d);
    return {
      dateStr,
      label: i === 0 ? 'Hari Ini' : i === 1 ? 'Besok' : dayName,
      dateFormatted: `${dayNumber} ${monthName}`,
    };
  });

  // Fetch jadwal setiap tanggal berubah
  useEffect(() => {
    let isMounted = true;
    async function load() {
      setIsLoadingSchedule(true);
      setScheduleError(null);
      setClashWarning(null);
      try {
        const data = await fetchSchedule(selectedDate);
        if (isMounted) {
          setScheduleData(data);
          // Set startHour ke slot pertama yang tersedia
          const firstAvailable = data.slots.find((s) => s.isAvailable);
          if (firstAvailable) {
            setStartHour(firstAvailable.hour);
          }
        }
      } catch (err) {
        if (isMounted) {
          setScheduleError(err.message || 'Gagal mengambil data jadwal.');
        }
      } finally {
        if (isMounted) setIsLoadingSchedule(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [selectedDate]);

  // Handle Klik Slot di Grid
  const handleSlotClick = (slot) => {
    if (!slot.isAvailable) {
      setClashWarning({
        hour: slot.timeLabel,
        customer: slot.booking?.customer_name || 'Penyewa Terdaftar',
        service: slot.booking?.service_type === 'serbaguna' ? 'Gedung Serbaguna' : 'Futsal',
        code: slot.booking?.booking_code || '',
      });
      return;
    }

    setClashWarning(null);
    setStartHour(slot.hour);
    // Jika durasi sekarang membuat melebihi jam 22, sesuaikan durasi
    if (slot.hour + duration > 22) {
      setDuration(Math.max(1, 22 - slot.hour));
    }
  };

  // Hitung Estimasi Total Harga Terkunci di Form Preview
  const calculatePreviewPrice = () => {
    if (!scheduleData || !scheduleData.slots) return { total: 0, perHour: 0, breakdown: [] };
    const breakdown = [];
    let total = 0;

    for (let i = 0; i < duration; i++) {
      const h = startHour + i;
      if (h >= 22) break;
      const slot = scheduleData.slots.find((s) => s.hour === h);
      let rate = 0;
      let label = '';

      if (serviceType === 'serbaguna') {
        rate = slot ? slot.serbagunaPrice : 300000;
        label = 'Gedung Serbaguna';
      } else {
        rate = slot ? slot.futsalPrice : 100000;
        label = scheduleData.isWeekend
          ? 'Akhir Pekan'
          : scheduleData.holiday.isHoliday
          ? `Libur (${scheduleData.holiday.name})`
          : h >= 17
          ? 'Futsal Malam'
          : 'Futsal Siang';
      }

      total += rate;
      breakdown.push({
        time: `${String(h).padStart(2, '0')}:00 - ${String(h + 1).padStart(2, '0')}:00`,
        rate,
        label,
      });
    }

    const perHour = duration > 0 ? Math.round(total / duration) : 0;
    return { total, perHour, breakdown };
  };

  const preview = calculatePreviewPrice();

  // Submit Booking
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setBookingError(null);

    try {
      const res = await createBooking({
        customer_name: customerName,
        phone_number: phoneNumber,
        date: selectedDate,
        start_hour: startHour,
        duration,
        service_type: serviceType,
        event_notes: eventNotes,
      });

      setCreatedBooking(res.data);
      // Refresh jadwal
      const updatedSchedule = await fetchSchedule(selectedDate);
      setScheduleData(updatedSchedule);

      if (onBookingSuccess) {
        onBookingSuccess(res.data.booking.booking_code);
      }
    } catch (err) {
      setBookingError(err.message || 'Gagal mengajukan pemesanan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="jadwal" className="py-14 bg-white border-b border-slate-200 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Bagian 01 */}
        <div className="max-w-3xl mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
            Bagian 01
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Ketersediaan Jadwal & Formulir Pemesanan
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-2">
            Pilih tanggal dan slot jam operasional (<span className="font-mono font-semibold">08:00 – 22:00 WIB</span>). Sistem memverifikasi bentrok jadwal secara otomatis dan mengunci tarif Anda.
          </p>
        </div>

        {/* Kontrol Tanggal & Jenis Layanan */}
        <div className="bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-200 mb-8 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* 7 Hari Cepat */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
              {quickDates.map((item) => {
                const isSelected = selectedDate === item.dateStr;
                return (
                  <button
                    key={item.dateStr}
                    onClick={() => setSelectedDate(item.dateStr)}
                    className={`px-3.5 py-2.5 rounded-xl text-left shrink-0 transition-all ${
                      isSelected
                        ? 'bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-600'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold block opacity-80">
                      {item.label}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold block">
                      {item.dateFormatted}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Custom Date Picker */}
            <div className="flex items-center gap-2 shrink-0">
              <CalendarIcon className="w-4 h-4 text-slate-500" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Service Toggle & Status Hari */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-3 border-t border-slate-200">
            {/* Service Toggle */}
            <div className="inline-flex p-1 rounded-xl bg-slate-200/80 border border-slate-300">
              <button
                type="button"
                onClick={() => setServiceType('futsal')}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                  serviceType === 'futsal'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                ⚽ Futsal Reguler
              </button>
              <button
                type="button"
                onClick={() => setServiceType('serbaguna')}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                  serviceType === 'serbaguna'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                🏛️ Gedung Serbaguna (Acara)
              </button>
            </div>

            {/* Status Hari Libur / Akhir Pekan */}
            {scheduleData && (
              <div className="text-xs flex items-center gap-2">
                {scheduleData.holiday?.isHoliday ? (
                  <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-800 font-semibold border border-red-200">
                    🎉 Libur Nasional: {scheduleData.holiday.name}
                  </span>
                ) : scheduleData.isWeekend ? (
                  <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-semibold border border-amber-200">
                    🗓️ Akhir Pekan (Sabtu / Minggu)
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                    💼 Hari Kerja (Senin – Jumat)
                  </span>
                )}
                <span className="text-slate-500 hidden sm:inline">
                  • {scheduleData.availableSlotsCount} slot tersedia
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Peringatan Bentrok Jadwal Realtime (Jika klik slot terisi) */}
        {clashWarning && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3 animate-shake">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <strong className="font-bold block">Pencegahan Bentrok Aktif: Slot Sudah Terisi!</strong>
              <span>
                Slot jam <strong className="font-mono">{clashWarning.hour}</strong> sudah dibooking untuk <strong>{clashWarning.service}</strong> ({clashWarning.code} - {clashWarning.customer}). Silakan klik slot lain yang berwarna hijau (Tersedia).
              </span>
            </div>
            <button
              onClick={() => setClashWarning(null)}
              className="ml-auto text-xs text-red-600 font-bold hover:underline"
            >
              Tutup
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Kolom Kiri: Grid 14 Slot Jam (08:00 - 21:00) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-700" />
                <span>Peta Slot Jam Operasional (08:00 - 22:00)</span>
              </h3>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                  Tersedia
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                  Terisi
                </span>
              </div>
            </div>

            {isLoadingSchedule ? (
              <div className="p-12 text-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-500">
                <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-sm font-medium">Memuat ketersediaan slot...</p>
              </div>
            ) : scheduleError ? (
              <div className="p-6 text-center rounded-2xl border border-red-200 bg-red-50 text-red-700 text-sm">
                <p>{scheduleError}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {scheduleData?.slots.map((slot) => {
                  const isSelectedStart = slot.hour === startHour;
                  const isWithinSelectedRange =
                    slot.hour >= startHour && slot.hour < startHour + duration;
                  const priceToShow =
                    serviceType === 'serbaguna' ? slot.serbagunaPrice : slot.futsalPrice;

                  return (
                    <div
                      key={slot.hour}
                      onClick={() => handleSlotClick(slot)}
                      className={`relative p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                        !slot.isAvailable
                          ? 'bg-red-50/70 border-red-200 opacity-90 hover:border-red-400'
                          : isWithinSelectedRange
                          ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono text-xs font-bold text-slate-900 tabular-nums">
                          {slot.timeLabel}
                        </span>
                        {slot.isAvailable ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            Tersedia
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800">
                            <XCircle className="w-3 h-3" />
                            Terisi
                          </span>
                        )}
                      </div>

                      <div className="flex items-end justify-between mt-2 pt-2 border-t border-slate-100">
                        <span className="font-mono text-xs font-semibold text-slate-600 tabular-nums">
                          Rp {priceToShow.toLocaleString('id-ID')}
                        </span>
                        {slot.isAvailable && isSelectedStart && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                            Mulai
                          </span>
                        )}
                        {!slot.isAvailable && (
                          <span className="text-[10px] font-medium text-red-700 truncate max-w-[80px]">
                            {slot.booking?.customer_name || 'Terisi'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Kolom Kanan: Formulir Pemesanan & Rincian Harga Terkunci */}
          <div id="pesan" className="lg:col-span-5 scroll-mt-24">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-1">
                <Building2 className="w-5 h-5 text-emerald-700" />
                <span>Formulir Pemesanan</span>
              </h3>
              <p className="text-xs text-slate-500 mb-5">
                Isi data diri pemesan. Total harga akan dikunci permanen di sistem.
              </p>

              {/* Success Alert / Booking Receipt */}
              {createdBooking && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Pesanan Berhasil Diajukan!</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-emerald-200 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Kode Booking:</span>
                      <span className="font-mono font-bold text-emerald-800 text-sm">
                        {createdBooking.booking.booking_code}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Nama:</span>
                      <span className="font-semibold text-slate-800">
                        {createdBooking.booking.customer_name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Jadwal:</span>
                      <span className="font-mono text-slate-800">
                        {createdBooking.booking.date} ({String(createdBooking.booking.start_hour).padStart(2, '0')}:00 – {String(createdBooking.booking.end_hour).padStart(2, '0')}:00)
                      </span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-100">
                      <span className="text-slate-500 font-medium">Total Terkunci:</span>
                      <span className="font-mono font-bold text-emerald-700 text-sm">
                        Rp {createdBooking.booking.total_price.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-tight">
                    Silakan simpan kode booking Anda dan lanjutkan pembayaran via QRIS di bagian bawah.
                  </p>
                </div>
              )}

              {/* Error Alert */}
              {bookingError && (
                <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <strong className="font-bold block">Pemesanan Gagal</strong>
                    <span>{bookingError}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleBookingSubmit} className="space-y-4 text-xs sm:text-sm">
                {/* Nama Pemesan */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Pemesan / Komunitas <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Fidel Khalid / Garuda Futsal"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                {/* Nomor WhatsApp */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor WhatsApp Aktif <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      placeholder="Contoh: 081234567890"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm font-mono"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    Digunakan untuk konfirmasi pesanan dan pelacakan QRIS.
                  </span>
                </div>

                {/* Jam Mulai & Durasi */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Jam Mulai <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={startHour}
                      onChange={(e) => {
                        const h = parseInt(e.target.value, 10);
                        setStartHour(h);
                        if (h + duration > 22) setDuration(Math.max(1, 22 - h));
                      }}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm font-mono"
                    >
                      {Array.from({ length: 14 }, (_, i) => i + 8).map((h) => (
                        <option key={h} value={h}>
                          {String(h).padStart(2, '0')}:00 WIB
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Durasi Sewa <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(parseInt(e.target.value, 10))}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm"
                    >
                      {[1, 2, 3, 4, 5]
                        .filter((d) => startHour + d <= 22)
                        .map((d) => (
                          <option key={d} value={d}>
                            {d} Jam (s/d {String(startHour + d).padStart(2, '0')}:00)
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                {/* Catatan Tambahan */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Catatan Acara / Kebutuhan (Opsional)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Contoh: Sparing kantor / Butuh sound system"
                      value={eventNotes}
                      onChange={(e) => setEventNotes(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm"
                    />
                    <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                {/* Pratinjau Harga Terkunci (Price Locking Preview) */}
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Layanan:</span>
                    <span className="font-semibold text-slate-800">
                      {serviceType === 'serbaguna' ? 'Gedung Serbaguna' : 'Futsal Reguler'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Rentang Waktu:</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {String(startHour).padStart(2, '0')}:00 – {String(startHour + duration).padStart(2, '0')}:00 ({duration} Jam)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Rata-rata / Jam:</span>
                    <span className="font-mono font-semibold text-slate-800">
                      Rp {preview.perHour.toLocaleString('id-ID')}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Total Tagihan:</span>
                      <span className="text-[10px] text-emerald-700 font-medium">Terkunci di database</span>
                    </div>
                    <span className="font-mono text-lg font-black text-emerald-700 tabular-nums">
                      Rp {preview.total.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                {/* Tombol Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md shadow-emerald-900/10 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sedang memproses pesanan...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Ajukan Pemesanan & Kunci Jadwal</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
