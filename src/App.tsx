import { useEffect, useState } from 'react';
import RideBooking from './components/RideBooking';
import Marketplace from './components/Marketplace';
import DriverKYC from './components/DriverKYC';
import AdminDashboard from './components/AdminDashboard';
import SupportChatbot from './components/SupportChatbot';

type Tab = 'ride' | 'market' | 'kyc' | 'admin';

const TABS: { id: Tab; label: string }[] = [
  { id: 'ride', label: 'राइड' },
  { id: 'market', label: 'मार्केट' },
  { id: 'kyc', label: 'केवाईसी' },
  { id: 'admin', label: 'एडमिन' },
];

const tabFromHash = (): Tab => {
  const h = window.location.hash.replace('#', '');
  return TABS.some((t) => t.id === h) ? (h as Tab) : 'ride';
};

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>(tabFromHash);

  // बैक बटन और रिफ्रेश पर भी टैब सही रहे
  useEffect(() => {
    const onHash = () => setActiveTab(tabFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const goTo = (tab: Tab) => {
    window.location.hash = tab;
    setActiveTab(tab);
  };

  const pane = (visible: boolean, scroll: boolean): React.CSSProperties => ({
    display: visible ? 'block' : 'none',
    height: '100%',
    overflowY: scroll ? 'auto' : 'hidden',
  });

  return (
    <div
      style={{
        width: '100%',
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'system-ui, sans-serif',
        background: '#f8fafc',
        overflow: 'hidden',
      }}
    >
      {/* टॉप हेडर और नेविगेशन */}
      <div
        style={{
          background: '#dc2626',
          color: '#fff',
          padding: '10px 12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 8,
          zIndex: 1000,
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span style={{ background: '#fff', color: '#dc2626', padding: '4px 8px', borderRadius: 4, fontWeight: 'bold', fontSize: 14 }}>
            HN
          </span>
          <span style={{ fontSize: 17, fontWeight: 'bold', whiteSpace: 'nowrap' }}>Hello Nepal</span>
        </div>

        <nav style={{ display: 'flex', gap: 4, overflowX: 'auto' }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => goTo(t.id)}
              style={{
                background: activeTab === t.id ? 'rgba(255,255,255,0.22)' : 'transparent',
                color: '#fff',
                border: 'none',
                borderBottom: activeTab === t.id ? '2px solid #fff' : '2px solid transparent',
                padding: '8px 10px',
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 'bold',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {/* मुख्य बॉडी */}
      <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
        {/* राइड हमेशा चालू रहता है ताकि टैब बदलने पर बुकिंग और मैप न खोएँ */}
        <div style={pane(activeTab === 'ride', false)}>
          <RideBooking />
        </div>

        {activeTab === 'market' && (
          <div style={pane(true, true)}>
            <Marketplace />
          </div>
        )}
        {activeTab === 'kyc' && (
          <div style={pane(true, true)}>
            <DriverKYC />
          </div>
        )}
        {activeTab === 'admin' && (
          <div style={pane(true, true)}>
            <AdminDashboard />
          </div>
        )}
      </div>

      {/* सपोर्ट चैटबोट: ऊपर-बाएँ, ताकि बुकिंग बटन और मैप ज़ूम न ढके */}
      <div style={{ position: 'fixed', top: 64, left: 12, zIndex: 1500 }}>
        <SupportChatbot />
      </div>
    </div>
  );
}
