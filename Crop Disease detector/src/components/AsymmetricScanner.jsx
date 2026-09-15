import React, { useState, useRef } from 'react';
import { Upload, Camera, Sparkles, Leaf, CheckCircle2, Image as ImageIcon, Crosshair, AlertCircle } from 'lucide-react';
import { CROP_OPTIONS, PLANT_PARTS, SAMPLE_DISEASES } from '../data/mockDiseases';

export default function AsymmetricScanner({ 
  onStartScan, 
  isAnalyzing, 
  cropType, 
  setCropType, 
  plantPart, 
  setPlantPart 
}) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeSampleId, setActiveSampleId] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result);
      setActiveSampleId(null);
    };
    reader.readAsDataURL(file);
  };

  // Drag & drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files?.[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Select sample photo
  const handleSelectSample = (sample) => {
    setSelectedImage(sample.sampleImageUrl);
    setActiveSampleId(sample.id);
    setCropType(sample.cropType);
  };

  // Handle Scan Submit
  const handleRunAnalysis = () => {
    if (!selectedImage) return;
    onStartScan({
      base64Image: selectedImage,
      cropType,
      plantPart,
      sampleId: activeSampleId
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start relative">
      
      {/* LEFT COLUMN: Asymmetric Sticky Parameter Sidebar (4 cols) */}
      <div className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-24 z-10">
        
        {/* Context Control Card */}
        <div className="bg-field-surface border-2 border-loam rounded-md p-5 shadow-sharp">
          
          <div className="flex items-center justify-between border-b-2 border-loam pb-3 mb-4">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-sprout flex items-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5" />
              Field Context
            </span>
            <span className="text-[10px] font-mono bg-field-card border border-loam/30 px-1.5 py-0.5 rounded-sm">
              Param Config
            </span>
          </div>

          {/* Crop Selection */}
          <div className="mb-4">
            <label className="block text-xs font-mono font-bold text-loam mb-1.5 uppercase">
              Target Crop Species
            </label>
            <select
              value={cropType}
              onChange={(e) => setCropType(e.target.value)}
              className="w-full bg-field-bg border-2 border-loam rounded-sm px-3 py-2 text-sm font-mono text-loam focus:outline-none focus:border-sprout transition-colors"
            >
              {CROP_OPTIONS.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Plant Part Selection */}
          <div className="mb-5">
            <label className="block text-xs font-mono font-bold text-loam mb-1.5 uppercase">
              Infected Organ / Part
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PLANT_PARTS.map(part => (
                <button
                  key={part.id}
                  type="button"
                  onClick={() => setPlantPart(part.id)}
                  className={`px-2.5 py-1.5 text-xs font-mono rounded-sm border transition-all text-left flex items-center justify-between ${
                    plantPart === part.id
                      ? 'bg-sprout text-field-bg border-loam font-bold shadow-sharp-sm'
                      : 'bg-field-bg text-loam border-loam/40 hover:border-loam'
                  }`}
                >
                  <span>{part.name}</span>
                  {plantPart === part.id && <CheckCircle2 className="w-3 h-3 text-accent-sprout" />}
                </button>
              ))}
            </div>
          </div>

          {/* Guidelines Box */}
          <div className="bg-sprout-pale border border-sprout/40 rounded-sm p-3 text-xs font-mono text-loam">
            <div className="flex items-center gap-1.5 font-bold text-sprout mb-1">
              <Leaf className="w-3.5 h-3.5" />
              Optimal Scan Tip
            </div>
            <p className="text-[11px] leading-relaxed text-loam-muted">
              Capture leaf flat under daylight. Avoid heavy shadows or motion blur for highest pathogen detection accuracy.
            </p>
          </div>

        </div>



      </div>

      {/* RIGHT COLUMN: Huge Upload Viewport & Live Scanner (8 cols) */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        
        {/* Main Viewport Container with Asymmetric Border Styling */}
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-3 border-loam bg-field-surface rounded-md p-6 lg:p-8 min-h-[420px] flex flex-col justify-between transition-all grid-lines-pattern ${
            isDragOver ? 'border-sprout bg-sprout-pale ring-4 ring-sprout/20' : ''
          }`}
          style={{ borderWidth: '3px' }}
        >
          {/* Asymmetric Floating Badge Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-loam/20 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="bg-loam text-field-bg text-xs font-mono font-bold px-2.5 py-1 rounded-sm uppercase tracking-wider">
                Viewport 01
              </span>
              <span className="text-xs font-mono font-semibold text-loam-muted">
                {selectedImage ? 'Image Loaded' : 'Awaiting Input Image'}
              </span>
            </div>
            
            {/* Hidden Input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-loam bg-field-bg hover:bg-field-card text-loam text-xs font-mono font-bold transition-all shadow-sharp-sm"
              >
                <Upload className="w-3.5 h-3.5" />
                Browse File
              </button>
            </div>
          </div>

          {/* Image Display OR Drop Zone Content */}
          {selectedImage ? (
            <div className="relative my-4 rounded-sm border-2 border-loam overflow-hidden bg-loam/5 group">
              <img 
                src={selectedImage} 
                alt="Selected crop leaf for diagnosis" 
                className="w-full max-h-[380px] object-contain mx-auto bg-loam/10"
              />
              
              {/* Overlapping Image Meta Tag */}
              <div className="absolute bottom-3 left-3 bg-loam/90 text-field-bg text-xs font-mono px-3 py-1.5 rounded-sm border border-field-bg/30 flex items-center gap-2 backdrop-blur-sm">
                <ImageIcon className="w-3.5 h-3.5 text-accent-sprout" />
                <span>Ready for Pathology Scan</span>
              </div>

              {/* Replace Button Overlay */}
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-3 right-3 bg-earth-red text-field-bg text-xs font-mono px-2.5 py-1 rounded-sm border border-loam font-bold opacity-90 hover:opacity-100 transition-opacity shadow-sharp-sm"
              >
                Clear Photo
              </button>
            </div>
          ) : (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="my-8 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-loam/40 rounded-sm hover:border-sprout hover:bg-sprout-pale/50 cursor-pointer transition-all group"
            >
              <div className="w-16 h-16 bg-sprout-tint border-2 border-loam rounded-sm flex items-center justify-center text-sprout mb-4 group-hover:scale-105 transition-transform shadow-sharp-sm">
                <Upload className="w-8 h-8" />
              </div>

              <h3 className="font-serif text-2xl font-bold text-loam mb-2">
                Drop Crop Leaf Photo Here
              </h3>
              <p className="font-mono text-xs text-loam-muted max-w-md mb-4 leading-relaxed">
                Upload clear photo of diseased leaf, fruit, or stem (JPG, PNG, WebP format supported).
              </p>

              <div className="inline-flex items-center gap-2 px-4 py-2 bg-sprout text-field-bg font-mono text-xs font-bold rounded-sm border border-loam shadow-sharp group-hover:bg-sprout-hover transition-colors">
                <Camera className="w-4 h-4" />
                Select Photo from Device
              </div>
            </div>
          )}

          {/* Bottom Action Footer with Tactile CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t-2 border-loam/20 mt-2">
            <div className="text-xs font-mono text-loam-muted flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-sprout" />
              <span>Multi-modal Vision Pathologist v2.5</span>
            </div>

            <button
              disabled={!selectedImage || isAnalyzing}
              onClick={handleRunAnalysis}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-sm border-2 border-loam font-mono text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sharp-lg ${
                !selectedImage || isAnalyzing
                  ? 'bg-loam/20 text-loam-muted border-loam/30 cursor-not-allowed shadow-none'
                  : 'bg-sprout text-field-bg hover:bg-sprout-hover active:translate-x-1 active:translate-y-1 active:shadow-sharp-sm'
              }`}
            >
              <Sparkles className="w-4 h-4 animate-spin-slow" />
              {isAnalyzing ? 'Analyzing Pathogen...' : 'Run Disease Diagnosis'}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
