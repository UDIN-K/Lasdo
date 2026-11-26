import React from 'react';
import { Settings, CheckCircle2 } from 'lucide-react';

export default function AdminPricingTab({
  pricingForm,
  setPricingForm,
  isUpdatingPricing,
  pricingMessage,
  onSavePricing,
}) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-6">
      <div>
        <h3 className="font-heading font-bold text-base text-slate-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-700" />
          <span>Pengaturan Tarif Sewa Per Jam</span>
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Perubahan tarif berlaku untuk pesanan baru yang dibuat setelah disimpan. Pesanan yang sudah masuk tetap menggunakan tarif lama.
        </p>
      </div>

      {pricingMessage && (
        <div role="status" className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{pricingMessage}</span>
        </div>
      )}

      <form onSubmit={onSavePricing} className="space-y-5 max-w-lg text-xs sm:text-sm">
        <div>
          <label htmlFor="price-futsal-day" className="block text-xs font-bold text-slate-700 mb-1.5">
            Tarif Futsal Siang (08:00 – 17:00 Hari Kerja)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-bold">Rp</span>
            <input
              id="price-futsal-day"
              type="number"
              step="5000"
              min="10000"
              required
              value={pricingForm.futsal_day}
              onChange={(e) => setPricingForm({ ...pricingForm, futsal_day: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-slate-900 font-bold tabular-nums focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
        </div>

        <div>
          <label htmlFor="price-futsal-night" className="block text-xs font-bold text-slate-700 mb-1.5">
            Tarif Futsal Malam (17:00 – 22:00) & Akhir Pekan / Libur
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-bold">Rp</span>
            <input
              id="price-futsal-night"
              type="number"
              step="5000"
              min="10000"
              required
              value={pricingForm.futsal_night_weekend}
              onChange={(e) =>
                setPricingForm({ ...pricingForm, futsal_night_weekend: e.target.value })
              }
              className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-slate-900 font-bold tabular-nums focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
        </div>

        <div>
          <label htmlFor="price-serbaguna" className="block text-xs font-bold text-slate-700 mb-1.5">
            Tarif Gedung Serbaguna (Acara & Syukuran)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-bold">Rp</span>
            <input
              id="price-serbaguna"
              type="number"
              step="10000"
              min="10000"
              required
              value={pricingForm.serbaguna}
              onChange={(e) => setPricingForm({ ...pricingForm, serbaguna: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-slate-900 font-bold tabular-nums focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isUpdatingPricing}
          className="py-2.5 px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm transition-colors disabled:opacity-50 cursor-pointer"
        >
          {isUpdatingPricing ? 'Menyimpan...' : 'Simpan Perubahan Tarif'}
        </button>
      </form>
    </div>
  );
}
