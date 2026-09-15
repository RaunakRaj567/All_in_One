import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AsymmetricScanner from '../components/AsymmetricScanner';
import ScanningOverlay from '../components/ScanningOverlay';
import DiseaseResultCard from '../components/DiseaseResultCard';
import RemedyTabs from '../components/RemedyTabs';
import ActionSchedule from '../components/ActionSchedule';
import SpeechAssist from '../components/SpeechAssist';
import { analyzeCropDisease } from '../services/geminiService';
import { SAMPLE_DISEASES } from '../data/mockDiseases';
import { Sprout, MessageSquare } from 'lucide-react';
import { useAgriContext } from '../context/AgriContext';

export default function DetectorPage({ onOpenReport }) {
  const navigate = useNavigate();
  const {
    activeScan,
    setActiveScan,
    activeImage,
    setActiveImage,
    addScanToHistory,
    hasApiKey,
    setPendingChatQuery
  } = useAgriContext();

  const [cropType, setCropType] = useState('all');
  const [plantPart, setPlantPart] = useState('leaf');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleStartScan = async ({ base64Image, cropType, plantPart, sampleId }) => {
    setIsAnalyzing(true);
    setActiveImage(base64Image);
    setActiveScan(null);

    try {
      const result = await analyzeCropDisease({
        base64Image,
        cropType,
        plantPart,
        sampleId
      });

      const newScanObj = {
        scanId: 'scan-' + Date.now(),
        timestamp: new Date().toISOString(),
        ...result
      };

      addScanToHistory(newScanObj);

    } catch (err) {
      console.error('Scan error:', err);
      const fallback = { ...SAMPLE_DISEASES[0], scanId: 'scan-fallback-' + Date.now() };
      addScanToHistory(fallback);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAskAgronomist = () => {
    if (!activeScan) return;
    const query = `What immediate bio-pesticide spray or treatment schedule should I apply for ${activeScan.diseaseName} detected on my ${activeScan.cropName || 'crop'}?`;
    setPendingChatQuery(query);
    navigate('/chatbot');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Asymmetric Hero Header Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end border-b-3 border-loam pb-8">
        <div className="lg:col-span-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-sprout-tint border border-sprout/40 rounded-sm text-xs font-mono text-sprout font-bold uppercase tracking-wider">
            <Sprout className="w-3.5 h-3.5" />
            <span>Real-World Field Pathology & Remedy Engine</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold text-loam tracking-tight leading-none">
            Protect Your Harvest. <br />
            <span className="text-sprout italic">Diagnose & Cure Crops.</span>
          </h1>

          <p className="font-mono text-xs sm:text-sm text-loam-muted max-w-2xl leading-relaxed">
            Upload leaf images or select field samples to identify pathogens, inspect severity metrics, and access precise 3-tier bio & chemical remedy dosages.
          </p>
        </div>

        <div className="lg:col-span-4 flex flex-col items-start lg:items-end justify-end">
          <div className="bg-field-surface border-2 border-loam p-4 rounded-sm shadow-sharp w-full max-w-sm">
            <div className="flex items-center justify-between text-xs font-mono mb-2 border-b border-loam/20 pb-2">
              <span className="font-bold text-loam">System Mode</span>
              <span className={`px-2 py-0.5 rounded-sm font-bold ${hasApiKey ? 'bg-sprout text-field-bg' : 'bg-earth-amber text-loam'}`}>
                {hasApiKey ? 'Gemini 2.5 Active' : 'Offline Agronomist'}
              </span>
            </div>
            <p className="text-[11px] font-mono text-loam-muted leading-tight">
              {hasApiKey ? 'Direct vision API key configured.' : 'Operating via built-in agronomist dataset engine. Add your Gemini key in settings.'}
            </p>
          </div>
        </div>
      </div>

      {/* INPUT & SCANNER SECTION */}
      <section className="space-y-6">
        <AsymmetricScanner
          onStartScan={handleStartScan}
          isAnalyzing={isAnalyzing}
          cropType={cropType}
          setCropType={setCropType}
          plantPart={plantPart}
          setPlantPart={setPlantPart}
        />
      </section>

      {/* SCANNING OVERLAY ANIMATION */}
      {isAnalyzing && (
        <section className="animate-in fade-in duration-300">
          <ScanningOverlay imageSrc={activeImage} />
        </section>
      )}

      {/* DIAGNOSIS & REMEDY RESULTS */}
      {activeScan && !isAnalyzing && (
        <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Ask AI Agronomist Banner */}
          <div className="bg-sprout-tint border-2 border-sprout p-4 rounded-sm flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sharp-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sprout text-field-bg rounded-sm flex items-center justify-center font-bold text-xl border border-loam">
                🤖
              </div>
              <div>
                <h3 className="font-serif font-bold text-loam text-base">Have questions about this diagnosis?</h3>
                <p className="text-xs font-mono text-loam-muted">
                  Ask Kisan AI Advisor for dosage schedules, organic remedies, or government schemes.
                </p>
              </div>
            </div>

            <button
              onClick={handleAskAgronomist}
              className="px-4 py-2 bg-sprout hover:bg-sprout-hover text-field-bg border-2 border-loam font-mono text-xs font-bold rounded-sm shadow-sharp-sm flex items-center gap-2 whitespace-nowrap transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Ask AI Agronomist</span>
            </button>
          </div>

          {/* Disease Breakdown */}
          <DiseaseResultCard 
            result={activeScan} 
            onPrintReport={onOpenReport}
          />

          {/* Voice Text-to-Speech Assist */}
          <SpeechAssist result={activeScan} />

          {/* 3-Tier Remedies & Dosage Calculator */}
          <RemedyTabs result={activeScan} />

          {/* 7-Day Farm Recovery Action Checklist */}
          <ActionSchedule result={activeScan} />

        </section>
      )}

    </div>
  );
}
