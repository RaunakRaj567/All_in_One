import React from 'react';
import { X, History, Trash2, ArrowRight, Calendar, Leaf } from 'lucide-react';

export default function HistoryDrawer({ 
  isOpen, 
  onClose, 
  history, 
  onSelectScan, 
  onClearHistory 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-loam/70 backdrop-blur-sm flex justify-end">
      
      {/* Backdrop overlay click */}
      <div className="flex-1" onClick={onClose} />

      {/* Drawer Panel */}
      <div className="w-full max-w-md bg-field-surface border-l-3 border-loam min-h-screen p-6 shadow-sharp-lg flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right">
        
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-loam pb-4 mb-6">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-sprout" />
              <h3 className="font-serif font-bold text-xl text-loam">
                Past Pathology Scans
              </h3>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-sm border border-loam hover:bg-field-card text-loam transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List */}
          {history.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-loam/30 rounded-sm p-6 font-mono text-xs text-loam-muted">
              <Leaf className="w-8 h-8 text-sprout/60 mx-auto mb-2" />
              <p>No past crop scans saved yet.</p>
              <p className="mt-1 text-[11px]">Run a pathology scan to build your farm record history.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((scan, idx) => (
                <div
                  key={scan.scanId || idx}
                  onClick={() => {
                    onSelectScan(scan);
                    onClose();
                  }}
                  className="bg-field-bg border-2 border-loam p-3.5 rounded-sm cursor-pointer hover:border-sprout hover:bg-field-card transition-all flex items-center justify-between shadow-sharp-sm group"
                >
                  <div className="space-y-1 truncate pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-loam truncate">
                        {scan.cropName} — {scan.diseaseName}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] font-mono text-loam-muted">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-sprout" />
                        {new Date(scan.timestamp || Date.now()).toLocaleDateString()}
                      </span>
                      <span className={`font-bold ${
                        scan.severity === 'Critical' ? 'text-earth-red' : 'text-sprout'
                      }`}>
                        {scan.severity}
                      </span>
                    </div>
                  </div>

                  <div className="w-7 h-7 bg-field-surface border border-loam rounded-sm flex items-center justify-center text-loam group-hover:bg-sprout group-hover:text-field-bg transition-colors shrink-0">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drawer Footer Actions */}
        {history.length > 0 && (
          <div className="pt-4 border-t-2 border-loam mt-6">
            <button
              onClick={onClearHistory}
              className="w-full px-4 py-2 rounded-sm border border-earth-red text-earth-red font-mono text-xs font-bold hover:bg-earth-red/10 transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear Scan History</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
