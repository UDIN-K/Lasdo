import React from 'react';
import { Calendar, Shield, CreditCard, Sparkles, Building2, UserCheck, ArrowRight } from 'lucide-react';

export default function Navbar({ activeView, setActiveView, onNavigateTo }) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo / Wordmark */}
          <div
            onClick={() => { setActiveView('customer'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-800 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-900/20 group-hover:scale-105 transition-transform">
              <span className="font-heading font-extrabold text-xl tracking-tight">L</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-black text-xl tracking-tight text-slate-900">
                  Lasdo Family Futsal
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 leading-tight">
                Arena Olahraga & Gedung Serbaguna
              </p>
            </div>
          </div>

          {/* Nav Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => { setActiveView('customer'); onNavigateTo('jadwal'); }}
              className="px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-emerald-700 hover:bg-slate-100/80 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Calendar className="w-4 h-4 text-emerald-600" />
              Jadwal
            </button>
            <button
              onClick={() => { setActiveView('customer'); onNavigateTo('pesan'); }}
              className="px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-emerald-700 hover:bg-slate-100/80 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Building2 className="w-4 h-4 text-emerald-600" />
              Pesan
            </button>
            <button
              onClick={() => { setActiveView('customer'); onNavigateTo('qris'); }}
              className="px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-emerald-700 hover:bg-slate-100/80 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <CreditCard className="w-4 h-4 text-emerald-600" />
              Cek QRIS
            </button>
            <button
              onClick={() => { setActiveView('customer'); onNavigateTo('fasilitas'); }}
              className="px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-emerald-700 hover:bg-slate-100/80 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Shield className="w-4 h-4 text-emerald-600" />
              Fasilitas
            </button>
          </nav>

          {/* Right Action: Switch Portal */}
          <div className="flex items-center gap-2">
            {activeView === 'customer' ? (
              <button
                onClick={() => setActiveView('admin')}
                className="px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white shadow-sm flex items-center gap-2 transition-all hover:shadow"
              >
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span>Portal Pengelola</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-70 hidden sm:inline" />
              </button>
            ) : (
              <button
                onClick={() => setActiveView('customer')}
                className="px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm flex items-center gap-2 transition-all"
              >
                <span>Tampilan Customer</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
