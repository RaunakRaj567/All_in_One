// frontend/src/components/warehouse/SmartStorageDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Warehouse, DollarSign, ArrowRight, ShieldCheck, Scale, Save, CheckCircle2, PackageCheck } from 'lucide-react';
import PriceTrendBarChart from './PriceTrendBarChart';
import { updateSellingPriceInDb } from '../../services/warehouseApi';

const CROPS = ['Onion', 'Wheat', 'Rice', 'Maize'];
const CROP_EMOJIS = { Onion: '🧅', Wheat: '🌾', Rice: '🍚', Maize: '🌽' };

export default function SmartStorageDashboard({
  farmerInventory = [],
  activeFarmerId = 'F001',
  analysisData,
  onAnalyze,
  loading,
  onSelectWarehouseSection
}) {
  const [crop, setCrop] = useState('Onion');
  const [storageQtyKg, setStorageQtyKg] = useState(1000);
  const [unitMode, setUnitMode] = useState('tons');

  // SP Adjustment state (capped at max 5.0%)
  const [spMarkupPercent, setSpMarkupPercent] = useState(0.0);
  const [savingSp, setSavingSp] = useState(false);
  const [spSaveMessage, setSpSaveMessage] = useState(null);

  const handleUpdateCropOrQty = (targetCrop, qtyKg) => {
    onAnalyze({
      farmer_id: activeFarmerId,
      crop: targetCrop,
      supply_kg: Number(qtyKg),
      market_demand_kg: 0, // Surplus detection bypassed
      latitude: 28.61,
      longitude: 77.20
    });
  };

  // Sync state with actual stored produce in DB (farmerInventory) for active farmer
  useEffect(() => {
    const match = (farmerInventory || []).find(
      (i) => i.crop?.toLowerCase() === crop.toLowerCase() && i.quantity_kg > 0
    );
    if (match) {
      setStorageQtyKg(match.quantity_kg);
      handleUpdateCropOrQty(crop, match.quantity_kg);
    } else {
      const firstStored = (farmerInventory || []).find((i) => i.quantity_kg > 0);
      if (firstStored) {
        setCrop(firstStored.crop);
        setStorageQtyKg(firstStored.quantity_kg);
        handleUpdateCropOrQty(firstStored.crop, firstStored.quantity_kg);
      } else {
        handleUpdateCropOrQty(crop, storageQtyKg);
      }
    }
  }, [farmerInventory, activeFarmerId]);

  const handleSelectCrop = (selectedCrop) => {
    setCrop(selectedCrop);
    const match = (farmerInventory || []).find(
      (i) => i.crop?.toLowerCase() === selectedCrop.toLowerCase() && i.quantity_kg > 0
    );
    const actualQty = match ? match.quantity_kg : 0;
    setStorageQtyKg(actualQty);
    handleUpdateCropOrQty(selectedCrop, actualQty);
  };

  const storedTon = (storageQtyKg / 1000).toFixed(2);

  // Compute dynamic SP metrics based on model prediction + max 5% adjustment
  const modelBaseSpKg = analysisData?.predicted_price_per_kg || 25.0;
  const currentSpKg = Math.round((modelBaseSpKg * (1 + spMarkupPercent / 100)) * 100) / 100;
  const currentSpTon = Math.round(currentSpKg * 1000);
  const totalStorageCost = analysisData?.total_storage_cost || Math.round((storageQtyKg / 1000) * 15 * (analysisData?.recommended_storage_days || 7));

  // Handle Save SP to DB
  const handleSaveSpToDb = async () => {
    setSavingSp(true);
    setSpSaveMessage(null);
    try {
      const res = await updateSellingPriceInDb({
        farmer_id: activeFarmerId,
        crop: crop,
        markup_percent: spMarkupPercent,
        custom_sp_per_kg: currentSpKg
      });
      setSpSaveMessage({
        type: 'success',
        text: `✅ Saved SP to DB: ₹${currentSpKg.toFixed(2)}/kg (₹${currentSpTon.toLocaleString()}/ton, +${spMarkupPercent.toFixed(1)}% markup)!`
      });
    } catch (err) {
      setSpSaveMessage({
        type: 'error',
        text: `Error saving SP to DB: ${err.message}`
      });
    } finally {
      setSavingSp(false);
    }
  };

  return (
    <div className="space-y-6 font-mono text-loam">

      {/* ── SECTION 1: Food Grain Storage Control & Selection Bar ── */}
      <div className="bg-field-surface border-2 border-loam rounded-sm p-4 sm:p-5 shadow-sharp space-y-4">
        
        {/* Header & Unit Switcher */}
        <div className="flex items-center justify-between border-b-2 border-loam pb-3">
          <div>
            <h2 className="font-serif text-lg font-extrabold text-loam flex items-center gap-2">
              <Warehouse className="w-5 h-5 text-sprout" />
              Central Warehouse Storage & Selling Price Manager
            </h2>
            <p className="text-xs text-loam-muted mt-0.5">
              Price trend analysis & SP adjustment calculated from live stored produce data ({activeFarmerId})
            </p>
          </div>

          <div className="flex border-2 border-loam rounded-sm overflow-hidden bg-field-bg">
            {['tons', 'kg'].map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setUnitMode(u)}
                className={`px-3 py-1 text-xs font-mono font-bold transition-colors ${
                  unitMode === u
                    ? 'bg-sprout text-field-bg'
                    : 'text-loam hover:bg-sprout-tint/50'
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>

        {/* Live DB Stored Produce Status Banner */}
        <div className="p-2.5 bg-sprout-tint/60 border border-sprout/40 rounded-sm text-xs font-mono font-bold text-sprout flex items-center justify-between">
          <span className="flex items-center gap-2">
            <PackageCheck className="w-4 h-4 text-sprout" />
            <span>
              Connected to DB Stored Produce: <strong>{storageQtyKg} kg ({storedTon} tons)</strong> of {crop} stored for {activeFarmerId}.
            </span>
          </span>
          <span className="text-[10px] bg-sprout text-field-bg px-2 py-0.5 rounded font-extrabold">
            Live DB Flow
          </span>
        </div>

        {/* Commodity / Crop Selection */}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-loam-muted block">
              Select Commodity / Food Grain
            </label>
            <div className="grid grid-cols-4 gap-2">
              {CROPS.map((c) => {
                const sel = c === crop;
                const match = (farmerInventory || []).find(
                  (i) => i.crop?.toLowerCase() === c.toLowerCase() && i.quantity_kg > 0
                );
                const storedKg = match ? match.quantity_kg : 0;

                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleSelectCrop(c)}
                    className={`flex flex-col items-center justify-center gap-1 p-2.5 rounded-sm border-2 font-mono text-xs font-extrabold transition-all ${
                      sel
                        ? 'border-loam bg-sprout-tint text-sprout shadow-sharp-sm'
                        : 'border-loam/30 bg-field-bg text-loam hover:border-loam'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{CROP_EMOJIS[c]}</span>
                      <span>{c}</span>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                      storedKg > 0 ? 'bg-sprout text-field-bg' : 'bg-field-surface text-loam-muted border border-loam/20'
                    }`}>
                      {storedKg > 0 ? `${storedKg} kg in DB` : '0 kg stored'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stored Quantity Input */}
          <div className="p-3 bg-field-bg border border-loam/40 rounded-sm space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-[10px] font-bold uppercase text-loam-muted">
                Food Grain Storage Quantity ({unitMode})
              </label>
              <span className="text-[10px] text-sprout font-bold">
                {unitMode === 'tons' ? `${storageQtyKg} kg` : `${storedTon} tons`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step={unitMode === 'tons' ? '0.1' : '50'}
                value={unitMode === 'tons' ? (storageQtyKg / 1000) : storageQtyKg}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  const kgVal = unitMode === 'tons' ? Math.round(val * 1000) : val;
                  setStorageQtyKg(kgVal);
                  handleUpdateCropOrQty(crop, kgVal);
                }}
                className="w-full p-2 bg-field-surface border-2 border-loam rounded-sm text-sm font-extrabold text-sprout focus:outline-none focus:ring-2 focus:ring-sprout"
              />
              <button
                type="button"
                onClick={() => handleUpdateCropOrQty(crop, storageQtyKg)}
                className="py-2 px-3 bg-sprout hover:bg-sprout-hover text-field-bg border border-loam rounded-sm text-xs font-mono font-bold shadow-sharp-sm shrink-0"
              >
                Update Quantity
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* ── SECTION 2: Surplus Analysis Result & Exact 4 Storage Metrics ── */}
      {analysisData && (
        <div className="space-y-6">
          
          {/* 9-Day Price Trend Bar Chart */}
          <PriceTrendBarChart
            pricePoints={analysisData.price_trend_points}
            recommendedDayOffset={analysisData.recommended_storage_days}
            storageCostPerTonDay={analysisData.storage_cost_per_ton_per_day}
            surplusTon={analysisData.surplus_ton}
          />

          {/* ── STRICT 4-METRIC STORAGE CARD (EXACT TONS STORED, SP PER TON, SP PER KG, TOTAL STORAGE COST) ── */}
          <div className="bg-field-surface border-2 border-loam rounded-sm p-4 sm:p-5 shadow-sharp space-y-4">
            
            <div className="flex items-center justify-between border-b-2 border-loam pb-3">
              <div>
                <span className="text-xs font-bold text-sprout uppercase tracking-wider block">Central Warehouse Storage Metrics</span>
                <h3 className="font-serif text-lg font-extrabold text-loam">
                  Stored Food Grains & Selling Price Summary
                </h3>
              </div>
              <span className="px-3 py-1 rounded-sm text-xs font-mono font-extrabold bg-sprout-tint text-sprout border border-sprout/40">
                1 Central Storehouse (W001)
              </span>
            </div>

            {/* EXACT 4 METRICS GRID: Exact Tons Stored | SP Cost per Ton | SP Cost per Kg | Total Storage Cost */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              
              {/* Metric 1: Exact Tons Stored */}
              <div className="p-3 bg-field-bg border-2 border-loam/40 rounded-sm space-y-1">
                <span className="text-[10px] font-bold uppercase text-loam-muted block">1. Exact Tons Stored</span>
                <p className="text-base font-extrabold text-loam">
                  {Number(analysisData.surplus_ton || 0).toFixed(2)} <span className="text-xs font-bold">tons</span>
                </p>
                <span className="text-[10px] text-sprout font-bold block">{Number(analysisData.surplus_kg || 0).toFixed(2)} kg food grain</span>
              </div>

              {/* Metric 2: SP Cost per Ton */}
              <div className="p-3 bg-field-bg border-2 border-loam/40 rounded-sm space-y-1">
                <span className="text-[10px] font-bold uppercase text-loam-muted block">2. SP Cost per Ton</span>
                <p className="text-base font-extrabold text-loam">
                  ₹{currentSpTon.toLocaleString()} <span className="text-xs font-normal text-loam-muted">/ton</span>
                </p>
                <span className="text-[10px] text-loam-muted block">Model predicted + markup</span>
              </div>

              {/* Metric 3: SP Cost per Kg */}
              <div className="p-3 bg-field-bg border-2 border-loam/40 rounded-sm space-y-1">
                <span className="text-[10px] font-bold uppercase text-loam-muted block">3. SP Cost per Kg</span>
                <p className="text-base font-extrabold text-sprout">
                  ₹{currentSpKg.toFixed(2)} <span className="text-xs font-normal text-loam-muted">/kg</span>
                </p>
                <span className="text-[10px] text-sprout font-bold block">Base: ₹{Number(modelBaseSpKg || 0).toFixed(2)}/kg</span>
              </div>

              {/* Metric 4: Total Storage Cost */}
              <div className="p-3 bg-amber-50 border-2 border-amber-300 rounded-sm space-y-1">
                <span className="text-[10px] font-bold uppercase text-amber-900 block">4. Total Storage Cost</span>
                <p className="text-base font-extrabold text-amber-950">
                  ₹{totalStorageCost.toLocaleString()}
                </p>
                <span className="text-[10px] text-amber-800 block">₹{analysisData.storage_cost_per_ton_per_day}/ton/day × {analysisData.recommended_storage_days}d</span>
              </div>

            </div>

            {/* ── PRICE ADJUSTMENT SLIDER (UPTO 5% MAX) & SAVE TO DB BUTTON ── */}
            <div className="p-3.5 bg-field-bg border-2 border-loam/30 rounded-sm space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <label className="text-xs font-mono font-bold uppercase text-loam flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-sprout" />
                  Day-Wise Selling Price (SP) Model Adjustment
                  <span className="text-[10px] text-amber-800 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded font-bold">
                    (Max +5.0% Price Increase Limit)
                  </span>
                </label>
                
                <span className="text-xs font-mono font-extrabold text-sprout bg-sprout-tint px-2.5 py-1 rounded-sm border border-sprout/40">
                  +{spMarkupPercent.toFixed(1)}% Markup → ₹{currentSpKg.toFixed(2)}/kg
                </span>
              </div>

              {/* Slider Input Capped at 5.0% Max */}
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.1"
                  value={spMarkupPercent}
                  onChange={(e) => setSpMarkupPercent(parseFloat(e.target.value) || 0)}
                  className="w-full accent-sprout cursor-pointer"
                />
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={spMarkupPercent}
                  onChange={(e) => {
                    const val = Math.min(5.0, Math.max(0.0, parseFloat(e.target.value) || 0));
                    setSpMarkupPercent(val);
                  }}
                  className="w-16 p-1 text-center bg-field-surface border border-loam rounded-sm text-xs font-mono font-extrabold text-loam focus:outline-none focus:ring-1 focus:ring-sprout"
                />
                <span className="text-xs font-bold text-loam">%</span>
              </div>

              {/* Status Message */}
              {spSaveMessage && (
                <div className={`p-2 rounded-sm text-xs font-mono font-bold border ${
                  spSaveMessage.type === 'success' ? 'bg-emerald-100 border-emerald-400 text-emerald-900' : 'bg-red-100 border-red-400 text-red-900'
                }`}>
                  {spSaveMessage.text}
                </div>
              )}

              {/* Save to DB Button */}
              <div className="flex items-center justify-between pt-1 border-t border-loam/20">
                <p className="text-[11px] text-loam-muted">
                  Save custom price adjustment to backend database records for {crop}.
                </p>

                <button
                  type="button"
                  onClick={handleSaveSpToDb}
                  disabled={savingSp}
                  className="py-2 px-3.5 bg-sprout hover:bg-sprout-hover text-field-bg border-2 border-loam rounded-sm text-xs font-mono font-extrabold shadow-sharp-sm flex items-center gap-1.5 transition active:translate-y-0.5"
                >
                  <Save className="w-3.5 h-3.5 text-field-bg" />
                  <span>{savingSp ? 'Saving to DB...' : 'Save Price Adjustment to DB'}</span>
                </button>
              </div>

            </div>

            {/* Direct Deposit to Central Warehouse */}
            {analysisData.has_surplus && (
              <div className="pt-2 flex flex-col sm:flex-row items-end sm:items-center justify-between gap-2 border-t border-loam/20">
                <p className="text-[11px] text-loam-muted italic">
                  * Crop surplus will only be stored in warehouse DB when you explicitly click the button below.
                </p>
                <button
                  type="button"
                  onClick={onSelectWarehouseSection}
                  className="py-2.5 px-4 bg-loam hover:bg-loam-muted text-field-bg border-2 border-loam rounded-sm text-xs font-extrabold shadow-sharp flex items-center gap-2 transition shrink-0"
                >
                  <Warehouse className="w-4 h-4 text-sprout" />
                  <span>Deposit Produce into Central Warehouse (W001)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}

