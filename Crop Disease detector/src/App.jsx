import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AgriProvider, useAgriContext } from './context/AgriContext';
import Header from './components/Header';
import FarmerAuthBanner from './components/FarmerAuthBanner';
import FarmerLoginGateway from './components/FarmerLoginGateway';
import BuyerPortalLanding from './components/BuyerPortalLanding';
import DeliveryPartnerPortalLanding from './components/DeliveryPartnerPortalLanding';
import DetectorPage from './pages/DetectorPage';
import SuggesterPage from './pages/SuggesterPage';
import ChatbotPage from './pages/ChatbotPage';
import LogisticsPage from './pages/LogisticsPage';
import SmartWarehousePage from './pages/SmartWarehousePage';
import SettingsModal from './components/SettingsModal';
import HistoryDrawer from './components/HistoryDrawer';
import ReportModal from './components/ReportModal';

function AppContent() {
  const { isAuthenticated, userRole, history, activeScan, setActiveScan, setActiveImage, clearHistory, refreshSettings } = useAgriContext();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // If not authenticated, display initial Role Login Gateway landing interface
  if (!isAuthenticated) {
    return <FarmerLoginGateway />;
  }

  // If authenticated as Buyer, render Buyer Portal Landing
  if (userRole === 'buyer') {
    return (
      <div className="min-h-screen bg-field-bg text-loam font-sans flex flex-col selection:bg-sprout-light selection:text-loam">
        <Header
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenHistory={() => setIsHistoryOpen(true)}
        />
        <main className="flex-1 max-w-7xl w-full mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
          <BuyerPortalLanding />
        </main>
        <footer className="border-t-3 border-loam bg-field-surface px-3 lg:px-8 py-4 sm:py-6 mt-6 sm:mt-12">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-loam-muted">
            <div className="flex items-center gap-2 text-center sm:text-left">
              <span className="w-2 h-2 rounded-full bg-sprout shrink-0" />
              <span>AgriVision Buyer Portal • Direct Procurement & Mandi Bidding</span>
            </div>
            <div>Earth-Tone Aesthetic System</div>
          </div>
        </footer>
      </div>
    );
  }

  // If authenticated as Delivery Partner, render Delivery Partner Portal Landing
  if (userRole === 'delivery') {
    return (
      <div className="min-h-screen bg-field-bg text-loam font-sans flex flex-col selection:bg-sprout-light selection:text-loam overflow-x-hidden">
        <Header
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenHistory={() => setIsHistoryOpen(true)}
        />
        <main className="flex-1 max-w-7xl w-full mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
          <DeliveryPartnerPortalLanding />
        </main>
        <footer className="border-t-3 border-loam bg-field-surface px-3 lg:px-8 py-4 sm:py-6 mt-6 sm:mt-12">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-loam-muted">
            <div className="flex items-center gap-2 text-center sm:text-left">
              <span className="w-2 h-2 rounded-full bg-sprout shrink-0" />
              <span>AgriVision Delivery Partner Portal • Logistics Fleet & Central Dispatch</span>
            </div>
            <div>Earth-Tone Aesthetic System</div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-field-bg text-loam font-sans flex flex-col selection:bg-sprout-light selection:text-loam overflow-x-hidden">
      
      {/* Sticky Header with React Router v6 Navigation & Log Out Button */}
      <Header
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />

      {/* Main Canvas Area rendering routed pages */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        <Routes>
          <Route path="/" element={<Navigate to="/detector" replace />} />
          <Route path="/detector" element={<DetectorPage onOpenReport={() => setIsReportOpen(true)} />} />
          <Route path="/suggester" element={<SuggesterPage />} />
          <Route path="/chatbot" element={<ChatbotPage />} />
          <Route path="/routes" element={<LogisticsPage />} />
          <Route path="/warehouse" element={<SmartWarehousePage />} />
          <Route path="*" element={<Navigate to="/detector" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="border-t-3 border-loam bg-field-surface px-4 lg:px-8 py-6 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-loam-muted">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sprout" />
            <span>AgriVision Mega Portal • Diagnostics, Crop Suggester, AI Chatbot & Route Optimization</span>
          </div>

          <div>
            Earth-Tone Design System • Unified Agri Suite
          </div>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSettingsSaved={refreshSettings}
      />

      {/* History Slide-Over Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectScan={(scan) => {
          setActiveScan(scan);
          if (scan.sampleImageUrl) setActiveImage(scan.sampleImageUrl);
        }}
        onClearHistory={clearHistory}
      />

      {/* Printable Report Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        result={activeScan}
      />

    </div>
  );
}

export default function App() {
  return (
    <AgriProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AgriProvider>
  );
}
