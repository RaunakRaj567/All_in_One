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
  VolumeX
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

// Fallback intelligent agricultural response generator for demo mode (English & Hindi)
const generateMockAgronomyAdvice = (query, lang = 'en') => {
  const qLower = query.toLowerCase();
  const isHindi = lang === 'hi';

  if (qLower.includes('rust') || qLower.includes('pest') || qLower.includes('yellow') || qLower.includes('disease') || qLower.includes('रतुआ') || qLower.includes('कीड़ा')) {
    if (isHindi) {
      return `🌾 **किसान सलाहकार कीट व रोग प्रबंधन मार्गदर्शिका**

### 1. बीमारी की पहचान
- **लक्षण**: पत्तियों पर पीले रंग के पाउडर जैसे धब्बे या धारियां।
- **मुख्य कारण**: हवा में अत्यधिक नमी (60% से अधिक) और ठंडी रातें (10-15°C) कवक (Fungus) को बढ़ाती हैं।

### 2. तुरंत रोकथाम के उपाय
- **जैविक उपाय**: **नीम का तेल (1500 ppm)** 5 मि.ली. प्रति लीटर पानी में थोड़ा सर्फ मिलाकर 7 दिन के अंतराल पर छिड़कें।
- **रासायनिक उपाय (यदि बीमारी अधिक हो)**: **टेबूकोनाज़ोल 25.9% EC** @ 1.5 मि.ली./लीटर या **प्रोपीकोनाज़ोल 25% EC** @ 1 मि.ली./लीटर शाम के समय छिड़कें।

### 3. बचाव की सलाह
- खेत के मेड़ों को साफ रखें और नाइट्रोजन (यूरिया) का ज्यादा इस्तेमाल न करें।`;
    }
    return `🌾 **AgriAssist Disease & Pest Management Guide**

### 1. Diagnosis & Symptoms
- **Observed Condition**: Leaf yellowing / Pustule formation along leaf veins.
- **Root Cause**: Fungal spore infection (Puccinia species) aggravated by high relative humidity (>60%) and cool night temperatures (10-15°C).

### 2. Action Plan
- **Organic Remedy**: Spray **Neem Oil (1500 ppm)** @ 5ml/L mixed with liquid soap, twice at 7-day intervals.
- **Chemical Remedy (if severe)**: Spray **Tebuconazole 25.9% EC** @ 1.5 ml/L during early morning or late afternoon.

### 3. Prevention Tips
- Avoid excessive nitrogen application during humid periods. Maintain clean field bunds.`;
  }

  if (qLower.includes('npk') || qLower.includes('fertilizer') || qLower.includes('soil') || qLower.includes('nutrient') || qLower.includes('खाद') || qLower.includes('यूरिया')) {
    if (isHindi) {
      return `🧪 **उर्वरक एवं खादों की अनुशंसित मात्रा**

### 1. NPK की सही मात्रा
- **अनुशंसित खुराक**: **120 किग्रा नाइट्रोजन : 60 किग्रा फास्फोरस : 40 किग्रा पोटाश प्रति हेक्टेयर**
- **बुवाई का समय**: फास्फोरस और पोटाश की पूरी मात्रा तथा नाइट्रोजन की 50% मात्रा बुवाई के समय दें।
- **खड़ी फसल में**: बची हुई 50% यूरिया दो बार में सिंचाई के समय दें।

### 2. जरूरी सुझाव
- नीम चढ़ी यूरिया (Neem Coated Urea) का प्रयोग करें ताकि खाद मिट्टी में अच्छे से घुले और बर्बाद न हो।`;
    }
    return `🧪 **Nutrient & Fertilizer Recommendation**

### 1. Recommended NPK Ratio
- **Target Dose**: **120 kg N : 60 kg P2O5 : 40 kg K2O per Hectare**
- **Basal Dose**: Apply 50% Nitrogen, 100% Phosphorus, and 100% Potassium at sow/tilling stage.
- **Top Dressing**: Apply remaining 50% Nitrogen split evenly at Crown Root Initiation (CRI) and Tillering.

### 2. Eco-Tip
- Use Neem-coated Urea to reduce nitrogen leaching and boost absorption by up to 20%.`;
  }

  if (isHindi) {
    return `🌾 **किसान सलाहकार कृषि गाइड**

### 1. फसल प्रबंधन
- अच्छी पैदावार के लिए खेत में पानी की निकासी का सही प्रबंध रखें।
- समय-समय पर पत्तियों के नीचे कीड़े या फफूंद के लक्षण देखें।

### 2. जैविक सुरक्षा
- बुवाई से पहले बीजों का उपचार *ट्राइकोडर्मा विरिडी* (5 ग्राम प्रति किग्रा बीज) से करें।

*किसी विशेष कीड़े या बीमारी की फोटो/जानकारी के लिए नीचे सवाल लिखें या माइक बोलकर पूछें!*`;
  }

  return `🌾 **Agronomic Advisory Brief**

### 1. Seasonal Crop Management
- For optimal yield, ensure balanced nutrient application and proper soil drainage.
- Inspect lower leaf surfaces weekly for early aphid or fungal infestation.

### 2. Bio-Protection
- Consider bio-fungicides like *Trichoderma viride* (5g/kg seed treatment or 2.5kg/ha soil application) for root protection.

*Need specific guidance for disease symptoms or government scheme details? Ask any question below or click the mic button to speak!*`;
};

export default function FarmerChatbot({
  apiEndpoint = 'http://127.0.0.1:8001/api/chat/stream'
}) {
  const [lang, setLang] = useState('en'); // 'en' | 'hi'
  const questions = PREBUILT_AGRI_QUESTIONS[lang];

  // Voice Assistant State
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgIndex, setSpeakingMsgIndex] = useState(null);
  const recognitionRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: lang === 'hi' 
        ? `🌾 **नमस्ते! किसान एआई में आपका स्वागत है।**\n\nमैं आपका कृषि सलाहकार हूँ।\n\nनीचे दिए गए सुझाव पर क्लिक करें या अपना सवाल हिंदी/अंग्रेजी में पूछें या माइक बटन दबाकर बोलें!`
        : `🌾 **Namaste & Welcome to Kisan AI Chatbot!**\n\nI am your dedicated Agricultural & Farming AI Advisor.\n\nSelect a topic below or type/speak any question about crop health, pest remedies, or irrigation!`
    }
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Preload browser voices for text-to-speech
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);


  // Speech Recognition (Speech-to-Text) Initialization
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (e) => {
        console.error('Speech recognition error:', e.error);
        setIsListening(false);
      };
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

  // Helper to select the best natural female voice (prioritizing high-quality Indian female voice for both English and Hindi)
  const getBestFemaleVoice = (voices) => {
    if (!voices || voices.length === 0) return null;

    // 1. Prioritize Microsoft Swara, Microsoft Heera, Google हिन्दी / Google Indian English Female
    const bestIndianFemale = voices.find(v => {
      const name = v.name.toLowerCase();
      const vLang = v.lang.toLowerCase();
      return (vLang.includes('hi') || vLang.includes('in') || name.includes('hindi') || name.includes('हिन्दी') || name.includes('india')) &&
             (name.includes('swara') || name.includes('heera') || name.includes('kalpana') || name.includes('female') || name.includes('google'));
    });
    if (bestIndianFemale) return bestIndianFemale;

    // 2. Any Hindi / Indian voice (Swara, Heera, Google)
    const anyIndian = voices.find(v => {
      const name = v.name.toLowerCase();
      const vLang = v.lang.toLowerCase();
      return vLang.includes('hi') || vLang.includes('in') || name.includes('hindi') || name.includes('हिन्दी') || name.includes('swara') || name.includes('heera');
    });
    if (anyIndian) return anyIndian;

    // 3. Fallback to general natural female voice
    const generalFemale = voices.find(v => {
      const name = v.name.toLowerCase();
      return (name.includes('female') || name.includes('zira') || name.includes('aria') || name.includes('jenny') || name.includes('samantha')) &&
             !name.includes('male') && !name.includes('david') && !name.includes('mark');
    });

    return generalFemale || voices.find(v => v.lang.startsWith('en')) || voices[0];
  };

  // Text-to-Speech (Audio Readout with Female Voice)
  const speakMessage = (text, index) => {
    if (!('speechSynthesis' in window)) {
      alert(lang === 'hi' ? 'आपके डिवाइस में टेक्स्ट-टू-स्पीच सपोर्ट नहीं है।' : 'Text-to-speech is not supported on this device.');
      return;
    }

    if (speakingMsgIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingMsgIndex(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean markdown and emoji symbols for smooth natural voice readout
    const cleanText = text
      .replace(/[*#_`]/g, '')
      .replace(/🌾|🧪|💧|🍅|🌱|☁️|🌽|🎋/g, '')
      .replace(/https?:\/\/\S+/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.92;  // Calm, clear pace for farmers
    utterance.pitch = 1.1;   // Pleasant, natural female voice pitch

    const availableVoices = window.speechSynthesis.getVoices();
    const femaleVoice = getBestFemaleVoice(availableVoices);
    if (femaleVoice) {
      utterance.voice = femaleVoice;
      utterance.lang = femaleVoice.lang || (lang === 'hi' ? 'hi-IN' : 'en-IN');
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

    // Stop speaking if playing
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setSpeakingMsgIndex(null);

    // Placeholder assistant response
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: textToSend,
          profile_data: {
            language: lang === 'hi' ? 'Hindi (Devanagari)' : 'English'
          }
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
              updated[updated.length - 1] = {
                role: 'assistant',
                content: accumulatedText
              };
              return updated;
            });
          }
        }
      } else {
        const data = await response.json();
        const content = data.response || data.message || 'No advice received.';
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content };
          return updated;
        });
      }
    } catch (err) {
      console.log('Backend stream unavailable. Triggering fallback agronomy streamer...', err);
      const mockText = generateMockAgronomyAdvice(textToSend, lang);
      let currentLength = 0;
      const step = 6;
      
      const interval = setInterval(() => {
        currentLength += step;
        const chunk = mockText.slice(0, currentLength);
        
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: 'assistant',
            content: chunk
          };
          return updated;
        });

        if (currentLength >= mockText.length) {
          clearInterval(interval);
          setIsLoading(false);
        }
      }, 25);
      return;
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setSpeakingMsgIndex(null);
    setMessages([
      {
        role: 'assistant',
        content: lang === 'hi' 
          ? `🌾 **बातचीत साफ कर दी गई है।** मैं आपकी क्या मदद कर सकता हूँ?`
          : `🌾 **Chat History Cleared.** How can I assist you today?`
      }
    ]);
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-4 md:my-8 bg-[#FAF8F3] border-2 border-[#2D4A27] rounded-lg overflow-hidden shadow-none font-sans text-[#1C251B]">
      
      {/* Chat Header */}
      <div className="px-6 py-5 bg-[#EFECE4] border-b-2 border-[#D8D1C5] flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 bg-[#2D4A27] text-[#FAF8F3] border border-[#2D4A27] rounded-md flex items-center justify-center font-bold text-xl flex-shrink-0">
            🌾
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-serif font-bold text-[#1C251B] flex items-center gap-2.5 leading-tight">
              {lang === 'hi' ? 'किसान एआई सलाहकार' : 'Kisan AI Chatbot'}
              <span className="text-[11px] font-mono px-2.5 py-0.5 bg-[#2D4A27] text-[#FAF8F3] rounded-sm font-normal flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#6E8B62]" /> AgriAssist
              </span>
            </h1>
            <p className="text-xs text-[#546350] mt-0.5">
              {lang === 'hi' ? 'कृषि व फसल सलाहकार — फसल, बीमारी व खाद की जानकारी प्राप्त करें' : 'Agricultural & Farming AI Advisor — Ask anything about crops, pests & soil'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Language Switcher Button */}
          <div className="flex items-center bg-[#FAF8F3] border border-[#D8D1C5] rounded-md p-1 font-mono text-xs">
            <button
              onClick={() => setLang('en')}
              className={`px-2.5 py-1 rounded-sm transition-all ${
                lang === 'en' ? 'bg-[#2D4A27] text-[#FAF8F3] font-bold' : 'text-[#546350] hover:text-[#1C251B]'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang('hi')}
              className={`px-2.5 py-1 rounded-sm transition-all ${
                lang === 'hi' ? 'bg-[#2D4A27] text-[#FAF8F3] font-bold' : 'text-[#546350] hover:text-[#1C251B]'
              }`}
            >
              हिंदी
            </button>
          </div>

          {/* Reset Chat Button */}
          <button
            onClick={clearChat}
            title="Reset Chat"
            className="px-3.5 py-2 bg-[#FAF8F3] hover:bg-[#DCE6D8] border border-[#D8D1C5] text-[#546350] hover:text-[#1C251B] rounded-md text-xs font-mono transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5 text-[#C26D38]" />
            <span className="hidden sm:inline">{lang === 'hi' ? 'साफ करें' : 'Reset'}</span>
          </button>
        </div>
      </div>

      {/* Quick Agronomy Questions Bar */}
      <div className="px-6 py-3.5 bg-[#FAF8F3] border-b border-[#D8D1C5]">
        <div className="text-[11px] font-mono font-semibold text-[#546350] uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#C26D38]" /> {lang === 'hi' ? 'त्वरित सवाल चुनें:' : 'Quick Farming Prompts:'}
        </div>
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
          {questions.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleSend(item.question)}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-[#EFECE4] hover:bg-[#DCE6D8] active:scale-98 text-xs font-sans text-[#1C251B] border border-[#D8D1C5] rounded-md whitespace-nowrap transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <Icon className="w-3.5 h-3.5 text-[#2D4A27] group-hover:scale-110 transition-transform" />
                <span className="font-medium">{item.title}</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#546350] group-hover:translate-x-0.5 transition-transform" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Messages Workspace */}
      <div className="h-[520px] p-6 md:p-8 overflow-y-auto space-y-6 bg-[#F6F4EE]">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-start gap-4 ${
              msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0 text-sm font-semibold border ${
                msg.role === 'user'
                  ? 'bg-[#C26D38] text-white border-[#C26D38]'
                  : 'bg-[#2D4A27] text-white border-[#2D4A27]'
              }`}
            >
              {msg.role === 'user' ? <User className="w-4.5 h-4.5" /> : <Bot className="w-4.5 h-4.5" />}
            </div>

            {/* Message Bubble with TTS Button */}
            <div className="relative group max-w-[85%]">
              <div
                className={`px-6 py-4 md:px-7 md:py-5 rounded-md text-sm md:text-[15px] leading-relaxed tracking-normal ${
                  msg.role === 'user'
                    ? 'bg-[#C26D38] text-white font-sans border border-[#C26D38]'
                    : 'bg-[#FAF8F3] text-[#1C251B] font-sans border-2 border-[#D8D1C5] whitespace-pre-wrap'
                }`}
              >
                {msg.content ? (
                  <div className="space-y-1.5">{msg.content}</div>
                ) : (
                  <div className="flex items-center gap-2.5 text-[#546350] font-mono text-xs py-1">
                    <Loader2 className="w-4 h-4 animate-spin text-[#2D4A27]" />
                    <span>{lang === 'hi' ? 'जवाब तैयार हो रहा है...' : 'Synthesizing agricultural guidance...'}</span>
                  </div>
                )}
              </div>

              {/* TTS Speaker Readout Action */}
              {msg.role === 'assistant' && msg.content && (
                <button
                  onClick={() => speakMessage(msg.content, index)}
                  title={speakingMsgIndex === index ? (lang === 'hi' ? 'आवाज़ बंद करें' : 'Stop voice readout') : (lang === 'hi' ? 'आवाज़ में सुनें' : 'Listen to voice readout')}
                  className={`mt-1 text-[#546350] hover:text-[#2D4A27] flex items-center gap-1 text-[11px] font-mono transition-colors ${
                    speakingMsgIndex === index ? 'text-[#C26D38] font-bold animate-pulse' : ''
                  }`}
                >
                  {speakingMsgIndex === index ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>{lang === 'hi' ? 'रोके' : 'Stop Audio'}</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{lang === 'hi' ? 'सुनें (Voice)' : 'Listen (Voice)'}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar Footer with Voice Input Microphone */}
      <div className="p-5 md:p-6 bg-[#EFECE4] border-t-2 border-[#D8D1C5]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-3 bg-[#FAF8F3] border-2 border-[#2D4A27] focus-within:border-[#2D4A27] rounded-md px-5 py-3 transition-all"
        >
          {/* Voice Mic Input Button */}
          <button
            type="button"
            onClick={toggleListening}
            title={isListening ? (lang === 'hi' ? 'सुनना बंद करें' : 'Stop listening') : (lang === 'hi' ? 'बोलकर पूछें (Voice)' : 'Speak query (Voice)')}
            className={`p-2 rounded-md border transition-all flex items-center justify-center ${
              isListening
                ? 'bg-[#C26D38] text-white border-[#C26D38] animate-bounce'
                : 'bg-[#EFECE4] hover:bg-[#DCE6D8] text-[#2D4A27] border-[#D8D1C5]'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isListening
                ? (lang === 'hi' ? 'आपकी आवाज़ सुनी जा रही है...' : 'Listening to your voice...')
                : (lang === 'hi' ? `बीमारी, खाद, फसल या मौसम के बारे में सवाल लिखें या बोलें...` : `Ask any farming question about crops, pests, fertilizers, or weather...`)
            }
            disabled={isLoading}
            className="flex-1 bg-transparent text-sm md:text-[15px] text-[#1C251B] placeholder-[#546350] font-sans focus:outline-none disabled:opacity-50 py-0.5"
          />

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-5 py-2.5 bg-[#2D4A27] hover:bg-[#385E38] disabled:bg-[#D8D1C5] disabled:text-[#546350] text-[#FAF8F3] font-mono text-xs font-bold rounded-md transition-all active:scale-95 flex items-center gap-2 disabled:cursor-not-allowed flex-shrink-0"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>{lang === 'hi' ? 'भेजें' : 'SEND'}</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="flex items-center justify-between text-[11px] font-mono text-[#546350] mt-3 px-1">
          <span>{lang === 'hi' ? 'भाषा:' : 'Language:'} <strong className="text-[#C26D38]">{lang === 'hi' ? 'हिन्दी (Hindi)' : 'English'}</strong></span>
          <span>FastAPI Endpoint: <code className="text-[#C26D38]">{apiEndpoint}</code></span>
        </div>
      </div>

    </div>
  );
}
