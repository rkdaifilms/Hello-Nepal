.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    // स्मार्ट एआई रिस्पांस लॉजिक (Gemini Style Simulation / API Integration)
    setTimeout(() => {
      let botReply = "मा गर्नुहोला, थप जानकारीको लागि कृपया तलको ह्वाट्सएप बटनमा क्लिक गरी हाम्रो टिमसँग कुरा गर्नुहोस्।";
      
      const lower = userText.toLowerCase();
      if (lower.includes('ride') || lower.includes('राइड') || lower.includes('भाडा') || lower.includes('bike')) {
        botReply = "Hello Nepal मा राइड बुक गर्न माथि 'राइड' ट्याबमा जानुहोस्, पिकअप र ड्रप लोकेशन हालेर 'Book' थिच्नुहोस्!";
      } else.if (lower.includes('market') || lower.includes('मार्केट') || lower.includes('किन्नु') || lower.includes('बेच्नु')) {
        botReply = "मार्केट ट्याबमा गएर तपाईं आफ्ना पुराना वा नयाँ सामानहरू किनबेच गर्न सक्नुहुन्छ।";
      } else.if (lower.includes('kyc') || lower.includes('केवाइसी') || lower.includes('ड्राइभर')) {
        botReply = "ड्राइभर वा डेलिभरी पार्टनर बन्न 'केवाيسي' ट्याबमा गएर आफ्नो विवरण र कागजात भर्नुपर्ने हुन्छ।";
      } else.if (lower.includes('hello') || lower.includes('hi') || lower.includes('नमस्ते')) {
        botReply = "नमस्ते! भन्नुहोस्, Hello Nepal मा आज म तपाईलाई कसरी सहयोग गरूँ?";
      }

      setMessages(prev => [...prev, { sender: 'bot', text: botReply }]);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-5 border border-gray-200">
      <div className="flex items-center justify-between border-b pb-3 mb-3">
        <div className="flex items-center space-x-2">
          <span className="bg-red-100 text-red-600 p-2 rounded-xl font-bold">🤖</span>
        <div>
            <h3 className="font-bold text-gray-800 text-sm">AI सहायता केन्द्र (२४/७ Live)</h3>
            <p className="text-xs text-gray-500">तपाईको जुनसुकै सवालको तुरुन्त जवाफ</p>
          </div>
        </div>
        <a 
          href="https://wa.me/9779800000000" 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-green-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1 hover:bg-green-700 transition"
        >
          <span>व्हाट्सएप</span>
        </a>
      </div>

      {/* Chat Messages Box */}
      <div className="h-60 overflow-y-auto space-y-3 p-2 bg-gray-50 rounded-xl mb-3 border border-gray-100">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
              msg.sender === 'user' 
                ? 'bg-red-600 text-white rounded-br-none shadow' 
                : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-500 border border-gray-200 px-4 py-2 rounded-2xl text-xs animate-pulse">
              टाइप गर्दैछ...
            </div>
          </div>
        )}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="कुनै प्रश्न सोध्नुहोस्..."
          className="flex-grow bg-gray-100 border border-gray-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-red-500"
        />
        <button 
          type="submit" 
          disabled={loading}
          className="bg-red-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-red-700 transition shadow"
        >
          पठाउनुस्
        </button>
      </form>
    </div>
  );
};

export default SupportChatbot;
