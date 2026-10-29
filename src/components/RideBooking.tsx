    import React, { useState } from 'react';
import { MapPin, Bike, Car, Shield, ArrowRight, CheckCircle2, Sparkles, Navigation, Compass, Radio } from 'lucide-react';

export const RideBooking: React.FC = () => {
  const [pickup, setPickup] = useState('भैरहवा (Bhairahawa)');
  const [dropoff, setDropoff] = useState('लुंबिनी (Lumbini)');
  const [selectedVehicle, setSelectedVehicle] = useState<'bike' | 'auto' | 'jeep'>('bike');
  const [distance, setDistance] = useState('22');
  const [calculatedFare, setCalculatedFare] = useState('450');
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'searching' | 'confirmed'>('idle');
  
  const [isCheckingAI, setIsCheckingAI] = useState(false);
  const [aiWarningMessage, setAiWarningMessage] = useState('');
  const [isWrongTurn, setIsWrongTurn] = useState(false);

  const rides = {
    bike: { name: 'Hello Bike', price: 450, time: '25 मिनट' },
    auto: { name: 'Hello Auto', price: 850, time: '30 मिनट' },
    jeep: { name: 'Hello Jeep (Rental)', price: 1800, time: '35 मिनट' }
  };

  const currentRide = rides[selectedVehicle];

  const runSmartAIRouteCheck = () => {
    setIsCheckingAI(true);
    setAiWarningMessage('🤖 AI स्मार्ट नेविगेशन: रूट की जाँच हो रही है...');

    setTimeout(() => {
      const simulateWrongTurn = Math.random() > 0.5;
      if (simulateWrongTurn) {
        setIsWrongTurn(true);
        setAiWarningMessage('⚠️ AI सुरक्षा चेतावनी: ड्राइवर गलत रास्ते (Wrong Turn) पर जा रहा है!');
      } else {
        setIsWrongTurn(false);
        setAiWarningMessage('✅ AI नेविगेशन: वाहन बिल्कुल सही रास्ते पर है।');
      }
      setIsCheckingAI(false);
    }, 1500);
  };

  const handleBookRide = () => {
    setBookingStatus('searching');
    setTimeout(() => {
      setBookingStatus('confirmed');
      runSmartAIRouteCheck();
    }, 2000);
  };

  return (
    <div className="space-y-4 pb-24 max-w-md mx-auto px-2">
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-5 rounded-3xl shadow-xl">
        <h1 className="text-xl font-bold">Hello Nepal राइड्स</h1>
        <p className="text-xs text-white/80">{pickup} ➔ {dropoff} लाइव GPS नेविगेशन</p>
      </div>

      {/* Ultra-HD Live Route GPS Screen (100% Working, Never Black) */}
      <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl border-2 border-red-500/50 bg-gradient-to-br from-slate-950 via-zinc-900 to-neutral-950 p-5 text-white" style={{ height: '310px' }}>
        {/* Animated Radar Grid Effect */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ef4444_1.5px,transparent_1.5px)] [background-size:20px_20px]"></div>

        <div className="relative z-10 flex flex-col justify-between h-full">
          {/* Top Route Bar */}
          <div className="flex items-center justify-between bg-black/80 px-3.5 py-2 rounded-2xl border border-white/10 text-xs font-bold shadow-lg backdrop-blur-md">
            <span className="text-emerald-400 flex items-center gap-1">🟢 {pickup}</span>
            <span className="text-red-500 animate-pulse font-extrabold">➔</span>
            <span className="text-red-400 flex items-center gap-1">🔴 {dropoff}</span>
          </div>

          {/* Center High-Tech Route Animation */}
          <div className="my-auto py-2 flex flex-col items-center justify-center space-y-3">
            <div className="relative w-full flex items-center justify-between px-4">
              <div className="flex flex-col items-center z-10">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 shadow-lg animate-bounce">
                  <MapPin className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-emerald-300 mt-1 bg-black/70 px-2 py-0.5 rounded-md">पिकअप</span>
              </div>

              <div className="flex-grow mx-3 relative flex items-center">
                <div className="absolute w-full h-2 bg-red-950 rounded-full overflow-hidden border border-red-500/30">
                  <div className="w-full h-full bg-gradient-to-r from-emerald-500 via-red-500 to-red-600 animate-pulse"></div>
                </div>
                <div className="w-full text-center z-10">
                  <span className="bg-black/90 px-3 py-1 rounded-full text-[10px] font-extrabold text-white border border-red-500 shadow-xl">
                    🛣️ मुख्य मार्ग (सिद्धार्थ राजमार्ग)
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-center z-10">
                <div className="w-10 h-10 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center text-red-400 shadow-lg animate-pulse">
                  <Navigation className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-red-300 mt-1 bg-black/70 px-2 py-0.5 rounded-md">ड्रॉप</span>
              </div>
            </div>

            <div className="text-center bg-black/60 px-4 py-1.5 rounded-xl border border-white/10 shadow">
              <p className="text-xs font-bold text-yellow-300">दूरी: {distance} किमी • समय: {currentRide.time} • GPS सिग्नल: Strong</p>
            </div>
          </div>

          {/* Bottom Live Status Bar */}
          <div className="flex items-center justify-between bg-black/80 px-3.5 py-2 rounded-2xl border border-white/10 text-[11px] backdrop-blur-md">
            <span className="text-yellow-400 font-bold flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 animate-spin" /> सैटेलाइट ट्रैकिंग एक्टिव
            </span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" /> लाइव कनेक्टेड
            </span>
          </div>
        </div>
      </div>

      {aiWarningMessage && (
        <div className={`p-3.5 rounded-2xl border text-xs font-bold shadow-lg ${isWrongTurn ? 'bg-red-950 border-red-500 text-red-200' : 'bg-emerald-950 border-emerald-500 text-emerald-200'}`}>
          {aiWarningMessage}
        </div>
      )}

      {/* Booking Form Card - सारे बटन और फॉर्म एकदम सुरक्षित */}
      <div className="bg-white rounded-3xl p-5 shadow-xl border border-gray-100 space-y-4">
        <div className="space-y-2.5">
          <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-2xl border border-gray-200">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="flex-grow">
              <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">पिकअप लोकेशन (जहाँ से जाना है)</p>
              <input 
                type="text" 
                value={pickup} 
                onChange={(e) => setPickup(e.target.value)}
                className="w-full bg-transparent text-xs font-bold text-gray-800 focus:outline-none" 
              />
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-2xl border border-gray-200">
            <div className="w-7 h-7 rounded-xl bg-red-500/10 text-red-600 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="flex-grow">
              <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">ड्रॉप लोकेशन (जहाँ तक जाना है)</p>
              <input 
                type="text" 
                value={dropoff} 
                onChange={(e) => setDropoff(e.target.value)}
                className="w-full bg-transparent text-xs font-bold text-gray-800 focus:outline-none" 
              />
            </div>
          </div>
        </div>

        {/* Vehicle Selection Cards */}
        <div>
          <p className="text-xs font-bold text-gray-600 mb-2 px-1">गाड़ी चुनें</p>
          <div className="grid grid-cols-3 gap-2.5">
            <div 
              onClick={() => setSelectedVehicle('bike')}
              className={`cursor-pointer p-3 rounded-2xl flex flex-col items-center justify-center transition-all border ${selectedVehicle === 'bike' ? 'bg-red-50 border-red-500 shadow-md' : 'bg-gray-50 border-gray-200'}`}
            >
              <Bike className={`w-5 h-5 mb-1 ${selectedVehicle === 'bike' ? 'text-red-600' : 'text-gray-600'}`} />
              <span className="font-extrabold text-xs text-gray-800">Bike</span>
              <span className="text-[10px] font-bold text-red-600 mt-0.5">Rs. {rides.bike.price}</span>
            </div>

            <div 
              onClick={() => setSelectedVehicle('auto')}
              className={`cursor-pointer p-3 rounded-2xl flex flex-col items-center justify-center transition-all border ${selectedVehicle === 'auto' ? 'bg-red-50 border-red-500 shadow-md' : 'bg-gray-50 border-gray-200'}`}
            >
              <Car className={`w-5 h-5 mb-1 ${selectedVehicle === 'auto' ? 'text-red-600' : 'text-gray-600'}`} />
              <span className="font-extrabold text-xs text-gray-800">Auto</span>
              <span className="text-[10px] font-bold text-red-600 mt-0.5">Rs. {rides.auto.price}</span>
            </div>

            <div 
              onClick={() => setSelectedVehicle('jeep')}
              className={`cursor-pointer p-3 rounded-2xl flex flex-col items-center justify-center transition-all border ${selectedVehicle === 'jeep' ? 'bg-red-50 border-red-500 shadow-md' : 'bg-gray-50 border-gray-200'}`}
            >
              <Shield className={`w-5 h-5 mb-1 ${selectedVehicle === 'jeep' ? 'text-red-600' : 'text-gray-600'}`} />
              <span className="font-extrabold text-xs text-gray-800">Jeep</span>
              <span className="text-[10px] font-bold text-red-600 mt-0.5">Rs. {rides.jeep.price}</span>
            </div>
          </div>
        </div>

        {/* Distance & Fare */}
        <div className="space-y-2.5 pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">कुल अनुमानित दूरी:</span>
            <span className="font-bold text-gray-800">{distance} किमी (km)</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">कुल किराया राशि:</span>
            <span className="font-extrabold text-sm text-red-600">Rs. {calculatedFare} NPR</span>
          </div>

          {bookingStatus === 'idle' && (
            <button
              type="button"
              onClick={handleBookRide}
              className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              तुरंत {currentRide.name} बुक करें <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {bookingStatus === 'searching' && (
            <div className="w-full py-3.5 bg-gray-100 text-gray-700 rounded-2xl font-bold text-xs text-center flex items-center justify-center gap-2 animate-pulse">
              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              आसपास के ड्राइवर की तलाश की जा रही है...
            </div>
          )}

          {bookingStatus === 'confirmed' && (
            <div className="w-full p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
              <div className="flex items-center justify-center gap-1 text-emerald-600 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" /> ड्राइवर कन्फर्म हो गया!
              </div>
              <p className="text-[11px] text-gray-600">Bishal Thapa (Lu 2 Pa 4590) - 3 मिनट में पहुँच रहा है</p>
              
              <button
                type="button"
                onClick={runSmartAIRouteCheck}
                disabled={isCheckingAI}
                className="w-full mt-1 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow"
              >
                {isCheckingAI ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    AI रूट जाँच रहा है...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                    AI रूट सेफ्टी और रॉन्ग-टर्न चेक करें
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setBookingStatus('idle')}
                className="mt-1 px-3 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-lg"
              >
                नई बुकिंग करें
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RideBooking;  
