// frontend/src/components/warehouse/PriceTrendBarChart.jsx
import React, { useState } from 'react';
import { TrendingUp, Calendar, Info, CheckCircle, AlertCircle } from 'lucide-react';

export default function PriceTrendBarChart({ pricePoints = [], recommendedDayOffset = 3, storageCostPerTonDay = 500, surplusTon = 0.3 }) {
  const [activePoint, setActivePoint] = useState(null);

  if (!pricePoints || pricePoints.length === 0) {
    return (
      <div className="p-6 bg-field-surface border-2 border-loam rounded-sm text-center font-mono text-xs text-loam-muted">
        No price trend data available.
      </div>
    );
  }

  const prices = pricePoints.map((p) => p.price_per_kg);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = Math.max(1, maxPrice - minPrice);

  const todayPoint = pricePoints.find((p) => p.day_label === 'Today') || pricePoints[5];
  const todayPrice = todayPoint?.price_per_kg || 25.0;

  return (
    <div className="bg-field-surface border-2 border-loam rounded-sm p-4 sm:p-5 shadow-sharp space-y-4 font-mono text-loam">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b-2 border-loam pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 bg-sprout-tint border border-sprout/40 rounded-sm text-sprout">
              <TrendingUp className="w-4 h-4" />
            </span>
            <h3 className="font-serif text-lg font-extrabold text-loam">
              9-Day Price Trend Bar Chart
            </h3>
          </div>
          <p className="text-xs text-loam-muted mt-0.5">
            5 Historical Days + Today (Actual) &nbsp;•&nbsp; Next 3 Days (AI Predictions)
          </p>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-bold">
          <span className="flex items-center gap-1.5 px-2 py-0.5 bg-loam text-field-bg rounded-sm border border-loam">
            <span className="w-2 h-2 rounded-full bg-field-bg"></span>
            Actual Prices
          </span>
          <span className="flex items-center gap-1.5 px-2 py-0.5 bg-sprout-tint text-sprout rounded-sm border border-sprout/50">
            <span className="w-2 h-2 rounded-full bg-sprout animate-pulse"></span>
            Predicted (Estimates)
          </span>
        </div>
      </div>

      {/* Bar Graph Canvas Container */}
      <div className="pt-4 pb-2 px-2 border border-loam/20 bg-field-bg rounded-sm relative">
        
        {/* Y-Axis Price Bounds Guide */}
        <div className="flex justify-between items-center text-[10px] text-loam-muted font-bold mb-3 border-b border-loam/10 pb-1">
          <span>Max: ₹{maxPrice.toFixed(1)}/kg (₹{(maxPrice * 1000).toLocaleString()}/t)</span>
          <span>Min: ₹{minPrice.toFixed(1)}/kg (₹{(minPrice * 1000).toLocaleString()}/t)</span>
        </div>

        {/* 9 Bars Container Grid */}
        <div className="grid grid-cols-9 gap-1.5 sm:gap-2.5 items-end h-48 pt-6">
          {pricePoints.map((pt, idx) => {
            const isPredicted = pt.is_predicted;
            const isToday = pt.day_label === 'Today';
            const dayOffset = idx - 5; // -5 to +3
            const isRecommended = isPredicted && dayOffset === recommendedDayOffset;
            const heightPercent = Math.max(18, ((pt.price_per_kg - minPrice * 0.7) / (maxPrice - minPrice * 0.7)) * 100);

            // Storage cost deduction overlay for predicted days
            const storageCostForDays = isPredicted ? surplusTon * dayOffset * storageCostPerTonDay : 0;
            const storageCostPerKg = isPredicted ? storageCostForDays / Math.max(1, surplusTon * 1000) : 0;
            const netPricePerKg = isPredicted ? Math.max(0, pt.price_per_kg - storageCostPerKg) : pt.price_per_kg;

            const isHovered = activePoint?.date === pt.date;

            return (
              <div
                key={pt.date}
                onMouseEnter={() => setActivePoint({ ...pt, storageCostForDays, netPricePerKg, dayOffset })}
                onMouseLeave={() => setActivePoint(null)}
                className="flex flex-col items-center group relative cursor-pointer h-full justify-end"
              >
                {/* Top Badge Tag */}
                <div className="mb-1 transition-transform group-hover:-translate-y-1">
                  {isRecommended ? (
                    <span className="text-[9px] font-extrabold bg-amber-400 text-loam border border-loam px-1 py-0.2 rounded-sm shadow-sharp-sm whitespace-nowrap animate-bounce">
                      ★ BEST
                    </span>
                  ) : isToday ? (
                    <span className="text-[9px] font-bold bg-loam text-field-bg px-1 py-0.2 rounded-sm">
                      TODAY
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold text-loam-muted opacity-80">
                      ₹{pt.price_per_kg.toFixed(0)}
                    </span>
                  )}
                </div>

                {/* Main Bar */}
                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full rounded-t-sm transition-all duration-300 relative ${
                    isRecommended
                      ? 'bg-sprout border-2 border-loam shadow-sharp-sm'
                      : isPredicted
                      ? 'bg-sprout-tint border-2 border-dashed border-sprout hover:bg-sprout/30'
                      : isToday
                      ? 'bg-loam border-2 border-loam'
                      : 'bg-loam/70 hover:bg-loam border border-loam/40'
                  }`}
                >
                  {/* Internal Price Label inside Bar */}
                  <div className="absolute inset-x-0 bottom-1 flex items-center justify-center text-[10px] font-extrabold text-field-bg opacity-90">
                    ₹{pt.price_per_kg.toFixed(0)}
                  </div>
                </div>

                {/* Date / Day Label under Bar */}
                <div className="mt-2 text-center">
                  <span className={`block text-[10px] font-mono leading-none ${isToday || isRecommended ? 'font-extrabold text-loam' : 'text-loam-muted'}`}>
                    {pt.day_label}
                  </span>
                  <span className="block text-[8px] text-loam-muted mt-0.5">
                    {pt.date.slice(5)}
                  </span>
                </div>

              </div>
            );
          })}
        </div>

      </div>

      {/* Active Bar Hover Details / Explanation Card */}
      {activePoint ? (
        <div className="p-3 bg-sprout-tint/60 border-2 border-sprout rounded-sm text-xs font-mono space-y-1">
          <div className="flex items-center justify-between border-b border-sprout/40 pb-1">
            <span className="font-extrabold text-sprout flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {activePoint.day_label} ({activePoint.date}) &nbsp;•&nbsp; {activePoint.type}
            </span>
            <span className="font-bold text-loam">
              ₹{activePoint.price_per_kg.toFixed(2)}/kg &nbsp;(₹{activePoint.price_per_ton.toLocaleString()}/ton)
            </span>
          </div>

          {activePoint.is_predicted ? (
            <p className="text-[11px] text-loam leading-tight pt-1">
              <strong>Storage Cost Impact:</strong> Storing {surplusTon}t for {activePoint.dayOffset} day(s) costs ₹{activePoint.storageCostForDays.toFixed(2)} (₹{activePoint.storageCostPerKg?.toFixed(2)}/kg deduction). Net Effective Realization = <strong>₹{activePoint.netPricePerKg?.toFixed(2)}/kg</strong>.
            </p>
          ) : (
            <p className="text-[11px] text-loam-muted leading-tight pt-1">
              Verified market price record for {activePoint.date}.
            </p>
          )}
        </div>
      ) : (
        <div className="p-2.5 bg-field-bg border border-loam/20 rounded-sm text-[11px] font-mono text-loam-muted flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-sprout shrink-0" />
          <span>Hover or tap any bar on the graph to inspect exact daily prices, per-ton rates, and net storage costs.</span>
        </div>
      )}

    </div>
  );
}
