import React, { useState, useRef, useEffect } from 'react';
import { 
  Sprout, 
  Droplets, 
  Sun, 
  FlaskConical, 
  Send, 
  Trash2, 
  Sparkles, 
  ChevronRight, 
  ShieldCheck, 
  Bug, 
  Coins, 
  Bot, 
  User, 
  Loader2,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Leaf
} from 'lucide-react';

const PREBUILT_AGRI_QUESTIONS = {
  en: [
    {
      id: 'pest-rust',
      icon: Bug,
      title: 'Wheat Rust Treatment',
      question: 'How do I identify yellow rust in Wheat and what organic or chemical treatment should I apply immediately?'
    },
    {
      id: 'fertilizer-npk',
      icon: FlaskConical,
      title: 'NPK Fertilizer Schedule',
      question: 'What is the optimal NPK ratio and split application schedule for crops this season?'
    },
    {
      id: 'irrigation-drip',
      icon: Droplets,
      title: 'Irrigation Guidance',
      question: 'How often should I irrigate this week during dry spells to ensure optimal root health?'
    },
    {
      id: 'govt-scheme',
      icon: Coins,
      title: 'PM-Kisan & Subsidies',
      question: 'What government subsidies or crop insurance benefits (PMFBY) apply for farmers this season?'
    },
    {
      id: 'organic-ipm',
      icon: Sprout,
      title: 'Bio-Pesticide Preparation',
      question: 'How can I prepare Neem oil spray and Jeevamrut at home for organic pest management?'
    }
  ],
  hi: [
    {
      id: 'pest-rust',
      icon: Bug,
      title: 'गेहूं पीला रतुआ उपचार',
      question: 'गेहूं में पीला रतुआ (Yellow Rust) बीमारी की पहचान कैसे करें और इसके लिए नीम तेल या रासायनिक छिड़काव क्या करें?'
    },
    {
      id: 'fertilizer-npk',
      icon: FlaskConical,
      title: 'NPK खाद की मात्रा',
      question: 'मेरी फसल के लिए NPK (नाइट्रोजन, फास्फोरस, पोटाश) की सही मात्रा और छिड़काव का समय क्या है?'
    },
    {
      id: 'irrigation-drip',
      icon: Droplets,
      title: 'सिंचाई और पानी की सलाह',
      question: 'सूखे के मौसम में फसल को पानी कब और कितना देना चाहिए ताकि पैदावार अच्छी रहे?'
    },
    {
      id: 'govt-scheme',
      icon: Coins,
      title: 'पीएम-किसान व बीमा योजना',
      question: 'पीएम-किसान सम्मान निधि और फसल बीमा योजना (PMFBY) का लाभ कैसे प्राप्त करें?'
    },
    {
      id: 'organic-ipm',
      icon: Sprout,
      title: 'जैविक कीटनाशक (जीवामृत)',
      question: 'घर पर नीम का तेल और जीवामृत बनाने की आसान विधि क्या है?'
    }
  ]
};

const generateMockAgronomyAdvice = (query, lang = 'en') => {
  const qLower = query.toLowerCase();
  const isHindi = lang === 'hi';

  if (qLower.includes('rust') || qLower.includes('pest') || qLower.includes('yellow') || qLower.includes('disease') || qLower.includes('रतुआ') || qLower.includes('कीड़ा') || qLower.includes('blight')) {
    if (isHindi) {
      return `🌾 **किसान सलाहकार कीट व रोग प्रबंधन मार्गदर्शिका**

### 1. बीमारी की पहचान व रोकथाम
- **लक्षण**: पत्तियों पर पीले या भूरे धब्बे, फफूंद या झुलसने के लक्षण।
- **त्वरित उपचार**: प्रभावित पत्तियों को अलग करें और 5 मिली नीम तेल प्रति लीटर पानी में मिलाकर छिड़काव करें।
- **रासायनिक सुरक्षा**: आवश्यकतानुसार प्रोपीकोनाज़ोल (Propiconazole 25% EC @ 1ml/L) का प्रयोग करें।

### 2. जैविक सुरक्षा व सावधानी
- बीजों का उपचार ट्राइकोडर्मा से करें और खेत में उचित जल निकासी बनाए रखें।`;
    }

    return `🌾 **Agronomic Advisory Brief**

### 1. Disease & Pest Diagnosis
- **Symptoms**: Discolored spots, fungal growth, or leaf blight.
- **Immediate Action**: Remove affected foliage; spray Neem Oil solution (5ml/L water) or Copper Oxychloride (2.5g/L).
- **Chemical Control**: For severe fungal rust/blight, apply Propiconazole 25% EC (1ml per Litre water).

### 2. Bio-Protection
- Use *Trichoderma viride* for seed and soil treatment to enhance root immunity against soil-borne pathogens.`;
  }

  return `🌾 **Agronomic Advisory Brief**

### 1. Seasonal Crop & Soil Guidance
- Ensure balanced NPK application (120:60:40 per hectare for cereals) split across basal and tillering stages.
- Maintain field drainage during monsoon and install drip lines during dry spells.

### 2. Integrated Pest Management
- Spray neem-based bio-pesticides every 14 days as a preventive measure.

*Need specific guidance for crop diseases, weather tips, or fertilizers? Ask any question below or click the mic button!*`;
};

export default function FarmerChatbot({
  apiEndpoint = 'http://127.0.0.1:8001/api/chat/stream',
  initialQuery = '',
  activeScanContext = null
}) {
  const [lang, setLang] = useState('en');
  const questions = PREBUILT_AGRI_QUESTIONS[lang];

  const [isListening, setIsListening] = useState(false);
  const [speakingMsgIndex, setSpeakingMsgIndex] = useState(null);
  const recognitionRef = useRef(null);

  const [messages, setMessages] = useState(() => {
    const welcomeMsg = lang === 'hi' 
      ? `🌾 **नमस्ते! किसान एआई में आपका स्वागत है।**\n\nमैं आपका कृषि सलाहकार हूँ।\n\nनीचे दिए गए सुझाव पर क्लिक करें या अपना सवाल हिंदी/अंग्रेजी में पूछें या माइक बटन दबाकर बोलें!`
      : `🌾 **Namaste & Welcome to Kisan AI Chatbot!**\n\nI am your dedicated Agricultural & Farming AI Advisor.\n\nSelect a topic below or type/speak any question about crop health, pest remedies, or irrigation!`;

    if (activeScanContext) {
      return [
        { role: 'assistant', content: welcomeMsg },
        { 
          role: 'assistant', 
          content: `📋 **Disease Context Loaded**: Active scan detected **${activeScanContext.cropName || activeScanContext.diseaseName}** (${activeScanContext.diseaseName}). Ask me any follow-up question about dosages, organic remedies, or recovery timelines!` 
        }
      ];
    }
    return [{ role: 'assistant', content: welcomeMsg }];
  });

  const [input, setInput] = useState(initialQuery || '');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (initialQuery) {
      setInput(initialQuery);
    }
  }, [initialQuery]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        handleSend(transcript);
      };

      recognitionRef.current = recognition;
    }
  }, [lang]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert(lang === 'hi' ? 'आपके ब्राउज़र में वॉइस रिकॉग्निशन सपोर्ट उपलब्ध नहीं है।' : 'Voice recognition is not supported in this browser. Try Google Chrome.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
      recognitionRef.current.start();
    }
  };
  // Preload browser voices for text-to-speech
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  // Helper to select a sweet, natural female voice in English and Hindi
  const getSweetFemaleVoice = (voices, currentLang) => {
    if (!voices || voices.length === 0) return null;

    const isHindi = currentLang === 'hi';

    if (isHindi) {
      const hiFemale = voices.find((v) => {
        const name = v.name.toLowerCase();
        const langStr = v.lang.toLowerCase();
        return (
          (langStr.includes('hi') || name.includes('hindi') || name.includes('हिन्दी')) &&
          (name.includes('swara') || name.includes('kalpana') || name.includes('female') || name.includes('google'))
        );
      });
      if (hiFemale) return hiFemale;

      const anyHindi = voices.find((v) => {
        const name = v.name.toLowerCase();
        const langStr = v.lang.toLowerCase();
        return langStr.includes('hi') || name.includes('hindi') || name.includes('हिन्दी');
      });
      if (anyHindi) return anyHindi;
    }

    const enFemale = voices.find((v) => {
      const name = v.name.toLowerCase();
      const langStr = v.lang.toLowerCase();
      return (
        (langStr.includes('en') || langStr.includes('in') || name.includes('english') || name.includes('india')) &&
        (name.includes('neerja') ||
          name.includes('heera') ||
          name.includes('zira') ||
          name.includes('google uk english female') ||
          name.includes('google us english') ||
          name.includes('samantha') ||
          name.includes('hazel') ||
          name.includes('aria') ||
          name.includes('jenny') ||
          name.includes('female')) &&
        !name.includes('male') &&
        !name.includes('david') &&
        !name.includes('mark') &&
        !name.includes('george')
      );
    });
    if (enFemale) return enFemale;

    const anyFemale = voices.find((v) => {
      const name = v.name.toLowerCase();
      return (
        (name.includes('female') || name.includes('zira') || name.includes('aria') || name.includes('samantha')) &&
        !name.includes('male') &&
        !name.includes('david')
      );
    });
    if (anyFemale) return anyFemale;

    return voices.find((v) => v.lang.startsWith(isHindi ? 'hi' : 'en')) || voices[0];
  };

  const speakMessage = (text, index) => {
    if (!('speechSynthesis' in window)) {
      alert(lang === 'hi' ? 'आपके डिवाइस में टेक्स्ट-टू-स्पीच सपोर्ट नहीं है।' : 'Text-to-speech is not supported on this browser.');
      return;
    }

    if (speakingMsgIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingMsgIndex(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text
      .replace(/[*#_`]/g, '')
      .replace(/🌾|🧪|💧|🍅|🌱|☁️|🌽|🎋/g, '')
      .replace(/https?:\/\/\S+/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.92;   // Gentle, clear cadence for farmers
    utterance.pitch = 1.15;  // Sweet, natural female voice pitch

    const availableVoices = window.speechSynthesis.getVoices();
    const sweetFemaleVoice = getSweetFemaleVoice(availableVoices, lang);

    if (sweetFemaleVoice) {
      utterance.voice = sweetFemaleVoice;
      utterance.lang = sweetFemaleVoice.lang || (lang === 'hi' ? 'hi-IN' : 'en-IN');
    } else {
      utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    }

    utterance.onend = () => setSpeakingMsgIndex(null);
    utterance.onerror = () => setSpeakingMsgIndex(null);

    setSpeakingMsgIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (queryText) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setSpeakingMsgIndex(null);

    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: textToSend,
          diagnosis_context: activeScanContext,
          profile_data: { language: lang === 'hi' ? 'Hindi' : 'English' }
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      if (response.body && response.body.getReader) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let done = false;
        let accumulatedText = '';

        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            accumulatedText += chunk;
            setMessages(prev => {
              const updated = [...prev];
              updated[updated.length - 1] = { role: 'assistant', content: accumulatedText };
              return updated;
            });
          }
        }
      } else {
        const data = await response.json();
        const content = data.response || data.message || 'No response received.';
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content };
          return updated;
        });
      }
    } catch (err) {
      console.warn('Backend server unavailable. Running intelligent local agronomy streamer...', err);
      const mockText = generateMockAgronomyAdvice(textToSend, lang);
      let currentLength = 0;
      const step = 8;
      
      const interval = setInterval(() => {
        currentLength += step;
        const chunk = mockText.slice(0, currentLength);
        
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: chunk };
          return updated;
        });

        if (currentLength >= mockText.length) {
          clearInterval(interval);
          setIsLoading(false);
        }
      }, 30);
      return;
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([{
      role: 'assistant',
      content: lang === 'hi' 
        ? '🌾 **चैट इतिहास साफ़ कर दिया गया है।** नया सवाल पूछें!' 
        : '🌾 **Chat history cleared.** Ask a new question about your farm!'
    }]);
  };

  return (
    <div className="bg-field-surface border-2 border-loam rounded-sm shadow-sharp p-4 sm:p-6 space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-loam pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-sprout border-2 border-loam rounded-sm flex items-center justify-center text-field-bg font-bold font-mono text-2xl shadow-sharp-sm">
            🤖
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-2xl font-extrabold text-loam">
                Kisan AI Agronomist Chatbot
              </h2>
              <span className="bg-sprout-tint text-sprout border border-sprout/40 text-xs font-mono px-2 py-0.5 rounded-sm uppercase tracking-wider font-semibold">
                Live Advisor
              </span>
            </div>
            <p className="text-xs font-mono text-loam-muted">
              Ask about diseases, dosages, weather tips, market prices & government subsidies.
            </p>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <button
            onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
            className="px-3 py-1.5 border border-loam bg-field-bg hover:bg-field-card text-xs font-mono font-bold text-loam rounded-sm shadow-sharp-sm flex items-center gap-1"
          >
            <span>🌐 {lang === 'en' ? 'English' : 'हिंदी'}</span>
          </button>

          {/* Clear Chat */}
          <button
            onClick={handleClearHistory}
            className="p-1.5 border border-loam bg-field-bg hover:bg-earth-amber/20 text-loam rounded-sm shadow-sharp-sm"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4 text-earth-amber" />
          </button>
        </div>
      </div>

      {/* Preset Questions Bar */}
      <div className="space-y-2">
        <span className="text-xs font-mono font-bold text-loam uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-sprout" /> Suggested Questions:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {questions.map((q) => {
            const IconComp = q.icon;
            return (
              <button
                key={q.id}
                onClick={() => handleSend(q.question)}
                disabled={isLoading}
                className="flex items-center gap-2.5 p-2.5 bg-field-bg hover:bg-sprout-tint/40 border border-loam/40 hover:border-sprout rounded-sm text-left text-xs font-mono transition-all text-loam group"
              >
                <div className="p-1.5 bg-sprout-tint text-sprout rounded-sm border border-sprout/30 group-hover:bg-sprout group-hover:text-field-bg transition-colors">
                  <IconComp className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 truncate">
                  <span className="font-bold block truncate">{q.title}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-loam-muted group-hover:translate-x-0.5 transition-transform" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Messages Feed */}
      <div className="bg-field-bg border-2 border-loam rounded-sm p-4 h-[420px] overflow-y-auto space-y-4 shadow-inner">
        {messages.map((m, idx) => {
          const isAssistant = m.role === 'assistant';
          return (
            <div
              key={idx}
              className={`flex items-start gap-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}
            >
              {isAssistant && (
                <div className="w-8 h-8 rounded-sm bg-sprout border border-loam text-field-bg flex items-center justify-center font-bold text-sm shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-sm border text-xs sm:text-sm font-mono leading-relaxed whitespace-pre-wrap ${
                  isAssistant
                    ? 'bg-field-surface border-loam/60 text-loam shadow-sharp-sm'
                    : 'bg-sprout text-field-bg border-loam font-medium'
                }`}
              >
                {m.content || (
                  <span className="flex items-center gap-2 text-loam-muted italic">
                    <Loader2 className="w-4 h-4 animate-spin text-sprout" /> Agronomist is analyzing...
                  </span>
                )}

                {/* Voice Readout Button for Assistant Messages */}
                {isAssistant && m.content && (
                  <div className="mt-3 pt-2 border-t border-loam/20 flex justify-end">
                    <button
                      onClick={() => speakMessage(m.content, idx)}
                      className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-mono bg-field-bg border border-loam/40 rounded-sm hover:border-sprout text-loam"
                    >
                      {speakingMsgIndex === idx ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5 text-earth-amber animate-pulse" />
                          <span>Stop Audio</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-sprout" />
                          <span>Listen (Female Voice)</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {!isAssistant && (
                <div className="w-8 h-8 rounded-sm bg-loam text-field-bg flex items-center justify-center font-bold text-sm shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2"
      >
        <button
          type="button"
          onClick={toggleListening}
          className={`p-3 border-2 border-loam rounded-sm transition-all shadow-sharp-sm ${
            isListening
              ? 'bg-earth-amber text-loam animate-pulse'
              : 'bg-field-bg hover:bg-field-card text-loam'
          }`}
          title={isListening ? 'Stop Voice Input' : 'Speak Voice Input'}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-sprout" />}
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            isListening
              ? 'Listening... Speak now...'
              : lang === 'hi'
              ? 'यहाँ अपना सवाल लिखें या माइक दबाकर बोलें...'
              : 'Ask a question about crop diseases, fertilizers, weather...'
          }
          className="flex-1 p-3 bg-field-bg border-2 border-loam rounded-sm text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sprout text-loam"
        />

        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-5 py-3 bg-sprout hover:bg-sprout-hover text-field-bg border-2 border-loam font-mono text-sm font-bold rounded-sm shadow-sharp-sm disabled:opacity-50 flex items-center gap-2 transition-all active:translate-x-0.5 active:translate-y-0.5"
        >
          <span>Send</span>
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
