import React, { useState } from 'react';
import { UserCheck, Key, Lock, ArrowRight, ShieldCheck, User, Building2, ShoppingBag, Store, Truck } from 'lucide-react';
import { useAgriContext, FARMER_ACCOUNTS, BUYER_ACCOUNTS, DELIVERY_PARTNER_ACCOUNTS } from '../context/AgriContext';

export default function FarmerLoginGateway() {
  const {
    loginAsFarmer,
    loginAsBuyer,
    loginAsDeliveryPartner,
    authenticateFarmer,
    authenticateBuyer,
    authenticateDeliveryPartner,
    authStatusMessage,
    setAuthStatusMessage
  } = useAgriContext();
  
  const [loginRoleTab, setLoginRoleTab] = useState('farmer'); // 'farmer' | 'buyer' | 'delivery'

  // Farmer form state
  const [farmerEmailOrId, setFarmerEmailOrId] = useState('ramesh@agrimitra.in');
  const [farmerPassword, setFarmerPassword] = useState('farmer123');
  const [selectedFarmerDemoId, setSelectedFarmerDemoId] = useState('F001');

  // Buyer form state
  const [buyerEmailOrId, setBuyerEmailOrId] = useState('rajesh@agrimitra.in');
  const [buyerPassword, setBuyerPassword] = useState('buyer123');
  const [selectedBuyerDemoId, setSelectedBuyerDemoId] = useState('B001');

  // Delivery Partner form state
  const [partnerEmailOrId, setPartnerEmailOrId] = useState('vikram.delivery@agrimitra.in');
  const [partnerPassword, setPartnerPassword] = useState('partner123');
  const [selectedPartnerDemoId, setSelectedPartnerDemoId] = useState('D001');

  const handleFarmerSubmit = (e) => {
    e.preventDefault();
    authenticateFarmer(farmerEmailOrId, farmerPassword);
  };

  const handleBuyerSubmit = (e) => {
    e.preventDefault();
    authenticateBuyer(buyerEmailOrId, buyerPassword);
  };

  const handlePartnerSubmit = (e) => {
    e.preventDefault();
    authenticateDeliveryPartner(partnerEmailOrId, partnerPassword);
  };

  const handleSelectFarmerDemo = (acc) => {
    setSelectedFarmerDemoId(acc.id);
    setFarmerEmailOrId(acc.email);
    setFarmerPassword(acc.password);
  };

  const handleSelectBuyerDemo = (acc) => {
    setSelectedBuyerDemoId(acc.id);
    setBuyerEmailOrId(acc.email);
    setBuyerPassword(acc.password);
  };

  const handleSelectPartnerDemo = (acc) => {
    setSelectedPartnerDemoId(acc.id);
    setPartnerEmailOrId(acc.email);
    setPartnerPassword(acc.password);
  };

  return (
    <div className="min-h-screen bg-field-bg text-loam font-mono flex flex-col justify-between p-4 sm:p-6 lg:p-12 selection:bg-sprout-light selection:text-loam">
      
      {/* ── TOP HEADER BRAND BAR ── */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between border-b-2 border-loam pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-sprout border-2 border-loam rounded-sm flex items-center justify-center text-field-bg font-bold font-mono text-2xl shadow-sharp">
            🌾
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-loam">
                AgriVision AI Portal
              </h1>
              <span className="bg-sprout-tint text-sprout border border-sprout/40 text-xs font-mono px-2.5 py-0.5 rounded-sm uppercase tracking-wider font-semibold">
                SIH PS 26033
              </span>
            </div>
            <p className="text-xs text-loam-muted mt-0.5">
              Smart Agriculture Marketplace & Supply-Chain Gateway (Farmer & Buyer Portals)
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-sprout bg-sprout-tint/60 border border-sprout/40 px-3 py-1.5 rounded-sm">
          <ShieldCheck className="w-4 h-4 text-sprout" />
          <span>Multi-Account Secure Authentication</span>
        </div>
      </div>

      {/* ── MAIN PORTAL BODY ── */}
      <div className="max-w-6xl w-full mx-auto my-auto py-6">
        
        {/* Title Banner */}
        <div className="text-center max-w-xl mx-auto mb-6 space-y-2">
          <span className="bg-sprout-tint text-sprout border border-sprout/40 text-xs font-extrabold px-3 py-1 rounded-sm uppercase tracking-widest inline-block">
            AUTHENTICATION GATEWAY
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-loam">
            Select Account Role to Enter
          </h2>
          <p className="text-xs text-loam-muted">
            Choose pre-configured demo profiles or log in with credentials for Farmers (3 accounts) or Buyers (3 accounts).
          </p>
        </div>

        {/* ── TRIPLE ROLE SWITCHER TABS ── */}
        <div className="max-w-2xl w-full mx-auto mb-6 grid grid-cols-1 sm:grid-cols-3 gap-2 p-1.5 bg-field-surface border-2 border-loam rounded-sm shadow-sharp-sm">
          <button
            type="button"
            onClick={() => {
              setLoginRoleTab('farmer');
              setAuthStatusMessage(null);
            }}
            className={`py-2.5 px-3 rounded-sm font-serif font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all ${
              loginRoleTab === 'farmer'
                ? 'bg-sprout text-field-bg border-2 border-loam shadow-sharp-sm'
                : 'text-loam hover:bg-sprout-tint/50'
            }`}
          >
            <span>👨‍🌾</span>
            <span>Farmer Portal (3)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setLoginRoleTab('buyer');
              setAuthStatusMessage(null);
            }}
            className={`py-2.5 px-3 rounded-sm font-serif font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all ${
              loginRoleTab === 'buyer'
                ? 'bg-sprout text-field-bg border-2 border-loam shadow-sharp-sm'
                : 'text-loam hover:bg-sprout-tint/50'
            }`}
          >
            <span>🏬</span>
            <span>Buyer Portal (3)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setLoginRoleTab('delivery');
              setAuthStatusMessage(null);
            }}
            className={`py-2.5 px-3 rounded-sm font-serif font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all ${
              loginRoleTab === 'delivery'
                ? 'bg-sprout text-field-bg border-2 border-loam shadow-sharp-sm'
                : 'text-loam hover:bg-sprout-tint/50'
            }`}
          >
            <span>🚚</span>
            <span>Delivery Partner (5)</span>
          </button>
        </div>

        {authStatusMessage && (
          <div className={`max-w-xl mx-auto mb-6 p-3 rounded-sm text-xs font-mono font-bold border ${
            authStatusMessage.type === 'success' ? 'bg-emerald-100 border-emerald-400 text-emerald-900' : 'bg-red-100 border-red-400 text-red-900'
          }`}>
            {authStatusMessage.text}
          </div>
        )}

        {/* ── FARMER LOGIN INTERFACE ── */}
        {loginRoleTab === 'farmer' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch animate-in fade-in duration-200">
            
            {/* LEFT COLUMN: 3 FARMER DEMO CARDS */}
            <div className="lg:col-span-7 bg-field-surface border-2 border-loam rounded-sm p-5 sm:p-6 shadow-sharp space-y-4">
              <div className="flex items-center justify-between border-b-2 border-loam pb-3">
                <div>
                  <span className="text-xs font-extrabold text-sprout uppercase tracking-wider block">Farmer Demo Trial</span>
                  <h3 className="font-serif text-xl font-extrabold text-loam flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-sprout" />
                    Select Demo Farmer Profile
                  </h3>
                </div>
                <span className="bg-sprout-tint text-sprout border border-sprout/40 text-[10px] font-bold px-2 py-1 rounded-sm">
                  3 Accounts Available
                </span>
              </div>

              <div className="space-y-3 pt-1">
                {FARMER_ACCOUNTS.map((acc) => {
                  const isSelected = selectedFarmerDemoId === acc.id;
                  return (
                    <div
                      key={acc.id}
                      onClick={() => handleSelectFarmerDemo(acc)}
                      className={`p-4 rounded-sm border-2 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-sprout-tint/60 border-loam shadow-sharp-sm'
                          : 'bg-field-bg border-loam/30 hover:border-loam'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-field-surface border border-loam rounded-sm flex items-center justify-center text-xl shrink-0">
                          {acc.avatar}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-serif text-base font-extrabold text-loam">
                              {acc.name}
                            </h4>
                            <span className="text-[10px] font-extrabold bg-loam text-field-bg px-2 py-0.5 rounded-sm">
                              {acc.id}
                            </span>
                          </div>
                          <p className="text-xs text-sprout font-bold mt-0.5">
                            {acc.role}
                          </p>
                          <p className="text-[10px] text-loam-muted mt-0.5">
                            Loc: {acc.location} &nbsp;•&nbsp; Email: <code>{acc.email}</code>
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          loginAsFarmer(acc.id);
                        }}
                        className="w-full sm:w-auto py-2 px-4 bg-sprout hover:bg-sprout-hover text-field-bg border-2 border-loam rounded-sm text-xs font-mono font-extrabold shadow-sharp-sm flex items-center justify-center gap-1.5 transition active:translate-y-0.5 shrink-0"
                      >
                        <span>Log In as {acc.name.split(' ')[0]}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-field-bg" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT COLUMN: FARMER CREDENTIALS FORM */}
            <div className="lg:col-span-5 bg-field-surface border-2 border-loam rounded-sm p-5 sm:p-6 shadow-sharp flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between border-b-2 border-loam pb-3 mb-4">
                  <div>
                    <span className="text-xs font-extrabold text-amber-800 uppercase tracking-wider block">Farmer Credentials</span>
                    <h3 className="font-serif text-xl font-extrabold text-loam flex items-center gap-2">
                      <Lock className="w-5 h-5 text-amber-700" />
                      Farmer Password Form
                    </h3>
                  </div>
                </div>

                <form onSubmit={handleFarmerSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-loam-muted block flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-sprout" />
                      Farmer Email or ID
                    </label>
                    <input
                      type="text"
                      value={farmerEmailOrId}
                      onChange={(e) => setFarmerEmailOrId(e.target.value)}
                      placeholder="ramesh@agrimitra.in or F001"
                      className="w-full p-2.5 bg-field-bg border-2 border-loam rounded-sm text-xs font-bold text-loam focus:outline-none focus:ring-2 focus:ring-sprout"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-loam-muted block flex items-center gap-1">
                      <Key className="w-3.5 h-3.5 text-sprout" />
                      Password
                    </label>
                    <input
                      type="password"
                      value={farmerPassword}
                      onChange={(e) => setFarmerPassword(e.target.value)}
                      placeholder="farmer123"
                      className="w-full p-2.5 bg-field-bg border-2 border-loam rounded-sm text-xs font-bold text-loam focus:outline-none focus:ring-2 focus:ring-sprout"
                      required
                    />
                  </div>

                  <div className="p-3 bg-amber-50 border border-amber-300 rounded-sm text-xs space-y-1 text-amber-950">
                    <span className="font-extrabold block text-amber-900">Farmer Demo Password:</span>
                    <p className="text-[11px] leading-relaxed">
                      All 3 demo farmer accounts use the password <code className="bg-amber-200 px-1 py-0.5 rounded text-amber-950 font-bold">farmer123</code>.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-loam hover:bg-loam-muted text-field-bg border-2 border-loam rounded-sm text-xs font-mono font-extrabold shadow-sharp flex items-center justify-center gap-2 transition active:translate-y-0.5"
                  >
                    <Key className="w-4 h-4 text-sprout" />
                    <span>Authenticate & Enter Farmer Suite</span>
                  </button>
                </form>
              </div>

              <div className="pt-3 border-t border-loam/20 text-[11px] text-loam-muted flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-sprout shrink-0" />
                <span>Multi-Farmer Isolated Vault Architecture • End-to-End Encryption</span>
              </div>
            </div>

          </div>
        )}

        {/* ── BUYER LOGIN INTERFACE ── */}
        {loginRoleTab === 'buyer' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch animate-in fade-in duration-200">
            
            {/* LEFT COLUMN: 3 BUYER DEMO CARDS */}
            <div className="lg:col-span-7 bg-field-surface border-2 border-loam rounded-sm p-5 sm:p-6 shadow-sharp space-y-4">
              <div className="flex items-center justify-between border-b-2 border-loam pb-3">
                <div>
                  <span className="text-xs font-extrabold text-sprout uppercase tracking-wider block">Buyer Demo Trial</span>
                  <h3 className="font-serif text-xl font-extrabold text-loam flex items-center gap-2">
                    <Store className="w-5 h-5 text-sprout" />
                    Select Demo Buyer Profile
                  </h3>
                </div>
                <span className="bg-sprout-tint text-sprout border border-sprout/40 text-[10px] font-bold px-2 py-1 rounded-sm">
                  3 Buyer Accounts
                </span>
              </div>

              <div className="space-y-3 pt-1">
                {BUYER_ACCOUNTS.map((acc) => {
                  const isSelected = selectedBuyerDemoId === acc.id;
                  return (
                    <div
                      key={acc.id}
                      onClick={() => handleSelectBuyerDemo(acc)}
                      className={`p-4 rounded-sm border-2 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-sprout-tint/60 border-loam shadow-sharp-sm'
                          : 'bg-field-bg border-loam/30 hover:border-loam'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-field-surface border border-loam rounded-sm flex items-center justify-center text-xl shrink-0">
                          {acc.avatar}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-serif text-base font-extrabold text-loam">
                              {acc.name}
                            </h4>
                            <span className="text-[10px] font-extrabold bg-loam text-field-bg px-2 py-0.5 rounded-sm">
                              {acc.id}
                            </span>
                          </div>
                          <p className="text-xs text-sprout font-bold mt-0.5">
                            {acc.role}
                          </p>
                          <p className="text-[10px] text-loam-muted mt-0.5">
                            Loc: {acc.location} &nbsp;•&nbsp; Email: <code>{acc.email}</code>
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          loginAsBuyer(acc.id);
                        }}
                        className="w-full sm:w-auto py-2 px-4 bg-sprout hover:bg-sprout-hover text-field-bg border-2 border-loam rounded-sm text-xs font-mono font-extrabold shadow-sharp-sm flex items-center justify-center gap-1.5 transition active:translate-y-0.5 shrink-0"
                      >
                        <span>Log In as {acc.name.split(' ')[0]}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-field-bg" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT COLUMN: BUYER CREDENTIALS FORM */}
            <div className="lg:col-span-5 bg-field-surface border-2 border-loam rounded-sm p-5 sm:p-6 shadow-sharp flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between border-b-2 border-loam pb-3 mb-4">
                  <div>
                    <span className="text-xs font-extrabold text-amber-800 uppercase tracking-wider block">Buyer Credentials</span>
                    <h3 className="font-serif text-xl font-extrabold text-loam flex items-center gap-2">
                      <Lock className="w-5 h-5 text-amber-700" />
                      Buyer Password Form
                    </h3>
                  </div>
                </div>

                <form onSubmit={handleBuyerSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-loam-muted block flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-sprout" />
                      Buyer Email or ID
                    </label>
                    <input
                      type="text"
                      value={buyerEmailOrId}
                      onChange={(e) => setBuyerEmailOrId(e.target.value)}
                      placeholder="rajesh@agrimitra.in or B001"
                      className="w-full p-2.5 bg-field-bg border-2 border-loam rounded-sm text-xs font-bold text-loam focus:outline-none focus:ring-2 focus:ring-sprout"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-loam-muted block flex items-center gap-1">
                      <Key className="w-3.5 h-3.5 text-sprout" />
                      Password
                    </label>
                    <input
                      type="password"
                      value={buyerPassword}
                      onChange={(e) => setBuyerPassword(e.target.value)}
                      placeholder="buyer123"
                      className="w-full p-2.5 bg-field-bg border-2 border-loam rounded-sm text-xs font-bold text-loam focus:outline-none focus:ring-2 focus:ring-sprout"
                      required
                    />
                  </div>

                  <div className="p-3 bg-amber-50 border border-amber-300 rounded-sm text-xs space-y-1 text-amber-950">
                    <span className="font-extrabold block text-amber-900">Buyer Demo Password:</span>
                    <p className="text-[11px] leading-relaxed">
                      All 3 demo buyer accounts use the password <code className="bg-amber-200 px-1 py-0.5 rounded text-amber-950 font-bold">buyer123</code>.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-loam hover:bg-loam-muted text-field-bg border-2 border-loam rounded-sm text-xs font-mono font-extrabold shadow-sharp flex items-center justify-center gap-2 transition active:translate-y-0.5"
                  >
                    <Key className="w-4 h-4 text-sprout" />
                    <span>Authenticate & Enter Buyer Portal</span>
                  </button>
                </form>
              </div>

              <div className="pt-3 border-t border-loam/20 text-[11px] text-loam-muted flex items-center gap-2">
                <ShoppingBag className="w-3.5 h-3.5 text-sprout shrink-0" />
                <span>Buyer Procurement Gateway • Regional Bidding & Contract Farming</span>
              </div>
            </div>

          </div>
        )}

        {/* ── DELIVERY PARTNER LOGIN INTERFACE ── */}
        {loginRoleTab === 'delivery' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch animate-in fade-in duration-200">
            
            {/* LEFT COLUMN: 5 DELIVERY PARTNER DEMO CARDS */}
            <div className="lg:col-span-7 bg-field-surface border-2 border-loam rounded-sm p-5 sm:p-6 shadow-sharp space-y-4">
              <div className="flex items-center justify-between border-b-2 border-loam pb-3">
                <div>
                  <span className="text-xs font-extrabold text-sprout uppercase tracking-wider block">Logistics Partner Fleet</span>
                  <h3 className="font-serif text-xl font-extrabold text-loam flex items-center gap-2">
                    <Truck className="w-5 h-5 text-sprout" />
                    Select Demo Delivery Partner Profile
                  </h3>
                </div>
                <span className="bg-sprout-tint text-sprout border border-sprout/40 text-[10px] font-bold px-2 py-1 rounded-sm">
                  5 Partners Available
                </span>
              </div>

              <div className="space-y-3 pt-1">
                {DELIVERY_PARTNER_ACCOUNTS.map((acc) => {
                  const isSelected = selectedPartnerDemoId === acc.id;
                  return (
                    <div
                      key={acc.id}
                      onClick={() => handleSelectPartnerDemo(acc)}
                      className={`p-3.5 rounded-sm border-2 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-sprout-tint/60 border-loam shadow-sharp-sm'
                          : 'bg-field-bg border-loam/30 hover:border-loam'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-field-surface border border-loam rounded-sm flex items-center justify-center text-xl shrink-0">
                          {acc.avatar}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-serif text-base font-extrabold text-loam">
                              {acc.name}
                            </h4>
                            <span className="text-[10px] font-extrabold bg-loam text-field-bg px-2 py-0.5 rounded-sm">
                              {acc.id}
                            </span>
                          </div>
                          <p className="text-xs text-sprout font-bold mt-0.5">
                            {acc.company} • {acc.role}
                          </p>
                          <p className="text-[10px] text-loam-muted mt-0.5">
                            Vehicle: <strong>{acc.vehicle_number}</strong> ({acc.vehicle_capacity_ton}T Max) • Loc: {acc.location}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          loginAsDeliveryPartner(acc.id);
                        }}
                        className="w-full sm:w-auto py-2 px-3.5 bg-sprout hover:bg-sprout-hover text-field-bg border-2 border-loam rounded-sm text-xs font-mono font-extrabold shadow-sharp-sm flex items-center justify-center gap-1.5 transition active:translate-y-0.5 shrink-0"
                      >
                        <span>Log In as {acc.name.split(' ')[0]}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-field-bg" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT COLUMN: DELIVERY PARTNER CREDENTIALS FORM */}
            <div className="lg:col-span-5 bg-field-surface border-2 border-loam rounded-sm p-5 sm:p-6 shadow-sharp flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between border-b-2 border-loam pb-3 mb-4">
                  <div>
                    <span className="text-xs font-extrabold text-amber-800 uppercase tracking-wider block">Partner Credentials</span>
                    <h3 className="font-serif text-xl font-extrabold text-loam flex items-center gap-2">
                      <Lock className="w-5 h-5 text-amber-700" />
                      Delivery Partner Form
                    </h3>
                  </div>
                </div>

                <form onSubmit={handlePartnerSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-loam-muted block flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-sprout" />
                      Partner Email or ID
                    </label>
                    <input
                      type="text"
                      value={partnerEmailOrId}
                      onChange={(e) => setPartnerEmailOrId(e.target.value)}
                      placeholder="vikram.delivery@agrimitra.in or D001"
                      className="w-full p-2.5 bg-field-bg border-2 border-loam rounded-sm text-xs font-bold text-loam focus:outline-none focus:ring-2 focus:ring-sprout"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-loam-muted block flex items-center gap-1">
                      <Key className="w-3.5 h-3.5 text-sprout" />
                      Password
                    </label>
                    <input
                      type="password"
                      value={partnerPassword}
                      onChange={(e) => setPartnerPassword(e.target.value)}
                      placeholder="partner123"
                      className="w-full p-2.5 bg-field-bg border-2 border-loam rounded-sm text-xs font-bold text-loam focus:outline-none focus:ring-2 focus:ring-sprout"
                      required
                    />
                  </div>

                  <div className="p-3 bg-amber-50 border border-amber-300 rounded-sm text-xs space-y-1 text-amber-950">
                    <span className="font-extrabold block text-amber-900">Delivery Partner Password:</span>
                    <p className="text-[11px] leading-relaxed">
                      All 5 demo delivery partner accounts use the password <code className="bg-amber-200 px-1 py-0.5 rounded text-amber-950 font-bold">partner123</code>.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-loam hover:bg-loam-muted text-field-bg border-2 border-loam rounded-sm text-xs font-mono font-extrabold shadow-sharp flex items-center justify-center gap-2 transition active:translate-y-0.5"
                  >
                    <Truck className="w-4 h-4 text-sprout" />
                    <span>Authenticate & Enter Partner Portal</span>
                  </button>
                </form>
              </div>

              <div className="pt-3 border-t border-loam/20 text-[11px] text-loam-muted flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-sprout shrink-0" />
                <span>Agri-Logistics Freight & Central Warehouse Dispatch Dispatch System</span>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* ── BOTTOM FOOTER BAR ── */}
      <div className="max-w-6xl w-full mx-auto border-t-2 border-loam pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-loam-muted">
        <div>
          Agri-Mitra AI Mega Suite • Smart India Hackathon PS 26033
        </div>
        <div className="flex items-center gap-2 font-bold text-loam">
          <span className="w-2 h-2 rounded-full bg-sprout" />
          <span>Earth-Tone Aesthetic System</span>
        </div>
      </div>

    </div>
  );
}
