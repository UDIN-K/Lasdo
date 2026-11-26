import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  UserCheck,
  Calendar,
  TrendingUp,
  BarChart3,
  Settings,
  AlertCircle,
  LogOut,
  ArrowLeft,
  X,
} from 'lucide-react';
import {
  adminLogin,
  fetchAdminBookings,
  updateAdminBookingStatus,
  fetchPricing,
  updatePricing,
  fetchCrowdPrediction,
  classifyIntent,
  fetchAnalytics,
} from '../services/api';
import AdminBookingsTab from '../components/admin/AdminBookingsTab';
import AdminPredictionTab from '../components/admin/AdminPredictionTab';
import AdminAnalyticsTab from '../components/admin/AdminAnalyticsTab';
import AdminPricingTab from '../components/admin/AdminPricingTab';

export default function AdminPortal({ onBackToCustomer }) {
  const [token, setToken] = useState(() => localStorage.getItem('lasdo_admin_token'));
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('lasdo2026');
  const [loginError, setLoginError] = useState(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [activeTab, setActiveTab] = useState('jadwal');
  const [actionError, setActionError] = useState(null);

  // Tab 1: Bookings
  const [bookings, setBookings] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPayment, setFilterPayment] = useState('');
  const [filterSearch, setFilterSearch] = useState('');
  const [updatingBookingId, setUpdatingBookingId] = useState(null);

  // Tab 2: Crowd Prediction & Intent
  const [predictionDate, setPredictionDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [predictionData, setPredictionData] = useState(null);
  const [isLoadingPrediction, setIsLoadingPrediction] = useState(false);
  const [testHour, setTestHour] = useState('23');
  const [hourValidationResult, setHourValidationResult] = useState(null);
  const [isTestingHour, setIsTestingHour] = useState(false);
  const [intentInput, setIntentInput] = useState(
    'Berapa harga sewa aula serbaguna untuk acara pernikahan?'
  );
  const [intentResult, setIntentResult] = useState(null);
  const [isClassifying, setIsClassifying] = useState(false);

  // Tab 3: Analytics
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  // Tab 4: Pricing
  const [pricingForm, setPricingForm] = useState({
    futsal_day: 100000,
    futsal_night_weekend: 150000,
    serbaguna: 300000,
  });
  const [isUpdatingPricing, setIsUpdatingPricing] = useState(false);
  const [pricingMessage, setPricingMessage] = useState(null);

  const loadBookings = useCallback(
    async (overrides = {}) => {
      if (!token) return;
      setIsLoadingBookings(true);
      try {
        const data = await fetchAdminBookings({
          status: overrides.status !== undefined ? overrides.status : filterStatus,
          payment: overrides.payment !== undefined ? overrides.payment : filterPayment,
          search: overrides.search !== undefined ? overrides.search : filterSearch,
        });
        setBookings(data.bookings || []);
        setMetrics(data.metrics || null);
      } catch (err) {
        setActionError(err.message || 'Gagal memuat daftar pesanan.');
      } finally {
        setIsLoadingBookings(false);
      }
    },
    [token, filterStatus, filterPayment, filterSearch]
  );

  const loadPricing = useCallback(async () => {
    if (!token) return;
    try {
      const data = await fetchPricing();
      setPricingForm({
        futsal_day: data.futsal_day,
        futsal_night_weekend: data.futsal_night_weekend,
        serbaguna: data.serbaguna,
      });
    } catch (err) {
      setActionError(err.message || 'Gagal memuat tarif sewa.');
    }
  }, [token]);

  const loadCrowdPrediction = useCallback(
    async (date) => {
      if (!token) return;
      setIsLoadingPrediction(true);
      try {
        const data = await fetchCrowdPrediction(date);
        setPredictionData(data);
      } catch (err) {
        setActionError(err.message || 'Gagal memuat prediksi keramaian.');
      } finally {
        setIsLoadingPrediction(false);
      }
    },
    [token]
  );

  const loadAnalytics = useCallback(async () => {
    if (!token) return;
    setIsLoadingAnalytics(true);
    try {
      const data = await fetchAnalytics();
      setAnalyticsData(data);
    } catch (err) {
      setActionError(err.message || 'Gagal memuat analitik.');
    } finally {
      setIsLoadingAnalytics(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      loadPricing();
      loadCrowdPrediction(predictionDate);
      loadAnalytics();
    }
  }, [token, loadPricing, loadCrowdPrediction, loadAnalytics, predictionDate]);

  useEffect(() => {
    if (!token) return;
    const timer = setTimeout(() => {
      loadBookings();
    }, 200);
    return () => clearTimeout(timer);
  }, [token, filterStatus, filterPayment, filterSearch, loadBookings]);

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

  const handleUpdateStatus = async (id, updateData) => {
    setUpdatingBookingId(id);
    setActionError(null);
    try {
      await updateAdminBookingStatus(id, updateData);
      await loadBookings();
    } catch (err) {
      setActionError(err.message || 'Gagal mengubah status pesanan.');
    } finally {
      setUpdatingBookingId(null);
    }
  };

  const handleSavePricing = async (e) => {
    e.preventDefault();
    setIsUpdatingPricing(true);
    setPricingMessage(null);
    setActionError(null);
    try {
      await updatePricing(pricingForm);
      setPricingMessage('Tarif sewa berhasil diperbarui. Pesanan lama tetap menggunakan tarif sebelumnya.');
      setTimeout(() => setPricingMessage(null), 5000);
    } catch (err) {
      setActionError(err.message || 'Gagal memperbarui tarif sewa.');
    } finally {
      setIsUpdatingPricing(false);
    }
  };

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

  const handleTestIntent = async () => {
    if (!intentInput.trim()) return;
    setIsClassifying(true);
    setActionError(null);
    try {
      const result = await classifyIntent(intentInput.trim());
      setIntentResult(result);
    } catch (err) {
      setActionError(err.message || 'Gagal mengklasifikasikan pesan.');
    } finally {
      setIsClassifying(false);
    }
  };

  const handleResetFilters = () => {
    setFilterStatus('');
    setFilterPayment('');
    setFilterSearch('');
  };

  // Login Screen
  if (!token) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-slate-200 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-11 h-11 rounded-xl bg-emerald-700 text-white flex items-center justify-center mx-auto">
              <Shield className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 font-heading">
              Portal Pengelola
            </h1>
            <p className="text-xs text-slate-500">
              Lasdo Family Futsal · Christino Hirasdo Wiryawan
            </p>
          </div>

          {loginError && (
            <div role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-sm">
            <div>
              <label htmlFor="admin-username" className="block text-xs font-bold text-slate-700 mb-1.5">
                Username
              </label>
              <input
                id="admin-username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm"
              />
            </div>

            <div>
              <label htmlFor="admin-password" className="block text-xs font-bold text-slate-700 mb-1.5">
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoggingIn ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>Masuk Dashboard</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-3 border-t border-slate-200 space-y-2">
            <button
              type="button"
              onClick={() => {
                setUsername('admin');
                setPassword('lasdo2026');
              }}
              className="w-full py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
            >
              Isi Akun Demo (admin / lasdo2026)
            </button>

            <button
              type="button"
              onClick={onBackToCustomer}
              className="w-full py-2 text-xs text-slate-500 hover:text-slate-900 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Halaman Customer</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: 'jadwal', label: 'Pemantauan Jadwal', icon: Calendar },
    { id: 'prediksi', label: 'Prediksi Keramaian', icon: TrendingUp },
    { id: 'analisis', label: 'Analisis Data', icon: BarChart3 },
    { id: 'tarif', label: 'Pengaturan Tarif', icon: Settings },
  ];

  const activeNavLabel = navItems.find((n) => n.id === activeTab)?.label || 'Dashboard';

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs sm:text-sm min-w-0">
          <span className="font-heading font-bold text-slate-900 whitespace-nowrap">
            Lasdo Pengelola
          </span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-600 font-medium truncate">{activeNavLabel}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onBackToCustomer}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold whitespace-nowrap cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Web Customer</span>
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold whitespace-nowrap cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar</span>
          </button>
        </div>
      </header>

      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1">
        {actionError && (
          <div role="alert" className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{actionError}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionError(null)}
              aria-label="Tutup pesan error"
              className="p-1 text-red-600 hover:text-red-900 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Sidebar Navigation (Desktop) & Horizontal Tabs (Mobile) */}
          <aside className="w-full lg:w-60 shrink-0">
            <nav aria-label="Menu Portal Pengelola" className="bg-white rounded-xl p-2 border border-slate-200 flex lg:flex-col gap-1 overflow-x-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 text-left cursor-pointer ${
                      isActive
                        ? 'bg-emerald-700 text-white'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Main Tab Content */}
          <main className="flex-1 min-w-0 w-full">
            {activeTab === 'jadwal' && (
              <AdminBookingsTab
                bookings={bookings}
                metrics={metrics}
                isLoadingBookings={isLoadingBookings}
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
                filterPayment={filterPayment}
                setFilterPayment={setFilterPayment}
                filterSearch={filterSearch}
                setFilterSearch={setFilterSearch}
                updatingBookingId={updatingBookingId}
                onRefresh={() => loadBookings()}
                onResetFilters={handleResetFilters}
                onUpdateStatus={handleUpdateStatus}
              />
            )}

            {activeTab === 'prediksi' && (
              <AdminPredictionTab
                predictionDate={predictionDate}
                setPredictionDate={setPredictionDate}
                predictionData={predictionData}
                isLoadingPrediction={isLoadingPrediction}
                onLoadPrediction={loadCrowdPrediction}
                testHour={testHour}
                setTestHour={setTestHour}
                hourValidationResult={hourValidationResult}
                isTestingHour={isTestingHour}
                onTestHourValidation={handleTestHourValidation}
                intentInput={intentInput}
                setIntentInput={setIntentInput}
                intentResult={intentResult}
                isClassifying={isClassifying}
                onTestIntent={handleTestIntent}
              />
            )}

            {activeTab === 'analisis' && (
              <AdminAnalyticsTab
                analyticsData={analyticsData}
                isLoadingAnalytics={isLoadingAnalytics}
              />
            )}

            {activeTab === 'tarif' && (
              <AdminPricingTab
                pricingForm={pricingForm}
                setPricingForm={setPricingForm}
                isUpdatingPricing={isUpdatingPricing}
                pricingMessage={pricingMessage}
                onSavePricing={handleSavePricing}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
