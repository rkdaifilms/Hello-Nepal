import React, { useState } from 'react';

export default function GeneralInfo() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ background: '#fff', padding: '16px', borderRadius: '8px', marginBottom: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', cursor: 'pointer' }} onClick={() => setExpanded(!expanded)}>
      <h3 style={{ margin: '0 0 8px 0', color: '#c0392b', fontSize: '18px' }}>📋 सामान्य जानकारी (General Info)</h3>
      <p style={{ margin: 0, color: '#555', fontSize: '14px' }}>
        हेलो नेपाल ऐप की पूरी गाइड और नियम पढ़ने के लिए यहाँ क्लिक करें...
      </p>
      {expanded && (
        <div style={{ marginTop: '12px', borderTop: '1px solid #eee', paddingTop: '10px', color: '#333', fontSize: '13px', lineHeight: '1.6' }}>
          <p><b>मुख्य विशेषताएँ:</b></p>
          <ul style={{ paddingLeft: '20px', margin: '5px 0' }}>
            <li>सुरक्षित और किफायती बाइक/कार राइड बुकिंग।</li>
            <li>ऑनलाइन ड्राइवर केवाइसी (KYC) वेरिफिकेशन।</li>
            <li>लोकल मार्केटप्लेस (खरीद-बिक्री)।</li>
            <li>24/7 एआई सहायता और फ्रॉड प्रोटेक्शन।</li>
          </ul>
          <p style={{ color: '#27ae60', fontWeight: 'bold', marginTop: '8px' }}>📍 संचालन क्षेत्र: लुम्बिनी, नेपाल।</p>
        </div>
      )}
    </div>
  );
}
