import React, { useState } from 'react';
import { Bot, Send, MessageCircle } from 'lucide-react';

export const SupportChatbot: React.FC = () => {
  const [messages, setMessages] = useState<Array<{ sender: 'bot' | 'user'; text: string }>>([
    { sender: 'bot', text: 'नमस्ते! म Hello Nepal को AI सपोर्ट बोट हुँ। म तपाईंलाई के मद्दत गर्न सक्छु?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input;
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');

    setTimeout(() => {
      let reply = 'हाम्रो आधिकारिक टिमलाई सम्पर्क गर्न तल दिएको व्हाट्सएप बटनमा क्लिक गर्नुहोस्।';
      if (userMsg.toLowerCase().includes('fare') || userMsg.includes('भाडा')) {
        reply = 'बुटवल-भैरहवा रुटमा बाइकको भाडा रु. १८० र अटोको रु. ३५० तोकिएको छ।';
      } else if (userMsg.includes('withdraw') || userMsg.includes('निकाल्न')) {
        reply = 'तपाईं आफ्नो प्रोफाइलबाट eSewa वा Khalti मा सिधै कुनै पनि समय पैसा निकाल्न सक्नुहुन्छ।';
      }
      setMessages((prev) => [...prev, { sender: 'bot', text: reply }]);
    }, 600);
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 max-w-4xl mx-auto my-4">
      <div className="flex items-center justify-between mb-4 border-b pb-3">
        <div className="flex items-center space-x-2">
          <Bot className="w-5 h-5 text-red-600" />
          <h3 className="font-black text-gray-900 text-lg">AI सहायता केन्द्र (२४/७ Live)</h3>
        </div>
        <a
          href="https://wa.me/9779811522480"
          target="_blank"
          rel="noreferrer"
          className="bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center space-x-1"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>व्हाट्सएप</span>
        </a>
      </div>

      <div className="h-44 overflow-y-auto space-y-2 mb-4 p-3 bg-gray-50 rounded-2xl border text-xs">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <span
              className={`p-2.5 rounded-2xl max-w-xs ${
                m.sender === 'user' ? 'bg-red-600 text-white' : 'bg-white border text-gray-800'
              }`}
            >
              {m.text}
            </span>
          </div>
        ))}
      </div>

      <div className="flex space-x-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="कुनै प्रश्न सोध्नुहोस्..."
          className="flex-1 border rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-red-500"
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend} className="bg-red-600 text-white p-2.5 rounded-xl hover:bg-red-700">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
