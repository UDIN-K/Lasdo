import React from 'react';
import { TrendingUp, AlertTriangle, MessageSquareText } from 'lucide-react';

export default function AdminPredictionTab({
  predictionDate,
  setPredictionDate,
  predictionData,
  isLoadingPrediction,
  onLoadPrediction,
  testHour,
  setTestHour,
  hourValidationResult,
  isTestingHour,
  onTestHourValidation,
  intentInput,
  setIntentInput,
  intentResult,
  isClassifying,
  onTestIntent,
}) {
  return (
    <div className="space-y-6">
      {/* Header Kontrol Tanggal */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-heading font-bold text-base text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-700" />
            <span>Prediksi Keramaian Per Jam (08:00 – 21:00 WIB)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Estimasi kepadatan lapangan berdasarkan jam sibuk, akhir pekan, kalender libur, dan pesanan aktif.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <label htmlFor="prediction-date-input" className="text-xs font-semibold text-slate-600">
            Tanggal:
          </label>
          <input
            id="prediction-date-input"
            type="date"
            value={predictionDate}
            onChange={(e) => {
              if (!e.target.value) return;
              setPredictionDate(e.target.value);
              onLoadPrediction(e.target.value);
            }}
            className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>
      </div>

      {/* Grid Prediksi */}
      {isLoadingPrediction ? (
        <div className="p-10 text-center bg-white rounded-xl border border-slate-200">
          <div className="w-7 h-7 border-4 border-emerald-700 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-medium">Memuat prediksi keramaian...</p>
        </div>
      ) : (
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs pb-3 border-b border-slate-200">
            <span className="text-slate-600">
              Status Hari:{' '}
              <strong className="text-slate-900">
                {predictionData?.holiday?.isHoliday
                  ? `Libur (${predictionData.holiday.name})`
                  : predictionData?.isWeekend
                  ? 'Akhir Pekan'
                  : 'Hari Kerja'}
              </strong>
            </span>
            <span className="text-emerald-700 font-bold">
              Jam Puncak: {predictionData?.peakHoursSummary}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {predictionData?.predictions?.map((item) => (
              <div
                key={item.hour}
                className={`p-3 rounded-lg border flex flex-col justify-between ${
                  item.scorePercent >= 80
                    ? 'bg-red-50/70 border-red-200'
                    : item.scorePercent >= 60
                    ? 'bg-amber-50/70 border-amber-200'
                    : item.scorePercent >= 40
                    ? 'bg-blue-50/70 border-blue-200'
                    : 'bg-emerald-50/70 border-emerald-200'
                }`}
              >
                <div>
                  <span className="text-[11px] font-bold text-slate-900 block tabular-nums">
                    {item.timeLabel}
                  </span>
                  <span
                    className={`text-[11px] font-semibold block mt-1 ${
                      item.scorePercent >= 80
                        ? 'text-red-700'
                        : item.scorePercent >= 60
                        ? 'text-amber-700'
                        : item.scorePercent >= 40
                        ? 'text-blue-700'
                        : 'text-emerald-700'
                    }`}
                  >
                    {item.level}
                  </span>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/70 flex items-end justify-between">
                  <span className="font-heading text-base font-bold tabular-nums text-slate-900">
                    {item.scorePercent}%
                  </span>
                  {item.isBooked && (
                    <span className="text-[10px] font-bold text-slate-700">
                      Terisi
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Testers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hour Validation Tester */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
          <div>
            <h4 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Uji Validasi Jam Operasional</span>
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Menguji penolakan API untuk jam di luar rentang operasional <span className="font-mono">08:00 – 21:00</span>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="test-hour-input" className="sr-only">
              Jam yang diuji
            </label>
            <input
              id="test-hour-input"
              type="number"
              placeholder="Misal 23 atau 19"
              value={testHour}
              onChange={(e) => setTestHour(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            <button
              type="button"
              onClick={onTestHourValidation}
              disabled={isTestingHour}
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shrink-0 transition-colors cursor-pointer"
            >
              {isTestingHour ? 'Menguji...' : 'Uji Jam'}
            </button>
          </div>

          {hourValidationResult && (
            <div
              className={`p-3 rounded-lg border text-xs space-y-1 ${
                hourValidationResult.status === 400
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span>Status HTTP:</span>
                <span className="font-mono">
                  {hourValidationResult.status} {hourValidationResult.status === 400 ? '(Ditolak Sesuai Aturan)' : 'OK'}
                </span>
              </div>
              <p className="text-[11px] leading-relaxed">
                {hourValidationResult.message ||
                  `Jam ${testHour}:00 valid — ${hourValidationResult.data?.specificHour?.level} (${hourValidationResult.data?.specificHour?.scorePercent}%)`}
              </p>
            </div>
          )}
        </div>

        {/* Intent Classifier Tester */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
          <div>
            <h4 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
              <MessageSquareText className="w-4 h-4 text-emerald-700" />
              <span>Klasifikasi Maksud Pesan Pelanggan</span>
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Mendeteksi topik pertanyaan calon penyewa agar pengelola dapat merespons lebih cepat.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="intent-test-input" className="sr-only">
              Contoh pesan pelanggan
            </label>
            <input
              id="intent-test-input"
              type="text"
              placeholder="Ketik contoh pesan pelanggan..."
              value={intentInput}
              onChange={(e) => setIntentInput(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            <button
              type="button"
              onClick={onTestIntent}
              disabled={isClassifying}
              className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shrink-0 transition-colors cursor-pointer"
            >
              {isClassifying ? 'Memproses...' : 'Analisis'}
            </button>
          </div>

          {intentResult && (
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Kategori Maksud:</span>
                <span className="font-bold text-emerald-800">{intentResult.intent}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Keyakinan:</span>
                <span className="font-mono font-bold text-slate-800 tabular-nums">
                  {(intentResult.confidence * 100).toFixed(1)}%
                </span>
              </div>
              <p className="text-[11px] text-slate-600 pt-1.5 border-t border-slate-200">
                Saran Aksi: {intentResult.suggestedAction}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Model Comparison Table */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
        <h4 className="font-heading font-bold text-sm text-slate-900">
          Perbandingan Performa Model Prediksi
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
              <tr>
                <th className="p-3">Model</th>
                <th className="p-3 text-right">Accuracy</th>
                <th className="p-3 text-right">Precision</th>
                <th className="p-3 text-right">Recall</th>
                <th className="p-3 text-right">F1-Score</th>
                <th className="p-3 text-right">ROC-AUC</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
              <tr className="bg-emerald-50/40">
                <td className="p-3 font-sans font-bold text-slate-900">
                  {predictionData?.modelComparison?.randomForest?.modelName}
                </td>
                <td className="p-3 text-right font-bold text-emerald-800">0.924</td>
                <td className="p-3 text-right">0.912</td>
                <td className="p-3 text-right">0.935</td>
                <td className="p-3 text-right font-bold text-emerald-800">0.923</td>
                <td className="p-3 text-right">0.961</td>
                <td className="p-3 font-sans font-semibold text-emerald-700">Aktif</td>
              </tr>
              <tr>
                <td className="p-3 font-sans font-medium text-slate-700">
                  {predictionData?.modelComparison?.logisticRegression?.modelName}
                </td>
                <td className="p-3 text-right">0.812</td>
                <td className="p-3 text-right">0.795</td>
                <td className="p-3 text-right">0.831</td>
                <td className="p-3 text-right">0.813</td>
                <td className="p-3 text-right">0.874</td>
                <td className="p-3 font-sans text-slate-500">Pembanding</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
