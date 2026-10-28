
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { CONFIG } from '../config/env';
import { Send, Bot, User, Loader2, Sparkles, Mic, Square } from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export const SupportChatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'नमस्ते! मैं Hello Nepal का एआई सपोर्ट असिस्टेंट हूँ। बताइए, आज मैं आपकी क्या मदद कर सकता हूँ?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [useOpenRouter, setUseOpenRouter] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // बोलकर टाइप करने वाला वॉइस फीचर (Speech Recognition)
  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("आपका ब्राउज़र वॉइस रिकॉर्डिंग सपोर्ट नहीं करता है।");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN';
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setInput(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      recognition.start();
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      let replyText = '';

      if (useOpenRouter) {
        // OpenRouter / OpenAI API का इस्तेमाल
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${CONFIG.openrouterApiKey}`,
            'HTTP-Referer': 'https://hellonepal.app',
            'X-Title': 'Hello Nepal'
          },
          body: JSON.stringify({
            model: 'openai/gpt-4o-mini',
            messages: [
              { role: 'system', content: 'You are an advanced AI helper integrated into Hello Nepal app. Answer user queries accurately and professionally.' },
              { role: 'user', content: userMessage }
            ]
          })
        });
        const data = await res.json();
        replyText = data.choices?.[0]?.message?.content || 'OpenRouter से कोई उत्तर नहीं मिला।';
      } else {
        // Gemini API का इस्तेमाल
        const ai = new GoogleGenAI({ apiKey: CONFIG.geminiApiKey });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: userMessage,
        });
        replyText = response.text || 'माफ़ करना, अभी जवाब देने में कुछ समस्या आ रही है।';
      }

      setMessages(prev => [...prev, { role: 'model', text: replyText }]);
    } catch (error) {
      console.error("AI Chat Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: 'नेटवर्क या API की में कुछ दिक्कत है, कृपया दोबारा कोशिश करें।' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 flex flex-col h-[80vh]">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm flex flex-col h-full overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/50">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-red-600" />
            <h2 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Hello Nepal AI सपोर्ट (24/7)</h2>
          </div>
          <button
            type="button"
            onClick={() => setUseOpenRouter(!useOpenRouter)}
            className={`px-3 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 transition-colors ${
              useOpenRouter ? 'bg-red-600 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            {useOpenRouter ? 'Mode: OpenAI / OpenRouter' : 'Mode: Gemini AI'}
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 ${
                msg.role === 'user' ? 'bg-red-600 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200'
              }`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`p-3 rounded-2xl text-xs max-w-[75%] leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-red-600 text-white rounded-tr-none' 
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-tl-none'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-zinc-400 text-xs p-2">
              <Loader2 className="w-4 h-4 animate-spin text-red-600" />
              एआई सोच रहा है...
            </div>
          )}
        </div>

        {/* Input Form with Mic and Send Button */}
        <form onSubmit={handleSend} className="p-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-2 bg-white dark:bg-zinc-900">
          <button
            type="button"
            onClick={startSpeechRecognition}
            className={`p-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center ${
              isRecording ? 'bg-red-600 text-white animate-pulse' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200'
            }`}
            title="बोलकर टाइप करें (Voice Input)"
          >
            {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            placeholder={isRecording ? "सुन रहा हूँ... बोलिए..." : (useOpenRouter ? "OpenRouter से कुछ पूछें..." : "Gemini से कुछ पूछें...")}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-700 rounded-xl bg-transparent text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-red-600"
          />

          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow-md transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
