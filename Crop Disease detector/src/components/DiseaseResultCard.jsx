import React from 'react';
import { AlertTriangle, CheckCircle, ShieldAlert, Sparkles, Activity, PieChart, FileText } from 'lucide-react';

export default function DiseaseResultCard({ result, onPrintReport }) {
  if (!result) return null;

  const isHealthy = result.severity === 'Healthy';

  // Severity color mapping based on earthy palette
  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'Critical':
        return {
          bg: 'bg-earth-red/15',
          border: 'border-earth-red',
          text: 'text-earth-red',
          pill: 'bg-earth-red text-field-bg',
          bar: 'bg-earth-red'
        };
      case 'Severe':
        return {
          bg: 'bg-earth-amber/15',
          border: 'border-earth-amber',
          text: 'text-earth-amber',
          pill: 'bg-earth-amber text-field-bg',
          bar: 'bg-earth-amber'
        };
      case 'Moderate':
        return {
          bg: 'bg-earth-yellow/20',
          border: 'border-earth-yellow',
          text: 'text-soil',
          pill: 'bg-earth-yellow text-loam',
          bar: 'bg-earth-yellow'
        };
      default:
        return {
          bg: 'bg-sprout-tint',
          border: 'border-sprout',
          text: 'text-sprout',
          pill: 'bg-sprout text-field-bg',
          bar: 'bg-sprout'
        };
    }
  };

  const style = getSeverityStyle(result.severity);

  return (
    <div className="bg-field-surface border-3 border-loam rounded-md p-6 lg:p-8 relative shadow-sharp-lg overflow-hidden">
      
      {/* Top Asymmetric Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-loam pb-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-sprout flex items-center gap-1.5">
            <Activity className="w-4 h-4" />
            Pathology Diagnosis Report
          </span>
          <span className="text-[10px] font-mono bg-field-card border border-loam/30 px-2 py-0.5 rounded-sm">
            Source: {result.source === 'gemini_api' ? 'Gemini 2.5 Vision' : 'Offline Agronomist AI'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onPrintReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-loam bg-field-bg hover:bg-field-card text-loam text-xs font-mono font-bold transition-all shadow-sharp-sm"
          >
            <FileText className="w-3.5 h-3.5 text-sprout" />
            Print Report
          </button>
        </div>
      </div>

      {/* Main Asymmetric Grid: Title & Key Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT: Disease Title & Scientific Classification (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 font-mono text-xs font-bold rounded-sm border border-loam uppercase tracking-wider ${style.pill}`}>
              {result.severity} Risk
            </span>
            <span className="font-mono text-xs text-loam-muted">
              Target Crop: <strong className="text-loam">{result.cropName}</strong>
            </span>
          </div>

          {/* Display Serif Disease Header */}
          <h2 className="font-serif text-3xl lg:text-4xl font-extrabold text-loam leading-tight tracking-tight">
            {result.diseaseName}
          </h2>

          <p className="font-serif italic text-base lg:text-lg text-sprout font-medium">
            Pathogen: {result.scientificName}
          </p>

          <p className="font-mono text-xs text-loam-muted mt-1 leading-relaxed">
            Diagnosed via multi-spectral leaf morphology analysis & structural lesion keypoints.
          </p>

        </div>

        {/* RIGHT: Metric Cards Grid (5 cols) */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-3">
          
          {/* Metric 1: AI Confidence */}
          <div className="bg-field-bg border-2 border-loam p-3.5 rounded-sm shadow-sharp-sm">
            <div className="flex items-center gap-1.5 text-xs font-mono text-loam-muted mb-1">
              <Sparkles className="w-3.5 h-3.5 text-sprout" />
              <span>AI Confidence</span>
            </div>
            <div className="font-mono text-2xl font-bold text-loam">
              {result.confidence}%
            </div>
            <div className="w-full bg-field-card h-1.5 rounded-none mt-2 overflow-hidden border border-loam/30">
              <div className="bg-sprout h-full" style={{ width: `${result.confidence}%` }} />
            </div>
          </div>

          {/* Metric 2: Affected Area */}
          <div className="bg-field-bg border-2 border-loam p-3.5 rounded-sm shadow-sharp-sm">
            <div className="flex items-center gap-1.5 text-xs font-mono text-loam-muted mb-1">
              <PieChart className="w-3.5 h-3.5 text-earth-amber" />
              <span>Infected Foliage</span>
            </div>
            <div className="font-mono text-lg font-bold text-loam truncate">
              {result.affectedArea}
            </div>
            <div className="w-full bg-field-card h-1.5 rounded-none mt-2 overflow-hidden border border-loam/30">
              <div className={`h-full ${style.bar}`} style={{ width: `${result.severityPercent}%` }} />
            </div>
          </div>

        </div>

      </div>

      {/* Symptoms Breakdown Section */}
      <div className="mt-8 pt-6 border-t-2 border-loam/20">
        <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-loam mb-4 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-sprout" />
          Detected Leaf Symptoms & Lesion Characteristics
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {result.symptoms.map((symptom, idx) => (
            <div 
              key={idx}
              className="bg-field-bg border border-loam/40 p-3 rounded-sm flex items-start gap-2 text-xs font-mono text-loam leading-relaxed"
            >
              <CheckCircle className="w-4 h-4 text-sprout shrink-0 mt-0.5" />
              <span>{symptom}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
