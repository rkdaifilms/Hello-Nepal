import React, { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';

import RideBooking from './components/RideBooking';
import Marketplace from './components/Marketplace';
import DriverKYC from './components/DriverKYC';
import AdminDashboard from './components/AdminDashboard';
import Profile from './components/Profile';
import SupportChatbot from './components/SupportChatbot';

type Tab = 'ride' | 'market' | 'kyc' | 'admin' | 'profile';

const TABS: { id: Tab; label: string }[] = [
  { id: 'ride', label: 'राइड' },
  { id: 'market', label: 'मार्केट' },
  { id: 'kyc', label: 'केवाईसी' },
  { id: 'admin', label: 'एडमिन' },
  { id: 'profile', label: 'प्रोफाइल' },
];

function getTabFromHash(): Tab {
  const hash = window.location.hash.replace('#', '');
  return TABS.some((tab) => tab.id === hash)
    ? (hash as Tab)
    : 'ride';
}

const paneStyle = (visible: boolean, scroll: boolean): CSSProperties => ({
  display: visible ? 'block' : 'none',
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  overflowY: scroll ? 'auto' : 'hidden',
  overflowX: 'hidden',
});

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>(getTabFromHash);

  useEffect(() => {
    const handleHashChange = () => {
      setActiveTab(getTabFromHash());
    };

    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const navigate = (tab: Tab) => {
    setActiveTab(tab);
    window.location.hash = tab;
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: '#f8fafc',
        fontFamily: 'system-ui, sans-serif',
        position: 'relative',
      }}
    >
      <header
        style={{
          flexShrink: 0,
          zIndex: 100,
          background: '#dc2626',
          color: '#fff',
          padding: '10px 12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
          }}
        >
          <span
            style={{
              background: '#fff',
              color: '#dc2626',
              padding: '4px 8px',
              borderRadius: 5,
            }}
          >
            HN
          </span>
          <span>Hello Nepal</span>
        </div>

        <nav
          aria-label="मुख्य नेविगेशन"
          style={{
            display: 'flex',
            gap: 4,
            overflowX: 'auto',
            minWidth: 0,
          }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              aria-current={activeTab === tab.id ? 'page' : undefined}
              onClick={() => navigate(tab.id)}
              style={{
                flexShrink: 0,
                background:
                  activeTab === tab.id
                    ? 'rgba(255,255,255,0.22)'
                    : 'transparent',
                color: '#fff',
                border: 0,
                borderBottom:
                  activeTab === tab.id
                    ? '2px solid #fff'
                    : '2px solid transparent',
                borderRadius: 6,
                padding: '8px 10px',
                fontSize: 14,
                fontWeight: 'bold',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      <main
        style={{
          flex: 1,
          minHeight: 0,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <section style={paneStyle(activeTab === 'ride', false)}>
          <RideBooking />
        </section>

        <section style={paneStyle(activeTab === 'market', true)}>
          {activeTab === 'market' && <Marketplace />}
        </section>

        <section style={paneStyle(activeTab === 'kyc', true)}>
          {activeTab === 'kyc' && <DriverKYC />}
        </section>

        <section style={paneStyle(activeTab === 'admin', true)}>
          {activeTab === 'admin' && <AdminDashboard />}
        </section>

        <section style={paneStyle(activeTab === 'profile', true)}>
          {activeTab === 'profile' && <Profile />}
        </section>
      </main>

      {/* एआई चैटबोट विजेट जो हर पेज पर नीचे फ्लोट करेगा */}
      <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999 }}>
        <SupportChatbot />
      </div>
    </div>
  );
}
