import React, { useState } from 'react';
import GeneralInfo from './components/GeneralInfo';
import FAQ from './components/FAQ';
import AboutHelloNepal from './components/AboutHelloNepal';
import { RideBooking } from './components/RideBooking';
import { Marketplace } from './components/Marketplace';
import DriverKYC from './components/DriverKYC';
import { SupportChatbot } from './components/SupportChatbot';
import AdminDashboard from './components/AdminDashboard';
import { Profile } from './components/Profile';

export const App: React.FC = () => {
  const [tab, setTab] = useState<'ride' | 'market' | 'kyc' | 'admin' | 'info' | 'profile'>('ride');

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gray-100">
      {/* Header */}
      <header className="bg-red-600 text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="bg-white text-red-600 font-black px-2 py-0.5 rounded-lg text-sm shadow">HN</span>
            <span className="font-black text-lg tracking-wide">Hello Nepal</span>
          </div>

          <nav className="flex space-x-1 text-xs font-bold overflow-x-auto py-1">
            <button onClick={() => setTab('ride')} className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-colors ${tab === 'ride' ? 'bg-white/20 shadow-inner' : 'hover:bg-white/10'}`}>राइड</button>
            <button onClick={() => setTab('market')} className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-colors ${tab === 'market' ? 'bg-white/20 shadow-inner' : 'hover:bg-white/10'}`}>मार्केट</button>
            <button onClick={() => setTab('kyc')} className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-colors ${tab === 'kyc' ? 'bg-white/20 shadow-inner' : 'hover:bg-white/10'}`}>केवाइसी</button>
            <button onClick={() => setTab('admin')} className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-colors ${tab === 'admin' ? 'bg-white/20 shadow-inner' : 'hover:bg-white/10'}`}>एडमिन</button>
            <button onClick={() => setTab('profile')} className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-colors ${tab === 'profile' ? 'bg-white/20 shadow-inner' : 'hover:bg-white/10'}`}>प्रोफाइल</button>
            <button onClick={() => setTab('info')} className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-colors ${tab === 'info' ? 'bg-white/20 shadow-inner' : 'hover:bg-white/10'}`}>जानकारी</button>
          </nav>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-4xl w-full mx-auto p-4 flex-grow space-y-4">
        {tab === 'ride' && (
          <div className="space-y-4 animate-fade-in">
            <RideBooking />
          </div>
        )}
        {tab === 'market' && (
          <div className="animate-fade-in">
            <Marketplace />
          </div>
        )}
        {tab === 'kyc' && (
          <div className="animate-fade-in">
            <DriverKYC />
          </div>
        )}
        {tab === 'admin' && (
          <div className="animate-fade-in">
            <AdminDashboard />
          </div>
        )}
        {tab === 'profile' && (
          <div className="animate-fade-in">
            <Profile />
          </div>
        )}
        {tab === 'info' && (
          <div className="space-y-4 animate-fade-in">
            <AboutHelloNepal />
            <GeneralInfo />
            <FAQ />
            <SupportChatbot />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
