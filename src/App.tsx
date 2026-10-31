import React, { useState } from 'react';
import RideBooking from './components/RideBooking';
import Marketplace from './components/Marketplace';
import DriverKYC from './components/DriverKYC';
import AdminDashboard from './components/AdminDashboard';
import SupportChatbot from './components/SupportChatbot';

export default function App() {
  const [activeTab, setActiveTab] = useState<'ride' | 'market' | 'kyc' | 'admin'>('ride');

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'sans-serif', background: '#f8fafc', overflow: 'hidden' }}>
      
      {/* टॉप हेडर और नेविगेशन टैब */}
      <div style={{ background: '#dc2626', color: '#fff', padding: '12px 15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1000, boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ background: '#fff', color: '#dc2626', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '14px' }}>HN</span>
          <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Hello Nepal</span>
        </div>
        <div style={{ display: 'flex', gap: '15px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}>
          <span 
            onClick={() => setActiveTab('ride')} 
            style={{ borderBottom: activeTab === 'ride' ? '2px solid #fff' : 'none', paddingBottom: '2px' }}
          >
            राइड
          </span>
          <span 
            onClick={() => setActiveTab('market')} 
            style={{ borderBottom: activeTab === 'market' ? '2px solid #fff' : 'none', paddingBottom: '2px' }}
          >
            मार्केट
          </span>
          <span 
            onClick={() => setActiveTab('kyc')} 
            style={{ borderBottom: activeTab === 'kyc' ? '2px solid #fff' : 'none', paddingBottom: '2px' }}
          >
            केवाईसी
          </span>
          <span 
            onClick={() => setActiveTab('admin')} 
            style={{ borderBottom: activeTab === 'admin' ? '2px solid #fff' : 'none', paddingBottom: '2px' }}
          >
            एडमिन
          </span>
        </div>
      </div>

      {/* मुख्य बॉडी - टैब के हिसाब से सही फाइल खुलेगी */}
      <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
        {activeTab === 'ride' && <RideBooking />}
        {activeTab === 'market' && <Marketplace />}
        {activeTab === 'kyc' && <DriverKYC />}
        {activeTab === 'admin' && <AdminDashboard />}
      </div>

      {/* एआई सपोर्ट चैटबोट फ्लोटिंग विजेट (जो हर पेज पर काम करेगा) */}
      <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999 }}>
        <SupportChatbot />
      </div>

    </div>
  );
}
