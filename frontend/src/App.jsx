import React, { useState } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ScheduleSection from './components/ScheduleSection';
import QrisLookupSection from './components/QrisLookupSection';
import FacilitiesSection from './components/FacilitiesSection';
import ChatbotWidget from './components/ChatbotWidget';
import Footer from './components/Footer';
import AdminPortal from './pages/AdminPortal';

export default function App() {
  const [activeView, setActiveView] = useState('customer'); // 'customer' | 'admin'
  const [qrisPrefillCode, setQrisPrefillCode] = useState('LFF-2611-001');

  // Smooth scroll handler
  const handleNavigateTo = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Callback saat booking berhasil dibuat di ScheduleSection
  const handleBookingSuccess = (bookingCode) => {
    setQrisPrefillCode(bookingCode);
    setTimeout(() => {
      const qrisEl = document.getElementById('qris');
      if (qrisEl) {
        qrisEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 600);
  };

  if (activeView === 'admin') {
    return (
      <AdminPortal onBackToCustomer={() => setActiveView('customer')} />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* 1 Baris Bersih Navigasi Atas */}
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        onNavigateTo={handleNavigateTo}
      />

      <main className="flex-1">
        {/* Hero Section dengan Info Strips */}
        <HeroSection
          onBookClick={() => handleNavigateTo('pesan')}
          onScheduleClick={() => handleNavigateTo('jadwal')}
        />

        {/* Bagian 01 — Ketersediaan Jadwal & Form Pemesanan */}
        <ScheduleSection onBookingSuccess={handleBookingSuccess} />

        {/* Bagian 02 — Pembayaran QRIS & Cek Status Pemesanan */}
        <QrisLookupSection prefillCode={qrisPrefillCode} />

        {/* Bagian 03 — Fasilitas & Aturan Sewa */}
        <FacilitiesSection />
      </main>

      {/* Widget Chatbot FAQ Mengambang */}
      <ChatbotWidget
        onOpenSchedule={() => handleNavigateTo('jadwal')}
        onOpenQris={() => handleNavigateTo('qris')}
      />

      {/* Footer Lengkap */}
      <Footer onSwitchToAdmin={() => setActiveView('admin')} />
    </div>
  );
}
