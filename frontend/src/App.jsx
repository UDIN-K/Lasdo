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
  const [activeView, setActiveView] = useState('customer');
  const [qrisPrefillCode, setQrisPrefillCode] = useState('LFF-2611-001');

  const handleNavigateTo = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBookingSuccess = (bookingCode, shouldScroll = false) => {
    setQrisPrefillCode(bookingCode);
    if (shouldScroll) {
      handleNavigateTo('qris');
    }
  };

  if (activeView === 'admin') {
    return <AdminPortal onBackToCustomer={() => setActiveView('customer')} />;
  }

  return (
    <div className="min-h-screen bg-[#fafaf8] text-zinc-900 flex flex-col font-sans">
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        onNavigateTo={handleNavigateTo}
      />

      <main className="flex-1">
        <HeroSection
          onBookClick={() => handleNavigateTo('pesan')}
          onScheduleClick={() => handleNavigateTo('jadwal')}
          onQrisClick={() => handleNavigateTo('qris')}
        />

        <ScheduleSection onBookingSuccess={handleBookingSuccess} />

        <QrisLookupSection prefillCode={qrisPrefillCode} />

        <FacilitiesSection />
      </main>

      <ChatbotWidget
        onOpenSchedule={() => handleNavigateTo('jadwal')}
        onOpenQris={() => handleNavigateTo('qris')}
      />

      <Footer
        onSwitchToAdmin={() => setActiveView('admin')}
        onNavigateTo={handleNavigateTo}
      />
    </div>
  );
}
