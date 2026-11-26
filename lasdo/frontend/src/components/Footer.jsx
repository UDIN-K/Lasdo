import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function Footer({ onSwitchToAdmin, onNavigateTo }) {
  return (
    <footer className="bg-zinc-950 text-zinc-400 py-12 border-t border-zinc-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-zinc-800">
          <div className="md:col-span-5 space-y-2.5">
            <span className="font-heading font-bold text-lg tracking-tight text-white block">
              Lasdo Family Futsal
            </span>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
              Reservasi lapangan futsal indoor dan gedung serbaguna dengan pengecekan jadwal kosong dan pembayaran QRIS.
            </p>
            <p className="text-xs text-zinc-500">
              Jam Operasional: 08:00 – 22:00 WIB setiap hari
            </p>
          </div>

          <div className="md:col-span-4 space-y-2">
            <h4 className="text-xs font-bold text-slate-200">Navigasi</h4>
            <ul className="text-xs space-y-2">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateTo && onNavigateTo('jadwal')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Cek Ketersediaan Jadwal
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateTo && onNavigateTo('qris')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Pelacakan Status & QRIS
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateTo && onNavigateTo('fasilitas')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Fasilitas & Tata Tertib
                </button>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-2">
            <h4 className="text-xs font-bold text-slate-200">Pengelola</h4>
            <ul className="text-xs space-y-2">
              <li>
                <button
                  type="button"
                  onClick={onSwitchToAdmin}
                  className="hover:text-white transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Masuk Portal Pengelola</span>
                </button>
              </li>
              <li className="text-slate-500">
                Pengelola: Christino Hirasdo Wiryawan
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <p>© 2026 Lasdo Family Futsal. Seluruh hak cipta dilindungi.</p>
          <p>Sistem Reservasi Arena & Gedung Serbaguna</p>
        </div>
      </div>
    </footer>
  );
}
