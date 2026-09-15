import React, { useState } from 'react';
import { ShieldAlert, Leaf, FlaskConical, Calculator, Check, AlertOctagon, HelpCircle } from 'lucide-react';

export default function RemedyTabs({ result }) {
  const [activeTab, setActiveTab] = useState('organic'); // 'emergency' | 'organic' | 'chemical'
  const [tankSize, setTankSize] = useState(15); // Default 15L Knapsack Sprayer

  if (!result) return null;

  return (
    <div className="bg-field-surface border-3 border-loam rounded-md p-6 lg:p-8 my-6 shadow-sharp-lg">
      
      {/* Header & Tab Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-loam pb-4 mb-6">
        <div>
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-sprout block mb-1">
            Pathologist Treatment Plan
          </span>
          <h3 className="font-serif text-2xl font-bold text-loam">
            Recommended Remedies & Action Protocol
          </h3>
        </div>

        {/* Tactile Tab Selector */}
        <div className="flex flex-wrap items-center gap-1.5 bg-field-bg p-1 border-2 border-loam rounded-sm">
          <button
            onClick={() => setActiveTab('emergency')}
            className={`px-3 py-1.5 rounded-sm font-mono text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'emergency'
                ? 'bg-earth-red text-field-bg border border-loam shadow-sharp-sm'
                : 'text-loam hover:bg-field-card'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>Emergency Protocol</span>
          </button>

          <button
            onClick={() => setActiveTab('organic')}
            className={`px-3 py-1.5 rounded-sm font-mono text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'organic'
                ? 'bg-sprout text-field-bg border border-loam shadow-sharp-sm'
                : 'text-loam hover:bg-field-card'
            }`}
          >
            <Leaf className="w-3.5 h-3.5" />
            <span>Organic / Bio-Remedies</span>
          </button>

          {result.chemicalRemedies && result.chemicalRemedies.length > 0 && (
            <button
              onClick={() => setActiveTab('chemical')}
              className={`px-3 py-1.5 rounded-sm font-mono text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'chemical'
                  ? 'bg-soil text-field-bg border border-loam shadow-sharp-sm'
                  : 'text-loam hover:bg-field-card'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Chemical Options</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: EMERGENCY ACTION */}
      {activeTab === 'emergency' && (
        <div className="flex flex-col gap-4">
          <div className="bg-earth-red/10 border-2 border-earth-red p-4 rounded-sm">
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-earth-red uppercase mb-1">
              <ShieldAlert className="w-4 h-4" />
              Immediate Containment Actions (First 24 Hours)
            </div>
            <p className="font-mono text-xs text-loam leading-relaxed">
              Take these containment steps immediately to prevent pathogen spores from traveling across neighboring crop rows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            {result.emergencyAction?.map((action, idx) => (
              <div 
                key={idx}
                className="bg-field-bg border-2 border-loam p-4 rounded-sm flex flex-col justify-between shadow-sharp-sm"
              >
                <div className="flex items-center gap-2 mb-2 font-mono text-xs font-bold text-earth-red">
                  <span className="w-5 h-5 bg-earth-red text-field-bg rounded-sm flex items-center justify-center font-mono text-xs">
                    {idx + 1}
                  </span>
                  <span>Step 0{idx + 1}</span>
                </div>
                <p className="font-mono text-xs text-loam leading-relaxed">
                  {action}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: ORGANIC BIO-REMEDIES */}
      {activeTab === 'organic' && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {result.organicRemedies?.map((remedy, idx) => (
              <div 
                key={idx}
                className="bg-field-bg border-2 border-loam p-5 rounded-sm flex flex-col justify-between shadow-sharp"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-loam/30 pb-2 mb-3">
                    <span className="font-serif font-bold text-lg text-loam flex items-center gap-2">
                      <Leaf className="w-4 h-4 text-sprout" />
                      {remedy.name}
                    </span>
                    <span className="bg-sprout-tint text-sprout border border-sprout text-[10px] font-mono px-2 py-0.5 rounded-sm font-bold">
                      Eco Friendly
                    </span>
                  </div>

                  <div className="bg-field-card border border-loam/40 p-2.5 rounded-sm mb-3 font-mono text-xs">
                    <span className="text-loam-muted block text-[10px] uppercase font-bold">Preparation Ratio / Formula:</span>
                    <strong className="text-sprout font-bold text-sm">{remedy.formula}</strong>
                  </div>

                  <p className="font-mono text-xs text-loam leading-relaxed mb-3">
                    {remedy.instructions}
                  </p>
                </div>

                <div className="pt-3 border-t border-loam/20 flex items-center justify-between text-xs font-mono text-loam-muted">
                  <span>Spray Interval:</span>
                  <span className="font-bold text-loam bg-field-card px-2 py-0.5 border border-loam/30 rounded-sm">
                    {remedy.frequency}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CHEMICAL OPTIONS & DOSAGE CALCULATOR */}
      {activeTab === 'chemical' && result.chemicalRemedies && (
        <div className="flex flex-col gap-6">
          
          {/* Chemical List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {result.chemicalRemedies.map((chem, idx) => (
              <div 
                key={idx}
                className="bg-field-bg border-2 border-loam p-5 rounded-sm flex flex-col justify-between shadow-sharp"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-loam/30 pb-2 mb-3">
                    <span className="font-serif font-bold text-lg text-loam flex items-center gap-2">
                      <FlaskConical className="w-4 h-4 text-soil" />
                      {chem.name}
                    </span>
                    <span className="bg-soil/10 text-soil border border-soil/40 text-[10px] font-mono px-2 py-0.5 rounded-sm font-bold">
                      Foliar Spray
                    </span>
                  </div>

                  <div className="space-y-2 font-mono text-xs mb-3">
                    <div className="flex justify-between border-b border-loam/10 pb-1">
                      <span className="text-loam-muted">Active Ingredient:</span>
                      <strong className="text-loam">{chem.activeIngredient}</strong>
                    </div>
                    <div className="flex justify-between border-b border-loam/10 pb-1">
                      <span className="text-loam-muted">Recommended Dosage:</span>
                      <strong className="text-earth-amber">{chem.dosagePerLiter}</strong>
                    </div>
                    <div className="flex justify-between border-b border-loam/10 pb-1">
                      <span className="text-loam-muted">Safety Harvest Gap:</span>
                      <strong className="text-earth-red">{chem.safetyWaitDays}</strong>
                    </div>
                  </div>

                  <p className="font-mono text-xs text-loam-muted leading-relaxed">
                    {chem.applicationMethod}
                  </p>
                </div>

              </div>
            ))}
          </div>

          {/* Interactive Field Tank Dosage Calculator */}
          <div className="bg-sprout-pale border-2 border-sprout p-5 rounded-sm shadow-sharp">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-sprout/40 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-sprout" />
                <div>
                  <h4 className="font-serif font-bold text-base text-loam">
                    Farmer Sprayer Tank Dosage Calculator
                  </h4>
                  <p className="font-mono text-xs text-loam-muted">
                    Calculate exact chemical/powder quantity required for your field sprayer volume.
                  </p>
                </div>
              </div>

              {/* Tank Size Input */}
              <div className="flex items-center gap-2">
                <label className="font-mono text-xs font-bold text-loam uppercase">
                  Tank Capacity:
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={tankSize}
                    onChange={(e) => setTankSize(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 bg-field-bg border-2 border-loam rounded-l-sm px-2 py-1 font-mono text-sm font-bold text-loam text-center focus:outline-none"
                  />
                  <span className="bg-loam text-field-bg px-2 py-1 font-mono text-xs font-bold border-2 border-loam rounded-r-sm">
                    Liters
                  </span>
                </div>
              </div>
            </div>

            {/* Calculations Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {result.chemicalRemedies.map((chem, idx) => {
                // Extract numerical dosage from string e.g. "2.5 grams" or "1.0 ml"
                const match = chem.dosagePerLiter.match(/([0-9.]+)/);
                const dosageVal = match ? parseFloat(match[1]) : 2;
                const totalRequired = (dosageVal * tankSize).toFixed(1);
                const isMl = chem.dosagePerLiter.toLowerCase().includes('ml');

                return (
                  <div key={idx} className="bg-field-bg border border-loam p-3 rounded-sm">
                    <div className="font-mono text-xs font-bold text-loam truncate mb-1">
                      {chem.name}
                    </div>
                    <div className="font-mono text-xs text-loam-muted mb-2">
                      Base: {chem.dosagePerLiter}
                    </div>
                    <div className="bg-sprout-tint p-2 rounded-sm border border-sprout/40 flex items-center justify-between font-mono">
                      <span className="text-xs text-sprout font-bold">Total for {tankSize}L Tank:</span>
                      <span className="text-base font-extrabold text-sprout">
                        {totalRequired} {isMl ? 'ml' : 'grams'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
