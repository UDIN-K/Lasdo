import React from 'react';
import { Calendar, Clock, CreditCard, Sparkles, Building2, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function HeroSection({ onBookClick, onScheduleClick }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/50 via-white to-slate-50 pt-8 pb-14 border-b border-slate-200">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none opacity-40">
        <div className="absolute -top-12 left-10 w-72 h-72 bg-emerald-200/50 rounded-full blur-3xl"></div>
        <div className="absolute top-20 right-10 w-96 h-96 bg-teal-200/40 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Text & CTA */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold shadow-xs">
              <Sparkles className="w-4 h-4 text-emerald-700 animate-pulse" />
              <span>Capstone Asah 2026 — Tim A26-CS150</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Sewa Lapangan Futsal & <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-700">
                Gedung Serbaguna Indoor
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
              Platform reservasi digital resmi <strong className="text-slate-800 font-semibold">Lasdo Family Futsal</strong> (Kelolaan Christino Hirasdo Wiryawan). Cek jadwal kosong secara transparan tanpa risiko bentrok, nikmati tarif sewa terkunci, dan selesaikan pembayaran cepat via QRIS.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                onClick={onScheduleClick}
                className="px-6 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm sm:text-base shadow-md shadow-emerald-900/20 flex items-center gap-2.5 transition-all hover:scale-[1.02] active:scale-95"
              >
                <Calendar className="w-5 h-5" />
                <span>Lihat Jadwal Kosong</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onBookClick}
                className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm sm:text-base border border-slate-300 shadow-xs flex items-center gap-2 transition-all hover:border-slate-400"
              >
                <Building2 className="w-5 h-5 text-emerald-700" />
                <span>Form Pemesanan</span>
              </button>
            </div>

            {/* Key Advantages */}
            <div className="flex flex-wrap gap-4 pt-2 text-xs sm:text-sm text-slate-600">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Pencegahan Bentrok Otomatis</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Harga Terkunci Pasti</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>QRIS Instan Semua Bank</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Arena Graphic */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="relative rounded-2xl bg-gradient-to-tr from-slate-900 via-emerald-950 to-slate-900 p-6 shadow-2xl text-white border border-emerald-900/40 overflow-hidden">
                {/* Court illustration */}
                <div className="absolute inset-0 opacity-15 pointer-events-none">
                  <svg className="w-full h-full" viewBox="0 0 400 300" fill="none" stroke="currentColor">
                    <rect x="20" y="20" width="360" height="260" rx="8" strokeWidth="2" />
                    <line x1="200" y1="20" x2="200" y2="280" strokeWidth="2" />
                    <circle cx="200" cy="150" r="45" strokeWidth="2" />
                    <rect x="20" y="80" width="60" height="140" strokeWidth="2" />
                    <rect x="320" y="80" width="60" height="140" strokeWidth="2" />
                  </svg>
                </div>

                <div className="relative z-10 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
                      Indoor Synthetic Court
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                      Operasional Aktif
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold font-heading text-white">
                      Lasdo Family Arena
                    </h3>
                    <p className="text-xs text-slate-300 mt-1">
                      Lapangan standar futsal indoor dengan pencahayaan LED terang, ventilasi optimal, dan fungsi ganda gedung serbaguna.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                      <span className="text-[11px] text-slate-300">Futsal Siang</span>
                      <p className="font-mono text-base font-bold text-emerald-300 tabular-nums">
                        Rp 100.000<span className="text-[10px] text-slate-300 font-normal">/jam</span>
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                      <span className="text-[11px] text-slate-300">Malam / Weekend</span>
                      <p className="font-mono text-base font-bold text-amber-300 tabular-nums">
                        Rp 150.000<span className="text-[10px] text-slate-300 font-normal">/jam</span>
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-900/60 border border-emerald-700/50 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-emerald-200 block">Sewa Gedung Acara</span>
                      <span className="text-xs text-white font-medium">Syukuran / Senam / Resepsi</span>
                    </div>
                    <span className="font-mono text-sm font-bold text-white tabular-nums">
                      Rp 300.000<span className="text-[10px] text-emerald-200 font-normal">/jam</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Info Strips */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 pt-8 border-t border-slate-200">
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium block">Jam Operasional</span>
              <span className="text-sm font-bold font-mono text-slate-900 tabular-nums">
                08:00 – 22:00 WIB
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium block">Tarif Futsal</span>
              <span className="text-sm font-bold font-mono text-slate-900 tabular-nums">
                Mulai Rp 100.000
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium block">Gedung Serbaguna</span>
              <span className="text-sm font-bold font-mono text-slate-900 tabular-nums">
                Rp 300.000 / jam
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium block">Pembayaran QRIS</span>
              <span className="text-sm font-bold text-slate-900">
                Instan & Transparan
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
