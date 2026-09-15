// frontend/src/components/warehouse/WarehouseSelector.jsx
import React from 'react';
import { Warehouse, MapPin, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function WarehouseSelector({
  warehouses = [],
  surplusKg = 300,
  crop = 'Onion',
  onStoreProduce,
  storing
}) {
  // Use primary central warehouse record (W001) or first available record
  const primaryWarehouse = warehouses.find(w => w.warehouse_id === 'W001') || warehouses[0] || {
    warehouse_id: 'W001',
    name: 'Agri-Mitra Central Warehouse & Cold Vault',
    address: 'Azadpur Mandi Complex, GT Karnal Rd, Delhi 110033',
    distance_km: 4.2,
    storage_type: 'Multi-Crop Cold & Dry Vault',
    storage_cost_per_ton_per_day: 15,
    available_capacity_ton: 350,
    est_daily_cost_for_surplus: Math.round((surplusKg / 1000) * 15),
    supported_crops: ['Onion', 'Wheat', 'Rice', 'Maize', 'Potato', 'Vegetables']
  };

  const surplusTon = (surplusKg / 1000).toFixed(2);

  return (
    <div className="bg-field-surface border-2 border-loam rounded-sm p-4 sm:p-5 shadow-sharp space-y-4 font-mono text-loam">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-loam pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-sprout-tint border border-sprout/40 rounded-sm text-sprout">
              <Warehouse className="w-4 h-4" />
            </span>
            <h3 className="font-serif text-lg font-extrabold text-loam">
              Designated Central Storehouse
            </h3>
          </div>
          <p className="text-xs text-loam-muted mt-0.5">
            Primary storage facility for surplus produce ({surplusKg} kg / {surplusTon} ton)
          </p>
        </div>

        <span className="text-xs font-mono font-bold bg-sprout-tint text-sprout border border-sprout/40 px-2.5 py-1 rounded-sm flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" /> Single Central Facility
        </span>
      </div>

      {/* Single Primary Warehouse Card */}
      <div className="p-4 bg-field-bg border-2 border-sprout rounded-sm space-y-3 shadow-sharp-sm ring-2 ring-sprout/40">
        
        {/* Top Info */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-base font-extrabold text-loam">
                {primaryWarehouse.name}
              </span>
              <span className="bg-sprout text-field-bg font-mono text-[10px] font-extrabold px-2 py-0.5 rounded-sm uppercase">
                Central Storehouse
              </span>
            </div>
            <p className="text-xs text-loam-muted flex items-center gap-1 mt-1">
              <MapPin className="w-3.5 h-3.5 text-loam" />
              {primaryWarehouse.address} ({primaryWarehouse.distance_km || 4.2} km from hub)
            </p>
          </div>

          <span className="text-xs font-bold px-2.5 py-1 bg-sprout-tint text-sprout border border-sprout/40 rounded-sm shrink-0">
            {primaryWarehouse.storage_type || 'Cold & Dry Vault'}
          </span>
        </div>

        {/* Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs border-t border-b border-loam/20 py-2.5 bg-field-surface p-2 rounded-sm">
          <div>
            <span className="text-[9px] uppercase text-loam-muted block font-bold">Storage Rate</span>
            <span className="font-extrabold text-loam">₹{primaryWarehouse.storage_cost_per_ton_per_day || 15}<span className="text-[10px] font-normal text-loam-muted">/ton/day</span></span>
          </div>

          <div>
            <span className="text-[9px] uppercase text-loam-muted block font-bold">Available Cap</span>
            <span className="font-extrabold text-sprout">{primaryWarehouse.available_capacity_ton || 350} <span className="text-[10px] font-normal text-loam-muted">tons</span></span>
          </div>

          <div>
            <span className="text-[9px] uppercase text-loam-muted block font-bold">Daily Cost</span>
            <span className="font-extrabold text-amber-900">₹{primaryWarehouse.est_daily_cost_for_surplus || Math.round((surplusKg / 1000) * 15)}<span className="text-[10px] font-normal text-amber-800">/day</span></span>
          </div>

          <div>
            <span className="text-[9px] uppercase text-loam-muted block font-bold">Status</span>
            <span className="font-extrabold text-emerald-700 uppercase">Operational</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold text-loam-muted">Supported:</span>
            {['Grains', 'Vegetables', 'Wheat', 'Rice', 'Onion', 'Maize'].map((c) => (
              <span key={c} className="text-[9px] bg-field-surface border border-loam/20 text-loam px-1.5 py-0.2 rounded-sm font-semibold">
                {c}
              </span>
            ))}
          </div>

          <button
            type="button"
            disabled={storing}
            onClick={() => onStoreProduce(primaryWarehouse.warehouse_id || 'W001')}
            className="py-2.5 px-4 bg-sprout hover:bg-sprout-hover text-field-bg border-2 border-loam rounded-sm text-xs font-mono font-extrabold shadow-sharp-sm flex items-center gap-2 transition"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{storing ? 'Depositing...' : 'Deposit Produce in Central Warehouse'}</span>
          </button>
        </div>

      </div>

    </div>
  );
}
