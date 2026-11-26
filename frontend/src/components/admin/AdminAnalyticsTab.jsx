import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function AdminAnalyticsTab({ analyticsData, isLoadingAnalytics }) {
  if (isLoadingAnalytics && !analyticsData) {
    return (
      <div className="p-10 text-center bg-white rounded-xl border border-slate-200">
        <div className="w-7 h-7 border-4 border-emerald-700 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs text-slate-500 font-medium">Memuat analitik okupansi...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Demo Data Notice */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm">
          <strong className="font-bold block">Catatan Data Simulasi MVP</strong>
          <span className="text-amber-900">
            Statistik mingguan di bawah disimulasikan dari hasil observasi lapangan untuk membantu perencanaan promosi dan jadwal operasional.
          </span>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs text-slate-500 font-medium block">Rata-rata Okupansi</span>
          <span className="font-heading text-2xl font-bold text-slate-900 tabular-nums mt-1 block">
            {analyticsData?.kpis?.averageWeeklyOccupancy || '61.2%'}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs text-emerald-700 font-medium block">Porsi Sewa Futsal</span>
          <span className="font-heading text-2xl font-bold text-emerald-700 tabular-nums mt-1 block">
            {analyticsData?.kpis?.futsalSharePercent || 78.5}%
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs text-slate-600 font-medium block">Porsi Serbaguna</span>
          <span className="font-heading text-2xl font-bold text-slate-800 tabular-nums mt-1 block">
            {analyticsData?.kpis?.serbagunaSharePercent || 21.5}%
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs text-amber-700 font-medium block">Lonjakan Hari Libur</span>
          <span className="font-heading text-2xl font-bold text-amber-700 tabular-nums mt-1 block">
            {analyticsData?.kpis?.holidayDemandSpike || '+42.3%'}
          </span>
        </div>
      </div>

      {/* Weekly Occupancy Distribution */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
        <div>
          <h4 className="font-heading font-bold text-sm text-slate-900">
            Distribusi Okupansi Mingguan (Senin – Minggu)
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Persentase jam terisi sepanjang jam operasional 08:00–22:00 WIB.
          </p>
        </div>

        <div className="space-y-3 pt-1">
          {analyticsData?.weeklyDistribution?.map((item) => (
            <div key={item.day} className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-800">{item.day}</span>
                <span className="text-slate-600 tabular-nums">
                  {item.occupancyRate.toFixed(1)}% · Futsal {item.futsalHours} jam · Serbaguna {item.serbagunaHours} jam
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  style={{ width: `${item.occupancyRate}%` }}
                  className={`h-full rounded-full transition-all duration-500 ${
                    item.occupancyRate > 80
                      ? 'bg-red-500'
                      : item.occupancyRate > 50
                      ? 'bg-emerald-600'
                      : 'bg-blue-500'
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strategic Findings */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
        <h4 className="font-heading font-bold text-sm text-slate-900">
          Temuan Strategis & Rekomendasi Operasional
        </h4>

        <div className="divide-y divide-slate-200">
          {analyticsData?.businessInsights?.map((item) => (
            <div key={item.id} className="py-4 first:pt-0 last:pb-0 space-y-1.5 text-xs">
              <p className="font-bold text-slate-900 text-sm">
                {item.id}. {item.question}
              </p>
              <p className="text-slate-600 leading-relaxed">
                <strong className="text-slate-800">Temuan:</strong> {item.finding}
              </p>
              <p className="text-emerald-800 font-medium leading-relaxed">
                <strong>Rekomendasi:</strong> {item.recommendation}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
