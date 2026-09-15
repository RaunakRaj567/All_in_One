import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Github, 
  BookOpen, 
  Star, 
  GitPullRequest, 
  TrendingUp, 
  UserCheck, 
  Trash2, 
  ArrowRight,
  Bot,
  User,
  Loader2
} from 'lucide-react';

const PREBUILT_QUESTIONS = [
  {
    id: 'improve-profile',
    title: 'Profile Optimization',
    icon: UserCheck,
    question: 'How can I improve my GitHub profile to stand out to recruiters and developers?'
  },
  {
    id: 'contributions',
    title: 'Open Source Contributions',
    icon: GitPullRequest,
    question: 'How do I start contributing to open source projects on GitHub as a beginner?'
  },
  {
    id: 'readme',
    title: 'Killer README Design',
    icon: BookOpen,
    question: 'What are the key elements of an engaging, professional GitHub repository README?'
  },
  {
    id: 'stars-followers',
    title: 'Gain Stars & Followers',
    icon: Star,
    question: 'What strategies can I use to get more stars on my repositories and build a GitHub following?'
  },
  {
    id: 'pinned-repos',
    title: 'Pinned Repos Strategy',
    icon: TrendingUp,
    question: 'Which projects should I pin on my GitHub profile and how should I present them?'
  }
];

export default function GithubAdvisor({
  apiEndpoint = 'http://127.0.0.1:8001/api/chat/stream',
  title = 'GitHub Growth Advisor',
  subtitle = 'AI-powered guidance to boost your GitHub presence, contributions & repositories',
  className = ''
}) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm your GitHub Growth Advisor. Select a quick growth topic below or type any custom question to get started!"
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

  const handleSend = async (queryText) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Placeholder for streaming assistant response
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Check if response is streamable
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
        // Fallback for non-streamed JSON response
        const data = await response.json();
        const content = data.response || data.message || 'No response received.';
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content };
          return updated;
        });
      }
    } catch (err) {
      console.error('Error querying backend:', err);
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'assistant',
          content: `⚠️ Connection Error: Could not connect to backend server (${err.message}). Ensure your FastAPI backend is running at ${apiEndpoint}.`
        };
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: "Chat cleared! How else can I help you grow on GitHub today?"
      }
    ]);
  };

  return (
    <div className={`flex flex-col h-[700px] max-h-[700px] w-full max-w-4xl mx-auto bg-[#0d1117] border border-[#30363d] rounded-2xl shadow-2xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#161b22] border-b border-[#30363d]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#238636]/20 border border-[#238636]/40 rounded-xl text-[#3fb950]">
            <Github className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              {title}
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1 font-medium">
                <Sparkles className="w-3 h-3" /> Gemini 3.6
              </span>
            </h2>
            <p className="text-xs text-[#8b949e]">{subtitle}</p>
          </div>
        </div>

        <button
          onClick={clearChat}
          title="Clear Chat"
          className="p-2 text-[#8b949e] hover:text-white hover:bg-[#30363d] rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Pre-built Questions Bar */}
      <div className="px-6 py-3 bg-[#161b22]/60 border-b border-[#30363d]">
        <div className="text-[11px] font-semibold text-[#8b949e] uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          Recommended Growth Topics
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
          {PREBUILT_QUESTIONS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleSend(item.question)}
                disabled={isLoading}
                className="flex items-center gap-2 px-3.5 py-1.5 bg-[#21262d] hover:bg-[#30363d] active:scale-95 text-xs font-medium text-[#c9d1d9] hover:text-white border border-[#30363d] hover:border-[#8b949e] rounded-full whitespace-nowrap transition-all disabled:opacity-50 disabled:cursor-not-allowed group shadow-sm"
              >
                <Icon className="w-3.5 h-3.5 text-[#58a6ff] group-hover:scale-110 transition-transform" />
                {item.title}
                <ArrowRight className="w-3 h-3 text-[#8b949e] opacity-0 group-hover:opacity-100 transition-opacity -ml-1" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 min-h-0 p-6 overflow-y-auto space-y-4 bg-[#0d1117]">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 ${
              msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold border ${
                msg.role === 'user'
                  ? 'bg-purple-600/20 border-purple-500/40 text-purple-300'
                  : 'bg-[#238636]/20 border-[#238636]/40 text-[#3fb950]'
              }`}
            >
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Message Bubble */}
            <div
              className={`max-w-[85%] px-4.5 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-purple-600 text-white rounded-tr-none shadow-md'
                  : 'bg-[#161b22] text-[#c9d1d9] border border-[#30363d] rounded-tl-none shadow-sm whitespace-pre-wrap'
              }`}
            >
              {msg.content || (
                <div className="flex items-center gap-2 text-[#8b949e]">
                  <Loader2 className="w-4 h-4 animate-spin text-[#58a6ff]" />
                  <span>Generating response...</span>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Custom Question Input Bar */}
      <div className="p-4 bg-[#161b22] border-t border-[#30363d]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 bg-[#0d1117] border border-[#30363d] focus-within:border-[#58a6ff] focus-within:ring-1 focus-within:ring-[#58a6ff] rounded-xl px-4 py-2.5 transition-all shadow-inner"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask any custom question about GitHub profile growth, READMEs, or contributions..."
            disabled={isLoading}
            className="flex-1 bg-transparent text-sm text-white placeholder-[#8b949e] focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2 bg-[#238636] hover:bg-[#2ea043] disabled:bg-[#21262d] disabled:text-[#484f58] text-white rounded-lg transition-all active:scale-95 shadow-sm disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
        <p className="text-[11px] text-[#8b949e] text-center mt-2">
          Connected to FastAPI Backend (<code className="text-purple-400 font-mono">{apiEndpoint}</code>)
        </p>
      </div>
    </div>
  );
}
