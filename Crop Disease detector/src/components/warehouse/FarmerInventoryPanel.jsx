// frontend/src/components/warehouse/FarmerInventoryPanel.jsx
import React, { useState } from 'react';
import { Warehouse, DollarSign, MinusCircle, History, Calendar, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function FarmerInventoryPanel({
  inventoryItems = [],
  onWithdrawProduce,
  withdrawing
}) {
  const [activeModal, setActiveModal] = useState(null); // { item }
  const [actionQuantityKg, setActionQuantityKg] = useState(100);
  const [historyDrawerItem, setHistoryDrawerItem] = useState(null);

  // Consolidate items by crop so that each crop always renders in one single tile
  const consolidatedMap = new Map();
  (inventoryItems || []).forEach((item) => {
    if (!item || item.quantity_kg <= 0 || item.status === 'FULLY_SOLD' || item.status === 'WITHDRAWN' || item.status === 'MERGED') return;
    const cropKey = (item.crop || '').trim().toLowerCase();
    if (!consolidatedMap.has(cropKey)) {
      consolidatedMap.set(cropKey, { ...item });
    } else {
      const existing = consolidatedMap.get(cropKey);
      existing.quantity_kg = Math.round((existing.quantity_kg + item.quantity_kg) * 100) / 100;
      existing.quantity_ton = Math.round((existing.quantity_kg / 1000) * 1000) / 1000;
      existing.accumulated_storage_cost = Math.round(((existing.accumulated_storage_cost || 0) + (item.accumulated_storage_cost || 0)) * 100) / 100;
      existing.estimated_future_net_value = Math.round(((existing.estimated_future_net_value || 0) + (item.estimated_future_net_value || 0)) * 100) / 100;
      if (item.transactions && Array.isArray(item.transactions)) {
        existing.transactions = [...(existing.transactions || []), ...item.transactions];
      }
    }
  });

  const consolidatedItems = Array.from(consolidatedMap.values());

  if (!inventoryItems || inventoryItems.length === 0 || consolidatedItems.length === 0) {
    return (
      <div className="bg-field-surface border-2 border-loam rounded-sm p-6 text-center font-mono space-y-3 shadow-sharp">
        <Warehouse className="w-10 h-10 text-loam-muted mx-auto" />
        <h3 className="font-serif text-lg font-extrabold text-loam">No Produce Currently Stored</h3>
        <p className="text-xs text-loam-muted max-w-sm mx-auto">
          All stored produce has been withdrawn or sold. Analyze harvest surplus and deposit produce to view stored inventory here.
        </p>
      </div>
    );
  }

  const handleExecuteAction = () => {
    if (!activeModal || !activeModal.item) return;
    const qty = Number(actionQuantityKg);
    onWithdrawProduce(activeModal.item.inventory_id, qty);
    setActiveModal(null);
  };

  return (
    <div className="bg-field-surface border-2 border-loam rounded-sm p-4 sm:p-5 shadow-sharp space-y-4 font-mono text-loam">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-loam pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-sprout-tint border border-sprout/40 rounded-sm text-sprout">
              <Warehouse className="w-4 h-4" />
            </span>
            <h2 className="font-serif text-lg font-extrabold text-loam">
              MY STORED PRODUCE INVENTORY
            </h2>
          </div>
          <p className="text-xs text-loam-muted mt-0.5">
            Live valuation, accumulated storage costs & withdrawal management
          </p>
        </div>

        <span className="text-xs font-mono font-extrabold bg-sprout-tint text-sprout border border-sprout/40 px-2.5 py-1 rounded-sm">
          {consolidatedItems.length} active crop tile{consolidatedItems.length === 1 ? '' : 's'}
        </span>
      </div>

      {/* Stored Inventory Cards List */}
      <div className="space-y-4">
        {consolidatedItems.map((item) => {
          return (
            <div
              key={item.inventory_id}
              className="p-4 bg-field-bg border-2 border-loam rounded-sm space-y-3 transition-all shadow-sharp-sm hover:border-loam"
            >
              {/* Top Row: Crop Name, Quantity & Status Badge */}
              <div className="flex items-start justify-between gap-2 border-b border-loam/20 pb-2.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-base font-extrabold text-loam">
                      {item.crop}
                    </span>
                    <span className="text-xs font-bold text-loam-muted bg-field-surface border border-loam/30 px-2 py-0.5 rounded-sm">
                      {item.quantity_kg} kg / {Number(item.quantity_ton || 0).toFixed(2)} ton
                    </span>
                  </div>
                  <p className="text-[11px] text-loam-muted mt-0.5 flex items-center gap-1">
                    <Warehouse className="w-3 h-3 text-sprout" />
                    {item.warehouse_name} &nbsp;•&nbsp; Stored: {item.storage_date}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded border uppercase tracking-wider ${
                    item.status === 'STORED'
                      ? 'bg-sprout-tint text-sprout border-sprout/40'
                      : item.status === 'PARTIAL_SOLD'
                      ? 'bg-amber-100 text-amber-950 border-amber-400'
                      : 'bg-field-surface text-loam-muted border-loam/30'
                  }`}>
                    {item.status}
                  </span>

                  <button
                    type="button"
                    onClick={() => setHistoryDrawerItem(item)}
                    className="p-1.5 bg-field-surface hover:bg-sprout-tint border border-loam/40 text-loam rounded-sm transition"
                    title="View Transaction Log"
                  >
                    <History className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Middle Financial Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs border-b border-loam/15 pb-2.5">
                <div>
                  <span className="text-[9px] uppercase text-loam-muted block font-bold">Current Price</span>
                  <span className="font-extrabold text-loam">₹{Number(item.current_price_per_kg || 0).toFixed(2)}/kg</span>
                  <span className="text-[9px] text-loam-muted block">₹{item.current_price_per_ton?.toLocaleString()}/t</span>
                </div>

                <div>
                  <span className="text-[9px] uppercase text-loam-muted block font-bold">Predicted Target Price</span>
                  <span className="font-extrabold text-sprout">₹{Number(item.predicted_price_per_kg || 0).toFixed(2)}/kg</span>
                  <span className="text-[9px] text-sprout block">₹{item.predicted_price_per_ton?.toLocaleString()}/t</span>
                </div>

                <div>
                  <span className="text-[9px] uppercase text-loam-muted block font-bold">Storage Cost Acc.</span>
                  <span className="font-extrabold text-amber-900">₹{item.accumulated_storage_cost?.toLocaleString()}</span>
                  <span className="text-[9px] text-amber-800 block">₹{item.storage_cost_per_ton_per_day}/t/d ({item.days_stored}d)</span>
                </div>

                <div>
                  <span className="text-[9px] uppercase text-loam-muted block font-bold">Est. Future Net Value</span>
                  <span className="font-extrabold text-emerald-800">₹{item.estimated_future_net_value?.toLocaleString()}</span>
                  <span className="text-[9px] text-emerald-700 block">Rec Sell: {item.planned_sell_date}</span>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveModal({ item });
                    setActionQuantityKg(item.quantity_kg);
                  }}
                  className="py-1.5 px-3.5 bg-field-surface hover:bg-amber-100 text-loam border-2 border-loam rounded-sm text-xs font-extrabold shadow-sharp-sm flex items-center gap-1.5 transition"
                >
                  <MinusCircle className="w-4 h-4 text-amber-700" />
                  <span>Withdraw Produce</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* ── MODAL: Produce Withdrawal ── */}
      {activeModal && activeModal.item && (
        <div className="fixed inset-0 z-50 bg-loam/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-field-surface border-2 border-loam rounded-sm p-5 max-w-md w-full shadow-sharp space-y-4 font-mono">
            
            <div className="flex items-center justify-between border-b-2 border-loam pb-3">
              <h3 className="font-serif text-base font-extrabold text-loam flex items-center gap-2">
                <MinusCircle className="w-4 h-4 text-amber-700" />
                <span>Withdraw Stored Produce — {activeModal.item.crop}</span>
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-xs font-bold text-loam-muted hover:text-loam"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-field-bg border border-loam/30 rounded-sm text-xs space-y-1">
              <div className="flex justify-between font-bold text-loam">
                <span>Stored Available:</span>
                <span>{activeModal.item.quantity_kg} kg ({activeModal.item.quantity_ton} ton)</span>
              </div>
              <div className="flex justify-between text-loam-muted">
                <span>Warehouse:</span>
                <span>{activeModal.item.warehouse_name}</span>
              </div>
              <div className="flex justify-between text-loam-muted">
                <span>Current Market Price:</span>
                <span>₹{activeModal.item.current_price_per_kg}/kg</span>
              </div>
            </div>

            {/* Quick Preset Buttons & Overall Withdraw Option */}
            <div className="p-2 bg-amber-50 border border-amber-300 rounded-sm space-y-1.5">
              <span className="text-[10px] font-bold uppercase text-amber-900 block">
                Withdrawal Presets:
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setActionQuantityKg(Math.max(1, Math.round(activeModal.item.quantity_kg * 0.25)))}
                  className="px-2.5 py-1 text-[11px] font-bold bg-field-surface hover:bg-amber-100 border border-loam/30 rounded text-loam"
                >
                  25%
                </button>
                <button
                  type="button"
                  onClick={() => setActionQuantityKg(Math.max(1, Math.round(activeModal.item.quantity_kg * 0.50)))}
                  className="px-2.5 py-1 text-[11px] font-bold bg-field-surface hover:bg-amber-100 border border-loam/30 rounded text-loam"
                >
                  50%
                </button>
                <button
                  type="button"
                  onClick={() => setActionQuantityKg(activeModal.item.quantity_kg)}
                  className="px-3 py-1 text-[11px] font-extrabold bg-amber-800 text-amber-50 border border-amber-950 rounded shadow-sharp-sm hover:bg-amber-900 flex items-center gap-1"
                >
                  <MinusCircle className="w-3 h-3 text-amber-300" />
                  <span>Overall / 100% Withdraw ({activeModal.item.quantity_kg} kg)</span>
                </button>
              </div>
            </div>

            {/* Quantity Slider / Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <label className="uppercase text-loam-muted">
                  Quantity to Withdraw (kg)
                </label>
                <span className="text-sprout font-extrabold">
                  {(Number(actionQuantityKg) / 1000).toFixed(2)} tons
                </span>
              </div>

              <input
                type="number"
                min="1"
                max={activeModal.item.quantity_kg}
                value={actionQuantityKg}
                onChange={(e) => setActionQuantityKg(Math.min(activeModal.item.quantity_kg, Math.max(1, parseFloat(e.target.value) || 0)))}
                className="w-full p-2 bg-field-bg border-2 border-loam rounded-sm text-sm font-extrabold text-loam focus:outline-none focus:ring-2 focus:ring-sprout"
              />

              <input
                type="range"
                min="1"
                max={activeModal.item.quantity_kg}
                step="10"
                value={actionQuantityKg}
                onChange={(e) => setActionQuantityKg(parseFloat(e.target.value))}
                className="w-full accent-sprout cursor-pointer"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-loam/20">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="py-2 px-3 bg-field-bg hover:bg-sprout-tint border border-loam rounded-sm text-xs font-bold text-loam"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={withdrawing}
                onClick={() => {
                  onWithdrawProduce(activeModal.item.inventory_id, activeModal.item.quantity_kg);
                  setActiveModal(null);
                }}
                className="py-2 px-3 bg-amber-800 hover:bg-amber-900 text-amber-50 border-2 border-amber-950 rounded-sm text-xs font-extrabold shadow-sharp-sm flex items-center gap-1"
              >
                <MinusCircle className="w-3.5 h-3.5" />
                <span>Overall / Full Withdraw (100%)</span>
              </button>

              <button
                type="button"
                disabled={withdrawing}
                onClick={handleExecuteAction}
                className="py-2 px-4 bg-sprout hover:bg-sprout-hover text-field-bg border-2 border-loam rounded-sm text-xs font-extrabold shadow-sharp-sm flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Withdrawal</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── DRAWER: Transaction Logs ── */}
      {historyDrawerItem && (
        <div className="fixed inset-0 z-50 bg-loam/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-field-surface border-2 border-loam rounded-sm p-5 max-w-lg w-full shadow-sharp space-y-4 font-mono">
            
            <div className="flex items-center justify-between border-b-2 border-loam pb-3">
              <h3 className="font-serif text-base font-extrabold text-loam flex items-center gap-2">
                <History className="w-4 h-4 text-sprout" />
                <span>Transaction History — {historyDrawerItem.crop} ({historyDrawerItem.inventory_id})</span>
              </h3>
              <button
                type="button"
                onClick={() => setHistoryDrawerItem(null)}
                className="text-xs font-bold text-loam-muted hover:text-loam"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {historyDrawerItem.transactions?.map((t) => (
                <div key={t.transaction_id} className="p-2.5 bg-field-bg border border-loam/30 rounded-sm text-xs space-y-1">
                  <div className="flex justify-between font-extrabold text-loam">
                    <span className="uppercase text-sprout">{t.transaction_type}</span>
                    <span>₹{t.amount?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-loam-muted">
                    <span>Quantity: {t.quantity_kg} kg ({(t.quantity_kg/1000).toFixed(2)}t)</span>
                    <span>@ ₹{t.price_per_kg}/kg</span>
                  </div>
                  <span className="text-[9px] text-loam-muted block border-t border-loam/10 pt-0.5">
                    Timestamp: {t.timestamp}
                  </span>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
