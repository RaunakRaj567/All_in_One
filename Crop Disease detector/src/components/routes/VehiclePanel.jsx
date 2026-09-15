// frontend/src/components/routes/VehiclePanel.jsx
import React from 'react';
import { Truck, CheckCircle2, ShieldAlert } from 'lucide-react';
import { getVehicleColor } from './MapView';

export default function VehiclePanel({ vehicleCapacities = [], totalDemand = 0, routes = [] }) {
  const totalFleetCapacity = vehicleCapacities.reduce((a, b) => a + b, 0);
  const isCapacitySufficient = totalFleetCapacity >= totalDemand;
  const activeVehicleIds = new Set((routes || []).map((r) => r.vehicle_id));

  return (
    <div className="bg-field-surface border-2 border-loam rounded-sm p-4 sm:p-5 shadow-sharp space-y-4 font-mono text-loam">

      {/* Header Container */}
      <div className="flex items-center justify-between border-b-2 border-loam pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-sprout-tint border border-sprout/40 rounded-sm text-sprout">
            <Truck className="w-4 h-4" />
          </div>
          <h2 className="font-serif text-lg font-extrabold text-loam">
            Fleet Inventory
          </h2>
        </div>
        <span className="text-xs font-mono font-bold bg-field-bg border border-loam/40 px-2 py-0.5 rounded-sm">
          {vehicleCapacities.length} trucks
        </span>
      </div>

      {/* Capacity Alert Banner Container */}
      <div
        className={`p-3 border rounded-sm flex items-start gap-2.5 text-xs font-mono ${
          isCapacitySufficient
            ? 'bg-sprout-tint/60 border-sprout text-sprout font-bold'
            : 'bg-earth-amber/20 border-earth-amber text-loam font-bold'
        }`}
      >
        {isCapacitySufficient ? (
          <CheckCircle2 className="w-4 h-4 text-sprout shrink-0 mt-0.5" />
        ) : (
          <ShieldAlert className="w-4 h-4 text-earth-amber shrink-0 mt-0.5" />
        )}
        <div>
          <p className="font-bold text-xs">
            {isCapacitySufficient ? 'Fleet capacity sufficient' : 'Capacity alert — demand exceeds fleet!'}
          </p>
          <p className="text-[11px] opacity-90 mt-0.5">
            Fleet {(totalFleetCapacity / 1000).toFixed(0)}t &nbsp;|&nbsp; Demand {(totalDemand / 1000).toFixed(2)}t
          </p>
        </div>
      </div>

      {/* Vehicle Cards Grid Container */}
      <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
        {vehicleCapacities.map((cap, idx) => {
          const vehicleId = idx + 1;
          const isDeployed = activeVehicleIds.has(vehicleId);
          const color = getVehicleColor(vehicleId);
          const assignedRoute = (routes || []).find((r) => r.vehicle_id === vehicleId);
          const loadKg = assignedRoute?.load_kg || (vehicleId === 1 ? cap : 0);
          const isTruck1 = vehicleId === 1;

          return (
            <div
              key={idx}
              className={`flex items-center justify-between p-2.5 rounded-sm border transition-all ${
                isDeployed || isTruck1
                  ? 'bg-field-bg border-loam shadow-sharp-sm'
                  : 'bg-field-surface border-loam/20 opacity-60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  style={{ backgroundColor: (isDeployed || isTruck1) ? color : '#7D7162' }}
                  className="w-6 h-6 rounded-full text-white text-[11px] font-bold flex items-center justify-center shrink-0 border border-loam"
                >
                  {vehicleId}
                </span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-mono text-xs font-bold text-loam">
                      Truck {vehicleId}
                    </p>
                    {isTruck1 && (
                      <span className="text-[9px] font-mono font-extrabold text-emerald-800 bg-emerald-100 border border-emerald-400 px-1.5 py-0.2 rounded-sm">
                        Fully Operable
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-loam-muted">
                    {(cap / 1000).toFixed(0)}t cap · {cap.toLocaleString()} kg
                  </p>
                </div>
              </div>

              {(isDeployed || isTruck1) ? (
                <span
                  style={{ backgroundColor: `${color}20`, color: color, borderColor: `${color}60` }}
                  className="px-2 py-0.5 border text-[11px] font-mono font-bold rounded-sm"
                >
                  {(loadKg / 1000).toFixed(2)}t loaded
                </span>
              ) : (
                <span className="text-[10px] font-mono text-loam-muted bg-field-surface px-2 py-0.5 border border-loam/20 rounded-sm">
                  standby
                </span>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
