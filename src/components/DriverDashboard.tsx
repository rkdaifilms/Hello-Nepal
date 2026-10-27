import React, { useState } from 'react';
import { Car, DollarSign, Star, ShieldCheck, MapPin, Clock, AlertCircle } from 'lucide-react';
import { DriverKYC } from './DriverKYC';
import { ENV } from '../config/env';

export const DriverDashboard: React.FC = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [kycSubmitted, setKycSubmitted] = useState(false);

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      {/* Top Status Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-6 text-white shadow-lg flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-black">चालक ड्यासबोर्ड (Driver Dashboard)</h2>
            <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">Hello Nepal</span>
          </div>
          <p className="text-gray-300 text-xs mt-1">तपाईंको राइड तथा डेलिभरी सेवा व्यवस्थापन गर्नुहोस्।</p>
        </div>

        <div className="flex items-center space-x-3">
          <span className={`text-xs font-bold px-3 py-1.5 rounded-xl ${isOnline ? 'bg-emerald-500 text-white' : 'bg-gray-700 text-gray-300'}`}>
            {isOnline ? 'अनलाइन (Online)' : 'अफलाइन (Offline)'}
          </span>
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition ${isOnline ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
          >
            {isOnline ? 'अफलाइन हुनुहोस्' : 'अनलाइन हुनुहोस्'}
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-bold">आजको कमाई</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <h3 className="text-lg font-black text-gray-900">रु. ०</h3>
          <span className="text-[10px] text-emerald-600 font-semibold">० राइड्स पूरा</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-bold">रेटिंग</span>
            <Star className="w-4 h-4 text-amber-500" />
          </div>
          <h3 className="text-lg font-black text-gray-900">५.०</h3>
          <span className="text-[10px] text-gray-400 font-semibold">नयाँ ड्राइभर</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-bold">अनलाइन समय</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <h3 className="text-lg font-black text-gray-900">० घन्टा</h3>
          <span className="text-[10px] text-blue-600 font-semibold">आजको दिन</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-bold">केवाइसी स्थिति</span>
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <h3 className="text-lg font-black text-gray-900">प्रमाणित</h3>
          <span className="text-[10px] text-indigo-600 font-semibold">सक्रिय</span>
        </div>
      </div>

      {/* KYC Component Integration */}
      <DriverKYC />
    </div>
  );
};
