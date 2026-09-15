import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { History, Cpu, MessageSquare, Sprout, Truck, Warehouse, LogOut, UserCheck, Bell, CheckCheck } from 'lucide-react';
import { useAgriContext } from '../context/AgriContext';

export default function Header({ 
  onOpenSettings, 
  onOpenHistory 
}) {
  const location = useLocation();
  const { 
    hasApiKey, 
    history, 
    activeScan, 
    resetScan, 
    userRole, 
    currentFarmer, 
    currentBuyer, 
    logoutUser,
    notifications,
    unreadNotifCount,
    markNotificationsRead
  } = useAgriContext();

  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const activeUser = userRole === 'buyer' ? currentBuyer : currentFarmer;

  const isDetector = location.pathname === '/' || location.pathname === '/detector';
  const isSuggester = location.pathname === '/suggester';
  const isChatbot = location.pathname === '/chatbot';
  const isRoutes = location.pathname === '/routes';
  const isWarehouse = location.pathname === '/warehouse';

  return (
    <header className="border-b-2 border-loam bg-field-surface px-4 lg:px-8 py-4 sticky top-0 z-30 shadow-sharp-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        {/* Brand Identity */}
        <Link to="/detector" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-sprout border-2 border-loam rounded-sm flex items-center justify-center text-field-bg font-bold font-mono text-xl shadow-sharp-sm group-hover:scale-105 transition-transform">
            🌾
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl lg:text-3xl font-bold tracking-tight text-loam">
                AgriVision
              </h1>
              <span className="bg-sprout-tint text-sprout border border-sprout/40 text-xs font-mono px-2 py-0.5 rounded-sm uppercase tracking-wider font-semibold">
                {userRole === 'buyer' ? 'Buyer Portal' : 'Mega Suite'}
              </span>
            </div>
            <p className="text-xs font-mono text-loam-muted tracking-tight">
              {userRole === 'buyer'
                ? 'B2B Crop Marketplace • Direct Warehouse Procurement & Dispatch'
                : 'Diagnostics • Crop Suggester • AI Chatbot • Route Optimization • Smart Warehouse'}
            </p>
          </div>
        </Link>

        {/* React Router Nav Links (5 Mega Modules — Farmer Only) */}
        {userRole !== 'buyer' && (
          <nav className="flex flex-wrap items-center gap-1 bg-field-bg p-1 border-2 border-loam rounded-sm shadow-sharp-sm">
            <Link
              to="/detector"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm font-mono text-xs font-bold transition-all ${
                isDetector
                  ? 'bg-sprout text-field-bg border border-loam shadow-sharp-sm'
                  : 'text-loam hover:bg-sprout-tint/50'
              }`}
            >
              <Sprout className="w-4 h-4" />
              <span>Disease Detector</span>
            </Link>

            <Link
              to="/suggester"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm font-mono text-xs font-bold transition-all ${
                isSuggester
                  ? 'bg-sprout text-field-bg border border-loam shadow-sharp-sm'
                  : 'text-loam hover:bg-sprout-tint/50'
              }`}
            >
              <span>🌱</span>
              <span>Crop Suggester</span>
            </Link>

            <Link
              to="/chatbot"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm font-mono text-xs font-bold transition-all ${
                isChatbot
                  ? 'bg-sprout text-field-bg border border-loam shadow-sharp-sm'
                  : 'text-loam hover:bg-sprout-tint/50'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>AI Farmer Advisor</span>
            </Link>

            <Link
              to="/routes"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm font-mono text-xs font-bold transition-all ${
                isRoutes
                  ? 'bg-sprout text-field-bg border border-loam shadow-sharp-sm'
                  : 'text-loam hover:bg-sprout-tint/50'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>Route Optimizer</span>
            </Link>

            <Link
              to="/warehouse"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm font-mono text-xs font-bold transition-all ${
                isWarehouse
                  ? 'bg-sprout text-field-bg border border-loam shadow-sharp-sm'
                  : 'text-loam hover:bg-sprout-tint/50'
              }`}
            >
              <Warehouse className="w-4 h-4" />
              <span>Smart Warehouse</span>
            </Link>
          </nav>
        )}

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto justify-end relative">
          
          {/* Farmer Notification Bell Icon (Turns RED on unread notifications) */}
          {userRole === 'farmer' && (
            <div className="relative">
              <button
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm border-2 font-mono text-xs font-bold transition-all shadow-sharp-sm relative ${
                  unreadNotifCount > 0
                    ? 'border-red-600 bg-red-50 text-red-700 hover:bg-red-100 animate-pulse'
                    : 'border-loam bg-field-bg hover:bg-field-card text-loam'
                }`}
                title={unreadNotifCount > 0 ? `${unreadNotifCount} unread sales / warehouse alerts!` : 'Farmer Notifications Bar'}
              >
                <Bell className={`w-4 h-4 ${unreadNotifCount > 0 ? 'text-red-600 fill-red-100' : 'text-loam'}`} />
                <span className="hidden sm:inline">Alerts</span>
                {unreadNotifCount > 0 ? (
                  <span className="bg-red-600 text-white font-extrabold text-[10px] px-1.5 py-0.2 rounded-full border border-red-700 shadow-sm animate-bounce">
                    {unreadNotifCount}
                  </span>
                ) : (
                  notifications.length > 0 && (
                    <span className="bg-loam-muted/30 text-loam text-[10px] font-bold px-1.5 py-0.2 rounded-sm font-mono">
                      {notifications.length}
                    </span>
                  )
                )}
              </button>

              {/* Real-Time Notification Dropdown Menu */}
              {showNotifDropdown && (
                <div className="absolute right-0 top-11 w-80 sm:w-96 bg-field-surface border-2 border-loam shadow-sharp-lg z-50 rounded-sm overflow-hidden font-mono text-xs">
                  <div className="bg-loam text-field-bg px-3 py-2.5 flex items-center justify-between font-bold border-b border-loam">
                    <div className="flex items-center gap-2">
                      <span>🔔 Farmer Sales & Stock Alerts</span>
                      {unreadNotifCount > 0 && (
                        <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black">
                          {unreadNotifCount} NEW
                        </span>
                      )}
                    </div>
                    {unreadNotifCount > 0 && (
                      <button
                        onClick={() => {
                          markNotificationsRead();
                        }}
                        className="flex items-center gap-1 text-[11px] bg-sprout text-field-bg px-2 py-0.5 rounded hover:bg-sprout/90 font-bold transition-all"
                      >
                        <CheckCheck className="w-3 h-3" />
                        <span>Mark Read</span>
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-loam/10">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-loam-muted italic">
                        No notifications yet. Sales alerts will appear here in real-time!
                      </div>
                    ) : (
                      notifications.map((n, idx) => (
                        <div
                          key={n.id || idx}
                          className={`p-3 transition-colors ${
                            !n.is_read ? 'bg-red-50/70 border-l-4 border-red-600 font-semibold' : 'hover:bg-field-bg/60'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-base leading-none">
                              {n.type === 'sale_alert' ? '🛒' : n.type === 'deposit_alert' ? '🏭' : 'ℹ️'}
                            </span>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-bold text-loam text-xs">{n.title}</h4>
                                <span className="text-[10px] text-loam-muted font-mono">{n.timestamp}</span>
                              </div>
                              <p className="text-xs text-loam-muted mt-1 leading-snug">{n.message}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="bg-field-bg p-2 text-center text-[10px] text-loam-muted border-t border-loam/20 font-bold">
                    Logged in as {currentFarmer?.name} ({currentFarmer?.id})
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Active User Profile Badge (Farmer or Buyer) */}
          {activeUser && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-sprout-tint/60 border border-sprout/40 rounded-sm text-xs font-mono text-sprout font-bold">
              <span>{activeUser.avatar || (userRole === 'buyer' ? '🏬' : '👨‍🌾')}</span>
              <span className="hidden sm:inline">{activeUser.name}</span>
              <span className="text-[10px] bg-sprout text-field-bg px-1.5 py-0.2 rounded font-extrabold">
                {activeUser.id}
              </span>
            </div>
          )}

          {/* Clean Log Out Button */}
          <button
            onClick={logoutUser}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border-2 border-loam bg-amber-700 hover:bg-amber-800 text-amber-50 text-xs font-mono font-extrabold transition-all shadow-sharp-sm active:translate-x-0.5 active:translate-y-0.5"
            title="Log out and return to Gateway landing page"
          >
            <LogOut className="w-3.5 h-3.5 text-amber-50" />
            <span>Log Out</span>
          </button>

          {/* AI Connection Status Badge */}
          <button
            onClick={onOpenSettings}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-sm border text-xs font-mono transition-all ${
              hasApiKey 
                ? 'bg-sprout-tint/60 border-sprout text-sprout font-bold hover:bg-sprout-tint' 
                : 'bg-field-bg border-earth-amber/60 text-earth-amber font-semibold hover:border-earth-amber'
            }`}
            title="Configure Gemini API Settings"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">
              {hasApiKey ? 'Gemini 2.5 Active' : 'Offline Engine'}
            </span>
            <span className={`w-2 h-2 rounded-full ${hasApiKey ? 'bg-sprout animate-pulse' : 'bg-earth-amber'}`} />
          </button>

          {/* History Drawer Toggle */}
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-2 px-3 py-1.5 rounded-sm border border-loam bg-field-bg hover:bg-field-card text-loam text-xs font-mono font-medium transition-all shadow-sharp-sm active:translate-x-0.5 active:translate-y-0.5"
          >
            <History className="w-3.5 h-3.5 text-sprout" />
            <span className="hidden sm:inline">Scans Log</span>
            {history.length > 0 && (
              <span className="bg-sprout text-field-bg text-[10px] font-bold px-1.5 py-0.2 rounded-sm font-mono">
                {history.length}
              </span>
            )}
          </button>

        </div>

      </div>
    </header>
  );
}
