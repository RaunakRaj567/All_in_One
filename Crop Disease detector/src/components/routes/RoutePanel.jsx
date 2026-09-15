// frontend/src/components/routes/RoutePanel.jsx
import React from 'react';
import { Navigation, ArrowRight, Truck } from 'lucide-react';
import { getVehicleColor } from './MapView';

export default function RoutePanel({ optimizationResult, selectedVehicleId, onSelectVehicle }) {
  if (!optimizationResult) {
    return (
      <div className="bg-field-surface border-2 border-dashed border-loam/40 rounded-sm p-8 text-center font-mono space-y-3 shadow-sharp-sm">
        <div className="w-12 h-12 bg-sprout-tint text-sprout rounded-full flex items-center justify-center mx-auto">
          <Navigation className="w-6 h-6" />
        </div>
        <h3 className="font-serif text-lg font-bold text-loam">No Delivery Routes Calculated Yet</h3>
        <p className="text-xs text-loam-muted max-w-sm mx-auto">
          Run <strong>Run Master Optimizer</strong> or click <strong>Fetch ML Forecast</strong> to generate optimal distribution routes.
        </p>
      </div>
    );
  }

  const summary = optimizationResult.summary || optimizationResult.routing_summary || {};
  const routes = optimizationResult.routes || [];
  const totalDemandKg = summary.total_load_kg || summary.total_demand_kg || 0;
  const vehiclesUsed = summary.vehicles_used || routes.length || 0;
  const vehiclesAvailable = summary.vehicles_available || 5;

  const fmt = (mins = 0) => {
    const h = Math.floor(mins / 60);
    const m = Math.round(mins % 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <div className="space-y-6 font-mono text-loam">

      {/* ── CARD 1: Logistics & Fleet Summary ── */}
      <div className="bg-field-surface border-2 border-loam rounded-sm p-4 sm:p-5 shadow-sharp space-y-4">
        
        {/* Header Container */}
        <div className="flex items-center justify-between border-b-2 border-loam pb-3">
          <h3 className="font-serif text-lg font-extrabold text-loam">
            Logistics & Fleet Summary
          </h3>
          <span className="text-xs font-mono font-bold bg-sprout-tint text-sprout border border-sprout/40 px-2 py-0.5 rounded-sm">
            {vehiclesUsed} deployed · {Math.max(0, vehiclesAvailable - vehiclesUsed)} standby
          </span>
        </div>

        {/* 4 Metric Sub-cards Container Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Cargo Delivered', val: `${(totalDemandKg / 1000).toFixed(2)}`, unit: 'tons', sub: `${totalDemandKg.toLocaleString()} kg` },
            { label: 'Road Distance', val: `${summary.total_distance_km || 0}`, unit: 'km', sub: 'all routes combined' },
            { label: 'Delivery Time', val: fmt(summary.delivery_window_minutes || summary.max_duration_minutes || Math.round((summary.total_duration_minutes || 0) / Math.max(1, vehiclesUsed))), unit: '', sub: `${vehiclesUsed} trucks parallel (${fmt(summary.total_duration_minutes || 0)} total)` },
            { label: 'Fleet Usage', val: `${vehiclesUsed}/${vehiclesAvailable}`, unit: 'trucks', sub: `${summary.fleet_utilization_percent || ((vehiclesUsed / Math.max(1, vehiclesAvailable)) * 100).toFixed(0)}% utilization` },
          ].map(({ label, val, unit, sub }) => (
            <div
              key={label}
              className="p-3 bg-field-bg border border-loam/40 rounded-sm space-y-1 hover:border-loam transition-all"
            >
              <span className="text-[10px] font-mono font-bold uppercase text-loam-muted block">
                {label}
              </span>
              <p className="font-mono text-base font-extrabold text-loam leading-tight">
                {val} <span className="text-xs font-normal text-loam-muted">{unit}</span>
              </p>
              <span className="text-[10px] font-mono text-loam-muted block">
                {sub}
              </span>
            </div>
          ))}
        </div>

      </div>

      {/* ── CARD 2: Optimized Schedules ── */}
      <div className="bg-field-surface border-2 border-loam rounded-sm p-4 sm:p-5 shadow-sharp space-y-4">
        
        {/* Header Container */}
        <div className="flex items-center justify-between border-b-2 border-loam pb-3">
          <h3 className="font-serif text-lg font-extrabold text-loam">
            Optimized Schedules — {routes.length} active routes
          </h3>
          <span className="text-[11px] font-mono text-loam-muted">
            click to highlight on map
          </span>
        </div>

        {/* Truck Route Cards List Container */}
        <div className="space-y-3">
          {routes.map((route) => {
            const isSelected = selectedVehicleId === route.vehicle_id;
            const routeColor = getVehicleColor(route.vehicle_id);
            const capacityKg = route.vehicle_capacity_kg || route.capacity_kg || 20000;
            const loadKg = route.load_kg || 0;
            const utilization = route.utilization_percent || 0;
            const stopNames = route.route_names || route.route || ['Delhi', 'Delhi'];

            return (
              <div
                key={route.vehicle_id}
                onClick={() => onSelectVehicle(isSelected ? null : route.vehicle_id)}
                style={{ borderLeftColor: routeColor }}
                className={`p-3.5 bg-field-bg border-2 border-loam rounded-sm space-y-3 cursor-pointer transition-all hover:border-loam ${
                  isSelected ? 'border-l-4 bg-sprout-tint/40 shadow-sharp-sm' : 'border-l-4 border-loam/40'
                }`}
              >
                {/* Truck Header & Route Metrics */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      style={{ backgroundColor: routeColor }}
                      className="w-6 h-6 rounded-full text-white text-[11px] font-bold flex items-center justify-center shrink-0 border border-loam"
                    >
                      {route.vehicle_id}
                    </span>
                    <span className="font-serif text-sm font-bold text-loam">
                      Truck {route.vehicle_id} Schedule
                    </span>
                  </div>

                  <span className="font-mono text-xs font-bold text-sprout">
                    {route.distance_km} km &nbsp;|&nbsp; {fmt(route.duration_minutes)}
                  </span>
                </div>

                {/* Stop Sequence Pills Container */}
                <div className="flex items-center flex-wrap gap-1.5">
                  {stopNames.map((stop, idx) => (
                    <React.Fragment key={idx}>
                      <span
                        className={`text-xs font-mono px-2 py-0.5 rounded-sm border ${
                          idx === 0 || idx === stopNames.length - 1
                            ? 'bg-field-surface border-loam/40 text-loam-muted'
                            : 'bg-sprout-tint border-sprout/50 text-sprout font-bold'
                        }`}
                      >
                        {stop}
                      </span>
                      {idx < stopNames.length - 1 && (
                        <ArrowRight className="w-3 h-3 text-loam-muted" />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Capacity Progress Bar Container */}
                <div className="flex items-center gap-3 pt-1">
                  <div className="flex-1 h-2 bg-field-surface border border-loam/30 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${Math.min(100, utilization)}%`, backgroundColor: routeColor }}
                      className="h-full rounded-full transition-all duration-500"
                    />
                  </div>
                  <span className="text-[11px] font-mono font-bold text-loam min-w-[110px] text-right">
                    {(loadKg / 1000).toFixed(2)}t / {(capacityKg / 1000).toFixed(0)}t ({utilization}%)
                  </span>
                </div>

              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}
