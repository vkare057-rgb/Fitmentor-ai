import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Send, Sparkles, MessageCircle, AlertTriangle, RefreshCw, Trash2, ShieldCheck, HeartPulse } from 'lucide-react';
import { Profile, ChatMessage, DailyLog } from '../types';

interface CoachChatProps {
  profile: Profile;
  dailyLogs: DailyLog[];
  chatHistory: ChatMessage[];
  onUpdateChatHistory: (history: ChatMessage[]) => void;
}

export default function CoachChat({ 
  profile, 
  dailyLogs, 
  chatHistory, 
  onUpdateChatHistory 
}: CoachChatProps) {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isLoading]);

  const todayStr = new Date().toISOString().split('T')[0];
  const lastLog = dailyLogs.find(log => log.date === todayStr);

  // Handle send message
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    setErrorMsg('');
    const userMsg: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedHistory = [...chatHistory, userMsg];
    onUpdateChatHistory(updatedHistory);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/coach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          profile,
          messages: updatedHistory,
          lastLog
        })
      });

      if (!response.ok) {
        throw new Error('Server returned an error responding to your coach prompt.');
      }

      const data = await response.json();
      
      const modelMsg: ChatMessage = {
        id: Math.random().toString(36).substr(2, 9),
        role: 'model',
        text: data.text || "I'm sorry, I couldn't compute a reply right now. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      onUpdateChatHistory([...updatedHistory, modelMsg]);
    } catch (error) {
      console.error(error);
      setErrorMsg('Failed to connect to FitMentor AI. Please check your network connection or GEMINI_API_KEY.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage(inputValue);
    }
  };

  const clearChat = () => {
    if (confirm("Are you sure you want to clear your conversation history?")) {
      onUpdateChatHistory([]);
    }
  };

  // Preset prompts for easier user navigation
  const presets = [
    "Give me morning motivation! 🌅",
    "Help! I have a major sugar craving 🍫",
    "Knee-friendly cardio exercises? 🚶",
    "High protein snack under 200 kcal? 🥚",
    "How do I manage stress eating? 🧘",
    "Analyze my stats & adjust goals 📈"
  ];

  // Helper custom renderer for Markdown/Bolding and bullet points to render beautifully
  const renderMessageText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Check for bullet points
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        const cleanContent = line.trim().replace(/^[\*\-]\s+/, '');
        return (
          <li key={idx} className="ml-4 list-disc text-xs sm:text-sm my-1 text-slate-700 font-medium">
            {parseBolds(cleanContent)}
          </li>
        );
      }
      // Check for headers
      if (line.trim().startsWith('### ')) {
        return (
          <h5 key={idx} className="font-bold text-sm sm:text-base text-slate-900 mt-3 mb-1.5 font-sans">
            {parseBolds(line.replace('### ', ''))}
          </h5>
        );
      }
      if (line.trim().startsWith('## ')) {
        return (
          <h4 key={idx} className="font-bold text-base sm:text-lg text-emerald-800 mt-4 mb-2 border-b pb-0.5 font-sans">
            {parseBolds(line.replace('## ', ''))}
          </h4>
        );
      }
      if (line.trim().startsWith('# ')) {
        return (
          <h3 key={idx} className="font-extrabold text-lg text-emerald-900 mt-5 mb-3 font-sans">
            {parseBolds(line.replace('# ', ''))}
          </h3>
        );
      }
      // Empty lines
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }

      return (
        <p key={idx} className="text-xs sm:text-sm text-slate-700 my-1 leading-relaxed font-medium">
          {parseBolds(line)}
        </p>
      );
    });
  };

  // Parse **bolds**
  const parseBolds = (text: string) => {
    const parts = text.split(/\*\*([^*]+)\*\*/g);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} className="font-extrabold text-slate-900">{part}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 font-sans h-[calc(100vh-140px)] flex flex-col justify-between">
      
      {/* Active Header */}
      <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm flex items-center justify-between shrink-0 mb-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <span className="text-3xl">🤖</span>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-800 flex items-center gap-1">
              <span>FitMentor AI Coach</span>
              <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Evidence-Based Weight Loss Partner</p>
          </div>
        </div>

        <button 
          onClick={clearChat}
          disabled={chatHistory.length === 0}
          className="text-slate-400 hover:text-rose-500 p-2.5 rounded-xl hover:bg-slate-50 transition"
          title="Clear History"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Thread */}
      <div className="bg-slate-50/50 rounded-3xl p-4 border border-slate-100 flex-1 overflow-y-auto min-h-0 space-y-4 shadow-inner">
        {chatHistory.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
            <span className="text-5xl animate-bounce">🏃</span>
            <div>
              <h4 className="font-bold text-slate-700">Start Your Daily Coaching Session</h4>
              <p className="text-xs text-slate-400 max-w-sm mt-1 mx-auto leading-relaxed">
                Hello {profile.name}! Ask me any questions about meals, grocery shopping, cravings, home exercise routines, stress management, or sleep tips. I'm connected to your physical stats!
              </p>
            </div>

            {/* Suggeted actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-md w-full pt-4">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(p)}
                  className="px-4 py-2 text-left text-xs bg-white border border-slate-200 rounded-2xl hover:border-emerald-500 hover:text-emerald-800 transition font-semibold shadow-sm"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4 pb-2">
            {chatHistory.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-start gap-2.5 max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    <span className="text-2xl mt-1 shrink-0">{isUser ? '🧑' : '🤖'}</span>
                    <div>
                      <div className={`p-4 rounded-3xl shadow-sm ${
                        isUser 
                          ? 'bg-slate-900 text-white rounded-tr-none font-medium text-xs sm:text-sm' 
                          : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                      }`}>
                        {isUser ? msg.text : renderMessageText(msg.text)}
                      </div>
                      <span className="block text-[8px] text-slate-400 mt-1 px-1 text-right">{msg.timestamp}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start gap-2.5">
                  <span className="text-2xl mt-1 shrink-0">🤖</span>
                  <div className="bg-white border border-slate-100 p-4 rounded-3xl rounded-tl-none shadow-sm flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMsg && (
              <div className="bg-rose-50 border border-rose-100 text-rose-800 p-4 rounded-2xl flex items-center gap-2 text-xs">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Preset small suggestions when messages active */}
      {chatHistory.length > 0 && (
        <div className="flex overflow-x-auto gap-2 py-2 shrink-0 no-scrollbar select-none mt-2">
          {presets.slice(1, 4).map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p)}
              className="whitespace-nowrap px-3.5 py-1.5 bg-slate-50 border border-slate-100 rounded-full text-[10px] sm:text-xs font-bold text-slate-600 hover:border-emerald-500 hover:text-emerald-800 transition"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Message Input Panel */}
      <div className="mt-2 flex items-center gap-2 bg-white p-2 rounded-3xl border border-slate-100 shadow-sm shrink-0">
        <input 
          type="text" 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={`Type a message, or say: "Log my lunch: 300 kcal, 20g protein"...`}
          className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border-0 focus:outline-none focus:ring-0 rounded-2xl font-medium"
        />
        <button 
          onClick={() => handleSendMessage(inputValue)}
          disabled={!inputValue.trim() || isLoading}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-100 disabled:text-slate-400 text-white p-3 rounded-2xl transition shadow-md shadow-emerald-600/10 shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      <div className="flex justify-center items-center gap-3 text-[10px] text-slate-400 font-medium py-1.5">
        <span className="flex items-center gap-1 text-emerald-600"><ShieldCheck className="w-3.5 h-3.5" /> HIPAA-Guided Safety Rules</span>
        <span>•</span>
        <span className="flex items-center gap-1 text-teal-600"><HeartPulse className="w-3.5 h-3.5" /> Evidence-Based Nutrition</span>
      </div>

    </div>
  );
}
