import React, { useState, useEffect, useRef } from 'react';
import { Navigation, MapPin, Bike, Car, Shield, Compass, Sparkles, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Mapbox Token
mapboxgl.accessToken = 'pk.eyJ1IjoicmtkYWlmaWxtcyIsImEiOiJjbXZveDdtOHUweGIyMnpxeGtxemJjODV5In0.2BCQn8iiApvGhcXV-ez8Vg';

export const RideBooking: React.FC = () => {
  const [selectedVehicle, setSelectedVehicle] = useState<'bike' | 'auto' | 'jeep'>('bike');
  const [pickup, setPickup] = useState('Traffic Chowk, Butwal');
  const [dropoff, setDropoff] = useState('Gautam Buddha Airport, Bhairahawa');
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'searching' | 'confirmed'>('idle');
  
  const [isWrongTurn, setIsWrongTurn] = useState(false);
  const [aiWarningMessage, setAiWarningMessage] = useState<string | null>(null);
  const [isCheckingAI, setIsCheckingAI] = useState(false);

  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<mapboxgl.Map | null>(null);

  const rides = {
    bike: { name: 'Bike', price: 387, icon: Bike },
    auto: { name: 'Auto', price: 645, icon: Car },
    jeep: { name: 'Jeep', price: 1183, icon: Shield },
  };

  const currentRide = rides[selectedVehicle];
  const distance = 21.5;
  const calculatedFare = currentRide.price;

  useEffect(() => {
    if (mapContainer.current && !mapInstance.current) {
      try {
        const map = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/navigation-night-v1',
          center: [83.4556, 27.7005],
          zoom: 14.5,
          pitch: 45,
        });

        mapInstance.current = map;

        map.on('load', () => {
          map.resize();
        });

        new mapboxgl.Marker({ color: '#ef4444' })
          .setLngLat([83.4556, 27.7005])
          .addTo(map);
      } catch (e) {
        console.error("Map load error:", e);
      }
    }
  }, []);

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
    <div className="space-y-4 pb-12 max-w-md mx-auto p-4">
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-5 rounded-2xl shadow-lg">
        <h1 className="text-xl font-bold">Hello Nepal राइड्स</h1>
        <p className="text-xs text-white/80">बुटवल - भैरहवा 3D नेविगेशन</p>
      </div>

      {/* Mapbox Container - फिक्स हाइट के साथ ताकि मैप कभी गायब न हो */}
      <div className="relative w-full rounded-2xl overflow-hidden shadow-md border border-gray-300 bg-zinc-900" style={{ height: '320px' }}>
        <div ref={mapContainer} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }} />
        <div className="absolute bottom-2 left-2 bg-black/80 px-2.5 py-1 rounded-lg text-[10px] text-white font-bold z-10 shadow">
          📍 बुटवल-भैरहवा 3D रोड रडार
        </div>
      </div>

      {aiWarningMessage && (
        <div className={`p-3 rounded-xl border text-xs font-bold ${isWrongTurn ? 'bg-red-950 border-red-500 text-red-200' : 'bg-emerald-950 border-emerald-500 text-emerald-200'}`}>
          {aiWarningMessage}
        </div>
      )}

      {/* Booking Form Card */}
      <div className="bg-white rounded-2xl p-4 shadow-md space-y-4">
        <div className="space-y-2.5">
          <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-2xl border border-gray-200">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="flex-grow">
              <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">पिकअप लोकेशन (कहाँ से)</p>
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
              <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">ड्रॉप लोकेशन (कहाँ तक)</p>
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
              className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-sm shadow-lg flex items-center justify-center gap-2"
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

       
               
    
