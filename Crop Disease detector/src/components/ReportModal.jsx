import React from 'react';
import { X, Printer, Leaf, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function ReportModal({ result, isOpen, onClose }) {
  if (!isOpen || !result) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-loam/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-field-surface border-3 border-loam rounded-md max-w-3xl w-full p-6 lg:p-8 shadow-sharp-lg relative max-h-[90vh] overflow-y-auto">
        
        {/* Toolbar (Hidden when printing) */}
        <div className="no-print flex items-center justify-between border-b-2 border-loam pb-4 mb-6">
          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-sprout">
            <ShieldCheck className="w-4 h-4" />
            Agronomist Field Consultation Sheet
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-sm border-2 border-loam bg-sprout text-field-bg hover:bg-sprout-hover font-mono text-xs font-bold transition-all shadow-sharp-sm flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-sm border border-loam hover:bg-field-card text-loam"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PRINTABLE CONTENT AREA */}
        <div className="space-y-6 font-mono text-xs text-loam">
          
          {/* Document Header */}
          <div className="border-b-2 border-loam pb-4 flex justify-between items-start">
            <div>
              <h2 className="font-serif text-3xl font-bold text-loam">
                AgriVision Pathological Certificate
              </h2>
              <p className="font-mono text-xs text-loam-muted">
                Official Plant Diagnostic & Prescription Summary
              </p>
            </div>
            <div className="text-right font-mono text-xs text-loam-muted">
              <div>Date: {new Date().toLocaleDateString()}</div>
              <div>Report ID: #{result.id || 'AGR-' + Math.floor(Math.random()*90000+10000)}</div>
            </div>
          </div>

          {/* Disease Summary Box */}
          <div className="bg-field-bg border-2 border-loam p-4 rounded-sm">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-loam-muted text-[10px] block uppercase font-bold">Target Crop</span>
                <strong className="text-sm">{result.cropName}</strong>
              </div>
              <div>
                <span className="text-loam-muted text-[10px] block uppercase font-bold">Diagnosed Pathology</span>
                <strong className="text-sm text-sprout">{result.diseaseName}</strong>
              </div>
              <div>
                <span className="text-loam-muted text-[10px] block uppercase font-bold">Scientific Species</span>
                <em className="font-serif text-sm block">{result.scientificName}</em>
              </div>
              <div>
                <span className="text-loam-muted text-[10px] block uppercase font-bold">Severity Rating</span>
                <strong className="text-sm text-earth-red">{result.severity} ({result.severityPercent}%)</strong>
              </div>
            </div>
          </div>

          {/* Key Symptoms */}
          <div>
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-loam mb-2 border-b border-loam/20 pb-1">
              Pathogen Symptoms & Field Inspection Notes
            </h4>
            <ul className="list-disc list-inside space-y-1 text-loam-muted">
              {result.symptoms?.map((s, idx) => (
                <li key={idx}>{s}</li>
              ))}
            </ul>
          </div>

          {/* Prescribed Remedies */}
          <div>
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-loam mb-2 border-b border-loam/20 pb-1">
              Prescribed Remedies & Dosage Formulas
            </h4>

            <div className="space-y-3">
              {result.organicRemedies?.map((o, idx) => (
                <div key={idx} className="bg-field-bg border border-loam/40 p-2.5 rounded-sm">
                  <div className="font-bold text-sprout">{o.name} (Bio-Remedy)</div>
                  <div>Formula: <strong>{o.formula}</strong> — {o.instructions}</div>
                </div>
              ))}

              {result.chemicalRemedies?.map((c, idx) => (
                <div key={idx} className="bg-field-bg border border-loam/40 p-2.5 rounded-sm">
                  <div className="font-bold text-soil">{c.name} (Chemical Spray)</div>
                  <div>Active: {c.activeIngredient} | Dosage: <strong>{c.dosagePerLiter}</strong></div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Signature */}
          <div className="pt-8 border-t-2 border-loam flex justify-between items-end text-[11px] text-loam-muted">
            <div>
              <p>Generated by AgriVision Multimodal Agronomist Engine</p>
              <p>Certified for Field Application</p>
            </div>
            <div className="text-center border-t border-loam pt-2 w-48 font-serif italic text-loam">
              Agronomist Stamp / Signature
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
