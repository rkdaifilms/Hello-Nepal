import React, { useState } from 'react';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    { q: "हेलो नेपाल ऐप का उपयोग कैसे करें?", a: "होमपेज पर जाकर 'राइड' टैब से बाइक/टैक्सी बुक करें या 'मार्केट' का उपयोग करें।" },
    { q: "क्या ड्राइवरों के लिए केवाइसी जरूरी है?", a: "हाँ, सुरक्षा के लिए 'केवाइसी' टैब में जाकर अपनी सही जानकारी देना अनिवार्य है।" },
    { q: "कौन-से पेमेंट विकल्प उपलब्ध हैं?", a: "आप eSewa, Khalti, IME Pay और कैश का उपयोग कर सकते हैं।" },
    { q: "फ्रॉड या स्कैम होने पर क्या करें?", a: "तुरंत AI चैटबोट से संपर्क करें या नीचे दिए गए एडमिन व्हाट्सएप/जीमेल पर शिकायत भेजें।" }
  ];

  return (
    <div style={{ background: '#fff', padding: '16px', borderRadius: '8px', marginBottom: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
      <h3 style={{ margin: '0 0 10px 0', color: '#c0392b', fontSize: '18px' }}>❓ अक्सर पूछे जाने वाले सवाल (FAQ)</h3>
      {faqs.map((item, idx) => (
        <div key={idx} style={{ borderBottom: '1px solid #f0f0f0', padding: '8px 0', cursor: 'pointer' }} onClick={() => setOpenIndex(openIndex === idx ? null : idx)}>
          <div style={{ fontWeight: 'bold', color: '#2c3e50', fontSize: '14px' }}>{item.q}</div>
          {openIndex === idx && <div style={{ marginTop: '5px', color: '#666', fontSize: '13px', background: '#f9f9f9', padding: '6px', borderRadius: '4px' }}>{item.a}</div>}
        </div>
      ))}
    </div>
  );
}
