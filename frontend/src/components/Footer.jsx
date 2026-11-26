import React from 'react';
import { ShieldCheck, Heart } from 'lucide-react';

export default function Footer({ onSwitchToAdmin }) {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-slate-800">
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold font-heading text-lg">
                L
              </div>
              <span className="font-heading font-black text-xl tracking-tight">
                Lasdo Family Futsal
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Digitalisasi operasional penyewaan lapangan futsal indoor dan gedung serbaguna UMKM Lasdo Family Futsal. Sistem reservasi online anti bentrok jadwal dengan pembayaran QRIS.
            </p>
            <p className="text-xs text-slate-500">
              Pengelola UMKM: <strong className="text-slate-300 font-medium">Christino Hirasdo Wiryawan</strong>
            </p>
          </div>

          {/* Tim Capstone Asah 2026 */}
          <div className="md:col-span-4 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Tim Pengembang (A26-CS150)
            </h4>
            <div className="text-xs space-y-1 text-slate-400">
              <p><span className="text-emerald-400 font-medium">Full-Stack:</span> Raden Mas Fidel Khalid R., Juan Herbert Aprianto M., Muhammad Syafri Syamsudin S.</p>
              <p><span className="text-emerald-400 font-medium">Gen AI:</span> Anas Novaldi, Yovana Ibnu Sina</p>
              <p><span className="text-emerald-400 font-medium">Data Science:</span> Muhamad Agung Somomiharjo</p>
              <p className="text-[11px] text-slate-500 pt-1">
                Program Asah 2026 (Dicoding & GoTo)
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Akses Sistem
            </h4>
            <ul className="text-xs space-y-2">
              <li>
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Kembali ke Atas
                </button>
              </li>
              <li>
                <button
                  onClick={onSwitchToAdmin}
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Portal Pengelola (Admin)</span>
                </button>
              </li>
              <li className="text-slate-500 text-[11px]">
                Jam Operasional: 08:00 – 22:00 WIB
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© 2026 Lasdo Family Futsal. Capstone Project Asah 2026.</p>
          <p className="flex items-center gap-1">
            <span>Dibuat dengan dedikasi untuk kemajuan UMKM Indonesia</span>
            <Heart className="w-3.5 h-3.5 text-red-500 inline fill-red-500" />
          </p>
        </div>
      </div>
    </footer>
  );
}
