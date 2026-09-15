// frontend/src/components/FarmerAuthBanner.jsx
import React, { useState } from 'react';
import { UserCheck, Key, ShieldCheck, LogIn, Lock, CheckCircle2, AlertCircle, LogOut } from 'lucide-react';
import { useAgriContext, FARMER_ACCOUNTS } from '../context/AgriContext';

export default function FarmerAuthBanner() {
  const { currentFarmer, loginAsFarmer, authenticateFarmer, logoutFarmer } = useAgriContext();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [emailInput, setEmailInput] = useState('ramesh@agrimitra.in');
  const [passwordInput, setPasswordInput] = useState('farmer123');
  const [modalFeedback, setModalFeedback] = useState(null);

  const handlePasswordLoginSubmit = (e) => {
    e.preventDefault();
    setModalFeedback(null);
    const res = authenticateFarmer(emailInput, passwordInput);
    if (res.success) {
      setIsLoginModalOpen(false);
    } else {
      setModalFeedback({ type: 'error', text: res.message });
    }
  };

  return (
    <div className="bg-loam text-field-bg border-b-2 border-loam px-4 lg:px-8 py-2.5 font-mono text-xs shadow-sharp-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        
        {/* Left Side: Demo Trial Label & 3 Fast Login Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sprout font-extrabold flex items-center gap-1.5 uppercase tracking-wider bg-sprout/15 px-2 py-1 rounded border border-sprout/40">
            <UserCheck className="w-3.5 h-3.5 text-sprout" />
            <span>Demo Fast Switch:</span>
          </span>

          <div className="flex flex-wrap items-center gap-1.5">
            {FARMER_ACCOUNTS.map((account) => {
              const isActive = currentFarmer?.id === account.id;
              return (
                <button
                  key={account.id}
                  type="button"
                  onClick={() => loginAsFarmer(account.id)}
                  className={`px-2.5 py-1 rounded-sm text-xs font-bold transition-all border flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-sprout text-field-bg border-field-bg font-extrabold shadow-sharp-sm'
                      : 'bg-field-surface/20 text-field-bg/90 border-field-bg/30 hover:bg-field-surface/40 hover:text-field-bg'
                  }`}
                  title={`Click to directly log in as ${account.name} (Pass: ${account.password})`}
                >
                  <span>{account.avatar}</span>
                  <span>{account.name} ({account.id})</span>
                  {isActive && <CheckCircle2 className="w-3 h-3 text-field-bg" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Password Login Trigger, Active Account Badge & Log Out Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsLoginModalOpen(true)}
            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-field-bg font-extrabold rounded-sm border border-amber-400 flex items-center gap-1 transition"
          >
            <Key className="w-3.5 h-3.5" />
            <span>Password Login Modal</span>
          </button>

          <button
            type="button"
            onClick={logoutFarmer}
            className="px-2.5 py-1 bg-red-700 hover:bg-red-800 text-field-bg font-bold rounded-sm border border-red-500 flex items-center gap-1 transition"
            title="Log out and return to initial Farmer Login Gateway landing page"
          >
            <LogOut className="w-3.5 h-3.5 text-field-bg" />
            <span>Log Out Gateway</span>
          </button>

          <span className="text-[11px] text-field-bg/80 border border-field-bg/30 px-2 py-1 rounded-sm hidden lg:inline">
            Active: <strong>{currentFarmer?.name}</strong> ({currentFarmer?.email})
          </span>
        </div>

      </div>

      {/* ── MODAL: Password Authentication Form ── */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 bg-loam/70 backdrop-blur-xs flex items-center justify-center p-4 text-loam">
          <div className="bg-field-surface border-2 border-loam rounded-sm p-6 max-w-md w-full shadow-sharp space-y-4 font-mono">
            
            <div className="flex items-center justify-between border-b-2 border-loam pb-3">
              <h3 className="font-serif text-lg font-extrabold text-loam flex items-center gap-2">
                <Lock className="w-5 h-5 text-sprout" />
                <span>Farmer Password Login</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(false)}
                className="text-xs font-bold text-loam-muted hover:text-loam"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-loam-muted">
              Select one of the 3 pre-registered farmer accounts or enter custom credentials to authenticate.
            </p>

            {modalFeedback && (
              <div className={`p-2.5 rounded-sm text-xs font-bold border ${
                modalFeedback.type === 'success' ? 'bg-emerald-100 border-emerald-400 text-emerald-900' : 'bg-red-100 border-red-400 text-red-900'
              }`}>
                {modalFeedback.text}
              </div>
            )}

            <form onSubmit={handlePasswordLoginSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase text-loam-muted block">
                  Farmer Email or ID
                </label>
                <input
                  type="text"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="ramesh@agrimitra.in or F001"
                  className="w-full p-2 bg-field-bg border-2 border-loam rounded-sm text-xs font-bold text-loam focus:outline-none focus:ring-2 focus:ring-sprout"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase text-loam-muted block">
                  Password
                </label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="farmer123"
                  className="w-full p-2 bg-field-bg border-2 border-loam rounded-sm text-xs font-bold text-loam focus:outline-none focus:ring-2 focus:ring-sprout"
                  required
                />
              </div>

              {/* Quick Fill Hints */}
              <div className="p-2.5 bg-field-bg border border-loam/20 rounded-sm space-y-1 text-[11px]">
                <span className="font-bold text-sprout block">Registered Account Credentials:</span>
                <div className="space-y-0.5 text-loam-muted text-[10px]">
                  <p>1. Ramesh Kumar: <code>ramesh@agrimitra.in</code> / <code>farmer123</code></p>
                  <p>2. Suresh Patel: <code>suresh@agrimitra.in</code> / <code>farmer123</code></p>
                  <p>3. Anita Singh: <code>anita@agrimitra.in</code> / <code>farmer123</code></p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-loam/20">
                <button
                  type="button"
                  onClick={() => setIsLoginModalOpen(false)}
                  className="py-2 px-3 bg-field-bg hover:bg-sprout-tint border border-loam rounded-sm text-xs font-bold text-loam"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 bg-sprout hover:bg-sprout-hover text-field-bg border-2 border-loam rounded-sm text-xs font-extrabold shadow-sharp-sm flex items-center gap-1.5"
                >
                  <LogIn className="w-4 h-4 text-field-bg" />
                  <span>Authenticate Login</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
