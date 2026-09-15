import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Pause, Play, Radio } from 'lucide-react';

export default function SpeechAssist({ result }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setIsSupported(false);
    }
  }, []);

  if (!result || !isSupported) return null;

  const textToRead = result.audioSummaryText || 
    `${result.cropName} crop diagnosed with ${result.diseaseName}, severity level ${result.severity}. Immediate action: ${result.emergencyAction?.[0] || 'Prune infected leaves'}. Recommended remedy: ${result.organicRemedies?.[0]?.name || 'Apply foliar spray'}.`;

  const handleToggleSpeech = () => {
    if (!window.speechSynthesis) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      window.speechSynthesis.cancel(); // Clear queued speech
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = 0.92; // Slightly calmer speaking rate for field clarity
      utterance.pitch = 1.15; // Sweet, warm female pitch

      const availableVoices = window.speechSynthesis.getVoices();
      const femaleVoice = availableVoices.find((v) => {
        const name = v.name.toLowerCase();
        return (
          (name.includes('female') ||
            name.includes('neerja') ||
            name.includes('heera') ||
            name.includes('swara') ||
            name.includes('kalpana') ||
            name.includes('zira') ||
            name.includes('google') ||
            name.includes('samantha')) &&
          !name.includes('male') &&
          !name.includes('david')
        );
      });

      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }

      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);

      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  return (
    <div className="bg-sprout-pale border-2 border-sprout rounded-md p-4 my-4 flex items-center justify-between shadow-sharp-sm">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-sm border border-sprout flex items-center justify-center ${isPlaying ? 'bg-sprout text-field-bg animate-pulse' : 'bg-sprout-tint text-sprout'}`}>
          {isPlaying ? <Radio className="w-5 h-5 animate-spin-slow" /> : <Volume2 className="w-5 h-5" />}
        </div>
        <div>
          <span className="font-mono text-xs font-bold text-sprout uppercase tracking-wider block">
            Farmer Voice Audio Assist
          </span>
          <p className="font-mono text-xs text-loam leading-tight">
            Listen to plain-spoken diagnosis & emergency remedy instructions.
          </p>
        </div>
      </div>

      <button
        onClick={handleToggleSpeech}
        className={`px-4 py-2 rounded-sm border border-loam font-mono text-xs font-bold transition-all flex items-center gap-2 shadow-sharp-sm ${
          isPlaying
            ? 'bg-earth-red text-field-bg hover:bg-earth-red/90'
            : 'bg-sprout text-field-bg hover:bg-sprout-hover'
        }`}
      >
        {isPlaying ? (
          <>
            <Pause className="w-3.5 h-3.5" />
            <span>Pause Audio</span>
          </>
        ) : (
          <>
            <Play className="w-3.5 h-3.5" />
            <span>Read Aloud</span>
          </>
        )}
      </button>
    </div>
  );
}
