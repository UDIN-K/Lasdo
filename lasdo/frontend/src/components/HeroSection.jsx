import React, { useState } from 'react';
import { Building2 } from 'lucide-react';
import venueCourtImg from '../assets/images/venue_futsal_court_1795716184209.jpg';

export default function HeroSection({ onBookClick, onScheduleClick, onQrisClick }) {
  const [imgError, setImgError] = useState(false);

  return (
    <section className="bg-white pt-10 pb-10 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          {/* Left Column: Direct Copy & Actions */}
          <div className="lg:col-span-6 flex flex-col justify-center space-y-5 py-2">
            <p className="text-xs sm:text-sm font-medium text-emerald-800">
              Buka setiap hari pukul 08:00 – 22:00 WIB
            </p>

            <h1 className="text-3xl sm:text-[44px] font-bold text-zinc-900 tracking-tight leading-[1.12]">
              Sewa Lapangan Futsal & Gedung Serbaguna
            </h1>

            <p className="text-base text-zinc-600 leading-relaxed max-w-xl">
              Lihat jam yang masih kosong hari ini, pilih durasi main atau acara keluarga, dan selesaikan pembayaran langsung lewat QRIS di Lasdo Family Futsal.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={onScheduleClick}
                className="px-5 py-3 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm sm:text-base transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Lihat Jadwal Kosong
              </button>

              <button
                type="button"
                onClick={onQrisClick || onBookClick}
                className="px-5 py-3 rounded-md bg-white hover:bg-stone-50 text-zinc-800 font-semibold text-sm sm:text-base border border-stone-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Cek Kode Booking
              </button>
            </div>
          </div>

          {/* Right Column: Authentic Unobstructed Venue Photography */}
          <div className="lg:col-span-6">
            <div className="h-full min-h-[260px] sm:min-h-[320px] rounded-lg overflow-hidden border border-stone-200 bg-stone-100">
              {!imgError ? (
                <img
                  src={venueCourtImg}
                  alt="Lapangan futsal indoor rumput sintetis Lasdo Family Futsal dengan jaring pengaman dan lampu arena"
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="w-full h-full lg:h-full object-cover"
                />
              ) : (
                <div className="w-full h-full min-h-[260px] flex flex-col items-center justify-center bg-stone-100 text-zinc-700 p-8 text-center">
                  <Building2 className="w-10 h-10 text-emerald-700 mb-2" />
                  <p className="font-heading font-bold text-base">Lasdo Family Futsal</p>
                  <p className="text-xs text-zinc-500 mt-1">Lapangan Futsal Indoor & Gedung Serbaguna</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Clean Tariff & Hours Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-10 pt-7 border-t border-stone-200">
          <div>
            <span className="text-xs text-zinc-500 block">Jam Operasional</span>
            <span className="font-heading text-sm sm:text-base font-bold text-zinc-900 tabular-nums mt-0.5 block">
              08:00 – 22:00 WIB
            </span>
          </div>
          <div>
            <span className="text-xs text-zinc-500 block">Futsal Siang (Sen–Jum)</span>
            <span className="font-heading text-sm sm:text-base font-bold text-zinc-900 tabular-nums mt-0.5 block">
              Rp 100.000 / jam
            </span>
          </div>
          <div>
            <span className="text-xs text-zinc-500 block">Malam & Akhir Pekan</span>
            <span className="font-heading text-sm sm:text-base font-bold text-zinc-900 tabular-nums mt-0.5 block">
              Rp 150.000 / jam
            </span>
          </div>
          <div>
            <span className="text-xs text-zinc-500 block">Gedung Serbaguna</span>
            <span className="font-heading text-sm sm:text-base font-bold text-emerald-800 tabular-nums mt-0.5 block">
              Rp 300.000 / jam
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
