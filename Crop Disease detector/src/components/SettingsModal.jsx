import React, { useState, useEffect } from 'react';
import { X, Key, Cpu, Check, AlertCircle, Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';
import { getStoredSettings, saveStoredSettings } from '../services/geminiService';

export default function SettingsModal({ isOpen, onClose, onSettingsSaved }) {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gemini-2.5-flash');
  const [testStatus, setTestStatus] = useState(null); // null | 'testing' | 'success' | 'error'
  const [testMessage, setTestMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      const current = getStoredSettings();
      setApiKey(current.apiKey || '');
      setModel(current.model || 'gemini-2.5-flash');
      setTestStatus(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    saveStoredSettings({ apiKey, model });
    onSettingsSaved();
    onClose();
  };

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      setTestStatus('error');
      setTestMessage('Please enter a valid Gemini API Key first.');
      return;
    }

    setTestStatus('testing');
    setTestMessage('Pinging Google Gemini API...');

    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}?key=${apiKey.trim()}`);
      if (res.ok) {
        setTestStatus('success');
        setTestMessage('Connection successful! Gemini model active & responding.');
      } else {
        const data = await res.json();
        setTestStatus('error');
        setTestMessage(`API Connection Failed: ${data.error?.message || res.statusText}`);
      }
    } catch (e) {
      setTestStatus('error');
      setTestMessage(`Network Error: ${e.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-loam/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-field-surface border-3 border-loam rounded-md max-w-lg w-full p-6 shadow-sharp-lg relative animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-loam pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-sprout" />
            <h3 className="font-serif font-bold text-xl text-loam">
              Gemini Vision AI Settings
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-sm border border-loam hover:bg-field-card text-loam transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-4 font-mono text-xs text-loam">
          
          <div className="bg-sprout-pale border border-sprout/40 p-3 rounded-sm leading-relaxed text-loam-muted">
            <div className="flex items-center gap-1.5 font-bold text-sprout mb-1">
              <ShieldCheck className="w-4 h-4" />
              Direct Gemini API Hook
            </div>
            Enter your Google Gemini API key to enable live multimodal visual pathology inspection. If left empty, AgriVision operates seamlessly using the built-in agronomist engine.
          </div>

          {/* API Key Input */}
          <div>
            <label className="block font-bold mb-1 uppercase tracking-wider">
              Gemini API Key:
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="AIzaSy..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-field-bg border-2 border-loam rounded-sm px-3 py-2 text-sm font-mono text-loam focus:outline-none focus:border-sprout"
              />
            </div>
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-sprout font-bold hover:underline mt-1"
            >
              Get free API key from Google AI Studio <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Model Selector */}
          <div>
            <label className="block font-bold mb-1 uppercase tracking-wider">
              Vision Model Endpoint:
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-field-bg border-2 border-loam rounded-sm px-3 py-2 text-sm font-mono text-loam focus:outline-none focus:border-sprout"
            >
              <option value="gemini-2.5-flash">Gemini 2.5 Flash (Recommended - Ultra Fast)</option>
              <option value="gemini-1.5-flash">Gemini 1.5 Flash (Fast Vision)</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Agronomist Reasoning)</option>
            </select>
          </div>

          {/* Connection Test Indicator */}
          {testStatus && (
            <div className={`p-3 rounded-sm border text-xs font-mono flex items-start gap-2 ${
              testStatus === 'success' 
                ? 'bg-sprout-tint border-sprout text-sprout' 
                : testStatus === 'error' 
                ? 'bg-earth-red/15 border-earth-red text-earth-red' 
                : 'bg-field-card border-loam text-loam'
            }`}>
              {testStatus === 'success' && <Check className="w-4 h-4 shrink-0 mt-0.5" />}
              {testStatus === 'error' && <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
              <span>{testMessage}</span>
            </div>
          )}

        </div>

        {/* Modal Actions */}
        <div className="mt-6 pt-4 border-t-2 border-loam flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleTestConnection}
            className="px-3 py-2 rounded-sm border border-loam bg-field-bg hover:bg-field-card text-loam font-mono text-xs font-bold transition-all shadow-sharp-sm"
          >
            Test API Key
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-sm border border-loam text-loam font-mono text-xs font-bold hover:bg-field-card"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-sm border-2 border-loam bg-sprout text-field-bg hover:bg-sprout-hover font-mono text-xs font-bold uppercase tracking-wider shadow-sharp-sm"
            >
              Save Configuration
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
