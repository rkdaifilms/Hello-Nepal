import React, { useState } from 'react';
import { GeneralInfo } from './components/GeneralInfo';
import { FAQ } from './components/FAQ';
import { AboutHelloNepal } from './components/AboutHelloNepal';
import { RideBooking } from './components/RideBooking';
import { Marketplace } from './components/Marketplace';
import { DriverKYC } from './components/DriverKYC';
import { SupportChatbot } from './components/SupportChatbot';
import { AdminDashboard } from './components/AdminDashboard';
import { ENV } from './config/env';

export const App: React.FC = () => {
  const [tab, setTab] = useState<'ride' | 'market' | 'kyc' | 'admin' | 'info'>('ride');

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gray-100">
      {/* Header */}
      <header className="bg-red-600 text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="bg-white text-red-600 font-black px-2 py-0.5 rounded-lg text-sm shadow">HN</span>
            <span className="font-black text-lg tracking-wide">{ENV.appName}</span>
          </div>

          <nav className="flex space-x-1 text-xs font-bold">
            <button onClick={() => setTab('ride')} className={`px-2.5 py-1.5 rounded-lg ${tab === 'ride' ? 'bg-white/20' : 'hover:bg-white/10'}`}>राइड</button>
            <button onClick={() => setTab('market')} className={`px-2.5 py-1.5 rounded-lg ${tab === 'market' ? 'bg-white/20' : 'hover:bg-white/10'}`}>मार्केट</button>
            <button onClick={() => setTab('kyc')} className={`px-2.5 py-1.5 rounded-lg ${tab === 'kyc' ? 'bg-white/20' : 'hover:bg-white/10'}`}>केवाइसी</button>
            <button onClick={() => setTab('admin')} className={`px-2.5 py-1.5 rounded-lg ${tab === 'admin' ? 'bg-white/20' : 'hover:bg-white/10'}`}>एडमिन</button>
            <button onClick={() => setTab('info')} className={`px-2.5 py-1.5 rounded-lg ${tab === 'info' ? 'bg-white/20' : 'hover:bg-white/10'}`}>जानकारी</button>
          </nav>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-4xl w-full mx-auto p-4 flex-grow">
        {tab === 'ride' && (
          <>
            <RideBooking />
            <GeneralInfo />
          </>
        )}
        {tab === 'market' && <Marketplace />}
        {tab === 'kyc' && <DriverKYC />}
        {tab === 'admin' && <AdminDashboard />}
        {tab === 'info' && (
          <>
            <GeneralInfo />
            <FAQ />
            <AboutHelloNepal />
            <SupportChatbot />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 text-center py-4 text-xs">
        {ENV.appName} © 2026 • {ENV.support.location} • सपोर्ट: {ENV.support.phone}
      </footer>
    </div>
  );
};
