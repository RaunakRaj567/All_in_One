// frontend/src/pages/SmartWarehousePage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Warehouse, PackageCheck, TrendingUp, DollarSign, UserCheck, ShieldCheck, Scale, Save, ArrowRight, Bell, ShoppingBag } from 'lucide-react';
import SmartStorageDashboard from '../components/warehouse/SmartStorageDashboard';
import FarmerInventoryPanel from '../components/warehouse/FarmerInventoryPanel';
import {
  analyzeSurplus,
  storeProduce,
  getFarmerInventory,
  withdrawStoredProduce,
  getFarmerStorageCost,
  getFarmerNotifications
} from '../services/warehouseApi';
import { useAgriContext, FARMER_ACCOUNTS } from '../context/AgriContext';

export default function SmartWarehousePage() {
  const location = useLocation();
  const { currentFarmer, loginAsFarmer } = useAgriContext();
  const activeFarmerId = currentFarmer?.id || 'F001';
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'trend' | 'cost'

  const [farmerInventory, setFarmerInventory] = useState([]);
  const [storageCostSummary, setStorageCostSummary] = useState(null);
  const [farmerNotifications, setFarmerNotifications] = useState([]);
  const [analysisData, setAnalysisData] = useState(null);

  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [storing, setStoring] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Fetch Inventory, Storage Cost Billing & Notifications for Active Farmer
  const loadFarmerData = async (farmerId) => {
    try {
      const items = await getFarmerInventory(farmerId);
      if (items) {
        setFarmerInventory(items);
        // Prioritize location.state from Mandi surplus, else first active stored item, else default
        const navCrop = location.state?.crop;
        const navQty = location.state?.surplusKg || location.state?.supplyKg;
        const activeStored = items.find(i => i.quantity_kg > 0);

        if (navCrop && navQty) {
          handleAnalyzeCrop(navCrop, navQty, farmerId);
        } else if (activeStored) {
          handleAnalyzeCrop(activeStored.crop, activeStored.quantity_kg, farmerId);
        } else {
          handleAnalyzeCrop('Onion', 1000, farmerId);
        }
      }

      const costData = await getFarmerStorageCost(farmerId);
      if (costData) setStorageCostSummary(costData);

      const notifs = await getFarmerNotifications(farmerId);
      if (notifs) setFarmerNotifications(notifs);
    } catch (err) {
      console.warn('Farmer data fetch error:', err);
    }
  };

  useEffect(() => {
    setFarmerInventory([]);
    setStorageCostSummary(null);
    setFarmerNotifications([]);
    loadFarmerData(activeFarmerId);
  }, [activeFarmerId, location.state]);

  // Handler: Analyze Price Trend for Tab 2
  const handleAnalyzeCrop = async (targetCrop = 'Onion', qtyKg = 1000, targetFarmerId = activeFarmerId) => {
    setLoadingAnalysis(true);
    try {
      const res = await analyzeSurplus({
        farmer_id: targetFarmerId,
        crop: targetCrop,
        supply_kg: Number(qtyKg),
        market_demand_kg: 0,
        latitude: 28.61,
        longitude: 77.20
      });
      setAnalysisData(res);
    } catch (err) {
      console.warn('Analysis error:', err);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  // Handler: Deposit Produce into Central Warehouse
  const handleStoreProduce = async (warehouseId = 'W001') => {
    if (!analysisData) return;
    setStoring(true);
    try {
      const payload = {
        farmer_id: activeFarmerId,
        warehouse_id: 'W001',
        crop: analysisData.crop,
        quantity_kg: analysisData.supply_kg || 1000,
        planned_sell_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
      };
      const res = await storeProduce(payload);
      setStatusMessage({ type: 'success', text: res.message || 'Produce stored successfully in Central Warehouse!' });
      loadFarmerData(activeFarmerId);
    } catch (err) {
      setStatusMessage({ type: 'error', text: `Storage error: ${err.message}` });
    } finally {
      setStoring(false);
    }
  };

  // Handler: Withdraw Stored Produce
  const handleWithdrawProduce = async (inventoryId, withdrawQuantityKg) => {
    setWithdrawing(true);
    try {
      const res = await withdrawStoredProduce(inventoryId, withdrawQuantityKg);
      setStatusMessage({ type: 'success', text: res.message || 'Stored produce withdrawn successfully!' });
      loadFarmerData(activeFarmerId);
    } catch (err) {
      setStatusMessage({ type: 'error', text: `Withdrawal error: ${err.message}` });
    } finally {
      setWithdrawing(false);
    }
  };

  const activeFarmerObj = FARMER_ACCOUNTS.find(f => f.id === activeFarmerId);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 font-mono text-loam">
      
      {/* ── HEADER BANNER & MULTI-FARMER ACCOUNT SWITCHER ── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b-2 border-loam pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-sprout border-2 border-loam rounded-sm flex items-center justify-center text-field-bg font-bold text-2xl shadow-sharp-sm">
            🏭
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-2xl lg:text-3xl font-extrabold text-loam">
                Agri-Mitra Smart Warehouse Portal
              </h2>
              <span className="bg-sprout-tint text-sprout border border-sprout/40 text-xs font-mono px-2 py-0.5 rounded-sm uppercase tracking-wider font-semibold">
                Central Warehouse (W001)
              </span>
            </div>
            <p className="text-xs font-mono text-loam-muted mt-0.5">
              Multi-Farmer Isolated Vault • Real Actual Stored Details • 9-Day Price Model • Storage Cost Billing
            </p>
          </div>
        </div>

        {/* Single Logged-In Active Farmer Account Badge (Isolated Session) */}
        <div className="flex items-center gap-2.5 bg-field-surface px-3.5 py-2 border-2 border-loam rounded-sm shadow-sharp-sm">
          <UserCheck className="w-4 h-4 text-sprout" />
          <div className="text-xs font-mono">
            <span className="text-loam-muted block text-[10px] font-bold uppercase">Active Isolated Vault:</span>
            <strong className="text-loam font-extrabold">{activeFarmerObj?.name}</strong>
            <span className="text-sprout font-bold ml-1.5">({activeFarmerId})</span>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className={`px-4 py-2.5 rounded-sm text-xs font-mono font-bold border ${
          statusMessage.type === 'success' ? 'bg-emerald-100 border-emerald-400 text-emerald-900' : 'bg-red-100 border-red-400 text-red-900'
        }`}>
          {statusMessage.text}
        </div>
      )}

      {/* ── 3-TAB NAVIGATION BAR ── */}
      <div className="flex border-b-2 border-loam gap-2 bg-field-surface p-2 rounded-sm shadow-sharp-sm">
        
        {/* Tab 1: Stored Details (Real Actual Values Only) */}
        <button
          type="button"
          onClick={() => setActiveTab('details')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-sm font-extrabold text-xs transition-all ${
            activeTab === 'details'
              ? 'bg-sprout text-field-bg border-2 border-loam shadow-sharp-sm'
              : 'text-loam hover:bg-sprout-tint/50'
          }`}
        >
          <PackageCheck className="w-4 h-4" />
          <span>1. Stored Produce Details (Real Actual Values)</span>
        </button>

        {/* Tab 2: 9-Day Price Trend & SP Adjustment */}
        <button
          type="button"
          onClick={() => setActiveTab('trend')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-sm font-extrabold text-xs transition-all ${
            activeTab === 'trend'
              ? 'bg-sprout text-field-bg border-2 border-loam shadow-sharp-sm'
              : 'text-loam hover:bg-sprout-tint/50'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>2. 9-Day Price Trend & SP Adjustment</span>
        </button>

        {/* Tab 3: Storage Cost & Actual Payable */}
        <button
          type="button"
          onClick={() => setActiveTab('cost')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-sm font-extrabold text-xs transition-all ${
            activeTab === 'cost'
              ? 'bg-sprout text-field-bg border-2 border-loam shadow-sharp-sm'
              : 'text-loam hover:bg-sprout-tint/50'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>3. Storage Cost & Actual Payable</span>
        </button>

      </div>

      {/* ── TAB 1 CONTENT: STORED PRODUCE DETAILS (REAL ACTUAL VALUES ONLY — NO AI PREDICTIONS) ── */}
      {activeTab === 'details' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="p-3 bg-blue-50 border border-blue-300 rounded-sm text-xs font-bold text-blue-950 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-700" />
              Showing Real Actual Stored Produce for {activeFarmerObj?.name} ({activeFarmerId}). No AI predictions rendered here.
            </span>
            <span className="bg-blue-200 text-blue-950 px-2 py-0.5 rounded text-[10px]">
              {farmerInventory.length} Lots Stored
            </span>
          </div>

          <FarmerInventoryPanel
            inventoryItems={farmerInventory}
            onWithdrawProduce={handleWithdrawProduce}
            withdrawing={withdrawing}
          />
        </div>
      )}

      {/* ── TAB 2 CONTENT: 9-DAY PRICE TREND & SELLING PRICE (SP) ADJUSTMENT (MAX 5% SLIDER + SAVE TO DB) ── */}
      {activeTab === 'trend' && (
        <div className="space-y-6 animate-in fade-in">
          <SmartStorageDashboard
            farmerInventory={farmerInventory}
            activeFarmerId={activeFarmerId}
            analysisData={analysisData}
            onAnalyze={(payload) => handleAnalyzeCrop(payload.crop, payload.supply_kg, payload.farmer_id)}
            loading={loadingAnalysis}
            onSelectWarehouseSection={() => handleStoreProduce('W001')}
          />
        </div>
      )}

      {/* ── TAB 3 CONTENT: STORAGE COST & ACTUAL PAYABLE BILLING ── */}
      {activeTab === 'cost' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-field-surface border-2 border-loam rounded-sm p-4 sm:p-5 shadow-sharp space-y-5">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b-2 border-loam pb-3">
              <div>
                <span className="text-xs font-bold text-sprout uppercase tracking-wider block">Storage Billing & Cost Breakdown</span>
                <h3 className="font-serif text-lg font-extrabold text-loam">
                  Actual Storage Payable Amount for {activeFarmerObj?.name}
                </h3>
              </div>

              <span className="px-3 py-1 rounded-sm text-xs font-mono font-extrabold bg-sprout-tint text-sprout border border-sprout/40">
                Rate: ₹15.00 / ton / day
              </span>
            </div>

            {/* Top KPI Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              <div className="p-3.5 bg-field-bg border-2 border-loam/40 rounded-sm space-y-1">
                <span className="text-[10px] font-bold uppercase text-loam-muted block">Fixed Storage Rate</span>
                <p className="text-lg font-extrabold text-loam">₹15.00 <span className="text-xs font-normal text-loam-muted">/ ton / day</span></p>
                <span className="text-[10px] text-loam-muted block">Agri-Mitra Central Warehouse (W001)</span>
              </div>

              <div className="p-3.5 bg-field-bg border-2 border-loam/40 rounded-sm space-y-1">
                <span className="text-[10px] font-bold uppercase text-loam-muted block">Total Stored Quantity</span>
                <p className="text-lg font-extrabold text-sprout">
                  {storageCostSummary?.total_stored_tons || 0} <span className="text-xs font-bold">tons</span>
                </p>
                <span className="text-[10px] text-sprout font-bold block">{((storageCostSummary?.total_stored_tons || 0) * 1000).toLocaleString()} kg food grain</span>
              </div>

              <div className="p-3.5 bg-amber-100 border-2 border-amber-400 rounded-sm space-y-1">
                <span className="text-[10px] font-bold uppercase text-amber-950 block">Actual Storage Payable Amount</span>
                <p className="text-xl font-extrabold text-amber-950">
                  ₹{storageCostSummary?.total_actual_payable_amount?.toLocaleString() || '0.00'}
                </p>
                <span className="text-[10px] text-amber-900 font-bold block">Calculated as Tons × Days Stored × ₹15</span>
              </div>

            </div>

            {/* Itemized Billing Breakdown Table */}
            <div className="space-y-3 pt-2">
              <h4 className="font-serif text-sm font-extrabold text-loam border-b border-loam/20 pb-2">
                Itemized Crop Storage Cost Breakdown ({activeFarmerObj?.name})
              </h4>

              {storageCostSummary?.itemized_billing && storageCostSummary.itemized_billing.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-mono border-collapse border border-loam/30">
                    <thead>
                      <tr className="bg-field-bg border-b-2 border-loam text-loam text-left">
                        <th className="p-2.5">Lot ID</th>
                        <th className="p-2.5">Crop</th>
                        <th className="p-2.5">Quantity (Tons / Kg)</th>
                        <th className="p-2.5">Storage Date</th>
                        <th className="p-2.5">Days Stored</th>
                        <th className="p-2.5">Storage Rate</th>
                        <th className="p-2.5 text-right">Actual Payable Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {storageCostSummary.itemized_billing.map((b) => (
                        <tr key={b.inventory_id} className="border-b border-loam/20 bg-field-surface hover:bg-sprout-tint/30">
                          <td className="p-2.5 font-bold">{b.inventory_id}</td>
                          <td className="p-2.5 font-extrabold text-loam">{b.crop}</td>
                          <td className="p-2.5 font-bold text-sprout">{b.quantity_ton} t ({b.quantity_kg} kg)</td>
                          <td className="p-2.5">{b.storage_date}</td>
                          <td className="p-2.5 font-extrabold">{b.days_stored} days</td>
                          <td className="p-2.5">₹{b.storage_rate_per_ton_per_day}/ton/day</td>
                          <td className="p-2.5 text-right font-extrabold text-amber-900">₹{b.actual_payable_amount.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 bg-field-bg border border-loam/30 text-center text-xs text-loam-muted">
                  No active stored items found for {activeFarmerObj?.name}.
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

