import React, { useState, useEffect } from 'react';
import {
  Shield, UserCheck, Calendar, TrendingUp, BarChart3, Settings,
  Search, Filter, CheckCircle2, XCircle, Clock, AlertCircle, LogOut,
  ArrowLeft, RefreshCw, Sparkles, Send, HelpCircle, Check, DollarSign,
  Building2, Users, AlertTriangle
} from 'lucide-react';
import {
  adminLogin, fetchAdminBookings, updateAdminBookingStatus,
  fetchPricing, updatePricing, fetchCrowdPrediction,
  classifyIntent, fetchAnalytics
} from '../services/api';

export default function AdminPortal({ onBackToCustomer }) {
  // Auth State
  const [token, setToken] = useState(() => localStorage.getItem('lasdo_admin_token'));
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('lasdo2026');
  const [loginError, setLoginError] = useState(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active Tab: 'jadwal' | 'prediksi' | 'analisis' | 'tarif'
  const [activeTab, setActiveTab] = useState('jadwal');

  // Tab 1: Jadwal & Pesanan State
  const [bookings, setBookings] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPayment, setFilterPayment] = useState('');
  const [filterSearch, setFilterSearch] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [updatingBookingId, setUpdatingBookingId] = useState(null);

  // Tab 2: Prediksi Keramaian State
  const [predictionDate, setPredictionDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [predictionData, setPredictionData] = useState(null);
  const [isLoadingPrediction, setIsLoadingPrediction] = useState(false);
  // Hour validation test
  const [testHour, setTestHour] = useState('23');
  const [hourValidationResult, setHourValidationResult] = useState(null);
  const [isTestingHour, setIsTestingHour] = useState(false);
  // Intent classifier test
  const [intentInput, setIntentInput] = useState('Berapa harga sewa aula serbaguna untuk acara pernikahan?');
  const [intentResult, setIntentResult] = useState(null);
  const [isClassifying, setIsClassifying] = useState(false);

  // Tab 3: Analisis Data State
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  // Tab 4: Tarif Sewa State
  const [pricingForm, setPricingForm] = useState({
    futsal_day: 100000,
    futsal_night_weekend: 150000,
    serbaguna: 300000,
  });
  const [isUpdatingPricing, setIsUpdatingPricing] = useState(false);
  const [pricingMessage, setPricingMessage] = useState(null);

  // Auto load data saat login
  useEffect(() => {
    if (token) {
      loadBookings();
      loadPricing();
      loadCrowdPrediction(predictionDate);
      loadAnalytics();
    }
  }, [token]);

  // Handle Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const data = await adminLogin(username, password);
      localStorage.setItem('lasdo_admin_token', data.token);
      setToken(data.token);
    } catch (err) {
      setLoginError(err.message || 'Login gagal.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('lasdo_admin_token');
    setToken(null);
  };

  // Load Bookings
  const loadBookings = async () => {
    setIsLoadingBookings(true);
    try {
      const data = await fetchAdminBookings({
        status: filterStatus,
        payment: filterPayment,
        search: filterSearch,
        date: filterDate,
      });
      setBookings(data.bookings || []);
      setMetrics(data.metrics || null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  // Update Status Pesanan / Pembayaran
  const handleUpdateStatus = async (id, updateData) => {
    setUpdatingBookingId(id);
    try {
      await updateAdminBookingStatus(id, updateData);
      await loadBookings();
    } catch (err) {
      alert(err.message || 'Gagal mengubah status.');
    } finally {
      setUpdatingBookingId(null);
    }
  };

  // Load Pricing
  const loadPricing = async () => {
    try {
      const data = await fetchPricing();
      setPricingForm({
        futsal_day: data.futsal_day,
        futsal_night_weekend: data.futsal_night_weekend,
        serbaguna: data.serbaguna,
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Update Pricing
  const handleSavePricing = async (e) => {
    e.preventDefault();
    setIsUpdatingPricing(true);
    setPricingMessage(null);
    try {
      const updated = await updatePricing(pricingForm);
      setPricingMessage('Tarif master sewa berhasil diperbarui! Seluruh pesanan lama tetap terkunci aman.');
      setTimeout(() => setPricingMessage(null), 4000);
    } catch (err) {
      alert(err.message || 'Gagal memperbarui tarif.');
    } finally {
      setIsUpdatingPricing(false);
    }
  };

  // Load Crowd Prediction
  const loadCrowdPrediction = async (date) => {
    setIsLoadingPrediction(true);
    try {
      const data = await fetchCrowdPrediction(date);
      setPredictionData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingPrediction(false);
    }
  };

  // Test Hour Validation
  const handleTestHourValidation = async () => {
    setIsTestingHour(true);
    setHourValidationResult(null);
    try {
      const res = await fetch(`/api/admin/crowd-prediction?date=${predictionDate}&hour=${testHour}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setHourValidationResult({
        status: res.status,
        success: json.success,
        data: json.data,
        message: json.message,
      });
    } catch (err) {
      setHourValidationResult({
        status: 500,
        success: false,
        message: err.message,
      });
    } finally {
      setIsTestingHour(false);
    }
  };

  // Test Intent Classification
  const handleTestIntent = async () => {
    if (!intentInput.trim()) return;
    setIsClassifying(true);
    try {
      const result = await classifyIntent(intentInput.trim());
      setIntentResult(result);
    } catch (err) {
      alert(err.message || 'Gagal klasifikasi.');
    } finally {
      setIsClassifying(false);
    }
  };

  // Load Analytics
  const loadAnalytics = async () => {
    setIsLoadingAnalytics(true);
    try {
      const data = await fetchAnalytics();
      setAnalyticsData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  // ==========================================
  // JIKA BELUM LOGIN: TAMPILKAN LOGIN FORM
  // ==========================================
  if (!token) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 border border-slate-200 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center mx-auto shadow-md">
              <Shield className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 font-heading">
              Portal Pengelola UMKM
            </h2>
            <p className="text-xs text-slate-500">
              Lasdo Family Futsal (Christino Hirasdo Wiryawan)
            </p>
          </div>

          {loginError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Username Pengelola
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs sm:text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoggingIn ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>Masuk Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Tombol Isi Kredensial Demo Cepat */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <button
              type="button"
              onClick={() => {
                setUsername('admin');
                setPassword('lasdo2026');
              }}
              className="w-full py-2 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Isi Kredensial Demo (admin / lasdo2026)</span>
            </button>

            <button
              type="button"
              onClick={onBackToCustomer}
              className="w-full py-2 text-xs text-slate-500 hover:text-slate-800 transition-colors flex items-center justify-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Tampilan Customer</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // JIKA SUDAH LOGIN: TAMPILKAN DASHBOARD ADMIN
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {/* Top Bar Pengelola */}
      <header className="sticky top-0 z-30 bg-slate-900 text-white border-b border-slate-800 px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center font-bold font-heading">
            L
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-base tracking-tight leading-tight flex items-center gap-2">
              <span>Portal Pengelola Lasdo Family Futsal</span>
            </h1>
            <p className="text-[11px] text-slate-400">
              Pengelola: <strong>Christino Hirasdo Wiryawan</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <button
            onClick={onBackToCustomer}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Lihat Web Customer</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white transition-colors font-medium"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar</span>
          </button>
        </div>
      </header>

      {/* Main Layout dengan Sidebar Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar Nav (Desktop & Mobile Pills) */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs space-y-1">
              <button
                onClick={() => setActiveTab('jadwal')}
                className={`w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all text-left ${activeTab === 'jadwal'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                  }`}
              >
                <Calendar className="w-4 h-4 shrink-0" />
                <span>1. Pemantauan Jadwal</span>
              </button>

              <button
                onClick={() => setActiveTab('prediksi')}
                className={`w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all text-left ${activeTab === 'prediksi'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                  }`}
              >
                <TrendingUp className="w-4 h-4 shrink-0" />
                <span>2. Prediksi Keramaian (AI)</span>
              </button>

              <button
                onClick={() => setActiveTab('analisis')}
                className={`w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all text-left ${activeTab === 'analisis'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                  }`}
              >
                <BarChart3 className="w-4 h-4 shrink-0" />
                <span>3. Analisis Data UMKM</span>
              </button>

              <button
                onClick={() => setActiveTab('tarif')}
                className={`w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all text-left ${activeTab === 'tarif'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                  }`}
              >
                <Settings className="w-4 h-4 shrink-0" />
                <span>4. Pengaturan Tarif Sewa</span>
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-9 space-y-6">
            {/* ==================================================== */}
            {/* TAB 1: PEMANTAUAN JADWAL & PESANAN */}
            {/* ==================================================== */}
            {activeTab === 'jadwal' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* 4 Kartu Metrik */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-xs text-slate-500 font-medium block">Total Pesanan</span>
                    <span className="font-mono text-2xl font-black text-slate-900 tabular-nums">
                      {metrics ? metrics.totalBookings : '...'}
                    </span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-xs text-amber-600 font-medium block">Menunggu Konfirmasi</span>
                    <span className="font-mono text-2xl font-black text-amber-600 tabular-nums">
                      {metrics ? metrics.pendingCount : '...'}
                    </span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-xs text-emerald-600 font-medium block">Terkonfirmasi</span>
                    <span className="font-mono text-2xl font-black text-emerald-700 tabular-nums">
                      {metrics ? metrics.confirmedCount : '...'}
                    </span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-xs text-slate-500 font-medium block">Pendapatan Lunas</span>
                    <span className="font-mono text-lg font-black text-emerald-700 tabular-nums truncate block">
                      Rp {metrics ? metrics.totalRevenue.toLocaleString('id-ID') : '...'}
                    </span>
                  </div>
                </div>

                {/* Filter & Kontrol Tabel */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        placeholder="Cari kode booking, nama pemesan, no. HP..."
                        value={filterSearch}
                        onChange={(e) => setFilterSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && loadBookings()}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs text-slate-800 font-medium"
                      >
                        <option value="">Semua Status Booking</option>
                        <option value="Menunggu Konfirmasi">Menunggu Konfirmasi</option>
                        <option value="Dikonfirmasi">Dikonfirmasi</option>
                        <option value="Selesai">Selesai</option>
                        <option value="Dibatalkan">Dibatalkan</option>
                      </select>

                      <select
                        value={filterPayment}
                        onChange={(e) => setFilterPayment(e.target.value)}
                        className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs text-slate-800 font-medium"
                      >
                        <option value="">Semua Status Bayar</option>
                        <option value="Belum Bayar">Belum Bayar</option>
                        <option value="Lunas">Lunas</option>
                      </select>

                      <button
                        onClick={loadBookings}
                        disabled={isLoadingBookings}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        title="Segarkan Data"
                      >
                        <RefreshCw className={`w-4 h-4 ${isLoadingBookings ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tabel Pesanan */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-700" />
                      <span>Daftar Seluruh Pesanan ({bookings.length})</span>
                    </h3>
                    <span className="text-xs text-slate-500">
                      Ubah status langsung tersinkron ke halaman Customer
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-bold tracking-wider text-[10px]">
                        <tr>
                          <th className="p-3">Kode & Tanggal</th>
                          <th className="p-3">Pemesan</th>
                          <th className="p-3">Layanan & Jam</th>
                          <th className="p-3">Total Terkunci</th>
                          <th className="p-3">Status Booking</th>
                          <th className="p-3">Status QRIS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {bookings.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-slate-400">
                              Tidak ada pesanan yang sesuai dengan filter.
                            </td>
                          </tr>
                        ) : (
                          bookings.map((b) => (
                            <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                              {/* Kode & Tanggal */}
                              <td className="p-3">
                                <span className="font-mono font-bold text-slate-900 block">
                                  {b.booking_code}
                                </span>
                                <span className="font-mono text-[11px] text-slate-500">
                                  {b.date}
                                </span>
                              </td>

                              {/* Pemesan */}
                              <td className="p-3">
                                <span className="font-bold text-slate-900 block">
                                  {b.customer_name}
                                </span>
                                <span className="font-mono text-[11px] text-slate-500">
                                  {b.phone_number}
                                </span>
                              </td>

                              {/* Layanan & Jam */}
                              <td className="p-3">
                                <span className="font-semibold text-slate-800 block">
                                  {b.service_type === 'serbaguna' ? '🏛️ Serbaguna' : '⚽ Futsal'}
                                </span>
                                <span className="font-mono text-[11px] text-slate-600">
                                  {String(b.start_hour).padStart(2, '0')}:00 – {String(b.end_hour).padStart(2, '0')}:00 ({b.duration} Jam)
                                </span>
                              </td>

                              {/* Total Terkunci */}
                              <td className="p-3">
                                <span className="font-mono font-bold text-emerald-800 tabular-nums block">
                                  Rp {b.total_price.toLocaleString('id-ID')}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  @ Rp {b.locked_price_per_hour.toLocaleString('id-ID')}/jam
                                </span>
                              </td>

                              {/* Dropdown Status Booking */}
                              <td className="p-3">
                                <select
                                  value={b.booking_status}
                                  disabled={updatingBookingId === b.id}
                                  onChange={(e) =>
                                    handleUpdateStatus(b.id, { booking_status: e.target.value })
                                  }
                                  className={`rounded-lg px-2 py-1 text-xs font-bold border focus:outline-none ${b.booking_status === 'Dikonfirmasi'
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                      : b.booking_status === 'Selesai'
                                        ? 'bg-blue-50 text-blue-800 border-blue-300'
                                        : b.booking_status === 'Dibatalkan'
                                          ? 'bg-red-50 text-red-800 border-red-300'
                                          : 'bg-amber-50 text-amber-800 border-amber-300'
                                    }`}
                                >
                                  <option value="Menunggu Konfirmasi">Menunggu Konfirmasi</option>
                                  <option value="Dikonfirmasi">Dikonfirmasi</option>
                                  <option value="Selesai">Selesai</option>
                                  <option value="Dibatalkan">Dibatalkan</option>
                                </select>
                              </td>

                              {/* Toggle Pembayaran QRIS */}
                              <td className="p-3">
                                <button
                                  type="button"
                                  disabled={updatingBookingId === b.id}
                                  onClick={() =>
                                    handleUpdateStatus(b.id, {
                                      payment_status: b.payment_status === 'Lunas' ? 'Belum Bayar' : 'Lunas',
                                    })
                                  }
                                  className={`px-2.5 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1 transition-all ${b.payment_status === 'Lunas'
                                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                      : 'bg-red-100 hover:bg-red-200 text-red-800 border border-red-300'
                                    }`}
                                  title="Klik untuk ubah status pembayaran"
                                >
                                  {b.payment_status === 'Lunas' ? (
                                    <>
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      <span>Lunas</span>
                                    </>
                                  ) : (
                                    <>
                                      <Clock className="w-3.5 h-3.5" />
                                      <span>Belum Bayar</span>
                                    </>
                                  )}
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ==================================================== */}
            {/* TAB 2: PREDIKSI KERAMAIAN (AI & DATA SCIENCE) */}
            {/* ==================================================== */}
            {activeTab === 'prediksi' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Header Kontrol Tanggal Prediksi */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-heading font-bold text-base text-slate-900 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-emerald-700" />
                      <span>Model Prediksi Keramaian Per Jam (08:00 – 21:00 WIB)</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Memprediksi probabilitas kepadatan penyewa berdasarkan historis jam sibuk, akhir pekan, dan kalender libur nasional.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600">Tanggal:</span>
                    <input
                      type="date"
                      value={predictionDate}
                      onChange={(e) => {
                        setPredictionDate(e.target.value);
                        loadCrowdPrediction(e.target.value);
                      }}
                      className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Grid Prediksi Per Jam */}
                {isLoadingPrediction ? (
                  <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                    <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-xs text-slate-500 font-medium">Memproses model prediksi...</p>
                  </div>
                ) : (
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-100">
                      <span className="text-slate-600">
                        Status Hari: <strong>{predictionData?.holiday?.isHoliday ? `Libur (${predictionData.holiday.name})` : predictionData?.isWeekend ? 'Akhir Pekan' : 'Hari Kerja'}</strong>
                      </span>
                      <span className="text-emerald-700 font-bold">
                        Jam Puncak: {predictionData?.peakHoursSummary}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
                      {predictionData?.predictions?.map((item) => (
                        <div
                          key={item.hour}
                          className={`p-3 rounded-xl border flex flex-col justify-between ${item.scorePercent >= 80
                              ? 'bg-red-50/80 border-red-200'
                              : item.scorePercent >= 60
                                ? 'bg-amber-50/80 border-amber-200'
                                : item.scorePercent >= 40
                                  ? 'bg-blue-50/80 border-blue-200'
                                  : 'bg-emerald-50/80 border-emerald-200'
                            }`}
                        >
                          <div>
                            <span className="font-mono text-[11px] font-bold text-slate-900 block tabular-nums">
                              {item.timeLabel}
                            </span>
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider block mt-1 ${item.scorePercent >= 80
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

                          <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-end justify-between">
                            <span className="font-mono text-base font-black tabular-nums">
                              {item.scorePercent}%
                            </span>
                            {item.isBooked && (
                              <span className="text-[9px] bg-slate-900 text-white px-1.5 py-0.5 rounded font-bold">
                                Terisi
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dua Penguji Interaktif: Validasi Jam & Klasifikasi Maksud */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Uji Validasi Jam Operasional (Membuktikan HTTP 400 jika di luar 08-21) */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                    <div>
                      <h4 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span>Penguji Validasi Jam Operasional Server</span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Server menolak permintaan prediksi jika jam di luar rentang <code className="font-mono">08:00 – 21:00</code> dengan <strong className="text-red-600 font-mono">HTTP 400</strong>.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Masukkan Jam (misal 23 atau 5)"
                        value={testHour}
                        onChange={(e) => setTestHour(e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={handleTestHourValidation}
                        disabled={isTestingHour}
                        className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shrink-0 transition-colors"
                      >
                        {isTestingHour ? 'Menguji...' : 'Uji Validasi'}
                      </button>
                    </div>

                    {hourValidationResult && (
                      <div
                        className={`p-3 rounded-xl border text-xs space-y-1 ${hourValidationResult.status === 400
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                            : 'bg-slate-50 border-slate-200 text-slate-800'
                          }`}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span>Status Respons HTTP:</span>
                          <span className="font-mono px-2 py-0.5 rounded bg-white border">
                            {hourValidationResult.status} {hourValidationResult.status === 400 ? 'Bad Request (Ditolak Sesuai Spek)' : 'OK'}
                          </span>
                        </div>
                        <p className="text-[11px] leading-relaxed">
                          {hourValidationResult.message || `Prediksi valid untuk jam ${testHour}:00: ${hourValidationResult.data?.specificHour?.level} (${hourValidationResult.data?.specificHour?.scorePercent}%)`}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Penguji Klasifikasi Maksud Pesan (Intent Classification) */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                    <div>
                      <h4 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <span>Penguji Klasifikasi Maksud Pesan (NLP Intent)</span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Menganalisis pesan teks calon penyewa untuk menentukan maksud dan tingkat keyakinan (confidence).
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Ketik contoh pesan teks..."
                        value={intentInput}
                        onChange={(e) => setIntentInput(e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={handleTestIntent}
                        disabled={isClassifying}
                        className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shrink-0 transition-colors"
                      >
                        {isClassifying ? 'Memproses...' : 'Klasifikasi'}
                      </button>
                    </div>

                    {intentResult && (
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Hasil Intent:</span>
                          <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                            {intentResult.intent}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Tingkat Keyakinan:</span>
                          <span className="font-mono font-bold text-slate-800">
                            {(intentResult.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                        {intentResult.matchedKeywords?.length > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Kata Kunci:</span>
                            <span className="font-mono text-[11px] text-slate-600">
                              {intentResult.matchedKeywords.join(', ')}
                            </span>
                          </div>
                        )}
                        <p className="text-[11px] text-slate-600 pt-1 border-t border-slate-200">
                          Aksi Sistem: {intentResult.suggestedAction}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tabel Perbandingan Performa 2 Model (Data Science) */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <h4 className="font-heading font-bold text-sm text-slate-900">
                    Evaluasi & Perbandingan Model Prediksi (Tim A26-CS150)
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-bold text-[10px]">
                        <tr>
                          <th className="p-3">Model Machine Learning</th>
                          <th className="p-3">Accuracy</th>
                          <th className="p-3">Precision</th>
                          <th className="p-3">Recall</th>
                          <th className="p-3">F1-Score</th>
                          <th className="p-3">ROC-AUC</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono">
                        <tr className="bg-emerald-50/50">
                          <td className="p-3 font-sans font-bold text-slate-900">
                            {predictionData?.modelComparison?.randomForest?.modelName}
                          </td>
                          <td className="p-3 font-bold text-emerald-800">0.924</td>
                          <td className="p-3">0.912</td>
                          <td className="p-3">0.935</td>
                          <td className="p-3 font-bold text-emerald-800">0.923</td>
                          <td className="p-3">0.961</td>
                          <td className="p-3 font-sans">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              Aktif Dipakai
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="p-3 font-sans font-medium text-slate-700">
                            {predictionData?.modelComparison?.logisticRegression?.modelName}
                          </td>
                          <td className="p-3">0.812</td>
                          <td className="p-3">0.795</td>
                          <td className="p-3">0.831</td>
                          <td className="p-3">0.813</td>
                          <td className="p-3">0.874</td>
                          <td className="p-3 font-sans">
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                              Baseline Pembanding
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ==================================================== */}
            {/* TAB 3: ANALISIS DATA UMKM */}
            {/* ==================================================== */}
            {activeTab === 'analisis' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Banner Transparan Data Dummy MVP */}
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm">
                    <strong className="font-bold block">
                      Data Dummy Berlabel untuk Demonstrasi MVP
                    </strong>
                    <span className="text-amber-800">
                      Seluruh statistik pola penyewaan di bawah ini disimulasikan secara transparan berdasarkan hasil riset dan observasi lapangan Tim A26-CS150 untuk mendukung pengambilan keputusan bisnis UMKM Lasdo Family Futsal.
                    </span>
                  </div>
                </div>

                {/* KPI Ringkasan */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-xs text-slate-500 font-medium block">Rata-rata Okupansi</span>
                    <span className="font-mono text-2xl font-black text-slate-900 tabular-nums">
                      {analyticsData?.kpis?.averageWeeklyOccupancy || '61.2%'}
                    </span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-xs text-emerald-600 font-medium block">Porsi Sewa Futsal</span>
                    <span className="font-mono text-2xl font-black text-emerald-700 tabular-nums">
                      {analyticsData?.kpis?.futsalSharePercent || 78.5}%
                    </span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-xs text-teal-600 font-medium block">Porsi Serbaguna</span>
                    <span className="font-mono text-2xl font-black text-teal-700 tabular-nums">
                      {analyticsData?.kpis?.serbagunaSharePercent || 21.5}%
                    </span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-xs text-amber-600 font-medium block">Lonjakan Hari Libur</span>
                    <span className="font-mono text-2xl font-black text-amber-600 tabular-nums">
                      {analyticsData?.kpis?.holidayDemandSpike || '+42.3%'}
                    </span>
                  </div>
                </div>

                {/* Grafik Okupansi Mingguan */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-heading font-bold text-sm text-slate-900">
                        Distribusi Okupansi Mingguan (Senin s/d Minggu)
                      </h4>
                      <p className="text-xs text-slate-500">
                        Tingkat okupansi slot lapangan per hari sepanjang jam operasional 08:00–22:00.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    {analyticsData?.weeklyDistribution?.map((item) => (
                      <div key={item.day} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-800">{item.day}</span>
                          <span className="font-mono text-slate-600 tabular-nums">
                            {item.occupancyRate.toFixed(1)}% (Futsal: {item.futsalHours} jam | Serbaguna: {item.serbagunaHours} jam)
                          </span>
                        </div>
                        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                          <div
                            style={{ width: `${item.occupancyRate}%` }}
                            className={`h-full rounded-full transition-all duration-500 ${item.occupancyRate > 80
                                ? 'bg-red-500'
                                : item.occupancyRate > 50
                                  ? 'bg-emerald-600'
                                  : 'bg-blue-500'
                              }`}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4 Pertanyaan Bisnis & Rekomendasi Capstone A26-CS150 */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <h4 className="font-heading font-bold text-sm text-slate-900">
                    Temuan Strategis & Rekomendasi Solusi untuk UMKM
                  </h4>

                  <div className="space-y-3">
                    {analyticsData?.businessInsights?.map((item) => (
                      <div key={item.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                        <div className="font-bold text-slate-900 text-sm">
                          {item.id}. {item.question}
                        </div>
                        <div className="text-slate-600">
                          <strong className="text-slate-700">Temuan Data:</strong> {item.finding}
                        </div>
                        <div className="text-emerald-800 bg-emerald-50/80 p-2.5 rounded-lg border border-emerald-200 font-medium">
                          <strong>💡 Rekomendasi untuk Pengelola:</strong> {item.recommendation}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ==================================================== */}
            {/* TAB 4: PENGATURAN TARIF SEWA */}
            {/* ==================================================== */}
            {activeTab === 'tarif' && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6 animate-in fade-in duration-200">
                <div>
                  <h3 className="font-heading font-bold text-base text-slate-900 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-emerald-700" />
                    <span>Master Pengaturan Tarif Sewa Per Jam</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Atur tarif sewa standar per jam. Tarif pesanan lama yang sudah dibuat di database akan tetap terkunci aman dan tidak berubah.
                  </p>
                </div>

                {pricingMessage && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{pricingMessage}</span>
                  </div>
                )}

                <form onSubmit={handleSavePricing} className="space-y-5 max-w-lg text-xs sm:text-sm">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tarif Futsal Siang (08:00 – 17:00 Hari Kerja)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">Rp</span>
                      <input
                        type="number"
                        step="5000"
                        required
                        value={pricingForm.futsal_day}
                        onChange={(e) =>
                          setPricingForm({ ...pricingForm, futsal_day: e.target.value })
                        }
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tarif Futsal Malam (17:00 – 22:00) & Akhir Pekan / Libur Nasional
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">Rp</span>
                      <input
                        type="number"
                        step="5000"
                        required
                        value={pricingForm.futsal_night_weekend}
                        onChange={(e) =>
                          setPricingForm({ ...pricingForm, futsal_night_weekend: e.target.value })
                        }
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tarif Gedung Serbaguna (Acara & Syukuran)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">Rp</span>
                      <input
                        type="number"
                        step="10000"
                        required
                        value={pricingForm.serbaguna}
                        onChange={(e) =>
                          setPricingForm({ ...pricingForm, serbaguna: e.target.value })
                        }
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                    <strong className="text-slate-800 block mb-0.5">Catatan Integritas Data (Price Locking):</strong>
                    <span>
                      Setiap pesanan baru akan menyalin dan mengunci tarif pada saat pesanan diajukan. Mengubah nilai tarif di formulir ini hanya mempengaruhi pesanan yang diajukan setelahnya.
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdatingPricing}
                    className="py-2.5 px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-sm transition-all disabled:opacity-50"
                  >
                    {isUpdatingPricing ? 'Menyimpan...' : 'Simpan Perubahan Tarif'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
