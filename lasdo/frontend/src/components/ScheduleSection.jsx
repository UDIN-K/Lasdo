import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react';
import { fetchSchedule, createBooking } from '../services/api';
import {
  buildQuickDates,
  computePreviewPrice,
  formatHour,
  formatHourRange,
  formatRupiah,
  getDurationOptions,
  isValidIndonesianPhone,
} from '../utils/bookingHelpers';

export default function ScheduleSection({ onBookingSuccess }) {
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  });

  const [serviceType, setServiceType] = useState('futsal');
  const [scheduleData, setScheduleData] = useState(null);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(false);
  const [scheduleError, setScheduleError] = useState(null);
  const [clashWarning, setClashWarning] = useState(null);

  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [startHour, setStartHour] = useState(19);
  const [duration, setDuration] = useState(1);
  const [eventNotes, setEventNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [createdBooking, setCreatedBooking] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const quickDates = useMemo(() => buildQuickDates(7), []);

  const loadSchedule = async (dateToLoad = selectedDate) => {
    setIsLoadingSchedule(true);
    setScheduleError(null);
    setClashWarning(null);
    try {
      const data = await fetchSchedule(dateToLoad);
      setScheduleData(data);
      const firstAvailable = data.slots.find((s) => s.isAvailable);
      if (firstAvailable) {
        setStartHour(firstAvailable.hour);
        setDuration(1);
      }
    } catch (err) {
      setScheduleError(err.message || 'Gagal memuat jadwal.');
    } finally {
      setIsLoadingSchedule(false);
    }
  };

  useEffect(() => {
    loadSchedule(selectedDate);
  }, [selectedDate]);

  const durationOptions = useMemo(() => {
    return getDurationOptions(scheduleData?.slots || [], startHour, 5);
  }, [scheduleData, startHour]);

  useEffect(() => {
    if (durationOptions.length === 0) return;
    const currentOpt = durationOptions.find((opt) => opt.duration === duration);
    if (!currentOpt || !currentOpt.isAvailable) {
      const firstValid = durationOptions.find((opt) => opt.isAvailable);
      if (firstValid) setDuration(firstValid.duration);
    }
  }, [durationOptions, duration]);

  const preview = useMemo(
    () => computePreviewPrice(scheduleData, serviceType, startHour, duration),
    [scheduleData, serviceType, startHour, duration]
  );

  const handleSlotClick = (slot) => {
    if (!slot.isAvailable) {
      const nextFree = scheduleData?.slots.find((s) => s.isAvailable && s.hour > slot.hour)
        || scheduleData?.slots.find((s) => s.isAvailable);
      setClashWarning({
        hour: slot.timeLabel,
        service: slot.booking?.service_type === 'serbaguna' ? 'Gedung Serbaguna' : 'Futsal',
        nextFreeHour: nextFree ? nextFree.hour : null,
      });
      return;
    }

    setClashWarning(null);
    setBookingError(null);
    setStartHour(slot.hour);
  };

  const phoneIsValid = !phoneNumber || isValidIndonesianPhone(phoneNumber);
  const selectedDurationValid = durationOptions.find((d) => d.duration === duration)?.isAvailable ?? true;

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setPhoneTouched(true);
    setBookingError(null);

    if (!isValidIndonesianPhone(phoneNumber)) {
      setBookingError('Masukkan nomor WhatsApp Indonesia yang valid (contoh: 081234567890).');
      return;
    }

    if (!selectedDurationValid) {
      setBookingError('Durasi yang dipilih bertabrakan dengan jam yang sudah terisi.');
      return;
    }

    setIsSubmitting(true);
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
      const updatedSchedule = await fetchSchedule(selectedDate);
      setScheduleData(updatedSchedule);

      if (onBookingSuccess) {
        onBookingSuccess(res.data.booking.booking_code, false);
      }
    } catch (err) {
      setBookingError(err.message || 'Gagal mengajukan pemesanan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForNewBooking = () => {
    setCreatedBooking(null);
    setCustomerName('');
    setPhoneNumber('');
    setPhoneTouched(false);
    setEventNotes('');
    setBookingError(null);
    const firstAvailable = scheduleData?.slots.find((s) => s.isAvailable);
    if (firstAvailable) {
      setStartHour(firstAvailable.hour);
      setDuration(1);
    }
  };

  const handleCopyBookingCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <section id="jadwal" className="py-12 bg-[#fafaf8] border-b border-stone-200 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Direct Heading */}
        <div className="max-w-2xl mb-7">
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
            Jadwal & Pemesanan
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 mt-1.5">
            Pilih tanggal, lalu klik jam mulai yang masih kosong untuk mengisi data pemesanan.
          </p>
        </div>

        {/* Date & Service Toolbar */}
        <div className="bg-white p-4 sm:p-5 rounded-lg border border-stone-200 mb-7 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
              {quickDates.map((item) => {
                const isSelected = selectedDate === item.dateStr;
                return (
                  <button
                    key={item.dateStr}
                    type="button"
                    onClick={() => setSelectedDate(item.dateStr)}
                    aria-pressed={isSelected}
                    className={`px-3.5 py-2 rounded-md text-left shrink-0 transition-colors cursor-pointer border ${
                      isSelected
                        ? 'bg-emerald-700 border-emerald-700 text-white'
                        : 'bg-stone-50 border-stone-200 text-zinc-700 hover:bg-stone-100'
                    }`}
                  >
                    <span className={`text-[11px] font-medium block ${isSelected ? 'text-emerald-100' : 'text-zinc-500'}`}>
                      {item.label}
                    </span>
                    <span className="text-xs sm:text-sm font-bold block whitespace-nowrap">
                      {item.dateFormatted}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <label htmlFor="custom-date-picker" className="text-xs font-medium text-zinc-600">
                Tanggal Lain:
              </label>
              <input
                id="custom-date-picker"
                type="date"
                value={selectedDate}
                onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                className="bg-stone-50 border border-stone-300 rounded-md px-3 py-2 text-xs sm:text-sm font-medium text-zinc-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-stone-200">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-medium text-zinc-500">Layanan:</span>
              <div className="inline-flex p-1 rounded-md bg-stone-100 border border-stone-200" role="group" aria-label="Pilih Jenis Layanan">
                <button
                  type="button"
                  onClick={() => setServiceType('futsal')}
                  aria-pressed={serviceType === 'futsal'}
                  className={`px-3.5 py-1.5 rounded text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    serviceType === 'futsal'
                      ? 'bg-white text-zinc-900 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  Lapangan Futsal
                </button>
                <button
                  type="button"
                  onClick={() => setServiceType('serbaguna')}
                  aria-pressed={serviceType === 'serbaguna'}
                  className={`px-3.5 py-1.5 rounded text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    serviceType === 'serbaguna'
                      ? 'bg-white text-zinc-900 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  Gedung Serbaguna
                </button>
              </div>
            </div>

            {scheduleData && (
              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-600">
                <span className="font-semibold text-zinc-800">
                  {scheduleData.holiday?.isHoliday
                    ? `Libur Nasional: ${scheduleData.holiday.name}`
                    : scheduleData.isWeekend
                    ? 'Akhir Pekan (Tarif Weekend)'
                    : 'Hari Kerja (Senin – Jumat)'}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-semibold text-emerald-800 tabular-nums">
                  {scheduleData.availableSlotsCount} dari {scheduleData.totalSlots} jam kosong
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Inline Clash Notice */}
        {clashWarning && (
          <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm">
                <strong className="font-bold block">Jam {clashWarning.hour} sudah terisi ({clashWarning.service})</strong>
                <span className="text-amber-900">
                  Silakan pilih jam lain yang masih kosong.
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {clashWarning.nextFreeHour && (
                <button
                  type="button"
                  onClick={() => {
                    setStartHour(clashWarning.nextFreeHour);
                    setClashWarning(null);
                  }}
                  className="px-3 py-1.5 rounded-md bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold cursor-pointer"
                >
                  Pilih Jam {formatHour(clashWarning.nextFreeHour)}
                </button>
              )}
              <button
                type="button"
                onClick={() => setClashWarning(null)}
                className="text-xs font-semibold text-amber-800 hover:underline cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
          {/* Timetable Slots Grid */}
          <div className="lg:col-span-7 space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-base font-bold text-zinc-900">
                Pilih Jam Mulai (08:00 – 22:00)
              </h3>
              <div className="flex items-center gap-4 text-xs text-zinc-600">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs border border-stone-300 bg-white inline-block" />
                  Kosong
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-emerald-700 inline-block" />
                  Dipilih
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-stone-200 inline-block" />
                  Terisi
                </span>
              </div>
            </div>

            {isLoadingSchedule ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {Array.from({ length: 12 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="h-16 rounded-lg border border-stone-200 bg-white p-3 animate-pulse space-y-2"
                  >
                    <div className="h-3.5 w-24 bg-stone-200 rounded" />
                    <div className="h-3 w-16 bg-stone-100 rounded" />
                  </div>
                ))}
              </div>
            ) : scheduleError ? (
              <div className="p-6 text-center rounded-lg border border-red-200 bg-red-50 text-red-800 text-sm space-y-3">
                <p>{scheduleError}</p>
                <button
                  type="button"
                  onClick={() => loadSchedule(selectedDate)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-red-700 text-white text-xs font-semibold hover:bg-red-800 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Coba Muat Ulang
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {scheduleData?.slots.map((slot) => {
                  const isSelectedStart = slot.isAvailable && slot.hour === startHour;
                  const isWithinSelectedRange =
                    slot.isAvailable && slot.hour >= startHour && slot.hour < startHour + duration;
                  const priceToShow =
                    serviceType === 'serbaguna' ? slot.serbagunaPrice : slot.futsalPrice;

                  return (
                    <button
                      key={slot.hour}
                      type="button"
                      onClick={() => handleSlotClick(slot)}
                      aria-pressed={isWithinSelectedRange}
                      aria-label={`Slot ${slot.timeLabel}, ${
                        slot.isAvailable ? `Tersedia, ${formatRupiah(priceToShow)}` : 'Sudah Terisi'
                      }`}
                      className={`px-3.5 py-3 rounded-lg border text-left transition-colors cursor-pointer ${
                        !slot.isAvailable
                          ? 'bg-stone-100 border-stone-200 text-zinc-400 hover:border-stone-300'
                          : isWithinSelectedRange
                          ? 'bg-emerald-700 border-emerald-700 text-white'
                          : 'bg-white border-stone-200 text-zinc-900 hover:border-emerald-600'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-xs sm:text-sm font-bold tabular-nums ${
                            !slot.isAvailable
                              ? 'text-zinc-400 line-through'
                              : isWithinSelectedRange
                              ? 'text-white'
                              : 'text-zinc-900'
                          }`}
                        >
                          {slot.timeLabel}
                        </span>
                        {isSelectedStart && (
                          <span className="text-[11px] font-semibold text-emerald-100">Mulai</span>
                        )}
                        {!isSelectedStart && isWithinSelectedRange && (
                          <span className="text-[11px] font-semibold text-emerald-100">Dipilih</span>
                        )}
                      </div>

                      <div className="mt-1 text-xs tabular-nums">
                        {slot.isAvailable ? (
                          <span className={isWithinSelectedRange ? 'text-emerald-100' : 'text-zinc-600'}>
                            {formatRupiah(priceToShow)}
                          </span>
                        ) : (
                          <span className="text-zinc-500">
                            Terisi ({slot.booking?.service_type === 'serbaguna' ? 'Acara' : 'Futsal'})
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Booking Form */}
          <div id="pesan" className="lg:col-span-5 scroll-mt-24">
            <div className="bg-white border border-stone-200 rounded-lg p-5 sm:p-6">
              {createdBooking ? (
                <div className="space-y-5">
                  <div className="flex items-start gap-3 pb-4 border-b border-stone-200">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-heading font-bold text-lg text-zinc-900">
                        Pesanan Berhasil Dibuat
                      </h3>
                      <p className="text-xs text-zinc-600 mt-0.5">
                        Simpan kode booking di bawah untuk pembayaran QRIS.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-xs sm:text-sm">
                    <div className="flex items-center justify-between py-2 border-b border-stone-100">
                      <span className="text-zinc-500">Kode Booking</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-emerald-800 text-base">
                          {createdBooking.booking.booking_code}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyBookingCode(createdBooking.booking.booking_code)}
                          aria-label="Salin kode booking"
                          className="p-1.5 rounded text-zinc-500 hover:text-emerald-700 hover:bg-stone-100 cursor-pointer"
                        >
                          {copiedCode ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-1">
                      <span className="text-zinc-500">Nama Pemesan</span>
                      <span className="font-semibold text-zinc-900">{createdBooking.booking.customer_name}</span>
                    </div>

                    <div className="flex items-center justify-between py-1">
                      <span className="text-zinc-500">Tanggal & Jam</span>
                      <span className="font-semibold text-zinc-900 tabular-nums">
                        {createdBooking.booking.date} ({formatHour(createdBooking.booking.start_hour)} – {formatHour(createdBooking.booking.end_hour)})
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-stone-200">
                      <span className="font-bold text-zinc-900">Total Bayar</span>
                      <span className="font-heading text-lg font-bold text-emerald-800 tabular-nums">
                        {formatRupiah(createdBooking.booking.total_price)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (onBookingSuccess) {
                          onBookingSuccess(createdBooking.booking.booking_code, true);
                        }
                      }}
                      className="w-full py-3 px-4 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm transition-colors cursor-pointer"
                    >
                      Lanjut Bayar QRIS
                    </button>
                    <button
                      type="button"
                      onClick={handleResetForNewBooking}
                      className="w-full py-2.5 px-4 rounded-md bg-stone-100 hover:bg-stone-200 text-zinc-700 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
                    >
                      Buat Pesanan Lain
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-zinc-900">
                      Detail Pemesanan
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Isi data di bawah sesuai jam yang dipilih.
                    </p>
                  </div>

                  {bookingError && (
                    <div role="alert" className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <span>{bookingError}</span>
                    </div>
                  )}

                  <form onSubmit={handleBookingSubmit} className="space-y-3.5 text-xs sm:text-sm">
                    <div>
                      <label htmlFor="booking-customer-name" className="block text-xs font-semibold text-zinc-700 mb-1.5">
                        Nama Pemesan atau Tim <span className="text-red-600">*</span>
                      </label>
                      <input
                        id="booking-customer-name"
                        type="text"
                        required
                        minLength={2}
                        placeholder="Contoh: Fidel Khalid / Garuda FC"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-300 rounded-md px-3 py-2.5 text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="booking-phone" className="block text-xs font-semibold text-zinc-700 mb-1.5">
                        Nomor WhatsApp <span className="text-red-600">*</span>
                      </label>
                      <input
                        id="booking-phone"
                        type="tel"
                        required
                        placeholder="Contoh: 081234567890"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        onBlur={() => setPhoneTouched(true)}
                        className={`w-full bg-stone-50 border rounded-md px-3 py-2.5 text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 text-sm tabular-nums ${
                          phoneTouched && !phoneIsValid
                            ? 'border-red-400 focus:ring-red-500'
                            : 'border-stone-300 focus:ring-emerald-700'
                        }`}
                      />
                      {phoneTouched && !phoneIsValid && (
                        <p className="text-[11px] text-red-600 mt-1">
                          Gunakan nomor HP Indonesia yang valid (08... atau +62...).
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="booking-start-hour" className="block text-xs font-semibold text-zinc-700 mb-1.5">
                          Jam Mulai
                        </label>
                        <select
                          id="booking-start-hour"
                          value={startHour}
                          onChange={(e) => setStartHour(parseInt(e.target.value, 10))}
                          className="w-full bg-stone-50 border border-stone-300 rounded-md px-2.5 py-2.5 text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 text-xs sm:text-sm tabular-nums"
                        >
                          {(scheduleData?.slots || Array.from({ length: 14 }, (_, i) => ({ hour: i + 8, isAvailable: true }))).map(
                            (s) => (
                              <option key={s.hour} value={s.hour} disabled={!s.isAvailable}>
                                {formatHour(s.hour)} WIB {!s.isAvailable ? '(Terisi)' : ''}
                              </option>
                            )
                          )}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="booking-duration" className="block text-xs font-semibold text-zinc-700 mb-1.5">
                          Durasi Sewa
                        </label>
                        <select
                          id="booking-duration"
                          value={duration}
                          onChange={(e) => setDuration(parseInt(e.target.value, 10))}
                          className="w-full bg-stone-50 border border-stone-300 rounded-md px-2.5 py-2.5 text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 text-xs sm:text-sm"
                        >
                          {durationOptions.map((opt) => (
                            <option key={opt.duration} value={opt.duration} disabled={!opt.isAvailable}>
                              {opt.label} {!opt.isAvailable ? `(Bentrok ${formatHour(opt.conflictHour)})` : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="booking-notes" className="block text-xs font-semibold text-zinc-700 mb-1.5">
                        Catatan <span className="text-zinc-400 font-normal">(Opsional)</span>
                      </label>
                      <input
                        id="booking-notes"
                        type="text"
                        placeholder="Contoh: Sparing rutin / butuh sound system"
                        value={eventNotes}
                        onChange={(e) => setEventNotes(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-300 rounded-md px-3 py-2.5 text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 text-sm"
                      />
                    </div>

                    {/* Clean Ledger Price Summary */}
                    <div className="pt-4 border-t border-stone-200 space-y-2">
                      <div className="flex items-center justify-between text-xs text-zinc-600">
                        <span>Layanan & Jam</span>
                        <span className="font-semibold text-zinc-900 tabular-nums">
                          {serviceType === 'serbaguna' ? 'Gedung Serbaguna' : 'Futsal'} · {formatHourRange(startHour, duration)}
                        </span>
                      </div>

                      {preview.breakdown.map((item) => (
                        <div key={item.hour} className="flex items-center justify-between text-xs text-zinc-500">
                          <span>
                            {item.time} ({item.label})
                          </span>
                          <span className="tabular-nums">{formatRupiah(item.rate)}</span>
                        </div>
                      ))}

                      <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
                        <span className="text-sm font-bold text-zinc-900">Total Bayar</span>
                        <span className="font-heading text-xl font-bold text-emerald-800 tabular-nums">
                          {formatRupiah(preview.total)}
                        </span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || !selectedDurationValid}
                      className="w-full py-3 px-4 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Memproses Pesanan...</span>
                        </>
                      ) : (
                        <span>Buat Pesanan</span>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
