import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, RefreshCw, Plus, Minus, Warehouse, TrendingUp, DollarSign, Truck, X, CheckCircle2, ArrowRight, PackageCheck } from 'lucide-react';
import { storeProduce } from '../../services/warehouseApi';
import { useAgriContext } from '../../context/AgriContext';

const CROPS = ['Wheat', 'Rice', 'Onion', 'Maize'];

const CROP_META = {
  Wheat:  { emoji: '🌾', color: '#7A6030', paleBg: '#FBF5E0', borderColor: '#2c3e2e' },
  Onion:  { emoji: '🧅', color: '#8B3A3A', paleBg: '#FAE8E8', borderColor: '#2c3e2e' },
  Rice:   { emoji: '🍚', color: '#3A6347', paleBg: '#E8F4EC', borderColor: '#2c3e2e' },
  Maize:  { emoji: '🌽', color: '#9A6B1F', paleBg: '#FEF9E7', borderColor: '#2c3e2e' },
};

const WAREHOUSES_LIST = [
  { id: 'W001', name: 'Azadpur Mandi Hub', location: 'Delhi', rate: 15, type: 'Cold & Dry Storage' },
  { id: 'W002', name: 'Sahibabad Cold Vault', location: 'Ghaziabad', rate: 22, type: 'Cold Storage (Veggies & Fruits)' },
  { id: 'W003', name: 'Gurgaon Logistics & Grain Hub', location: 'Gurugram', rate: 18, type: 'Grain Elevator & Silo' },
  { id: 'W004', name: 'Noida Agri Storage Facility', location: 'Noida', rate: 12, type: 'Covered Dry Grain' },
  { id: 'W005', name: 'Kundli Multi-Crop Cold Chain', location: 'Sonipat', rate: 25, type: 'Controlled Atmosphere' },
];

export default function DemandPanel({
  crop, setCrop, date, setDate,
  availableSupply, setAvailableSupply,
  priceMarkup, setPriceMarkup,
  costPerTon = 25000, setCostPerTon = () => {},
  transportRatePerKm = 60, setTransportRatePerKm = () => {},
  demands = {}, rawDemands = {}, predictedPrices = {},
  vehicleCapacities = [20000, 22000, 25000, 28000, 30000],
  onDemandChange, onFetchForecast,
  onMasterOptimize,
  loadingForecast, optimizing, locations = [],
  masterResult = null,
}) {
  const navigate = useNavigate();
  const { currentFarmer } = useAgriContext();
  const activeFarmerId = currentFarmer?.id || 'F001';
  const [unitMode, setUnitMode] = useState('tons');
  const [storeInWarehouse, setStoreInWarehouse] = useState(true);

  // Warehouse Modal States
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [storeCategory, setStoreCategory] = useState('Grains');
  const [storeCropName, setStoreCropName] = useState(crop || 'Wheat');
  const [depositQtyTons, setDepositQtyTons] = useState(0);
  const [targetWarehouseId, setTargetWarehouseId] = useState('W001');
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositStatus, setDepositStatus] = useState(null);

  // Helper to format values up to 2 decimal places in tons mode
  const formatVal = (kgVal, mode) => {
    if (kgVal === '' || kgVal === null || kgVal === undefined) return '';
    const num = mode === 'tons' ? Number(kgVal) / 1000 : Number(kgVal);
    if (isNaN(num)) return '';
    return mode === 'tons' ? (Math.round(num * 100) / 100).toFixed(2) : num.toString();
  };

  // Local text input states for fluid typing without state snapping
  const [supplyText, setSupplyText] = useState(() => formatVal(availableSupply, unitMode));
  const [demandTexts, setDemandTexts] = useState({});

  // Sync supplyText when availableSupply or unitMode changes externally
  useEffect(() => {
    setSupplyText(formatVal(availableSupply, unitMode));
  }, [availableSupply, unitMode]);

  // Sync demandTexts when demands or unitMode changes externally
  useEffect(() => {
    const newTexts = {};
    Object.keys(demands).forEach((locName) => {
      newTexts[locName] = formatVal(demands[locName], unitMode);
    });
    setDemandTexts(newTexts);
  }, [demands, unitMode]);

  const totalDemandKg = Object.entries(demands)
    .filter(([locName]) => locName !== 'Delhi')
    .reduce((acc, [, v]) => acc + (Number(v) || 0), 0);
  const totalSupplyKg = Number(availableSupply || 0);
  const allocatedKg = masterResult?.summary?.total_load_kg || Math.min(totalSupplyKg, totalDemandKg);
  const surplusKg = Math.max(0, totalSupplyKg - allocatedKg);

  // Direct Deposit to Single Central Warehouse (W001)
  const handleDirectDepositToCentralWarehouse = async () => {
    const qtyKg = surplusKg > 0 ? surplusKg : totalSupplyKg;
    if (qtyKg <= 0) {
      setDepositStatus({ type: 'error', text: 'No supply available to deposit.' });
      return;
    }
    setDepositLoading(true);
    setDepositStatus(null);
    try {
      const payload = {
        farmer_id: activeFarmerId,
        warehouse_id: 'W001', // Agri-Mitra Central Warehouse (Single designated storehouse)
        crop: crop,
        quantity_kg: qtyKg,
        planned_sell_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
      };
      await storeProduce(payload);
      setDepositStatus({
        type: 'success',
        text: `✅ ${(qtyKg / 1000).toFixed(2)} tons of ${crop} deposited into Agri-Mitra Central Warehouse for ${currentFarmer?.name || 'Farmer'} (${activeFarmerId})!`
      });
    } catch (err) {
      setDepositStatus({ type: 'error', text: `Deposit error: ${err.message}` });
    } finally {
      setDepositLoading(false);
    }
  };

  // Jump to Smart Warehouse module
  const handleNavigateToWarehouse = () => {
    navigate('/warehouse', {
      state: {
        crop: crop,
        supplyKg: availableSupply,
        demandKg: totalDemandKg,
        surplusKg: surplusKg
      }
    });
  };

  // Handlers for Total Supply Input
  const handleSupplyChange = (e) => {
    const val = e.target.value;
    setSupplyText(val);

    if (val === '') {
      setAvailableSupply(0);
      return;
    }

    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) {
      const kgVal = unitMode === 'tons' ? Math.round(num * 1000) : Math.round(num);
      setAvailableSupply(kgVal);
    }
  };

  const handleSupplyBlur = () => {
    setSupplyText(formatVal(availableSupply, unitMode));
  };

  // Handlers for City Demand Inputs
  const handleDemandInputChange = (locName, val) => {
    setDemandTexts((prev) => ({ ...prev, [locName]: val }));

    if (val === '') {
      onDemandChange(locName, 0);
      return;
    }

    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) {
      const kgVal = unitMode === 'tons' ? Math.round(num * 1000) : Math.round(num);
      onDemandChange(locName, kgVal);
    }
  };

  const handleDemandInputBlur = (locName) => {
    setDemandTexts((prev) => ({
      ...prev,
      [locName]: formatVal(demands[locName], unitMode)
    }));
  };

  const step = (locName, dir) => {
    const stepVal = unitMode === 'tons' ? 1000 : 500;
    const current = demands[locName] || 0;
    const nextVal = Math.max(0, current + dir * stepVal);
    onDemandChange(locName, nextVal);
    setDemandTexts((prev) => ({
      ...prev,
      [locName]: formatVal(nextVal, unitMode)
    }));
  };

  return (
    <div className="space-y-6 font-mono text-loam">

      {/* ── CARD 1: Farmer Harvest Supply & Economic Inputs ── */}
      <div className="bg-field-surface border-2 border-loam rounded-sm p-4 sm:p-5 shadow-sharp space-y-4">
        
        {/* Header & Unit Switcher */}
        <div className="flex items-center justify-between border-b-2 border-loam pb-3">
          <h2 className="font-serif text-lg font-extrabold text-loam">
            Farmer Supply & Market Inputs
          </h2>
          
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

        {/* 1. Crop Selection Pills & Date Picker */}
        <div className="space-y-2">
          <span className="text-xs font-mono font-bold uppercase text-loam-muted block">
            Selected Crop & Prediction Date
          </span>
          <div className="grid grid-cols-4 gap-2">
            {CROPS.map((c) => {
              const cm = CROP_META[c];
              const sel = c === crop;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCrop(c)}
                  className={`flex flex-col items-center justify-center p-2 rounded-sm border-2 font-mono transition-all ${
                    sel
                      ? 'border-loam bg-sprout-tint font-extrabold shadow-sharp-sm text-sprout'
                      : 'border-loam/30 bg-field-surface hover:border-loam text-loam'
                  }`}
                >
                  <span className="text-lg mb-0.5">{cm.emoji}</span>
                  <span className="text-xs">{c}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-1">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2 bg-field-bg border-2 border-loam rounded-sm text-xs font-mono font-bold text-loam focus:outline-none focus:ring-2 focus:ring-sprout"
            />
          </div>
        </div>

        {/* 2. Total Supply Input */}
        <div className="border border-loam/40 p-2.5 rounded-sm bg-field-bg space-y-1">
          <label className="block text-[10px] font-mono font-bold uppercase text-loam-muted">
            Total Supply ({unitMode})
          </label>
          <input
            type="number"
            step={unitMode === 'tons' ? '1' : '500'}
            value={supplyText}
            onChange={handleSupplyChange}
            onBlur={handleSupplyBlur}
            className="w-full p-2 bg-field-surface border-2 border-loam rounded-sm text-xs font-mono font-extrabold text-sprout focus:outline-none focus:ring-2 focus:ring-sprout"
          />
        </div>

        {/* 3. Single Designated Central Warehouse Card */}
        <div className="p-3.5 bg-amber-50/80 border-2 border-amber-400 rounded-sm space-y-3 shadow-sharp-sm">
          <div className="flex items-center justify-between border-b border-amber-300 pb-2">
            <span className="text-xs font-extrabold text-amber-950 flex items-center gap-1.5">
              <Warehouse className="w-4 h-4 text-amber-700" />
              Designated Central Storehouse
            </span>
            <span className="text-xs font-extrabold text-amber-950 bg-amber-200/90 border border-amber-400 px-2 py-0.5 rounded-sm">
              {(surplusKg / 1000).toFixed(2)} tons surplus
            </span>
          </div>

          <p className="text-[11px] text-amber-900 leading-tight">
            {surplusKg > 0
              ? `⚠️ ${(surplusKg / 1000).toFixed(2)} tons of ${crop} exceeds regional buyer demand. Produce will NOT go to warehouse automatically—click below if you allow it to be stored in Agri-Mitra Central Warehouse (Azadpur, Delhi).`
              : `Store surplus harvest in Agri-Mitra Central Warehouse to avoid distress selling. (Action required via button below).`}
          </p>

          {depositStatus && (
            <div className={`p-2 rounded-sm text-xs font-mono font-bold border ${
              depositStatus.type === 'success' ? 'bg-emerald-100 border-emerald-400 text-emerald-900' : 'bg-red-100 border-red-400 text-red-900'
            }`}>
              {depositStatus.text}
            </div>
          )}

          {/* Single Direct Deposit Button */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={handleDirectDepositToCentralWarehouse}
              disabled={depositLoading}
              className="w-full py-2.5 px-3 bg-amber-700 hover:bg-amber-800 text-amber-50 rounded-sm text-xs font-mono font-extrabold border border-amber-900 shadow-sharp-sm flex items-center justify-center gap-1.5 transition active:translate-y-0.5"
            >
              <PackageCheck className="w-4 h-4" />
              <span>{depositLoading ? 'Depositing...' : 'Deposit Surplus in Central Warehouse'}</span>
            </button>

            <button
              type="button"
              onClick={handleNavigateToWarehouse}
              className="w-full py-2.5 px-3 bg-field-surface hover:bg-sprout-tint text-loam rounded-sm text-xs font-mono font-bold border-2 border-loam shadow-sharp-sm flex items-center justify-center gap-1.5 transition"
            >
              <span>Smart Warehouse Hub</span>
              <ArrowRight className="w-4 h-4 text-sprout" />
            </button>
          </div>
        </div>

        {/* 4. Selling Price Markup Slider */}
        <div className="border border-loam/40 p-3 rounded-sm bg-field-bg space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono font-bold uppercase text-loam-muted flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-sprout" />
              Selling Price Markup Slider
            </label>
            <span className="text-xs font-mono font-extrabold text-sprout bg-sprout-tint px-2 py-0.5 rounded-sm border border-sprout/40">
              +{priceMarkup.toFixed(1)}% Markup
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            step="0.5"
            value={priceMarkup}
            onChange={(e) => setPriceMarkup(parseFloat(e.target.value))}
            className="w-full accent-sprout cursor-pointer"
          />
        </div>

        {/* 5. Action Buttons Row: Fetch ML Forecast & Optimize Profit */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={onFetchForecast}
            disabled={loadingForecast}
            className="py-2.5 px-3 bg-field-bg hover:bg-sprout-tint border-2 border-loam text-loam rounded-sm text-xs font-mono font-bold shadow-sharp-sm flex items-center justify-center gap-2 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-sprout ${loadingForecast ? 'animate-spin' : ''}`} />
            <span>{loadingForecast ? 'Fetching Forecast...' : `Fetch ${crop} Forecast`}</span>
          </button>

          <button
            type="button"
            onClick={onMasterOptimize}
            disabled={optimizing || loadingForecast}
            className="py-2.5 px-3 bg-sprout hover:bg-sprout-hover text-field-bg border-2 border-loam rounded-sm text-xs font-mono font-bold shadow-sharp-sm flex items-center justify-center gap-2 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-field-bg" />
            <span>{optimizing ? 'Calculating...' : 'Optimize Profit'}</span>
          </button>
        </div>

      </div>

      {/* ── CARD 2: Regional Buyer Market Demands Table ── */}
      <div className="bg-field-surface border-2 border-loam rounded-sm p-4 sm:p-5 shadow-sharp space-y-4">
        
        {/* Header & Total Demand */}
        <div className="flex items-center justify-between border-b-2 border-loam pb-3">
          <h3 className="font-serif text-lg font-extrabold text-loam">
            Regional Buyer Market Demands
          </h3>
          <span className="text-xs font-mono font-bold text-sprout bg-sprout-tint border border-sprout/40 px-2 py-0.5 rounded-sm">
            Total: {(totalDemandKg / 1000).toFixed(2)} tons
          </span>
        </div>

        {/* City Demands Table Container */}
        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
          {locations.filter((l) => !l.is_depot).map((loc) => {
            const kgVal = demands[loc.name] || 0;
            const price = (predictedPrices[loc.name] || 50.0) * (1 + priceMarkup / 100);
            const routedKg = masterResult?.routes
              ? masterResult.routes.reduce((acc, r) => {
                  const idx = r.route_names?.indexOf(loc.name);
                  if (idx && idx > 0) return acc + Math.round(r.load_kg / (r.route_names.length - 2 || 1));
                  return acc;
                }, 0)
              : Math.min(kgVal, Math.round((availableSupply / Math.max(1, totalDemandKg)) * kgVal));
            const demandTextVal = demandTexts[loc.name] !== undefined ? demandTexts[loc.name] : formatVal(kgVal, unitMode);

            return (
              <div
                key={loc.name}
                className="p-3 bg-field-bg border-2 border-loam/40 rounded-sm hover:border-loam transition-all text-xs font-mono space-y-2"
              >
                {/* Top Row: City Name, Mkt Demand Badge & Market Price */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-loam text-sm">{loc.name}</span>
                    <span className="bg-emerald-100 text-emerald-900 text-[10px] font-extrabold px-2 py-0.5 rounded border border-emerald-300 whitespace-nowrap">
                      Mkt Demand
                    </span>
                  </div>
                  <div className="text-xs font-extrabold text-loam bg-field-surface border border-loam/30 px-2 py-0.5 rounded-sm whitespace-nowrap">
                    ₹{price.toFixed(2)}/kg
                  </div>
                </div>

                {/* Bottom Row: Direct Input & Routed Load Badge */}
                <div className="flex items-center justify-between pt-1.5 border-t border-loam/20">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-loam-muted font-bold uppercase">Demand:</span>
                    <input
                      type="number"
                      step={unitMode === 'tons' ? '0.01' : '100'}
                      value={demandTextVal}
                      onChange={(e) => handleDemandInputChange(loc.name, e.target.value)}
                      onBlur={() => handleDemandInputBlur(loc.name)}
                      className="w-24 p-1 px-2 bg-field-surface border border-loam rounded-sm text-xs font-mono font-extrabold text-loam focus:outline-none focus:ring-1 focus:ring-sprout"
                    />
                    <span className="text-[11px] font-bold text-loam-muted">{unitMode}</span>
                  </div>

                  <div className="text-[10px] font-extrabold text-sprout bg-sprout-tint px-2.5 py-1 rounded border border-sprout/40 whitespace-nowrap">
                    Routed: {(routedKg / 1000).toFixed(2)}t
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Optimization Action Buttons */}
        <div className="space-y-2 pt-2 border-t border-loam/20">
          <button
            type="button"
            onClick={onMasterOptimize}
            disabled={optimizing}
            className="w-full py-2.5 px-3 bg-field-bg hover:bg-sprout-tint border-2 border-loam text-loam rounded-sm text-xs font-mono font-bold shadow-sharp-sm flex items-center justify-center gap-2 transition"
          >
            <Truck className="w-4 h-4 text-loam" />
            <span>Optimize Vehicle Routes (CVRP)</span>
          </button>

          <button
            type="button"
            onClick={onMasterOptimize}
            disabled={optimizing}
            className="w-full py-3 px-4 bg-loam hover:bg-loam-muted text-field-bg rounded-sm text-xs font-mono font-extrabold shadow-sharp flex items-center justify-center gap-2 transition"
          >
            <Sparkles className="w-4 h-4 text-sprout" />
            <span>Full End-to-End Optimization</span>
          </button>
        </div>

      </div>

    </div>
  );
}


