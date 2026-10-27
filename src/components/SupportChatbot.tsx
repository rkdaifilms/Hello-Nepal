import React, { useState } from 'react';

export default function SupportChatbot() {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'नमस्ते! मैं Hello Nepal का AI सपोर्ट हूँ। बताइए, आज मैं आपकी क्या मदद कर सकता हूँ?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    const newMessages = [...messages, { sender: 'user', text: userText }];
    setMessages(newMessages);
    setInput('');

    setTimeout(() => {
      let botReply = '';
      const lower = userText.toLowerCase();

      if (lower.includes('fraud') || lower.includes('scam') || lower.includes('धोखा') || lower.includes('फ्रॉड') || lower.includes('fake') || lower.includes('पैसा चुरा') || lower.includes('cheat')) {
        botReply = '⚠️ चेतावनी: धोखाधड़ी या स्पैम का संदेह है! आपकी शिकायत तुरंत एडमिन के पास भेज दी गई है। कृपया तुरंत हमारे आधिकारिक व्हाट्सएप (+977-9800000000) या जीमेल (support@hellonepal.com) पर संपर्क करें।';
      } else if (lower.includes('ride') || lower.includes('राइड') || lower.includes('बुक')) {
        botReply = '🚗 आप होमपेज पर जाकर 'राइड' टैब से आसानी से अपनी बाइक या टैक्सी बुक कर सकते हैं।';
      } else if (lower.includes('kyc') || lower.includes('केवाइसी')) {
        botReply = '📝 ड्राइवर केवाइसी के लिए ऊपर दिए गए 'केवाइसी' टैब पर क्लिक करें।';
      } else {
        botReply = '👍 मैंने आपकी बात नोट कर ली है। किसी भी प्रकार की धोखाधड़ी या शिकायत के लिए सीधे एडमिन سے संपर्क करें: व्हाट्सएप (+977-9800000000) | ईमेल (support@hellonepal.com)।';
      }

      setMessages(prev => [...prev, { sender: 'bot', text: botReply }]);
    }, 1000);
  };

  return (
    <div style={{ background: '#fff', padding: '16px', borderRadius: '8px', marginBottom: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3 style={{ margin: 0, color: '#c0392b', fontSize: '18px' }}>🤖 AI सहायता केन्द्र (24/7 Live)</h3>
        <a href="https://wa.me/9779800000000" target="_blank" rel="noreferrer" style={{ background: '#25D366', color: '#fff', padding: '5px 10px', borderRadius: '5px', textDecoration: 'none', fontSize: '12px', fontWeight: 'bold' }}>
          WhatsApp 💬
        </a>
      </div>

      <div style={{ height: '180px', overflowY: 'auto', background: '#f9f9f9', padding: '10px', borderRadius: '6px', marginBottom: '10px', border: '1px solid #eee' }}>
        {messages.map((m, idx) => (
          <div key={idx} style={{ textAlign: m.sender === 'user' ? 'right' : 'left', margin: '6px 0' }}>
            <span style={{ display: 'inline-block', padding: '8px 12px', borderRadius: '8px', fontSize: '13px', background: m.sender === 'user' ? '#3498db' : '#e2e8f0', color: m.sender === 'user' ? '#fff' : '#333', maxWidth: '85%', textAlign: 'left' }}>
              {m.text}
            </span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} style={{ display: 'flex', gap: '8px' }}>
        <input 
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="अपना सवाल या शिकायत यहाँ लिखें..." 
          style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px' }} 
        />
        <button type="submit" style={{ background: '#c0392b', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>
          भेजें
        </button>
      </form>
    </div>
  );
}
