import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar({ activeView, setActiveView, onNavigateTo }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (sectionId) => {
    setActiveView('customer');
    setMobileMenuOpen(false);
    onNavigateTo(sectionId);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single-line Brand Wordmark */}
          <button
            type="button"
            onClick={() => {
              setActiveView('customer');
              setMobileMenuOpen(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="font-heading font-bold text-lg sm:text-xl tracking-tight text-zinc-900 whitespace-nowrap shrink-0 hover:text-emerald-800 transition-colors cursor-pointer"
          >
            Lasdo Family Futsal
          </button>

          {/* Zone 2: Clean Single-Line Nav Links */}
          <nav
            aria-label="Navigasi Utama"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-600"
          >
            <button
              type="button"
              onClick={() => handleNavClick('jadwal')}
              className="hover:text-zinc-950 hover:underline underline-offset-4 decoration-emerald-700 decoration-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Jadwal
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('pesan')}
              className="hover:text-zinc-950 hover:underline underline-offset-4 decoration-emerald-700 decoration-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Pesan
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('qris')}
              className="hover:text-zinc-950 hover:underline underline-offset-4 decoration-emerald-700 decoration-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Cek QRIS
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('fasilitas')}
              className="hover:text-zinc-950 hover:underline underline-offset-4 decoration-emerald-700 decoration-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Fasilitas
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action + Mobile Menu Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            {activeView === 'customer' ? (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setActiveView('admin');
                }}
                className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-md bg-zinc-900 hover:bg-zinc-800 text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Portal Pengelola
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActiveView('customer')}
                className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-md bg-emerald-700 hover:bg-emerald-800 text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Tampilan Customer
              </button>
            )}

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
              aria-expanded={mobileMenuOpen}
              className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <nav
            aria-label="Navigasi Mobile"
            className="md:hidden py-3 border-t border-slate-200 grid grid-cols-2 gap-2"
          >
            <button
              type="button"
              onClick={() => handleNavClick('jadwal')}
              className="px-3 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Jadwal Kosong
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('pesan')}
              className="px-3 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Form Pemesanan
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('qris')}
              className="px-3 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Cek QRIS
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('fasilitas')}
              className="px-3 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Fasilitas & Aturan
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}
