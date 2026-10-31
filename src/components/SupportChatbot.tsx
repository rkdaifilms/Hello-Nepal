import React, { useState } from 'react';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';

export const SupportChatbot: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([
    { role: 'model', text: 'नमस्ते! मैं Hello Nepal का एआई सपोर्ट असिस्टेंट हूँ। बताइए, आज मैं आपकी क्या मदद कर सकता हूँ?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [useOpenRouter, setUseOpenRouter] = useState(false);

  const GEMINI_API_KEY = "AQ.Ab8RN6IhziSgyS5G0EQRP7-Qya_FPtGZyJsj1p6ud5nFFJ9SZg"; 
  const OPENROUTER_API_KEY = "Pk.eyJ1IjoicmtkYWlmaWxtcyIsImEiOiJjbXZveDdtOHUweGIyMnpxeGtxemJjODV5In0";

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      let replyText = '';

      if (useOpenRouter) {
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'HTTP-Referer': 'https://hellonepal.app',
            'X-Title': 'Hello Nepal'
          },
          body: JSON.stringify({
            model: 'openai/gpt-4o-mini',
            messages: [
              { role: 'system', content: 'You are an advanced AI helper integrated into Hello Nepal app.' },
              { role: 'user', content: userMessage }
            ]
          })
        });
        const data = await res.json();
        replyText = data.choices?.[0]?.message?.content || 'OpenRouter से कोई उत्तर नहीं मिला।';
      } else {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: `You are Hello Nepal AI support assistant. Answer helpfully in Hindi or Nepali context for ride sharing and services: ${userMessage}` }]
              }
            ]
          })
        });
        const data = await res.json();
        replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'माफ़ करना, अभी जवाब देने में कुछ समस्या आ रही है।';
      }

      setMessages(prev => [...prev, { role: 'model', text: replyText }]);
    } catch (error) {
      console.error("AI Chat Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: 'नेटवर्क में कुछ दिक्कत है, कृपया दोबारा कोशिश करें।' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '15px', display: 'flex', flexDirection: 'column', height: '75vh', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        
        {/* Header */}
        <div style={{ padding: '12px 15px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bot style={{ width: '20px', height: '20px', color: '#dc2626' }} />
            <h2 style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>Hello Nepal AI सपोर्ट (24/7)</h2>
          </div>
          <button
            type="button"
            onClick={() => setUseOpenRouter(!useOpenRouter)}
            style={{
              padding: '4px 10px',
              borderRadius: '10px',
              fontSize: '10px',
              fontWeight: 'bold',
              cursor: 'pointer',
              border: 'none',
              background: useOpenRouter ? '#dc2626' : '#e2e8f0',
              color: useOpenRouter ? '#fff' : '#334155',
              display: 'flex',
              alignItem: 'center',
              gap: '4px'
            }}
          >
            <Sparkles style={{ width: '12px', height: '12px' }} />
            {useOpenRouter ? 'Mode: OpenAI' : 'Mode: Gemini AI'}
          </button>
        </div>

        {/* Chat Messages */}
        <div style={{ flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
              }}
            >
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                flexShrink: 0,
                background: msg.role === 'user' ? '#dc2626' : '#e2e8f0',
                color: msg.role === 'user' ? '#fff' : '#1e293b'
              }}>
                {msg.role === 'user' ? <User style={{ width: '14px', height: '14px' }} /> : <Bot style={{ width: '14px', height: '14px' }} />}
              </div>
              <div style={{
                padding: '10px 12px',
                borderRadius: '12px',
                fontSize: '13px',
                maxWidth: '75%',
                lineHeight: '1.4',
                background: msg.role === 'user' ? '#dc2626' : '#f1f5f9',
                color: msg.role === 'user' ? '#fff' : '#1e293b',
                borderTopRightRadius: msg.role === 'user' ? '2px' : '12px',
                borderTopLeftRadius: msg.role === 'user' ? '12px' : '2px'
              }}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '12px', padding: '5px' }}>
              <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite', color: '#dc2626' }} />
              एआई सोच रहा है...
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} style={{ padding: '10px 15px', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', background: '#fff' }}>
          <input
            type="text"
            placeholder={useOpenRouter ? "OpenAI से कुछ पूछें..." : "Gemini से कुछ पूछें..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{
              flex: 1,
              padding: '8px 12px',
              fontSize: '13px',
              border: '1px solid #cbd5e1',
              borderRadius: '10px',
              outline: 'none',
              background: 'transparent',
              color: '#1e293b'
            }}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            style={{
              padding: '8px 12px',
              background: '#dc2626',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: loading || !input.trim() ? 0.5 : 1
            }}
          >
            <Send style={{ width: '16px', height: '16px' }} />
          </button>
        </form>

      </div>
    </div>
  );
};

export default SupportChatbot;
