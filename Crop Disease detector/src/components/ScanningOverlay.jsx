import React, { useState, useEffect } from 'react';
import { Crosshair, Scan, Cpu } from 'lucide-react';

const SCAN_STEPS = [
  "Initializing Vision Mesh Pipeline...",
  "Segmenting Leaf Cuticle & Surface Nodes...",
  "Analyzing Fungal Lesions & Chlorosis Rings...",
  "Cross-referencing Pathogen Database...",
  "Calculating Chemical & Bio-Remedy Dosages..."
];

export default function ScanningOverlay({ imageSrc }) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % SCAN_STEPS.length);
    }, 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-field-surface border-3 border-loam rounded-md p-6 lg:p-8 my-6 relative overflow-hidden shadow-sharp-lg">
      
      {/* Header Banner */}
      <div className="flex items-center justify-between border-b-2 border-loam pb-3 mb-6">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-sprout animate-ping" />
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-loam">
            Active Pathology Scanning
          </span>
        </div>
        <span className="text-xs font-mono bg-sprout-tint text-sprout border border-sprout px-2 py-0.5 rounded-sm font-bold">
          Gemini Vision Neural Scan
        </span>
      </div>

      {/* Image & Laser Viewport */}
      <div className="relative border-2 border-loam rounded-sm overflow-hidden max-w-xl mx-auto bg-loam/90">
        <img 
          src={imageSrc} 
          alt="Scanning leaf target" 
          className="w-full max-h-[360px] object-contain opacity-80 filter brightness-90 contrast-110"
        />

        {/* Animated Laser Scanning Line */}
        <div className="absolute inset-x-0 h-1 bg-sprout-light shadow-[0_0_15px_#93BD85] animate-laser" />

        {/* Target Reticles (Bounding Boxes) */}
        <div className="absolute top-1/4 left-1/3 w-20 h-20 border-2 border-dashed border-sprout-light animate-pulse flex items-center justify-center">
          <Crosshair className="w-4 h-4 text-sprout-light opacity-80" />
        </div>

        <div className="absolute bottom-1/3 right-1/4 w-28 h-24 border-2 border-dashed border-earth-red/80 animate-pulse flex items-center justify-center">
          <span className="text-[9px] font-mono text-earth-red bg-loam/80 px-1 font-bold">Lesion Node #02</span>
        </div>

        {/* HUD Info Tag */}
        <div className="absolute bottom-3 left-3 bg-loam/95 border border-sprout-light/40 text-field-bg p-2 rounded-sm text-xs font-mono flex items-center gap-2">
          <Cpu className="w-4 h-4 text-sprout-light animate-spin-slow" />
          <span>{SCAN_STEPS[stepIndex]}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-6 max-w-xl mx-auto">
        <div className="flex items-center justify-between text-xs font-mono text-loam font-bold mb-1.5">
          <span>Pathogen Extraction Index</span>
          <span>92.4%</span>
        </div>
        <div className="w-full bg-field-card border border-loam rounded-sm h-3 overflow-hidden p-0.5">
          <div className="bg-sprout h-full rounded-sm transition-all duration-300 animate-pulse" style={{ width: '88%' }} />
        </div>
      </div>

    </div>
  );
}
