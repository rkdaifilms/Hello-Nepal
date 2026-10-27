import React from 'react';

export default function AboutHelloNepal() {
  return (
    <div style={{ background: '#fff', padding: '16px', borderRadius: '8px', marginBottom: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
      <h3 style={{ margin: '0 0 8px 0', color: '#c0392b', fontSize: '18px' }}>ℹ️ हेलो नेपाल के बारे में (About Us)</h3>
      <p style={{ margin: '0 0 10px 0', color: '#555', fontSize: '14px', lineHeight: '1.5' }}>
        हेलो नेपाल नेपाल का एक आधुनिक डिजिटल प्लेटफॉर्म है जो नागरिकों को सुरक्षित परिवहन और सेवाएं प्रदान करता है।
      </p>
      <div style={{ background: '#f9f9f9', padding: '10px', borderRadius: '6px', fontSize: '13px', color: '#444' }}>
        <p style={{ margin: '0 0 5px 0' }}><b>मुख्यालय:</b> लुम्बिनी, नेपाल</p>
        <p style={{ margin: '0 0 5px 0' }}><b>सपोर्ट व्हाट्सएप:</b> +977-9800000000</p>
        <p style={{ margin: 0 }}><b>आधिकारिक ईमेल:</b> support@hellonepal.com</p>
      </div>
    </div>
  );
}
